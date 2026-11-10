# Blockchain EAS Anchor Service

> 47 nodes · cohesion 0.08

## Key Concepts

- **test_eas.py** (35 connections) — `tests/blockchain/test_eas.py`
- **blockchain/service.py** (25 connections) — `src/blockchain/service.py`
- **anchor_block_to_eas()** (21 connections) — `src/blockchain/service.py`
- **Any** (15 connections)
- **get_eas_client()** (9 connections) — `src/blockchain/eas.py`
- **verify_auditor()** (9 connections) — `src/blockchain/service.py`
- **get_attestation_status()** (8 connections) — `src/blockchain/service.py`
- **get_attested_blocks()** (8 connections) — `src/blockchain/service.py`
- **test_anchor_block_rejects_non_verified()** (6 connections) — `tests/blockchain/test_eas.py`
- **test_attestation_status_before_and_after()** (6 connections) — `tests/blockchain/test_eas.py`
- **test_get_attested_blocks()** (6 connections) — `tests/blockchain/test_eas.py`
- **Metadata** (5 connections) — `docs/contract.md`
- **test_anchor_block_not_found()** (5 connections) — `tests/blockchain/test_eas.py`
- **test_anchor_block_to_eas_simulation()** (5 connections) — `tests/blockchain/test_eas.py`
- **test_anchor_block_twice_conflicts()** (5 connections) — `tests/blockchain/test_eas.py`
- **test_anchor_block_with_non_auditor_role()** (5 connections) — `tests/blockchain/test_eas.py`
- **test_anchor_block_without_auditor()** (5 connections) — `tests/blockchain/test_eas.py`
- **AnchoringResult** (4 connections) — `src/blockchain/service.py`
- **Connection** (4 connections)
- **test_get_eas_client_singleton()** (4 connections) — `tests/blockchain/test_eas.py`
- **test_verify_auditor_failure_missing()** (4 connections) — `tests/blockchain/test_eas.py`
- **test_verify_auditor_failure_wrong_role()** (4 connections) — `tests/blockchain/test_eas.py`
- **test_verify_auditor_success()** (4 connections) — `tests/blockchain/test_eas.py`
- **_failure()** (3 connections) — `src/blockchain/service.py`
- **Any** (3 connections)
- *... and 22 more nodes in this community*

## Relationships

- [EAS Attestation Client](EAS_Attestation_Client.md) (20 shared connections)
- [Blockchain Attestation Router](Blockchain_Attestation_Router.md) (12 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (10 shared connections)
- [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md) (6 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (4 shared connections)
- [Database Module](Database_Module.md) (2 shared connections)
- [Blockchain — Eas](Blockchain_—_Eas.md) (2 shared connections)
- [Contract Module](Contract_Module.md) (1 shared connections)
- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (1 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (1 shared connections)

## Source Files

- `docs/contract.md`
- `src/blockchain/eas.py`
- `src/blockchain/service.py`
- `tests/blockchain/test_eas.py`

## Audit Trail

- EXTRACTED: 136 (94%)
- INFERRED: 9 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*