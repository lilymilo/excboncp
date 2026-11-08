"""
ExcbonCP Central Server — Configuration.

Loads settings from environment variables with sensible defaults.
Validates that required secrets are set at startup.
"""

from __future__ import annotations

import os
import secrets
import sys
from dataclasses import dataclass, field


def _get_env(key: str, default: str | None = None, required: bool = False) -> str:
    """Retrieve an environment variable, optionally enforcing its presence."""
    value = os.environ.get(key, default)
    if required and not value:
        print(
            f"FATAL: Required environment variable '{key}' is not set. "
            "Set it before starting the server.",
            file=sys.stderr,
        )
        sys.exit(1)
    return value or ""


@dataclass(frozen=True, slots=True)
class Settings:
    """Immutable application settings loaded once at import time."""

    # Database
    DATABASE_URL: str = ""

    # JWT Authentication
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # Server
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000

    # Encryption
    CREDENTIAL_ENCRYPTION_KEY: str = ""

    # Logging
    LOG_LEVEL: str = "INFO"

    # CORS
    CORS_ORIGINS: list[str] = field(default_factory=lambda: ["*"])

    # Rate limiting
    RATE_LIMIT_GENERAL: int = 100  # requests per minute
    RATE_LIMIT_AUTH: int = 10  # requests per minute for auth endpoints


def _load_settings() -> Settings:
    """Build a *Settings* instance from the environment."""

    # In development / testing allow auto-generated secrets so the server
    # can boot without manual env-var setup.  A warning is printed instead.
    jwt_secret = os.environ.get("JWT_SECRET")
    if not jwt_secret:
        jwt_secret = secrets.token_urlsafe(48)
        print(
            "WARNING: JWT_SECRET not set — generated an ephemeral secret. "
            "Sessions will NOT survive restarts.  Set JWT_SECRET in production.",
            file=sys.stderr,
        )

    encryption_key = os.environ.get("CREDENTIAL_ENCRYPTION_KEY")
    if not encryption_key:
        # Generate a valid Fernet key for development convenience
        from cryptography.fernet import Fernet

        encryption_key = Fernet.generate_key().decode()
        print(
            "WARNING: CREDENTIAL_ENCRYPTION_KEY not set — generated an ephemeral key. "
            "Stored credentials will NOT be recoverable after restart.  "
            "Set CREDENTIAL_ENCRYPTION_KEY in production.",
            file=sys.stderr,
        )

    cors_raw = os.environ.get("CORS_ORIGINS", "*")
    cors_origins = [o.strip() for o in cors_raw.split(",") if o.strip()]

    port_raw = os.environ.get("SERVER_PORT", "8000")
    try:
        port = int(port_raw)
    except ValueError:
        port = 8000

    expiry_raw = os.environ.get("JWT_EXPIRY_HOURS", "24")
    try:
        expiry = int(expiry_raw)
    except ValueError:
        expiry = 24

    return Settings(
        DATABASE_URL=os.environ.get("DATABASE_URL")
        or os.environ.get("DATABASE_PATH")
        or "./data/excboncp.db",
        JWT_SECRET=jwt_secret,
        JWT_ALGORITHM=os.environ.get("JWT_ALGORITHM", "HS256"),
        JWT_EXPIRY_HOURS=expiry,
        SERVER_HOST=os.environ.get("SERVER_HOST", "0.0.0.0"),
        SERVER_PORT=port,
        CREDENTIAL_ENCRYPTION_KEY=encryption_key,
        LOG_LEVEL=os.environ.get("LOG_LEVEL", "INFO"),
        CORS_ORIGINS=cors_origins,
    )


settings: Settings = _load_settings()
