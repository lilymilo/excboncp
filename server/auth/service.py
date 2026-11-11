"""
ExcbonCP Central Server — Auth service layer.

Handles password hashing, JWT creation / validation, and user CRUD.
"""

from __future__ import annotations

import hashlib
import logging
import time
import uuid
from datetime import UTC, datetime, timedelta

import aiosqlite
import bcrypt
import jwt

from server.auth.models import (
    TokenPayload,
    TokenResponse,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from server.config import settings

logger = logging.getLogger("excboncp.auth.service")


# ---------------------------------------------------------------------------
# Password utilities
# ---------------------------------------------------------------------------


def hash_password(password: str) -> str:
    """Return a bcrypt hash of *password*."""
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify *plain* against a bcrypt *hashed* value."""
    try:
        pw_bytes = plain.encode("utf-8")[:72]
        return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT utilities
# ---------------------------------------------------------------------------


def create_access_token(user_id: str, role: str) -> TokenResponse:
    """Generate a signed JWT for the given user.

    Returns a *TokenResponse* containing the token and expiry.
    """
    now = datetime.now(UTC)
    expires = now + timedelta(hours=settings.JWT_EXPIRY_HOURS)

    payload = {
        "sub": user_id,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_at=expires.isoformat(),
    )


def decode_access_token(token: str) -> TokenPayload:
    """Decode and validate a JWT.  Raises *jwt.PyJWTError* on failure."""
    data = jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
    )
    return TokenPayload(**data)


def _hash_token(token: str) -> str:
    """SHA-256 hash a token for safe storage in the sessions table."""
    return hashlib.sha256(token.encode()).hexdigest()


# ---------------------------------------------------------------------------
# User CRUD
# ---------------------------------------------------------------------------


# In-memory tracking for 5-attempt / 1-minute lockout (Blueprint Model 8A)
_failed_login_attempts: dict[str, tuple[int, float]] = {}
LOCKOUT_THRESHOLD = 5
LOCKOUT_DURATION_SECONDS = 60.0


class LoginLockoutError(Exception):
    """Raised when an identifier has exceeded allowed failed login attempts."""

    def __init__(self, remaining_seconds: int) -> None:
        super().__init__(
            f"Too many failed login attempts. Please wait {remaining_seconds} seconds."
        )
        self.remaining_seconds = remaining_seconds


def check_lockout(key: str) -> None:
    now = time.monotonic()
    count, lockout_expiry = _failed_login_attempts.get(key, (0, 0.0))
    if count >= LOCKOUT_THRESHOLD and now < lockout_expiry:
        remaining = max(1, int(lockout_expiry - now) + 1)
        raise LoginLockoutError(remaining)


def _record_failed_attempt(key: str) -> None:
    now = time.monotonic()
    count, lockout_expiry = _failed_login_attempts.get(key, (0, 0.0))
    if count >= LOCKOUT_THRESHOLD and now >= lockout_expiry:
        count = 0  # previous lockout window has passed

    count += 1
    new_expiry = (now + LOCKOUT_DURATION_SECONDS) if count >= LOCKOUT_THRESHOLD else 0.0
    _failed_login_attempts[key] = (count, new_expiry)


def _clear_failed_attempts(key: str) -> None:
    _failed_login_attempts.pop(key, None)


def reset_failed_attempts() -> None:
    """Clear all lockout tracking (primarily for testing)."""
    _failed_login_attempts.clear()


def _row_to_user(row: aiosqlite.Row) -> UserResponse:
    row_keys = set(row.keys()) if hasattr(row, "keys") else set()
    return UserResponse(
        id=row["id"],
        username=row["username"],
        display_name=row["display_name"],
        email=row["email"] if "email" in row_keys else None,
        role=row["role"],
        parcel_id=row["parcel_id"] if "parcel_id" in row_keys else None,
        zone_id=row["zone_id"] if "zone_id" in row_keys else None,
        is_active=bool(row["is_active"]),
        created_at=row["created_at"],
    )


async def _user_count(db: aiosqlite.Connection) -> int:
    async with db.execute("SELECT COUNT(*) AS cnt FROM users") as cur:
        row = await cur.fetchone()
        return row["cnt"] if row else 0  # type: ignore[index]


async def create_user(
    db: aiosqlite.Connection, data: UserCreate, is_public: bool = False
) -> UserResponse:
    """Register a new user.

    The first user is always owner. For public guests, role defaults to
    community, and auditor/admin roles are blocked.
    """
    async with db.execute("SELECT id FROM users WHERE username = ?", (data.username,)) as cur:
        if await cur.fetchone():
            raise ValueError(f"Username '{data.username}' is already taken.")

    if data.email:
        async with db.execute("SELECT id FROM users WHERE email = ?", (data.email,)) as cur:
            if await cur.fetchone():
                raise ValueError(f"Email '{data.email}' is already registered.")

    if data.parcel_id:
        async with db.execute("SELECT id FROM parcels WHERE id = ?", (data.parcel_id,)) as cur:
            if not await cur.fetchone():
                raise ValueError(f"Parcel '{data.parcel_id}' does not exist.")

    if data.zone_id:
        async with db.execute("SELECT id FROM zones WHERE id = ?", (data.zone_id,)) as cur:
            if not await cur.fetchone():
                raise ValueError(f"Zone '{data.zone_id}' does not exist.")

    count = await _user_count(db)
    if count == 0:
        role = "owner"
    else:
        if is_public:
            requested_role = data.role or "community"
            if requested_role in ("auditor", "owner", "admin"):
                raise ValueError(
                    f"Role '{requested_role}' cannot be self-registered publicly. "
                    "Auditor accounts must be provisioned by the team."
                )
            role = requested_role
        else:
            role = data.role or "member"

    user_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()
    pw_hash = hash_password(data.password)

    await db.execute(
        """
        INSERT INTO users (
            id, username, password_hash, display_name, email, role,
            parcel_id, zone_id, is_active, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        """,
        (
            user_id,
            data.username,
            pw_hash,
            data.display_name,
            data.email,
            role,
            data.parcel_id,
            data.zone_id,
            now,
            now,
        ),
    )
    await db.commit()
    logger.info(
        "User created: %s (role=%s, parcel=%s, zone=%s)",
        data.username,
        role,
        data.parcel_id,
        data.zone_id,
    )
    return UserResponse(
        id=user_id,
        username=data.username,
        display_name=data.display_name,
        email=data.email,
        role=role,
        parcel_id=data.parcel_id,
        zone_id=data.zone_id,
        is_active=True,
        created_at=now,
    )


async def authenticate_user(
    db: aiosqlite.Connection, username: str, password: str, client_ip: str = ""
) -> UserResponse | None:
    """Validate credentials against username or email with rate-limit lockout."""
    normalized_id = username.strip().lower()
    lockout_key = f"{client_ip}:{normalized_id}" if client_ip else normalized_id
    check_lockout(lockout_key)

    async with db.execute(
        "SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1",
        (username, username),
    ) as cur:
        row = await cur.fetchone()

    if row is None or not verify_password(password, row["password_hash"]):
        _record_failed_attempt(lockout_key)
        return None

    _clear_failed_attempts(lockout_key)
    return _row_to_user(row)


async def get_user_by_id(db: aiosqlite.Connection, user_id: str) -> UserResponse | None:
    """Fetch a single user by primary key."""
    async with db.execute("SELECT * FROM users WHERE id = ?", (user_id,)) as cur:
        row = await cur.fetchone()
    return _row_to_user(row) if row else None


async def get_user_by_username(db: aiosqlite.Connection, username: str) -> UserResponse | None:
    """Fetch a single user by unique username."""
    async with db.execute("SELECT * FROM users WHERE username = ?", (username,)) as cur:
        row = await cur.fetchone()
    return _row_to_user(row) if row else None


async def list_users(db: aiosqlite.Connection) -> list[UserResponse]:
    """Return all registered users."""
    async with db.execute("SELECT * FROM users ORDER BY created_at ASC") as cur:
        rows = await cur.fetchall()
    return [_row_to_user(r) for r in rows]


async def update_user(db: aiosqlite.Connection, user_id: str, data: UserUpdate) -> UserResponse:
    """Update a user's profile.  Only non-*None* fields are applied."""
    now = datetime.now(UTC).isoformat()
    fields: list[str] = []
    values: list[str] = []

    if data.display_name is not None:
        fields.append("display_name = ?")
        values.append(data.display_name)
    if data.password is not None:
        fields.append("password_hash = ?")
        values.append(hash_password(data.password))

    if not fields:
        user = await get_user_by_id(db, user_id)
        if user is None:
            raise ValueError("User not found.")
        return user

    fields.append("updated_at = ?")
    values.append(now)
    values.append(user_id)

    await db.execute(
        f"UPDATE users SET {', '.join(fields)} WHERE id = ?",
        tuple(values),
    )
    await db.commit()

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise ValueError("User not found after update.")
    return user


async def update_user_role(db: aiosqlite.Connection, user_id: str, role: str) -> UserResponse:
    """Change a user's role."""
    now = datetime.now(UTC).isoformat()
    await db.execute(
        "UPDATE users SET role = ?, updated_at = ? WHERE id = ?",
        (role, now, user_id),
    )
    await db.commit()
    user = await get_user_by_id(db, user_id)
    if user is None:
        raise ValueError("User not found.")
    return user


async def update_user_status(
    db: aiosqlite.Connection, user_id: str, is_active: bool
) -> UserResponse:
    """Activate or deactivate a user."""
    now = datetime.now(UTC).isoformat()
    await db.execute(
        "UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?",
        (int(is_active), now, user_id),
    )
    await db.commit()
    user = await get_user_by_id(db, user_id)
    if user is None:
        raise ValueError("User not found.")
    return user


async def deactivate_user(db: aiosqlite.Connection, user_id: str) -> bool:
    """Convenience wrapper — deactivate a user account."""
    try:
        await update_user_status(db, user_id, False)
        return True
    except ValueError:
        return False


# ---------------------------------------------------------------------------
# Session management
# ---------------------------------------------------------------------------


async def create_session(
    db: aiosqlite.Connection, user_id: str, token: str, expires_at: str
) -> str:
    """Persist a session record for the given token.  Returns the session id."""
    session_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()
    await db.execute(
        """
        INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, revoked)
        VALUES (?, ?, ?, ?, ?, 0)
        """,
        (session_id, user_id, _hash_token(token), expires_at, now),
    )
    await db.commit()
    return session_id


async def revoke_session(db: aiosqlite.Connection, token: str) -> bool:
    """Revoke the session associated with *token*.  Returns success flag."""
    token_hash = _hash_token(token)
    cursor = await db.execute(
        "UPDATE sessions SET revoked = 1 WHERE token_hash = ? AND revoked = 0",
        (token_hash,),
    )
    await db.commit()
    return cursor.rowcount > 0  # type: ignore[union-attr]


async def is_session_active(db: aiosqlite.Connection, token: str) -> bool:
    """Check whether the session for *token* is still valid."""
    token_hash = _hash_token(token)
    now = datetime.now(UTC).isoformat()
    async with db.execute(
        "SELECT id FROM sessions WHERE token_hash = ? AND revoked = 0 AND expires_at > ?",
        (token_hash, now),
    ) as cur:
        return (await cur.fetchone()) is not None
