# ExcbonCP Agent Configuration

> Central index for all AI engineering agents. See [docs/agent-workflow.md](docs/agent-workflow.md) for detailed responsibilities, handoff formats, and escalation rules.

---

## 1. Architect

**Purpose:** System design, architecture decisions, and cross-cutting concerns.

Owns the high-level blueprint of ExcbonCP — the MRV pipeline, central server topology, data flow between subsystems, and integration contracts. Resolves cross-team conflicts, maintains ADRs, and ensures all components compose into a coherent whole.

- **Context files:** `docs/architecture/OVERVIEW.md`, `docs/architecture/CENTRAL_SERVER.md`, `docs/decisions.md`, `docs/requirements-traceability.md`, `docs/models/CONTEXT_DIAGRAM.md`
- **Allowed dirs:** `docs/`, `config/`, `scripts/`
- **Restricted dirs:** `src/firmware/`, `src/dapp/`, `contracts/`
- **Handoff:** `{ "from": "architect", "to": "<agent>", "decision": "<ADR ref>", "action": "<task>" }`

## 2. Backend

**Purpose:** API services, database operations, authentication, and business logic.

Implements the FastAPI application layer — REST endpoints, SQLite persistence, JWT authentication, sensor data ingestion, status engine execution, CO2e calculations, ledger management, and carbon market simulation.

- **Context files:** `docs/api-reference.md`, `docs/database-schema.md`, `src/api/`, `docs/architecture/OVERVIEW.md`
- **Allowed dirs:** `src/api/`, `src/core/`, `src/db/`, `tests/api/`, `tests/core/`
- **Restricted dirs:** `src/firmware/`, `src/dapp/`, `contracts/`
- **Handoff:** `{ "from": "backend", "to": "<agent>", "endpoint": "<path>", "schema": "<payload>" }`

## 3. Frontend

**Purpose:** DApp interface, interactive maps, UX design, and user-facing screens.

Builds the browser-based decentralized application — map visualization, parcel dashboards, community consent UI, carbon market simulation screens, auditor workflows, and responsive mobile layouts.

- **Context files:** `docs/models/DAPP_FLOWCHART.md`, `docs/models/USE_CASE_DIAGRAM.md`, `src/dapp/`
- **Allowed dirs:** `src/dapp/`, `public/`, `tests/e2e/`
- **Restricted dirs:** `src/api/`, `src/firmware/`, `contracts/`
- **Handoff:** `{ "from": "frontend", "to": "<agent>", "component": "<name>", "apiDep": "<endpoint>" }`

## 4. IoT

**Purpose:** ESP32 firmware, MQTT communication, sensor processing, and CO2e calculations.

Develops PlatformIO firmware for ESP32 devices with DHT22 temperature/humidity, soil moisture, and GPS sensors. Manages MQTT publish/subscribe, on-device data validation, power management, and offline buffering.

- **Context files:** `src/firmware/`, `docs/architecture/OVERVIEW.md`, `docs/models/DATA_FLOW_DIAGRAM.md`
- **Allowed dirs:** `src/firmware/`, `tests/firmware/`, `config/mqtt/`
- **Restricted dirs:** `src/api/`, `src/dapp/`, `contracts/`, `src/core/`
- **Handoff:** `{ "from": "iot", "to": "<agent>", "topic": "<mqtt_topic>", "payload": "<schema>" }`

## 5. Data/AI

**Purpose:** Satellite data integration, anomaly detection, and AI-powered explanations.

Integrates external satellite imagery for NDVI analysis, implements anomaly detection models against sensor readings, and generates natural-language AI explanations for status decisions and detected anomalies.

- **Context files:** `src/ai/`, `docs/models/DATA_FLOW_DIAGRAM.md`, `docs/requirements-traceability.md`
- **Allowed dirs:** `src/ai/`, `src/satellite/`, `tests/ai/`, `tests/satellite/`, `data/`
- **Restricted dirs:** `src/firmware/`, `src/dapp/`, `contracts/`
- **Handoff:** `{ "from": "data_ai", "to": "<agent>", "model": "<name>", "inputSchema": "<fields>", "outputSchema": "<fields>" }`

## 6. Blockchain

**Purpose:** Smart contract definitions, EAS attestation, and ledger integrity.

Manages the Ethereum Attestation Service integration on Base Sepolia — schema registration, attestation creation, on-chain verification. Ensures the SHA-256 hash chain ledger remains tamper-evident and attestation data is accurate.

- **Context files:** `contracts/`, `docs/contract.md`, `docs/models/SEQUENCE_DIAGRAM.md`
- **Allowed dirs:** `contracts/`, `src/blockchain/`, `tests/blockchain/`
- **Restricted dirs:** `src/firmware/`, `src/dapp/`, `src/api/`
- **Handoff:** `{ "from": "blockchain", "to": "<agent>", "txHash": "<hash>", "attestationUID": "<uid>" }`

## 7. Security

**Purpose:** Threat analysis, vulnerability scanning, and access control review.

Performs STRIDE threat modeling, reviews authentication/authorization implementations, audits credential storage, validates input sanitization, checks agent scope isolation, and ensures secrets never leak into version control.

- **Context files:** `docs/security/THREAT_MODEL.md`, `docs/security/ACCESS_CONTROL.md`, `docs/security/SECRETS.md`
- **Allowed dirs:** `docs/security/`, `tests/security/`, `config/`
- **Restricted dirs:** `src/firmware/` (read-only access to all `src/` for review)
- **Handoff:** `{ "from": "security", "to": "<agent>", "finding": "<CVE/issue>", "severity": "P1-P4", "remediation": "<steps>" }`

## 8. Reviewer

**Purpose:** Code review, QA validation, test coverage, and standards compliance.

Reviews pull requests and code changes against project conventions, verifies test coverage thresholds, validates documentation accuracy, checks requirement traceability, and ensures all acceptance criteria are met before merge.

- **Context files:** `docs/requirements-traceability.md`, `docs/agent-workflow.md`, `docs/toolchain.md`, `.github/`
- **Allowed dirs:** `tests/`, `docs/`, `.github/` (read-only access to all `src/` for review)
- **Restricted dirs:** None (read-only), write only to `tests/`, `docs/`
- **Handoff:** `{ "from": "reviewer", "to": "<agent>", "verdict": "approved|changes_requested", "items": ["<issue>"] }`

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
- Graphify fallback (hard limit): if `graphify` is not found, try the absolute path `/home/greatsundanese/.local/bin/graphify` once. If that also fails, or output is an error, STOP — do not debug the environment, do not read `.git/hooks/`, do not investigate `GRAPHIFY_PYTHON`, do not run `python3 -m graphify` or look for a `.venv` (none exists; graphify is pipx-installed, not a system Python module). Proceed with normal exploration (grep/glob/read) and continue the task. Graphify is an accelerator, never a blocker.
# Antigravity & Agent Guidelines for excboncp

## Senior Full Stack Developer Standards
1. Ikuti framework, bahasa pemrograman, dan gaya penulisan kode yang sedang dipakai pada proyek ini.
2. Tulis komentar hanya pada bagian logika yang penting dan kompleks. Buat bahasanya natural layaknya developer asli, bukan komentar generik buatan AI dan jika ada komentar yang terlihat AI atau ada element AI segera revisi agar tidak menumpuk.
3. Selesaikan bug langsung pada akar masalahnya tanpa memicu error baru pada kode atau fitur lain.
4. Jaga tampilan tetap clean, rapi, selaras dengan desain yang sudah ada, dan hindari gaya generik atau AI slop.
5. Buat setiap tombol atau elemen interaktif memiliki desain yang menarik, modern, dan tidak kaku (lengkap dengan efek interaksi yang halus).
6. Pastikan setiap penambahan atau perubahan desain langsung otomatis responsif di tampilan mobile/layar HP.
7. Jika memerlukan penambahan file baru, buatkan struktur folder dan file yang rapi dan terorganisir. Beri nama file/folder menggunakan bahasa Inggris yang wajar, profesional, dan tidak terlihat kaku.
8. Jangan membuat celah kode yang gampang di bobol orang lain dan mudah diambil datanya.
9. Aturan dan standar kerja ini selalu aktif untuk setiap iterasi dan perbaikan selanjutnya tanpa perlu diinput ulang oleh user.
10. Perintah seperti `/antislop` dan filter anti-slop selalu aktif secara default.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
<!-- antislop:end -->

