"""
Tests for the Blueprint v5 Model 6 SQLite schema.

These tests protect the contract between the database layer and the rest of
the MRV pipeline: sensor field names, R23 user links, foreign keys, and the
additive migration path for existing central-server databases.
"""

from __future__ import annotations

import aiosqlite
import pytest

from server.database import _migrate_schema, _table_columns

MRV_TABLES = {
    "users",
    "zones",
    "parcels",
    "sensor_readings",
    "satellite_observations",
    "consent_records",
    "status_results",
    "ledger_blocks",
    "attestations",
    "market_orders",
}


async def test_mrv_tables_exist(test_db: aiosqlite.Connection) -> None:
    """All Model 6 tables are created during startup."""
    async with test_db.execute("SELECT name FROM sqlite_master WHERE type = 'table'") as cursor:
        tables = {row[0] for row in await cursor.fetchall()}

    assert tables >= MRV_TABLES


async def test_sensor_columns_follow_blueprint_v5(test_db: aiosqlite.Connection) -> None:
    """Sensor readings use the Blueprint v5 Model 3 fields, not legacy names."""
    columns = await _table_columns(test_db, "sensor_readings")

    assert {"temp_c", "humidity_pct", "flame", "soil_raw", "soil_pct", "source"} <= columns
    assert (
        not {
            "temperature_celsius",
            "humidity_percent",
            "soil_moisture_percent",
        }
        & columns
    )


async def test_users_table_supports_r23(test_db: aiosqlite.Connection) -> None:
    """The users table stores the R23 email, parcel, and zone links."""
    columns = await _table_columns(test_db, "users")

    assert {"email", "parcel_id", "zone_id"} <= columns


async def test_foreign_keys_are_enforced(test_db: aiosqlite.Connection) -> None:
    """A sensor reading cannot reference a parcel that does not exist."""
    async with test_db.execute("PRAGMA foreign_keys") as cursor:
        row = await cursor.fetchone()
    assert row[0] == 1

    with pytest.raises(aiosqlite.IntegrityError):
        await test_db.execute(
            """
            INSERT INTO sensor_readings (
                id, parcel_id, device_id, ts, temp_c, humidity_pct, flame,
                soil_raw, soil_pct, source, received_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "READ-ORPHAN",
                "PARCEL-MISSING",
                "sim-device",
                "2026-11-09T00:00:00Z",
                25.0,
                80.0,
                0,
                2000,
                50.0,
                "simulator",
                "2026-11-09T00:00:01Z",
            ),
        )


async def test_sensor_source_must_be_esp_or_simulator(test_db: aiosqlite.Connection) -> None:
    """The source column keeps simulated readings distinguishable from ESP data."""
    await test_db.execute(
        """
        INSERT INTO parcels (
            id, name, polygon_geojson, area_hectares, vegetation_type,
            baseline_ndvi, current_status, owner_wallet, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "PARCEL-TEST",
            "Parcel Test",
            "{}",
            1.0,
            "test",
            0.5,
            "BLOCKED",
            "sim-wallet-test",
            "2026-11-09T00:00:00Z",
        ),
    )

    with pytest.raises(aiosqlite.IntegrityError):
        await test_db.execute(
            """
            INSERT INTO sensor_readings (
                id, parcel_id, device_id, ts, temp_c, humidity_pct, flame,
                soil_raw, soil_pct, source, received_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "READ-BAD-SOURCE",
                "PARCEL-TEST",
                "sim-device",
                "2026-11-09T00:00:00Z",
                25.0,
                80.0,
                0,
                2000,
                50.0,
                "real-device",
                "2026-11-09T00:00:01Z",
            ),
        )


async def test_migration_adds_r23_columns_to_legacy_users_table() -> None:
    """Databases created before R23 receive additive columns without data loss."""
    async with aiosqlite.connect(":memory:") as db:
        await db.execute(
            """
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                display_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'member',
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        await db.execute(
            """
            INSERT INTO users (
                id, username, password_hash, display_name, role,
                is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "legacy-user",
                "legacy",
                "hash",
                "Legacy User",
                "member",
                1,
                "2026-11-08T00:00:00Z",
                "2026-11-08T00:00:00Z",
            ),
        )

        await _migrate_schema(db)

        columns = await _table_columns(db, "users")
        assert {"email", "parcel_id", "zone_id"} <= columns

        async with db.execute("SELECT username, role FROM users") as cursor:
            row = await cursor.fetchone()
        assert row is not None
        assert row[0] == "legacy"
        assert row[1] == "member"
