"""
Tests for ExcbonCP 8 Specialized Agents and Orchestration Registry.
"""

from fastapi.testclient import TestClient


def _get_or_create_user(client: TestClient, username: str, password: str = "StrongPassword123!") -> str:
    # Try register
    client.post(
        "/api/auth/register",
        json={"username": username, "password": password, "display_name": username},
    )
    # Login
    resp = client.post("/api/auth/login", json={"username": username, "password": password})
    return resp.json()["access_token"]


def test_list_all_eight_agents(test_client: TestClient) -> None:
    """Agent registry must expose all 8 required specialized engineering agents."""
    token = _get_or_create_user(test_client, "agent_tester_1")
    headers = {"Authorization": f"Bearer {token}"}

    resp = test_client.get("/api/agents", headers=headers)
    assert resp.status_code == 200
    agents = resp.json()
    assert len(agents) == 8

    agent_types = [a["type"] for a in agents]
    expected_agents = [
        "architect",
        "backend",
        "frontend",
        "iot",
        "data_ai",
        "blockchain",
        "security",
        "reviewer",
    ]
    for ea in expected_agents:
        assert ea in agent_types, f"Missing agent: {ea}"


def test_get_specific_agent_definition(test_client: TestClient) -> None:
    """Detailed agent definition must include allowed/restricted directories and context."""
    token = _get_or_create_user(test_client, "agent_tester_2")
    headers = {"Authorization": f"Bearer {token}"}

    resp = test_client.get("/api/agents/iot", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "IoT Agent"
    assert "firmware/" in str(data["allowed_dirs"])
    assert "frontend/" in str(data["restricted_dirs"])


def test_execute_agent_fails_without_credentials(test_client: TestClient) -> None:
    """Agent execution must fail cleanly if caller has not configured their provider credential."""
    token = _get_or_create_user(test_client, "nocred_user")
    headers = {"Authorization": f"Bearer {token}"}

    resp = test_client.post(
        "/api/agents/execute",
        headers=headers,
        json={
            "agent_type": "backend",
            "task_description": "Add database migration for new column",
            "provider": "anthropic",
        },
    )
    assert resp.status_code == 400
    detail = resp.json()["detail"]
    assert "No active" in detail and "credential" in detail


def test_execute_agent_succeeds_with_credentials(test_client: TestClient) -> None:
    """Agent execution queues task when user has configured their API credential."""
    token = _get_or_create_user(test_client, "cred_user")
    headers = {"Authorization": f"Bearer {token}"}

    # Store Anthropic key
    test_client.post(
        "/api/credentials",
        headers=headers,
        json={
            "provider": "anthropic",
            "api_key": "sk-ant-test-key-for-execution-testing",
            "display_label": "Testing Key",
        },
    )

    resp = test_client.post(
        "/api/agents/execute",
        headers=headers,
        json={
            "agent_type": "backend",
            "task_description": "Implement sensor data validation logic",
            "provider": "anthropic",
        },
    )
    assert resp.status_code in (200, 202)
    res_data = resp.json()
    assert "task_id" in res_data
    assert res_data["agent_type"] == "backend"
    assert res_data["status"] == "pending"
