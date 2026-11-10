"""
ExcbonCP — EAS Attestation Service.

Business logic layer that coordinates:
1. Ledger block verification (hash chain still valid)
2. Auditor approval check (approved_by must be an auditor role)
3. EAS schema registration
4. On-chain attestation & anchoring
5. Update ledger_blocks.eas_uid after anchoring

This enforces the human approval mandate from contract.md §7:
- AI models never sign/submit attestations
- Every on-chain attestation requires an auditor-role signature
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import aiosqlite

from server.config import settings
from server.database import get_db
from server.ledger.service import verify_block

from .eas import EasClient, get_eas_client

logger = logging.getLogger("excboncp.blockchain.service")


@dataclass
class AnchoringResult:
    """Result of anchoring a ledger block to EAS."""

    block_index: int
    success: bool
    eas_attestation_uid: str | None
    transaction_hash: str | None
    on_chain: bool
    message: str
    reason: str | None = None


async def anchor_block_to_eas(
    block_index: int,
    auditor_username: str | None = None,
    client: EasClient | None = None,
    db: aiosqlite.Connection | None = None,
) -> AnchoringResult:
    """Anchor a verified ledger block to Base Sepolia via EAS.

    Process:
    1. Verify the ledger block locally (hash chain intact)
    2. Verify the parcel is ``VERIFIED`` and not already anchored
    3. Verify the auditor has the auditor role
    4. Register the EAS schema (idempotent)
    5. Create the EAS attestation
    6. Update ledger_blocks.eas_uid with the attestation UID

    Args:
        block_index: The ledger block to anchor.
        auditor_username: Human auditor identity (defaults to ``AUDITOR_USERNAME``).
        client: Optional EAS client (dependency injection for tests).
        db: Optional database connection (defaults to the application connection).

    Returns:
        AnchoringResult with details of the anchoring operation.
    """
    db = db or await get_db()

    # Step 1: Verify the ledger block locally
    block = await verify_block(db, block_index)
    if block is None:
        return _failure(block_index, "not_found", f"Ledger block {block_index} not found.")
    if not block["valid"]:
        return _failure(
            block_index,
            "invalid",
            f"Ledger block {block_index} is invalid ({block.get('reason') or 'hash mismatch'}). "
            "Cannot anchor.",
        )

    # Step 2: Business rules — only VERIFIED parcels, once per block
    if block["status"] != "VERIFIED":
        return _failure(
            block_index,
            "not_verified",
            f"Only VERIFIED parcels may be attested (block status: {block['status']}).",
        )
    if block.get("eas_uid"):
        return _failure(
            block_index,
            "already_attested",
            f"Block {block_index} already attested (eas_uid={block['eas_uid']}).",
        )
    if (block.get("co2e_t") or 0) <= 0:
        return _failure(
            block_index,
            "invalid_co2e",
            f"Block {block_index} has no positive CO2e tonnage and cannot be attested.",
        )

    # Step 3: Verify auditor identity
    auditor_user = await verify_auditor(db, auditor_username)
    if not auditor_user:
        return _failure(
            block_index,
            "auditor",
            "Auditor identity not found or lacks auditor role. Attestation requires human approval.",
        )

    # Step 4: Register the schema if needed
    if client is None:
        client = get_eas_client()
    schema_reg = await client.register_schema(db)
    if not schema_reg.get("registered"):
        return _failure(
            block_index,
            "schema",
            f"Schema registration failed: {schema_reg.get('message', '')}",
        )

    # Step 5: Create the EAS attestation
    result = await client.attest(
        parcel_id=block["parcel_id"],
        co2e_metric_tons=float(block.get("co2e_t") or 0.0),
        ledger_block_hash=block["hash"],
        status=block["status"],
        auditor_id=auditor_user["id"],
        metadata_uri=None,  # In production: IPFS URI of the report bundle
        db=db,
    )

    if not result.success:
        return _failure(block_index, "attestation_failed", result.message)

    # Step 6: Update ledger block with EAS UID
    await db.execute(
        "UPDATE ledger_blocks SET eas_uid = ? WHERE block_index = ?",
        (result.attestation_uid, block_index),
    )
    await db.commit()

    logger.info(
        "Anchored ledger block %s to EAS (uid=%s, on_chain=%s)",
        block_index,
        result.attestation_uid,
        result.on_chain,
    )
    return AnchoringResult(
        block_index=block_index,
        success=True,
        eas_attestation_uid=result.attestation_uid,
        transaction_hash=result.transaction_hash,
        on_chain=result.on_chain,
        message=result.message,
        reason=None,
    )


def _failure(block_index: int, reason: str, message: str) -> AnchoringResult:
    return AnchoringResult(
        block_index=block_index,
        success=False,
        eas_attestation_uid=None,
        transaction_hash=None,
        on_chain=False,
        message=message,
        reason=reason,
    )


async def verify_auditor(
    db: aiosqlite.Connection,
    auditor_username: str | None,
) -> dict[str, Any] | None:
    """Return the auditor user when the username has the ``auditor`` role."""
    username = auditor_username or settings.AUDITOR_USERNAME
    cursor = await db.execute(
        "SELECT id, username, role, display_name, email FROM users "
        "WHERE username = ? AND is_active = 1",
        (username,),
    )
    user = await cursor.fetchone()
    if user is None:
        return None

    # The auditor role must be exactly 'auditor' (R7 human-approval mandate).
    if user[2] != "auditor":
        return None

    return {
        "id": user[0],
        "username": user[1],
        "role": user[2],
        "display_name": user[3],
        "email": user[4],
    }


async def get_attested_blocks(db: aiosqlite.Connection, limit: int = 50) -> list[dict[str, Any]]:
    """Return attested ledger blocks, newest attestation first."""
    cursor = await db.execute(
        """
        SELECT a.id, a.parcel_id, a.block_hash, a.eas_uid, a.tx_hash,
               a.schema_uid, a.on_chain, a.attested_at, l.block_index
          FROM attestations AS a
          LEFT JOIN ledger_blocks AS l ON l.current_hash = a.block_hash
         ORDER BY a.attested_at DESC
         LIMIT ?
        """,
        (limit,),
    )
    rows = await cursor.fetchall()
    return [
        {
            "id": r[0],
            "parcel_id": r[1],
            "hash": r[2],
            "eas_uid": r[3],
            "tx_hash": r[4],
            "schema_uid": r[5],
            "on_chain": bool(r[6]),
            "attested_at": r[7],
            "block_index": r[8],
        }
        for r in rows
    ]


async def get_attestation_status(
    db: aiosqlite.Connection, block_index: int
) -> dict[str, Any] | None:
    """Return anchoring status for one ledger block, or ``None`` if absent."""
    cursor = await db.execute(
        """
        SELECT l.block_index, l.current_hash, l.eas_uid, a.eas_uid, a.tx_hash,
               a.on_chain, a.attested_at
          FROM ledger_blocks AS l
          LEFT JOIN attestations AS a ON a.block_hash = l.current_hash
         WHERE l.block_index = ?
         ORDER BY a.attested_at DESC
         LIMIT 1
        """,
        (block_index,),
    )
    row = await cursor.fetchone()
    if row is None:
        return None
    return {
        "block_index": row[0],
        "hash": row[1],
        "ledger_eas_uid": row[2],
        "attestation_uid": row[3],
        "tx_hash": row[4],
        "on_chain": bool(row[5]),
        "attested_at": row[6],
    }
