"""Response models for the public ledger verification endpoint."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class LedgerVerifyResponse(BaseModel):
    """Public verification result for one ledger block."""

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
