# EasClient

> God node · 47 connections · `src/blockchain/eas.py`

**Community:** [EAS Attestation Client](EAS_Attestation_Client.md)

## Connections by Relation

### calls
- get_eas_client() `EXTRACTED`
- test_eas_client_without_key_uses_simulation() `EXTRACTED`
- test_eas_client_creation() `EXTRACTED`

### contains
- eas.py `EXTRACTED`

### imports
- test_eas.py `EXTRACTED`
- blockchain/router.py `EXTRACTED`
- blockchain/service.py `EXTRACTED`
- blockchain/conftest.py `EXTRACTED`

### method
- .attest() `EXTRACTED`
- .register_schema() `EXTRACTED`
- ._local_registration_exists() `EXTRACTED`
- ._schema_bytes32() `EXTRACTED`
- .simulation_mode() `EXTRACTED`
- .__init__() `EXTRACTED`
- ._record_registration() `EXTRACTED`
- ._network_label() `EXTRACTED`
- ._validate_attestation() `EXTRACTED`
- ._record_attestation() `EXTRACTED`
- ._base_tx_options() `EXTRACTED`
- ._encode_attestation_data() `EXTRACTED`
- ._validate_private_key() `EXTRACTED`
- ._connect_live() `EXTRACTED`
- .get_schema_registered() `EXTRACTED`
- ._extract_schema_uid() `EXTRACTED`
- ._send_attest_transaction() `EXTRACTED`
- ._extract_attestation_uid() `EXTRACTED`
- ._send_register_transaction() `EXTRACTED`
- ._wait_for_receipt() `EXTRACTED`

### rationale_for
- Client for EAS operations on Base Sepolia. The client runs in simulation mode… `EXTRACTED`

### uses
- [anchor_block_to_eas()](anchor_block_to_eas.md) `INFERRED`
- attest_block() `INFERRED`
- register_schema() `INFERRED`
- simulation_status() `INFERRED`
- test_anchor_block_rejects_non_verified() `INFERRED`
- test_attestation_status_before_and_after() `INFERRED`
- test_get_attested_blocks() `INFERRED`
- eas_client() `INFERRED`
- test_anchor_block_not_found() `INFERRED`
- test_anchor_block_to_eas_simulation() `INFERRED`
- test_anchor_block_twice_conflicts() `INFERRED`
- test_anchor_block_with_non_auditor_role() `INFERRED`
- test_anchor_block_without_auditor() `INFERRED`
- test_attest_rejects_duplicate_block() `INFERRED`
- test_attest_rejects_non_verified_status() `INFERRED`
- test_attest_simulation() `INFERRED`
- test_register_schema_simulation() `INFERRED`
- _eas_dependency() `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*