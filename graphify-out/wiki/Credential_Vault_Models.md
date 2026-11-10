# Credential Vault Models

> 47 nodes · cohesion 0.07

## Key Concepts

- **credentials/service.py** (21 connections) — `server/credentials/service.py`
- **CredentialResponse** (12 connections) — `server/credentials/models.py`
- **save_credential()** (10 connections) — `server/credentials/router.py`
- **update_own_credential()** (10 connections) — `server/credentials/router.py`
- **credentials/models.py** (9 connections) — `server/credentials/models.py`
- **create_credential()** (9 connections) — `server/credentials/service.py`
- **update_credential()** (9 connections) — `server/credentials/service.py`
- **delete_own_credential()** (8 connections) — `server/credentials/router.py`
- **CredentialCreate** (7 connections) — `server/credentials/models.py`
- **CredentialUpdate** (7 connections) — `server/credentials/models.py`
- **list_credentials()** (7 connections) — `server/credentials/router.py`
- **get_user_credentials()** (7 connections) — `server/credentials/service.py`
- **encrypt_credential()** (6 connections) — `server/credentials/service.py`
- **get_credential_for_agent()** (6 connections) — `server/credentials/service.py`
- **pydantic** (5 connections)
- **Provider** (5 connections) — `server/credentials/models.py`
- **delete_credential()** (5 connections) — `server/credentials/service.py`
- **Connection** (5 connections)
- **_row_to_response()** (5 connections) — `server/credentials/service.py`
- **list_providers()** (4 connections) — `server/credentials/router.py`
- **enum** (3 connections)
- **BaseModel** (3 connections)
- **Request** (3 connections)
- **get** (2 connections)
- **cryptography_fernet** (1 connections)
- *... and 22 more nodes in this community*

## Relationships

- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (23 shared connections)
- [Agent Registry & Execution Models](Agent_Registry_&_Execution_Models.md) (5 shared connections)
- [Credential Encryption & Agent Tests](Credential_Encryption_&_Agent_Tests.md) (5 shared connections)
- [Database Module](Database_Module.md) (4 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (4 shared connections)
- [Task Management & Lifecycle](Task_Management_&_Lifecycle.md) (2 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (1 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (1 shared connections)

## Source Files

- `server/credentials/models.py`
- `server/credentials/router.py`
- `server/credentials/service.py`

## Audit Trail

- EXTRACTED: 104 (88%)
- INFERRED: 14 (12%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*