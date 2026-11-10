# Sequence Diagram

> Key operational sequences: Sensor Ingestion, Status Determination, Community Consent, and On-Chain EAS Attestation.

---

## 1. Sensor Ingestion & Deterministic Evaluation

```mermaid
sequenceDiagram
    autonumber
    participant ESP as ESP32 Sensor
    participant MQTT as MQTT Broker
    participant Ingest as API Ingestion Service
    participant Status as Status Engine
    participant Ledger as SHA-256 Ledger
    participant DB as SQLite DB
    participant DApp as DApp Client

    ESP->>MQTT: PUBLISH excboncp/sensors/{parcel_id} (temp, humidity, soil, gps)
    MQTT->>Ingest: Deliver MQTT payload (QoS 1)
    Ingest->>Ingest: Validate GPS bounds & sensor physical ranges
    Ingest->>DB: INSERT INTO sensor_readings
    Ingest->>Status: evaluate_parcel(parcel_id)
    Status->>DB: SELECT consent_status, dispute_status FROM parcels WHERE id = parcel_id
    Note over Status: Enforce strict precedence:<br/>1. No consent -> BLOCKED<br/>2. Open dispute -> DISPUTE<br/>3. Out-of-bounds -> WARNING<br/>4. Normal -> VERIFIED
    Status->>DB: UPDATE parcels SET status = :status
    Status->>Ledger: append_block(parcel_id, status, co2e, prev_hash)
    Ledger->>DB: INSERT INTO ledger_blocks (hash, prev_hash, canonical_payload)
    Ingest-->>DApp: WebSocket/SSE push: status_updated
```

---

## 2. Community Consent Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Community as Community Landholder
    participant DApp as DApp UI
    participant API as FastAPI Backend
    participant Status as Status Engine
    participant DB as SQLite DB

    Community->>DApp: Select parcel & click "Grant Consent"
    DApp->>API: POST /api/v1/parcels/{id}/consent (wallet_signature, terms_version)
    API->>API: Verify landholder signature matches parcel registry
    API->>DB: INSERT INTO consent_history (parcel_id, state="GRANTED", timestamp)
    API->>DB: UPDATE parcels SET consent_state = "GRANTED"
    API->>Status: recompute_status(parcel_id)
    Status->>DB: UPDATE parcels SET status = "VERIFIED" (if sensor telemetry OK)
    API-->>DApp: HTTP 200 OK (Consent recorded, status updated)
    DApp-->>Community: Display Green "VERIFIED" status badge
```

---

## 3. EAS Blockchain Attestation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Auditor as Independent Auditor
    participant DApp as DApp Auditor Portal
    participant API as Backend Service
    participant Ledger as SHA-256 Ledger
    participant EAS as EAS Contract (Base Sepolia)
    participant DB as SQLite DB

    Auditor->>DApp: Inspect parcel history & audit hash ledger
    DApp->>API: GET /api/v1/ledger/verify/{parcel_id}
    API->>Ledger: verify_chain(parcel_id)
    Ledger-->>API: Chain valid: SHA-256 integrity verified
    API-->>DApp: Return verification proof & latest block hash
    Auditor->>DApp: Click "Approve & Attest On-Chain"
    DApp->>API: POST /api/v1/attestations/submit (parcel_id, auditor_id, block_hash)
    API->>EAS: attest(SchemaUID, AttestationRequest(recipient, data, revocable=true))
    EAS-->>API: Transaction confirmed (TxHash, EAS UID)
    API->>DB: INSERT INTO attestations (eas_uid, tx_hash, parcel_id, block_hash, auditor_id)
    API-->>DApp: HTTP 201 Created (UID, BaseScan URL)
    DApp-->>Auditor: Display verifiable EAS on-chain badge
```

---

## Metadata
- **Source File:** `docs/models/SEQUENCE_DIAGRAM.md`
- **Related Requirements:** R1, R2, R3, R4, R6, R7, R11, R15, R17
- **Responsible Owner:** Revand (Architecture & Blockchain) & Davin (Status Engine)
