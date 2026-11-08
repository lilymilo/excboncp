"""
Tests for ExcbonCP Authentication, Session Management, and RBAC.
"""

from fastapi.testclient import TestClient


def test_register_first_user_is_owner(test_client: TestClient) -> None:
    """The very first registered user must automatically receive the 'owner' role."""
    response = test_client.post(
        "/api/auth/register",
        json={
            "username": "revand_admin",
            "password": "StrongPassword123!",
            "display_name": "Revand Aqila",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "revand_admin"
    assert data["role"] == "owner"
    assert data["is_active"] is True
    assert "id" in data


def test_register_second_user_is_member(test_client: TestClient) -> None:
    """Subsequent registrations by an owner produce users with 'member' role."""
    # 1. Register owner
    test_client.post(
        "/api/auth/register",
        json={
            "username": "first_owner",
            "password": "StrongPassword123!",
            "display_name": "First Owner",
        },
    )
    # 2. Login as owner
    login_resp = test_client.post(
        "/api/auth/login",
        json={"username": "first_owner", "password": "StrongPassword123!"},
    )
    owner_token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {owner_token}"}

    # 3. Owner registers second user
    response = test_client.post(
        "/api/auth/register",
        headers=headers,
        json={
            "username": "bagus_member",
            "password": "StrongPassword123!",
            "display_name": "Bagus IoT",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "bagus_member"
    assert data["role"] == "member"


def test_login_success(test_client: TestClient) -> None:
    """Valid credentials return a signed JWT access token."""
    test_client.post(
        "/api/auth/register",
        json={
            "username": "login_user",
            "password": "StrongPassword123!",
            "display_name": "Login User",
        },
    )
    response = test_client.post(
        "/api/auth/login",
        json={
            "username": "login_user",
            "password": "StrongPassword123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "login_user"


def test_login_invalid_password(test_client: TestClient) -> None:
    """Invalid credentials return 401 Unauthorized."""
    test_client.post(
        "/api/auth/register",
        json={
            "username": "login_user_2",
            "password": "StrongPassword123!",
            "display_name": "Login User 2",
        },
    )
    response = test_client.post(
        "/api/auth/login",
        json={
            "username": "login_user_2",
            "password": "WrongPassword999!",
        },
    )
    assert response.status_code == 401


def test_get_current_user_profile(test_client: TestClient) -> None:
    """Profile endpoint returns details of the currently authenticated user."""
    test_client.post(
        "/api/auth/register",
        json={"username": "profile_user", "password": "StrongPassword123!", "display_name": "Profile User"},
    )
    login_resp = test_client.post(
        "/api/auth/login",
        json={"username": "profile_user", "password": "StrongPassword123!"},
    )
    token = login_resp.json()["access_token"]

    response = test_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "profile_user"


def test_owner_can_update_user_role(test_client: TestClient) -> None:
    """Owner can change user roles."""
    # 1. Register owner
    test_client.post(
        "/api/auth/register",
        json={"username": "owner_admin", "password": "StrongPassword123!", "display_name": "Owner Admin"},
    )
    login_resp = test_client.post(
        "/api/auth/login",
        json={"username": "owner_admin", "password": "StrongPassword123!"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Register member
    reg_member = test_client.post(
        "/api/auth/register",
        headers=headers,
        json={"username": "bagus_role_test", "password": "StrongPassword123!", "display_name": "Bagus"},
    )
    member_id = reg_member.json()["id"]

    # 3. Change to auditor
    update_resp = test_client.put(
        f"/api/auth/users/{member_id}/role",
        headers=headers,
        json={"role": "auditor"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["role"] == "auditor"


def test_member_cannot_update_roles(test_client: TestClient) -> None:
    """Non-owner (member) receives 403 Forbidden when attempting user administration."""
    # Register owner
    test_client.post(
        "/api/auth/register",
        json={"username": "sys_owner", "password": "StrongPassword123!", "display_name": "Sys Owner"},
    )
    owner_token = test_client.post(
        "/api/auth/login",
        json={"username": "sys_owner", "password": "StrongPassword123!"},
    ).json()["access_token"]

    # Register member via owner
    test_client.post(
        "/api/auth/register",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={
            "username": "malik_member_test",
            "password": "StrongPassword123!",
            "display_name": "Malik DApp",
        },
    )

    # Member logs in
    login_resp = test_client.post(
        "/api/auth/login",
        json={"username": "malik_member_test", "password": "StrongPassword123!"},
    )
    member_token = login_resp.json()["access_token"]

    # Member tries owner-only endpoint
    response = test_client.get(
        "/api/auth/users",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert response.status_code == 403


def test_logout_revokes_token(test_client: TestClient) -> None:
    """Logout invalidates the session token."""
    test_client.post(
        "/api/auth/register",
        json={"username": "logout_user", "password": "StrongPassword123!", "display_name": "Logout User"},
    )
    login_resp = test_client.post(
        "/api/auth/login",
        json={"username": "logout_user", "password": "StrongPassword123!"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify active
    me_resp = test_client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200

    # Logout
    logout_resp = test_client.post("/api/auth/logout", headers=headers)
    assert logout_resp.status_code in (200, 204)

    # Verify rejected
    me_after_resp = test_client.get("/api/auth/me", headers=headers)
    assert me_after_resp.status_code == 401
