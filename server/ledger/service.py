"""
ExcbonCP — SHA-256 hash-chain ledger service.

Implements the append-only ledger described by Blueprint v5 Model 6 and
``docs/contract.md`` section 6:

    current_hash = SHA-256(prev_hash || canonical_json(payload))

Canonical JSON is UTF-8 with lexicographically sorted keys and compact
separators.  The genesis block uses 64 zero characters as ``prev_hash``.

The service is intentionally small and synchronous-friendly: callers supply
the active ``aiosqlite`` connection, so the same logic can be used by the
seed loader, future approval endpoints, tests, and verification tools.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import weakref
from typing import Any

import aiosqlite

logger = logging.getLogger("excboncp.ledger")

GENESIS_HASH = "0" * 64
ALLOWED_STATUSES = frozenset({"VERIFIED", "WARNING", "DISPUTE", "BLOCKED"})
REQUIRED_PAYLOAD_FIELDS = ("parcel_id", "timestamp", "co2e_t", "status")

# Locks are per event loop.  This keeps the append operation atomic without
# binding a module-level asyncio.Lock to the first loop that imports the module
# (pytest creates a fresh loop for every async test).
_append_locks: weakref.WeakKeyDictionary[asyncio.AbstractEventLoop, asyncio.Lock] = (
    weakref.WeakKeyDictionary()
)


class LedgerValidationError(ValueError):
    """Raised when a ledger payload violates the documented contract."""


def canonical_json(payload: dict[str, Any]) -> str:
    """Return the deterministic JSON encoding used as the hash input.

    Keys are sorted, whitespace is removed, UTF-8 characters are preserved, and
    NaN/Infinity are rejected because they are not valid JSON.
    """
    try:
        return json.dumps(
            payload,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        )
    except (TypeError, ValueError) as exc:
        raise LedgerValidationError(f"Payload is not canonical-JSON serialisable: {exc}") from exc


def compute_hash(prev_hash: str, canonical_data: str) -> str:
    """Return ``SHA-256(prev_hash || canonical_data)`` as lowercase hex."""
    return hashlib.sha256(f"{prev_hash}{canonical_data}".encode()).hexdigest()


def _validate_payload(payload: dict[str, Any]) -> None:
    """Validate the wire payload before it is committed to the ledger."""
    if not isinstance(payload, dict):
        raise LedgerValidationError("Ledger payload must be a JSON object.")

    missing = [field for field in REQUIRED_PAYLOAD_FIELDS if field not in payload]
    if missing:
        raise LedgerValidationError(
            f"Ledger payload is missing required fields: {', '.join(missing)}"
        )

    parcel_id = payload["parcel_id"]
    if not isinstance(parcel_id, str) or not parcel_id.strip():
        raise LedgerValidationError("Ledger payload field 'parcel_id' must be a non-empty string.")

    timestamp = payload["timestamp"]
    if not isinstance(timestamp, str) or not timestamp.strip():
        raise LedgerValidationError("Ledger payload field 'timestamp' must be a non-empty string.")

    co2e = payload["co2e_t"]
    if isinstance(co2e, bool) or not isinstance(co2e, (int, float)) or co2e < 0:
        raise LedgerValidationError("Ledger payload field 'co2e_t' must be a non-negative number.")

    status = payload["status"]
    if status not in ALLOWED_STATUSES:
        raise LedgerValidationError(
            f"Ledger payload field 'status' must be one of: {', '.join(sorted(ALLOWED_STATUSES))}."
        )

    # Reject values that json.dumps cannot canonicalise (sets, NaN, Infinity...).
    canonical_json(payload)


def _get_append_lock() -> asyncio.Lock:
    """Return the append lock for the currently running event loop."""
    loop = asyncio.get_running_loop()
    lock = _append_locks.get(loop)
    if lock is None:
        lock = asyncio.Lock()
        _append_locks[loop] = lock
    return lock


def _parse_canonical_data(raw: Any) -> tuple[dict[str, Any] | None, str | None]:
    """Parse stored canonical JSON, returning ``(payload, error)``."""
    if not isinstance(raw, str):
        return None, "canonical_data is not text"
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        return None, f"canonical_data is not valid JSON: {exc}"
    if not isinstance(parsed, dict):
        return None, "canonical_data must decode to a JSON object"
    return parsed, None


async def append_block(
    db: aiosqlite.Connection,
    payload: dict[str, Any],
    *,
    approved_by: str | None = None,
    eas_uid: str | None = None,
    commit: bool = True,
) -> dict[str, Any]:
    """Append one block and return its wire representation.

    Args:
        db: Active database connection.
        payload: Contract payload (``parcel_id``, ``timestamp``, ``co2e_t``,
            ``status``, optional ``sensor_summary`` and ``ndvi_mean``).
        approved_by: ``users.id`` of the human approver, or ``None``.
        eas_uid: EAS attestation UID once anchored, or ``None`` on Day 2.
        commit: Commit the transaction immediately.  The seed loader passes
            ``False`` so its whole run remains one transaction.
    """
    _validate_payload(payload)
    canonical_data = canonical_json(payload)

    async with _get_append_lock():
        async with db.execute(
            "SELECT current_hash FROM ledger_blocks ORDER BY block_index DESC LIMIT 1"
        ) as cursor:
            last = await cursor.fetchone()

        prev_hash = last["current_hash"] if last is not None else GENESIS_HASH
        current_hash = compute_hash(prev_hash, canonical_data)

        cursor = await db.execute(
            """
            INSERT INTO ledger_blocks (
                parcel_id, timestamp, co2e_metric_tons, parcel_status,
                prev_hash, current_hash, canonical_data, approved_by, eas_uid
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload["parcel_id"],
                payload["timestamp"],
                float(payload["co2e_t"]),
                payload["status"],
                prev_hash,
                current_hash,
                canonical_data,
                approved_by,
                eas_uid,
            ),
        )
        block_index = cursor.lastrowid
        if commit:
            await db.commit()

    if block_index is None:  # pragma: no cover - SQLite always returns a rowid here
        raise RuntimeError("SQLite did not return a block index for the new ledger entry.")

    logger.info(
        "Appended ledger block %s for %s (hash=%s…)",
        block_index,
        payload["parcel_id"],
        current_hash[:12],
    )
    return {
        "id": int(block_index),
        "prev_hash": prev_hash,
        "payload": payload,
        "hash": current_hash,
        "eas_uid": eas_uid,
        "approved_by": approved_by,
    }


async def get_block(db: aiosqlite.Connection, block_index: int) -> dict[str, Any] | None:
    """Return one ledger block with its payload, or ``None`` when absent."""
    async with db.execute(
        """
        SELECT b.*, u.username AS approved_by_username
          FROM ledger_blocks AS b
          LEFT JOIN users AS u ON u.id = b.approved_by
         WHERE b.block_index = ?
        """,
        (block_index,),
    ) as cursor:
        row = await cursor.fetchone()

    if row is None:
        return None

    payload, _ = _parse_canonical_data(row["canonical_data"])
    return {
        "id": row["block_index"],
        "parcel_id": row["parcel_id"],
        "timestamp": row["timestamp"],
        "co2e_t": row["co2e_metric_tons"],
        "status": row["parcel_status"],
        "prev_hash": row["prev_hash"],
        "hash": row["current_hash"],
        "payload": payload,
        "eas_uid": row["eas_uid"],
        "approved_by": row["approved_by_username"] or row["approved_by"],
    }


async def verify_chain(
    db: aiosqlite.Connection,
    through_index: int | None = None,
) -> dict[str, Any]:
    """Recompute the chain and report the first invalid block.

    ``through_index`` limits verification to blocks ``1..through_index`` so a
    public verifier can check one entry without trusting later entries.
    """
    sql = "SELECT block_index, prev_hash, current_hash, canonical_data FROM ledger_blocks"
    params: tuple[Any, ...] = ()
    if through_index is not None:
        sql += " WHERE block_index <= ?"
        params = (through_index,)
    sql += " ORDER BY block_index"

    async with db.execute(sql, params) as cursor:
        rows = await cursor.fetchall()

    results: list[dict[str, Any]] = []
    expected_prev = GENESIS_HASH
    first_invalid_block: int | None = None

    for row in rows:
        raw = row["canonical_data"]
        payload, parse_error = _parse_canonical_data(raw)

        canonical = False
        recomputed_hash: str | None = None
        if payload is not None:
            try:
                canonical = canonical_json(payload) == raw
            except LedgerValidationError:
                canonical = False
            recomputed_hash = compute_hash(row["prev_hash"], raw)

        hash_matches = recomputed_hash is not None and recomputed_hash == row["current_hash"]
        link_matches = row["prev_hash"] == expected_prev
        block_valid = parse_error is None and canonical and hash_matches and link_matches

        if not block_valid and first_invalid_block is None:
            first_invalid_block = row["block_index"]

        results.append(
            {
                "id": row["block_index"],
                "hash_matches": hash_matches,
                "link_matches": link_matches,
                "canonical": canonical,
                "valid": block_valid,
                "recomputed_hash": recomputed_hash,
                "parse_error": parse_error,
            }
        )
        expected_prev = row["current_hash"]

    return {
        "valid": first_invalid_block is None,
        "blocks_checked": len(results),
        "first_invalid_block": first_invalid_block,
        "results": results,
    }


async def verify_block(db: aiosqlite.Connection, block_index: int) -> dict[str, Any] | None:
    """Verify one block against its stored hash and the preceding chain."""
    block = await get_block(db, block_index)
    if block is None:
        return None

    chain = await verify_chain(db, through_index=block_index)
    own = next((result for result in chain["results"] if result["id"] == block_index), None)
    if own is None:  # pragma: no cover - get_block and verify_chain use the same row
        return None

    reason: str | None = None
    if own["parse_error"] is not None:
        reason = "invalid_json"
        message = "TIDAK COCOK — canonical_data bukan JSON yang valid."
    elif not own["canonical"]:
        reason = "non_canonical"
        message = "TIDAK COCOK — canonical_data bukan JSON kanonik."
    elif not own["link_matches"]:
        reason = "prev_hash_mismatch"
        message = "TIDAK COCOK — prev_hash tidak terhubung ke entri sebelumnya."
    elif not own["hash_matches"]:
        reason = "hash_mismatch"
        message = "TIDAK COCOK — hash tersimpan tidak sesuai dengan isi ledger."
    elif not chain["valid"]:
        reason = "earlier_block_invalid"
        message = (
            "TIDAK COCOK — ada entri ledger sebelumnya yang tidak valid "
            f"(block {chain['first_invalid_block']})."
        )
    elif block["eas_uid"]:
        message = "COCOK — entri sudah dikunci ke EAS."
    else:
        message = "Cocok dengan ledger, belum dikunci ke EAS."

    return {
        **block,
        "valid": chain["valid"] and own["valid"],
        "hash_matches": own["hash_matches"],
        "link_matches": own["link_matches"],
        "canonical": own["canonical"],
        "chain_valid": chain["valid"],
        "first_invalid_block": chain["first_invalid_block"],
        "recomputed_hash": own["recomputed_hash"],
        "reason": reason,
        "message": message,
    }
