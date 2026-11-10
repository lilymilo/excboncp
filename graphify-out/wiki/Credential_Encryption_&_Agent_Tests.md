# Credential Encryption & Agent Tests

> 44 nodes · cohesion 0.07

## Key Concepts

- **test_security.py** (13 connections) — `tests/test_security.py`
- **fastapi_testclient** (8 connections)
- **test_agents.py** (7 connections) — `tests/test_agents.py`
- **test_monitoring.py** (7 connections) — `tests/test_monitoring.py`
- **_get_or_create_user()** (6 connections) — `tests/test_agents.py`
- **test_credentials.py** (6 connections) — `tests/test_credentials.py`
- **decrypt_credential()** (5 connections) — `server/credentials/service.py`
- **TestClient** (5 connections)
- **_get_or_create_user()** (5 connections) — `tests/test_monitoring.py`
- **TestClient** (5 connections)
- **test_execute_agent_fails_without_credentials()** (4 connections) — `tests/test_agents.py`
- **test_execute_agent_succeeds_with_credentials()** (4 connections) — `tests/test_agents.py`
- **test_get_specific_agent_definition()** (4 connections) — `tests/test_agents.py`
- **test_list_all_eight_agents()** (4 connections) — `tests/test_agents.py`
- **_get_or_create_user()** (4 connections) — `tests/test_credentials.py`
- **TestClient** (4 connections)
- **test_create_and_list_own_credential()** (4 connections) — `tests/test_credentials.py`
- **test_credential_user_isolation()** (4 connections) — `tests/test_credentials.py`
- **test_audit_logs_role_enforcement()** (4 connections) — `tests/test_monitoring.py`
- **test_server_status_authenticated()** (4 connections) — `tests/test_monitoring.py`
- **test_system_metrics_aggregation()** (4 connections) — `tests/test_monitoring.py`
- **test_fernet_encryption_roundtrip()** (4 connections) — `tests/test_security.py`
- **test_list_supported_providers()** (3 connections) — `tests/test_credentials.py`
- **test_health_check_unauthenticated()** (3 connections) — `tests/test_monitoring.py`
- **test_root_discovery_endpoint()** (3 connections) — `tests/test_security.py`
- *... and 19 more nodes in this community*

## Relationships

- [Credential Vault Models](Credential_Vault_Models.md) (5 shared connections)
- [Auth — Service](Auth_—_Service.md) (3 shared connections)
- [Blockchain API Integration Tests](Blockchain_API_Integration_Tests.md) (1 shared connections)
- [Authentication & RBAC Test Suite](Authentication_&_RBAC_Test_Suite.md) (1 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (1 shared connections)
- [Tasks — Service](Tasks_—_Service.md) (1 shared connections)
- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (1 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (1 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (1 shared connections)

## Source Files

- `server/credentials/service.py`
- `tests/test_agents.py`
- `tests/test_credentials.py`
- `tests/test_monitoring.py`
- `tests/test_security.py`

## Audit Trail

- EXTRACTED: 79 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*