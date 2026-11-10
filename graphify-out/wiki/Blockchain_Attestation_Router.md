# Blockchain Attestation Router

> 19 nodes · cohesion 0.15

## Key Concepts

- **blockchain/router.py** (31 connections) — `src/blockchain/router.py`
- **attest_block()** (8 connections) — `src/blockchain/router.py`
- **register_schema()** (7 connections) — `src/blockchain/router.py`
- **attestation_status()** (6 connections) — `src/blockchain/router.py`
- **list_attestations()** (6 connections) — `src/blockchain/router.py`
- **simulation_status()** (6 connections) — `src/blockchain/router.py`
- **Any** (5 connections)
- **References** (4 connections) — `contracts/README.md`
- **Day 3 Implementation (R7)** (4 connections) — `docs/contract.md`
- **_eas_dependency()** (4 connections) — `src/blockchain/router.py`
- **get** (3 connections)
- **post** (2 connections)
- **ExcbonCP — EAS Attestation API Router. Endpoints: - POST /blockchain/register-…** (1 connections) — `src/blockchain/router.py`
- **List all ledger blocks that have been attested to EAS.** (1 connections) — `src/blockchain/router.py`
- **Check whether a ledger block has been attested to EAS.** (1 connections) — `src/blockchain/router.py`
- **Return whether EAS is running in simulation mode (public).** (1 connections) — `src/blockchain/router.py`
- **FastAPI dependency wrapper around the EAS singleton.** (1 connections) — `src/blockchain/router.py`
- **Register the ExcbonCP EAS schema with the Schema Registry. Idempotent: repeated…** (1 connections) — `src/blockchain/router.py`
- **Anchor a verified ledger block to Base Sepolia via EAS. Process: 1. Verify the…** (1 connections) — `src/blockchain/router.py`

## Relationships

- [Blockchain EAS Anchor Service](Blockchain_EAS_Anchor_Service.md) (12 shared connections)
- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (6 shared connections)
- [EAS Attestation Client](EAS_Attestation_Client.md) (6 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (5 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (4 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (3 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (2 shared connections)
- [Contracts — Readme](Contracts_—_Readme.md) (1 shared connections)
- [Contract Module](Contract_Module.md) (1 shared connections)
- [Database Module](Database_Module.md) (1 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (1 shared connections)
- [Blockchain — Eas](Blockchain_—_Eas.md) (1 shared connections)

## Source Files

- `contracts/README.md`
- `docs/contract.md`
- `src/blockchain/router.py`

## Audit Trail

- EXTRACTED: 58 (85%)
- INFERRED: 10 (15%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*