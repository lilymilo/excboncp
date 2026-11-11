"""
ExcbonCP Central Server — Auth router.

Handles registration, login, logout, profile management,
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
    LoginLockoutError,
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

router = APIRouter(tags=["auth"])


@router.post(
    "/api/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
@router.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def register(body: UserCreate, request: Request) -> UserResponse:
    db = await get_db()

    async with db.execute("SELECT COUNT(*) AS cnt FROM users") as cur:
        row = await cur.fetchone()
        count = row["cnt"] if row else 0

    caller: UserResponse | None = None
    if count > 0:
        try:
            caller = await get_current_user(request)
        except HTTPException:
            caller = None

    is_public = caller is None or caller.role != "owner"

    if count > 0 and is_public:
        requested_role = body.role or "community"
        if requested_role == "auditor":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Auditor accounts are provisioned by the team and cannot be self-registered.",
            )
        if requested_role in ("owner", "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrative roles cannot be self-registered.",
            )

    try:
        user = await create_user(db, body, is_public=is_public)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    await audit_auth_action(
        request,
        user.id,
        "user.register",
        details=f"username={user.username},role={user.role}",
        resource_id=user.id,
    )
    return user


@router.post(
    "/api/auth/login",
    response_model=TokenResponse,
    summary="Authenticate and obtain a JWT",
)
@router.post(
    "/auth/login",
    response_model=TokenResponse,
    include_in_schema=False,
)
async def login(body: UserLogin, request: Request) -> TokenResponse:
    db = await get_db()
    client_ip = request.client.host if request.client else ""

    try:
        user = await authenticate_user(db, body.username, body.password, client_ip=client_ip)
    except LoginLockoutError as err:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Terlalu banyak percobaan gagal. Silakan tunggu {err.remaining_seconds} detik.",
            headers={"Retry-After": str(err.remaining_seconds)},
        )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    token_resp = create_access_token(user.id, user.role)
    token_resp.user = user

    await create_session(db, user.id, token_resp.access_token, token_resp.expires_at)
    await audit_auth_action(
        request,
        user.id,
        "user.login",
        resource_id=user.id,
    )
    return token_resp


@router.post(
    "/api/auth/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke current session",
)
@router.post(
    "/auth/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    include_in_schema=False,
)
async def logout(request: Request, user: UserResponse = Depends(get_current_user)):
    token: str = request.state.token
    db = await get_db()
    await revoke_session(db, token)
    await audit_auth_action(request, user.id, "user.logout", resource_id=user.id)


@router.get(
    "/api/auth/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
@router.get(
    "/auth/me",
    response_model=UserResponse,
    include_in_schema=False,
)
@router.get(
    "/me",
    response_model=UserResponse,
    include_in_schema=False,
)
async def me(user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return user


@router.put(
    "/api/auth/me",
    response_model=UserResponse,
    summary="Update own profile",
)
@router.put(
    "/auth/me",
    response_model=UserResponse,
    include_in_schema=False,
)
@router.put(
    "/me",
    response_model=UserResponse,
    include_in_schema=False,
)
async def update_me(
    body: UserUpdate,
    request: Request,
    user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    db = await get_db()
    try:
        updated = await update_user(db, user.id, body)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    await audit_auth_action(request, user.id, "user.update_profile", resource_id=user.id)
    return updated


@router.get(
    "/api/auth/users",
    response_model=list[UserResponse],
    summary="List all users (owner only)",
    dependencies=[Depends(require_owner())],
)
@router.get(
    "/auth/users",
    response_model=list[UserResponse],
    include_in_schema=False,
    dependencies=[Depends(require_owner())],
)
async def get_users() -> list[UserResponse]:
    db = await get_db()
    return await list_users(db)


@router.put(
    "/api/auth/users/{user_id}/role",
    response_model=UserResponse,
    summary="Change user role (owner only)",
)
@router.put(
    "/auth/users/{user_id}/role",
    response_model=UserResponse,
    include_in_schema=False,
)
async def change_role(
    user_id: str,
    body: RoleUpdate,
    request: Request,
    caller: UserResponse = Depends(require_owner()),
) -> UserResponse:
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
    "/api/auth/users/{user_id}/status",
    response_model=UserResponse,
    summary="Activate or deactivate a user (owner only)",
)
@router.put(
    "/auth/users/{user_id}/status",
    response_model=UserResponse,
    include_in_schema=False,
)
async def change_status(
    user_id: str,
    body: StatusUpdate,
    request: Request,
    caller: UserResponse = Depends(require_owner()),
) -> UserResponse:
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
