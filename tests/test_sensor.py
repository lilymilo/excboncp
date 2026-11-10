"""Tests for sensor telemetry ingestion, signature verification, and anomaly evaluation (R1 / Model 3)."""

import pytest
from fastapi.testclient import TestClient

from server.database import get_db
from server.seed import seed_demo_data
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


def test_sensor_flag_triggered_on_fire_and_heat(
    test_client: TestClient, seeded_sensor_db: None
) -> None:
    device = "node-1"
    ts = "2026-11-10T10:25:00Z"
    flame = 1
    temp = 41.5
    sig = compute_wire_signature(device, ts, flame, temp)

    payload = {
        "device_id": device,
        "ts": ts,
        "temp_c": temp,
        "humidity_pct": 45.0,
        "flame": flame,
        "soil_raw": 1800,
        "soil_pct": 30.0,
        "source": "esp",
        "sig": sig,
    }
    resp = test_client.post("/api/sensor/readings", json=payload)
    assert resp.status_code == 201
    data = resp.json()

    assert data["sensor_flag"] is True
    assert len(data["warning_reasons"]) >= 2

    # Verify parcel transitioned to WARNING.
    summary_resp = test_client.get("/api/market/parcels/PARCEL-A/settlement")
    assert summary_resp.status_code == 200
    assert summary_resp.json()["current_status"] == "WARNING"


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
