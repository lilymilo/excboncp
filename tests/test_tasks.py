"""
Tests for ExcbonCP Task Management and Workspace Isolation.
"""

from fastapi.testclient import TestClient

from server.tasks.service import _release_locks, acquire_lock


def _get_or_create_user(
    client: TestClient, username: str, password: str = "StrongPassword123!"
) -> str:
    client.post(
        "/api/auth/register",
        json={"username": username, "password": password, "display_name": username},
    )
    resp = client.post("/api/auth/login", json={"username": username, "password": password})
    return resp.json()["access_token"]


def test_task_creation_and_retrieval(test_client: TestClient) -> None:
    """User can create and retrieve tasks."""
    token = _get_or_create_user(test_client, "task_user_create")
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = test_client.post(
        "/api/tasks",
        headers=headers,
        json={
            "title": "Implement DApp Parcel Map",
            "description": "Render GeoJSON boundaries with Leaflet",
            "agent_type": "frontend",
        },
    )
    assert create_resp.status_code == 201
    task_id = create_resp.json()["id"]

    # Get task
    get_resp = test_client.get(f"/api/tasks/{task_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Implement DApp Parcel Map"
    assert get_resp.json()["status"] == "pending"


def test_task_status_lifecycle(test_client: TestClient) -> None:
    """Task status progresses from pending -> running -> completed."""
    token = _get_or_create_user(test_client, "task_user_life")
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = test_client.post(
        "/api/tasks",
        headers=headers,
        json={"title": "Lifecycle Task", "agent_type": "architect"},
    )
    task_id = create_resp.json()["id"]

    # Update to running
    run_resp = test_client.put(
        f"/api/tasks/{task_id}",
        headers=headers,
        json={"status": "running"},
    )
    assert run_resp.status_code == 200
    assert run_resp.json()["status"] == "running"

    # Update to completed with result
    comp_resp = test_client.put(
        f"/api/tasks/{task_id}",
        headers=headers,
        json={"status": "completed", "result": "ADR document written to docs/decisions.md"},
    )
    assert comp_resp.status_code == 200
    assert comp_resp.json()["status"] == "completed"
    assert "ADR document" in comp_resp.json()["result"]


def test_task_cancellation(test_client: TestClient) -> None:
    """Task can be cancelled."""
    token = _get_or_create_user(test_client, "task_user_cancel")
    headers = {"Authorization": f"Bearer {token}"}

    create_resp = test_client.post(
        "/api/tasks",
        headers=headers,
        json={"title": "Task to Cancel", "agent_type": "backend"},
    )
    task_id = create_resp.json()["id"]

    cancel_resp = test_client.post(f"/api/tasks/{task_id}/cancel", headers=headers)
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"


def test_file_locking_isolation() -> None:
    """File locks prevent two concurrent tasks from modifying identical files."""
    task_1 = "task-uuid-1"
    task_2 = "task-uuid-2"
    target_files = ["src/core/status_engine.py", "src/core/co2e.py"]

    # Task 1 acquires locks
    conflicts_1 = acquire_lock(task_1, target_files)
    assert conflicts_1 == []

    # Task 2 attempts to acquire locks on same files -> reports conflicts
    conflicts_2 = acquire_lock(task_2, target_files)
    assert len(conflicts_2) == 2
    assert "src/core/status_engine.py" in conflicts_2

    # Task 1 releases locks
    _release_locks(task_1)

    # Task 2 can now acquire locks
    conflicts_3 = acquire_lock(task_2, target_files)
    assert conflicts_3 == []
    _release_locks(task_2)
