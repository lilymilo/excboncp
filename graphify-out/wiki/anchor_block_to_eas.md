# anchor_block_to_eas()

> God node · 21 connections · `src/blockchain/service.py`

**Community:** [Blockchain EAS Anchor Service](Blockchain_EAS_Anchor_Service.md)

## Connections by Relation

### calls
- [get_db()](get_db.md) `EXTRACTED`
- [verify_block()](verify_block.md) `EXTRACTED`
- verify_auditor() `EXTRACTED`
- get_eas_client() `EXTRACTED`
- attest_block() `EXTRACTED`
- test_anchor_block_rejects_non_verified() `EXTRACTED`
- test_attestation_status_before_and_after() `EXTRACTED`
- test_get_attested_blocks() `EXTRACTED`
- test_anchor_block_not_found() `EXTRACTED`
- test_anchor_block_to_eas_simulation() `EXTRACTED`
- test_anchor_block_twice_conflicts() `EXTRACTED`
- test_anchor_block_with_non_auditor_role() `EXTRACTED`
- test_anchor_block_without_auditor() `EXTRACTED`
- AnchoringResult `EXTRACTED`
- _failure() `EXTRACTED`

### contains
- blockchain/service.py `EXTRACTED`

### imports
- test_eas.py `EXTRACTED`
- blockchain/router.py `EXTRACTED`

### rationale_for
- Anchor a verified ledger block to Base Sepolia via EAS. Process: 1. Verify the… `EXTRACTED`

### references
- Connection `EXTRACTED`

### uses
- [EasClient](EasClient.md) `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*