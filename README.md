# ExcbonCP — Decentralized MRV Forest System

[![CI](https://github.com/lilymilo/excboncp/actions/workflows/ci.yml/badge.svg)](https://github.com/lilymilo/excboncp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

ExcbonCP is a decentralized Monitoring, Reporting, and Verification (MRV) system for forest carbon credits. It combines IoT sensors, satellite imagery, blockchain attestation, and AI-powered anomaly detection to create a transparent and verifiable carbon credit ecosystem.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│  IoT Layer  │────▶│   Backend    │────▶│   Blockchain   │
│ ESP32+MQTT  │     │ FastAPI+SQLite│     │ Base Sepolia   │
└─────────────┘     └──────┬───────┘     └────────────────┘
                           │
                    ┌──────┴───────┐
                    │   AI / ML    │
                    │ Anomaly Det. │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  Frontend    │
                    │  DApp + Maps │
                    └──────────────┘
```

- **IoT Layer:** ESP32 sensors (DHT22, soil moisture, GPS) → MQTT
- **Backend:** FastAPI REST API with SQLite, deterministic status engine
- **Blockchain:** SHA-256 hash chain ledger, EAS attestation on Base Sepolia
- **AI/ML:** Anomaly detection, satellite NDVI analysis, explainable AI
- **Frontend:** DApp with interactive maps, carbon market simulation
- **Engineering Server:** Multi-user AI agent orchestration with per-user credentials

## Quick Start

Untuk menjalankan API, worker MQTT, dan web development dengan satu perintah:

```bash
./scripts/dev.sh
```

Web tersedia di `http://localhost:3000` dan API di `http://localhost:8000`.
Perlu Docker yang berjalan serta Node.js/npm. Tekan `Ctrl+C` untuk menghentikan web;
layanan backend dapat dihentikan dengan `docker compose down`.

### Prerequisites

- Docker and Docker Compose
- Git
- Python 3.12+ (for local development)

### Central Engineering Server

```bash
# 1. Clone the repository
git clone https://github.com/lilymilo/excboncp.git
cd excboncp

# 2. Run setup (generates secrets, installs deps)
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Start the server with Docker
./scripts/start-server.sh --mode docker

# 4. Create the initial admin user
python3 scripts/create-admin.py

# 5. Access the server
open http://localhost:8000/docs
```

### Development Setup

```bash
# 1. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r server/requirements.txt

# 3. Copy environment config
cp .env.example .env
python3 scripts/generate-secrets.py  # Copy output into .env

# 4. Start in local mode with hot reload
./scripts/start-server.sh --mode local

# 5. Run tests
pytest

# 6. Optional: load simulation-only MRV demo data
SEED_DEMO_PASSWORD='choose-a-demo-password' .venv/bin/python -m server.seed
```

The seed creates parcels A/B, demo accounts, simulated sensor readings, status
snapshots, and two simulation-only ledger blocks. Verify them publicly at
`GET /verify/1` and `GET /verify/2`.

### EAS Attestation (Day 3 / R7)

The EAS attestation layer anchors local SHA-256 ledger blocks to Base Sepolia.
It runs in **simulation mode by default** (`EVM_SIMULATION_MODE=true`) so the
pipeline can be exercised without Sepolia ETH.

```bash
# 1. Configure your auditor wallet (Base Sepolia)
cp .env.example .env
# Edit .env: set EVM_PRIVATE_KEY (your real key), EVM_RPC_URL, and set
# EVM_SIMULATION_MODE=false only when you have Sepolia ETH.

# 2. Start the server
./scripts/start-server.sh --mode local

# 3. Register the EAS schema (auditor only)
curl -X POST http://localhost:8000/blockchain/register-schema \
  -H "Authorization: Bearer <auditor-token>"

# 4. Anchor a verified ledger block to Base Sepolia (auditor only)
curl -X POST "http://localhost:8000/blockchain/attest/1" \
  -H "Authorization: Bearer <auditor-token>"

# 5. Check anchoring status
curl http://localhost:8000/blockchain/status/1 \
  -H "Authorization: Bearer <any-user-token>"

# 6. List all attested blocks
curl http://localhost:8000/blockchain/attestations \
  -H "Authorization: Bearer <any-user-token>"
```

In simulation mode, attestations are recorded locally (with fake UIDs) and the
`ledger_blocks.eas_uid` field is updated — no blockchain transaction is sent.
A missing or malformed `EVM_PRIVATE_KEY` automatically keeps the server in
simulation mode, so the demo never crashes or sends an unsigned transaction.
To go live, install `web3`, set a real Base Sepolia RPC URL, fund your wallet
with Sepolia ETH (e.g., via https://sepoliafaucet.com), and set
`EVM_SIMULATION_MODE=false`. Smart contract deployment (`contracts/EasProof.sol`)
is a Day 4 milestone.

Run the Day 3 tests with:

```bash
pytest tests/blockchain/ -v
```

### IoT Node & ESP32 Firmware

ESP32 firmware (`iot-node/sketch.ino`) supports both physical ESP32 and Wokwi simulation:

| Sensor / Component | ESP32 Pin | Description |
| :--- | :--- | :--- |
| **DHT22** (Temp/Humidity) | GPIO 15 | Digital temperature & relative humidity sensor |
| **Soil Moisture** | GPIO 35 (or 34 in Wokwi) | ADC analog input for soil moisture calibration |
| **Flame Detector** | GPIO 34 (or 13 in Wokwi) | Digital input for flame / fire detection alarm |

Run mock sensor publisher for testing without physical hardware:
```bash
python scripts/mock_sensor.py --mode normal
python scripts/mock_sensor.py --mode smoke
```

### Windows (PowerShell)

Windows teammates can use the Day 1 helper instead of the Bash scripts:

```powershell
# 1. Create .venv, install dependencies, generate .env, and prepare data/
.\scripts\windows\day1.ps1 setup

# 2. Run Ruff and pytest
.\scripts\windows\day1.ps1 test

# 3. Load the simulation-only demo data (prompts for a demo password)
.\scripts\windows\day1.ps1 seed

# 4. Start the local server
.\scripts\windows\day1.ps1 serve
```

If PowerShell blocks local scripts, use the wrapper:

```cmd
.\scripts\windows\day1.cmd setup
```

Run `.\scripts\windows\day1.ps1 help` to see all actions, including
`health`, `docker`, and `status`.

### Docker Compose (Development)

```bash
# Start with live code reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Project Structure

```
excboncp/
├── server/              # FastAPI central engineering server
│   ├── main.py          # Application entrypoint
│   ├── config.py        # Configuration management
│   ├── database.py      # SQLite database layer
│   ├── auth/            # Authentication & authorization
│   ├── credentials/     # Per-user credential vault
│   ├── tasks/           # Task management
│   └── requirements.txt # Python dependencies
├── iot-node/            # ESP32 firmware & telemetry gateway
├── docker/              # Docker build files
├── contracts/           # Smart contracts (EAS Attestation, Day 3)
├── scripts/             # Setup & maintenance scripts
├── tests/               # Test suite
├── docs/                # Documentation
├── data/                # Runtime data (gitignored except .gitkeep)
└── .github/             # CI/CD & templates
```

## Day Breakdown

| Day | Owner  | Feature |
|-----|--------|---------|
| Day 1 | Revand | MRV schema + seed, central server setup |
| Day 2 | Revand | SHA-256 hash chain ledger + public verification (`GET /verify/{id}`) |
| Day 3 | Revand | EAS blockchain attestation on Base Sepolia (R7) |
| Day 4 | Revand | Deploy EAS contract to Sepolia, schema registration, auditor whitelist |
| Day 5 | Bagus  | ESP32 firmware + MQTT telemetry |
| Day 6 | Bagus  | MQTT broker integration + sensor data ingestion |
| ... | ... | (see docs/requirements-traceability.md for full R1–R29 backlog) |

## Team

| Member   | Responsibilities                              |
|----------|-----------------------------------------------|
| **Revand** | Architecture, Smart Contracts, Deployment, EAS Attestation (Day 3) |
| **Bagus**  | IoT, MQTT, Sensors, Carbon Economy          |
| **Davin**  | Status Engine, Satellite, AI, Anomaly Detection |
| **Malik**  | DApp, Maps, UX, Presentations               |

## Documentation

See [docs/INDEX.md](docs/INDEX.md) for full documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on branch naming, commit messages, PR process, and code review requirements.

## License

MIT License — see [LICENSE](LICENSE)
