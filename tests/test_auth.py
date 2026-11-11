"""
Tests for ExcbonCP Authentication, Session Management, and RBAC.
"""

import pytest
from fastapi.testclient import TestClient

from server.database import get_db


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
        json={
            "username": "profile_user",
            "password": "StrongPassword123!",
            "display_name": "Profile User",
        },
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
        json={
            "username": "owner_admin",
            "password": "StrongPassword123!",
            "display_name": "Owner Admin",
        },
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
        json={
            "username": "bagus_role_test",
            "password": "StrongPassword123!",
            "display_name": "Bagus",
        },
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
        json={
            "username": "sys_owner",
            "password": "StrongPassword123!",
            "display_name": "Sys Owner",
        },
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
        json={
            "username": "logout_user",
            "password": "StrongPassword123!",
            "display_name": "Logout User",
        },
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


@pytest.fixture()
async def seeded_test_entities(test_client: TestClient) -> None:
    db = await get_db()
    await db.execute(
        "INSERT OR IGNORE INTO parcels (id, name, polygon_geojson, area_hectares, vegetation_type, baseline_ndvi, owner_wallet, created_at) "
        "VALUES ('PARCEL-A', 'Lahan A', '{}', 100.0, 'forest', 0.75, '0xwallet', '2026-11-08T00:00:00Z')"
    )
    await db.execute(
        "INSERT OR IGNORE INTO zones (id, name, type, jurisdiction, created_at) "
        "VALUES ('ZONE-DEMO-A', 'Zona Demo A', 'kek', 'ID', '2026-11-08T00:00:00Z')"
    )
    await db.commit()


def test_public_guest_registration_community_with_parcel(
    test_client: TestClient, seeded_test_entities: None
) -> None:
    """Guest users can register themselves as community role linked to a parcel."""
    test_client.post(
        "/api/auth/register",
        json={"username": "sys_owner", "password": "Password123!", "display_name": "Sys Owner"},
    )
    resp = test_client.post(
        "/auth/register",
        json={
            "username": "warga_desa_a",
            "email": "warga@desa.id",
            "password": "Password123!",
            "display_name": "Pak RT",
            "role": "community",
            "parcel_id": "PARCEL-A",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "warga_desa_a"
    assert data["role"] == "community"
    assert data["email"] == "warga@desa.id"
    assert data["parcel_id"] == "PARCEL-A"


def test_public_guest_registration_manager_and_receiver(
    test_client: TestClient, seeded_test_entities: None
) -> None:
    """Guest users can register as manager or receiver with zone linkage."""
    test_client.post(
        "/api/auth/register",
        json={"username": "sys_owner", "password": "Password123!", "display_name": "Sys Owner"},
    )
    resp_mgr = test_client.post(
        "/auth/register",
        json={
            "username": "kth_manager",
            "email": "mgr@hutan.id",
            "password": "Password123!",
            "display_name": "Ketua KTH",
            "role": "manager",
            "parcel_id": "PARCEL-A",
        },
    )
    assert resp_mgr.status_code == 201
    assert resp_mgr.json()["role"] == "manager"

    resp_rec = test_client.post(
        "/auth/register",
        json={
            "username": "kek_batang_admin",
            "email": "batang@kek.go.id",
            "password": "Password123!",
            "display_name": "Admin KEK",
            "role": "receiver",
            "zone_id": "ZONE-DEMO-A",
        },
    )
    assert resp_rec.status_code == 201
    assert resp_rec.json()["role"] == "receiver"
    assert resp_rec.json()["zone_id"] == "ZONE-DEMO-A"


def test_public_guest_registration_rejects_auditor_and_admin(test_client: TestClient) -> None:
    """Public guest registration strictly blocks auditor and admin roles."""
    test_client.post(
        "/api/auth/register",
        json={"username": "sys_owner", "password": "Password123!", "display_name": "Sys Owner"},
    )
    resp_auditor = test_client.post(
        "/auth/register",
        json={
            "username": "self_appointed_auditor",
            "password": "Password123!",
            "display_name": "Fraud Auditor",
            "role": "auditor",
        },
    )
    assert resp_auditor.status_code == 403
    assert "Auditor" in resp_auditor.json()["detail"]

    resp_admin = test_client.post(
        "/auth/register",
        json={
            "username": "self_appointed_admin",
            "password": "Password123!",
            "display_name": "Fraud Admin",
            "role": "owner",
        },
    )
    assert resp_admin.status_code == 403


def test_login_with_email_or_username(test_client: TestClient) -> None:
    """Users can authenticate using either username or registered email."""
    test_client.post(
        "/api/auth/register",
        json={
            "username": "dual_login_user",
            "email": "dual@domain.test",
            "password": "Password123!",
            "display_name": "Dual Login",
        },
    )
    # Login by username
    resp1 = test_client.post(
        "/auth/login",
        json={"username": "dual_login_user", "password": "Password123!"},
    )
    assert resp1.status_code == 200
    assert resp1.json()["user"]["username"] == "dual_login_user"

    # Login by email
    resp2 = test_client.post(
        "/auth/login",
        json={"username": "dual@domain.test", "password": "Password123!"},
    )
    assert resp2.status_code == 200
    assert resp2.json()["user"]["username"] == "dual_login_user"


def test_login_rate_limiting_lockout(test_client: TestClient) -> None:
    """Five consecutive failed logins trigger a 429 lockout."""
    from server.auth.service import reset_failed_attempts

    reset_failed_attempts()

    test_client.post(
        "/api/auth/register",
        json={
            "username": "lockout_target",
            "password": "CorrectPassword123!",
            "display_name": "Target",
        },
    )

    for _ in range(5):
        resp = test_client.post(
            "/auth/login",
            json={"username": "lockout_target", "password": "WrongPassword999!"},
        )
        assert resp.status_code == 401

    # 6th attempt should be blocked by rate limit lockout
    blocked_resp = test_client.post(
        "/auth/login",
        json={"username": "lockout_target", "password": "CorrectPassword123!"},
    )
    assert blocked_resp.status_code == 429
    assert "terlalu banyak" in blocked_resp.json()["detail"].lower()
    reset_failed_attempts()


def test_blueprint_v5_alias_routes(test_client: TestClient) -> None:
    """Model 8 route aliases /auth/register, /auth/login, /auth/logout, and /me work."""
    from server.auth.service import reset_failed_attempts

    reset_failed_attempts()

    reg_resp = test_client.post(
        "/auth/register",
        json={
            "username": "alias_tester",
            "password": "Password123!",
            "display_name": "Alias Tester",
            "role": "community",
        },
    )
    assert reg_resp.status_code == 201

    login_resp = test_client.post(
        "/auth/login",
        json={"username": "alias_tester", "password": "Password123!"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_resp = test_client.get("/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "alias_tester"

    logout_resp = test_client.post("/auth/logout", headers=headers)
    assert logout_resp.status_code in (200, 204)
