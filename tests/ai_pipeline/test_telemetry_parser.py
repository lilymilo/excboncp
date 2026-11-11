"""
Pytest suite for parse_and_analyze_telemetry and validate_telemetry.
Covers Wokwi schema, legacy schema, alias priority, fire_status logic,
and corrupt-payload resilience.
"""

import json
import sys
from pathlib import Path

import pytest

from ai_pipeline.gee_processor import generate_copernicus_browser_url
from ai_pipeline.mqtt_subscriber import (
    evaluate_sensor_flag,
    format_realtime_sync_log,
    format_telemetry_report,
    parse_and_analyze_telemetry,
    validate_telemetry,
)

# Ensure root repository is in sys.path
root_dir = Path(__file__).resolve().parents[2]
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

WOKWI_PAYLOAD = {
    "node_id": "ESP32-WOKWI-NODE-01",
    "device_id": "ESP32-WOKWI-NODE-01",
    "ts": "2026-11-10T20:25:22Z",
    "timestamp": {
        "datetime": "2026-11-10 20:25:22",
        "iso8601": "2026-11-10T20:25:22+07:00",
        "timezone": "Asia/Jakarta",
        "timezone_abbr": "WIB",
        "utc_offset": "+07:00",
        "epoch": 1794317122,
    },
    "lat": 52.37160,
    "lon": 4.88830,
    "fire_level": 0,
    "fire_status": "NORMAL",
    "soil_moisture": 76.3,
    "soil_pct": 76.3,
    "temperature": 25.6,
    "temp_c": 25.6,
    "humidity_pct": 40.0,
    "smoke": 25,
    "sound": 30,
    "flame": 0,
    "flame_detected": False,
    "source": "esp",
    "sig": "0x6f720491b408a47f15f065c3cbebe10013f7bb2eea4ecb4054596d46eec1a9d1",
}

LEGACY_PAYLOAD = {
    "node_id": "ESP32-PHYSICAL-NODE-01",
    "timestamp": {
        "datetime": "2026-11-05 11:35:00",
        "iso8601": "2026-11-05T11:35:00+07:00",
        "timezone": "Asia/Jakarta",
        "timezone_abbr": "WIB",
        "utc_offset": "+07:00",
        "epoch": 1793853300,
    },
    "latitude": -6.5971,
    "longitude": 106.7994,
    "soil_moisture": 78.5,
    "temperature": 27.4,
    "flame_detected": False,
}


# ---------------------------------------------------------------------------
# validate_telemetry tests
# ---------------------------------------------------------------------------


def test_validate_wokwi_payload():
    valid, parsed, err = validate_telemetry(WOKWI_PAYLOAD)
    assert valid, f"Expected valid, got error: {err}"
    assert parsed is not None
    assert err is None
    assert parsed["node_id"] == "ESP32-WOKWI-NODE-01"


def test_validate_legacy_payload():
    valid, parsed, err = validate_telemetry(LEGACY_PAYLOAD)
    assert valid, f"Expected valid, got error: {err}"
    assert parsed["node_id"] == "ESP32-PHYSICAL-NODE-01"


def test_validate_bytes_input():
    raw = json.dumps(WOKWI_PAYLOAD).encode("utf-8")
    valid, parsed, err = validate_telemetry(raw)
    assert valid
    assert parsed["node_id"] == "ESP32-WOKWI-NODE-01"


def test_validate_device_id_fallback():
    # Payload uses device_id only, no node_id
    p = {**WOKWI_PAYLOAD}
    del p["node_id"]
    p["device_id"] = "ESP32-DEVICE-ONLY"
    valid, parsed, err = validate_telemetry(p)
    assert valid
    assert parsed["node_id"] == "ESP32-DEVICE-ONLY"


def test_validate_flame_int_alias():
    # Wokwi sends flame as int, no flame_detected key
    p = {**WOKWI_PAYLOAD}
    del p["flame_detected"]
    p["flame"] = 0
    valid, parsed, err = validate_telemetry(p)
    assert valid
    assert parsed["flame_detected"] is False


def test_validate_corrupt_json():
    valid, parsed, err = validate_telemetry(b"{corrupted_json: true,")
    assert not valid
    assert parsed is None
    assert "Invalid JSON format" in err


def test_validate_missing_temperature():
    p = {k: v for k, v in WOKWI_PAYLOAD.items() if k not in ("temperature", "temp_c")}
    valid, parsed, err = validate_telemetry(p)
    assert not valid
    assert "temperature" in err.lower()


def test_validate_missing_soil():
    p = {k: v for k, v in WOKWI_PAYLOAD.items() if k not in ("soil_moisture", "soil_pct")}
    valid, parsed, err = validate_telemetry(p)
    assert not valid
    assert "soil" in err.lower()


# ---------------------------------------------------------------------------
# parse_and_analyze_telemetry tests
# ---------------------------------------------------------------------------


def test_parse_wokwi_full_extraction():
    result = parse_and_analyze_telemetry(WOKWI_PAYLOAD)
    assert result["lat"] == pytest.approx(52.37160, abs=1e-5)
    assert result["lon"] == pytest.approx(4.88830, abs=1e-5)
    assert result["temp"] == pytest.approx(25.6, abs=0.01)
    assert result["soil"] == pytest.approx(76.3, abs=0.01)
    assert result["fire_level"] == 0
    assert result["fire_status"] == "NORMAL"
    assert result["smoke"] == 25
    assert result["sound"] == 30
    assert result["humidity"] == pytest.approx(40.0, abs=0.01)
    assert result["flame_detected"] is False


def test_parse_timestamp_precision():
    result = parse_and_analyze_telemetry(WOKWI_PAYLOAD)
    assert result["dt_str"] == "2026-11-10 20:25:22"
    assert result["tz_name"] == "Asia/Jakarta"
    assert result["tz_abbr"] == "WIB"
    assert result["utc_offset"] == "+07:00"
    assert result["iso8601"] == "2026-11-10T20:25:22+07:00"


def test_parse_temp_c_takes_priority_over_temperature():
    p = {**WOKWI_PAYLOAD, "temp_c": 29.9, "temperature": 999.0}
    result = parse_and_analyze_telemetry(p)
    # temp_c wins when present
    assert result["temp"] == pytest.approx(29.9, abs=0.01)


def test_parse_soil_pct_takes_priority_over_soil_moisture():
    p = {**WOKWI_PAYLOAD, "soil_pct": 55.5, "soil_moisture": 999.0}
    result = parse_and_analyze_telemetry(p)
    assert result["soil"] == pytest.approx(55.5, abs=0.01)


def test_parse_lat_lon_from_wokwi_keys():
    # Must read lat/lon, not fall back to default Bogor coordinates
    result = parse_and_analyze_telemetry(WOKWI_PAYLOAD)
    assert result["lat"] != pytest.approx(-6.5971, abs=0.001)
    assert result["lon"] != pytest.approx(106.7994, abs=0.001)
    assert result["lat"] == pytest.approx(52.37160, abs=1e-5)
    assert result["lon"] == pytest.approx(4.88830, abs=1e-5)


def test_parse_lat_lon_from_legacy_keys():
    result = parse_and_analyze_telemetry(LEGACY_PAYLOAD)
    assert result["lat"] == pytest.approx(-6.5971, abs=1e-4)
    assert result["lon"] == pytest.approx(106.7994, abs=1e-4)


# ---------------------------------------------------------------------------
# fire_status logic tests
# ---------------------------------------------------------------------------


def test_fire_status_normal():
    p = {**WOKWI_PAYLOAD, "temp_c": 25.0, "smoke": 20, "fire_level": 0, "flame_detected": False}
    result = parse_and_analyze_telemetry(p)
    assert result["fire_status"] == "NORMAL"


def test_fire_status_warning_high_temp():
    # temp > 30.0 triggers WARNING
    p = {
        **WOKWI_PAYLOAD,
        "temp_c": 31.0,
        "temperature": 31.0,
        "smoke": 20,
        "fire_level": 0,
        "flame_detected": False,
    }
    result = parse_and_analyze_telemetry(p)
    assert result["fire_status"] == "WARNING"


def test_fire_status_warning_smoke():
    # smoke > 50 triggers WARNING
    p = {
        **WOKWI_PAYLOAD,
        "temp_c": 25.0,
        "temperature": 25.0,
        "smoke": 55,
        "fire_level": 0,
        "flame_detected": False,
    }
    result = parse_and_analyze_telemetry(p)
    assert result["fire_status"] == "WARNING"


def test_fire_status_critical_flame_detected():
    p = {
        **WOKWI_PAYLOAD,
        "temp_c": 25.0,
        "temperature": 25.0,
        "smoke": 20,
        "fire_level": 0,
        "flame_detected": True,
    }
    result = parse_and_analyze_telemetry(p)
    assert result["fire_status"] == "CRITICAL"


def test_fire_status_critical_fire_level():
    p = {
        **WOKWI_PAYLOAD,
        "temp_c": 25.0,
        "temperature": 25.0,
        "smoke": 20,
        "fire_level": 2,
        "flame_detected": False,
    }
    result = parse_and_analyze_telemetry(p)
    assert result["fire_status"] == "CRITICAL"


def test_fire_status_critical_high_temp():
    # temp > 35.0 triggers CRITICAL regardless of fire_level
    p = {
        **WOKWI_PAYLOAD,
        "temp_c": 36.0,
        "temperature": 36.0,
        "smoke": 10,
        "fire_level": 0,
        "flame_detected": False,
    }
    result = parse_and_analyze_telemetry(p)
    assert result["fire_status"] == "CRITICAL"


def test_fire_status_critical_wins_over_warning():
    # flame_detected overrides temp > 30.0 WARNING — still CRITICAL
    p = {
        **WOKWI_PAYLOAD,
        "temp_c": 31.0,
        "temperature": 31.0,
        "smoke": 55,
        "fire_level": 1,
        "flame_detected": True,
    }
    result = parse_and_analyze_telemetry(p)
    assert result["fire_status"] == "CRITICAL"


# ---------------------------------------------------------------------------
# evaluate_sensor_flag tests
# ---------------------------------------------------------------------------


def test_sensor_flag_normal():
    flag, reasons = evaluate_sensor_flag(WOKWI_PAYLOAD, temp_threshold=30.0)
    assert not flag
    assert reasons == []


def test_sensor_flag_high_temp():
    p = {**WOKWI_PAYLOAD, "temp_c": 33.0, "temperature": 33.0}
    flag, reasons = evaluate_sensor_flag(p, temp_threshold=30.0)
    assert flag
    assert any("High Temperature" in r for r in reasons)


def test_sensor_flag_smoke_elevated():
    p = {**WOKWI_PAYLOAD, "smoke": 75}
    flag, reasons = evaluate_sensor_flag(p, temp_threshold=30.0)
    assert flag
    assert any("Smoke" in r for r in reasons)


def test_sensor_flag_flame_detected():
    p = {**WOKWI_PAYLOAD, "flame_detected": True}
    flag, reasons = evaluate_sensor_flag(p, temp_threshold=30.0)
    assert flag
    assert any("Flame" in r for r in reasons)


def test_sensor_flag_fire_level_active():
    p = {**WOKWI_PAYLOAD, "fire_level": 2, "flame_detected": False}
    flag, reasons = evaluate_sensor_flag(p, temp_threshold=30.0)
    assert flag
    assert any("Fire Level" in r for r in reasons)


# ---------------------------------------------------------------------------
# format_telemetry_report tests (Enterprise specification)
# ---------------------------------------------------------------------------


def test_format_telemetry_report_enterprise_structure():
    parsed = parse_and_analyze_telemetry(WOKWI_PAYLOAD)
    report = format_telemetry_report(parsed, "VERIFIED", None)

    assert "[EXBONCP PIPELINE ENGINE] — TELEMETRY & SATELLITE VERIFICATION LOG" in report
    assert "> Target Node ID    : ESP32-WOKWI-NODE-01" in report
    assert "> Spatial Location  : Lat 52.37160, Lon 4.88830 (WGS84)" in report
    assert "> Environmental     : Temp: 25.6°C | Soil Moisture: 76.3% | Humidity: 40.0%" in report
    assert "> Hazard Metrics    : Fire Level: 0 | Status: NORMAL | Smoke: 25ppm" in report
    assert "> Temporal Data     : 2026-11-10 20:25:22 (Asia/Jakarta / WIB)" in report
    assert "> Deterministic Rule: Status Lahan -> VERIFIED (Evaluated by Code)" in report
    assert "> GEE Satellite Sync: [SUCCESS] Verified via COPERNICUS/S2_SR_HARMONIZED" in report


def test_format_telemetry_report_warning_with_satellite():
    parsed = parse_and_analyze_telemetry({**WOKWI_PAYLOAD, "temp_c": 35.5, "fire_level": 1})
    sat_res = {
        "status": "cached",
        "collection": "COPERNICUS/S2_SR_HARMONIZED",
        "image_id": "COPERNICUS/S2_SR_HARMONIZED/20261104T025901_20261104T030818_T48MYT",
    }
    report = format_telemetry_report(parsed, "WARNING", sat_res)

    assert "> Deterministic Rule: Status Lahan -> WARNING (Evaluated by Code)" in report
    assert "> GEE Satellite Sync: [SUCCESS] Verified via COPERNICUS/S2_SR_HARMONIZED" in report


# ---------------------------------------------------------------------------
# Real-time Sensor & GEE Sync formatting tests
# ---------------------------------------------------------------------------


def test_generate_copernicus_browser_url_amsterdam():
    url = generate_copernicus_browser_url(52.37160, 4.88830)
    assert (
        url
        == "https://browser.dataspace.copernicus.eu/?zoom=16&lat=52.37160&lng=4.88830&pin=52.37160,4.88830&theme=DEFAULT-THEME"
    )


def test_generate_copernicus_browser_url_negative_coordinates():
    url = generate_copernicus_browser_url(-6.59710, 106.79940)
    assert (
        url
        == "https://browser.dataspace.copernicus.eu/?zoom=16&lat=-6.59710&lng=106.79940&pin=-6.59710,106.79940&theme=DEFAULT-THEME"
    )


def test_format_realtime_sync_log():
    log = format_realtime_sync_log(
        node_id="ESP32-WOKWI-NODE-01",
        lat=52.37160,
        lon=4.88830,
        satellite_link="https://browser.dataspace.copernicus.eu/?zoom=16&lat=52.37160&lng=4.88830&pin=52.37160,4.88830&theme=DEFAULT-THEME",
    )
    assert "[EXBONCP PIPELINE ENGINE] — REAL-TIME SENSOR & GEE SYNC" in log
    assert "> Sensor Source ID  : ESP32-WOKWI-NODE-01" in log
    assert "> Real-Time Position: Latitude 52.37160, Longitude 4.88830 (WGS84 Verified)" in log
    assert "> Spatial Query     : GEE Point Geometry Set Successfully" in log
    assert (
        "> Satellite Link    : https://browser.dataspace.copernicus.eu/?zoom=16&lat=52.37160&lng=4.88830&pin=52.37160,4.88830&theme=DEFAULT-THEME"
        in log
    )
    assert "> Status            : [LIVE SYNC] 100% Aligned with Field Sensor Coordinates" in log


def test_parse_nested_coordinates():
    p = {
        **WOKWI_PAYLOAD,
        "lat": None,
        "lon": None,
        "coordinates": {"lat": 52.37160, "lon": 4.88830},
    }
    result = parse_and_analyze_telemetry(p)
    assert result["lat"] == pytest.approx(52.37160, abs=1e-5)
    assert result["lon"] == pytest.approx(4.88830, abs=1e-5)


def test_process_telemetry_alias():
    from ai_pipeline.mqtt_subscriber import process_telemetry

    res = process_telemetry(WOKWI_PAYLOAD)
    assert res["status"] in ("normal", "anomaly_triggered", "anomaly_gee_error")
    assert res["parsed"]["lat"] == pytest.approx(52.37160, abs=1e-5)


def test_mqtt_callbacks_defined():
    from unittest.mock import MagicMock

    from ai_pipeline.mqtt_subscriber import on_connect, on_disconnect, on_message

    client_mock = MagicMock()
    # Test on_connect doesn't raise
    on_connect(client_mock, None, None, 0)
    assert client_mock.subscribe.called

    # Test on_disconnect doesn't raise
    on_disconnect(client_mock, None, 0)

    # Test on_message with valid payload
    msg_mock = MagicMock()
    msg_mock.payload = json.dumps(WOKWI_PAYLOAD).encode("utf-8")
    on_message(client_mock, None, msg_mock)


def test_indonesia_jakarta_telemetry_coordinates():
    from ai_pipeline.mqtt_subscriber import process_telemetry

    payload = {
        **WOKWI_PAYLOAD,
        "lat": -6.2088,
        "lon": 106.8456,
    }
    res = process_telemetry(payload)
    assert res["parsed"]["lat"] == pytest.approx(-6.2088, abs=1e-4)
    assert res["parsed"]["lon"] == pytest.approx(106.8456, abs=1e-4)
    assert "lat=-6.20880" in res["satellite_link"]
    assert "lng=106.84560" in res["satellite_link"]
    assert "pin=-6.20880,106.84560" in res["satellite_link"]


def test_taman_koin_ipb_dramaga_telemetry_coordinates():
    from ai_pipeline.mqtt_subscriber import process_telemetry

    payload = {
        **WOKWI_PAYLOAD,
        "lat": -6.56020,
        "lon": 106.72862,
    }
    res = process_telemetry(payload)
    assert res["parsed"]["lat"] == pytest.approx(-6.56020, abs=1e-5)
    assert res["parsed"]["lon"] == pytest.approx(106.72862, abs=1e-5)
    assert "lat=-6.56020" in res["satellite_link"]
    assert "lng=106.72862" in res["satellite_link"]
    assert "pin=-6.56020,106.72862" in res["satellite_link"]
