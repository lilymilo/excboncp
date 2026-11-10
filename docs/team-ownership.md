# Team Ownership & Human Accountability Matrix

> Preserves human accountability boundaries in accordance with the ExcbonCP Master Directive. AI agents assist team leads; they do not replace human ownership.

---

## 1. Primary Human Ownership Areas

```mermaid
flowchart TD
    Revand["👑 Revand\nArchitecture & Blockchain Lead"]
    Bagus["⚙️ Bagus\nIoT & Backend Lead"]
    Davin["🧠 Davin\nData, AI & Security Lead"]
    Malik["🎨 Malik\nDApp & Presentation Lead"]

    subgraph RevandScope["Revand Domain"]
        R_Arch["System Architecture & ADRs"]
        R_Contracts["Solidity & EAS Attestation"]
        R_DB["SQLite Schema & Migration"]
        R_Ledger["SHA-256 Hash Chain Ledger"]
        R_Docker["Docker & Finalist Deployment"]
    end

    subgraph BagusScope["Bagus Domain"]
        B_ESP["ESP32 Firmware & Hardware"]
        B_MQTT["MQTT Broker & Telemetry"]
        B_Proc["Sensor Ingestion & Validation"]
        B_CO2e["CO2e Calculations"]
        B_Ops["Operational Runbooks & Scripts"]
    end

    subgraph DavinScope["Davin Domain"]
        D_Status["Deterministic Status Engine"]
        D_Consent["Community Consent Workflows"]
        D_Sat["Satellite Data & NDVI Integration"]
        D_AI["AI Explanations & Anomaly Detection"]
        D_Sec["API Security & Threat Mitigation"]
    end

    subgraph MalikScope["Malik Domain"]
        M_DApp["Decentralized Application Frontend"]
        M_Maps["Interactive Leaflet Parcel Maps"]
        M_UX["Mobile-Responsive UI/UX"]
        M_Judge["Judge Evaluation Guide & Demos"]
    end

    Revand --> RevandScope
    Bagus --> BagusScope
    Davin --> DavinScope
    Malik --> MalikScope
```

---

## 2. Detailed Ownership Matrix

| Team Member | Functional Area | Associated Requirements | Primary AI Agent Assistant | Allowed Write Directories |
|---|---|---|---|---|
| **Revand** | Architecture, Smart Contracts, SQLite, SHA-256 Ledger, EAS Integration, Docker, Deployment | R6, R7, R11, R17, R25 | Architect Agent, Blockchain Agent | `docs/`, `contracts/`, `src/blockchain/`, `src/db/`, `docker/`, `scripts/` |
| **Bagus** | ESP32, MQTT, Sensor Processing, CO2e, Authentication, Operational Docs | R1, R2, R5, R12, R19, R23, R28, R29 | IoT Agent, Backend Agent | `src/firmware/`, `src/api/`, `src/core/`, `config/mqtt/`, `scripts/` |
| **Davin** | Status Engine, Community Consent, Satellite Data, AI Explanation, Anomaly Detection, API Security | R3, R4, R8, R9, R10, R15, R26 | Data/AI Agent, Security Agent | `src/core/`, `src/ai/`, `src/satellite/`, `docs/security/`, `tests/security/` |
| **Malik** | DApp, Maps, UX, Screens, Judge Guide, Presentations | R13, R14, R16, R18, R20, R21, R22, R24, R27 | Frontend Agent, Reviewer Agent | `src/dapp/`, `public/`, `docs/judge-guide.md`, `tests/e2e/` |

---

## 3. Human Governance Invariants (Rules 9 & 10)

1. **No Autonomous Approvals:** An AI agent is technically barred from:
   - Modifying a land parcel's status to `VERIFIED`.
   - Creating or signing an on-chain EAS attestation.
   - Authorizing a simulated carbon market transfer.
   - Performing production deployment.
2. **Review & Merge:** All AI-generated code changes must undergo pull request review by the respective human domain lead before merging into `main`.
3. **Escalation Trigger:** Any conflict between agent outputs and domain invariants must be escalated immediately to **Revand** as Architecture Lead.
