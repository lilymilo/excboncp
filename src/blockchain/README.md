# ExcbonCP Blockchain Layer

> Day 3 implementation (R7 — EAS Blockchain Attestation). Python EAS client, business logic, and API endpoints that anchor a local SHA-256 ledger block hash to Base Sepolia via the Ethereum Attestation Service.

## Components

| Module | Purpose |
| --- | --- |
| `eas.py` | EAS client for Base Sepolia: canonical schema, idempotent registration, attestation, safe simulation fallback |
| `service.py` | Business logic: ledger verification → VERIFIED check → auditor check → EAS anchoring |
| `router.py` | FastAPI endpoints under `/blockchain`: `register-schema`, `attest/{block_index}`, `attestations`, `status`, `simulation-status` |

## Architecture

```
┌───────────────────┐
│ auditor (JWT)     │ POST /blockchain/attest/{block_index}
└────────┬──────────┘
         │ 1. require_role("auditor")
         ▼
┌───────────────────┐
│ router.py         │ validate + call service
└────────┬──────────┘
         │ 2. verify_block()
         ▼
┌───────────────────┐
│ service.py        │ 1. verify ledger block hash
│                   │ 2. require VERIFIED + unused hash
│                   │ 3. verify auditor role
│                   │ 4. register_schema() (idempotent)
│                   │ 5. client.attest()
│                   │ 6. update ledger_blocks.eas_uid
└────────┬──────────┘
         │ 7. sign + send tx (live only)
         ▼
┌───────────────────┐
│ eas.py            │ encode schema + write to EAS contract
│                   │ (Base Sepolia)
└────────┬──────────┘
         │ 8. attestation UID / tx hash
         ▼
┌───────────────────┐
│ SQLite            │ attestations + eas_registrations
│                   │ + ledger_blocks.eas_uid
└───────────────────┘
```

## Schema

Canonical EAS field list (no display name, no spaces after commas):

```
string parcelId,string parcelStatus,uint256 co2eMetricTons,bytes32 ledgerBlockHash,string metadataURI,address auditor
```

- `co2eMetricTons` uses 18 fixed-point decimals.
- `ledgerBlockHash` is the SHA-256 hash of the local block.
- `auditor` is the human verifier's EVM address.
- In simulation mode the local schema identifier is `keccak256(schema)`; in
  live mode the UID comes from the registry's `Registered` event.

## Endpoints

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/blockchain/register-schema` | auditor | Register `ParcelAttestation` schema (idempotent) |
| POST | `/blockchain/attest/{block_index}` | auditor | Anchor a `VERIFIED` ledger block to EAS |
| GET | `/blockchain/attestations` | authenticated | List attested blocks |
| GET | `/blockchain/status/{block_index}` | authenticated | Check anchoring status |
| GET | `/blockchain/simulation-status` | public | Report whether EAS runs in simulation mode |

The optional `auditor_username` query parameter must match the authenticated
auditor; the service records the JWT identity as the human approver.

## Environment

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `EVM_PRIVATE_KEY` | live mode | — | Auditor's Base Sepolia private key |
| `EVM_RPC_URL` | live mode | — | Base Sepolia RPC endpoint |
| `EVM_RPC_URL_PUBLIC` | no | `https://sepolia.base.org` | Public fallback RPC |
| `EVM_CHAIN_ID` | no | `84532` | Base Sepolia chain ID |
| `EAS_SCHEMA_REGISTRY` | no | `0x4200...0020` | EAS schema registry |
| `EAS_ADDRESS` | no | `0x4200...0021` | EAS contract |
| `EVM_SIMULATION_MODE` | no | `true` | `true` = local simulation (no gas) |
| `AUDITOR_USERNAME` | no | `auditor_demo` | Default human auditor |

Simulation mode is forced when the key is missing/malformed, `web3` is not
installed, the RPC is unreachable, or the RPC chain ID does not match
`EVM_CHAIN_ID`. This is intentional: the public server must never crash or
send an unsigned transaction.

## Deployment to Base Sepolia (Day 4)

### 1. Install Hardhat and EAS dependencies

```bash
npm install --save-dev hardhat
npm install @ethereum-attestation-service/eas-contracts
```

### 2. Deploy the contract

`contracts/EasProof.sol` is self-contained (minimal EAS v1.5 interfaces are
declared inline), so it can be compiled with any Solidity 0.8.19+ toolchain.
Add a Hardhat deployment script for `ExcbonCPAttestation(easAddress,
schemaRegistryAddress)`.

### 3. Configure `.env`

```bash
EVM_PRIVATE_KEY=<auditor wallet private key>
EVM_RPC_URL=https://base-sepolia.infura.io/v3/<key>
EVM_CHAIN_ID=84532
EVM_SIMULATION_MODE=false
```

### 4. Register and verify

```bash
curl -X POST http://localhost:8000/blockchain/register-schema \
  -H "Authorization: Bearer <auditor token>"
curl -X POST "http://localhost:8000/blockchain/attest/1" \
  -H "Authorization: Bearer <auditor token>"
curl http://localhost:8000/blockchain/simulation-status
```

## Contract reference

`contracts/EasProof.sol` — `ExcbonCPAttestation` contract.

- `registerSchema()` — register with the EAS Schema Registry (admin, once)
- `grantAttester(address)` / `revokeAttester(address)` — auditor whitelist
- `attest(...)` — anchor a `VERIFIED` ledger hash (trusted auditor only)
- `revoke(bytes32)` — withdraw an attestation (recorded auditor or admin)
- `isAttested(bytes32)` / `isAttester(address)` — read-only checks

## Testing

```bash
python -m pytest tests/blockchain/ -v
```

The suite runs fully in simulation mode. It covers the client, service rules
(VERIFIED only, duplicate protection, auditor RBAC), status/list queries, and
HTTP authorization.

## Security notes

- Attestations require an auditor-role JWT **and** a trusted auditor EVM address
  (human mandate, ADR-006 / contract.md §7).
- Only `VERIFIED` blocks with positive CO2e may be anchored.
- A ledger hash can be anchored only once (service check + `attestedBlocks`).
- `attestations.auditor_id` stores `users.id`, never a wallet address, so the
  local foreign key stays meaningful.
- In simulation mode no transaction is sent and no gas is spent.

## See also

- `docs/contract.md` — EAS attestation wire format
- `docs/decisions.md` — ADR-006, ADR-011
- `contracts/README.md` — smart contract documentation
- `scripts/deploy_eas.py` — deployment helper
