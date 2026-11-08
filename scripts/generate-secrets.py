#!/usr/bin/env python3
"""ExcbonCP — Secret Generator.

Generates cryptographic secrets for the .env configuration file.
Does NOT write to .env automatically for safety — copy-paste the output.

Usage:
    python3 scripts/generate-secrets.py
"""

import secrets


def generate_jwt_secret() -> str:
    """Generate a 64-byte URL-safe random string for JWT signing."""
    return secrets.token_urlsafe(64)


def generate_fernet_key() -> str:
    """Generate a Fernet encryption key for credential encryption."""
    try:
        from cryptography.fernet import Fernet
        return Fernet.generate_key().decode()
    except ImportError:
        # Fallback: generate a valid Fernet-compatible key manually
        # Fernet keys are 32 bytes, URL-safe base64 encoded
        import base64
        key_bytes = secrets.token_bytes(32)
        return base64.urlsafe_b64encode(key_bytes).decode()


def main() -> None:
    """Generate and display secrets for .env configuration."""
    print()
    print("╔══════════════════════════════════════════════════╗")
    print("║    ExcbonCP — Secret Generator                    ║")
    print("╚══════════════════════════════════════════════════╝")
    print()

    jwt_secret = generate_jwt_secret()
    encryption_key = generate_fernet_key()

    print("Copy the following values into your .env file:")
    print()
    print("─" * 60)
    print(f"JWT_SECRET={jwt_secret}")
    print()
    print(f"CREDENTIAL_ENCRYPTION_KEY={encryption_key}")
    print("─" * 60)
    print()
    print("⚠️  These are newly generated values. Do NOT commit them to Git.")
    print("⚠️  This script does NOT modify .env — copy-paste manually.")
    print()


if __name__ == "__main__":
    main()
