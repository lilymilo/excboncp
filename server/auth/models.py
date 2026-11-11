"""
ExcbonCP Central Server — Auth Pydantic models.

Defines request / response schemas for authentication and user management.
Password hashes and other secrets are NEVER exposed in responses.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------


class UserCreate(BaseModel):
    """Payload for creating a new user account."""

    username: str = Field(..., min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=8, max_length=128)
    display_name: str = Field(..., min_length=1, max_length=64)
    email: str | None = Field(None, max_length=128)
    role: str | None = Field(
        None,
        pattern=r"^(community|manager|receiver|auditor|owner|admin|member)$",
    )
    parcel_id: str | None = None
    zone_id: str | None = None


class UserLogin(BaseModel):
    """Payload for user login (accepts username or email)."""

    username: str
    password: str


class UserUpdate(BaseModel):
    """Payload for updating a user's own profile."""

    display_name: str | None = Field(None, min_length=1, max_length=64)
    password: str | None = Field(None, min_length=8, max_length=128)


class RoleUpdate(BaseModel):
    """Payload for changing a user's role (owner-only)."""

    role: str = Field(
        ...,
        pattern=r"^(community|manager|receiver|auditor|owner|admin|member)$",
    )


class StatusUpdate(BaseModel):
    """Payload for toggling a user's active status (owner-only)."""

    is_active: bool


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------


class UserResponse(BaseModel):
    """Public-facing user representation — no password hash."""

    id: str
    username: str
    display_name: str
    email: str | None = None
    role: str
    parcel_id: str | None = None
    zone_id: str | None = None
    is_active: bool
    created_at: str


class TokenResponse(BaseModel):
    """JWT token returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"
    expires_at: str
    user: UserResponse | None = None


# ---------------------------------------------------------------------------
# Internal models
# ---------------------------------------------------------------------------


class TokenPayload(BaseModel):
    """Claims decoded from a JWT token."""

    sub: str  # user_id
    role: str
    exp: int
    iat: int
