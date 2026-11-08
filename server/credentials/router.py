"""
ExcbonCP Central Server — Credential router.

REST endpoints for per-user AI API credential management.
All endpoints enforce ownership — users can only access their own credentials.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status

from server.auth.dependencies import audit_auth_action, get_current_user
from server.auth.models import UserResponse
from server.config import settings
from server.credentials.models import (
    CredentialCreate,
    CredentialResponse,
    CredentialUpdate,
    Provider,
)
from server.credentials.service import (
    create_credential,
    delete_credential,
    get_user_credentials,
    update_credential,
)
from server.database import get_db

logger = logging.getLogger("excboncp.credentials.router")

router = APIRouter(prefix="/api/credentials", tags=["credentials"])


@router.post(
    "",
    response_model=CredentialResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a new API credential",
)
async def save_credential(
    body: CredentialCreate,
    request: Request,
    user: UserResponse = Depends(get_current_user),
) -> CredentialResponse:
    """Encrypt and store a new API credential for the authenticated user."""
    db = await get_db()
    cred = await create_credential(db, user.id, body, settings.CREDENTIAL_ENCRYPTION_KEY)
    await audit_auth_action(
        request,
        user.id,
        "credential.create",
        resource_type="credential",
        resource_id=cred.id,
        details=f"provider={body.provider}",
    )
    return cred


@router.get(
    "",
    response_model=list[CredentialResponse],
    summary="List own credentials (masked)",
)
async def list_credentials(
    user: UserResponse = Depends(get_current_user),
) -> list[CredentialResponse]:
    """Return all credentials belonging to the authenticated user.

    API keys are never included in the response.
    """
    db = await get_db()
    return await get_user_credentials(db, user.id)


@router.put(
    "/{credential_id}",
    response_model=CredentialResponse,
    summary="Update own credential",
)
async def update_own_credential(
    credential_id: str,
    body: CredentialUpdate,
    request: Request,
    user: UserResponse = Depends(get_current_user),
) -> CredentialResponse:
    """Update a credential belonging to the authenticated user."""
    db = await get_db()
    try:
        cred = await update_credential(
            db, user.id, credential_id, body, settings.CREDENTIAL_ENCRYPTION_KEY
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    await audit_auth_action(
        request,
        user.id,
        "credential.update",
        resource_type="credential",
        resource_id=credential_id,
    )
    return cred


@router.delete(
    "/{credential_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete own credential",
)
async def delete_own_credential(
    credential_id: str,
    request: Request,
    user: UserResponse = Depends(get_current_user),
):
    """Delete a credential belonging to the authenticated user."""
    db = await get_db()
    deleted = await delete_credential(db, user.id, credential_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found or access denied.",
        )
    await audit_auth_action(
        request,
        user.id,
        "credential.delete",
        resource_type="credential",
        resource_id=credential_id,
    )


@router.get(
    "/providers",
    response_model=list[dict],
    summary="List supported AI providers",
)
async def list_providers() -> list[dict]:
    """Return the list of supported AI credential providers."""
    return [
        {"value": p.value, "label": p.name.replace("_", " ").title()}
        for p in Provider
    ]
