import argparse
import json
import logging
import os
import time
from datetime import UTC, datetime, timedelta, timezone
from pathlib import Path

import paho.mqtt.client as mqtt
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("mock_publisher")

_WIB = timezone(timedelta(hours=7))


def _build_timestamp(now_utc: datetime) -> dict:
    now_wib = now_utc.astimezone(_WIB)
    return {
        "datetime": now_wib.strftime("%Y-%m-%d %H:%M:%S"),
        "iso8601": now_wib.isoformat(),
        "timezone": "Asia/Jakarta",
        "timezone_abbr": "WIB",
        "utc_offset": "+07:00",
        "epoch": int(now_utc.timestamp()),
    }


def generate_payload(
    mode: str = "normal",
    node_id: str = "ESP32-WOKWI-NODE-01",
    lat: float | None = None,
    lon: float | None = None,
) -> dict:
    """
    Generates a telemetry payload matching the Wokwi/physical ESP32 schema.
    Both alias sets are included so either schema parser can read the data.
    """
    now_utc = datetime.now(UTC)
    default_lat = lat if lat is not None else float(os.getenv("DEFAULT_MONITOR_LAT", "52.37160"))
    default_lon = lon if lon is not None else float(os.getenv("DEFAULT_MONITOR_LON", "4.88830"))

    base = {
        "node_id": node_id,
        "device_id": node_id,
        "ts": now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "timestamp": _build_timestamp(now_utc),
        "lat": default_lat,
        "lon": default_lon,
        "source": "esp",
        "sig": "0x6f720491b408a47f15f065c3cbebe10013f7bb2eea4ecb4054596d46eec1a9d1",
    }

    scenarios: dict[str, dict] = {
        "normal": {
            "temperature": 25.6,
            "temp_c": 25.6,
            "soil_moisture": 76.3,
            "soil_pct": 76.3,
            "humidity_pct": 40.0,
            "fire_level": 0,
            "fire_status": "NORMAL",
            "smoke": 25,
            "sound": 30,
            "flame": 0,
            "flame_detected": False,
        },
        "high_temp": {
            "temperature": 32.5,
            "temp_c": 32.5,
            "soil_moisture": 42.1,
            "soil_pct": 42.1,
            "humidity_pct": 28.0,
            "fire_level": 0,
            "fire_status": "WARNING",
            "smoke": 30,
            "sound": 40,
            "flame": 0,
            "flame_detected": False,
        },
        "smoke_warning": {
            "temperature": 28.0,
            "temp_c": 28.0,
            "soil_moisture": 55.0,
            "soil_pct": 55.0,
            "humidity_pct": 35.0,
            "fire_level": 0,
            "fire_status": "WARNING",
            "smoke": 75,
            "sound": 60,
            "flame": 0,
            "flame_detected": False,
        },
        "fire": {
            "temperature": 41.5,
            "temp_c": 41.5,
            "soil_moisture": 25.0,
            "soil_pct": 25.0,
            "humidity_pct": 12.0,
            "fire_level": 3,
            "fire_status": "CRITICAL",
            "smoke": 120,
            "sound": 85,
            "flame": 3,
            "flame_detected": True,
        },
        "flame_only": {
            "temperature": 28.5,
            "temp_c": 28.5,
            "soil_moisture": 65.0,
            "soil_pct": 65.0,
            "humidity_pct": 45.0,
            "fire_level": 1,
            "fire_status": "CRITICAL",
            "smoke": 40,
            "sound": 50,
            "flame": 1,
            "flame_detected": True,
        },
    }

    if mode not in scenarios:
        raise ValueError(f"Unknown mode '{mode}'. Valid: {list(scenarios.keys())}")

    base.update(scenarios[mode])
    return base


def run_publisher():
    parser = argparse.ArgumentParser(description="Simulate ESP32/Wokwi telemetry publisher")
    parser.add_argument(
        "--mode",
        choices=["normal", "high_temp", "smoke_warning", "fire", "flame_only"],
        default="normal",
        help="Telemetry scenario to simulate",
    )
    parser.add_argument("--stream", action="store_true", help="Publish continuously")
    parser.add_argument(
        "--interval", type=float, default=3.0, help="Interval in seconds for stream mode"
    )
    parser.add_argument(
        "--topic", default=os.getenv("MQTT_TELEMETRY_TOPIC", "CbonCP/node-1/telemetry")
    )
    parser.add_argument("--lat", type=float, default=None, help="Override latitude")
    parser.add_argument("--lon", type=float, default=None, help="Override longitude")
    args = parser.parse_args()

    broker = os.getenv("MQTT_BROKER_HOST", "broker.emqx.io")
    port = int(os.getenv("MQTT_BROKER_PORT", "1883"))

    try:
        from paho.mqtt.enums import CallbackAPIVersion

        client = mqtt.Client(CallbackAPIVersion.VERSION2, client_id="cboncp-mock-esp32")
    except (ImportError, AttributeError):
        client = mqtt.Client(client_id="cboncp-mock-esp32")

    username = os.getenv("MQTT_USERNAME")
    password = os.getenv("MQTT_PASSWORD")
    if username:
        client.username_pw_set(username, password)

    logger.info("Connecting to broker %s:%d...", broker, port)
    client.connect(broker, port, 60)
    client.loop_start()

    try:
        while True:
            payload = generate_payload(args.mode, lat=args.lat, lon=args.lon)
            data_str = json.dumps(payload, indent=2)
            logger.info(
                "Publishing %s payload to '%s':\n%s", args.mode.upper(), args.topic, data_str
            )
            client.publish(args.topic, json.dumps(payload), qos=0)

            if not args.stream:
                break
            time.sleep(args.interval)
    finally:
        time.sleep(0.5)
        client.loop_stop()
        client.disconnect()
        logger.info("Mock publisher finished.")


if __name__ == "__main__":
    run_publisher()
