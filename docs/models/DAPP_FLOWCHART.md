# DApp Flowchart

> User interaction flows and screen transitions within the ExcbonCP decentralized application (DApp).

---

```mermaid
flowchart TD
    Start([User Opens DApp]) --> Landing[Landing Page / Map View]

    Landing --> ConnectWallet{Connect Wallet or Log In?}
    ConnectWallet -->|Web3 Wallet| WalletAuth[Authenticate via Web3 / MetaMask]
    ConnectWallet -->|Central Server Auth| ServerAuth[Login with JWT Account]
    ConnectWallet -->|Guest Mode| BrowseOnly[Read-Only Map Navigation]

    WalletAuth --> RoleCheck{Detect Role}
    ServerAuth --> RoleCheck

    RoleCheck -->|Community Landholder| CommunityFlow[Community Portal]
    RoleCheck -->|Auditor / Verifier| AuditorFlow[Auditor Workspace]
    RoleCheck -->|Judge / Public| GeneralFlow[General Dashboard]

    subgraph CommunityView["Community Landholder Flow"]
        CommunityFlow --> MyParcels[View Registered Parcels]
        MyParcels --> ConsentAction{Consent Action}
        ConsentAction -->|Grant| SignConsent[Sign Consent Agreement Terms]
        ConsentAction -->|Revoke| RevokeConsent[Confirm Revocation Alert]
        ConsentAction -->|Dispute| RaiseDispute[Submit Dispute Documentation]
        SignConsent --> SubmitConsentTx[Submit to Central API]
        RevokeConsent --> SubmitConsentTx
        RaiseDispute --> SubmitConsentTx
    end

    subgraph AuditorView["Auditor & Verifier Flow"]
        AuditorFlow --> AuditList[List Parcels Pending Attestation]
        AuditList --> InspectParcel[Inspect Sensor Telemetry & Anomaly History]
        InspectParcel --> VerifyLedger[Verify SHA-256 Hash Chain Integrity]
        VerifyLedger --> LedgerValid{Valid Hash Chain?}
        LedgerValid -->|No| FlagCorruption[Flag Ledger Tamper Alert]
        LedgerValid -->|Yes| RequestEAS[Prepare EAS Attestation Payload]
        RequestEAS --> SignEAS[Sign On-Chain Attestation on Base Sepolia]
        SignEAS --> ConfirmUID[Store Attestation UID in System]
    end

    subgraph MarketView["Simulated Carbon Economy Flow"]
        GeneralFlow --> Market[Carbon Market Simulation]
        Market --> CheckVerified{Parcel Status == VERIFIED?}
        CheckVerified -->|No| TradeBlocked[Trading Blocked: Non-Verified Parcel]
        CheckVerified -->|Yes| TradeAllow[Browse Verified Carbon Batches]
        TradeAllow --> PlaceOrder[Simulate Buy / Sell Order]
        PlaceOrder --> ConfirmOrder[Update Simulated Ledger Balance]
    end

    subgraph JudgeView["Evaluation & Demo Mode"]
        BrowseOnly --> DemoTrigger[Click 'Run Judge Evaluation Demo']
        DemoTrigger --> Step1[Step 1: Ingest Normal Telemetry -> Status VERIFIED]
        Step1 --> Step2[Step 2: Simulate Moisture Drop -> Status WARNING]
        Step2 --> Step3[Step 3: Simulate Consent Revocation -> Status DISPUTE]
        Step3 --> Step4[Step 4: Verify Cryptographic SHA-256 Ledger]
        Step4 --> Step5[Step 5: View Base Sepolia EAS Attestation Receipt]
    end
```

---

## Screen Inventory

| Screen / Modal | Target Audience | Primary Functionality | Required API Endpoints |
|---|---|---|---|
| **Interactive Map (`/map`)** | All | Leaflet map with colored polygon overlays (Green = Verified, Amber = Warning, Red = Dispute, Gray = Blocked). | `GET /api/v1/parcels`, `GET /api/v1/parcels/{id}/status` |
| **Parcel Detail (`/parcel/:id`)** | All | Historical telemetry charts (DHT22, soil), satellite NDVI trends, AI summary explanations. | `GET /api/v1/parcels/{id}/telemetry`, `GET /api/v1/ai/explanation/{id}` |
| **Community Governance (`/consent`)** | Community | Sign, revoke, or dispute land monitoring consent. | `POST /api/v1/parcels/{id}/consent`, `POST /api/v1/parcels/{id}/dispute` |
| **Auditor Verification (`/auditor`)** | Auditor | Cryptographic verification of SHA-256 blocks; trigger EAS Base Sepolia attestations. | `GET /verify/{id}`, `POST /api/v1/attestations/submit` |
| **Marketplace (`/market`)** | All | Simulated spot market for verified carbon credits with clear "SIMULATION" badges. | `GET /api/v1/market/orders`, `POST /api/v1/market/order` |
| **Judge Demo Walkthrough (`/demo`)** | Judges | Step-by-step interactive script running live demonstration scenarios. | `POST /api/v1/demo/scenario/{step}` |

---

## Metadata
- **Source File:** `docs/models/DAPP_FLOWCHART.md`
- **Related Requirements:** R4, R7, R10, R13, R14, R16, R18, R20, R27
- **Responsible Owner:** Malik (DApp, UX, Maps, Presentations)
