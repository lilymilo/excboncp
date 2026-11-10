"""
ExcbonCP — EAS Attestation API Router.

Endpoints:
- POST /blockchain/register-schema — register EAS schema (auditor)
- POST /blockchain/attest/{block_index} — anchor a ledger block (auditor)
- GET /blockchain/attestations — list attested blocks
- GET /blockchain/status/{block_index} — anchoring status of a block
- GET /blockchain/simulation-status — public simulation-mode report
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from server.auth.dependencies import get_current_user, require_role
from server.auth.models import UserResponse
from server.database import get_db
from server.ledger.service import verify_block

from .eas import EasClient, get_eas_client
from .service import (
    anchor_block_to_eas,
    get_attestation_status,
    get_attested_blocks,
)

router = APIRouter(prefix="/blockchain", tags=["blockchain"])

logger = logging.getLogger("excboncp.blockchain.router")


def _eas_dependency() -> EasClient:
    """FastAPI dependency wrapper around the EAS singleton."""
    return get_eas_client()


@router.post(
    "/register-schema",
    summary="Register EAS schema on Base Sepolia",
    response_model=dict[str, Any],
)
async def register_schema(
    db: Any = Depends(get_db),
    current_user: UserResponse = Depends(require_role("auditor")),
    client: EasClient = Depends(_eas_dependency),
) -> dict[str, Any]:
    """Register the ExcbonCP EAS schema with the Schema Registry.

    Idempotent: repeated calls return the existing local registration.
    Requires the ``auditor`` role.
    """
    result = await client.register_schema(db)
    if not result.get("registered"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get("message", "Schema registration failed."),
        )

    logger.info("EAS schema registration requested by %s", current_user.username)
    return {
        "registered": True,
        "schema_id": result.get("schema_id", ""),
        "schema_name": result.get("schema_name", ""),
        "schema": result.get("schema", ""),
        "transaction_hash": result.get("transaction_hash"),
        "message": result.get("message", ""),
    }


@router.post(
    "/attest/{block_index}",
    summary="Anchor a ledger block to Base Sepolia via EAS",
    response_model=dict[str, Any],
)
async def attest_block(
    block_index: int,
    auditor_username: str | None = Query(
        None,
        description="Human auditor identity (defaults to the authenticated auditor).",
    ),
    current_user: UserResponse = Depends(require_role("auditor")),
    client: EasClient = Depends(_eas_dependency),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    """Anchor a verified ledger block to Base Sepolia via EAS.

    Process:
    1. Verify the ledger block locally (hash chain intact)
    2. Verify the parcel is ``VERIFIED`` and not already anchored
    3. Verify the auditor has the auditor role
    4. Register the EAS schema (idempotent)
    5. Create the EAS attestation
    6. Update ``ledger_blocks.eas_uid``

    Requires the ``auditor`` role. The recorded human auditor is always the
    authenticated user; the query parameter exists for audit scripts and must
    match the token identity if supplied.
    """
    if auditor_username is not None and auditor_username != current_user.username:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="auditor_username must match the authenticated auditor.",
        )

    # Fail fast with an accurate HTTP status before touching EAS.
    block = await verify_block(db, block_index)
    if block is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ledger block {block_index} not found.",
        )

    result = await anchor_block_to_eas(
        block_index=block_index,
        auditor_username=current_user.username,
        client=client,
        db=db,
    )

    if not result.success:
        error_status = {
            "not_found": status.HTTP_404_NOT_FOUND,
            "invalid": status.HTTP_400_BAD_REQUEST,
            "not_verified": status.HTTP_400_BAD_REQUEST,
            "invalid_co2e": status.HTTP_400_BAD_REQUEST,
            "already_attested": status.HTTP_409_CONFLICT,
            "auditor": status.HTTP_403_FORBIDDEN,
            "schema": status.HTTP_502_BAD_GATEWAY,
            "attestation_failed": status.HTTP_502_BAD_GATEWAY,
        }.get(result.reason or "", status.HTTP_400_BAD_REQUEST)
        raise HTTPException(status_code=error_status, detail=result.message)

    return {
        "success": True,
        "block_index": result.block_index,
        "eas_attestation_uid": result.eas_attestation_uid,
        "transaction_hash": result.transaction_hash,
        "on_chain": result.on_chain,
        "message": result.message,
    }


@router.get(
    "/attestations",
    summary="List attested ledger blocks",
    response_model=list[dict[str, Any]],
)
async def list_attestations(
    current_user: UserResponse = Depends(get_current_user),
    db: Any = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
) -> list[dict[str, Any]]:
    """List all ledger blocks that have been attested to EAS."""
    return await get_attested_blocks(db, limit=limit)


@router.get(
    "/status/{block_index}",
    summary="Check anchoring status of a ledger block",
    response_model=dict[str, Any],
)
async def attestation_status(
    block_index: int,
    current_user: UserResponse = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    """Check whether a ledger block has been attested to EAS."""
    row = await get_attestation_status(db, block_index)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ledger block {block_index} not found.",
        )

    eas_uid = row["attestation_uid"] or row["ledger_eas_uid"]
    if eas_uid:
        return {
            "block_index": block_index,
            "attested": "true",
            "eas_uid": eas_uid,
            "on_chain": "true" if row.get("on_chain") else "false",
            "hash": row["hash"],
            "tx_hash": row["tx_hash"],
            "attested_at": row["attested_at"],
            "message": f"Block {block_index} anchored to EAS (UID: {eas_uid})",
        }
    return {
        "block_index": block_index,
        "attested": "false",
        "eas_uid": None,
        "on_chain": "false",
        "hash": row["hash"],
        "tx_hash": None,
        "attested_at": None,
        "message": f"Block {block_index} not yet anchored to EAS",
    }


@router.get(
    "/simulation-status",
    summary="Check EAS simulation mode status",
    response_model=dict[str, Any],
)
async def simulation_status(client: EasClient = Depends(_eas_dependency)) -> dict[str, Any]:
    """Return whether EAS is running in simulation mode (public)."""
    from .eas import EVM_CHAIN_ID, EVM_RPC_URL

    simulating = client.simulation_mode
    return {
        "simulation_mode": simulating,
        "chain_id": EVM_CHAIN_ID,
        "rpc": EVM_RPC_URL,
        "auditor_configured": bool(client.private_key),
        "message": (
            "Simulation mode: no real blockchain transactions. "
            "Set EVM_SIMULATION_MODE=false, provide EVM_PRIVATE_KEY, and install web3 "
            "for live attestations."
            if simulating
            else "Live mode: attestations are sent to Base Sepolia."
        ),
    }
