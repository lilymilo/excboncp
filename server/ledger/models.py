"""Request and response models for ledger verification and auditor approval (R8, R10)."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class LedgerVerifyResponse(BaseModel):
    """Public verification result for one ledger block (L7 — GET /verify/{id})."""

    id: int
    valid: bool
    hash_matches: bool
    link_matches: bool
    canonical: bool
    chain_valid: bool
    first_invalid_block: int | None = None
    prev_hash: str
    payload: dict[str, Any] | None = None
    hash: str
    recomputed_hash: str | None = None
    eas_uid: str | None = None
    approved_by: str | None = None
    reason: str | None = None
    message: str


class ApproveParcelRequest(BaseModel):
    """Request payload for auditor parcel approval (L6 — POST /approve, R10)."""

    parcel_id: str = Field(..., min_length=1, description="Parcel identifier (e.g. PARCEL-A)")
    co2e_t: float | None = Field(
        default=None,
        gt=0,
        description="Optional carbon tonnage override; computed from parcel area when omitted",
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
        description="Optional auditor review notes",
    )
    anchor_to_eas: bool = Field(
        default=True,
        description="Immediately anchor the new ledger block to EAS on Base Sepolia (Diagram 8C)",
    )


class ApproveParcelResponse(BaseModel):
    """Response returned after an auditor approves a parcel and locks its hash (L6, Diagram 8C)."""

    id: int
    parcel_id: str
    status: str
    co2e_t: float
    prev_hash: str
    payload: dict[str, Any]
    hash: str
    approved_by: str
    eas_uid: str | None = None
    transaction_hash: str | None = None
    on_chain: bool = False
    explorer_url: str | None = None
    eas_scan_url: str | None = None
    anchoring_status: str
    label: str = "Simulasi, testnet"
    message: str


class ApprovalLogEntry(BaseModel):
    """Single row in the auditor approval history log (L6)."""

    id: int
    parcel_id: str
    timestamp: str
    co2e_t: float
    status: str
    prev_hash: str
    hash: str
    approved_by: str | None = None
    eas_uid: str | None = None
    transaction_hash: str | None = None
    on_chain: bool = False
    explorer_url: str | None = None
    eas_scan_url: str | None = None
    anchoring_status: str
    label: str = "Simulasi, testnet"
