import json
import logging
import os
import signal
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from dotenv import load_dotenv
import paho.mqtt.client as mqtt

from .gee_processor import fetch_satellite_data, initialize_gee

# Load environment configuration
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_pipeline.mqtt")


def get_config() -> Dict[str, Any]:
    return {
        "broker_host": os.getenv("MQTT_BROKER_HOST", "localhost"),
        "broker_port": int(os.getenv("MQTT_BROKER_PORT", "1883")),
        "topic": os.getenv("MQTT_TELEMETRY_TOPIC", "CbonCP/node-1/telemetry"),
        "keepalive": int(os.getenv("MQTT_KEEPALIVE", "60")),
        "username": os.getenv("MQTT_USERNAME") or None,
        "password": os.getenv("MQTT_PASSWORD") or None,
        "temp_threshold": float(os.getenv("TEMP_ANOMALY_THRESHOLD", "30.0")),
        "default_lat": float(os.getenv("DEFAULT_MONITOR_LAT", "-6.5971")),
        "default_lon": float(os.getenv("DEFAULT_MONITOR_LON", "106.7994")),
    }


def validate_telemetry(raw_payload: Any) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    if isinstance(raw_payload, (bytes, bytearray)):
        try:
            raw_text = raw_payload.decode("utf-8")
        except UnicodeDecodeError as exc:
            return False, None, f"UTF-8 decode failure: {exc}"
    elif isinstance(raw_payload, str):
        raw_text = raw_payload
    elif isinstance(raw_payload, dict):
        parsed = raw_payload
        raw_text = None
    else:
        return False, None, f"Unsupported payload type: {type(raw_payload).__name__}"

    if raw_text is not None:
        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError as exc:
            return False, None, f"Invalid JSON format: {exc}"

    if not isinstance(parsed, dict):
        return False, None, "Payload root must be a JSON object"

    node_id = parsed.get("node_id")
    if not node_id or not isinstance(node_id, str):
        return False, None, "Missing or invalid 'node_id' string"

    temp = parsed.get("temperature")
    if temp is None or not isinstance(temp, (int, float)):
        return False, None, "Missing or non-numeric 'temperature'"

    soil = parsed.get("soil_moisture")
    if soil is None or not isinstance(soil, (int, float)):
        return False, None, "Missing or non-numeric 'soil_moisture'"

    flame = parsed.get("flame_detected")
    if flame is None or not isinstance(flame, bool):
        return False, None, "Missing or non-boolean 'flame_detected'"

    return True, parsed, None


def evaluate_anomaly(
    telemetry: Dict[str, Any],
    temp_threshold: float = 30.0
) -> Tuple[bool, List[str]]:
    anomalies: List[str] = []

    temperature = float(telemetry["temperature"])
    if temperature > temp_threshold:
        anomalies.append(f"High Temperature ({temperature:.1f}°C > {temp_threshold:.1f}°C)")

    if telemetry.get("flame_detected") is True:
        anomalies.append("Flame Detected by Infrared Sensor")

    return (len(anomalies) > 0), anomalies


def create_mqtt_client(client_id: str = "cboncp-ai-pipeline") -> mqtt.Client:
    try:
        from paho.mqtt.enums import CallbackAPIVersion
        client = mqtt.Client(CallbackAPIVersion.VERSION2, client_id=client_id)
    except (ImportError, AttributeError):
        client = mqtt.Client(client_id=client_id)
    return client


def handle_telemetry_message(
    payload_bytes: bytes,
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    cfg = config or get_config()
    is_valid, telemetry, err_msg = validate_telemetry(payload_bytes)

    if not is_valid or telemetry is None:
        logger.error("Telemetry payload validation failed: %s", err_msg)
        return {"status": "rejected", "error": err_msg}

    node_id = telemetry["node_id"]
    temp = telemetry["temperature"]
    soil = telemetry["soil_moisture"]
    flame = telemetry["flame_detected"]

    has_anomaly, reasons = evaluate_anomaly(telemetry, cfg["temp_threshold"])

    if not has_anomaly:
        logger.info(
            "[TELEMETRY OK] Node: %s | Temp: %.1f°C | Soil Moisture: %.1f%% | Flame: %s",
            node_id, temp, soil, flame
        )
        return {"status": "normal", "telemetry": telemetry}

    # Dispatch satellite verification query when an anomaly threshold is breached
    reasons_str = ", ".join(reasons)
    logger.warning("[ANOMALY ALERT] Node: %s | Triggers: %s", node_id, reasons_str)
    logger.warning("[METRICS] Temp: %.1f°C | Soil: %.1f%% | Flame: %s", temp, soil, flame)

    # Use coordinates in payload if node specifies them, otherwise fallback to configured regional station
    lat = telemetry.get("latitude", cfg["default_lat"])
    lon = telemetry.get("longitude", cfg["default_lon"])
    logger.info("[ACTION] Dispatching Earth Engine satellite query for coordinates (%f, %f)...", lat, lon)

    try:
        satellite_res = fetch_satellite_data(lat=lat, lon=lon)
        logger.info("[GEE VERIFICATION] Status: %s", satellite_res.get("status"))
        if satellite_res.get("image_id"):
            logger.info("[GEE SATELLITE IMAGE ID] %s", satellite_res.get("image_id"))
        if satellite_res.get("thumbnail_url"):
            logger.info("[GEE THUMBNAIL URL] %s", satellite_res.get("thumbnail_url"))

        return {
            "status": "anomaly_triggered",
            "anomalies": reasons,
            "telemetry": telemetry,
            "satellite_verification": satellite_res
        }
    except Exception as exc:
        logger.error("[GEE ERROR] Failed during automated anomaly verification: %s", exc)
        return {
            "status": "anomaly_gee_error",
            "anomalies": reasons,
            "telemetry": telemetry,
            "error": str(exc)
        }


def start_subscriber() -> None:
    config = get_config()

    logger.info("Initializing Google Earth Engine processor...")
    initialize_gee()

    client = create_mqtt_client()

    if config["username"]:
        client.username_pw_set(config["username"], config["password"])

    def on_connect(mqtt_client, userdata, flags, *args):
        # Accommodates both v1 rc integer and v2 ReasonCodes object
        rc = args[0] if args else 0
        if (hasattr(rc, "is_failure") and not rc.is_failure) or rc == 0:
            logger.info("Connected to MQTT Broker at %s:%d", config["broker_host"], config["broker_port"])
            mqtt_client.subscribe(config["topic"], qos=0)
            logger.info("Subscribed to topic '%s' (QoS 0)", config["topic"])
        else:
            logger.error("MQTT connection rejected with code: %s", rc)

    def on_disconnect(mqtt_client, userdata, *args):
        logger.warning("Disconnected from MQTT broker. Auto-reconnect scheduled.")

    def on_message(mqtt_client, userdata, msg):
        try:
            handle_telemetry_message(msg.payload, config)
        except Exception as exc:
            logger.error("Unhandled error processing MQTT message: %s", exc, exc_info=True)

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_message = on_message

    def shutdown_signal(signum, frame):
        logger.info("Termination signal received. Shutting down MQTT subscriber...")
        client.disconnect()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_signal)
    signal.signal(signal.SIGTERM, shutdown_signal)

    logger.info("Starting MQTT loop on %s:%d...", config["broker_host"], config["broker_port"])
    try:
        client.connect(config["broker_host"], config["broker_port"], config["keepalive"])
        client.loop_forever()
    except KeyboardInterrupt:
        logger.info("Subscriber stopped by keyboard interrupt.")
    except Exception as exc:
        logger.error("Failed to maintain MQTT connection: %s", exc)


if __name__ == "__main__":
    start_subscriber()
