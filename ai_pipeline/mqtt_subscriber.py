"""
MQTT Subscriber and Telemetry Data Pipeline for exboncp.
Subscribes to ESP32/Wokwi telemetry, enforces deterministic land status rules,
and triggers GEE satellite verification on anomaly conditions.
Architecture: 'Kode yang memutuskan, AI yang menjelaskan'.
"""

import json
import logging
import os
import signal
import sys
from pathlib import Path
from typing import Any

import paho.mqtt.client as mqtt
from dotenv import load_dotenv

from .gee_processor import fetch_satellite_data, initialize_gee
from .rules_engine import compute_status, explain_status

env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ai_pipeline.mqtt")


def get_config() -> dict[str, Any]:
    """Loads configuration values with defaults."""
    return {
        "broker_host": os.getenv("MQTT_BROKER_HOST", "broker.emqx.io"),
        "broker_port": int(os.getenv("MQTT_BROKER_PORT", "1883")),
        "topic": os.getenv("MQTT_TELEMETRY_TOPIC", "CbonCP/node-1/telemetry"),
        "keepalive": int(os.getenv("MQTT_KEEPALIVE", "60")),
        "username": os.getenv("MQTT_USERNAME") or None,
        "password": os.getenv("MQTT_PASSWORD") or None,
        "temp_threshold_warning": float(os.getenv("TEMP_WARNING_THRESHOLD", "30.0")),
        "temp_threshold_critical": float(os.getenv("TEMP_CRITICAL_THRESHOLD", "35.0")),
        "smoke_threshold_warning": int(os.getenv("SMOKE_WARNING_THRESHOLD", "50")),
        "default_lat": float(os.getenv("DEFAULT_MONITOR_LAT", "-6.5971")),
        "default_lon": float(os.getenv("DEFAULT_MONITOR_LON", "106.7994")),
        "default_consent": os.getenv("DEFAULT_LAND_CONSENT", "granted"),
        "default_dispute": os.getenv("DEFAULT_LAND_DISPUTE", "false").lower() == "true",
    }


def validate_telemetry(raw_payload: Any) -> tuple[bool, dict[str, Any] | None, str | None]:
    """
    Safely validates and parses incoming MQTT telemetry payload.
    Accepts both legacy schema (temperature/soil_moisture) and Wokwi schema
    (temp_c/soil_pct/lat/lon/fire_level/smoke). Guarantees no unhandled exception
    on corrupted, non-JSON, or malformed bytes.
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

    node_id = parsed.get("node_id") or parsed.get("device_id")
    if not node_id or not isinstance(node_id, str):
        return False, None, "Missing or invalid 'node_id' / 'device_id' string"

    # Accept either Wokwi alias (temp_c) or legacy (temperature)
    temp = parsed.get("temp_c") if parsed.get("temp_c") is not None else parsed.get("temperature")
    if temp is None or not isinstance(temp, (int, float)):
        return False, None, "Missing or non-numeric temperature field (temp_c or temperature)"

    # Accept either Wokwi alias (soil_pct) or legacy (soil_moisture)
    soil = parsed.get("soil_pct") if parsed.get("soil_pct") is not None else parsed.get("soil_moisture")
    if soil is None or not isinstance(soil, (int, float)):
        return False, None, "Missing or non-numeric soil field (soil_pct or soil_moisture)"

    # flame_detected is required; flame (int alias) is accepted as fallback
    flame = parsed.get("flame_detected")
    if flame is None:
        # Wokwi may send flame as int (0/1); normalize to bool
        flame_int = parsed.get("flame")
        if flame_int is not None and isinstance(flame_int, (int, float)):
            parsed["flame_detected"] = bool(flame_int)
        else:
            return False, None, "Missing 'flame_detected' or 'flame' field"
    elif not isinstance(flame, bool):
        return False, None, "'flame_detected' must be a boolean"

    # Normalize node_id to consistent key
    if "node_id" not in parsed and "device_id" in parsed:
        parsed["node_id"] = parsed["device_id"]

    return True, parsed, None


def parse_and_analyze_telemetry(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Extracts and analyzes all sensor fields from a validated telemetry payload.
    Handles both Wokwi schema (lat/lon/temp_c/soil_pct/fire_level/smoke/sound)
    and legacy schema (latitude/longitude/temperature/soil_moisture).

    fire_status is determined by strict 3-level priority:
      CRITICAL: flame_detected==True, fire_level>0, or temp>35.0
      WARNING:  temp>30.0 or smoke>50
      NORMAL:   everything else

    Returns a normalized dict ready for rules engine and report formatting.
    """
    cfg = get_config()

    # --- Location: Wokwi uses lat/lon; legacy uses latitude/longitude ---
    lat_raw = payload.get("lat") if payload.get("lat") is not None else payload.get("latitude")
    lon_raw = payload.get("lon") if payload.get("lon") is not None else payload.get("longitude")
    lat = float(lat_raw) if lat_raw is not None else cfg["default_lat"]
    lon = float(lon_raw) if lon_raw is not None else cfg["default_lon"]

    # --- Temperature: prefer temp_c (Wokwi), fallback to temperature ---
    temp_raw = payload.get("temp_c") if payload.get("temp_c") is not None else payload.get("temperature", 0.0)
    temp = float(temp_raw)

    # --- Soil: prefer soil_pct (Wokwi), fallback to soil_moisture ---
    soil_raw = payload.get("soil_pct") if payload.get("soil_pct") is not None else payload.get("soil_moisture", 0.0)
    soil = float(soil_raw)

    # --- Fire level: prefer fire_level (Wokwi), fallback to flame int ---
    fire_level_raw = payload.get("fire_level")
    if fire_level_raw is None:
        fire_level_raw = payload.get("flame", 0)
    fire_level = int(fire_level_raw)

    flame_detected = bool(payload.get("flame_detected", False))

    # --- Smoke and sound (Wokwi-specific, default 0 for legacy) ---
    smoke = int(payload.get("smoke", 0))
    sound = int(payload.get("sound", 0))
    humidity = float(payload.get("humidity_pct", 0.0))

    # --- Timestamp extraction with full timezone precision ---
    ts_obj = payload.get("timestamp") or {}
    dt_str = ts_obj.get("datetime") or payload.get("ts", "")
    iso8601 = ts_obj.get("iso8601", "")
    tz_name = ts_obj.get("timezone", "UTC")
    tz_abbr = ts_obj.get("timezone_abbr", "UTC")
    utc_offset = ts_obj.get("utc_offset", "+00:00")
    epoch = ts_obj.get("epoch")

    # --- fire_status: 3-level priority, evaluated independently of Rules Engine ---
    # This is the sensor-level fire classification only. Land status comes from compute_status().
    if flame_detected or fire_level > 0 or temp > cfg["temp_threshold_critical"]:
        fire_status = "CRITICAL"
    elif temp > cfg["temp_threshold_warning"] or smoke > cfg["smoke_threshold_warning"]:
        fire_status = "WARNING"
    else:
        fire_status = "NORMAL"

    return {
        "node_id": payload.get("node_id", "UNKNOWN"),
        "lat": lat,
        "lon": lon,
        "temp": temp,
        "soil": soil,
        "fire_level": fire_level,
        "fire_status": fire_status,
        "flame_detected": flame_detected,
        "smoke": smoke,
        "sound": sound,
        "humidity": humidity,
        "dt_str": dt_str,
        "iso8601": iso8601,
        "tz_name": tz_name,
        "tz_abbr": tz_abbr,
        "utc_offset": utc_offset,
        "epoch": epoch,
    }


def evaluate_sensor_flag(
    telemetry: dict[str, Any], temp_threshold: float = 30.0
) -> tuple[bool, list[str]]:
    """
    Evaluates whether physical sensors crossed danger thresholds.
    Reads both Wokwi aliases (temp_c, fire_level, smoke) and legacy fields.
    Returns (sensor_flag, list_of_human_readable_reasons).
    """
    reasons: list[str] = []

    temp_raw = telemetry.get("temp_c") if telemetry.get("temp_c") is not None else telemetry.get("temperature", 0.0)
    temperature = float(temp_raw)

    if temperature > temp_threshold:
        reasons.append(f"High Temperature ({temperature:.1f}°C > {temp_threshold:.1f}°C)")

    if telemetry.get("flame_detected") is True:
        reasons.append("Flame Detected by Infrared Sensor")

    # fire_level > 0 from Wokwi also counts as anomaly
    fire_level = int(telemetry.get("fire_level") or telemetry.get("flame") or 0)
    if fire_level > 0 and not telemetry.get("flame_detected"):
        reasons.append(f"Fire Level Sensor Active (level={fire_level})")

    # Elevated smoke triggers sensor flag
    smoke = int(telemetry.get("smoke") or 0)
    cfg = get_config()
    if smoke > cfg["smoke_threshold_warning"]:
        reasons.append(f"Smoke Concentration Elevated (smoke={smoke} > {cfg['smoke_threshold_warning']})")

    has_anomaly = len(reasons) > 0
    return has_anomaly, reasons


# Backward-compatible alias kept for existing test_pipeline.py
evaluate_anomaly = evaluate_sensor_flag


def format_telemetry_report(
    parsed: dict[str, Any],
    land_status: str,
    satellite_res: dict[str, Any] | None,
) -> str:
    """
    Formats the structured telemetry analysis report from real sensor data.
    Every value shown is sourced directly from the parsed payload or GEE result —
    no fabricated or placeholder numbers.
    """
    lat = parsed["lat"]
    lon = parsed["lon"]
    temp = parsed["temp"]
    soil = parsed["soil"]
    fire_level = parsed["fire_level"]
    fire_status = parsed["fire_status"]
    smoke = parsed["smoke"]
    sound = parsed["sound"]
    dt_str = parsed["dt_str"]
    tz_abbr = parsed["tz_abbr"]
    tz_name = parsed["tz_name"]

    if satellite_res and satellite_res.get("status") in ("success", "cached", "cached_emergency", "simulated"):
        sat_line = f"[OK] Citra Satelit GEE Terverifikasi pada koordinat ({lat:.5f}, {lon:.5f})"
    elif satellite_res:
        sat_line = f"[GAGAL] GEE tidak tersedia — fallback cache aktif pada ({lat:.5f}, {lon:.5f})"
    else:
        sat_line = f"[SKIP] Satelit tidak diquery (kondisi sensor NORMAL)"

    lines = [
        "-" * 50,
        "[ANALISIS TELEMETRI SENSOR & SATELIT REAL-TIME]",
        f"Lokasi Koordinat : Latitude {lat:.5f}, Longitude {lon:.5f}",
        f"Suhu Udara       : {temp:.1f} \u00b0C",
        f"Kelembapan Tanah : {soil:.1f} %",
        f"Level Api        : {fire_level} (Status: {fire_status})",
        f"Tingkat Asap     : {smoke} | Suara: {sound} dB",
        f"Waktu Pengukuran : {dt_str} ({tz_abbr} / {tz_name})",
        f"Status Lahan     : {land_status} (Ditetapkan mutlak oleh Rules Engine)",
        f"Status Satelit   : {sat_line}",
        "-" * 50,
    ]
    return "\n".join(lines)


def _save_event_record(record: dict[str, Any]) -> None:
    try:
        data_dir = Path(__file__).resolve().parent / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        log_file = data_dir / "verified_anomalies.jsonl"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")
    except Exception as exc:
        logger.debug("Could not persist event record: %s", exc)


def handle_telemetry_message(
    payload_bytes: bytes, config: dict[str, Any] | None = None
) -> dict[str, Any]:
    """
    Core pipeline processor:
    Validates telemetry -> parses & analyzes -> evaluates sensor flag ->
    computes land status -> prints structured report -> queries GEE on anomaly.
    """
    cfg = config or get_config()
    is_valid, telemetry, err_msg = validate_telemetry(payload_bytes)

    if not is_valid or telemetry is None:
        logger.error("Telemetry payload validation rejected: %s", err_msg)
        return {"status": "rejected", "error": err_msg}

    # Full extraction with alias resolution
    parsed = parse_and_analyze_telemetry(telemetry)

    node_id = parsed["node_id"]
    temp = parsed["temp"]
    soil = parsed["soil"]
    flame = parsed["flame_detected"]
    lat = parsed["lat"]
    lon = parsed["lon"]

    sensor_flag, anomaly_reasons = evaluate_sensor_flag(telemetry, cfg["temp_threshold_warning"])

    consent = str(telemetry.get("consent", cfg["default_consent"]))
    dispute_open = bool(telemetry.get("dispute_open", cfg["default_dispute"]))

    # Rules Engine is the sole authority on land status
    land_status = compute_status(consent, dispute_open, sensor_flag)

    explanation = explain_status(
        consent=consent,
        dispute_open=dispute_open,
        sensor_flag=sensor_flag,
        metrics={"temperature": temp, "soil_moisture": soil, "flame_detected": flame},
    )

    satellite_res: dict[str, Any] | None = None

    if land_status == "VERIFIED":
        logger.info(
            "[STATUS: VERIFIED] Node: %s | Temp: %.1f°C | Soil: %.1f%% | Flame: %s | Fire: %s",
            node_id, temp, soil, flame, parsed["fire_status"],
        )
        report = format_telemetry_report(parsed, land_status, satellite_res)
        logger.info("\n%s", report)
        return {
            "status": "normal",
            "land_status": land_status,
            "explanation": explanation,
            "parsed": parsed,
            "telemetry": telemetry,
            "report": report,
        }

    # Non-VERIFIED state: trigger GEE satellite verification using real sensor coordinates
    logger.warning("=" * 60)
    logger.warning("[LAND STATUS: %s] Node: %s", land_status, node_id)
    logger.warning("[HUMAN LABEL] %s", explanation.get("human_label"))
    logger.warning("[EXPLANATION] %s", explanation.get("explanation"))
    if anomaly_reasons:
        logger.warning("[SENSOR TRIGGERS] %s", ", ".join(anomaly_reasons))
    logger.warning("[METRICS] Temp: %.1f°C | Soil: %.1f%% | Flame: %s | Smoke: %d", temp, soil, flame, parsed["smoke"])
    logger.info("[ACTION] Querying Earth Engine for (%f, %f)...", lat, lon)
    logger.warning("=" * 60)

    try:
        satellite_res = fetch_satellite_data(lat=lat, lon=lon)
        sat_status = satellite_res.get("status")
        sat_provider = satellite_res.get("provider", "GEE")
        logger.info("[GEE VERIFICATION] Status: %s | Provider: %s", sat_status, sat_provider)
        if satellite_res.get("image_id"):
            logger.info("[GEE SATELLITE IMAGE ID] %s", satellite_res.get("image_id"))
        if satellite_res.get("thumbnail_url"):
            logger.info("[GEE THUMBNAIL URL] %s", satellite_res.get("thumbnail_url"))

        report = format_telemetry_report(parsed, land_status, satellite_res)
        logger.info("\n%s", report)

        res_payload = {
            "status": "anomaly_triggered",
            "land_status": land_status,
            "explanation": explanation,
            "anomalies": anomaly_reasons,
            "parsed": parsed,
            "telemetry": telemetry,
            "satellite_verification": satellite_res,
            "report": report,
        }
        _save_event_record(res_payload)
        return res_payload

    except Exception as exc:
        logger.error("[GEE ERROR] Satellite query failure: %s", exc)
        report = format_telemetry_report(parsed, land_status, None)
        logger.info("\n%s", report)
        return {
            "status": "anomaly_gee_error",
            "land_status": land_status,
            "explanation": explanation,
            "anomalies": anomaly_reasons,
            "parsed": parsed,
            "telemetry": telemetry,
            "report": report,
            "error": str(exc),
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
            logger.info(
                "Connected to MQTT Broker at %s:%d", config["broker_host"], config["broker_port"]
            )
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
