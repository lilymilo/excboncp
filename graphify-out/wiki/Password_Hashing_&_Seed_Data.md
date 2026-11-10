# Password Hashing & Seed Data

> 33 nodes · cohesion 0.11

## Key Concepts

- **seed.py** (27 connections) — `server/seed.py`
- **test_seed.py** (20 connections) — `tests/test_seed.py`
- **seed_demo_data()** (16 connections) — `server/seed.py`
- **hash_password()** (12 connections) — `server/auth/service.py`
- **_main()** (10 connections) — `server/seed.py`
- **load_seed_data()** (9 connections) — `server/seed.py`
- **json** (8 connections)
- **_seed_ledger_blocks()** (6 connections) — `server/seed.py`
- **_insert_rows()** (5 connections) — `server/seed.py`
- **Connection** (5 connections)
- **test_seed_loads_parcels_accounts_and_readings()** (5 connections) — `tests/test_seed.py`
- **test_seed_rejects_short_password()** (5 connections) — `tests/test_seed.py`
- **_print_seed_accounts()** (4 connections) — `server/seed.py`
- **Any** (4 connections)
- **test_seed_file_is_explicitly_simulated_and_has_no_passwords()** (4 connections) — `tests/test_seed.py`
- **test_seed_is_idempotent()** (4 connections) — `tests/test_seed.py`
- **test_seed_links_existing_auth_account_without_overwriting_role()** (4 connections) — `tests/test_seed.py`
- **Connection** (3 connections)
- **Path** (2 connections)
- **Return a bcrypt hash of *password*.** (1 connections) — `server/auth/service.py`
- **ExcbonCP — Simulation-only seed loader (Blueprint v5, Day 1). Loads…** (1 connections) — `server/seed.py`
- **Insert simulation-only demo data into an initialised database. Args: db: Active…** (1 connections) — `server/seed.py`
- **Print the demo accounts without exposing password hashes.** (1 connections) — `server/seed.py`
- **CLI entry point: initialise the database and load seed data.** (1 connections) — `server/seed.py`
- **Load and validate the simulation seed file.** (1 connections) — `server/seed.py`
- *... and 8 more nodes in this community*

## Relationships

- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (9 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (8 shared connections)
- [Auth — Service](Auth_—_Service.md) (7 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (6 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (4 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (4 shared connections)
- [Admin Bootstrap & CLI](Admin_Bootstrap_&_CLI.md) (3 shared connections)
- [Blockchain API Integration Tests](Blockchain_API_Integration_Tests.md) (2 shared connections)
- [Database Module](Database_Module.md) (2 shared connections)
- [Credential Encryption & Agent Tests](Credential_Encryption_&_Agent_Tests.md) (1 shared connections)
- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (1 shared connections)
- [Conftest Module](Conftest_Module.md) (1 shared connections)

## Source Files

- `server/auth/service.py`
- `server/seed.py`
- `tests/test_seed.py`

## Audit Trail

- EXTRACTED: 108 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*