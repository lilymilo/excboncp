# ExcbonCP Blockchain & EAS Attestation Specification

> Smart contract schemas, Ethereum Attestation Service (EAS) integration on Base Sepolia, and cryptographic ledger verification.

---

## 1. Network & Protocol Infrastructure

| Parameter | Specification |
|---|---|
| **Target Blockchain** | Base Sepolia Testnet |
| **Chain ID** | `84532` |
| **EAS Contract Address** | `0x4200000000000000000000000000000000000021` |
| **Schema Registry Address** | `0x4200000000000000000000000000000000000020` |
| **Explorer** | [https://sepolia.basescan.org](https://sepolia.basescan.org) |
| **Attestation Explorer** | [https://base-sepolia.easscan.org](https://base-sepolia.easscan.org) |

---

## 2. Attestation Schema

ExcbonCP registers a deterministic schema with the EAS Schema Registry:

```solidity
string parcelId, string parcelStatus, uint256 co2eMetricTons, bytes32 ledgerBlockHash, string metadataURI, address auditor
```

### Schema Field Definitions:
- `parcelId` (`string`): The unique identifier of the monitored forest parcel (e.g. `PARCEL-WEST-JAVA-001`).
- `parcelStatus` (`string`): The deterministic status verdict (`VERIFIED`). Parcels not in `VERIFIED` state cannot be attested.
- `co2eMetricTons` (`uint256`): Authoritative carbon sequestration tonnage in fixed-point 18 decimals ($10^{18}$ wei = 1.0 metric ton CO2e).
- `ledgerBlockHash` (`bytes32`): SHA-256 hash of the latest block in the parcel's local tamper-evident ledger.
- `metadataURI` (`string`): IPFS URI referencing the canonical report bundle (sensor telemetry, NDVI charts, and audit summary).
- `auditor` (`address`): Ethereum address of the human verifier who reviewed and approved the attestation.

---

## 3. Cryptographic Hash Chain Ledger

Prior to on-chain attestation, all sensor evaluations and carbon calculations are appended to an internal SHA-256 hash chain:

$$H_0 = \text{SHA-256}(\text{GENESIS\_PAYLOAD})$$
$$H_i = \text{SHA-256}(\text{CanonicalJSON}(D_i) \parallel H_{i-1})$$

Where $D_i$ contains:
```json
{
  "parcel_id": "PARCEL-001",
  "timestamp": "2026-11-08T12:00:00Z",
  "co2e_tons": 142.85,
  "status": "VERIFIED",
  "sensor_summary": {
    "avg_temp_c": 24.2,
    "avg_humidity_pct": 82.5,
    "avg_soil_moisture_pct": 38.1
  },
  "ndvi_mean": 0.76
}
```

### Verification Algorithm:
Any auditor or judge can recompute the SHA-256 chain locally. If any telemetry point or status decision was retroactively modified, $H_i \neq H_{i}^{\text{recorded}}$, immediately exposing the tampering.

---

## 4. Human Approval Mandate (Rules 9 & 10)

- **AI Invariant:** AI models (LLMs or anomaly detection networks) are strictly barred from signing or submitting EAS attestations.
- **Auditor Requirement:** Every on-chain attestation requires cryptographic signature from an account with the `auditor` role.
- **Simulation Disclaimer:** All records and credit representations on testnet are explicitly tagged as simulated MRV proofs, with no legal carbon credit equivalence claimed.

---

## Metadata
- **Source File:** `docs/contract.md`
- **Related Requirements:** R6, R7, R17
- **Responsible Owner:** Revand (Architecture & Smart Contracts)
