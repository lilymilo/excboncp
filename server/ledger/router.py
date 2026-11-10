"""
ExcbonCP — Public ledger verification and auditor approval router (R8, R10, R13).

Blueprint v5 Model 8:
- L6 exposes ``POST /approve`` (auditor only) and ``GET /approvals`` (approval log).
- L7 exposes ``GET /verify/{id}`` to anyone for independent SHA-256 hash verification.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from server.auth.dependencies import require_role
from server.auth.models import UserResponse
from server.database import get_db
from server.ledger.models import (
    ApprovalLogEntry,
    ApproveParcelRequest,
    ApproveParcelResponse,
    LedgerVerifyResponse,
)
from server.ledger.service import (
    ParcelApprovalError,
    approve_parcel,
    list_approvals,
    retry_anchor_approval,
    verify_block,
)

router = APIRouter(tags=["ledger"])


@router.get(
    "/verify/{block_id}",
    response_model=LedgerVerifyResponse,
    summary="Public ledger verification (L7)",
)
async def verify_ledger_block(block_id: int) -> LedgerVerifyResponse:
    """Recompute one block's SHA-256 hash and its link to the previous block."""
    db = await get_db()
    result = await verify_block(db, block_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entri ledger tidak ditemukan.",
        )
    return LedgerVerifyResponse(**result)


@router.post(
    "/approve",
    response_model=ApproveParcelResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Approve a VERIFIED parcel and lock its hash in the ledger and EAS (L6, R10)",
)
async def approve_parcel_endpoint(
    payload: ApproveParcelRequest,
    request: Request,
    current_user: UserResponse = Depends(require_role("auditor")),
    db: Any = Depends(get_db),
) -> ApproveParcelResponse:
    """Human auditor approval endpoint (Blueprint Diagram 8C, R10).

    1. Verifies the parcel is ``VERIFIED`` (rejects ``BLOCKED``, ``DISPUTE``, ``WARNING``).
    2. Builds the canonical JSON payload and appends a SHA-256 hash-chain block with ``approved_by``.
    3. Records the action in ``audit_logs``.
    4. Anchors the new block to EAS on Base Sepolia (if ``anchor_to_eas=True``); keeps the
       ledger block with ``eas_uid=None`` ("menunggu") if external RPC is temporarily unavailable.
    """
    ip_address = request.client.host if request.client else None
    auditor_dict = {
        "id": current_user.id,
        "username": current_user.username,
        "role": str(current_user.role),
    }
    try:
        result = await approve_parcel(
            db,
            parcel_id=payload.parcel_id,
            auditor_user=auditor_dict,
            co2e_t=payload.co2e_t,
            notes=payload.notes,
            anchor_to_eas=payload.anchor_to_eas,
            ip_address=ip_address,
        )
    except ParcelApprovalError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    return ApproveParcelResponse(**result)


@router.get(
    "/approvals",
    response_model=list[ApprovalLogEntry],
    summary="List auditor approval history and EAS anchoring log (L6, R10)",
)
async def get_approvals_endpoint(
    parcel_id: str | None = Query(None, description="Optional filter by parcel ID"),
    db: Any = Depends(get_db),
) -> list[ApprovalLogEntry]:
    """Return all ledger approval entries with their approver and EAS status for Screen L6."""
    entries = await list_approvals(db, parcel_id=parcel_id)
    return [ApprovalLogEntry(**entry) for entry in entries]


@router.post(
    "/approve/{block_index}/retry",
    response_model=ApproveParcelResponse,
    summary="Retry EAS anchoring for a pending ledger block (L6 'Coba lagi', R10)",
)
async def retry_approve_anchoring_endpoint(
    block_index: int,
    current_user: UserResponse = Depends(require_role("auditor")),
    db: Any = Depends(get_db),
) -> ApproveParcelResponse:
    """Retry EAS attestation anchoring when a previously approved block is still 'pending'."""
    auditor_dict = {
        "id": current_user.id,
        "username": current_user.username,
        "role": str(current_user.role),
    }
    try:
        result = await retry_anchor_approval(
            db,
            block_index=block_index,
            auditor_user=auditor_dict,
        )
    except ParcelApprovalError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    return ApproveParcelResponse(**result)
