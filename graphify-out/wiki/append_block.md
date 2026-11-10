# append_block()

> God node · 23 connections · `server/ledger/service.py`

**Community:** [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md)

## Connections by Relation

### calls
- [canonical_json()](canonical_json.md) `EXTRACTED`
- compute_hash() `EXTRACTED`
- test_append_rejects_invalid_payload() `EXTRACTED`
- test_second_block_links_to_the_first() `EXTRACTED`
- test_append_block_uses_genesis_and_contract_hash() `EXTRACTED`
- test_verify_block_detects_earlier_tampering() `EXTRACTED`
- test_verify_block_detects_payload_tampering() `EXTRACTED`
- _validate_payload() `EXTRACTED`
- _seed_ledger_blocks() `EXTRACTED`
- test_anchor_block_rejects_non_verified() `EXTRACTED`
- test_verify_block_detects_prev_hash_tampering() `EXTRACTED`
- test_verify_block_reports_valid_entry() `EXTRACTED`
- _get_append_lock() `EXTRACTED`
- sample_ledger_blocks() `EXTRACTED`

### contains
- ledger/service.py `EXTRACTED`

### imports
- test_eas.py `EXTRACTED`
- test_ledger.py `EXTRACTED`
- seed.py `EXTRACTED`
- blockchain/conftest.py `EXTRACTED`
- ledger/__init__.py `EXTRACTED`

### rationale_for
- Append one block and return its wire representation. Args: db: Active database… `EXTRACTED`

### references
- Any `EXTRACTED`
- Connection `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*