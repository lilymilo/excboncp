"""
ExcbonCP Central Server — Auth service layer.

Handles password hashing, JWT creation / validation, and user CRUD.
"""

from __future__ import annotations

import hashlib
import logging
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


def _row_to_user(row: aiosqlite.Row) -> UserResponse:
    """Map a database row to a *UserResponse*."""
    return UserResponse(
        id=row["id"],
        username=row["username"],
        display_name=row["display_name"],
        role=row["role"],
        is_active=bool(row["is_active"]),
        created_at=row["created_at"],
    )


async def _user_count(db: aiosqlite.Connection) -> int:
    """Return the total number of registered users."""
    async with db.execute("SELECT COUNT(*) AS cnt FROM users") as cur:
        row = await cur.fetchone()
        return row["cnt"] if row else 0  # type: ignore[index]


async def create_user(db: aiosqlite.Connection, data: UserCreate) -> UserResponse:
    """Register a new user.

    The very first user automatically receives the *owner* role.
    Raises *ValueError* if the username is already taken.
    """
    # Uniqueness check
    async with db.execute("SELECT id FROM users WHERE username = ?", (data.username,)) as cur:
        if await cur.fetchone():
            raise ValueError(f"Username '{data.username}' is already taken.")

    user_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()
    pw_hash = hash_password(data.password)

    # First user becomes owner
    count = await _user_count(db)
    role = "owner" if count == 0 else "member"

    await db.execute(
        """
        INSERT INTO users (id, username, password_hash, display_name, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
        """,
        (user_id, data.username, pw_hash, data.display_name, role, now, now),
    )
    await db.commit()
    logger.info("User created: %s (role=%s)", data.username, role)
    return UserResponse(
        id=user_id,
        username=data.username,
        display_name=data.display_name,
        role=role,
        is_active=True,
        created_at=now,
    )


async def authenticate_user(
    db: aiosqlite.Connection, username: str, password: str
) -> UserResponse | None:
    """Validate credentials.  Returns the user on success, *None* on failure."""
    async with db.execute(
        "SELECT * FROM users WHERE username = ? AND is_active = 1", (username,)
    ) as cur:
        row = await cur.fetchone()
    if row is None:
        return None
    if not verify_password(password, row["password_hash"]):
        return None
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
