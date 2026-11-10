# Database Module

> 12 nodes · cohesion 0.24

## Key Concepts

- **get_db()** (44 connections) — `server/database.py`
- **query_audit_logs()** (6 connections) — `server/monitoring/router.py`
- **server_metrics()** (6 connections) — `server/monitoring/router.py`
- **health_check()** (5 connections) — `server/monitoring/router.py`
- **server_status()** (5 connections) — `server/monitoring/router.py`
- **Any** (4 connections)
- **get** (4 connections)
- **Return the active database connection. Raises *RuntimeError* if the database…** (1 connections) — `server/database.py`
- **Query audit log entries with optional filters for compliance and security audit.** (1 connections) — `server/monitoring/router.py`
- **Health check endpoint for Docker, load balancers, and monitoring scripts.** (1 connections) — `server/monitoring/router.py`
- **Return runtime system information and environment status.** (1 connections) — `server/monitoring/router.py`
- **Return task, user, and credential aggregations.** (1 connections) — `server/monitoring/router.py`

## Relationships

- [Auth & User Models](Auth_&_User_Models.md) (11 shared connections)
- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (9 shared connections)
- [Task Management & Lifecycle](Task_Management_&_Lifecycle.md) (7 shared connections)
- [Credential Vault Models](Credential_Vault_Models.md) (4 shared connections)
- [Admin Bootstrap & CLI](Admin_Bootstrap_&_CLI.md) (2 shared connections)
- [Agent Registry & Execution Models](Agent_Registry_&_Execution_Models.md) (2 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (2 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (2 shared connections)
- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (2 shared connections)
- [Blockchain EAS Anchor Service](Blockchain_EAS_Anchor_Service.md) (2 shared connections)
- [Conftest Module](Conftest_Module.md) (2 shared connections)
- [Blockchain Attestation Router](Blockchain_Attestation_Router.md) (1 shared connections)

## Source Files

- `server/database.py`
- `server/monitoring/router.py`

## Audit Trail

- EXTRACTED: 60 (95%)
- INFERRED: 3 (5%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*