"""ExcbonCP — Test Fixtures.

Shared pytest fixtures for the ExcbonCP test suite.
Provides test database, client, users, and auth headers.
"""

import os
import sys
from collections.abc import Generator
from pathlib import Path
from typing import Any

import pytest

# Ensure project root is on the path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

# Set test environment variables before importing server modules
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-key-not-for-production-use-only-testing")
os.environ.setdefault(
    "CREDENTIAL_ENCRYPTION_KEY",
    "dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItY2ktb25seTE=",  # base64 test key
)
os.environ.setdefault("DATABASE_PATH", ":memory:")
os.environ.setdefault("LOG_LEVEL", "warning")


@pytest.fixture(scope="session")
def _setup_env() -> None:
    """Ensure environment variables are set for the test session."""
    pass


@pytest.fixture()
async def test_db(_setup_env: None) -> Any:
    """Create an in-memory SQLite database with the schema applied.

    Yields:
        Database connection ready for testing.
    """
    try:
        from server.database import close_db, get_db, init_db

        await init_db()
        db = await get_db()
        yield db
        await close_db()
    except ImportError:
        pytest.skip("Server modules not available")


@pytest.fixture()
def test_client(_setup_env: None) -> Generator[Any, None, None]:
    """Create a FastAPI TestClient with the test database.

    Yields:
        httpx-compatible test client.
    """
    try:
        from fastapi.testclient import TestClient

        from server.main import app

        with TestClient(app) as client:
            yield client
    except ImportError:
        pytest.skip("Server modules not available")


@pytest.fixture()
def test_user(test_client: Any) -> dict[str, Any]:
    """Create a test user and return their details.

    Returns:
        Dictionary with username, password, and user data.
    """
    user_data = {
        "username": "testuser",
        "password": "TestPassword123!",
        "display_name": "Test User",
    }

    response = test_client.post("/api/auth/register", json=user_data)

    # If registration requires owner, try to create as first user
    if response.status_code in (200, 201):
        return {**user_data, "response": response.json()}

    return user_data


@pytest.fixture()
def test_owner(test_client: Any) -> dict[str, Any]:
    """Create a test owner user and return their details.

    The first registered user typically becomes the owner.

    Returns:
        Dictionary with username, password, and user data.
    """
    owner_data = {
        "username": "testowner",
        "password": "OwnerPassword123!",
        "display_name": "Test Owner",
    }

    response = test_client.post("/api/auth/register", json=owner_data)

    if response.status_code in (200, 201):
        return {**owner_data, "response": response.json()}

    return owner_data


@pytest.fixture()
def auth_headers(test_client: Any, test_user: dict[str, Any]) -> dict[str, str]:
    """Return authorization headers for the test user.

    Returns:
        Dictionary with Authorization header containing Bearer token.
    """
    response = test_client.post(
        "/api/auth/login",
        json={
            "username": test_user["username"],
            "password": test_user["password"],
        },
    )

    if response.status_code == 200:
        token = response.json().get("access_token", "")
        return {"Authorization": f"Bearer {token}"}

    return {"Authorization": "Bearer test-token-unavailable"}


@pytest.fixture()
def owner_headers(test_client: Any, test_owner: dict[str, Any]) -> dict[str, str]:
    """Return authorization headers for the owner user.

    Returns:
        Dictionary with Authorization header containing Bearer token.
    """
    response = test_client.post(
        "/api/auth/login",
        json={
            "username": test_owner["username"],
            "password": test_owner["password"],
        },
    )

    if response.status_code == 200:
        token = response.json().get("access_token", "")
        return {"Authorization": f"Bearer {token}"}

    return {"Authorization": "Bearer test-owner-token-unavailable"}
