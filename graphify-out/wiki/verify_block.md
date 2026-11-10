# verify_block()

> God node · 19 connections · `server/ledger/service.py`

**Community:** [SHA-256 Hash-Chain Ledger](SHA-256_Hash-Chain_Ledger.md)

## Connections by Relation

### calls
- [anchor_block_to_eas()](anchor_block_to_eas.md) `EXTRACTED`
- verify_chain() `EXTRACTED`
- attest_block() `EXTRACTED`
- get_block() `EXTRACTED`
- test_verify_block_detects_earlier_tampering() `EXTRACTED`
- test_verify_block_detects_payload_tampering() `EXTRACTED`
- verify_ledger_block() `EXTRACTED`
- test_verify_block_detects_prev_hash_tampering() `EXTRACTED`
- test_verify_block_reports_valid_entry() `EXTRACTED`
- test_verify_block_returns_none_for_unknown_entry() `EXTRACTED`

### contains
- ledger/service.py `EXTRACTED`

### imports
- test_ledger.py `EXTRACTED`
- blockchain/router.py `EXTRACTED`
- blockchain/service.py `EXTRACTED`
- ledger/router.py `EXTRACTED`
- ledger/__init__.py `EXTRACTED`

### rationale_for
- Verify one block against its stored hash and the preceding chain. `EXTRACTED`

### references
- Any `EXTRACTED`
- Connection `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*