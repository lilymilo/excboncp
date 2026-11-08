"""Fallback MQTT sensor simulator for demo continuity when ESP32 is unavailable."""

import argparse
import hashlib
import json
import os
import sys
import time

BROKER_DEFAULT = os.getenv("MQTT_BROKER", "broker.emqx.io")
PORT_DEFAULT = int(os.getenv("MQTT_PORT", 1883))
TOPIC_DEFAULT = os.getenv("MQTT_TOPIC", "CbonCP/node-1/telemetry")
SENSOR_SECRET = os.getenv("SENSOR_SECRET", "cboncp-shared-device-secret")
NODE_ID = os.getenv("NODE_ID", "ESP32-MOCK-FALLBACK-01")


def generate_payload(mode: str) -> dict:
    now = time.time()
    ts = int(now)
    is_smoke = mode == "smoke"

    soil_moisture = 42.5 if is_smoke else 78.5
    temp_c = 38.5 if is_smoke else 27.4
    smoke = 500 if is_smoke else 25
    sound = 75 if is_smoke else 30
    flame = is_smoke

    # shortcut: signature concatenation matches ESP32 sketch.ino computeSignature format
    sig_raw = f"{NODE_ID}|{ts}|{smoke}|{temp_c:.1f}|{sound}{SENSOR_SECRET}"
    sig = "0x" + hashlib.sha256(sig_raw.encode("utf-8")).hexdigest()

    time_struct = time.localtime(now)
    datetime_str = time.strftime("%Y-%m-%d %H:%M:%S", time_struct)
    iso_str = time.strftime("%Y-%m-%dT%H:%M:%S+07:00", time_struct)

    return {
        "node_id": NODE_ID,
        "device_id": NODE_ID,
        "ts": ts,
        "timestamp": {
            "datetime": datetime_str,
            "iso8601": iso_str,
            "timezone": "Asia/Jakarta",
            "timezone_abbr": "WIB",
            "utc_offset": "+07:00",
            "epoch": ts,
        },
        "soil_moisture": soil_moisture,
        "temperature": temp_c,
        "temp_c": temp_c,
        "smoke": smoke,
        "sound": sound,
        "flame_detected": flame,
        "sig": sig,
    }


def main():
    parser = argparse.ArgumentParser(description="Mock sensor publisher for CbonCP MQTT fallback")
    parser.add_argument("--mode", choices=["normal", "smoke", "loop"], default="normal", help="Simulation mode")
    parser.add_argument("--broker", default=BROKER_DEFAULT, help="MQTT broker address")
    parser.add_argument("--port", type=int, default=PORT_DEFAULT, help="MQTT broker port")
    parser.add_argument("--topic", default=TOPIC_DEFAULT, help="MQTT topic")
    parser.add_argument("--interval", type=int, default=5, help="Loop interval in seconds")
    args = parser.parse_args()

    import paho.mqtt.client as mqtt

    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    except AttributeError:
        client = mqtt.Client()

    client.connect(args.broker, args.port, keepalive=60)

    if args.mode in ("normal", "smoke"):
        payload = generate_payload(args.mode)
        raw = json.dumps(payload)
        client.publish(args.topic, raw)
        print(f"[{args.mode.upper()}] Published to {args.topic} on {args.broker}:\n{raw}")
    else:
        print(f"[LOOP] Publishing every {args.interval}s to {args.topic}. Press Ctrl+C to stop.")
        try:
            while True:
                payload = generate_payload("normal")
                client.publish(args.topic, json.dumps(payload))
                print(f"[{payload['timestamp']['datetime']}] Published normal sample.")
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\nStopped.")

    client.disconnect()


if __name__ == "__main__":
    main()
