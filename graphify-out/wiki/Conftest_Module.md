# Conftest Module

> 19 nodes · cohesion 0.17

## Key Concepts

- **tests/conftest.py** (18 connections) — `tests/conftest.py`
- **test_db()** (8 connections) — `tests/conftest.py`
- **fixture** (7 connections)
- **pathlib** (6 connections)
- **Any** (6 connections)
- **test_client()** (5 connections) — `tests/conftest.py`
- **auth_headers()** (4 connections) — `tests/conftest.py`
- **owner_headers()** (4 connections) — `tests/conftest.py`
- **test_owner()** (4 connections) — `tests/conftest.py`
- **test_user()** (4 connections) — `tests/conftest.py`
- **_setup_env()** (3 connections) — `tests/conftest.py`
- **ExcbonCP — Test Fixtures. Shared pytest fixtures for the ExcbonCP test suite.…** (1 connections) — `tests/conftest.py`
- **Return authorization headers for the test user. Returns: Dictionary with…** (1 connections) — `tests/conftest.py`
- **Return authorization headers for the owner user. Returns: Dictionary with…** (1 connections) — `tests/conftest.py`
- **Ensure environment variables are set for the test session.** (1 connections) — `tests/conftest.py`
- **Create an in-memory SQLite database with the schema applied. Yields: Database…** (1 connections) — `tests/conftest.py`
- **Create a FastAPI TestClient with the test database. Yields: httpx-compatible…** (1 connections) — `tests/conftest.py`
- **Create a test user and return their details. Returns: Dictionary with username,…** (1 connections) — `tests/conftest.py`
- **Create a test owner user and return their details. The first registered user…** (1 connections) — `tests/conftest.py`

## Relationships

- [Database Connection & ERD](Database_Connection_&_ERD.md) (6 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (3 shared connections)
- [Admin Bootstrap & CLI](Admin_Bootstrap_&_CLI.md) (2 shared connections)
- [Database Module](Database_Module.md) (2 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (2 shared connections)
- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (1 shared connections)
- [Task Management & Lifecycle](Task_Management_&_Lifecycle.md) (1 shared connections)
- [Blockchain API Integration Tests](Blockchain_API_Integration_Tests.md) (1 shared connections)
- [Contribution Guidelines](Contribution_Guidelines.md) (1 shared connections)

## Source Files

- `tests/conftest.py`

## Audit Trail

- EXTRACTED: 48 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*