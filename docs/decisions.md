# ExcbonCP Architecture Decision Records (ADRs)

> Authoritative log of key architectural decisions, rationale, context, and consequences.

---

## Index of ADRs

| ADR | Title | Status | Date | Decision Lead |
|---|---|:---:|:---:|---|
| **ADR-001** | Centralized Engineering Server for Multi-User AI Workflow | Accepted | 2026-11-07 | Revand |
| **ADR-002** | Per-User AI Provider Credential Vault with Fernet Encryption | Accepted | 2026-11-07 | Davin |
| **ADR-003** | FastAPI and SQLite with WAL Mode for Engineering Gateway | Accepted | 2026-11-07 | Bagus |
| **ADR-004** | Isolated Task Workspaces and In-Memory File Locking | Accepted | 2026-11-07 | Revand |
| **ADR-005** | Strict Separation Between Deterministic Logic and AI Explanations | Accepted | 2026-11-08 | Davin |
| **ADR-006** | Dual-Tier Integrity: Local SHA-256 Ledger + Base Sepolia EAS Attestation | Accepted | 2026-11-08 | Revand |
| **ADR-007** | Simulated Carbon Economy Enforced at Application Layer | Accepted | 2026-11-08 | Malik |
| **ADR-008** | Pure Bcrypt Password Hashing over Passlib | Accepted | 2026-11-08 | Davin |

---

## ADR-001: Centralized Engineering Server for Multi-User AI Workflow

### Context
The team (Revand, Bagus, Davin, Malik) requires collaborative AI-assisted development. Local-only agent configurations lead to state divergence, environment conflicts, and duplicate toolchains.

### Decision
Deploy one secure central server hosting the agent execution runtime, task queue, and project truth. Local developer laptops act as clients accessing the shared gateway over authenticated APIs/UI.

### Consequences
- **Positive:** Single source of project truth; unified audit logs; standardized execution environment.
- **Negative:** Requires team server uptime and network connectivity.

---

## ADR-002: Per-User AI Provider Credential Vault with Fernet Encryption

### Context
Team members use different AI providers and personal API keys. Shared API keys create cost-attribution conflicts and credential exposure risks.

### Decision
Each user registers their personal API key (Anthropic, OpenAI, Gemini, etc.). Keys are encrypted at rest with Fernet (AES-128-CBC + HMAC-SHA256). Stored keys are never returned raw and never accessible across users.

### Consequences
- **Positive:** Zero cross-tenant key risk; clear financial attribution; provider-neutral.
- **Negative:** Users must supply their own API keys to run agent tasks.

---

## ADR-003: FastAPI and SQLite with WAL Mode for Engineering Gateway

### Context
The project needs a responsive, lightweight, dependency-minimal backend that runs reliably in Docker and low-resource environments.

### Decision
Use FastAPI (Python 3.12+) with `aiosqlite`. Enable Write-Ahead Logging (`PRAGMA journal_mode=WAL`) to allow concurrent reads without locking writes.

### Consequences
- **Positive:** Zero external database server dependencies; trivial backup (`sqlite3 .backup`); native async throughput.
- **Negative:** Single write lock limit (sufficient for team scale of 4–10 concurrent developers).

---

## ADR-004: Isolated Task Workspaces and In-Memory File Locking

### Context
Multiple agents executing concurrently could overwrite the same files or produce conflicting Git states.

### Decision
Execute tasks inside dedicated directories (`data/workspaces/<task_id>`). Before modifying files, acquire task-level file locks. Prune workspaces upon completion.

### Consequences
- **Positive:** Eliminates race conditions and accidental file destruction.
- **Negative:** Disk usage increases temporarily during concurrent runs.

---

## ADR-005: Strict Separation Between Deterministic Logic and AI Explanations

### Context
Regulatory MRV frameworks require verifiable, reproducible carbon calculations and land health assessments. Non-deterministic LLM hallucinations in land status could cause catastrophic misallocations.

### Decision
All land parcel status decisions (`VERIFIED`, `WARNING`, `DISPUTE`, `BLOCKED`) and CO2e figures are computed strictly via deterministic code. AI models are restricted to read-only anomaly flagging and human-readable natural language explanations.

### Consequences
- **Positive:** 100% auditability and legal compliance.
- **Negative:** AI cannot "auto-correct" ambiguous land states without human intervention.

---

## ADR-006: Dual-Tier Integrity: Local SHA-256 Ledger + Base Sepolia EAS Attestation

### Context
Writing every high-frequency sensor reading directly to blockchain incurs prohibitive gas costs and transaction latency. Storing only in SQLite provides insufficient decentralization proof.

### Decision
Maintain a local, append-only SHA-256 chained hash ledger for all events. Upon auditor approval, anchor the state hash and carbon tonnage to Base Sepolia via Ethereum Attestation Service (EAS).

### Consequences
- **Positive:** Instant zero-cost local logging combined with cryptographically verifiable on-chain proofs.
- **Negative:** Requires auditor review step before on-chain publishing.

---

## ADR-007: Simulated Carbon Economy Enforced at Application Layer

### Context
The competition demo includes a carbon credit trading simulation. It must never risk confusion with real-world financial assets or real-money transactions.

### Decision
Enforce simulated trading rules strictly on the server: only `VERIFIED` parcels can list credits; credits exist only in the application database; all UI displays explicit simulation watermarks.

### Consequences
- **Positive:** Compliance with regulatory standards; safe demonstration environment.
- **Negative:** No direct mainnet DEX integration during demo.

---

## ADR-008: Pure Bcrypt Password Hashing over Passlib

### Context
`passlib[bcrypt]` encounters compatibility issues with modern `bcrypt` (v4/v5) and Python 3.14 (72-byte truncation checks and missing `__about__` attributes).

### Decision
Use the standard, actively-maintained `bcrypt` library directly with explicit 72-byte truncation handling.

### Consequences
- **Positive:** Robust across all Python versions; eliminated deprecation warnings and runtime crashes.
- **Negative:** Custom wrapper function replaces `CryptContext`.
