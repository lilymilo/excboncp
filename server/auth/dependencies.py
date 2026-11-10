"""
ExcbonCP Central Server — Auth dependencies for FastAPI.

Provides dependency functions to extract the current user from a JWT
and enforce role-based access control.
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from typing import Any

import jwt
from fastapi import Depends, HTTPException, Request, status

from server.auth.models import TokenPayload, UserResponse
from server.auth.service import decode_access_token, get_user_by_id, is_session_active
from server.database import get_db
from server.monitoring.audit import log_audit

logger = logging.getLogger("excboncp.auth.deps")


def _extract_token(request: Request) -> str:
    """Pull the Bearer token from the Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_header.removeprefix("Bearer ").strip()


async def get_current_user(request: Request) -> UserResponse:
    """FastAPI dependency — resolve the authenticated user from the JWT.

    Also verifies that the session has not been revoked and the user is active.
    """
    token = _extract_token(request)

    try:
        payload: TokenPayload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        )

    db = await get_db()

    # Check session revocation
    if not await is_session_active(db, token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked or expired.",
        )

    user = await get_user_by_id(db, payload.sub)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    # Stash user & token on request state for downstream use
    request.state.current_user = user
    request.state.token = token
    return user


def require_role(*roles: Any) -> Callable:
    """Dependency factory — ensure the current user has one of the given roles.

    Supports both require_role("owner", "admin") and require_role(["owner", "admin"]).
    """
    flat_roles: list[str] = []
    for r in roles:
        if isinstance(r, (list, tuple, set)):
            flat_roles.extend(r)
        else:
            flat_roles.append(str(r))

    async def _check(user: UserResponse = Depends(get_current_user)) -> UserResponse:
        if user.role not in flat_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {', '.join(flat_roles)}.",
            )
        return user

    return _check


def require_owner() -> Callable:
    """Shortcut dependency — require the *owner* role."""
    return require_role("owner")


async def audit_auth_action(
    request: Request,
    user_id: str,
    action: str,
    *,
    resource_type: str = "auth",
    resource_id: str | None = None,
    details: str | None = None,
) -> None:
    """Helper to log an auth-related audit event."""
    db = await get_db()
    ip = request.client.host if request.client else "unknown"
    await log_audit(
        db,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip,
    )
