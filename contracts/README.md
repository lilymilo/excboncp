# ExcbonCP Smart Contracts

> Day 3 implementation (R7 — EAS Blockchain Attestation). Smart contract for
> anchoring local SHA-256 ledger blocks to Base Sepolia.

## Contract

### `EasProof.sol` — `ExcbonCPAttestation`

Registers the `ParcelAttestation` EAS schema, maintains an auditor whitelist,
and anchors verified land parcels' ledger hashes on Base Sepolia. The minimal
EAS v1.5 interfaces are declared inline, so the contract is self-contained for
review and compilation.

**Schema fields (matching `docs/contract.md` §5):**
- `parcelId` (string) — unique parcel identifier
- `parcelStatus` (string) — deterministic status verdict (must be `VERIFIED`)
- `co2eMetricTons` (uint256) — carbon tonnage in fixed-point 18 decimals
- `ledgerBlockHash` (bytes32) — SHA-256 hash of the local ledger block
- `metadataURI` (string) — IPFS URI for the canonical report bundle
- `auditor` (address) — Ethereum address of the human verifier

Canonical schema string:

```solidity
string parcelId,string parcelStatus,uint256 co2eMetricTons,bytes32 ledgerBlockHash,string metadataURI,address auditor
```

**Functions:**
- `registerSchema()` — register the EAS schema (admin only, one-time)
- `grantAttester(address)` — grant auditor privileges (admin only)
- `revokeAttester(address)` — revoke auditor privileges (admin only)
- `attest(...)` — anchor a ledger hash (trusted auditor only)
- `revoke(bytes32)` — withdraw an attestation (recorded auditor or admin)
- `isAttested(bytes32)` — check if a block has been attested
- `isAttester(address)` — check if an address is a trusted attester
- `getSchemaRoot()` — return the registered schema UID

**Invariants:**
- Only `VERIFIED` parcels may be attested (contract + API service).
- The same `ledgerBlockHash` cannot be attested twice.
- CO2e must be positive.
- The schema must be registered before the first attestation.

## Deployment (Day 4 milestone)

To deploy to Base Sepolia:

```bash
# Install Hardhat
npm install --save-dev hardhat
npm install @ethereum-attestation-service/eas-contracts

# Add a deployment script for:
#   new ExcbonCPAttestation(
#     0x4200000000000000000000000000000000000021, // EAS
#     0x4200000000000000000000000000000000000020  // Schema Registry
#   )
npx hardhat run scripts/deploy.ts --network baseSepolia
```

Required env vars:
- `EVM_PRIVATE_KEY` — deployer/auditor private key
- `EVM_RPC_URL` — Base Sepolia RPC URL

## Dependencies

- Solidity ^0.8.19
- Base Sepolia Testnet (Chain ID 84532)
- EAS v1.5 (Ethereum Attestation Service on Base Sepolia)

## Status

- [x] Contract skeleton written
- [x] Canonical EAS schema + auditor whitelist + duplicate protection
- [x] API/service/client implementation with simulation mode
- [ ] Contract deployed to Base Sepolia (Day 4)
- [ ] Live schema registration with the EAS Schema Registry (Day 4)
- [ ] Auditor wallet whitelisted on the deployed contract (Day 4)
- [ ] Tested end-to-end against Base Sepolia (Day 4)

## References

- `docs/contract.md` — EAS attestation specification
- `docs/requirements-traceability.md` — R7 requirement
- `docs/decisions.md` — ADR-006, ADR-011
- `src/blockchain/eas.py` — Python client
- `src/blockchain/service.py` — business logic layer
- `src/blockchain/router.py` — API endpoints
- `tests/blockchain/` — simulation-mode unit and HTTP tests
