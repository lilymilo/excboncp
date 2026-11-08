"""
Tests for ExcbonCP Per-User AI Credential Vault.
"""

from fastapi.testclient import TestClient


def _get_or_create_user(client: TestClient, username: str, password: str = "StrongPassword123!") -> str:
    client.post(
        "/api/auth/register",
        json={"username": username, "password": password, "display_name": username},
    )
    resp = client.post("/api/auth/login", json={"username": username, "password": password})
    return resp.json()["access_token"]


def test_list_supported_providers(test_client: TestClient) -> None:
    """Providers endpoint lists all supported AI providers."""
    resp = test_client.get("/api/credentials/providers")
    assert resp.status_code == 200
    providers = [p["value"] for p in resp.json()]
    assert "anthropic" in providers
    assert "openai" in providers
    assert "google" in providers or "gemini" in providers
    assert "custom" in providers


def test_create_and_list_own_credential(test_client: TestClient) -> None:
    """User can store credentials, and returned data masks the secret key."""
    token_a = _get_or_create_user(test_client, "alice_cred")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Store Anthropic key
    create_resp = test_client.post(
        "/api/credentials",
        headers=headers_a,
        json={
            "provider": "anthropic",
            "api_key": "sk-ant-api03-secret-super-sensitive-token-12345",
            "display_label": "Alice Anthropic Work",
        },
    )
    assert create_resp.status_code == 201
    cred_data = create_resp.json()
    assert cred_data["provider"] == "anthropic"
    assert "sk-ant-api03-secret-super-sensitive-token-12345" not in str(cred_data)
    assert "api_key" not in cred_data

    # List credentials
    list_resp = test_client.get("/api/credentials", headers=headers_a)
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) >= 1
    assert any(i["provider"] == "anthropic" for i in items)
    # Ensure plaintext key is never leaked
    for item in items:
        assert "api_key" not in item
        assert "secret-super-sensitive" not in str(item)


def test_credential_user_isolation(test_client: TestClient) -> None:
    """User B cannot see or delete User A's credentials."""
    token_a = _get_or_create_user(test_client, "alice_iso")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Alice creates credential
    create_resp = test_client.post(
        "/api/credentials",
        headers=headers_a,
        json={
            "provider": "anthropic",
            "api_key": "sk-ant-alice-private-key-12345",
            "display_label": "Alice Key",
        },
    )
    alice_cred_id = create_resp.json()["id"]

    # Bob creates account
    # Since alice_iso is owner, alice registers bob
    test_client.post(
        "/api/auth/register",
        headers=headers_a,
        json={"username": "bob_iso", "password": "StrongPassword123!", "display_name": "Bob"},
    )
    token_b = test_client.post(
        "/api/auth/login",
        json={"username": "bob_iso", "password": "StrongPassword123!"},
    ).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Bob lists credentials -> cannot see Alice's
    bob_creds = test_client.get("/api/credentials", headers=headers_b).json()
    assert not any(c["id"] == alice_cred_id for c in bob_creds)

    # Bob attempts to delete Alice's credential -> 404 Not Found
    delete_resp = test_client.delete(f"/api/credentials/{alice_cred_id}", headers=headers_b)
    assert delete_resp.status_code == 404

    # Alice can delete her own credential
    alice_del_resp = test_client.delete(f"/api/credentials/{alice_cred_id}", headers=headers_a)
    assert alice_del_resp.status_code == 204
