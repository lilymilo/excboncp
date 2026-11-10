"""Background MQTT worker for automated telemetry ingestion."""

from __future__ import annotations

import asyncio
import contextlib
import json
import logging
import os
import signal
import sys
from datetime import UTC, datetime
from typing import Any

import paho.mqtt.client as mqtt

from server.database import close_db, get_db, init_db
from server.sensor.models import SensorReadingWire
from server.sensor.service import store_sensor_reading

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("excboncp.sensor.mqtt")

BROKER_HOST = os.getenv("MQTT_BROKER", "broker.emqx.io")
BROKER_PORT = int(os.getenv("MQTT_PORT", "1883"))
TOPIC_FILTER = os.getenv("MQTT_TOPIC_FILTER", "CbonCP/#")


def _normalize_payload(raw: dict[str, Any]) -> dict[str, Any] | None:
    # Reject messages from other public broker publishers lacking our node identifier.
    device_id = raw.get("device_id") or raw.get("node_id")
    if not device_id:
        return None

    # Prioritize top-level wire timestamp string 'ts' per Blueprint v5 Model 3 contract.
    if raw.get("ts") and isinstance(raw["ts"], str):
        ts = raw["ts"]
    elif isinstance(raw.get("timestamp"), dict) and raw["timestamp"].get("iso8601"):
        ts = raw["timestamp"]["iso8601"]
    elif isinstance(raw.get("timestamp"), str) and raw["timestamp"]:
        ts = raw["timestamp"]
    elif isinstance(raw.get("ts"), (int, float)):
        ts = datetime.fromtimestamp(float(raw["ts"]), tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    elif isinstance(raw.get("timestamp"), (int, float)):
        ts = datetime.fromtimestamp(float(raw["timestamp"]), tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    else:
        ts = "2026-11-10T12:00:00Z"

    temp = raw.get("temp_c") if raw.get("temp_c") is not None else raw.get("temperature", 25.0)
    hum = raw.get("humidity_pct") if raw.get("humidity_pct") is not None else 80.0
    soil = (
        raw.get("soil_pct") if raw.get("soil_pct") is not None else raw.get("soil_moisture", 50.0)
    )
    soil_raw = raw.get("soil_raw") if raw.get("soil_raw") is not None else 2300

    flame_val = raw.get("flame")
    if flame_val is None:
        flame_val = 1 if raw.get("flame_detected") is True else 0

    geo = raw.get("location") if isinstance(raw.get("location"), dict) else raw
    lat = geo.get("lat", geo.get("latitude"))
    lon = geo.get("lon", geo.get("longitude"))

    return {
        "device_id": str(device_id),
        "ts": str(ts),
        "temp_c": float(temp),
        "humidity_pct": float(hum),
        "flame": int(flame_val),
        "soil_raw": int(soil_raw),
        "soil_pct": float(soil),
        "source": raw.get("source", "esp"),
        "sig": raw.get("sig"),
        "lat": lat,
        "lon": lon,
        "fire_level": raw.get("fire_level"),
        "fire_status": raw.get("fire_status"),
    }


async def process_message(payload_bytes: bytes) -> None:
    try:
        raw_dict = json.loads(payload_bytes.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        logger.warning("Rejected non-JSON MQTT payload: %s", exc)
        return

    normalized = _normalize_payload(raw_dict)
    if not normalized:
        return
    try:
        wire = SensorReadingWire(**normalized)
    except Exception as exc:
        logger.warning("Invalid sensor wire schema: %s", exc)
        return

    db = await get_db()
    try:
        saved = await store_sensor_reading(db, wire)
        if saved.sensor_flag or saved.fire_level >= 2:
            logger.warning(
                "[%s] Stored reading %s for parcel %s (temp=%.1fC, flame=%d, flag=%s, reasons=%s)",
                saved.fire_status,
                saved.id,
                saved.parcel_id,
                saved.temp_c,
                saved.flame,
                saved.sensor_flag,
                "; ".join(saved.warning_reasons)
                if saved.warning_reasons
                else "Bahaya terkonfirmasi",
            )
        else:
            logger.info(
                "[%s] Stored reading %s for parcel %s (temp=%.1fC, flame=%d, flag=%s)",
                saved.fire_status,
                saved.id,
                saved.parcel_id,
                saved.temp_c,
                saved.flame,
                saved.sensor_flag,
            )
    except ValueError as exc:
        logger.warning("Rejected sensor message: %s", exc)


def create_client(loop: asyncio.AbstractEventLoop) -> mqtt.Client:
    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    except AttributeError:
        client = mqtt.Client()

    def on_connect(c: mqtt.Client, userdata: Any, flags: Any, rc: Any, properties: Any = None):
        if (hasattr(rc, "is_failure") and not rc.is_failure) or rc == 0:
            logger.info("Connected to MQTT broker at %s:%d", BROKER_HOST, BROKER_PORT)
            c.subscribe(TOPIC_FILTER)
            c.subscribe("cboncp/#")
            if BROKER_HOST in ("localhost", "127.0.0.1", "mosquitto"):
                c.subscribe("sensor/#")
                logger.info("Subscribed to '%s', 'cboncp/#', and 'sensor/#'", TOPIC_FILTER)
            else:
                logger.info("Subscribed to '%s' and 'cboncp/#'", TOPIC_FILTER)
        else:
            logger.error("MQTT connection rejected with code %s", rc)

    def on_message(c: mqtt.Client, userdata: Any, msg: mqtt.MQTTMessage):
        asyncio.run_coroutine_threadsafe(process_message(msg.payload), loop)

    client.on_connect = on_connect
    client.on_message = on_message
    return client


async def run_worker() -> None:
    await init_db()
    loop = asyncio.get_running_loop()
    client = create_client(loop)

    stop_event = asyncio.Event()

    def _stop(*args: Any):
        logger.info("Termination signal received. Shutting down worker...")
        stop_event.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        with contextlib.suppress(NotImplementedError):
            loop.add_signal_handler(sig, _stop)

    client.connect_async(BROKER_HOST, BROKER_PORT, keepalive=60)
    client.loop_start()
    logger.info("MQTT Ingestion Worker started.")

    try:
        await stop_event.wait()
    finally:
        client.loop_stop()
        client.disconnect()
        await close_db()
        logger.info("MQTT Ingestion Worker stopped.")


if __name__ == "__main__":
    try:
        asyncio.run(run_worker())
    except KeyboardInterrupt:
        sys.exit(0)
