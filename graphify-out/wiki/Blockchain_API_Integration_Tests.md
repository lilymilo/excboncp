# Blockchain API Integration Tests

> 21 nodes · cohesion 0.16

## Key Concepts

- **test_blockchain_api.py** (26 connections) — `tests/blockchain/test_blockchain_api.py`
- **Any** (8 connections)
- **blockchain_client()** (7 connections) — `tests/blockchain/test_blockchain_api.py`
- **_login()** (7 connections) — `tests/blockchain/test_blockchain_api.py`
- **_seed_api_database()** (7 connections) — `tests/blockchain/test_blockchain_api.py`
- **test_full_attestation_flow()** (4 connections) — `tests/blockchain/test_blockchain_api.py`
- **test_attest_missing_block_returns_404()** (3 connections) — `tests/blockchain/test_blockchain_api.py`
- **test_attest_rejects_identity_mismatch()** (3 connections) — `tests/blockchain/test_blockchain_api.py`
- **test_double_attestation_returns_conflict()** (3 connections) — `tests/blockchain/test_blockchain_api.py`
- **test_non_auditor_cannot_attest()** (3 connections) — `tests/blockchain/test_blockchain_api.py`
- **sqlite3** (2 connections)
- **Path** (2 connections)
- **test_schema_registration_requires_authentication()** (2 connections) — `tests/blockchain/test_blockchain_api.py`
- **test_simulation_status_is_public()** (2 connections) — `tests/blockchain/test_blockchain_api.py`
- **fixture** (1 connections)
- **MonkeyPatch** (1 connections)
- **TestClient** (1 connections)
- **HTTP-level tests for the Day 3 blockchain endpoints.** (1 connections) — `tests/blockchain/test_blockchain_api.py`
- **Run the app against a temporary file database with seeded blockchain data.** (1 connections) — `tests/blockchain/test_blockchain_api.py`
- **Register the schema, anchor block 1, then query status and the list.** (1 connections) — `tests/blockchain/test_blockchain_api.py`
- **Insert one parcel, an auditor, a member, and one valid ledger block.** (1 connections) — `tests/blockchain/test_blockchain_api.py`

## Relationships

- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (6 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (2 shared connections)
- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (2 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (2 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (2 shared connections)
- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (1 shared connections)
- [Conftest Module](Conftest_Module.md) (1 shared connections)
- [Credential Encryption & Agent Tests](Credential_Encryption_&_Agent_Tests.md) (1 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (1 shared connections)

## Source Files

- `tests/blockchain/test_blockchain_api.py`

## Audit Trail

- EXTRACTED: 52 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*