"""Tests for ExcbonCP Carbon Market Simulation and Settlement Endpoints (R12 / Model 7)."""

import pytest
from fastapi.testclient import TestClient

from server.database import get_db
from server.market.service import calculate_co2e, calculate_settlement
from server.seed import seed_demo_data


@pytest.fixture()
async def seeded_market(test_client: TestClient) -> None:
    db = await get_db()
    await seed_demo_data(db, password="DemoPassword123!")


def test_calculate_co2e_formula() -> None:
    assert calculate_co2e(1.0, 142.5) == 142.5
    assert calculate_co2e(120.5) == 17171.25
    assert calculate_co2e(0.0) == 0.0

    with pytest.raises(ValueError):
        calculate_co2e(-10.0)


def test_calculate_settlement_distribution() -> None:
    res = calculate_settlement(units=1000, price_idr=40_000, status="VERIFIED")
    assert res.eligible is True
    assert res.units == 1000
    assert res.gross == 40_000_000
    assert res.fee == 800_000
    assert res.net == 39_200_000
    assert res.community == 23_520_000
    assert res.manager == 15_680_000
    assert res.label == "Simulasi, testnet"


def test_calculate_settlement_blocked_parcel() -> None:
    res = calculate_settlement(units=1000, status="BLOCKED")
    assert res.eligible is False
    assert res.units == 0
    assert res.gross == 0
    assert res.fee == 0
    assert res.net == 0
    assert res.community == 0
    assert res.manager == 0
    assert res.label == "Simulasi, testnet"


def test_get_parcel_settlement_verified(test_client: TestClient, seeded_market: None) -> None:
    resp = test_client.get("/api/market/parcels/PARCEL-A/settlement")
    assert resp.status_code == 200
    data = resp.json()

    assert data["parcel_id"] == "PARCEL-A"
    assert data["current_status"] == "VERIFIED"
    assert data["area_hectares"] == 120.5
    assert data["estimated_co2e_tons"] == 17171.25
    assert data["settlement"]["eligible"] is True
    assert data["settlement"]["gross"] > 0
    assert data["settlement"]["label"] == "Simulasi, testnet"


def test_get_parcel_settlement_blocked(test_client: TestClient, seeded_market: None) -> None:
    resp = test_client.get("/api/market/parcels/PARCEL-B/settlement")
    assert resp.status_code == 200
    data = resp.json()

    assert data["parcel_id"] == "PARCEL-B"
    assert data["current_status"] == "BLOCKED"
    assert data["settlement"]["eligible"] is False
    assert data["settlement"]["gross"] == 0
    assert data["settlement"]["label"] == "Simulasi, testnet"


def test_get_parcel_settlement_not_found(test_client: TestClient, seeded_market: None) -> None:
    resp = test_client.get("/api/market/parcels/NON-EXISTENT/settlement")
    assert resp.status_code == 404


def test_create_market_order_verified_parcel(test_client: TestClient, seeded_market: None) -> None:
    payload = {
        "parcel_id": "PARCEL-A",
        "seller_account": "pengelola_a",
        "buyer_account": "penerima_a",
        "credit_amount": 500.0,
        "simulated_price_idr": 40000.0,
        "zone_id": "ZONE-DEMO-A",
        "order_status": "LISTED",
    }
    resp = test_client.post("/api/market/orders", json=payload)
    assert resp.status_code == 201
    data = resp.json()

    assert data["parcel_id"] == "PARCEL-A"
    assert data["credit_amount"] == 500.0
    assert data["simulated_price_idr"] == 40000.0
    assert data["label"] == "Simulasi, testnet"
    assert data["settlement_breakdown"]["gross"] == 20_000_000
    assert data["settlement_breakdown"]["fee"] == 400_000
    assert data["settlement_breakdown"]["community"] == 11_760_000
    assert data["settlement_breakdown"]["manager"] == 7_840_000

    list_resp = test_client.get("/api/market/orders?parcel_id=PARCEL-A")
    assert list_resp.status_code == 200
    orders = list_resp.json()
    assert len(orders) >= 1
    assert any(o["id"] == data["id"] for o in orders)


def test_create_market_order_blocked_parcel_rejected(
    test_client: TestClient, seeded_market: None
) -> None:
    payload = {
        "parcel_id": "PARCEL-B",
        "seller_account": "pengelola_b",
        "credit_amount": 100.0,
        "simulated_price_idr": 40000.0,
        "order_status": "LISTED",
    }
    resp = test_client.post("/api/market/orders", json=payload)
    assert resp.status_code == 400
    assert "Hanya lahan berstatus VERIFIED" in resp.json()["detail"]


def test_get_zone_report_success(test_client: TestClient, seeded_market: None) -> None:
    payload = {
        "parcel_id": "PARCEL-A",
        "seller_account": "pengelola_a",
        "buyer_account": "penerima_a",
        "credit_amount": 250.0,
        "simulated_price_idr": 40000.0,
        "zone_id": "ZONE-DEMO-A",
        "order_status": "COMPLETED",
    }
    test_client.post("/api/market/orders", json=payload)

    resp1 = test_client.get("/zones/ZONE-DEMO-A/report")
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["zone_id"] == "ZONE-DEMO-A"
    assert data1["zone_type"] == "kek"
    assert data1["total_allocated_units"] >= 250.0
    assert data1["order_count"] >= 1
    assert data1["label"] == "Simulasi, testnet"

    resp2 = test_client.get("/api/zones/ZONE-DEMO-A/report")
    assert resp2.status_code == 200
    assert resp2.json()["zone_id"] == "ZONE-DEMO-A"


def test_get_zone_report_not_found(test_client: TestClient, seeded_market: None) -> None:
    resp = test_client.get("/zones/NON-EXISTENT-ZONE/report")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()
