"""Pipeline runner to test ESP32 Wokwi telemetry directly with economic settlement."""

import json
import os
import sys

import paho.mqtt.client as mqtt

# Ensure project root is in sys.path so api.economy can be imported.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from api.economy.settlement import settle

BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = os.getenv("MQTT_TOPIC", "CbonCP/node-1/telemetry")

TOTAL_BASELINE_UNITS = 600
FROZEN_UNITS_ON_WARNING = 100


def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print(f"\n[OK] Terhubung ke broker ({BROKER}:{PORT})")
        print(f"[OK] Menunggu data sensor pada topik: {TOPIC}")
        print("     Tekan Ctrl+C untuk keluar.\n" + "-" * 60)
        client.subscribe(TOPIC)
    else:
        print(f"[ERROR] Gagal terhubung ke broker, return code: {rc}")


def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode("utf-8"))
    except json.JSONDecodeError:
        print(f"[WARN] Payload bukan JSON valid: {msg.payload}")
        return

    node_id = payload.get("device_id") or payload.get("node_id", "UNKNOWN")
    flame = payload.get("flame_detected", False)
    smoke = payload.get("smoke", 500 if flame else 25)
    temp = payload.get("temp_c") or payload.get("temperature", 0.0)
    sig = payload.get("sig", "none")

    # shortcut: thresholding evaluated locally, Davin's compute_status will take over in integrated service
    is_warning = flame or smoke > 100

    if is_warning:
        status = "WARNING"
        sold_units = TOTAL_BASELINE_UNITS - FROZEN_UNITS_ON_WARNING
        warning_reason = "Terdeteksi asap/kebakaran! 100 unit dibekukan sementara."
    else:
        status = "VERIFIED"
        sold_units = TOTAL_BASELINE_UNITS
        warning_reason = "Kondisi hutan aman, seluruh unit terverifikasi."

    econ = settle(units=sold_units, status="VERIFIED")

    print(f"\n[DATA MASUK] Node: {node_id} | Suhu: {temp}C | Asap: {smoke} ppm | Api: {flame}")
    print(f"Signature : {sig[:18]}..." if len(sig) > 18 else f"Signature : {sig}")
    print(f"Status    : [{status}] -> {warning_reason}")
    print(f"Pasar     : {sold_units} / {TOTAL_BASELINE_UNITS} unit terjual ({econ['label']})")
    print(f"Gross     : Rp {econ['gross']:,}  |  Fee Sandbox (2%): Rp {econ['fee']:,}")
    print(
        f"Bagi Hasil: Komunitas (60%): Rp {econ['community']:,}  |  Pengelola (40%): Rp {econ['manager']:,}"
    )
    print("-" * 60)


def main():
    print("=" * 60)
    print(" EXCBONCP - UJI PIPELINE SENSOR WOKWI KE LOGIKA EKONOMI")
    print("=" * 60)

    # shortcut: supports both paho-mqtt v1 and v2 client initializations
    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    except AttributeError:
        client = mqtt.Client()

    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect(BROKER, PORT, keepalive=60)
        client.loop_forever()
    except KeyboardInterrupt:
        print("\n[STOP] Pipeline runner dihentikan.")
    except Exception as e:
        print(f"\n[ERROR] Koneksi terputus: {e}")


if __name__ == "__main__":
    main()
