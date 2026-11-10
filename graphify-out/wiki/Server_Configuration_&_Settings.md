# Server Configuration & Settings

> 32 nodes · cohesion 0.09

## Key Concepts

- **eas.py** (27 connections) — `src/blockchain/eas.py`
- **config.py** (19 connections) — `server/config.py`
- **blockchain/conftest.py** (15 connections) — `tests/blockchain/conftest.py`
- **typing** (13 connections)
- **os** (8 connections)
- **secrets** (8 connections)
- **reset_eas_client()** (7 connections) — `src/blockchain/eas.py`
- **dataclasses** (5 connections)
- **eas_client()** (5 connections) — `tests/blockchain/conftest.py`
- **fixture** (5 connections)
- **sample_ledger_blocks()** (5 connections) — `tests/blockchain/conftest.py`
- **_load_settings()** (4 connections) — `server/config.py`
- **auditor_user()** (4 connections) — `tests/blockchain/conftest.py`
- **member_user()** (4 connections) — `tests/blockchain/conftest.py`
- **_reset_eas_singleton()** (4 connections) — `tests/blockchain/conftest.py`
- **Settings** (3 connections) — `server/config.py`
- **AttestationResult** (3 connections) — `src/blockchain/eas.py`
- **Any** (3 connections)
- **_compute_schema_id()** (2 connections) — `src/blockchain/eas.py`
- **ExcbonCP Central Server — Configuration. Loads settings from environment…** (1 connections) — `server/config.py`
- **Immutable application settings loaded once at import time.** (1 connections) — `server/config.py`
- **Build a *Settings* instance from the environment.** (1 connections) — `server/config.py`
- **ExcbonCP — EAS (Ethereum Attestation Service) Attestation Client. Day 3…** (1 connections) — `src/blockchain/eas.py`
- **Result of an EAS attestation operation.** (1 connections) — `src/blockchain/eas.py`
- **Return the EAS schema identifier. EAS uses ``keccak256(abi.encode(schema,…** (1 connections) — `src/blockchain/eas.py`
- *... and 7 more nodes in this community*

## Relationships

- [Blockchain EAS Anchor Service](Blockchain_EAS_Anchor_Service.md) (10 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (8 shared connections)
- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (8 shared connections)
- [EAS Attestation Client](EAS_Attestation_Client.md) (5 shared connections)
- [Admin Bootstrap & CLI](Admin_Bootstrap_&_CLI.md) (4 shared connections)
- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (4 shared connections)
- [Blockchain Attestation Router](Blockchain_Attestation_Router.md) (4 shared connections)
- [Deployment Module](Deployment_Module.md) (3 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (3 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (3 shared connections)
- [Blockchain API Integration Tests](Blockchain_API_Integration_Tests.md) (2 shared connections)
- [Conftest Module](Conftest_Module.md) (2 shared connections)

## Source Files

- `server/config.py`
- `src/blockchain/eas.py`
- `tests/blockchain/conftest.py`

## Audit Trail

- EXTRACTED: 109 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*