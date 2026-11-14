"""
Tests for the SHA-256 hash-chain ledger and the public verification endpoint.

These tests protect Blueprint v5 requirements R8 (tamper-evident hash chain) and
R13's data side (``GET /verify/{id}``): the stored hash must be reproducible,
the chain must link correctly, and editing one row must make verification fail.
"""

from __future__ import annotations

import sqlite3
from contextlib import closing
from dataclasses import replace
from typing import Any

import aiosqlite
import pytest
from fastapi.testclient import TestClient

from server.ledger.service import (
    GENESIS_HASH,
    LedgerValidationError,
    append_block,
    canonical_json,
    compute_hash,
    verify_block,
    verify_chain,
)

PAYLOAD: dict[str, Any] = {
    "parcel_id": "PARCEL-A",
    "timestamp": "2026-11-08T08:10:06Z",
    "co2e_t": 142.85,
    "status": "VERIFIED",
    "sensor_summary": {
        "avg_temp_c": 24.27,
        "avg_humidity_pct": 82.53,
        "avg_soil_pct": 57.1,
    },
    "ndvi_mean": 0.78,
}


async def _insert_parcel_and_auditor(db: aiosqlite.Connection) -> None:
    """Insert the minimum parent rows required by the ledger foreign keys."""
    await db.execute(
        """
        INSERT INTO parcels (
            id, name, polygon_geojson, area_hectares, vegetation_type,
            baseline_ndvi, current_status, owner_wallet, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "PARCEL-A",
            "Lahan Demo A",
            "{}",
            120.5,
            "forest",
            0.78,
            "VERIFIED",
            "0x0000000000000000000000000000000000000000",
            "2026-11-08T00:00:00Z",
        ),
    )
    await db.execute(
        """
        INSERT INTO users (
            id, username, password_hash, display_name, role,
            is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "user-auditor",
            "auditor_demo",
            "not-a-real-hash",
            "Auditor Demo",
            "auditor",
            1,
            "2026-11-08T00:00:00Z",
            "2026-11-08T00:00:00Z",
        ),
    )
    await db.commit()


# ---------------------------------------------------------------------------
# Service-level tests
# ---------------------------------------------------------------------------


async def test_append_block_uses_genesis_and_contract_hash(test_db: aiosqlite.Connection) -> None:
    """The first block starts at genesis and uses SHA-256(prev_hash + JSON)."""
    await _insert_parcel_and_auditor(test_db)

    block = await append_block(test_db, PAYLOAD, approved_by="user-auditor")

    assert block["id"] == 1
    assert block["prev_hash"] == GENESIS_HASH
    assert block["hash"] == compute_hash(GENESIS_HASH, canonical_json(PAYLOAD))

    async with test_db.execute("SELECT * FROM ledger_blocks WHERE block_index = 1") as cursor:
        row = await cursor.fetchone()

    assert row is not None
    assert row["parcel_id"] == "PARCEL-A"
    assert row["co2e_metric_tons"] == 142.85
    assert row["parcel_status"] == "VERIFIED"
    assert row["canonical_data"] == canonical_json(PAYLOAD)
    assert row["approved_by"] == "user-auditor"
    assert row["eas_uid"] is None


async def test_second_block_links_to_the_first(test_db: aiosqlite.Connection) -> None:
    """Every new block stores the previous block's hash as ``prev_hash``."""
    await _insert_parcel_and_auditor(test_db)

    first = await append_block(test_db, PAYLOAD, approved_by="user-auditor")
    second_payload = {**PAYLOAD, "timestamp": "2026-11-08T09:10:06Z", "co2e_t": 143.1}
    second = await append_block(test_db, second_payload, approved_by="user-auditor")

    assert second["id"] == 2
    assert second["prev_hash"] == first["hash"]
    assert second["hash"] == compute_hash(first["hash"], canonical_json(second_payload))

    chain = await verify_chain(test_db)
    assert chain["valid"] is True
    assert chain["blocks_checked"] == 2
    assert chain["first_invalid_block"] is None


async def test_verify_block_reports_valid_entry(test_db: aiosqlite.Connection) -> None:
    """A freshly appended block verifies and resolves the approver username."""
    await _insert_parcel_and_auditor(test_db)
    await append_block(test_db, PAYLOAD, approved_by="user-auditor")

    result = await verify_block(test_db, 1)

    assert result is not None
    assert result["valid"] is True
    assert result["hash_matches"] is True
    assert result["link_matches"] is True
    assert result["chain_valid"] is True
    assert result["approved_by"] == "auditor_demo"
    assert result["recomputed_hash"] == result["hash"]
    assert result["message"] == "Cocok dengan ledger, belum dikunci ke EAS."


async def test_verify_block_detects_payload_tampering(test_db: aiosqlite.Connection) -> None:
    """Editing canonical_data without updating the hash must fail verification."""
    await _insert_parcel_and_auditor(test_db)
    await append_block(test_db, PAYLOAD, approved_by="user-auditor")

    tampered = {**PAYLOAD, "co2e_t": 999.99}
    await test_db.execute(
        "UPDATE ledger_blocks SET canonical_data = ? WHERE block_index = 1",
        (canonical_json(tampered),),
    )
    await test_db.commit()

    result = await verify_block(test_db, 1)

    assert result is not None
    assert result["valid"] is False
    assert result["hash_matches"] is False
    assert result["canonical"] is True
    assert result["reason"] == "hash_mismatch"
    assert result["message"].startswith("TIDAK COCOK")


async def test_verify_block_detects_prev_hash_tampering(test_db: aiosqlite.Connection) -> None:
    """Breaking a block's prev_hash link must fail verification."""
    await _insert_parcel_and_auditor(test_db)
    await append_block(test_db, PAYLOAD, approved_by="user-auditor")
    second_payload = {**PAYLOAD, "timestamp": "2026-11-08T09:10:06Z"}
    await append_block(test_db, second_payload, approved_by="user-auditor")

    await test_db.execute(
        "UPDATE ledger_blocks SET prev_hash = ? WHERE block_index = 2",
        (GENESIS_HASH,),
    )
    await test_db.commit()

    result = await verify_block(test_db, 2)

    assert result is not None
    assert result["valid"] is False
    assert result["link_matches"] is False
    assert result["reason"] == "prev_hash_mismatch"


async def test_verify_block_detects_earlier_tampering(test_db: aiosqlite.Connection) -> None:
    """A later block cannot verify while an earlier block is invalid."""
    await _insert_parcel_and_auditor(test_db)
    await append_block(test_db, PAYLOAD, approved_by="user-auditor")
    second_payload = {**PAYLOAD, "timestamp": "2026-11-08T09:10:06Z"}
    await append_block(test_db, second_payload, approved_by="user-auditor")

    await test_db.execute(
        "UPDATE ledger_blocks SET canonical_data = ? WHERE block_index = 1",
        (canonical_json({**PAYLOAD, "status": "BLOCKED"}),),
    )
    await test_db.commit()

    result = await verify_block(test_db, 2)

    assert result is not None
    assert result["valid"] is False
    assert result["chain_valid"] is False
    assert result["first_invalid_block"] == 1
    assert result["reason"] == "earlier_block_invalid"


async def test_verify_block_returns_none_for_unknown_entry(
    test_db: aiosqlite.Connection,
) -> None:
    """Unknown block indexes are reported as missing, not as invalid."""
    await _insert_parcel_and_auditor(test_db)

    assert await verify_block(test_db, 99) is None


@pytest.mark.parametrize(
    "payload",
    [
        {key: value for key, value in PAYLOAD.items() if key != "parcel_id"},
        {**PAYLOAD, "status": "UNKNOWN"},
        {**PAYLOAD, "co2e_t": -1},
        {**PAYLOAD, "co2e_t": float("nan")},
        {**PAYLOAD, "parcel_id": ""},
    ],
)
async def test_append_rejects_invalid_payload(
    test_db: aiosqlite.Connection,
    payload: dict[str, Any],
) -> None:
    """Invalid payloads never reach the ledger table."""
    await _insert_parcel_and_auditor(test_db)

    with pytest.raises(LedgerValidationError):
        await append_block(test_db, payload)

    async with test_db.execute("SELECT COUNT(*) AS cnt FROM ledger_blocks") as cursor:
        row = await cursor.fetchone()
    assert row is not None
    assert row["cnt"] == 0


def test_canonical_json_is_order_independent() -> None:
    """Insertion order must not change the canonical JSON or the hash."""
    first = {key: PAYLOAD[key] for key in reversed(list(PAYLOAD))}
    second = dict(PAYLOAD)

    assert canonical_json(first) == canonical_json(second)
    assert compute_hash(GENESIS_HASH, canonical_json(first)) == compute_hash(
        GENESIS_HASH, canonical_json(second)
    )


# ---------------------------------------------------------------------------
# HTTP endpoint tests
# ---------------------------------------------------------------------------


@pytest.fixture()
def ledger_client(tmp_path: Any, monkeypatch: pytest.MonkeyPatch) -> Any:
    """Run the app against a temporary file database so tests can seed it."""
    import server.database as database
    from server.config import settings
    from server.main import app

    db_path = tmp_path / "ledger-http.db"
    monkeypatch.setattr(database, "settings", replace(settings, DATABASE_URL=str(db_path)))

    with TestClient(app) as client:
        yield client, db_path


def _insert_http_ledger_block(
    db_path: Any,
    payload: dict[str, Any] = PAYLOAD,
    *,
    eas_uid: str | None = None,
) -> int:
    """Insert one valid block through a plain sqlite3 connection."""
    canonical = canonical_json(payload)
    block_hash = compute_hash(GENESIS_HASH, canonical)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute(
            """
            INSERT INTO parcels (
                id, name, polygon_geojson, area_hectares, vegetation_type,
                baseline_ndvi, current_status, owner_wallet, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "PARCEL-A",
                "Lahan Demo A",
                "{}",
                120.5,
                "forest",
                0.78,
                "VERIFIED",
                "0x0000000000000000000000000000000000000000",
                "2026-11-08T00:00:00Z",
            ),
        )
        connection.execute(
            """
            INSERT INTO users (
                id, username, password_hash, display_name, role,
                is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "user-auditor",
                "auditor_demo",
                "not-a-real-hash",
                "Auditor Demo",
                "auditor",
                1,
                "2026-11-08T00:00:00Z",
                "2026-11-08T00:00:00Z",
            ),
        )
        cursor = connection.execute(
            """
            INSERT INTO ledger_blocks (
                parcel_id, timestamp, co2e_metric_tons, parcel_status,
                prev_hash, current_hash, canonical_data, approved_by, eas_uid
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload["parcel_id"],
                payload["timestamp"],
                payload["co2e_t"],
                payload["status"],
                GENESIS_HASH,
                block_hash,
                canonical,
                "user-auditor",
                eas_uid,
            ),
        )
        connection.commit()
        return int(cursor.lastrowid or 0)


def test_verify_endpoint_is_public_and_valid(ledger_client: Any) -> None:
    """Anyone can verify a block without an Authorization header."""
    client, db_path = ledger_client
    _insert_http_ledger_block(db_path)

    response = client.get("/verify/1")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["valid"] is True
    assert data["hash_matches"] is True
    assert data["chain_valid"] is True
    assert data["payload"]["co2e_t"] == 142.85
    assert data["approved_by"] == "auditor_demo"
    assert data["eas_uid"] is None
    assert data["message"] == "Cocok dengan ledger, belum dikunci ke EAS."


def test_verify_endpoint_returns_404_for_unknown_entry(ledger_client: Any) -> None:
    """A missing ledger entry returns a human-readable 404."""
    client, _ = ledger_client

    response = client.get("/verify/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Entri ledger tidak ditemukan."


def test_verify_endpoint_reports_tampering(ledger_client: Any) -> None:
    """The endpoint exposes a mismatch instead of hiding a tampered row."""
    client, db_path = ledger_client
    _insert_http_ledger_block(db_path)

    with closing(sqlite3.connect(db_path)) as connection:
        connection.execute(
            "UPDATE ledger_blocks SET canonical_data = ? WHERE block_index = 1",
            (canonical_json({**PAYLOAD, "co2e_t": 1.0}),),
        )
        connection.commit()

    response = client.get("/verify/1")

    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False
    assert data["hash_matches"] is False
    assert data["reason"] == "hash_mismatch"
    assert data["message"].startswith("TIDAK COCOK")


def test_verify_endpoint_marks_simulated_eas_anchor(ledger_client: Any) -> None:
    """A simulated anchor is reported as an off-chain EAS preview."""
    client, db_path = ledger_client
    _insert_http_ledger_block(db_path, eas_uid="0x-attestation-uid")

    response = client.get("/verify/1")

    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["eas_uid"] == "0x-attestation-uid"
    assert data["message"] == "COCOK — hash dan tautan blok sesuai. EAS masih simulasi."


def test_verify_endpoint_mentions_live_eas_lock(
    ledger_client: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Anchored blocks report a real EAS lock once simulation mode is off."""
    from server.ledger import service as ledger_service

    monkeypatch.setattr(
        ledger_service,
        "settings",
        replace(ledger_service.settings, EVM_SIMULATION_MODE=False),
    )
    client, db_path = ledger_client
    _insert_http_ledger_block(db_path, eas_uid="0x-attestation-uid")

    response = client.get("/verify/1")

    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["eas_uid"] == "0x-attestation-uid"
    assert data["message"] == "COCOK — entri sudah dikunci ke EAS."
