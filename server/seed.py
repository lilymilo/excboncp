"""
ExcbonCP — Simulation-only seed loader (Blueprint v5, Day 1).

Loads ``server/seed.json`` and inserts demo zones, parcels, accounts,
consent records, sensor readings, status snapshots, and demo ledger blocks.

The loader is idempotent: running it repeatedly does not duplicate rows.
No password is stored in Git.  Set ``SEED_DEMO_PASSWORD`` before running the
CLI, or let the CLI generate a one-time password and print it to the operator.

Usage:
    .venv/bin/python -m server.seed
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import secrets
from pathlib import Path
from typing import Any

import aiosqlite

from server.auth.service import hash_password
from server.ledger.service import append_block

logger = logging.getLogger("excboncp.seed")

SEED_FILE = Path(__file__).with_name("seed.json")
PASSWORD_ENV = "SEED_DEMO_PASSWORD"


def load_seed_data(path: Path = SEED_FILE) -> dict[str, Any]:
    """Load and validate the simulation seed file."""
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)

    if not data.get("meta", {}).get("simulation"):
        raise ValueError("Seed data must be explicitly marked as simulation.")

    return data


async def _insert_rows(
    db: aiosqlite.Connection,
    table: str,
    columns: list[str],
    rows: list[tuple[Any, ...]],
) -> int:
    """Insert rows with ``INSERT OR IGNORE`` and return the number inserted."""
    if not rows:
        return 0

    placeholders = ", ".join("?" for _ in columns)
    sql = f"INSERT OR IGNORE INTO {table} ({', '.join(columns)}) VALUES ({placeholders})"

    inserted = 0
    for row in rows:
        cursor = await db.execute(sql, row)
        inserted += max(cursor.rowcount, 0)
    return inserted


async def _seed_ledger_blocks(
    db: aiosqlite.Connection,
    data: dict[str, Any],
    user_ids: dict[str, str],
) -> int:
    """Append demo ledger blocks only when the chain is empty.

    Seeding is skipped when any block already exists, so a real approval is
    never mixed with demo data and the loader stays idempotent.
    """
    async with db.execute("SELECT COUNT(*) AS cnt FROM ledger_blocks") as cursor:
        row = await cursor.fetchone()
    if row is not None and row["cnt"] > 0:
        return 0

    inserted = 0
    for entry in data.get("ledger_blocks", []):
        payload = entry.get("payload")
        if not isinstance(payload, dict):
            logger.warning("Skipping ledger seed entry without a payload: %s", entry)
            continue

        approver_username = entry.get("approved_by")
        approved_by = user_ids.get(approver_username) if approver_username else None
        if approver_username and approved_by is None:
            logger.warning(
                "Skipping ledger seed entry for %s: unknown approver %s",
                payload.get("parcel_id"),
                approver_username,
            )
            continue

        await append_block(
            db,
            payload,
            approved_by=approved_by,
            eas_uid=entry.get("eas_uid"),
            commit=False,
        )
        inserted += 1

    return inserted


async def seed_demo_data(
    db: aiosqlite.Connection,
    password: str,
    seed_path: Path = SEED_FILE,
) -> dict[str, int]:
    """Insert simulation-only demo data into an initialised database.

    Args:
        db: Active aiosqlite connection with the schema applied.
        password: Shared password for all seeded demo accounts.  It is hashed
            with the project's bcrypt helper and never written to disk.
        seed_path: Optional path to an alternative seed JSON file.

    Returns:
        Mapping of table name to number of newly inserted rows.
    """
    if len(password) < 8:
        raise ValueError("Seed demo password must be at least 8 characters.")

    data = load_seed_data(seed_path)
    password_hash = hash_password(password)
    counts: dict[str, int] = {}

    # Zones first: users.zone_id and market_orders.zone_id reference zones.
    counts["zones"] = await _insert_rows(
        db,
        "zones",
        ["id", "name", "type", "jurisdiction", "created_at"],
        [
            (zone["id"], zone["name"], zone["type"], zone.get("jurisdiction"), zone["created_at"])
            for zone in data.get("zones", [])
        ],
    )

    counts["parcels"] = await _insert_rows(
        db,
        "parcels",
        [
            "id",
            "name",
            "polygon_geojson",
            "area_hectares",
            "vegetation_type",
            "baseline_ndvi",
            "current_status",
            "owner_wallet",
            "created_at",
        ],
        [
            (
                parcel["id"],
                parcel["name"],
                parcel["polygon_geojson"],
                parcel["area_hectares"],
                parcel["vegetation_type"],
                parcel["baseline_ndvi"],
                parcel["current_status"],
                parcel["owner_wallet"],
                parcel["created_at"],
            )
            for parcel in data.get("parcels", [])
        ],
    )

    counts["users"] = await _insert_rows(
        db,
        "users",
        [
            "id",
            "username",
            "password_hash",
            "display_name",
            "email",
            "role",
            "parcel_id",
            "zone_id",
            "is_active",
            "created_at",
            "updated_at",
        ],
        [
            (
                user["id"],
                user["username"],
                password_hash,
                user["display_name"],
                user.get("email"),
                user["role"],
                user.get("parcel_id"),
                user.get("zone_id"),
                user.get("is_active", 1),
                user["created_at"],
                user["updated_at"],
            )
            for user in data.get("users", [])
        ],
    )

    # Fill R23 links for accounts that already existed without them.
    for user in data.get("users", []):
        await db.execute(
            """
            UPDATE OR IGNORE users
               SET email = COALESCE(email, ?),
                   parcel_id = COALESCE(parcel_id, ?),
                   zone_id = COALESCE(zone_id, ?)
             WHERE username = ?
            """,
            (
                user.get("email"),
                user.get("parcel_id"),
                user.get("zone_id"),
                user["username"],
            ),
        )

    # Resolve usernames to actual user ids.  An existing account may have a
    # different id from the seed fixture, so never assume the fixture id.
    user_ids: dict[str, str] = {}
    async with db.execute("SELECT id, username FROM users") as cursor:
        for row in await cursor.fetchall():
            user_ids[row[1]] = row[0]

    consent_rows: list[tuple[Any, ...]] = []
    for record in data.get("consent_records", []):
        user_id = user_ids.get(record["username"])
        if user_id is None:
            logger.warning(
                "Skipping consent %s: unknown user %s",
                record["id"],
                record["username"],
            )
            continue
        consent_rows.append(
            (
                record["id"],
                record["parcel_id"],
                user_id,
                record["consent_state"],
                record.get("signature"),
                record["terms_version"],
                record["recorded_at"],
            )
        )

    counts["consent_records"] = await _insert_rows(
        db,
        "consent_records",
        [
            "id",
            "parcel_id",
            "user_id",
            "consent_state",
            "signature",
            "terms_version",
            "recorded_at",
        ],
        consent_rows,
    )

    counts["sensor_readings"] = await _insert_rows(
        db,
        "sensor_readings",
        [
            "id",
            "parcel_id",
            "device_id",
            "ts",
            "temp_c",
            "humidity_pct",
            "flame",
            "soil_raw",
            "soil_pct",
            "source",
            "sig",
            "received_at",
        ],
        [
            (
                reading["id"],
                reading["parcel_id"],
                reading["device_id"],
                reading["ts"],
                reading["temp_c"],
                reading["humidity_pct"],
                reading["flame"],
                reading["soil_raw"],
                reading["soil_pct"],
                reading["source"],
                reading.get("sig"),
                reading["received_at"],
            )
            for reading in data.get("sensor_readings", [])
        ],
    )

    counts["status_results"] = await _insert_rows(
        db,
        "status_results",
        [
            "id",
            "parcel_id",
            "status",
            "reasons",
            "rule_version",
            "sensor_flag",
            "consent_state",
            "dispute_open",
            "computed_at",
        ],
        [
            (
                result["id"],
                result["parcel_id"],
                result["status"],
                json.dumps(result["reasons"], ensure_ascii=False),
                result["rule_version"],
                result.get("sensor_flag", 0),
                result["consent_state"],
                result.get("dispute_open", 0),
                result["computed_at"],
            )
            for result in data.get("status_results", [])
        ],
    )

    counts["ledger_blocks"] = await _seed_ledger_blocks(db, data, user_ids)

    await db.commit()
    logger.info("Seed complete: %s", counts)
    return counts


def _print_seed_accounts(data: dict[str, Any], password: str, generated: bool) -> None:
    """Print the demo accounts without exposing password hashes."""
    print()
    print("=" * 64)
    print("  ExcbonCP — Simulation seed data loaded")
    print("=" * 64)
    print()
    print("  Demo accounts (SIMULATION ONLY, not real identities):")
    for user in data.get("users", []):
        scope = user.get("parcel_id") or user.get("zone_id") or "-"
        print(
            f"    {user['username']:<16} role={user['role']:<10} "
            f"scope={scope:<14} email={user.get('email') or '-'}"
        )
    print()
    if generated:
        print(f"  Generated demo password: {password}")
        print(f"  Set {PASSWORD_ENV} to choose a fixed demo password next time.")
    else:
        print(f"  Demo password source: {PASSWORD_ENV}")
    print()
    print("  All records are fictional simulation data. No real carbon")
    print("  credits, identities, or payments are represented.")
    print("=" * 64)
    print()


async def _main() -> None:
    """CLI entry point: initialise the database and load seed data."""
    from server.database import close_db, get_db, init_db

    parser = argparse.ArgumentParser(
        description="Load simulation-only ExcbonCP seed data (Blueprint v5 Day 1)."
    )
    parser.parse_args()

    password = os.environ.get(PASSWORD_ENV)
    generated = False
    if not password:
        password = secrets.token_urlsafe(12)
        generated = True

    data = load_seed_data()

    await init_db()
    try:
        db = await get_db()
        await seed_demo_data(db, password=password)
        _print_seed_accounts(data, password, generated)
    finally:
        await close_db()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    asyncio.run(_main())
