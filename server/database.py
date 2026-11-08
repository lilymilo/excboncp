"""
ExcbonCP Central Server — Database layer.

Async SQLite connection management via *aiosqlite*.
Provides schema creation, a connection getter, and lifecycle hooks.
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
CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    username     TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role         TEXT NOT NULL DEFAULT 'member',
    is_active    INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);

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
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
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
"""


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

    await _connection.executescript(_SCHEMA_SQL)
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
        raise RuntimeError(
            "Database not initialised.  Call init_db() during startup."
        )
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
