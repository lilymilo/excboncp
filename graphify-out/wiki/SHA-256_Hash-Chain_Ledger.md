# SHA-256 Hash-Chain Ledger

> 79 nodes · cohesion 0.05

## Key Concepts

- **test_ledger.py** (32 connections) — `tests/test_ledger.py`
- **ledger/service.py** (29 connections) — `server/ledger/service.py`
- **append_block()** (23 connections) — `server/ledger/service.py`
- **canonical_json()** (19 connections) — `server/ledger/service.py`
- **verify_block()** (19 connections) — `server/ledger/service.py`
- **compute_hash()** (13 connections) — `server/ledger/service.py`
- **verify_chain()** (13 connections) — `server/ledger/service.py`
- **_insert_parcel_and_auditor()** (11 connections) — `tests/test_ledger.py`
- **ledger/router.py** (10 connections) — `server/ledger/router.py`
- **ledger/__init__.py** (9 connections) — `server/ledger/__init__.py`
- **Connection** (9 connections)
- **LedgerValidationError** (8 connections) — `server/ledger/service.py`
- **_insert_http_ledger_block()** (8 connections) — `tests/test_ledger.py`
- **test_append_rejects_invalid_payload()** (8 connections) — `tests/test_ledger.py`
- **test_second_block_links_to_the_first()** (8 connections) — `tests/test_ledger.py`
- **get_block()** (7 connections) — `server/ledger/service.py`
- **Any** (7 connections)
- **Any** (7 connections)
- **test_append_block_uses_genesis_and_contract_hash()** (7 connections) — `tests/test_ledger.py`
- **test_verify_block_detects_earlier_tampering()** (7 connections) — `tests/test_ledger.py`
- **test_verify_block_detects_payload_tampering()** (7 connections) — `tests/test_ledger.py`
- **verify_ledger_block()** (6 connections) — `server/ledger/router.py`
- **_parse_canonical_data()** (6 connections) — `server/ledger/service.py`
- **_validate_payload()** (6 connections) — `server/ledger/service.py`
- **test_verify_block_detects_prev_hash_tampering()** (6 connections) — `tests/test_ledger.py`
- *... and 54 more nodes in this community*

## Relationships

- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (9 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (8 shared connections)
- [Blockchain EAS Anchor Service](Blockchain_EAS_Anchor_Service.md) (6 shared connections)
- [Blockchain API Integration Tests](Blockchain_API_Integration_Tests.md) (6 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (4 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (3 shared connections)
- [Blockchain Attestation Router](Blockchain_Attestation_Router.md) (3 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (2 shared connections)
- [Database Module](Database_Module.md) (2 shared connections)
- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (2 shared connections)
- [Admin Bootstrap & CLI](Admin_Bootstrap_&_CLI.md) (2 shared connections)
- [Credential Vault Models](Credential_Vault_Models.md) (1 shared connections)

## Source Files

- `server/ledger/__init__.py`
- `server/ledger/models.py`
- `server/ledger/router.py`
- `server/ledger/service.py`
- `tests/test_ledger.py`

## Audit Trail

- EXTRACTED: 216 (99%)
- INFERRED: 2 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*