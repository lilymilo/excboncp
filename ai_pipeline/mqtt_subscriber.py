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


def _generate_html_dashboard(record: Dict[str, Any], output_path: Path) -> None:
    telemetry = record.get("telemetry", {})
    sat = record.get("satellite_verification", {})
    coords = sat.get("coordinates") or {"lat": telemetry.get("latitude", -6.5971), "lon": telemetry.get("longitude", 106.7994)}
    lat = coords.get("lat", -6.5971)
    lon = coords.get("lon", 106.7994)
    anomalies_str = ", ".join(record.get("anomalies", []))
    ee_script = sat.get("code_editor_script", "")

    html_content = f"""<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CBONCP - Laporan Verifikasi Satelit AI & GEE</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    :root {{
      --bg: #0f172a;
      --card-bg: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #ef4444;
      --success: #10b981;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 1.5rem;
      line-height: 1.5;
    }}
    .container {{ max-width: 1100px; margin: 0 auto; }}
    header {{ margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }}
    .badge {{
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      background: rgba(239, 68, 68, 0.2);
      color: var(--accent);
      border: 1px solid var(--accent);
    }}
    .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem; }}
    @media(max-width: 768px) {{ .grid {{ grid-template-columns: 1fr; }} }}
    .card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.25rem;
    }}
    .card h2 {{ font-size: 1.05rem; margin-bottom: 0.75rem; color: #38bdf8; }}
    .metric-row {{ display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.92rem; }}
    .metric-row:last-child {{ border-bottom: none; }}
    .metric-label {{ color: var(--muted); }}
    .metric-val {{ font-weight: 600; }}
    #map {{ height: 420px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 1.5rem; }}
    .code-box {{
      background: #090d16;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.85rem;
      color: #7dd3fc;
      overflow-x: auto;
      white-space: pre-wrap;
    }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1 style="font-size: 1.5rem; font-weight: 700;">CBONCP // Verifikasi Citra Satelit Real-Time</h1>
        <p style="color: var(--muted); font-size: 0.9rem;">Node Telemetri: {telemetry.get("node_id", "N/A")} | Terverifikasi: {sat.get("verified_at", "N/A")}</p>
      </div>
      <div>
        <span class="badge">STATUS ANOMALI: {anomalies_str or "TERDETEKSI"}</span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>Data Telemetri Sensor ESP32</h2>
        <div class="metric-row"><span class="metric-label">Node ID</span><span class="metric-val">{telemetry.get("node_id", "-")}</span></div>
        <div class="metric-row"><span class="metric-label">Suhu Sensor</span><span class="metric-val" style="color: #f87171;">{telemetry.get("temperature", "-")} °C</span></div>
        <div class="metric-row"><span class="metric-label">Kelembapan Tanah</span><span class="metric-val">{telemetry.get("soil_moisture", "-")} %</span></div>
        <div class="metric-row"><span class="metric-label">Deteksi Api</span><span class="metric-val">{telemetry.get("flame_detected", "-")}</span></div>
        <div class="metric-row"><span class="metric-label">Waktu Sensor</span><span class="metric-val">{telemetry.get("timestamp", {}).get("datetime", "-") if isinstance(telemetry.get("timestamp"), dict) else telemetry.get("timestamp", "-")}</span></div>
      </div>

      <div class="card">
        <h2>Metadata Citra Google Earth Engine (GEE)</h2>
        <div class="metric-row"><span class="metric-label">Penyedia / Satelit</span><span class="metric-val">{sat.get("provider", "Google Earth Engine")} (Sentinel-2 L2A)</span></div>
        <div class="metric-row"><span class="metric-label">Koleksi Satelit</span><span class="metric-val">{sat.get("collection", "-")}</span></div>
        <div class="metric-row"><span class="metric-label">Tanggal Akuisisi</span><span class="metric-val">{sat.get("acquisition_date", "-")}</span></div>
        <div class="metric-row"><span class="metric-label">Tutupan Awan</span><span class="metric-val">{sat.get("cloud_coverage_pct", "-")} %</span></div>
        <div class="metric-row"><span class="metric-label">ID Citra Satelit</span><span class="metric-val" style="font-size: 0.78rem;">{sat.get("image_id", "-")}</span></div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 1.5rem;">
      <h2>Peta Lokasi Stasiun Hutan & Deteksi Anomali</h2>
      <div id="map"></div>
    </div>

    <div class="card">
      <h2>Script Kode untuk Google Earth Engine Code Editor</h2>
      <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 0.75rem;">
        Salin kode berikut dan tempelkan ke jendela <b>New Script</b> di Code Editor GEE, lalu klik tombol <b>Run</b>:
      </p>
      <div class="code-box">{ee_script}</div>
    </div>
  </div>

  <script>
    const lat = {lat};
    const lon = {lon};
    const map = L.map('map').setView([lat, lon], 13);

    // Citra satelit ArcGIS World Imagery
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{{z}}/{{y}}/{{x}}', {{
      attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics'
    }}).addTo(map);

    // Marker sensor anomali
    const marker = L.circleMarker([lat, lon], {{
      radius: 12,
      fillColor: '#ef4444',
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    }}).addTo(map);

    marker.bindPopup('<b>Stasiun Node Anomali</b><br>Lat: ' + lat + '<br>Lon: ' + lon + '<br><span style="color:red;">{anomalies_str}</span>').openPopup();

    // Lingkaran radius pemantauan 2.5 km
    L.circle([lat, lon], {{
      radius: 2500,
      color: '#38bdf8',
      weight: 1.5,
      fillColor: '#38bdf8',
      fillOpacity: 0.1
    }}).addTo(map);
  </script>
</body>
</html>
"""
    output_path.write_text(html_content, encoding="utf-8")


def _save_event_record(record: Dict[str, Any]) -> None:
    try:
        data_dir = Path(__file__).resolve().parent / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        log_file = data_dir / "verified_anomalies.jsonl"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")

        # Also generate visual HTML report
        html_file = data_dir / "latest_verification.html"
        _generate_html_dashboard(record, html_file)
    except Exception as exc:
        logger.debug("Could not persist event record: %s", exc)


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
        if satellite_res.get("code_editor_script"):
            logger.info("[GEE SCRIPT UNTUK CODE EDITOR]\n%s", satellite_res.get("code_editor_script"))
        if satellite_res.get("thumbnail_url"):
            logger.info("[GEE THUMBNAIL URL] %s", satellite_res.get("thumbnail_url"))

        res_payload = {
            "status": "anomaly_triggered",
            "anomalies": reasons,
            "telemetry": telemetry,
            "satellite_verification": satellite_res
        }
        _save_event_record(res_payload)
        return res_payload
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
