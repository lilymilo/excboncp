# Database Schema & Verification Tests

> 26 nodes · cohesion 0.12

## Key Concepts

- **test_schema.py** (14 connections) — `tests/test_schema.py`
- **aiosqlite** (13 connections)
- **pytest** (12 connections)
- **R1–R14: Mandatory Demo** (11 connections) — `docs/requirements-traceability.md`
- **_table_columns()** (8 connections) — `server/database.py`
- **_migrate_schema()** (7 connections) — `server/database.py`
- **Metadata** (5 connections) — `docs/database-schema.md`
- **Connection** (5 connections)
- **test_migration_adds_r23_columns_to_legacy_users_table()** (5 connections) — `tests/test_schema.py`
- **get_db_context()** (4 connections) — `server/database.py`
- **Connection** (4 connections)
- **test_foreign_keys_are_enforced()** (4 connections) — `tests/test_schema.py`
- **test_sensor_columns_follow_blueprint_v5()** (4 connections) — `tests/test_schema.py`
- **test_sensor_source_must_be_esp_or_simulator()** (4 connections) — `tests/test_schema.py`
- **test_users_table_supports_r23()** (4 connections) — `tests/test_schema.py`
- **test_mrv_tables_exist()** (3 connections) — `tests/test_schema.py`
- **Return the column names for *table*, or an empty set if it does not exist.** (1 connections) — `server/database.py`
- **Apply additive migrations for databases created by earlier versions. The users…** (1 connections) — `server/database.py`
- **Async context manager wrapper around *get_db* for convenience.** (1 connections) — `server/database.py`
- **Tests for the Blueprint v5 Model 6 SQLite schema. These tests protect the…** (1 connections) — `tests/test_schema.py`
- **Databases created before R23 receive additive columns without data loss.** (1 connections) — `tests/test_schema.py`
- **All Model 6 tables are created during startup.** (1 connections) — `tests/test_schema.py`
- **Sensor readings use the Blueprint v5 Model 3 fields, not legacy names.** (1 connections) — `tests/test_schema.py`
- **The users table stores the R23 email, parcel, and zone links.** (1 connections) — `tests/test_schema.py`
- **A sensor reading cannot reference a parcel that does not exist.** (1 connections) — `tests/test_schema.py`
- *... and 1 more nodes in this community*

## Relationships

- [Database Connection & ERD](Database_Connection_&_ERD.md) (8 shared connections)
- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (8 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (4 shared connections)
- [Blockchain EAS Anchor Service](Blockchain_EAS_Anchor_Service.md) (4 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (3 shared connections)
- [Conftest Module](Conftest_Module.md) (3 shared connections)
- [Blockchain API Integration Tests](Blockchain_API_Integration_Tests.md) (2 shared connections)
- [Database Module](Database_Module.md) (2 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (1 shared connections)
- [Credential Vault Models](Credential_Vault_Models.md) (1 shared connections)
- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (1 shared connections)
- [Task Management & Lifecycle](Task_Management_&_Lifecycle.md) (1 shared connections)

## Source Files

- `docs/database-schema.md`
- `docs/requirements-traceability.md`
- `server/database.py`
- `tests/test_schema.py`

## Audit Trail

- EXTRACTED: 79 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*