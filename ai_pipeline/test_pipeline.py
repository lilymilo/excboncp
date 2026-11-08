import json
import unittest
from unittest.mock import patch

from ai_pipeline.gee_processor import fetch_satellite_data, initialize_gee
from ai_pipeline.mock_publisher import generate_payload
from ai_pipeline.mqtt_subscriber import (
    evaluate_anomaly,
    handle_telemetry_message,
    validate_telemetry,
)


class TestAIPipeline(unittest.TestCase):
    def setUp(self):
        self.sample_valid_payload = {
            "node_id": "ESP32-PHYSICAL-NODE-01",
            "timestamp": {
                "datetime": "2026-11-05 11:35:00",
                "iso8601": "2026-11-05T11:35:00+07:00",
                "timezone": "Asia/Jakarta",
                "timezone_abbr": "WIB",
                "utc_offset": "+07:00",
                "epoch": 1793853300,
            },
            "soil_moisture": 78.5,
            "temperature": 27.4,
            "flame_detected": False,
        }

    def test_validate_telemetry_dict(self):
        valid, parsed, err = validate_telemetry(self.sample_valid_payload)
        self.assertTrue(valid)
        self.assertIsNotNone(parsed)
        self.assertIsNone(err)
        self.assertEqual(parsed["node_id"], "ESP32-PHYSICAL-NODE-01")

    def test_validate_telemetry_bytes(self):
        raw_bytes = json.dumps(self.sample_valid_payload).encode("utf-8")
        valid, parsed, err = validate_telemetry(raw_bytes)
        self.assertTrue(valid)
        self.assertEqual(parsed["temperature"], 27.4)

    def test_validate_telemetry_invalid_json(self):
        valid, parsed, err = validate_telemetry(b"{corrupted_json: true,")
        self.assertFalse(valid)
        self.assertIsNone(parsed)
        self.assertIn("Invalid JSON format", err)

    def test_validate_telemetry_missing_field(self):
        bad_payload = {"node_id": "ESP32-01", "temperature": 25.0}
        valid, parsed, err = validate_telemetry(bad_payload)
        self.assertFalse(valid)
        self.assertIn("soil_moisture", err)

    def test_evaluate_anomaly_normal(self):
        has_anomaly, reasons = evaluate_anomaly(self.sample_valid_payload, temp_threshold=30.0)
        self.assertFalse(has_anomaly)
        self.assertEqual(len(reasons), 0)

    def test_evaluate_anomaly_high_temperature(self):
        payload = dict(self.sample_valid_payload)
        payload["temperature"] = 34.8
        has_anomaly, reasons = evaluate_anomaly(payload, temp_threshold=30.0)
        self.assertTrue(has_anomaly)
        self.assertEqual(len(reasons), 1)
        self.assertIn("High Temperature", reasons[0])

    def test_evaluate_anomaly_flame_detected(self):
        payload = dict(self.sample_valid_payload)
        payload["flame_detected"] = True
        has_anomaly, reasons = evaluate_anomaly(payload, temp_threshold=30.0)
        self.assertTrue(has_anomaly)
        self.assertEqual(len(reasons), 1)
        self.assertIn("Flame Detected", reasons[0])

    def test_evaluate_anomaly_both_conditions(self):
        payload = dict(self.sample_valid_payload)
        payload["temperature"] = 38.2
        payload["flame_detected"] = True
        has_anomaly, reasons = evaluate_anomaly(payload, temp_threshold=30.0)
        self.assertTrue(has_anomaly)
        self.assertEqual(len(reasons), 2)

    def test_handle_telemetry_normal(self):
        raw_bytes = json.dumps(self.sample_valid_payload).encode("utf-8")
        res = handle_telemetry_message(raw_bytes)
        self.assertEqual(res["status"], "normal")

    def test_handle_telemetry_anomaly_triggers_gee(self):
        payload = dict(self.sample_valid_payload)
        payload["temperature"] = 32.1
        payload["flame_detected"] = True
        raw_bytes = json.dumps(payload).encode("utf-8")

        res = handle_telemetry_message(raw_bytes)
        self.assertEqual(res["status"], "anomaly_triggered")
        self.assertEqual(res["land_status"], "WARNING")
        self.assertIn("satellite_verification", res)
        self.assertIn(res["satellite_verification"]["status"], ["simulated", "success", "cached"])

    def test_gee_fetch_satellite_data(self):
        initialize_gee()
        res = fetch_satellite_data(lat=-6.5971, lon=106.7994)
        self.assertIn(res["status"], ["simulated", "success", "cached"])
        self.assertIn("thumbnail_url", res)
        self.assertIn("image_id", res)


    def test_mock_publisher_payload_scenarios(self):
        normal_p = generate_payload("normal")
        self.assertFalse(normal_p["flame_detected"])
        self.assertLessEqual(normal_p["temperature"], 30.0)

        high_temp_p = generate_payload("high_temp")
        self.assertGreater(high_temp_p["temperature"], 30.0)

        fire_p = generate_payload("fire")
        self.assertTrue(fire_p["flame_detected"])
        self.assertGreater(fire_p["temperature"], 30.0)


if __name__ == "__main__":
    unittest.main()
