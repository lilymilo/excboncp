# Deployment Diagram

> Infrastructure topology and container networking for the ExcbonCP system in development, staging, and competition demonstration environments.

---

```mermaid
flowchart TB
    subgraph ClientDevices["Client Tier (Team & Evaluators)"]
        RevandClient["💻 Revand (Mac/Linux Client)"]
        BagusClient["💻 Bagus (Client)"]
        DavinClient["💻 Davin (Client)"]
        MalikClient["💻 Malik (Client)"]
        JudgeBrowser["⚖️ Judge / Evaluator Browser"]
    end

    subgraph EdgeDevices["Edge IoT Layer"]
        ESP32Node1["📡 ESP32 Node A\n(Parcel Alpha: Forested)"]
        ESP32Node2["📡 ESP32 Node B\n(Parcel Beta: Riparian)"]
    end

    subgraph CentralHost["Docker Host: Central Engineering Server"]
        direction TB

        subgraph DockerNet["Bridge Network: excboncp-network"]
            Server["🐳 excboncp-server (FastAPI)\nPort: 8000\n- JWT Auth & RBAC\n- Per-User Fernet Vault\n- Agent Task Engine\n- Status & Ledger Logic"]
            Mosquitto["🐳 excboncp-mosquitto\nPort: 1883 / 9001 (WS)\n- TLS Authentication\n- Sensor Telemetry Broker"]
            Frontend["🐳 excboncp-frontend (Vite/SPA)\nPort: 3000\n- Interactive Leaflet Maps\n- Simulation Market\n- Judge Demo UI"]
        end

        subgraph Volumes["Persistent Storage"]
            DBVolume[("📁 excboncp-data Volume\n- SQLite DB: excboncp.db\n- Workspaces: data/workspaces/\n- Backups: backups/")]
        end

        Server --> DBVolume
    end

    subgraph ExternalServices["External Trust & Cloud Services"]
        BaseSepolia["⛓️ Base Sepolia Testnet\n- EAS Contract\n- RPC Gateway"]
        SatelliteAPI["🛰️ Sentinel-2 / Landsat\nNDVI Vegetation API"]
        AnthropicAPI["🤖 Anthropic Claude API\n(Per-User Key)"]
        OpenAIAPI["🤖 OpenAI API\n(Per-User Key)"]
        GeminiAPI["🤖 Google Gemini API\n(Per-User Key)"]
    end

    ClientDevices -->|HTTPS / Private Network| Server
    JudgeBrowser -->|HTTP :3000| Frontend
    Frontend -->|REST / WS| Server

    EdgeDevices -->|MQTT TLS :1883| Mosquitto
    Mosquitto -->|Bridge Telemetry| Server

    Server -->|JSON-RPC| BaseSepolia
    Server -->|HTTPS REST| SatelliteAPI
    Server -->|HTTPS REST| AnthropicAPI
    Server -->|HTTPS REST| OpenAIAPI
    Server -->|HTTPS REST| GeminiAPI
```

---

## Network Segmentation & Port Map

| Component | Port | Protocol | Exposure | Security Control |
|---|---|---|---|---|
| **Central Server API** | 8000 | HTTP/HTTPS | Private network / Localhost | JWT Bearer token required for all non-health routes |
| **DApp Frontend** | 3000 | HTTP | Private network / Localhost | Static SPA bundle, CORS configured |
| **MQTT Broker** | 1883 | TCP/TLS | Edge network / Localhost | Client certificate or user/password authentication |
| **MQTT WebSockets** | 9001 | WSS | Private network | In-browser real-time telemetry updates |
| **SQLite DB** | N/A | File I/O | Internal volume only | Never exposed to network ports |

---

## Reproducible Startup
To start the complete environment in single-command mode:
```bash
# Production / Staging deployment
docker compose up -d --build

# Development mode with hot-reloading
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

---

## Metadata
- **Source File:** `docs/models/DEPLOYMENT_DIAGRAM.md`
- **Related Requirements:** R1, R2, R11, R12, R13, R25, R29
- **Responsible Owner:** Revand (Docker & Deployment)
