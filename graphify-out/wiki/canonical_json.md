# canonical_json()

> God node · 19 connections · `server/ledger/service.py`

**Community:** [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md)

## Connections by Relation

### calls
- [append_block()](append_block.md) `EXTRACTED`
- verify_chain() `EXTRACTED`
- json `EXTRACTED`
- LedgerValidationError `EXTRACTED`
- _insert_http_ledger_block() `EXTRACTED`
- test_second_block_links_to_the_first() `EXTRACTED`
- _seed_api_database() `EXTRACTED`
- test_append_block_uses_genesis_and_contract_hash() `EXTRACTED`
- test_verify_block_detects_earlier_tampering() `EXTRACTED`
- test_verify_block_detects_payload_tampering() `EXTRACTED`
- _validate_payload() `EXTRACTED`
- test_verify_endpoint_reports_tampering() `EXTRACTED`
- test_canonical_json_is_order_independent() `EXTRACTED`

### contains
- ledger/service.py `EXTRACTED`

### imports
- test_ledger.py `EXTRACTED`
- test_blockchain_api.py `EXTRACTED`
- ledger/__init__.py `EXTRACTED`

### rationale_for
- Return the deterministic JSON encoding used as the hash input. Keys are sorted,… `EXTRACTED`

### references
- Any `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*