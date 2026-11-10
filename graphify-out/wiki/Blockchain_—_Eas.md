# Blockchain — Eas

> 7 nodes · cohesion 0.29

## Key Concepts

- **.simulation_mode()** (5 connections) — `src/blockchain/eas.py`
- **test_eas_client_without_key_uses_simulation()** (5 connections) — `tests/blockchain/test_eas.py`
- **test_eas_client_creation()** (4 connections) — `tests/blockchain/test_eas.py`
- **Whether this client is simulating EAS operations.** (1 connections) — `src/blockchain/eas.py`
- **MonkeyPatch** (1 connections)
- **The client can be created with a valid 32-byte private key.** (1 connections) — `tests/blockchain/test_eas.py`
- **A missing key must never crash the server or send a transaction.** (1 connections) — `tests/blockchain/test_eas.py`

## Relationships

- [EAS Attestation Client](EAS_Attestation_Client.md) (3 shared connections)
- [Blockchain EAS Anchor Service](Blockchain_EAS_Anchor_Service.md) (2 shared connections)
- [Blockchain Attestation Router](Blockchain_Attestation_Router.md) (1 shared connections)

## Source Files

- `src/blockchain/eas.py`
- `tests/blockchain/test_eas.py`

## Audit Trail

- EXTRACTED: 9 (75%)
- INFERRED: 3 (25%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*