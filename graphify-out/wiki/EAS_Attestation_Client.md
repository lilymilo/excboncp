# EAS Attestation Client

> 38 nodes · cohesion 0.10

## Key Concepts

- **EasClient** (47 connections) — `src/blockchain/eas.py`
- **.attest()** (12 connections) — `src/blockchain/eas.py`
- **.register_schema()** (10 connections) — `src/blockchain/eas.py`
- **EasClientError** (8 connections) — `src/blockchain/eas.py`
- **Any** (6 connections)
- **Connection** (6 connections)
- **._local_registration_exists()** (5 connections) — `src/blockchain/eas.py`
- **._schema_bytes32()** (5 connections) — `src/blockchain/eas.py`
- **test_attest_rejects_duplicate_block()** (5 connections) — `tests/blockchain/test_eas.py`
- **test_attest_rejects_non_verified_status()** (5 connections) — `tests/blockchain/test_eas.py`
- **test_attest_simulation()** (5 connections) — `tests/blockchain/test_eas.py`
- **test_register_schema_simulation()** (5 connections) — `tests/blockchain/test_eas.py`
- **._base_tx_options()** (4 connections) — `src/blockchain/eas.py`
- **._encode_attestation_data()** (4 connections) — `src/blockchain/eas.py`
- **._network_label()** (4 connections) — `src/blockchain/eas.py`
- **._record_attestation()** (4 connections) — `src/blockchain/eas.py`
- **._record_registration()** (4 connections) — `src/blockchain/eas.py`
- **._validate_attestation()** (4 connections) — `src/blockchain/eas.py`
- **._extract_attestation_uid()** (3 connections) — `src/blockchain/eas.py`
- **._extract_schema_uid()** (3 connections) — `src/blockchain/eas.py`
- **.get_schema_registered()** (3 connections) — `src/blockchain/eas.py`
- **._send_attest_transaction()** (3 connections) — `src/blockchain/eas.py`
- **._send_register_transaction()** (2 connections) — `src/blockchain/eas.py`
- **._wait_for_receipt()** (2 connections) — `src/blockchain/eas.py`
- **Exception** (1 connections)
- *... and 13 more nodes in this community*

## Relationships

- [Blockchain EAS Anchor Service](Blockchain_EAS_Anchor_Service.md) (20 shared connections)
- [Blockchain — Eas](Blockchain_—_Eas.md) (6 shared connections)
- [Blockchain Attestation Router](Blockchain_Attestation_Router.md) (6 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (5 shared connections)

## Source Files

- `src/blockchain/eas.py`
- `tests/blockchain/test_eas.py`

## Audit Trail

- EXTRACTED: 82 (78%)
- INFERRED: 23 (22%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*