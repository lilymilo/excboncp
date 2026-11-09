# Requirements Traceability Matrix

> Maps all 29 ExcbonCP requirements from specification to implementation, testing, and current status.

---

## Priority Groups

| Group | Requirements | Description |
|-------|-------------|-------------|
| **Mandatory Demo** | R1–R14 | Core features required for competition demonstration |
| **Secondary** | R15–R19 | Important supporting features |
| **Application/Usability** | R20–R24 | User experience and polish features |
| **Finalist Deployment** | R25–R29 | Deployment, security, and evaluation readiness |

---

## Traceability Matrix

### R1–R14: Mandatory Demo

| ID | Description | Priority | Responsible | Agent | Code Location | Test | Status |
|----|-------------|----------|-------------|-------|---------------|------|--------|
| R1 | IoT Sensor Data Collection — ESP32 with DHT22 (temp/humidity), capacitive soil moisture sensor, and GPS module. Collect readings at configurable intervals. | Mandatory Demo | Bagus | IoT | `src/firmware/` | `tests/firmware/test_sensors.cpp` | 🔲 Planned |
| R2 | MQTT Communication Protocol — Publish sensor data to MQTT broker on topic `excboncp/sensors/{parcel_id}`. QoS 1, TLS transport, JSON payload. | Mandatory Demo | Bagus | IoT | `src/firmware/mqtt/`, `config/mqtt/` | `tests/firmware/test_mqtt.cpp` | 🔲 Planned |
| R3 | Deterministic Status Engine — Evaluate parcel conditions to produce VERIFIED, WARNING, DISPUTE, or BLOCKED status. Same inputs must always produce same output. | Mandatory Demo | Davin | Backend | `src/core/status_engine.py` | `tests/core/test_status_engine.py` | 🔲 Planned |
| R4 | Community Consent Mechanism — Community members grant/revoke consent for parcel monitoring. Parcel cannot be VERIFIED without active consent. | Mandatory Demo | Davin | Backend | `src/core/consent.py` | `tests/core/test_consent.py` | 🔲 Planned |
| R5 | CO2e Carbon Calculation — Estimate carbon sequestration per parcel based on sensor data, area, vegetation type, and NDVI. | Mandatory Demo | Bagus | Backend | `src/core/co2e.py` | `tests/core/test_co2e.py` | 🔲 Planned |
| R6 | SHA-256 Hash Chain Ledger — Append-only ledger where each entry includes SHA-256 hash of previous entry. Tamper-evident. | Mandatory Demo | Revand | Backend, Blockchain | `server/ledger/` | `tests/test_ledger.py` | ✅ Implemented & Tested |
| R7 | EAS Blockchain Attestation — Create on-chain attestations on Base Sepolia testnet via Ethereum Attestation Service. | Mandatory Demo | Revand | Blockchain | `src/blockchain/eas.py`, `contracts/` | `tests/blockchain/test_eas.py` | 🔲 Planned |
| R8 | Satellite Data Integration — Fetch NDVI (Normalized Difference Vegetation Index) data for registered parcels from satellite provider. | Mandatory Demo | Davin | Data/AI | `src/satellite/ndvi.py` | `tests/satellite/test_ndvi.py` | 🔲 Planned |
| R9 | AI Anomaly Detection — Detect discrepancies between sensor readings, satellite data, and historical baselines. Flag suspicious patterns. | Mandatory Demo | Davin | Data/AI | `src/ai/anomaly.py` | `tests/ai/test_anomaly.py` | 🔲 Planned |
| R10 | AI Explanation System — Generate human-readable explanations for status decisions and detected anomalies using LLM. | Mandatory Demo | Davin | Data/AI | `src/ai/explainer.py` | `tests/ai/test_explainer.py` | 🔲 Planned |
| R11 | SQLite Database — Single-file embedded database for all application data. Schema supports all entities. | Mandatory Demo | Revand | Backend | `server/database.py`, `server/seed.py` | `tests/test_schema.py`, `tests/test_seed.py` | 🟡 In Progress (schema + seed; MRV API wiring pending) |
| R12 | RESTful API — FastAPI backend exposing all services as REST endpoints. JSON request/response. OpenAPI docs. | Mandatory Demo | Bagus | Backend | `src/api/` | `tests/api/` | 🔲 Planned |
| R13 | DApp with Interactive Map — Browser-based SPA with Leaflet map showing parcels, color-coded by status. Drill-down to parcel details. | Mandatory Demo | Malik | Frontend | `src/dapp/` | `tests/e2e/test_map.js` | 🔲 Planned |
| R14 | Simulated Carbon Market — UI for listing, buying, and selling verified carbon credits. Simulated economy (no real money). | Mandatory Demo | Malik | Frontend | `src/dapp/market/` | `tests/e2e/test_market.js` | 🔲 Planned |

### R15–R19: Secondary

| ID | Description | Priority | Responsible | Agent | Code Location | Test | Status |
|----|-------------|----------|-------------|-------|---------------|------|--------|
| R15 | Role-Based Access Control — Roles: owner, member, auditor. Each role has defined permissions for API endpoints and UI features. | Secondary | Davin | Backend, Security | `src/api/auth/`, `src/core/rbac.py` | `tests/api/test_auth.py` | 🔲 Planned |
| R16 | Data Visualization Dashboard — Charts and graphs showing sensor trends, status history, carbon calculations, and anomaly timeline. | Secondary | Malik | Frontend | `src/dapp/dashboard/` | `tests/e2e/test_dashboard.js` | 🔲 Planned |
| R17 | Audit Trail — Log all significant actions (status changes, attestations, consent events, login/logout) with timestamp, user, and details. | Secondary | Revand | Backend | `src/core/audit.py` | `tests/core/test_audit.py` | 🔲 Planned |
| R18 | Multi-language Support — UI supports Bahasa Indonesia and English. Switchable at runtime. | Secondary | Malik | Frontend | `src/dapp/i18n/` | `tests/e2e/test_i18n.js` | 🔲 Planned |
| R19 | Offline Capability — ESP32 buffers readings when MQTT is unreachable. DApp shows cached data when API is unavailable. | Secondary | Bagus | IoT, Frontend | `src/firmware/buffer/`, `src/dapp/cache/` | `tests/firmware/test_buffer.cpp` | 🔲 Planned |

### R20–R24: Application/Usability

| ID | Description | Priority | Responsible | Agent | Code Location | Test | Status |
|----|-------------|----------|-------------|-------|---------------|------|--------|
| R20 | Mobile Responsive Design — DApp renders correctly on mobile devices (≥ 360px width). Touch-friendly controls. | Application | Malik | Frontend | `src/dapp/styles/` | `tests/e2e/test_responsive.js` | 🔲 Planned |
| R21 | Real-time Data Updates — DApp updates sensor readings and status without manual page refresh. WebSocket or SSE. | Application | Malik | Frontend, Backend | `src/dapp/realtime/`, `src/api/ws/` | `tests/e2e/test_realtime.js` | 🔲 Planned |
| R22 | Export Functionality — Export sensor data, status history, and carbon reports as CSV or PDF. | Application | Malik | Frontend, Backend | `src/api/export/`, `src/dapp/export/` | `tests/api/test_export.py` | 🔲 Planned |
| R23 | Notification System — Alert users on status changes, anomaly detections, and consent events. In-app and optional email. | Application | Bagus | Backend, Frontend | `src/core/notifications.py`, `src/dapp/notifications/` | `tests/core/test_notifications.py` | 🔲 Planned |
| R24 | Help and Documentation — In-app help pages, tooltips, and contextual documentation. Getting started guide. | Application | Malik | Frontend | `src/dapp/help/` | `tests/e2e/test_help.js` | 🔲 Planned |

### R25–R29: Finalist Deployment

| ID | Description | Priority | Responsible | Agent | Code Location | Test | Status |
|----|-------------|----------|-------------|-------|---------------|------|--------|
| R25 | Docker Deployment — Complete Docker Compose setup for all services: backend, MQTT broker, frontend, and proxy. One-command startup. | Finalist | Revand | Backend | `docker-compose.yml`, `Dockerfile.*` | `tests/integration/test_docker.sh` | 🔲 Planned |
| R26 | Security Hardening — Input validation, SQL injection prevention, XSS protection, HTTPS enforcement, rate limiting. | Finalist | Davin | Security | `src/api/middleware/`, `docs/security/` | `tests/security/` | 🔲 Planned |
| R27 | Judge Evaluation Guide — Step-by-step guide for judges to evaluate the system. Demo script, feature checklist. | Finalist | Malik | Reviewer | `docs/judge-guide.md` | N/A | 🔲 Planned |
| R28 | System Reset Capability — One-command reset to clean state for repeated demonstrations. Preserves configuration, clears data. | Finalist | Bagus | Backend | `scripts/reset.sh` | `tests/integration/test_reset.sh` | 🔲 Planned |
| R29 | Health Monitoring — System health dashboard showing service status, API latency, sensor connectivity, and database size. | Finalist | Bagus | Backend | `src/api/health/`, `src/dapp/health/` | `tests/api/test_health.py` | 🔲 Planned |

---

## Coverage Summary

| Priority Group | Total | Planned | In Progress | Complete |
|----------------|-------|---------|-------------|----------|
| Mandatory Demo | 14 | 13 | 1 | 0 |
| Secondary | 5 | 5 | 0 | 0 |
| Application/Usability | 5 | 5 | 0 | 0 |
| Finalist Deployment | 5 | 5 | 0 | 0 |
| **Total** | **29** | **28** | **1** | **0** |

## Ownership Summary

| Team Member | Requirements |
|-------------|-------------|
| Revand | R6, R7, R11, R17, R25 |
| Bagus | R1, R2, R5, R12, R19, R23, R28, R29 |
| Davin | R3, R4, R8, R9, R10, R15, R26 |
| Malik | R13, R14, R16, R18, R20, R21, R22, R24, R27 |
