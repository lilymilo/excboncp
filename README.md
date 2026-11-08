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
```

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
├── docker/              # Docker build files
├── scripts/             # Setup & maintenance scripts
├── tests/               # Test suite
├── docs/                # Documentation
├── data/                # Runtime data (gitignored except .gitkeep)
└── .github/             # CI/CD & templates
```

## Team

| Member   | Responsibilities                              |
|----------|-----------------------------------------------|
| **Revand** | Architecture, Smart Contracts, Deployment   |
| **Bagus**  | IoT, MQTT, Sensors, Carbon Economy          |
| **Davin**  | Status Engine, Satellite, AI, Anomaly Detection |
| **Malik**  | DApp, Maps, UX, Presentations               |

## Documentation

See [docs/INDEX.md](docs/INDEX.md) for full documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on branch naming, commit messages, PR process, and code review requirements.

## License

MIT License — see [LICENSE](LICENSE)
