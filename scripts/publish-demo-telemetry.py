#!/usr/bin/env python3
"""Publish signed demo telemetry to the MQTT broker used by the ESP32 nodes.

The payload follows the same wire contract as ``iot-node/sketch.ino``:
the signature is SHA-256 of ``device_id|ts|flame|temp_c{secret}``.
Run this while the MQTT worker and central server are running, then open
``/indikator`` to see the reading in the live telemetry strip.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import time
from datetime import UTC, datetime

try:
    import paho.mqtt.client as mqtt
except ImportError as exc:  # pragma: no cover - friendly local error
    raise SystemExit(
        "paho-mqtt belum terpasang. Jalankan: pip install paho-mqtt"
    ) from exc

DEFAULT_BROKER = os.getenv("MQTT_BROKER", "broker.emqx.io")
DEFAULT_PORT = int(os.getenv("MQTT_PORT", "1883"))
DEFAULT_TOPIC = os.getenv("MQTT_TOPIC_TELEMETRY", "CbonCP/node-1/telemetry")
DEFAULT_SECRET = os.getenv("SENSOR_SECRET", "EXCBONCP_DEMO_SECRET")
DEFAULT_DEVICE = os.getenv("DEMO_NODE_ID", "SIM-ESP32-DEMO-01")

SCENARIOS = {
    "normal": {"temp_c": 27.4, "humidity_pct": 78.5, "soil_pct": 78.5, "flame": 0},
    "heat": {"temp_c": 43.5, "humidity_pct": 55.0, "soil_pct": 42.0, "flame": 0},
    "smoke": {"temp_c": 38.5, "humidity_pct": 40.0, "soil_pct": 42.5, "flame": 1},
}


def fire_state(temp_c: float, flame: int, soil_pct: float) -> tuple[int, str]:
    if flame or temp_c >= 65.0:
        return 3, "BAHAYA"
    if temp_c >= 55.0 or (temp_c >= 48.0 and soil_pct < 20.0):
        return 2, "SIAGA"
    if temp_c >= 42.0 or (temp_c >= 35.0 and soil_pct < 50.0):
        return 1, "WASPADA"
    return 0, "NORMAL"


def build_payload(
    device_id: str,
    secret: str,
    scenario: str,
    lat: float | None,
    lon: float | None,
) -> dict:
    values = SCENARIOS[scenario]
    temp_c = float(values["temp_c"])
    humidity_pct = float(values["humidity_pct"])
    soil_pct = float(values["soil_pct"])
    flame = int(values["flame"])

    # UTC is the wire contract. Do not send local WIB time here.
    ts = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    fire_level, fire_status = fire_state(temp_c, flame, soil_pct)
    signature_raw = f"{device_id}|{ts}|{flame}|{temp_c:.1f}{secret}"
    signature = "0x" + hashlib.sha256(signature_raw.encode("utf-8")).hexdigest()

    payload = {
        "node_id": device_id,
        "device_id": device_id,
        "ts": ts,
        "temp_c": temp_c,
        "temperature": temp_c,
        "humidity_pct": humidity_pct,
        "soil_pct": soil_pct,
        "soil_moisture": soil_pct,
        "soil_raw": int(round((soil_pct / 100.0) * 4095)),
        "flame": flame,
        "flame_detected": bool(flame),
        "fire_level": fire_level,
        "fire_status": fire_status,
        "source": "simulator",
        "sig": signature,
    }
    if lat is not None and lon is not None:
        payload["lat"] = lat
        payload["lon"] = lon
    return payload


def publish(args: argparse.Namespace) -> None:
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"excboncp-demo-{int(time.time())}")
    client.connect(args.broker, args.port, keepalive=30)
    client.loop_start()

    try:
        for index in range(args.count):
            payload = build_payload(args.device_id, args.secret, args.scenario, args.lat, args.lon)
            result = client.publish(args.topic, json.dumps(payload), qos=1)
            result.wait_for_publish(timeout=8)
            print(
                f"[{index + 1}/{args.count}] {payload['device_id']} "
                f"{payload['ts']} temp={payload['temp_c']}C "
                f"flame={payload['flame']} status={payload['fire_status']} "
                f"sig={payload['sig'][:18]}..."
            )
            if index + 1 < args.count:
                time.sleep(args.interval)
    finally:
        client.loop_stop()
        client.disconnect()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--broker", default=DEFAULT_BROKER, help="MQTT broker host")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="MQTT broker port")
    parser.add_argument("--topic", default=DEFAULT_TOPIC, help="MQTT telemetry topic")
    parser.add_argument("--device-id", default=DEFAULT_DEVICE, help="Node id understood by the server")
    parser.add_argument("--secret", default=DEFAULT_SECRET, help="Shared sensor secret")
    parser.add_argument(
        "--scenario",
        choices=sorted(SCENARIOS),
        default="normal",
        help="Demo reading profile",
    )
    parser.add_argument("--count", type=int, default=1, help="Number of readings to publish")
    parser.add_argument("--interval", type=float, default=4.0, help="Seconds between readings")
    parser.add_argument("--lat", type=float, default=None, help="Optional latitude")
    parser.add_argument("--lon", type=float, default=None, help="Optional longitude")
    args = parser.parse_args()

    if args.count < 1:
        parser.error("--count minimal 1")
    if args.interval < 0:
        parser.error("--interval tidak boleh negatif")
    if (args.lat is None) != (args.lon is None):
        parser.error("--lat dan --lon harus diisi bersama")
    return args


if __name__ == "__main__":
    publish(parse_args())
