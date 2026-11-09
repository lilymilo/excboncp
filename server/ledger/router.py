"""
ExcbonCP — Public ledger verification router.

Blueprint v5 Model 8 (L7) exposes ``GET /verify/{id}`` to anyone.  The endpoint
returns the stored block plus the server's independent hash recomputation, so
the browser can display both and confirm that the ledger was not edited.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from server.database import get_db
from server.ledger.models import LedgerVerifyResponse
from server.ledger.service import verify_block

router = APIRouter(tags=["ledger"])


@router.get(
    "/verify/{block_id}",
    response_model=LedgerVerifyResponse,
    summary="Public ledger verification",
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
