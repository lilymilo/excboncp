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
import uuid
import weakref
from datetime import UTC, datetime
from typing import Any

import aiosqlite

from ai_pipeline.rules_engine import explain_status
from server.config import settings
from server.market.service import calculate_co2e

logger = logging.getLogger("excboncp.ledger")

GENESIS_HASH = "0" * 64
ALLOWED_STATUSES = frozenset({"VERIFIED", "WARNING", "DISPUTE", "BLOCKED"})
REQUIRED_PAYLOAD_FIELDS = ("parcel_id", "timestamp", "co2e_t", "status")
PARCEL_ID_ALIASES = {
    "CBONCP-SRNPPI-JBR-01": "PARCEL-A",
}

# Locks are per event loop.  This keeps the append operation atomic without
# binding a module-level asyncio.Lock to the first loop that imports the module
# (pytest creates a fresh loop for every async test).
_append_locks: weakref.WeakKeyDictionary[asyncio.AbstractEventLoop, asyncio.Lock] = (
    weakref.WeakKeyDictionary()
)


class LedgerValidationError(ValueError):
    """Raised when a ledger payload violates the documented contract."""


class ParcelApprovalError(ValueError):
    """Raised when a parcel cannot be approved by an auditor (Diagram 8C)."""

    def __init__(
        self, message: str, *, status_code: int = 409, reason: str = "not_eligible"
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.reason = reason


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
    elif block["eas_uid"] and not settings.EVM_SIMULATION_MODE:
        message = "COCOK — entri sudah dikunci ke EAS."
    elif block["eas_uid"]:
        message = "COCOK — hash dan tautan blok sesuai. EAS masih simulasi."
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


def _explorer_urls(
    tx_hash: str | None, eas_uid: str | None, on_chain: bool
) -> tuple[str | None, str | None]:
    """Build BaseScan and EASScan URLs when a block has an attestation."""
    if not tx_hash and not eas_uid:
        return None, None
    clean_tx = (tx_hash or "").removeprefix("0x")
    tx_url = f"https://sepolia.basescan.org/tx/0x{clean_tx}" if clean_tx and on_chain else None
    eas_url = (
        f"https://base-sepolia.easscan.org/attestation/view/{eas_uid}"
        if eas_uid and on_chain
        else None
    )
    return tx_url, eas_url


async def _resolve_parcel_row(db: aiosqlite.Connection, parcel_id: str) -> aiosqlite.Row | None:
    """Look up a parcel by ID or known cross-module alias."""
    candidate_ids = [parcel_id]
    alias = PARCEL_ID_ALIASES.get(parcel_id)
    if alias and alias not in candidate_ids:
        candidate_ids.append(alias)

    for candidate in candidate_ids:
        async with db.execute(
            "SELECT id, name, area_hectares, baseline_ndvi, current_status "
            "FROM parcels WHERE id = ?",
            (candidate,),
        ) as cursor:
            row = await cursor.fetchone()
            if row is not None:
                return row
    return None


async def _evaluate_parcel_status(
    db: aiosqlite.Connection, parcel_row: aiosqlite.Row
) -> tuple[str, str]:
    """Return ``(status, human_reason)`` for a parcel before approval."""
    parcel_id = parcel_row["id"]
    async with db.execute(
        "SELECT status, reasons, consent_state, dispute_open, sensor_flag "
        "FROM status_results WHERE parcel_id = ? ORDER BY computed_at DESC LIMIT 1",
        (parcel_id,),
    ) as cursor:
        sr = await cursor.fetchone()

    if sr is not None:
        info = explain_status(
            consent=sr["consent_state"],
            dispute_open=bool(sr["dispute_open"]),
            sensor_flag=bool(sr["sensor_flag"]),
        )
        status = sr["status"]
        return status, info["explanation"]

    current = parcel_row["current_status"]
    if current == "BLOCKED":
        return current, "Lahan belum memiliki persetujuan komunitas (BLOCKED)."
    if current == "DISPUTE":
        return current, "Lahan sedang dalam sengketa aktif atau izin dicabut (DISPUTE)."
    if current == "WARNING":
        return current, "Sensor lapangan mendeteksi kondisi tidak biasa (WARNING)."
    return current, "Seluruh bukti lengkap dan terverifikasi."


async def _collect_sensor_and_ndvi(
    db: aiosqlite.Connection, parcel_id: str, fallback_ndvi: float
) -> tuple[dict[str, float], float]:
    """Gather recent sensor averages and latest NDVI for canonical ledger payload."""
    async with db.execute(
        """
        SELECT AVG(temp_c) AS avg_temp_c,
               AVG(humidity_pct) AS avg_humidity_pct,
               AVG(soil_pct) AS avg_soil_pct
          FROM (
                SELECT temp_c, humidity_pct, soil_pct
                  FROM sensor_readings
                 WHERE parcel_id = ?
                 ORDER BY ts DESC
                 LIMIT 10
          )
        """,
        (parcel_id,),
    ) as cursor:
        srow = await cursor.fetchone()

    if srow is not None and srow["avg_temp_c"] is not None:
        sensor_summary = {
            "avg_temp_c": round(float(srow["avg_temp_c"]), 2),
            "avg_humidity_pct": round(float(srow["avg_humidity_pct"]), 2),
            "avg_soil_pct": round(float(srow["avg_soil_pct"]), 2),
        }
    else:
        sensor_summary = {
            "avg_temp_c": 24.2,
            "avg_humidity_pct": 82.5,
            "avg_soil_pct": 57.1,
        }

    async with db.execute(
        "SELECT ndvi_mean FROM satellite_observations "
        "WHERE parcel_id = ? ORDER BY observed_at DESC LIMIT 1",
        (parcel_id,),
    ) as cursor:
        ndvi_row = await cursor.fetchone()

    ndvi_mean = (
        round(float(ndvi_row["ndvi_mean"]), 4)
        if ndvi_row is not None and ndvi_row["ndvi_mean"] is not None
        else round(float(fallback_ndvi), 4)
    )
    return sensor_summary, ndvi_mean


async def approve_parcel(
    db: aiosqlite.Connection,
    *,
    parcel_id: str,
    auditor_user: dict[str, Any],
    co2e_t: float | None = None,
    notes: str | None = None,
    anchor_to_eas: bool = True,
    ip_address: str | None = None,
    eas_client: Any = None,
) -> dict[str, Any]:
    """Approve a VERIFIED parcel, append its hash-chain block, and anchor to EAS (R10, Diagram 8C)."""
    parcel_row = await _resolve_parcel_row(db, parcel_id.strip())
    if parcel_row is None:
        raise ParcelApprovalError(
            f"Lahan '{parcel_id}' tidak ditemukan.",
            status_code=404,
            reason="not_found",
        )

    resolved_id = str(parcel_row["id"])
    parcel_status, explanation = await _evaluate_parcel_status(db, parcel_row)

    # Diagram 8C: Reject BLOCKED, DISPUTE, or non-VERIFIED parcels before writing to ledger
    if parcel_status != "VERIFIED":
        await db.execute(
            "INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                uuid.uuid4().hex,
                auditor_user["id"],
                "parcel_approval_rejected",
                "parcel",
                resolved_id,
                f"Rejected approval for status={parcel_status}: {explanation}",
                ip_address,
                datetime.now(UTC).isoformat(),
            ),
        )
        await db.commit()
        raise ParcelApprovalError(
            f"Lahan {resolved_id} berstatus {parcel_status} dan tidak dapat disetujui: {explanation}",
            status_code=409,
            reason=f"status_{parcel_status.lower()}",
        )

    # Resolve CO2e tonnage if not explicitly overridden
    resolved_co2e = (
        round(float(co2e_t), 2)
        if co2e_t is not None and co2e_t > 0
        else calculate_co2e(float(parcel_row["area_hectares"]))
    )
    sensor_summary, ndvi_mean = await _collect_sensor_and_ndvi(
        db, resolved_id, float(parcel_row["baseline_ndvi"])
    )
    now_iso = datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    payload: dict[str, Any] = {
        "parcel_id": resolved_id,
        "timestamp": now_iso,
        "co2e_t": resolved_co2e,
        "status": "VERIFIED",
        "sensor_summary": sensor_summary,
        "ndvi_mean": ndvi_mean,
    }
    if notes and notes.strip():
        payload["notes"] = notes.strip()

    block = await append_block(
        db,
        payload,
        approved_by=auditor_user["id"],
        eas_uid=None,
        commit=True,
    )

    await db.execute(
        "INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            uuid.uuid4().hex,
            auditor_user["id"],
            "parcel_approved",
            "ledger_block",
            str(block["id"]),
            f"Approved parcel {resolved_id} (block={block['id']}, hash={block['hash'][:16]}...)",
            ip_address,
            datetime.now(UTC).isoformat(),
        ),
    )
    await db.commit()

    eas_uid: str | None = None
    tx_hash: str | None = None
    on_chain = False
    anchoring_status = "skipped"
    message = "Disetujui dan dicatat di ledger lokal."

    if anchor_to_eas:
        try:
            from src.blockchain.service import anchor_block_to_eas

            anchor_res = await anchor_block_to_eas(
                block_index=block["id"],
                auditor_username=auditor_user["username"],
                client=eas_client,
                db=db,
            )
            if anchor_res.success and anchor_res.eas_attestation_uid:
                eas_uid = anchor_res.eas_attestation_uid
                tx_hash = anchor_res.transaction_hash
                on_chain = anchor_res.on_chain
                anchoring_status = "anchored" if on_chain else "simulated"
                message = (
                    "Disetujui dan hash berhasil dikunci ke EAS Base Sepolia."
                    if on_chain
                    else "Disetujui dan dicatat di ledger (simulasi EAS testnet)."
                )
            else:
                anchoring_status = "pending"
                message = (
                    "Entri tersimpan di ledger, menunggu penguncian EAS. Gunakan tombol Coba lagi."
                )
        except Exception as exc:
            logger.warning(
                "EAS anchoring failed after ledger append for block %s: %s", block["id"], exc
            )
            anchoring_status = "pending"
            message = (
                "Entri tersimpan di ledger, menunggu penguncian EAS. Gunakan tombol Coba lagi."
            )

    explorer_url, eas_scan_url = _explorer_urls(tx_hash, eas_uid, on_chain)
    return {
        "id": block["id"],
        "parcel_id": resolved_id,
        "status": "VERIFIED",
        "co2e_t": resolved_co2e,
        "prev_hash": block["prev_hash"],
        "payload": payload,
        "hash": block["hash"],
        "approved_by": auditor_user["username"],
        "eas_uid": eas_uid,
        "transaction_hash": tx_hash,
        "on_chain": on_chain,
        "explorer_url": explorer_url,
        "eas_scan_url": eas_scan_url,
        "anchoring_status": anchoring_status,
        "label": "Simulasi, testnet",
        "message": message,
    }


async def list_approvals(
    db: aiosqlite.Connection, parcel_id: str | None = None
) -> list[dict[str, Any]]:
    """Return ledger approval history with attestation status for Screen L6."""
    sql = """
        SELECT b.block_index,
               b.parcel_id,
               b.timestamp,
               b.co2e_metric_tons,
               b.parcel_status,
               b.prev_hash,
               b.current_hash,
               b.eas_uid,
               u.username AS approved_by_username,
               b.approved_by,
               a.tx_hash,
               a.on_chain
          FROM ledger_blocks AS b
          LEFT JOIN users AS u ON u.id = b.approved_by
          LEFT JOIN attestations AS a ON a.block_hash = b.current_hash
    """
    params: list[Any] = []
    if parcel_id:
        resolved = PARCEL_ID_ALIASES.get(parcel_id, parcel_id)
        sql += " WHERE b.parcel_id = ?"
        params.append(resolved)
    sql += " ORDER BY b.block_index DESC"

    async with db.execute(sql, tuple(params)) as cursor:
        rows = await cursor.fetchall()

    entries: list[dict[str, Any]] = []
    for row in rows:
        eas_uid = row["eas_uid"]
        tx_hash = row["tx_hash"]
        on_chain = bool(row["on_chain"]) if row["on_chain"] is not None else False
        anchoring_status = "pending"
        if eas_uid:
            anchoring_status = "anchored" if on_chain else "simulated"
        explorer_url, eas_scan_url = _explorer_urls(tx_hash, eas_uid, on_chain)
        entries.append(
            {
                "id": int(row["block_index"]),
                "parcel_id": row["parcel_id"],
                "timestamp": row["timestamp"],
                "co2e_t": float(row["co2e_metric_tons"]),
                "status": row["parcel_status"],
                "prev_hash": row["prev_hash"],
                "hash": row["current_hash"],
                "approved_by": row["approved_by_username"] or row["approved_by"],
                "eas_uid": eas_uid,
                "transaction_hash": tx_hash,
                "on_chain": on_chain,
                "explorer_url": explorer_url,
                "eas_scan_url": eas_scan_url,
                "anchoring_status": anchoring_status,
                "label": "Simulasi, testnet",
            }
        )
    return entries


async def retry_anchor_approval(
    db: aiosqlite.Connection,
    *,
    block_index: int,
    auditor_user: dict[str, Any],
    eas_client: Any = None,
) -> dict[str, Any]:
    """Retry EAS anchoring for a pending ledger block (Blueprint Diagram 8C 'Coba lagi')."""
    if str(auditor_user.get("role", "")) != "auditor":
        raise ParcelApprovalError(
            "Hanya pengguna dengan peran auditor yang diizinkan mengunci entri ledger.",
            status_code=403,
        )

    async with db.execute(
        """
        SELECT block_index, parcel_id, co2e_metric_tons, parcel_status,
               canonical_data, prev_hash, current_hash, eas_uid
          FROM ledger_blocks
         WHERE block_index = ?
        """,
        (block_index,),
    ) as cursor:
        block = await cursor.fetchone()

    if block is None:
        raise ParcelApprovalError(f"Entri ledger '{block_index}' tidak ditemukan.", status_code=404)

    if block["eas_uid"]:
        raise ParcelApprovalError(
            f"Entri ledger '{block_index}' sudah memiliki EAS UID ({block['eas_uid']}).",
            status_code=409,
        )

    from src.blockchain.service import anchor_block_to_eas

    anchor_res = await anchor_block_to_eas(
        block_index=block_index,
        auditor_username=auditor_user["username"],
        client=eas_client,
        db=db,
    )
    if not anchor_res.success or not anchor_res.eas_attestation_uid:
        raise ParcelApprovalError(
            f"Penguncian EAS gagal: {anchor_res.message}",
            status_code=502,
        )

    tx_hash = anchor_res.transaction_hash
    eas_uid = anchor_res.eas_attestation_uid
    on_chain = anchor_res.on_chain
    explorer_url, eas_scan_url = _explorer_urls(tx_hash, eas_uid, on_chain)

    payload_dict: dict[str, Any] = {}
    try:
        parsed = json.loads(block["canonical_data"])
        if isinstance(parsed, dict):
            payload_dict = parsed
    except Exception:
        payload_dict = {}

    return {
        "id": int(block["block_index"]),
        "parcel_id": block["parcel_id"],
        "status": block["parcel_status"],
        "co2e_t": float(block["co2e_metric_tons"]),
        "prev_hash": block["prev_hash"],
        "payload": payload_dict,
        "hash": block["current_hash"],
        "approved_by": auditor_user["username"],
        "eas_uid": eas_uid,
        "transaction_hash": tx_hash,
        "on_chain": on_chain,
        "explorer_url": explorer_url,
        "eas_scan_url": eas_scan_url,
        "anchoring_status": "anchored" if on_chain else "simulated",
        "label": "Simulasi, testnet",
        "message": (
            "Hash berhasil dikunci ke EAS Base Sepolia."
            if on_chain
            else "Hash berhasil dikunci (simulasi EAS testnet)."
        ),
    }
