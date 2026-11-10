# Data Flow Diagram (DFD)

> End-to-end data pipeline from physical IoT sensor telemetry and satellite imagery to deterministic verification, ledgering, EAS attestation, and DApp visualization.

---

```mermaid
flowchart TD
    subgraph Layer0["Data Acquisition"]
        ESP32["📡 ESP32 Sensor Nodes\n(DHT22, Soil Moisture, GPS)"]
        SAT["🛰️ Satellite Provider\n(Sentinel / Landsat NDVI)"]
        Community["👥 Community Landholder"]
    end

    subgraph Layer1["Ingestion & Validation"]
        MQTTBroker["MQTT Broker (Mosquitto)\nTopic: excboncp/sensors/{parcel_id}"]
        API_Ingest["FastAPI Ingestion Endpoint\n/api/v1/sensors/data"]
        Val["Data Validator\n(Range, Outliers, GPS Bounding Box)"]
    end

    subgraph Layer2["Processing & Intelligence"]
        StatusEng["Deterministic Status Engine\nPrecedence: Consent -> Dispute -> Sensor/Anomaly -> Verified"]
        CO2eCalc["CO2e Carbon Calculator\n(Area, Biomass factor, NDVI delta)"]
        AnomalyMod["AI Anomaly Detection\n(Z-score, Baseline Variance)"]
        Explainer["AI Explanation System\n(Natural Language Contextual Summary)"]
    end

    subgraph Layer3["Storage & Integrity"]
        DB[(SQLite Primary Storage\nParcels, Sensors, Consent, Tasks)]
        Ledger["SHA-256 Hash Chain Ledger\n(Canonical JSON, Tamper-Evident)"]
    end

    subgraph Layer4["Attestation & Presentation"]
        EAS["Ethereum Attestation Service (EAS)\nBase Sepolia Testnet"]
        DApp["Interactive DApp Frontend\n(Map View, Parcel Details, Carbon Market Sim)"]
        Auditor["🔍 Auditor / Judge Interface"]
    end

    ESP32 -->|Publish Telemetry| MQTTBroker
    MQTTBroker --> API_Ingest
    SAT -->|HTTP Fetch NDVI| API_Ingest
    Community -->|Grant/Revoke Consent| API_Ingest

    API_Ingest --> Val
    Val -->|Clean Time-Series| DB
    Val --> StatusEng
    Val --> AnomalyMod
    Val --> CO2eCalc

    AnomalyMod -->|Anomaly Flags| StatusEng
    AnomalyMod --> Explainer
    StatusEng --> Explainer
    StatusEng -->|Status Verdict| Ledger
    CO2eCalc -->|Carbon Tonnage| Ledger

    Ledger --> DB
    Ledger -->|Auditor Approved| EAS
    EAS -->|On-Chain UID & TxHash| DB

    DB --> DApp
    Ledger --> DApp
    DApp --> Auditor
```

---

## Data Flow Descriptions

1. **IoT Ingestion:** ESP32 nodes capture humidity, temperature, volumetric soil moisture, and GPS fix every 60 seconds, publishing JSON payloads to `excboncp/sensors/{parcel_id}` over TLS MQTT (QoS 1).
2. **Deterministic Processing:** Raw readings are validated against geographic and physical bounds. The status engine evaluates consent status, sensor thresholds, and anomaly flags deterministically without non-deterministic AI interference.
3. **Ledgering:** Verified parcel states and calculated CO2e tons are serialized to canonical JSON and appended to the local SHA-256 hash chain.
4. **Attestation:** Once reviewed by an auditor, the state hash and metadata are signed and attested on Base Sepolia using EAS.
5. **Presentation:** DApp renders real-time color-coded parcel states (VERIFIED, WARNING, DISPUTE, BLOCKED) and simulated credit trading.

---

## Metadata
- **Source File:** `docs/models/DATA_FLOW_DIAGRAM.md`
- **Related Requirements:** R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13
- **Responsible Owner:** Bagus (IoT/Backend) & Davin (Data/AI)
