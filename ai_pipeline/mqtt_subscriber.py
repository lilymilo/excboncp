"""
MQTT Subscriber and Telemetry Data Pipeline for exboncp.
Subscribes to ESP32 telemetry, executes deterministic land status rules,
and triggers Google Earth Engine satellite verification on anomaly conditions.
Architecture principle: 'Kode yang memutuskan, AI yang menjelaskan'.
"""

import json
import logging
import os
import signal
import sys
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from dotenv import load_dotenv
import paho.mqtt.client as mqtt

from .gee_processor import fetch_satellite_data, initialize_gee
from .rules_engine import compute_status, explain_status

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
    """Loads configuration values with defaults."""
    return {
        "broker_host": os.getenv("MQTT_BROKER_HOST", "broker.emqx.io"),
        "broker_port": int(os.getenv("MQTT_BROKER_PORT", "1883")),
        "topic": os.getenv("MQTT_TELEMETRY_TOPIC", "CbonCP/node-1/telemetry"),
        "keepalive": int(os.getenv("MQTT_KEEPALIVE", "60")),
        "username": os.getenv("MQTT_USERNAME") or None,
        "password": os.getenv("MQTT_PASSWORD") or None,
        "temp_threshold": float(os.getenv("TEMP_ANOMALY_THRESHOLD", "30.0")),
        "default_lat": float(os.getenv("DEFAULT_MONITOR_LAT", "-6.5971")),
        "default_lon": float(os.getenv("DEFAULT_MONITOR_LON", "106.7994")),
        "default_consent": os.getenv("DEFAULT_LAND_CONSENT", "granted"),
        "default_dispute": os.getenv("DEFAULT_LAND_DISPUTE", "false").lower() == "true",
    }


def validate_telemetry(raw_payload: Any) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """
    Safely validates and parses incoming MQTT telemetry payload.
    Guarantees no unhandled exception on corrupted, non-JSON, or malformed bytes.
    """
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
        except (json.JSONDecodeError, TypeError) as exc:
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


def evaluate_sensor_flag(telemetry: Dict[str, Any], temp_threshold: float = 30.0) -> Tuple[bool, list[str]]:
    """Evaluates whether physical sensors crossed danger thresholds."""
    reasons: list[str] = []
    temperature = float(telemetry["temperature"])

    if temperature > temp_threshold:
        reasons.append(f"High Temperature ({temperature:.1f}°C > {temp_threshold:.1f}°C)")

    if telemetry.get("flame_detected") is True:
        reasons.append("Flame Detected by Infrared Sensor")

    has_anomaly = len(reasons) > 0
    return has_anomaly, reasons


# Backward-compatible alias
evaluate_anomaly = evaluate_sensor_flag


def _save_event_record(record: Dict[str, Any]) -> None:
    try:
        data_dir = Path(__file__).resolve().parent / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        log_file = data_dir / "verified_anomalies.jsonl"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception as exc:
        logger.debug("Could not persist event record: %s", exc)


def handle_telemetry_message(
    payload_bytes: bytes,
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Core pipeline processor:
    Validates telemetry -> evaluates sensor flag -> computes land status ->
    explains status -> queries GEE on warning/anomaly.
    """
    cfg = config or get_config()
    is_valid, telemetry, err_msg = validate_telemetry(payload_bytes)

    if not is_valid or telemetry is None:
        logger.error("Telemetry payload validation rejected: %s", err_msg)
        return {"status": "rejected", "error": err_msg}

    node_id = telemetry["node_id"]
    temp = float(telemetry["temperature"])
    soil = float(telemetry["soil_moisture"])
    flame = bool(telemetry["flame_detected"])

    sensor_flag, anomaly_reasons = evaluate_sensor_flag(telemetry, cfg["temp_threshold"])

    # Resolve consent and dispute context (defaults to granted/false unless in telemetry)
    consent = str(telemetry.get("consent", cfg["default_consent"]))
    dispute_open = bool(telemetry.get("dispute_open", cfg["default_dispute"]))

    # Rule Engine: "Kode yang memutuskan"
    land_status = compute_status(consent, dispute_open, sensor_flag)

    # AI Explainer: "AI yang menjelaskan"
    explanation = explain_status(
        consent=consent,
        dispute_open=dispute_open,
        sensor_flag=sensor_flag,
        metrics={"temperature": temp, "soil_moisture": soil, "flame_detected": flame}
    )

    lat = float(telemetry.get("latitude", cfg["default_lat"]))
    lon = float(telemetry.get("longitude", cfg["default_lon"]))

    if land_status == "VERIFIED":
        logger.info(
            "[STATUS: VERIFIED] Node: %s | Temp: %.1f°C | Soil: %.1f%% | Flame: %s | Units Sellable: True",
            node_id, temp, soil, flame
        )
        return {
            "status": "normal",
            "land_status": land_status,
            "explanation": explanation,
            "telemetry": telemetry
        }

    # Anomaly or Restricted state: trigger GEE satellite verification
    logger.warning("=" * 60)
    logger.warning("[LAND STATUS: %s] Node: %s", land_status, node_id)
    logger.warning("[HUMAN LABEL] %s", explanation.get("human_label"))
    logger.warning("[EXPLANATION] %s", explanation.get("explanation"))
    if anomaly_reasons:
        logger.warning("[SENSOR TRIGGERS] %s", ", ".join(anomaly_reasons))
    logger.warning("[METRICS] Temp: %.1f°C | Soil: %.1f%% | Flame: %s", temp, soil, flame)
    logger.info("[ACTION] Querying Earth Engine satellite layer for (%f, %f)...", lat, lon)
    logger.warning("=" * 60)

    try:
        satellite_res = fetch_satellite_data(lat=lat, lon=lon)
        logger.info("[GEE VERIFICATION] Status: %s | Provider: %s", satellite_res.get("status"), satellite_res.get("provider", "GEE"))
        if satellite_res.get("image_id"):
            logger.info("[GEE IMAGE ID] %s", satellite_res.get("image_id"))
        if satellite_res.get("thumbnail_url"):
            logger.info("[SATELLITE VIEWER URL] %s", satellite_res.get("thumbnail_url"))

        res_payload = {
            "status": "anomaly_triggered",
            "land_status": land_status,
            "explanation": explanation,
            "anomalies": anomaly_reasons,
            "telemetry": telemetry,
            "satellite_verification": satellite_res
        }
        _save_event_record(res_payload)
        return res_payload

    except Exception as exc:
        logger.error("[GEE ERROR] Satellite query failure: %s", exc)
        return {
            "status": "anomaly_gee_error",
            "land_status": land_status,
            "explanation": explanation,
            "anomalies": anomaly_reasons,
            "telemetry": telemetry,
            "error": str(exc)
        }


def create_mqtt_client(client_id: str = "exboncp-ai-pipeline") -> mqtt.Client:
    """Creates an MQTT client with version fallback."""
    try:
        from paho.mqtt.enums import CallbackAPIVersion
        client = mqtt.Client(CallbackAPIVersion.VERSION2, client_id=client_id)
    except (ImportError, AttributeError):
        client = mqtt.Client(client_id=client_id)
    return client


def start_subscriber() -> None:
    """Main loop: connects to broker and subscribes to ESP32 telemetry topic."""
    config = get_config()

    logger.info("Initializing Google Earth Engine processor...")
    initialize_gee()

    client = create_mqtt_client()

    if config["username"]:
        client.username_pw_set(config["username"], config["password"])

    def on_connect(mqtt_client, userdata, flags, *args):
        rc = args[0] if args else 0
        if (hasattr(rc, "is_failure") and not rc.is_failure) or rc == 0:
            logger.info("Connected to MQTT Broker at %s:%d", config["broker_host"], config["broker_port"])
            mqtt_client.subscribe(config["topic"], qos=0)
            logger.info("Subscribed to topic '%s' (QoS 0)", config["topic"])
        else:
            logger.error("MQTT connection rejected with code: %s", rc)

    def on_disconnect(mqtt_client, userdata, *args):
        logger.warning("Disconnected from MQTT broker. Auto-reconnect active.")

    def on_message(mqtt_client, userdata, msg):
        try:
            handle_telemetry_message(msg.payload, config)
        except Exception as exc:
            logger.error("Unhandled error processing telemetry message: %s", exc, exc_info=True)

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
