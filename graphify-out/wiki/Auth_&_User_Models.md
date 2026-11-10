# Auth & User Models

> 71 nodes · cohesion 0.06

## Key Concepts

- **UserResponse** (48 connections) — `server/auth/models.py`
- **auth/service.py** (40 connections) — `server/auth/service.py`
- **auth/router.py** (37 connections) — `server/auth/router.py`
- **get_user_by_id()** (13 connections) — `server/auth/service.py`
- **Connection** (13 connections)
- **create_user()** (12 connections) — `server/auth/service.py`
- **login()** (11 connections) — `server/auth/router.py`
- **change_role()** (10 connections) — `server/auth/router.py`
- **change_status()** (10 connections) — `server/auth/router.py`
- **register()** (10 connections) — `server/auth/router.py`
- **authenticate_user()** (10 connections) — `server/auth/service.py`
- **UserCreate** (9 connections) — `server/auth/models.py`
- **update_me()** (9 connections) — `server/auth/router.py`
- **update_user()** (9 connections) — `server/auth/service.py`
- **BaseModel** (8 connections)
- **logout()** (8 connections) — `server/auth/router.py`
- **_row_to_user()** (8 connections) — `server/auth/service.py`
- **update_user_status()** (8 connections) — `server/auth/service.py`
- **TokenResponse** (7 connections) — `server/auth/models.py`
- **UserUpdate** (7 connections) — `server/auth/models.py`
- **create_session()** (7 connections) — `server/auth/service.py`
- **get_user_by_username()** (7 connections) — `server/auth/service.py`
- **list_users()** (7 connections) — `server/auth/service.py`
- **update_user_role()** (7 connections) — `server/auth/service.py`
- **get_users()** (6 connections) — `server/auth/router.py`
- *... and 46 more nodes in this community*

## Relationships

- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (43 shared connections)
- [Database Module](Database_Module.md) (11 shared connections)
- [Task Management & Lifecycle](Task_Management_&_Lifecycle.md) (7 shared connections)
- [Admin Bootstrap & CLI](Admin_Bootstrap_&_CLI.md) (6 shared connections)
- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (6 shared connections)
- [Blockchain Attestation Router](Blockchain_Attestation_Router.md) (5 shared connections)
- [Credential Vault Models](Credential_Vault_Models.md) (4 shared connections)
- [Auth — Service](Auth_—_Service.md) (4 shared connections)
- [Agent Registry & Execution Models](Agent_Registry_&_Execution_Models.md) (3 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (2 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (2 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (1 shared connections)

## Source Files

- `server/auth/models.py`
- `server/auth/router.py`
- `server/auth/service.py`

## Audit Trail

- EXTRACTED: 212 (83%)
- INFERRED: 43 (17%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*