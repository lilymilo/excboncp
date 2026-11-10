# Database Connection & ERD

> 22 nodes · cohesion 0.12

## Key Concepts

- **database.py** (32 connections) — `server/database.py`
- **main.py** (21 connections) — `server/main.py`
- **init_db()** (11 connections) — `server/database.py`
- **close_db()** (10 connections) — `server/database.py`
- **collections_abc** (6 connections)
- **lifespan()** (5 connections) — `server/main.py`
- **contextlib** (4 connections)
- **docs/models/ER_DIAGRAM.md** (4 connections) — `docs/models/ER_DIAGRAM.md`
- **root_discovery()** (3 connections) — `server/main.py`
- **Entity-Relationship Diagram (ERD)** (2 connections) — `docs/models/ER_DIAGRAM.md`
- **Metadata** (2 connections) — `docs/models/ER_DIAGRAM.md`
- **Relationship Notes** (1 connections) — `docs/models/ER_DIAGRAM.md`
- **Storage & Integrity Principles** (1 connections) — `docs/models/ER_DIAGRAM.md`
- **fastapi_middleware_cors** (1 connections)
- **fastapi_responses** (1 connections)
- **ExcbonCP Central Server — Database layer. Async SQLite connection management…** (1 connections) — `server/database.py`
- **Open the database and create tables if they don't exist.** (1 connections) — `server/database.py`
- **Close the database connection gracefully.** (1 connections) — `server/database.py`
- **get** (1 connections)
- **ExcbonCP Central Server — Main application entrypoint. FastAPI application…** (1 connections) — `server/main.py`
- **Application lifecycle manager: initialize database on startup and close on…** (1 connections) — `server/main.py`
- **Root endpoint for service discovery and documentation links.** (1 connections) — `server/main.py`

## Relationships

- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (10 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (8 shared connections)
- [Conftest Module](Conftest_Module.md) (6 shared connections)
- [Admin Bootstrap & CLI](Admin_Bootstrap_&_CLI.md) (4 shared connections)
- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (4 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (3 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (3 shared connections)
- [Blockchain API Integration Tests](Blockchain_API_Integration_Tests.md) (2 shared connections)
- [Agent Registry & Execution Models](Agent_Registry_&_Execution_Models.md) (2 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (2 shared connections)
- [Task Management & Lifecycle](Task_Management_&_Lifecycle.md) (2 shared connections)
- [Blockchain Attestation Router](Blockchain_Attestation_Router.md) (2 shared connections)

## Source Files

- `docs/models/ER_DIAGRAM.md`
- `server/database.py`
- `server/main.py`

## Audit Trail

- EXTRACTED: 83 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*