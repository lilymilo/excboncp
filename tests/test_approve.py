"""
Tests for Day 4 Auditor Approval (POST /approve, GET /approvals — R10, Diagram 8C)
and cross-module route compatibility.
"""

from __future__ import annotations

import sqlite3
import uuid
from collections.abc import Generator
from contextlib import closing
from dataclasses import replace
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from server.auth.service import hash_password
from server.ledger.service import GENESIS_HASH, canonical_json, compute_hash
from src.blockchain.eas import EasClient
from src.blockchain.router import _eas_dependency

AUDITOR_PASSWORD = "AuditorPass123!"
COMMUNITY_PASSWORD = "CommunityPass123!"

INITIAL_PAYLOAD: dict[str, Any] = {
    "parcel_id": "PARCEL-A",
    "timestamp": "2026-11-12T12:00:00Z",
    "co2e_t": 142.85,
    "status": "VERIFIED",
    "sensor_summary": {"avg_temp_c": 24.2, "avg_humidity_pct": 82.5, "avg_soil_pct": 57.1},
    "ndvi_mean": 0.78,
}


def _seed_approve_database(db_path: Path) -> None:
    """Seed PARCEL-A (VERIFIED), PARCEL-B (BLOCKED), an auditor, a community member, and 1 block."""
    canonical = canonical_json(INITIAL_PAYLOAD)
    block_hash = compute_hash(GENESIS_HASH, canonical)
    now = "2026-11-12T12:00:00Z"

    with closing(sqlite3.connect(db_path)) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute(
            "INSERT INTO parcels (id, name, polygon_geojson, area_hectares, vegetation_type, "
            "baseline_ndvi, current_status, owner_wallet, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "PARCEL-A",
                "Long Isun — Blok Hutan Adat Utara (Simulasi)",
                "{}",
                1.0,
                "tropical_rainforest",
                0.78,
                "VERIFIED",
                "0x848854FcE3BB804AaB66eE6159d9E6E9c39d65c3",
                now,
            ),
        )
        conn.execute(
            "INSERT INTO parcels (id, name, polygon_geojson, area_hectares, vegetation_type, "
            "baseline_ndvi, current_status, owner_wallet, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "PARCEL-B",
                "Long Isun — Blok Hutan Adat Selatan (Simulasi)",
                "{}",
                1.0,
                "tropical_rainforest",
                0.72,
                "BLOCKED",
                "0x848854FcE3BB804AaB66eE6159d9E6E9c39d65c3",
                now,
            ),
        )
        conn.execute(
            "INSERT INTO status_results (id, parcel_id, status, reasons, rule_version, "
            "sensor_flag, consent_state, dispute_open, computed_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "sr-parcel-a",
                "PARCEL-A",
                "VERIFIED",
                '["Community consent is granted", "No sensor flag"]',
                "status-v1",
                0,
                "granted",
                0,
                now,
            ),
        )
        conn.execute(
            "INSERT INTO status_results (id, parcel_id, status, reasons, rule_version, "
            "sensor_flag, consent_state, dispute_open, computed_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "sr-parcel-b",
                "PARCEL-B",
                "BLOCKED",
                '["Community consent is missing"]',
                "status-v1",
                0,
                "none",
                0,
                now,
            ),
        )
        conn.execute(
            "INSERT INTO users (id, username, password_hash, display_name, role, is_active, "
            "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "usr-auditor-approve",
                "auditor_demo",
                hash_password(AUDITOR_PASSWORD),
                "Auditor Demo",
                "auditor",
                1,
                now,
                now,
            ),
        )
        conn.execute(
            "INSERT INTO users (id, username, password_hash, display_name, role, is_active, "
            "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "usr-community-approve",
                "komunitas_demo",
                hash_password(COMMUNITY_PASSWORD),
                "Komunitas Demo",
                "member",
                1,
                now,
                now,
            ),
        )
        conn.execute(
            "INSERT INTO ledger_blocks (parcel_id, timestamp, co2e_metric_tons, parcel_status, "
            "prev_hash, current_hash, canonical_data, approved_by, eas_uid) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                INITIAL_PAYLOAD["parcel_id"],
                INITIAL_PAYLOAD["timestamp"],
                INITIAL_PAYLOAD["co2e_t"],
                INITIAL_PAYLOAD["status"],
                GENESIS_HASH,
                block_hash,
                canonical,
                "usr-auditor-approve",
                None,
            ),
        )
        conn.commit()


def _login(client: TestClient, username: str, password: str) -> dict[str, str]:
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture()
def approve_client(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> Generator[tuple[TestClient, Path], None, None]:
    """Run the app against a temporary file database with simulated EAS."""
    import server.database as database
    import src.blockchain.service as bc_service
    from server.config import settings
    from server.main import app

    db_path = tmp_path / f"approve-{uuid.uuid4().hex}.db"
    monkeypatch.setattr(database, "settings", replace(settings, DATABASE_URL=str(db_path)))
    sim_client = EasClient(private_key=None)
    monkeypatch.setattr(bc_service, "get_eas_client", lambda: sim_client)
    app.dependency_overrides[_eas_dependency] = lambda: sim_client

    with TestClient(app) as client:
        _seed_approve_database(db_path)
        yield client, db_path

    app.dependency_overrides.clear()


def test_approve_verified_parcel_creates_ledger_block_and_anchors(
    approve_client: tuple[TestClient, Path],
) -> None:
    """Auditor approving PARCEL-A appends a hash-chain block, records approved_by, and anchors to EAS."""
    client, db_path = approve_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    resp = client.post(
        "/approve",
        json={"parcel_id": "PARCEL-A", "notes": "Bukti lapangan dan satelit lengkap"},
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()

    assert body["parcel_id"] == "PARCEL-A"
    assert body["status"] == "VERIFIED"
    assert body["approved_by"] == "auditor_demo"
    assert body["eas_uid"] is not None
    assert body["anchoring_status"] in ("simulated", "anchored")
    assert body["label"] == "Simulasi, testnet"
    assert body["payload"]["notes"] == "Bukti lapangan dan satelit lengkap"

    # Public verification endpoint confirms the newly approved block
    verify_resp = client.get(f"/verify/{body['id']}")
    assert verify_resp.status_code == 200
    vbody = verify_resp.json()
    assert vbody["valid"] is True
    assert vbody["approved_by"] == "auditor_demo"
    assert vbody["eas_uid"] == body["eas_uid"]

    with closing(sqlite3.connect(db_path)) as conn:
        row = conn.execute(
            "SELECT action, resource_id FROM audit_logs WHERE action = 'parcel_approved' ORDER BY created_at DESC LIMIT 1"
        ).fetchone()
        assert row is not None
        assert row[1] == str(body["id"])


def test_approve_accepts_shared_schema_alias(
    approve_client: tuple[TestClient, Path],
) -> None:
    """Approving via the shared-schema alias CBONCP-SRNPPI-JBR-01 resolves to PARCEL-A."""
    client, _ = approve_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    resp = client.post(
        "/approve",
        json={"parcel_id": "CBONCP-SRNPPI-JBR-01", "co2e_t": 142.5},
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["parcel_id"] == "PARCEL-A"
    assert body["co2e_t"] == 142.5


def test_approve_rejects_blocked_parcel_without_writing_ledger(
    approve_client: tuple[TestClient, Path],
) -> None:
    """Diagram 8C: Approving a BLOCKED parcel is rejected (409) and writes no ledger entry."""
    client, db_path = approve_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    with closing(sqlite3.connect(db_path)) as conn:
        before_cnt = conn.execute("SELECT COUNT(*) FROM ledger_blocks").fetchone()[0]

    resp = client.post(
        "/approve",
        json={"parcel_id": "PARCEL-B"},
        headers=headers,
    )
    assert resp.status_code == 409
    assert "BLOCKED" in resp.json()["detail"]

    with closing(sqlite3.connect(db_path)) as conn:
        after_cnt = conn.execute("SELECT COUNT(*) FROM ledger_blocks").fetchone()[0]
    assert after_cnt == before_cnt


def test_approve_rejects_dispute_parcel(
    approve_client: tuple[TestClient, Path],
) -> None:
    """Diagram 8C: Approving a DISPUTE parcel is rejected (409)."""
    client, db_path = approve_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    with closing(sqlite3.connect(db_path)) as conn:
        conn.execute(
            "INSERT INTO status_results (id, parcel_id, status, reasons, rule_version, "
            "sensor_flag, consent_state, dispute_open, computed_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "sr-dispute-test",
                "PARCEL-A",
                "DISPUTE",
                '["Open dispute filed"]',
                "status-v1",
                0,
                "granted",
                1,
                "2099-01-01T00:00:00Z",
            ),
        )
        conn.commit()

    resp = client.post(
        "/approve",
        json={"parcel_id": "PARCEL-A"},
        headers=headers,
    )
    assert resp.status_code == 409
    assert "DISPUTE" in resp.json()["detail"]


def test_approve_rejects_community_and_guest_roles(
    approve_client: tuple[TestClient, Path],
) -> None:
    """Blueprint L978 security gate: non-auditor accounts and guests cannot call POST /approve."""
    client, _ = approve_client
    community_headers = _login(client, "komunitas_demo", COMMUNITY_PASSWORD)

    guest_resp = client.post("/approve", json={"parcel_id": "PARCEL-A"})
    assert guest_resp.status_code == 401

    comm_resp = client.post(
        "/approve",
        json={"parcel_id": "PARCEL-A"},
        headers=community_headers,
    )
    assert comm_resp.status_code == 403


def test_approve_keeps_ledger_entry_when_eas_fails(
    approve_client: tuple[TestClient, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Diagram 8C step H: If EAS fails, the ledger entry remains saved with eas_uid=None ('pending')."""
    client, _ = approve_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    async def _failing_anchor(*args: Any, **kwargs: Any) -> Any:
        raise RuntimeError("Simulated RPC timeout")

    import src.blockchain.service as bc_service_module

    monkeypatch.setattr(bc_service_module, "anchor_block_to_eas", _failing_anchor)

    resp = client.post(
        "/approve",
        json={"parcel_id": "PARCEL-A"},
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["eas_uid"] is None
    assert body["anchoring_status"] == "pending"
    assert "Coba lagi" in body["message"]

    verify_resp = client.get(f"/verify/{body['id']}")
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True


def test_get_approvals_and_blueprint_market_alias(
    approve_client: tuple[TestClient, Path],
) -> None:
    """GET /approvals returns approval history and GET /market/{id} works per Blueprint L4."""
    client, _ = approve_client

    approvals_resp = client.get("/approvals")
    assert approvals_resp.status_code == 200
    items = approvals_resp.json()
    assert len(items) >= 1
    assert items[0]["label"] == "Simulasi, testnet"

    market_resp = client.get("/market/PARCEL-A")
    assert market_resp.status_code == 200
    mbody = market_resp.json()
    assert mbody["parcel_id"] == "PARCEL-A"
    assert mbody["settlement"]["eligible"] is True


def test_retry_approve_anchoring_succeeds_for_pending_block(
    approve_client: tuple[TestClient, Path],
) -> None:
    """Diagram 8C 'Coba lagi': POST /approve/{block_index}/retry anchors a pending block."""
    client, _ = approve_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    create_resp = client.post(
        "/approve",
        json={"parcel_id": "PARCEL-A", "anchor_to_eas": False},
        headers=headers,
    )
    assert create_resp.status_code == 201
    pending_block_id = create_resp.json()["id"]
    assert create_resp.json()["anchoring_status"] in ("pending", "skipped")

    retry_resp = client.post(f"/approve/{pending_block_id}/retry", headers=headers)
    assert retry_resp.status_code == 200, retry_resp.text
    rbody = retry_resp.json()
    assert rbody["id"] == pending_block_id
    assert rbody["eas_uid"] is not None
    assert rbody["anchoring_status"] in ("simulated", "anchored")

    dup_resp = client.post(f"/approve/{pending_block_id}/retry", headers=headers)
    assert dup_resp.status_code == 409
