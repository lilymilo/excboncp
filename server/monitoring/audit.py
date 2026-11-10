"""
ExcbonCP Central Server — Audit logging service.

Records security and operational actions to the immutable audit_logs table.
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

import aiosqlite

logger = logging.getLogger("excboncp.monitoring.audit")


async def log_audit(
    db: aiosqlite.Connection,
    user_id: str | None,
    action: str,
    *,
    resource_type: str | None = None,
    resource_id: str | None = None,
    details: str | None = None,
    ip_address: str | None = None,
) -> str:
    """Insert an audit log record into SQLite."""
    record_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()

    try:
        await db.execute(
            """
            INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (record_id, user_id, action, resource_type, resource_id, details, ip_address, now),
        )
        await db.commit()
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to write audit log (%s): %s", action, exc)

    return record_id
