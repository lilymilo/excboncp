"""
ExcbonCP Central Server — Monitoring router.

Endpoints for system health checks, runtime metrics, and audit log inspection.
"""

from __future__ import annotations

import logging
import os
import sys
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, Query

from server.auth.dependencies import get_current_user, require_role
from server.auth.models import UserResponse
from server.config import settings
from server.database import get_db

logger = logging.getLogger("excboncp.monitoring")

router = APIRouter(tags=["monitoring"])


@router.get("/api/health", summary="Basic health check")
@router.get("/health", summary="Basic health check alias")
async def health_check() -> dict[str, Any]:
    """Health check endpoint for Docker, load balancers, and monitoring scripts."""
    db_status = "disconnected"
    try:
        db = await get_db()
        async with db.execute("SELECT 1") as cursor:
            row = await cursor.fetchone()
            if row and row[0] == 1:
                db_status = "connected"
    except Exception as exc:  # noqa: BLE001
        logger.warning("Database health check failed: %s", exc)
        db_status = f"unhealthy: {exc}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": "excboncp-central-server",
        "version": "0.1.0",
        "timestamp": datetime.now(UTC).isoformat(),
        "database": db_status,
    }


@router.get("/api/monitoring/status", summary="Detailed server status")
async def server_status(
    _user: UserResponse = Depends(get_current_user),
) -> dict[str, Any]:
    """Return runtime system information and environment status."""
    db_path = settings.DATABASE_URL
    db_size_bytes = 0
    if os.path.exists(db_path):
        db_size_bytes = os.path.getsize(db_path)

    return {
        "status": "online",
        "service": "ExcbonCP Central Engineering Server",
        "version": "0.1.0",
        "python_version": sys.version.split()[0],
        "database": {
            "path": db_path,
            "size_bytes": db_size_bytes,
            "size_mb": round(db_size_bytes / (1024 * 1024), 2),
        },
        "environment": {
            "server_host": settings.SERVER_HOST,
            "server_port": settings.SERVER_PORT,
            "jwt_expiry_hours": settings.JWT_EXPIRY_HOURS,
            "rate_limit_general": settings.RATE_LIMIT_GENERAL,
        },
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.get("/api/monitoring/metrics", summary="System operational metrics")
async def server_metrics(
    _user: UserResponse = Depends(get_current_user),
) -> dict[str, Any]:
    """Return task, user, and credential aggregations."""
    db = await get_db()

    # User counts
    async with db.execute("SELECT role, COUNT(*) FROM users GROUP BY role") as cursor:
        user_rows = await cursor.fetchall()
        user_counts = {row[0]: row[1] for row in user_rows}

    # Task counts by status
    async with db.execute("SELECT status, COUNT(*) FROM tasks GROUP BY status") as cursor:
        task_rows = await cursor.fetchall()
        task_counts = {row[0]: row[1] for row in task_rows}

    # Credential counts by provider
    async with db.execute(
        "SELECT provider, COUNT(*) FROM credentials WHERE is_active = 1 GROUP BY provider"
    ) as cursor:
        cred_rows = await cursor.fetchall()
        cred_counts = {row[0]: row[1] for row in cred_rows}

    # Total audit log count
    async with db.execute("SELECT COUNT(*) FROM audit_logs") as cursor:
        audit_count_row = await cursor.fetchone()
        audit_total = audit_count_row[0] if audit_count_row else 0

    return {
        "users": {
            "total": sum(user_counts.values()),
            "by_role": user_counts,
        },
        "tasks": {
            "total": sum(task_counts.values()),
            "by_status": task_counts,
        },
        "credentials": {
            "total_active": sum(cred_counts.values()),
            "by_provider": cred_counts,
        },
        "audit_logs": {
            "total_records": audit_total,
        },
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.get(
    "/api/monitoring/audit-logs",
    summary="Query audit logs (owner and auditor only)",
)
async def query_audit_logs(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    action: str | None = Query(default=None),
    user_id: str | None = Query(default=None),
    _user: UserResponse = Depends(require_role(["owner", "auditor"])),
) -> dict[str, Any]:
    """Query audit log entries with optional filters for compliance and security audit."""
    db = await get_db()

    query = "SELECT id, user_id, action, resource_type, resource_id, details, ip_address, created_at FROM audit_logs"
    conditions = []
    params: list[Any] = []

    if action:
        conditions.append("action LIKE ?")
        params.append(f"%{action}%")

    if user_id:
        conditions.append("user_id = ?")
        params.append(user_id)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    async with db.execute(query, params) as cursor:
        rows = await cursor.fetchall()

    logs = [
        {
            "id": r[0],
            "user_id": r[1],
            "action": r[2],
            "resource_type": r[3],
            "resource_id": r[4],
            "details": r[5],
            "ip_address": r[6],
            "created_at": r[7],
        }
        for r in rows
    ]

    return {
        "limit": limit,
        "offset": offset,
        "count": len(logs),
        "logs": logs,
    }
