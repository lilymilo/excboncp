"""
Tests for ExcbonCP Health Monitoring, System Metrics, and Audit Trails.
"""

from fastapi.testclient import TestClient


def _get_or_create_user(
    client: TestClient, username: str, password: str = "StrongPassword123!"
) -> str:
    client.post(
        "/api/auth/register",
        json={"username": username, "password": password, "display_name": username},
    )
    resp = client.post("/api/auth/login", json={"username": username, "password": password})
    return resp.json()["access_token"]


def test_health_check_unauthenticated(test_client: TestClient) -> None:
    """Health check endpoints must be accessible without authentication."""
    resp1 = test_client.get("/api/health")
    assert resp1.status_code == 200
    assert resp1.json()["status"] == "healthy"
    assert resp1.json()["database"] == "connected"

    resp2 = test_client.get("/health")
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "healthy"


def test_server_status_authenticated(test_client: TestClient) -> None:
    """Detailed server status requires authentication."""
    # Unauthenticated -> 401
    assert test_client.get("/api/monitoring/status").status_code == 401

    token = _get_or_create_user(test_client, "mon_user_status")
    resp = test_client.get("/api/monitoring/status", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "online"
    assert "python_version" in data
    assert "database" in data


def test_system_metrics_aggregation(test_client: TestClient) -> None:
    """Operational metrics return counts of users, tasks, and credentials."""
    token = _get_or_create_user(test_client, "mon_user_metrics")
    resp = test_client.get("/api/monitoring/metrics", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "users" in data
    assert "tasks" in data
    assert "credentials" in data
    assert "audit_logs" in data


def test_audit_logs_role_enforcement(test_client: TestClient) -> None:
    """Only owner and auditor roles can query audit logs; members receive 403."""
    # 1. Register owner (first user)
    token_owner = _get_or_create_user(test_client, "owner_for_audit")
    headers_owner = {"Authorization": f"Bearer {token_owner}"}

    # 2. Owner registers member
    test_client.post(
        "/api/auth/register",
        headers=headers_owner,
        json={
            "username": "member_for_audit",
            "password": "StrongPassword123!",
            "display_name": "Member",
        },
    )
    token_member = test_client.post(
        "/api/auth/login",
        json={"username": "member_for_audit", "password": "StrongPassword123!"},
    ).json()["access_token"]
    headers_member = {"Authorization": f"Bearer {token_member}"}

    # Member user query -> 403 Forbidden
    resp_member = test_client.get("/api/monitoring/audit-logs", headers=headers_member)
    assert resp_member.status_code == 403

    # Owner user query -> 200 OK
    resp_owner = test_client.get("/api/monitoring/audit-logs", headers=headers_owner)
    assert resp_owner.status_code == 200
    data = resp_owner.json()
    assert "logs" in data
    assert "count" in data
    assert data["count"] > 0


def test_public_metrics_endpoint(test_client: TestClient) -> None:
    """Public metrics endpoints /metrics and /api/metrics are accessible without auth."""
    resp1 = test_client.get("/metrics")
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert "total_verified_co2e_tons" in data1
    assert "estimated_community_share_idr" in data1
    assert "data_to_status_latency_seconds" in data1
    assert data1["label"] == "Simulasi, testnet"

    resp2 = test_client.get("/api/metrics")
    assert resp2.status_code == 200
    assert resp2.json()["label"] == "Simulasi, testnet"
