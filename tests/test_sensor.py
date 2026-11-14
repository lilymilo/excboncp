"""Tests for sensor telemetry ingestion, signature verification, and anomaly evaluation (R1 / Model 3)."""

import pytest
from fastapi.testclient import TestClient

from server.database import get_db
from server.seed import seed_demo_data
from server.sensor.service import evaluate_fire_level, resolve_sensor_flag
from server.sensor.signature import compute_wire_signature, verify_telemetry_signature


@pytest.fixture()
async def seeded_sensor_db(test_client: TestClient) -> None:
    db = await get_db()
    await seed_demo_data(db, password="DemoPassword123!")


def test_signature_verification_cases() -> None:
    device = "esp-01"
    ts = "2026-11-10T10:00:00Z"
    flame = 0
    temp = 27.5
    valid_sig = compute_wire_signature(device, ts, flame, temp)

    # Valid wire signature passes.
    assert (
        verify_telemetry_signature(device_id=device, ts=ts, flame=flame, temp_c=temp, sig=valid_sig)
        is True
    )

    # Tampered temperature fails.
    assert (
        verify_telemetry_signature(device_id=device, ts=ts, flame=flame, temp_c=35.0, sig=valid_sig)
        is False
    )

    # Fake signature string fails.
    assert (
        verify_telemetry_signature(
            device_id=device, ts=ts, flame=flame, temp_c=temp, sig="0xdeadbeef1234"
        )
        is False
    )

    # Simulator with null signature is explicitly allowed per Model 3 contract.
    assert (
        verify_telemetry_signature(
            device_id=device,
            ts=ts,
            flame=flame,
            temp_c=temp,
            sig=None,
            source="simulator",
        )
        is True
    )

    # Hardware ESP reading without signature is rejected.
    assert (
        verify_telemetry_signature(
            device_id=device, ts=ts, flame=flame, temp_c=temp, sig=None, source="esp"
        )
        is False
    )


def test_ingest_valid_sensor_reading(test_client: TestClient, seeded_sensor_db: None) -> None:
    device = "sim-esp-a-01"
    ts = "2026-11-10T10:15:00Z"
    flame = 0
    temp = 24.5
    sig = compute_wire_signature(device, ts, flame, temp)

    payload = {
        "device_id": device,
        "ts": ts,
        "temp_c": temp,
        "humidity_pct": 78.5,
        "flame": flame,
        "soil_raw": 2200,
        "soil_pct": 62.0,
        "source": "esp",
        "sig": sig,
    }
    resp = test_client.post("/api/sensor/readings", json=payload)
    assert resp.status_code == 201
    data = resp.json()

    assert data["parcel_id"] == "PARCEL-A"
    assert data["device_id"] == device
    assert data["temp_c"] == 24.5
    assert data["sensor_flag"] is False
    assert len(data["warning_reasons"]) == 0


def test_reject_tampered_signature(test_client: TestClient, seeded_sensor_db: None) -> None:
    payload = {
        "device_id": "sim-esp-a-01",
        "ts": "2026-11-10T10:15:00Z",
        "temp_c": 24.5,
        "humidity_pct": 78.5,
        "flame": 0,
        "soil_raw": 2200,
        "soil_pct": 62.0,
        "source": "esp",
        "sig": "0xforgedsignaturebadhash123456",
    }
    resp = test_client.post("/api/sensor/readings", json=payload)
    assert resp.status_code == 400
    assert "Verifikasi signature gagal" in resp.json()["detail"]


def test_accept_simulator_null_signature(test_client: TestClient, seeded_sensor_db: None) -> None:
    payload = {
        "device_id": "sim-esp-a-01",
        "ts": "2026-11-10T10:20:00Z",
        "temp_c": 26.0,
        "humidity_pct": 75.0,
        "flame": 0,
        "soil_raw": 2150,
        "soil_pct": 65.0,
        "source": "simulator",
        "sig": None,
    }
    resp = test_client.post("/api/sensor/readings", json=payload)
    assert resp.status_code == 201
    assert resp.json()["parcel_id"] == "PARCEL-A"


def _post_reading(
    client: TestClient, ts: str, temp: float, flame: int, soil: float = 55.0, **extra: object
) -> dict:
    device = "node-1"
    payload = {
        "device_id": device,
        "ts": ts,
        "temp_c": temp,
        "humidity_pct": 45.0,
        "flame": flame,
        "soil_raw": 1800,
        "soil_pct": soil,
        "source": "esp",
        "sig": compute_wire_signature(device, ts, flame, temp),
        **extra,
    }
    resp = client.post("/api/sensor/readings", json=payload)
    assert resp.status_code == 201
    return resp.json()


def test_fire_level_matrix() -> None:
    # Cool temperatures (< 35°C) are always NORMAL even with dry soil.
    assert evaluate_fire_level(24.0, 0, 10.0, [])[0] == 0
    assert evaluate_fire_level(27.0, 0, 60.0, [])[0] == 0

    # WASPADA triggers when heat (>= 35°C) meets dry soil (< 50%), or on scorching heat (>= 42°C).
    assert evaluate_fire_level(38.0, 0, 30.0, [])[0] == 1
    assert evaluate_fire_level(43.0, 0, 60.0, [])[0] == 1
    # Wet soil absorbs warm heat (36°C with 60% soil remains NORMAL).
    assert evaluate_fire_level(36.0, 0, 60.0, [])[0] == 0

    # SIAGA triggers on high heat with arid soil, pre-fire thermal, or single flame flicker.
    assert evaluate_fire_level(50.0, 0, 15.0, [])[0] == 2
    assert evaluate_fire_level(56.0, 0, 60.0, [])[0] == 2
    assert evaluate_fire_level(27.0, 1, 60.0, [])[0] == 2
    assert evaluate_fire_level(27.0, 1, 60.0, [1])[0] == 2

    # BAHAYA triggers on 3 consecutive flames or actual fire combustion temperature (>= 65°C).
    assert evaluate_fire_level(27.0, 1, 60.0, [1, 1])[0] == 3
    assert evaluate_fire_level(66.0, 0, 60.0, [])[0] == 3


def test_sensor_flag_clears_after_ten_normal_readings() -> None:
    assert resolve_sensor_flag(0, True, [0] * 8) is True  # only 9 normal in a row
    assert resolve_sensor_flag(0, True, [0] * 9) is False
    assert resolve_sensor_flag(1, True, [0] * 9) is True
    assert resolve_sensor_flag(2, False, [0] * 9) is False


def test_fire_needs_three_consecutive_flames(
    test_client: TestClient, seeded_sensor_db: None
) -> None:
    first = _post_reading(test_client, "2026-11-10T10:25:00Z", 41.5, 1)
    assert first["fire_level"] == 2
    assert first["fire_status"] == "SIAGA"
    assert first["sensor_flag"] is False

    _post_reading(test_client, "2026-11-10T10:25:05Z", 41.5, 1)
    third = _post_reading(test_client, "2026-11-10T10:25:10Z", 41.5, 1)
    assert third["fire_level"] == 3
    assert third["fire_status"] == "BAHAYA"
    assert third["sensor_flag"] is True
    assert len(third["warning_reasons"]) >= 1

    # Verify parcel transitioned to WARNING.
    summary_resp = test_client.get("/api/market/parcels/PARCEL-A/settlement")
    assert summary_resp.status_code == 200
    assert summary_resp.json()["current_status"] == "WARNING"


def test_location_is_stored_or_falls_back_to_parcel_centroid(
    test_client: TestClient, seeded_sensor_db: None
) -> None:
    sent = _post_reading(test_client, "2026-11-10T11:00:00Z", 27.0, 0, lat=-6.2, lon=106.8)
    assert (sent["lat"], sent["lon"]) == (-6.2, 106.8)

    fallback = _post_reading(test_client, "2026-11-10T11:00:05Z", 27.0, 0)
    assert fallback["lat"] == pytest.approx(-6.5982)
    assert fallback["lon"] == pytest.approx(106.7928)


def test_market_alias_route(test_client: TestClient, seeded_sensor_db: None) -> None:
    resp = test_client.get("/api/market/PARCEL-A")
    assert resp.status_code == 200
    assert resp.json()["parcel_id"] == "PARCEL-A"


def test_reject_unregistered_device(test_client: TestClient, seeded_sensor_db: None) -> None:
    payload = {
        "device_id": "rogue-unregistered-node-99",
        "ts": "2026-11-10T10:30:00Z",
        "temp_c": 25.0,
        "humidity_pct": 80.0,
        "flame": 0,
        "soil_raw": 2200,
        "soil_pct": 60.0,
        "source": "simulator",
        "sig": None,
    }
    resp = test_client.post("/api/sensor/readings", json=payload)
    assert resp.status_code == 400
    assert "tidak terdaftar" in resp.json()["detail"]


def test_list_and_summary_sensor_readings(test_client: TestClient, seeded_sensor_db: None) -> None:
    list_resp = test_client.get("/api/sensor/readings?parcel_id=PARCEL-A&limit=10")
    assert list_resp.status_code == 200
    readings = list_resp.json()
    assert len(readings) >= 1

    summary_resp = test_client.get("/api/sensor/summary/PARCEL-A")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["parcel_id"] == "PARCEL-A"
    assert summary["sample_count"] >= 1
    assert summary["avg_temp_c"] > 0
