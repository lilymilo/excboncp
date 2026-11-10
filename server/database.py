"""
ExcbonCP Central Server — Database layer.

Async SQLite connection management via *aiosqlite*.
Provides schema creation, additive migrations, a connection getter, and
lifecycle hooks.

Schema authority: ``docs/database-schema.md`` and Blueprint v5 Model 6.
Sensor columns follow Blueprint v5 Model 3 (``temp_c``, ``humidity_pct``,
``flame``, ``soil_raw``, ``soil_pct``, ``source``).
"""

from __future__ import annotations

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

import aiosqlite

from server.config import settings

logger = logging.getLogger("excboncp.database")

# Module-level connection handle (set during startup, cleared on shutdown).
_connection: aiosqlite.Connection | None = None

# ---------------------------------------------------------------------------
# Schema DDL
# ---------------------------------------------------------------------------

_SCHEMA_SQL = """
-- ── MRV reference data ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zones (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    type         TEXT NOT NULL CHECK (type IN ('kek', 'kota')),
    jurisdiction TEXT,
    created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS parcels (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    polygon_geojson  TEXT NOT NULL,
    area_hectares    REAL NOT NULL CHECK (area_hectares > 0),
    vegetation_type  TEXT NOT NULL,
    baseline_ndvi    REAL NOT NULL CHECK (baseline_ndvi >= -1 AND baseline_ndvi <= 1),
    current_status   TEXT NOT NULL DEFAULT 'BLOCKED'
                     CHECK (current_status IN ('VERIFIED', 'WARNING', 'DISPUTE', 'BLOCKED')),
    owner_wallet     TEXT NOT NULL,
    created_at       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(current_status);

-- ── Central server identity & orchestration ──────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    username      TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    display_name  TEXT NOT NULL,
    email         TEXT,
    role          TEXT NOT NULL DEFAULT 'member',
    parcel_id     TEXT,
    zone_id       TEXT,
    is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS credentials (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL,
    provider        TEXT NOT NULL,
    encrypted_key   TEXT NOT NULL,
    display_label   TEXT NOT NULL,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);

CREATE TABLE IF NOT EXISTS tasks (
    id             TEXT PRIMARY KEY,
    title          TEXT NOT NULL,
    description    TEXT,
    assigned_to    TEXT,
    created_by     TEXT NOT NULL,
    agent_type     TEXT,
    status         TEXT NOT NULL DEFAULT 'pending',
    workspace_path TEXT,
    result         TEXT,
    created_at     TEXT NOT NULL,
    started_at     TEXT,
    completed_at   TEXT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);

CREATE TABLE IF NOT EXISTS audit_logs (
    id            TEXT PRIMARY KEY,
    user_id       TEXT,
    action        TEXT NOT NULL,
    resource_type TEXT,
    resource_id   TEXT,
    details       TEXT,
    ip_address    TEXT,
    created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    revoked    INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

-- ── MRV domain tables (Blueprint v5 Model 6) ────────────────────────────
CREATE TABLE IF NOT EXISTS sensor_readings (
    id           TEXT PRIMARY KEY,
    parcel_id    TEXT NOT NULL,
    device_id    TEXT NOT NULL,
    ts           TEXT NOT NULL,
    temp_c       REAL NOT NULL,
    humidity_pct REAL NOT NULL CHECK (humidity_pct >= 0 AND humidity_pct <= 100),
    flame        INTEGER NOT NULL CHECK (flame IN (0, 1)),
    soil_raw     INTEGER NOT NULL,
    soil_pct     REAL NOT NULL CHECK (soil_pct >= 0 AND soil_pct <= 100),
    source       TEXT NOT NULL CHECK (source IN ('esp', 'simulator')),
    sig          TEXT,
    received_at  TEXT NOT NULL,
    lat          REAL,
    lon          REAL,
    fire_level   INTEGER NOT NULL DEFAULT 0 CHECK (fire_level BETWEEN 0 AND 3),
    sensor_flag  INTEGER NOT NULL DEFAULT 0 CHECK (sensor_flag IN (0, 1)),
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sensor_parcel_ts
    ON sensor_readings(parcel_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_device ON sensor_readings(device_id);

CREATE TABLE IF NOT EXISTS satellite_observations (
    id          TEXT PRIMARY KEY,
    parcel_id   TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    ndvi_mean   REAL NOT NULL CHECK (ndvi_mean >= -1 AND ndvi_mean <= 1),
    sar_vv_db   REAL,
    source      TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_satellite_parcel_date
    ON satellite_observations(parcel_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS consent_records (
    id            TEXT PRIMARY KEY,
    parcel_id     TEXT NOT NULL,
    user_id       TEXT NOT NULL,
    consent_state TEXT NOT NULL CHECK (consent_state IN ('granted', 'none', 'revoked')),
    signature     TEXT,
    terms_version TEXT NOT NULL,
    recorded_at   TEXT NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_consent_parcel_time
    ON consent_records(parcel_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_records(user_id);

CREATE TABLE IF NOT EXISTS status_results (
    id            TEXT PRIMARY KEY,
    parcel_id     TEXT NOT NULL,
    status        TEXT NOT NULL
                  CHECK (status IN ('VERIFIED', 'WARNING', 'DISPUTE', 'BLOCKED')),
    reasons       TEXT NOT NULL,
    rule_version  TEXT NOT NULL,
    sensor_flag   INTEGER NOT NULL DEFAULT 0 CHECK (sensor_flag IN (0, 1)),
    consent_state TEXT NOT NULL CHECK (consent_state IN ('granted', 'none', 'revoked')),
    dispute_open  INTEGER NOT NULL DEFAULT 0 CHECK (dispute_open IN (0, 1)),
    computed_at   TEXT NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_status_parcel_time
    ON status_results(parcel_id, computed_at DESC);

CREATE TABLE IF NOT EXISTS ledger_blocks (
    block_index      INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id        TEXT NOT NULL,
    timestamp        TEXT NOT NULL,
    co2e_metric_tons REAL NOT NULL,
    parcel_status    TEXT NOT NULL
                     CHECK (parcel_status IN ('VERIFIED', 'WARNING', 'DISPUTE', 'BLOCKED')),
    prev_hash        TEXT NOT NULL,
    current_hash     TEXT NOT NULL,
    canonical_data   TEXT NOT NULL,
    approved_by      TEXT,
    eas_uid          TEXT,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ledger_parcel
    ON ledger_blocks(parcel_id, block_index);
CREATE INDEX IF NOT EXISTS idx_ledger_hash ON ledger_blocks(current_hash);

CREATE TABLE IF NOT EXISTS attestations (
    id          TEXT PRIMARY KEY,
    parcel_id   TEXT NOT NULL,
    block_hash  TEXT NOT NULL,
    eas_uid     TEXT NOT NULL UNIQUE,
    tx_hash     TEXT NOT NULL,
    schema_uid  TEXT NOT NULL,
    auditor_id  TEXT NOT NULL,
    attested_at TEXT NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE,
    FOREIGN KEY (auditor_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_attest_parcel ON attestations(parcel_id);

CREATE TABLE IF NOT EXISTS market_orders (
    id                  TEXT PRIMARY KEY,
    parcel_id           TEXT NOT NULL,
    seller_account      TEXT NOT NULL,
    buyer_account       TEXT,
    credit_amount       REAL NOT NULL CHECK (credit_amount > 0),
    simulated_price_idr REAL NOT NULL CHECK (simulated_price_idr >= 0),
    zone_id             TEXT,
    order_status        TEXT NOT NULL DEFAULT 'LISTED'
                        CHECK (order_status IN ('LISTED', 'MATCHED', 'COMPLETED', 'CANCELLED')),
    created_at          TEXT NOT NULL,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_market_parcel ON market_orders(parcel_id);
CREATE INDEX IF NOT EXISTS idx_market_status ON market_orders(order_status);
"""


# ---------------------------------------------------------------------------
# Additive migrations
# ---------------------------------------------------------------------------


async def _table_columns(db: aiosqlite.Connection, table: str) -> set[str]:
    """Return the column names for *table*, or an empty set if it does not exist."""
    async with db.execute(f"PRAGMA table_info({table})") as cursor:
        rows = await cursor.fetchall()
    return {row[1] for row in rows}


async def _migrate_schema(db: aiosqlite.Connection) -> None:
    """Apply additive migrations for databases created by earlier versions.

    The users table existed before R23 introduced ``email``, ``parcel_id`` and
    ``zone_id``.  These columns are added without dropping or rewriting data.
    """
    sensor_columns = await _table_columns(db, "sensor_readings")
    sensor_additions = {
        "lat": "REAL",
        "lon": "REAL",
        "fire_level": "INTEGER NOT NULL DEFAULT 0",
        "sensor_flag": "INTEGER NOT NULL DEFAULT 0",
    }
    for column, column_type in sensor_additions.items():
        if sensor_columns and column not in sensor_columns:
            await db.execute(f"ALTER TABLE sensor_readings ADD COLUMN {column} {column_type}")
            logger.info("Migrated sensor_readings table: added column %s", column)

    columns = await _table_columns(db, "users")
    if not columns:
        return

    additions = {
        "email": "TEXT",
        "parcel_id": "TEXT",
        "zone_id": "TEXT",
    }
    for column, column_type in additions.items():
        if column not in columns:
            await db.execute(f"ALTER TABLE users ADD COLUMN {column} {column_type}")
            logger.info("Migrated users table: added column %s", column)

    await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)")
    await db.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL"
    )
    await db.execute("CREATE INDEX IF NOT EXISTS idx_users_parcel ON users(parcel_id)")
    await db.execute("CREATE INDEX IF NOT EXISTS idx_users_zone ON users(zone_id)")


# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------


async def init_db() -> None:
    """Open the database and create tables if they don't exist."""
    global _connection

    db_path = settings.DATABASE_URL
    # Ensure parent directory exists if using file path
    if db_path != ":memory:":
        db_dir = Path(db_path).parent
        if str(db_dir) not in ("", "."):
            db_dir.mkdir(parents=True, exist_ok=True)

    logger.info("Opening database at %s", db_path)
    _connection = await aiosqlite.connect(db_path)
    _connection.row_factory = aiosqlite.Row  # type: ignore[assignment]

    # Enable WAL mode for better concurrent-read performance
    await _connection.execute("PRAGMA journal_mode=WAL")
    # Enforce foreign keys
    await _connection.execute("PRAGMA foreign_keys=ON")
    # Match docs/database-schema.md — WAL + NORMAL is the documented mode
    await _connection.execute("PRAGMA synchronous=NORMAL")

    await _connection.executescript(_SCHEMA_SQL)
    await _migrate_schema(_connection)
    await _connection.commit()
    logger.info("Database initialised — tables ready.")


async def close_db() -> None:
    """Close the database connection gracefully."""
    global _connection
    if _connection is not None:
        await _connection.close()
        _connection = None
        logger.info("Database connection closed.")


async def get_db() -> aiosqlite.Connection:
    """Return the active database connection.

    Raises *RuntimeError* if the database has not been initialised.
    """
    if _connection is None:
        raise RuntimeError("Database not initialised.  Call init_db() during startup.")
    return _connection


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Async context manager wrapper around *get_db* for convenience."""
    db = await get_db()
    try:
        yield db
    finally:
        # Connection is long-lived; we just commit any pending changes.
        await db.commit()
