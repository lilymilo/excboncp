"""
Tests for the simulation-only Day 1 seed data.

The seed must be reproducible, idempotent, clearly labelled as simulation,
and compatible with the existing authentication service.
"""

from __future__ import annotations

import json

import aiosqlite
import pytest

from server.auth.service import authenticate_user, verify_password
from server.seed import load_seed_data, seed_demo_data

SEED_PASSWORD = "SeedTestPassword123!"


async def test_seed_loads_parcels_accounts_and_readings(
    test_db: aiosqlite.Connection,
) -> None:
    """Seed creates parcel A/B, demo accounts, consent, and simulated readings."""
    counts = await seed_demo_data(test_db, password=SEED_PASSWORD)

    assert counts["zones"] == 2
    assert counts["parcels"] == 2
    assert counts["users"] == 5
    assert counts["consent_records"] == 1
    assert counts["sensor_readings"] == 6
    assert counts["status_results"] == 2

    async with test_db.execute("SELECT id, current_status FROM parcels ORDER BY id") as cursor:
        parcels = {row["id"]: row["current_status"] for row in await cursor.fetchall()}
    assert parcels == {"PARCEL-A": "VERIFIED", "PARCEL-B": "BLOCKED"}

    async with test_db.execute(
        "SELECT username, role, parcel_id, zone_id FROM users ORDER BY username"
    ) as cursor:
        users = {row["username"]: row for row in await cursor.fetchall()}

    assert users["komunitas_a"]["role"] == "community"
    assert users["komunitas_a"]["parcel_id"] == "PARCEL-A"
    assert users["pengelola_a"]["role"] == "manager"
    assert users["pengelola_a"]["parcel_id"] == "PARCEL-A"
    assert users["penerima_a"]["role"] == "receiver"
    assert users["penerima_a"]["zone_id"] == "ZONE-DEMO-A"
    assert users["auditor_demo"]["role"] == "auditor"

    async with test_db.execute(
        "SELECT consent_state FROM consent_records WHERE parcel_id = 'PARCEL-A'"
    ) as cursor:
        consent = await cursor.fetchone()
    assert consent is not None
    assert consent["consent_state"] == "granted"

    async with test_db.execute(
        "SELECT COUNT(*) AS cnt FROM consent_records WHERE parcel_id = 'PARCEL-B'"
    ) as cursor:
        no_consent = await cursor.fetchone()
    assert no_consent is not None
    assert no_consent["cnt"] == 0

    async with test_db.execute(
        """
        SELECT temp_c, humidity_pct, flame, soil_raw, soil_pct, source
          FROM sensor_readings
         WHERE parcel_id = 'PARCEL-A'
         ORDER BY ts
         LIMIT 1
        """
    ) as cursor:
        reading = await cursor.fetchone()

    assert reading is not None
    assert reading["temp_c"] == 24.2
    assert reading["humidity_pct"] == 82.5
    assert reading["flame"] == 0
    assert reading["soil_raw"] == 2310
    assert reading["soil_pct"] == 57.0
    assert reading["source"] == "simulator"


async def test_seeded_account_can_authenticate(test_db: aiosqlite.Connection) -> None:
    """A seeded community account can log in with the seed password."""
    await seed_demo_data(test_db, password=SEED_PASSWORD)

    user = await authenticate_user(test_db, "komunitas_a", SEED_PASSWORD)
    assert user is not None
    assert user.role == "community"

    async with test_db.execute(
        "SELECT password_hash FROM users WHERE username = 'komunitas_a'"
    ) as cursor:
        row = await cursor.fetchone()

    assert row is not None
    assert verify_password(SEED_PASSWORD, row["password_hash"])
    assert not verify_password("WrongPassword123!", row["password_hash"])


async def test_seed_is_idempotent(test_db: aiosqlite.Connection) -> None:
    """Running the seed twice does not duplicate any row."""
    first = await seed_demo_data(test_db, password=SEED_PASSWORD)
    second = await seed_demo_data(test_db, password=SEED_PASSWORD)

    assert sum(first.values()) > 0
    assert all(count == 0 for count in second.values())

    async with test_db.execute("SELECT COUNT(*) AS cnt FROM parcels") as cursor:
        row = await cursor.fetchone()
    assert row is not None
    assert row["cnt"] == 2


async def test_seed_links_existing_auth_account_without_overwriting_role(
    test_db: aiosqlite.Connection,
) -> None:
    """Seed resolves accounts by username, not by fixture id, and keeps auth roles."""
    await test_db.execute(
        """
        INSERT INTO users (
            id, username, password_hash, display_name, role, is_active,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "existing-komunitas-id",
            "komunitas_a",
            "existing-hash",
            "Existing Community",
            "member",
            1,
            "2026-11-08T00:00:00Z",
            "2026-11-08T00:00:00Z",
        ),
    )

    await seed_demo_data(test_db, password=SEED_PASSWORD)

    async with test_db.execute(
        "SELECT id, role, parcel_id, email FROM users WHERE username = 'komunitas_a'"
    ) as cursor:
        user = await cursor.fetchone()

    assert user is not None
    assert user["id"] == "existing-komunitas-id"
    assert user["role"] == "member"
    assert user["parcel_id"] == "PARCEL-A"
    assert user["email"] == "komunitas.a@demo.excboncp.test"

    async with test_db.execute(
        "SELECT user_id FROM consent_records WHERE parcel_id = 'PARCEL-A'"
    ) as cursor:
        consent = await cursor.fetchone()

    assert consent is not None
    assert consent["user_id"] == "existing-komunitas-id"


async def test_seed_rejects_short_password(test_db: aiosqlite.Connection) -> None:
    """The seed refuses a password below the project's minimum length."""
    with pytest.raises(ValueError, match="at least 8 characters"):
        await seed_demo_data(test_db, password="short")


def test_seed_file_is_explicitly_simulated_and_has_no_passwords() -> None:
    """Seed data must be labelled simulation and must never contain passwords."""
    data = load_seed_data()

    assert data["meta"]["simulation"] is True
    serialized = json.dumps(data).lower()
    assert "password" not in serialized
    assert "password_hash" not in serialized

    for user in data["users"]:
        assert "password" not in user
        assert "password_hash" not in user
