"""HTTP-level tests for the Day 3 blockchain endpoints."""

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

AUDITOR_PASSWORD = "AuditorPass123!"
MEMBER_PASSWORD = "MemberPass123!"

PAYLOAD: dict[str, Any] = {
    "parcel_id": "PARCEL-A",
    "timestamp": "2026-11-12T12:00:00Z",
    "co2e_t": 142.85,
    "status": "VERIFIED",
    "sensor_summary": {"avg_temp_c": 24.2, "avg_humidity_pct": 82.5, "avg_soil_pct": 57.1},
    "ndvi_mean": 0.76,
}


def _seed_api_database(db_path: Path) -> None:
    """Insert one parcel, an auditor, a member, and one valid ledger block."""
    canonical = canonical_json(PAYLOAD)
    block_hash = compute_hash(GENESIS_HASH, canonical)
    now = "2026-11-12T12:00:00Z"

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute(
            "INSERT INTO parcels (id, name, polygon_geojson, area_hectares, vegetation_type, "
            "baseline_ndvi, current_status, owner_wallet, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "PARCEL-A",
                "Lahan Demo A",
                "{}",
                120.5,
                "forest",
                0.78,
                "VERIFIED",
                "0x0000000000000000000000000000000000000000",
                now,
            ),
        )
        connection.execute(
            "INSERT INTO users (id, username, password_hash, display_name, role, is_active, "
            "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "usr-auditor-api",
                "auditor_demo",
                hash_password(AUDITOR_PASSWORD),
                "Auditor Demo",
                "auditor",
                1,
                now,
                now,
            ),
        )
        connection.execute(
            "INSERT INTO users (id, username, password_hash, display_name, role, is_active, "
            "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                "usr-member-api",
                "member_demo",
                hash_password(MEMBER_PASSWORD),
                "Member Demo",
                "member",
                1,
                now,
                now,
            ),
        )
        connection.execute(
            "INSERT INTO ledger_blocks (parcel_id, timestamp, co2e_metric_tons, parcel_status, "
            "prev_hash, current_hash, canonical_data, approved_by, eas_uid) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                PAYLOAD["parcel_id"],
                PAYLOAD["timestamp"],
                PAYLOAD["co2e_t"],
                PAYLOAD["status"],
                GENESIS_HASH,
                block_hash,
                canonical,
                "usr-auditor-api",
                None,
            ),
        )
        connection.commit()


def _login(client: TestClient, username: str, password: str) -> dict[str, str]:
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture()
def blockchain_client(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> Generator[Any, None, None]:
    """Run the app against a temporary file database with seeded blockchain data."""
    import server.database as database
    from server.config import settings
    from server.main import app

    db_path = tmp_path / f"blockchain-{uuid.uuid4().hex}.db"
    monkeypatch.setattr(database, "settings", replace(settings, DATABASE_URL=str(db_path)))

    with TestClient(app) as client:
        _seed_api_database(db_path)
        yield client, db_path


def test_simulation_status_is_public(blockchain_client: Any) -> None:
    client, _ = blockchain_client
    response = client.get("/blockchain/simulation-status")
    assert response.status_code == 200
    data = response.json()
    assert data["simulation_mode"] is True
    assert data["chain_id"] == 84532
    assert "Simulation mode" in data["message"]


def test_schema_registration_requires_authentication(blockchain_client: Any) -> None:
    client, _ = blockchain_client
    response = client.post("/blockchain/register-schema")
    assert response.status_code == 401


def test_full_attestation_flow(blockchain_client: Any) -> None:
    """Register the schema, anchor block 1, then query status and the list."""
    client, db_path = blockchain_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    schema = client.post("/blockchain/register-schema", headers=headers)
    assert schema.status_code == 200, schema.text
    assert schema.json()["registered"] is True
    assert schema.json()["schema_id"].startswith("0x")

    attest = client.post("/blockchain/attest/1", headers=headers)
    assert attest.status_code == 200, attest.text
    body = attest.json()
    assert body["success"] is True
    assert body["on_chain"] is False
    assert body["eas_attestation_uid"].startswith("0x")
    assert len(body["eas_attestation_uid"]) == 66

    status = client.get("/blockchain/status/1", headers=headers)
    assert status.status_code == 200
    assert status.json()["attested"] == "true"
    assert status.json()["eas_uid"] == body["eas_attestation_uid"]

    listed = client.get("/blockchain/attestations", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1
    assert listed.json()[0]["block_index"] == 1

    with closing(sqlite3.connect(db_path)) as connection:
        row = connection.execute(
            "SELECT eas_uid FROM ledger_blocks WHERE block_index = 1"
        ).fetchone()
    assert row[0] == body["eas_attestation_uid"]


def test_double_attestation_returns_conflict(blockchain_client: Any) -> None:
    client, _ = blockchain_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    assert client.post("/blockchain/attest/1", headers=headers).status_code == 200
    second = client.post("/blockchain/attest/1", headers=headers)
    assert second.status_code == 409


def test_non_auditor_cannot_attest(blockchain_client: Any) -> None:
    client, _ = blockchain_client
    headers = _login(client, "member_demo", MEMBER_PASSWORD)

    response = client.post("/blockchain/attest/1", headers=headers)
    assert response.status_code == 403


def test_attest_rejects_identity_mismatch(blockchain_client: Any) -> None:
    client, _ = blockchain_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    response = client.post("/blockchain/attest/1?auditor_username=someone_else", headers=headers)
    assert response.status_code == 403


def test_attest_missing_block_returns_404(blockchain_client: Any) -> None:
    client, _ = blockchain_client
    headers = _login(client, "auditor_demo", AUDITOR_PASSWORD)

    response = client.post("/blockchain/attest/999", headers=headers)
    assert response.status_code == 404
