# Context Diagram

> System boundary view of ExcbonCP showing external actors and their interactions with the system.

---

```mermaid
flowchart TB
    CM["👥 Community Members\n(Land owners, villagers)"]
    AU["🔍 Auditors\n(Verification officers)"]
    JU["⚖️ Judges\n(Competition evaluators)"]
    ESP["📡 ESP32 Sensors\n(Field IoT devices)"]
    SAT["🛰️ Satellite Provider\n(NDVI imagery)"]
    BC["⛓️ Base Sepolia Blockchain\n(EAS attestation)"]
    AI["🤖 AI Provider\n(LLM explanation API)"]

    subgraph ExcbonCP["ExcbonCP MRV System"]
        direction TB
        DApp["DApp Interface"]
        API["REST API"]
        StatusEng["Status Engine"]
        Ledger["Hash Chain Ledger"]
        AnomalyDet["Anomaly Detection"]
        CarbonMkt["Carbon Market Sim"]
    end

    CM -->|"Grant/revoke consent\nView parcel status\nTrade credits"| ExcbonCP
    AU -->|"Review status\nAttest on-chain\nAudit ledger"| ExcbonCP
    JU -->|"Evaluate system\nRun demo script"| ExcbonCP

    ESP -->|"Sensor telemetry\n(MQTT)"| ExcbonCP
    SAT -->|"NDVI data\n(HTTP)"| ExcbonCP
    AI -->|"Explanations\n(HTTP)"| ExcbonCP

    ExcbonCP -->|"Attestation tx"| BC
    ExcbonCP -->|"NDVI requests"| SAT
    ExcbonCP -->|"Explanation prompts"| AI
    ExcbonCP -->|"Status updates\nAlerts\nReports"| CM
    ExcbonCP -->|"Audit reports\nAttestation receipts"| AU
```

## External Actors

| Actor | Type | Interaction | Protocol |
|-------|------|------------|----------|
| **Community Members** | Human | Grant consent, view parcel status, trade carbon credits, receive notifications | HTTPS (DApp) |
| **Auditors** | Human | Review parcel statuses, verify ledger integrity, create on-chain attestations | HTTPS (DApp + API) |
| **Judges** | Human | Evaluate system during competition, run demonstration scripts | HTTPS (DApp) |
| **ESP32 Sensors** | Device | Publish temperature, humidity, soil moisture, and GPS readings | MQTT (QoS 1, TLS) |
| **Satellite Provider** | Service | Provide NDVI vegetation index data for registered parcels | HTTPS (REST API) |
| **Base Sepolia Blockchain** | Infrastructure | Receive and store EAS attestation transactions | HTTPS (JSON-RPC) |
| **AI Provider** | Service | Generate natural-language explanations for status decisions and anomalies | HTTPS (REST API) |

## System Boundary

The ExcbonCP system boundary encompasses:
- All backend services (API, status engine, ledger, carbon calculator)
- All persistence (SQLite database, hash chain)
- All processing (sensor validation, anomaly detection, CO2e calculation)
- The DApp frontend
- The MQTT broker

External to the boundary:
- Physical sensors (ESP32 hardware)
- Satellite imagery providers
- Blockchain network (Base Sepolia)
- AI/LLM providers
- Human users (community, auditors, judges)
