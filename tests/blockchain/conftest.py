"""Shared fixtures for the Day 3 EAS blockchain tests.

These fixtures deliberately run in simulation mode: no RPC endpoint is
contacted and no testnet gas is spent.  The Hardhat account #0 private key is
used only for local ABI/account validation.
"""

from __future__ import annotations

import os
from collections.abc import Generator
from typing import Any

import pytest

os.environ["EVM_SIMULATION_MODE"] = "true"

from server.ledger.service import append_block  # noqa: E402
from src.blockchain.eas import EasClient, reset_eas_client  # noqa: E402

TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
AUDITOR_WALLET = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
AUDITOR_ID = "usr-auditor-001"
AUDITOR_USERNAME = "auditor_demo"

PARCEL_A = "PARCEL-A"
PARCEL_B = "PARCEL-B"

BLOCK_PAYLOADS: list[dict[str, Any]] = [
    {
        "parcel_id": PARCEL_A,
        "timestamp": "2026-11-12T12:00:00Z",
        "co2e_t": 142.85,
        "status": "VERIFIED",
        "sensor_summary": {
            "avg_temp_c": 24.2,
            "avg_humidity_pct": 82.5,
            "avg_soil_pct": 57.1,
        },
        "ndvi_mean": 0.76,
    },
    {
        "parcel_id": PARCEL_B,
        "timestamp": "2026-11-12T13:00:00Z",
        "co2e_t": 98.4,
        "status": "VERIFIED",
        "sensor_summary": {
            "avg_temp_c": 23.8,
            "avg_humidity_pct": 80.1,
            "avg_soil_pct": 55.3,
        },
        "ndvi_mean": 0.72,
    },
]


@pytest.fixture(autouse=True)
def _reset_eas_singleton() -> Generator[None, None, None]:
    """Prevent a client created by one test from leaking into the next."""
    reset_eas_client()
    yield
    reset_eas_client()


@pytest.fixture()
async def auditor_user(test_db: Any) -> dict[str, Any]:
    """Create the parent parcels and an active auditor user."""
    for parcel_id, name in ((PARCEL_A, "Parcel A"), (PARCEL_B, "Parcel B")):
        await test_db.execute(
            "INSERT INTO parcels (id, name, polygon_geojson, area_hectares, vegetation_type, "
            "baseline_ndvi, current_status, owner_wallet, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                parcel_id,
                name,
                '{"type":"Polygon"}',
                10.5,
                "rainforest",
                0.7,
                "VERIFIED",
                AUDITOR_WALLET,
                "2026-11-01T00:00:00Z",
            ),
        )

    await test_db.execute(
        "INSERT INTO users (id, username, password_hash, display_name, role, is_active, "
        "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            AUDITOR_ID,
            AUDITOR_USERNAME,
            "$2b$12$samplehash",
            "Demo Auditor",
            "auditor",
            1,
            "2026-11-01T00:00:00Z",
            "2026-11-01T00:00:00Z",
        ),
    )
    await test_db.commit()
    return {
        "id": AUDITOR_ID,
        "username": AUDITOR_USERNAME,
        "role": "auditor",
        "wallet": AUDITOR_WALLET,
    }


@pytest.fixture()
async def sample_ledger_blocks(
    test_db: Any,
    auditor_user: dict[str, Any],
) -> list[int]:
    """Append two valid ledger blocks and return their block indexes."""
    indexes: list[int] = []
    for payload in BLOCK_PAYLOADS:
        block = await append_block(
            test_db,
            payload,
            approved_by=auditor_user["id"],
        )
        indexes.append(block["id"])
    return indexes


@pytest.fixture()
def eas_client() -> Generator[EasClient, None, None]:
    """Provide a fresh simulation-mode EAS client for each test."""
    reset_eas_client()
    client = EasClient(private_key=TEST_PRIVATE_KEY)
    yield client
    reset_eas_client()


@pytest.fixture()
async def member_user(test_db: Any, auditor_user: dict[str, Any]) -> dict[str, Any]:
    """Create an active non-auditor user."""
    await test_db.execute(
        "INSERT INTO users (id, username, password_hash, display_name, role, is_active, "
        "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            "usr-member-001",
            "member_demo",
            "$2b$12$samplehash",
            "Demo Member",
            "member",
            1,
            "2026-11-01T00:00:00Z",
            "2026-11-01T00:00:00Z",
        ),
    )
    await test_db.commit()
    return {"id": "usr-member-001", "username": "member_demo", "role": "member"}
