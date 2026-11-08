"""
Tests for ExcbonCP Security Invariants, Encryption, and Input Hardening.
"""

from fastapi.testclient import TestClient

from server.auth.service import hash_password, verify_password
from server.config import settings
from server.credentials.service import decrypt_credential, encrypt_credential


def test_fernet_encryption_roundtrip() -> None:
    """Encryption at rest must reliably encrypt and decrypt raw provider API keys."""
    sample_key = "mock-credential-abcdef1234567890-test-payload"
    cipher_text = encrypt_credential(sample_key, settings.CREDENTIAL_ENCRYPTION_KEY)

    assert cipher_text != sample_key
    assert sample_key not in cipher_text

    decrypted = decrypt_credential(cipher_text, settings.CREDENTIAL_ENCRYPTION_KEY)
    assert decrypted == sample_key


def test_bcrypt_password_hashing_and_verification() -> None:
    """Password hashing works and handles strings safely."""
    raw_pass = "MySecretPassphrase123!@#"
    hashed = hash_password(raw_pass)

    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_bcrypt_long_password_truncation_safety() -> None:
    """Passwords exceeding 72 bytes are safely truncated to conform with the bcrypt spec without crashing."""
    very_long_password = "A" * 150 + "Secret123!"
    hashed = hash_password(very_long_password)

    # First 72 characters match, so verification passes
    assert verify_password(very_long_password, hashed) is True
    # Different prefix within 72 bytes must fail
    assert verify_password("B" * 10 + "A" * 140, hashed) is False


def test_root_discovery_endpoint(test_client: TestClient) -> None:
    """Root endpoint safely provides service discovery information without leaking secrets."""
    resp = test_client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["service"] == "ExcbonCP Central Engineering Server"
    assert data["docs"] == "/docs"
    assert data["health"] == "/api/health"
