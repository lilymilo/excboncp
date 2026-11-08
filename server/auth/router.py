"""
ExcbonCP Central Server — Auth router.

Endpoints for registration, login, logout, profile management,
and owner-only user administration.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status

from server.auth.dependencies import (
    audit_auth_action,
    get_current_user,
    require_owner,
)
from server.auth.models import (
    RoleUpdate,
    StatusUpdate,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)
from server.auth.service import (
    authenticate_user,
    create_access_token,
    create_session,
    create_user,
    get_user_by_id,
    list_users,
    revoke_session,
    update_user,
    update_user_role,
    update_user_status,
)
from server.database import get_db

logger = logging.getLogger("excboncp.auth.router")

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(body: UserCreate, request: Request) -> UserResponse:
    """Create a new user account.

    The first registered user automatically becomes the **owner**.
    Subsequent registrations require the caller to be an owner.
    """
    db = await get_db()

    # Check whether any users exist yet
    async with db.execute("SELECT COUNT(*) AS cnt FROM users") as cur:
        row = await cur.fetchone()
        count = row["cnt"] if row else 0  # type: ignore[index]

    if count > 0:
        # Require owner auth for subsequent registrations
        try:
            caller = await get_current_user(request)
        except HTTPException:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Registration is restricted. An owner must register new users.",
            )
        if caller.role != "owner":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner can register new users.",
            )

    try:
        user = await create_user(db, body)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    await audit_auth_action(
        request,
        user.id,
        "user.register",
        details=f"username={user.username}",
        resource_id=user.id,
    )
    return user


# ---------------------------------------------------------------------------
# Login / Logout
# ---------------------------------------------------------------------------


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and obtain a JWT",
)
async def login(body: UserLogin, request: Request) -> TokenResponse:
    """Validate credentials and return a JWT access token."""
    db = await get_db()
    user = await authenticate_user(db, body.username, body.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    token_resp = create_access_token(user.id, user.role)
    token_resp.user = user

    # Persist session
    await create_session(db, user.id, token_resp.access_token, token_resp.expires_at)

    await audit_auth_action(
        request,
        user.id,
        "user.login",
        resource_id=user.id,
    )
    return token_resp


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke current session",
)
async def logout(request: Request, user: UserResponse = Depends(get_current_user)):
    """Revoke the JWT session associated with the current token."""
    token: str = request.state.token
    db = await get_db()
    await revoke_session(db, token)
    await audit_auth_action(request, user.id, "user.logout", resource_id=user.id)


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def me(user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Return the authenticated user's profile."""
    return user


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update own profile",
)
async def update_me(
    body: UserUpdate,
    request: Request,
    user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    """Update the authenticated user's display name and/or password."""
    db = await get_db()
    try:
        updated = await update_user(db, user.id, body)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    await audit_auth_action(request, user.id, "user.update_profile", resource_id=user.id)
    return updated


# ---------------------------------------------------------------------------
# Owner-only user management
# ---------------------------------------------------------------------------


@router.get(
    "/users",
    response_model=list[UserResponse],
    summary="List all users (owner only)",
    dependencies=[Depends(require_owner())],
)
async def get_users() -> list[UserResponse]:
    """Return the full list of registered users."""
    db = await get_db()
    return await list_users(db)


@router.put(
    "/users/{user_id}/role",
    response_model=UserResponse,
    summary="Change user role (owner only)",
)
async def change_role(
    user_id: str,
    body: RoleUpdate,
    request: Request,
    caller: UserResponse = Depends(require_owner()),
) -> UserResponse:
    """Change the role of a user.  Only the owner may call this."""
    if user_id == caller.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role.",
        )
    db = await get_db()
    target = await get_user_by_id(db, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    updated = await update_user_role(db, user_id, body.role)
    await audit_auth_action(
        request,
        caller.id,
        "user.role_change",
        resource_id=user_id,
        details=f"new_role={body.role}",
    )
    return updated


@router.put(
    "/users/{user_id}/status",
    response_model=UserResponse,
    summary="Activate or deactivate a user (owner only)",
)
async def change_status(
    user_id: str,
    body: StatusUpdate,
    request: Request,
    caller: UserResponse = Depends(require_owner()),
) -> UserResponse:
    """Activate or deactivate a user account.  Owner only."""
    if user_id == caller.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )
    db = await get_db()
    target = await get_user_by_id(db, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    updated = await update_user_status(db, user_id, body.is_active)
    action = "user.activate" if body.is_active else "user.deactivate"
    await audit_auth_action(request, caller.id, action, resource_id=user_id)
    return updated
