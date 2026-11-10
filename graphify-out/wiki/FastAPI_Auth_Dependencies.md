# FastAPI Auth Dependencies

> 37 nodes · cohesion 0.09

## Key Concepts

- **dependencies.py** (29 connections) — `server/auth/dependencies.py`
- **credentials/router.py** (27 connections) — `server/credentials/router.py`
- **audit_auth_action()** (23 connections) — `server/auth/dependencies.py`
- **monitoring/router.py** (20 connections) — `server/monitoring/router.py`
- **logging** (18 connections)
- **auth/models.py** (18 connections) — `server/auth/models.py`
- **get_current_user()** (17 connections) — `server/auth/dependencies.py`
- **uuid** (11 connections)
- **FastAPI** (10 connections)
- **require_role()** (8 connections) — `server/auth/dependencies.py`
- **TokenPayload** (7 connections) — `server/auth/models.py`
- **audit.py** (7 connections) — `server/monitoring/audit.py`
- **datetime** (6 connections)
- **decode_access_token()** (6 connections) — `server/auth/service.py`
- **is_session_active()** (6 connections) — `server/auth/service.py`
- **log_audit()** (6 connections) — `server/monitoring/audit.py`
- **require_owner()** (5 connections) — `server/auth/dependencies.py`
- **jwt** (4 connections)
- **_extract_token()** (4 connections) — `server/auth/dependencies.py`
- **Request** (3 connections)
- **Any** (1 connections)
- **ExcbonCP Central Server — Auth dependencies for FastAPI. Provides dependency…** (1 connections) — `server/auth/dependencies.py`
- **Shortcut dependency — require the *owner* role.** (1 connections) — `server/auth/dependencies.py`
- **Helper to log an auth-related audit event.** (1 connections) — `server/auth/dependencies.py`
- **Pull the Bearer token from the Authorization header.** (1 connections) — `server/auth/dependencies.py`
- *... and 12 more nodes in this community*

## Relationships

- [Auth & User Models](Auth_&_User_Models.md) (43 shared connections)
- [Credential Vault Models](Credential_Vault_Models.md) (23 shared connections)
- [Task Management & Lifecycle](Task_Management_&_Lifecycle.md) (15 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (10 shared connections)
- [Database Module](Database_Module.md) (9 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (8 shared connections)
- [Agent Registry & Execution Models](Agent_Registry_&_Execution_Models.md) (7 shared connections)
- [Blockchain Attestation Router](Blockchain_Attestation_Router.md) (6 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (2 shared connections)
- [Admin Bootstrap & CLI](Admin_Bootstrap_&_CLI.md) (2 shared connections)
- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (1 shared connections)
- [Blockchain EAS Anchor Service](Blockchain_EAS_Anchor_Service.md) (1 shared connections)

## Source Files

- `server/auth/dependencies.py`
- `server/auth/models.py`
- `server/auth/service.py`
- `server/credentials/router.py`
- `server/monitoring/audit.py`
- `server/monitoring/router.py`

## Audit Trail

- EXTRACTED: 187 (98%)
- INFERRED: 4 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*