"""
ExcbonCP Central Server — Credential service layer.

Manages per-user AI API credential lifecycle with Fernet encryption at rest.

CRITICAL: Every operation enforces user_id ownership — a user can ONLY
access their own credentials.
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

import aiosqlite
from cryptography.fernet import Fernet, InvalidToken

from server.credentials.models import CredentialCreate, CredentialResponse, CredentialUpdate

logger = logging.getLogger("excboncp.credentials.service")

# ---------------------------------------------------------------------------
# Encryption helpers
# ---------------------------------------------------------------------------


def encrypt_credential(api_key: str, encryption_key: str) -> str:
    """Fernet-encrypt an API key.  Returns the ciphertext as a UTF-8 string."""
    fernet = Fernet(encryption_key.encode())
    return fernet.encrypt(api_key.encode()).decode()


def decrypt_credential(encrypted: str, encryption_key: str) -> str:
    """Fernet-decrypt an encrypted API key."""
    fernet = Fernet(encryption_key.encode())
    try:
        return fernet.decrypt(encrypted.encode()).decode()
    except InvalidToken:
        raise ValueError("Failed to decrypt credential — encryption key may have changed.")


# ---------------------------------------------------------------------------
# Row mapping
# ---------------------------------------------------------------------------


def _row_to_response(row: aiosqlite.Row) -> CredentialResponse:
    return CredentialResponse(
        id=row["id"],
        provider=row["provider"],
        display_label=row["display_label"],
        is_active=bool(row["is_active"]),
        created_at=row["created_at"],
    )


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------


async def create_credential(
    db: aiosqlite.Connection,
    user_id: str,
    data: CredentialCreate,
    encryption_key: str,
) -> CredentialResponse:
    """Store a new encrypted credential for the user."""
    cred_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()
    encrypted = encrypt_credential(data.api_key, encryption_key)

    await db.execute(
        """
        INSERT INTO credentials (id, user_id, provider, encrypted_key, display_label, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
        """,
        (cred_id, user_id, data.provider.value, encrypted, data.display_label, now, now),
    )
    await db.commit()
    logger.info("Credential created: %s (provider=%s, user=%s)", cred_id, data.provider, user_id)

    return CredentialResponse(
        id=cred_id,
        provider=data.provider.value,
        display_label=data.display_label,
        is_active=True,
        created_at=now,
    )


async def get_user_credentials(
    db: aiosqlite.Connection,
    user_id: str,
) -> list[CredentialResponse]:
    """List all credentials belonging to the user (decrypted keys are NEVER returned)."""
    async with db.execute(
        "SELECT * FROM credentials WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,),
    ) as cur:
        rows = await cur.fetchall()
    return [_row_to_response(r) for r in rows]


async def get_credential_for_agent(
    db: aiosqlite.Connection,
    user_id: str,
    provider: str,
    encryption_key: str,
) -> str:
    """Return the decrypted API key for a given provider.

    This is used *internally only* by the agent execution layer so that the
    decrypted key is never exposed via the HTTP API.

    Raises *ValueError* when no active credential is found.
    """
    async with db.execute(
        """
        SELECT encrypted_key FROM credentials
        WHERE user_id = ? AND provider = ? AND is_active = 1
        ORDER BY created_at DESC LIMIT 1
        """,
        (user_id, provider),
    ) as cur:
        row = await cur.fetchone()

    if row is None:
        raise ValueError(f"No active {provider} credential found for user {user_id}.")

    return decrypt_credential(row["encrypted_key"], encryption_key)


async def update_credential(
    db: aiosqlite.Connection,
    user_id: str,
    credential_id: str,
    data: CredentialUpdate,
    encryption_key: str,
) -> CredentialResponse:
    """Update a credential.  Enforces user_id ownership."""
    # Ownership check
    async with db.execute(
        "SELECT * FROM credentials WHERE id = ? AND user_id = ?",
        (credential_id, user_id),
    ) as cur:
        row = await cur.fetchone()

    if row is None:
        raise ValueError("Credential not found or access denied.")

    now = datetime.now(UTC).isoformat()
    fields: list[str] = []
    values: list[str | int] = []

    if data.api_key is not None:
        fields.append("encrypted_key = ?")
        values.append(encrypt_credential(data.api_key, encryption_key))
    if data.display_label is not None:
        fields.append("display_label = ?")
        values.append(data.display_label)
    if data.is_active is not None:
        fields.append("is_active = ?")
        values.append(int(data.is_active))

    if not fields:
        return _row_to_response(row)

    fields.append("updated_at = ?")
    values.append(now)
    values.append(credential_id)
    values.append(user_id)

    await db.execute(
        f"UPDATE credentials SET {', '.join(fields)} WHERE id = ? AND user_id = ?",
        tuple(values),
    )
    await db.commit()

    # Re-fetch
    async with db.execute(
        "SELECT * FROM credentials WHERE id = ? AND user_id = ?",
        (credential_id, user_id),
    ) as cur:
        updated_row = await cur.fetchone()

    if updated_row is None:
        raise ValueError("Credential disappeared during update.")

    logger.info("Credential updated: %s (user=%s)", credential_id, user_id)
    return _row_to_response(updated_row)


async def delete_credential(
    db: aiosqlite.Connection,
    user_id: str,
    credential_id: str,
) -> bool:
    """Delete a credential.  Enforces user_id ownership.  Returns success flag."""
    cursor = await db.execute(
        "DELETE FROM credentials WHERE id = ? AND user_id = ?",
        (credential_id, user_id),
    )
    await db.commit()
    deleted = cursor.rowcount > 0  # type: ignore[union-attr]
    if deleted:
        logger.info("Credential deleted: %s (user=%s)", credential_id, user_id)
    return deleted
