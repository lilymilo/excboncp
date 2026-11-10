import argparse
import json
import logging
import os
import time
from datetime import UTC, datetime
from pathlib import Path

try:
    import paho.mqtt.client as mqtt
except ImportError:  # pragma: no cover - optional when only payload generation is tested
    mqtt = None  # type: ignore[assignment]
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("mock_publisher")


def generate_payload(mode: str = "normal", node_id: str = "ESP32-PHYSICAL-NODE-01") -> dict:
    now_utc = datetime.now(UTC)
    now_epoch = int(now_utc.timestamp())

    base = {
        "node_id": node_id,
        "timestamp": {
            "datetime": now_utc.strftime("%Y-%m-%d %H:%M:%S"),
            "iso8601": now_utc.isoformat(),
            "timezone": "Asia/Jakarta",
            "timezone_abbr": "WIB",
            "utc_offset": "+07:00",
            "epoch": now_epoch,
        },
        "latitude": float(os.getenv("DEFAULT_MONITOR_LAT", "-6.5971")),
        "longitude": float(os.getenv("DEFAULT_MONITOR_LON", "106.7994")),
    }

    if mode == "normal":
        base.update(
            {
                "soil_moisture": 78.5,
                "temperature": 27.4,
                "flame_detected": False,
            }
        )
    elif mode == "high_temp":
        base.update(
            {
                "soil_moisture": 42.1,
                "temperature": 34.8,
                "flame_detected": False,
            }
        )
    elif mode == "fire":
        base.update(
            {
                "soil_moisture": 25.0,
                "temperature": 41.5,
                "flame_detected": True,
            }
        )
    elif mode == "flame_only":
        base.update(
            {
                "soil_moisture": 65.0,
                "temperature": 28.5,
                "flame_detected": True,
            }
        )
    return base


def run_publisher():
    parser = argparse.ArgumentParser(description="Simulate ESP32 telemetry publisher")
    parser.add_argument(
        "--mode",
        choices=["normal", "high_temp", "fire", "flame_only"],
        default="normal",
        help="Type of telemetry scenario to send",
    )
    parser.add_argument("--stream", action="store_true", help="Send telemetry continuously")
    parser.add_argument(
        "--interval", type=float, default=3.0, help="Interval in seconds for stream mode"
    )
    parser.add_argument(
        "--topic", default=os.getenv("MQTT_TELEMETRY_TOPIC", "CbonCP/node-1/telemetry")
    )
    args = parser.parse_args()

    broker = os.getenv("MQTT_BROKER_HOST", "localhost")
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
            payload = generate_payload(args.mode)
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
