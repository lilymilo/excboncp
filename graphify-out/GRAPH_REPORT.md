# Graph Report - excboncp  (2026-11-10)

## Corpus Check
- 131 files · ~80,507 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .example 2, .toml 1)

## Summary
- 1649 nodes · 2957 edges · 118 communities (88 shown, 30 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 119 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `daa62a49`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_ledger.py
- auth/service.py
- tasks/service.py
- Credential Vault Models
- test_eas.py
- Deployment & Runbook Guides
- Blueprint System Modeling v5
- ledger/service.py
- REST API Reference
- EAS Attestation Client
- BaseModel
- create-admin.py
- Password Hashing & Seed Data
- blockchain/conftest.py
- Agent Registry & Execution Models
- fixture
- SQLite Schema Specification
- test_schema.py
- Contribution Guidelines
- test_auth.py
- _insert_http_ledger_block
- Blockchain Attestation Router
- MRV Simulation Runbook
- market/service.py
- Architecture — Central Server
- Windows — Day1
- environment
- Contract Module
- Docker Compose Module
- Architecture — Overview
- Toolchain Module
- test_blockchain_api.py
- Tasks — Service
- Workflows — Ci
- database.py
- Contracts — Readme
- Agent Workflow Module
- Deployment Module
- Agents Module
- gee_processor.py
- approve_parcel
- Index Module
- docs/deployment.md
- TestAIPipeline
- Requirements Traceability Module
- Issue Template — Bug Report
- Workflows — Ci
- Docker Compose.Dev Module
- Runbook Module
- Security — Access Control
- Issue Template — Task
- Workflows — Ci
- Issue Template — Feature Request
- .Github — Pull Request Template
- ledger/router.py
- package.json
- Models — Deployment Diagram
- Models — Sequence Diagram
- Security — Threat Model
- Token Efficiency Module
- global_exception_handler
- Workflows — Ci
- execute_agent
- Models — State Diagram
- start_subscriber
- Team Ownership Module
- Workflows — Ci
- Models — Context Diagram
- Models — Dapp Flowchart
- Models — Data Flow Diagram
- Models — Use Case Diagram
- Workflows — Ci
- Workflows — Ci
- Workflows — Ci
- Requirements Dev Module
- steps
- database.py
- decrypt_credential
- CLAUDE.md
- GEMINI.md
- copilot-instructions.md
- backup.sh
- handle_telemetry_message
- compute_status
- docs/security/INCIDENT_RESPONSE.md
- _get_append_lock
- UserResponse
- test_root_discovery_endpoint
- os
- health-check.sh
- start-server.sh
- create_task
- Panduan Penggunaan & Eksekusi
- create_new_task
- diagram.json
- dependencies.py
- volumes
- docs/project-status.md

## God Nodes (most connected - your core abstractions)
1. `UserResponse` - 51 edges
2. `get_db()` - 50 edges
3. `EasClient` - 49 edges
4. `append_block()` - 24 edges
5. `anchor_block_to_eas()` - 24 edges
6. `audit_auth_action()` - 23 edges
7. `canonical_json()` - 21 edges
8. `verify_block()` - 19 edges
9. `seed_demo_data()` - 18 edges
10. `get_current_user()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `test_append_rejects_invalid_payload()` --uses--> `LedgerValidationError`  [INFERRED]
  tests/test_ledger.py → server/ledger/service.py
- `eas_client()` --uses--> `EasClient`  [INFERRED]
  tests/blockchain/conftest.py → src/blockchain/eas.py
- `test_anchor_block_not_found()` --uses--> `EasClient`  [INFERRED]
  tests/blockchain/test_eas.py → src/blockchain/eas.py
- `test_anchor_block_rejects_non_verified()` --uses--> `EasClient`  [INFERRED]
  tests/blockchain/test_eas.py → src/blockchain/eas.py
- `test_anchor_block_to_eas_simulation()` --uses--> `EasClient`  [INFERRED]
  tests/blockchain/test_eas.py → src/blockchain/eas.py

## Import Cycles
- None detected.

## Communities (118 total, 30 thin omitted)

### Community 0 - "test_ledger.py"
Cohesion: 0.16
Nodes (11): append_block(), verify_block(), _insert_parcel_and_auditor(), test_append_block_uses_genesis_and_contract_hash(), test_append_rejects_invalid_payload(), test_second_block_links_to_the_first(), test_verify_block_detects_earlier_tampering(), test_verify_block_detects_payload_tampering() (+3 more)

### Community 1 - "auth/service.py"
Cohesion: 0.07
Nodes (22): UserCreate, UserUpdate, register(), authenticate_user(), create_session(), create_user(), deactivate_user(), get_user_by_id() (+14 more)

### Community 2 - "tasks/service.py"
Cohesion: 0.13
Nodes (12): TaskResponse, TaskStatus, cancel_task(), cleanup_workspace(), create_task(), create_workspace(), delete_task(), get_task() (+4 more)

### Community 3 - "Credential Vault Models"
Cohesion: 0.07
Nodes (16): CredentialCreate, CredentialResponse, CredentialUpdate, Provider, delete_own_credential(), list_credentials(), list_providers(), save_credential() (+8 more)

### Community 4 - "test_eas.py"
Cohesion: 0.08
Nodes (17): anchor_block_to_eas(), AnchoringResult, _failure(), get_attestation_status(), get_attested_blocks(), verify_auditor(), test_anchor_block_not_found(), test_anchor_block_rejects_non_verified() (+9 more)

### Community 5 - "Deployment & Runbook Guides"
Cohesion: 0.06
Nodes (33): 1. Clone the repository, 1. Configure your auditor wallet (Base Sepolia), 1. Create and activate a virtual environment, 1. Create .venv, install dependencies, generate .env, and prepare data/, 2. Install dependencies, 2. Run Ruff and pytest, 3. Load the simulation-only demo data (prompts for a demo password), 3. Register the EAS schema (auditor only) (+25 more)

### Community 6 - "Blueprint System Modeling v5"
Cohesion: 0.05
Nodes (43): 8A: Gerbang masuk (dari membuka alamat sampai keluar), 8B: Alur layar setelah masuk, 8C: Auditor menyetujui, hash dikunci, 8D: Verifikasi publik, 8E: Perjalanan satu orang dari masuk sampai selesai, per peran, Apa yang berubah dari localhost ke link, Aturan keputusan dan aturan ekonomi, Bahasa di layar (istilah teknis menjadi kata sehari-hari) (+35 more)

### Community 7 - "ledger/service.py"
Cohesion: 0.15
Nodes (9): canonical_json(), compute_hash(), get_block(), LedgerValidationError, _parse_canonical_data(), _validate_payload(), verify_chain(), _seed_approve_database() (+1 more)

### Community 8 - "REST API Reference"
Cohesion: 0.05
Nodes (37): 1. Authentication & Session Management, 2. Per-User AI Credential Vault, 3. Agent Execution & Orchestration, 4. Task Management & Workspaces, 5. System Health & Monitoring, 6. Public Ledger Verification, 7. Blockchain — EAS Attestation (Day 3, R7), DELETE /api/credentials/{credential_id} (+29 more)

### Community 9 - "EAS Attestation Client"
Cohesion: 0.07
Nodes (8): AttestationResult, EasClient, EasClientError, register_schema(), test_attest_rejects_duplicate_block(), test_attest_rejects_non_verified_status(), test_attest_simulation(), test_register_schema_simulation()

### Community 10 - "BaseModel"
Cohesion: 0.18
Nodes (5): RoleUpdate, StatusUpdate, TokenResponse, UserLogin, create_access_token()

### Community 11 - "create-admin.py"
Cohesion: 0.07
Nodes (22): 2. Reset database and run migrations, 3. Create initial Owner account (Revand), 4. Create the initial admin user, async_main(), main(), validate_password(), main(), 1. Install Hardhat and EAS dependencies (+14 more)

### Community 12 - "Password Hashing & Seed Data"
Cohesion: 0.08
Nodes (16): close_db(), init_db(), lifespan(), _insert_rows(), load_seed_data(), _main(), _print_seed_accounts(), seed_demo_data() (+8 more)

### Community 13 - "blockchain/conftest.py"
Cohesion: 0.19
Nodes (5): auditor_user(), eas_client(), member_user(), _reset_eas_singleton(), sample_ledger_blocks()

### Community 14 - "Agent Registry & Execution Models"
Cohesion: 0.20
Nodes (6): AgentDefinition, AgentType, get_agent(), list_agents(), get_agent_details(), get_agents()

### Community 15 - "fixture"
Cohesion: 0.18
Nodes (6): auth_headers(), owner_headers(), _setup_env(), test_client(), test_owner(), test_user()

### Community 16 - "SQLite Schema Specification"
Cohesion: 0.08
Nodes (24): 1. Engine & Configuration, 2.1 users, 2.2 credentials, 2.3 tasks, 2.4 audit_logs, 2.5 sessions, 2. Central Server Tables, 3.1 zones (+16 more)

### Community 17 - "test_schema.py"
Cohesion: 0.13
Nodes (9): get_db_context(), _migrate_schema(), _table_columns(), test_foreign_keys_are_enforced(), test_migration_adds_r23_columns_to_legacy_users_table(), test_mrv_tables_exist(), test_sensor_columns_follow_blueprint_v5(), test_sensor_source_must_be_esp_or_simulator() (+1 more)

### Community 18 - "Contribution Guidelines"
Cohesion: 0.08
Nodes (30): Branch Naming, Code Review, Commit Messages, Contributing to ExcbonCP, Examples, For Authors, For Reviewers, Getting Started (+22 more)

### Community 19 - "test_auth.py"
Cohesion: 0.05
Nodes (24): Run specific test, Run specific test file, _get_or_create_user(), test_execute_agent_fails_without_credentials(), test_execute_agent_succeeds_with_credentials(), test_get_specific_agent_definition(), test_list_all_eight_agents(), test_get_current_user_profile() (+16 more)

### Community 20 - "_insert_http_ledger_block"
Cohesion: 0.16
Nodes (6): _insert_http_ledger_block(), ledger_client(), test_verify_endpoint_is_public_and_valid(), test_verify_endpoint_mentions_eas_lock(), test_verify_endpoint_reports_tampering(), test_verify_endpoint_returns_404_for_unknown_entry()

### Community 21 - "Blockchain Attestation Router"
Cohesion: 0.12
Nodes (6): attest_block(), attestation_status(), list_attestations(), simulation_status(), test_eas_client_creation(), test_eas_client_without_key_uses_simulation()

### Community 22 - "MRV Simulation Runbook"
Cohesion: 0.11
Nodes (18): 1.1.1 Loading Simulation-Only MRV Demo Data, 1.1.2 Windows Setup Helper (PowerShell), 1.1 Initial Setup, 1.2 Starting the Central Server, 1.3 Stopping the Server, 1. Clone repository, 1. Server Lifecycle Management, 2.1 Registering a New Member (+10 more)

### Community 23 - "market/service.py"
Cohesion: 0.06
Nodes (34): settle(), TestEconomySettlement, MarketOrderCreate, MarketOrderResponse, MarketOrderStatus, ParcelMarketResponse, SettlementBreakdown, create_order() (+26 more)

### Community 24 - "Architecture — Central Server"
Cohesion: 0.11
Nodes (17): 1. FastAPI Gateway, 2. JWT Authentication, 3. Credential Service (Encrypted Storage), 4. Task Orchestrator, 5. Agent Manager & Skill System, 6. Per-User OpenCode Instances, 7. Monitoring & Health Checks, Central Engineering Server Architecture (+9 more)

### Community 25 - "Windows — Day1"
Cohesion: 0.30
Nodes (16): Assert-Venv(), Get-PythonLauncher(), Import-DotEnv(), Invoke-Docker(), Invoke-Health(), Invoke-Python(), Invoke-Seed(), Invoke-Serve() (+8 more)

### Community 26 - "environment"
Cohesion: 0.05
Nodes (43): context, dockerfile, mqtt-broker, IOT_GATEWAY_PORT, MQTT_BROKER, MQTT_PORT, MQTT_TOPIC_SUBSCRIPTION, MQTT_TOPIC_TELEMETRY (+35 more)

### Community 27 - "Contract Module"
Cohesion: 0.12
Nodes (16): 1. Scope and Authority, 2.1 Sensor Reading — ESP32 → P1, 2.2 Satellite Observation — Sentinel → P2, 2.3 Consent — Community → P3, 2.4 Status Result — P4 → P5, 2.5 Ledger Entry — P5 → D2, 2.6 Verification Response — GET /verify/{id}, 2. Blueprint v5 Model 3 JSON Contracts (+8 more)

### Community 29 - "Docker Compose Module"
Cohesion: 0.18
Nodes (10): services, driver, networks, excboncp-network, Kartu per orang, Kartu peran (ringkas), Metode: System Modeling, Mulai di sini (3 menit) (+2 more)

### Community 30 - "Architecture — Overview"
Cohesion: 0.13
Nodes (14): Application Layer, Blockchain Layer, Central Engineering Server, Client Layer, Component Descriptions, Data & AI Layer, Data Flow Summary, Design Principles (+6 more)

### Community 31 - "Toolchain Module"
Cohesion: 0.13
Nodes (14): 1. Verified Toolchain Inventory, 2. Package Management & Virtual Environments, 3. Code Style & Quality Configuration, 4. Rollback and Cleanup, Automatically fix supported lint issues, Check code formatting, Check for lint errors, Clean temporary Python artifacts and caches (+6 more)

### Community 32 - "test_blockchain_api.py"
Cohesion: 0.16
Nodes (10): blockchain_client(), _login(), _seed_api_database(), test_attest_missing_block_returns_404(), test_attest_rejects_identity_mismatch(), test_double_attestation_returns_conflict(), test_full_attestation_flow(), test_non_auditor_cannot_attest() (+2 more)

### Community 33 - "Tasks — Service"
Cohesion: 0.22
Nodes (6): acquire_lock(), _get_or_create_user(), test_file_locking_isolation(), test_task_cancellation(), test_task_creation_and_retrieval(), test_task_status_lifecycle()

### Community 34 - "Workflows — Ci"
Cohesion: 0.17
Nodes (12): with, cache, cache-from, cache-to, context, fetch-depth, file, name (+4 more)

### Community 35 - "database.py"
Cohesion: 0.10
Nodes (13): References, Day 3 Implementation (R7), Metadata, R1–R14: Mandatory Demo, _get_env(), _load_settings(), Settings, _compute_schema_id() (+5 more)

### Community 36 - "Contracts — Readme"
Cohesion: 0.18
Nodes (10): 0x4200000000000000000000000000000000000021, // EAS, Add a deployment script for:, Contract, Dependencies, Deployment (Day 4 milestone), EasProof.sol — ExcbonCPAttestation, ExcbonCP Smart Contracts, Install Hardhat (+2 more)

### Community 37 - "Agent Workflow Module"
Cohesion: 0.18
Nodes (10): 1. Agent Execution Lifecycle, 2. Standardized Agent Handoff Formats, 3. Directory Boundary Enforcement, 4. Escalation Procedures, Architect $\rightarrow$ Any Agent, Backend $\rightarrow$ Frontend, ExcbonCP Agent Workflow & Orchestration Protocol, IoT $\rightarrow$ Backend (+2 more)

### Community 38 - "Deployment Module"
Cohesion: 0.22
Nodes (6): 2. Configure environment, 4. Troubleshooting Guide, 3. Copy environment config, generate_fernet_key(), generate_jwt_secret(), main()

### Community 39 - "Agents Module"
Cohesion: 0.20
Nodes (9): 1. Architect, 2. Backend, 3. Frontend, 4. IoT, 5. Data/AI, 6. Blockchain, 7. Security, 8. Reviewer (+1 more)

### Community 40 - "gee_processor.py"
Cohesion: 0.24
Nodes (5): fetch_satellite_data(), _get_cache_path(), initialize_gee(), _is_placeholder_credential(), load_cached_satellite_data()

### Community 41 - "approve_parcel"
Cohesion: 0.20
Nodes (6): approve_parcel(), _collect_sensor_and_ndvi(), _evaluate_parcel_status(), _explorer_urls(), list_approvals(), _resolve_parcel_row()

### Community 42 - "Index Module"
Cohesion: 0.20
Nodes (9): Agent System, Architecture, ExcbonCP Documentation Index, Operations, Project Management, Root, Security, System Models (+1 more)

### Community 43 - "docs/deployment.md"
Cohesion: 0.15
Nodes (12): 1. Clone repository to server host, 1. Environment Topology, 1. Stop containers, 2.1 Server Host Provisioning, 2.2 Automated Deployment Steps, 2. Central Team Server Deployment, 3. Build and launch container stack, 3. Restart server (+4 more)

### Community 45 - "Requirements Traceability Module"
Cohesion: 0.22
Nodes (8): Coverage Summary, Ownership Summary, Priority Groups, R15–R19: Secondary, R20–R24: Application/Usability, R25–R29: Finalist Deployment, Requirements Traceability Matrix, Traceability Matrix

### Community 46 - "Issue Template — Bug Report"
Cohesion: 0.22
Nodes (8): Actual Behavior, Additional Context, Description, Environment, Expected Behavior, Logs / Error Output, Screenshots, Steps to Reproduce

### Community 47 - "Workflows — Ci"
Cohesion: 0.22
Nodes (8): concurrency, cancel-in-progress, group, jobs, security, name, name, runs-on

### Community 48 - "Docker Compose.Dev Module"
Cohesion: 0.25
Nodes (8): context, dockerfile, build, command, environment, ports, volumes, server

### Community 49 - "Runbook Module"
Cohesion: 0.39
Nodes (7): List available snapshots, Restore specific snapshot, error(), info(), restore.sh script, success(), warn()

### Community 50 - "Security — Access Control"
Cohesion: 0.25
Nodes (7): 1. Identity & Role Hierarchy, 2. Permissions Matrix, 3. Server-Side Enforcement Architecture, 4. Per-User AI Credential Isolation, 5. Agent Execution Directory Boundaries, ExcbonCP Access Control & Authorization, Pattern: server/auth/dependencies.py

### Community 51 - "Issue Template — Task"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, Additional Context, Agent Type, Assigned To, Dependencies, Description, Related Requirements

### Community 52 - "Workflows — Ci"
Cohesion: 0.39
Nodes (8): steps, steps, steps, if, name, run, uses, steps

### Community 53 - "Issue Template — Feature Request"
Cohesion: 0.29
Nodes (6): Acceptance Criteria, Additional Context, Alternatives Considered, Description, Implementation Notes, Requirement Reference

### Community 54 - ".Github — Pull Request Template"
Cohesion: 0.29
Nodes (6): Checklist, Description, Requirements Addressed, Screenshots / Logs, Team Review Required From, Type of Change

### Community 55 - "ledger/router.py"
Cohesion: 0.11
Nodes (10): ApprovalLogEntry, ApproveParcelRequest, ApproveParcelResponse, LedgerVerifyResponse, approve_parcel_endpoint(), get_approvals_endpoint(), retry_approve_anchoring_endpoint(), verify_ledger_block() (+2 more)

### Community 56 - "package.json"
Cohesion: 0.07
Nodes (25): author, dependencies, mqtt@^5.10.3, description, engines, node, keywords, license (+17 more)

### Community 57 - "Models — Deployment Diagram"
Cohesion: 0.33
Nodes (5): Deployment Diagram, Metadata, Network Segmentation & Port Map, Production / Staging deployment, Reproducible Startup

### Community 58 - "Models — Sequence Diagram"
Cohesion: 0.33
Nodes (5): 1. Sensor Ingestion & Deterministic Evaluation, 2. Community Consent Workflow, 3. EAS Blockchain Attestation Workflow, Metadata, Sequence Diagram

### Community 59 - "Security — Threat Model"
Cohesion: 0.33
Nodes (5): 1. Scope and System Boundaries, 2. STRIDE Threat Analysis, 3. Defense-in-Depth Architecture, 4. Verification and Compliance, ExcbonCP Threat Model

### Community 60 - "Token Efficiency Module"
Cohesion: 0.33
Nodes (5): 1. Principles of Context Efficiency, 2. Context Allocation by Agent Role, 3. Metrics & Baseline Tracking, 4. Verification & Best Practices, ExcbonCP Token & Context Efficiency Protocol

### Community 62 - "Workflows — Ci"
Cohesion: 0.33
Nodes (6): CREDENTIAL_ENCRYPTION_KEY, DATABASE_PATH, GITHUB_TOKEN, GITLEAKS_CONFIG, JWT_SECRET, env

### Community 63 - "execute_agent"
Cohesion: 0.24
Nodes (4): AgentExecutionRequest, execute_agent(), execute_agent_direct(), get_credential_for_agent()

### Community 64 - "Models — State Diagram"
Cohesion: 0.40
Nodes (4): Domain Invariants, Metadata, Precedence Hierarchy, State Diagram — Parcel Status Engine

### Community 65 - "start_subscriber"
Cohesion: 0.20
Nodes (3): create_mqtt_client(), start_subscriber(), on_message()

### Community 66 - "Team Ownership Module"
Cohesion: 0.40
Nodes (4): 1. Primary Human Ownership Areas, 2. Detailed Ownership Matrix, 3. Human Governance Invariants (Rules 9 & 10), Team Ownership & Human Accountability Matrix

### Community 67 - "Workflows — Ci"
Cohesion: 0.40
Nodes (5): on, pull_request, push, branches, branches

### Community 68 - "Models — Context Diagram"
Cohesion: 0.50
Nodes (3): Context Diagram, External Actors, System Boundary

### Community 69 - "Models — Dapp Flowchart"
Cohesion: 0.50
Nodes (3): DApp Flowchart, Metadata, Screen Inventory

### Community 70 - "Models — Data Flow Diagram"
Cohesion: 0.50
Nodes (3): Data Flow Descriptions, Data Flow Diagram (DFD), Metadata

### Community 71 - "Models — Use Case Diagram"
Cohesion: 0.50
Nodes (3): Actor Descriptions, Use Case Descriptions, Use Case Diagram

### Community 72 - "Workflows — Ci"
Cohesion: 0.50
Nodes (4): name, needs, runs-on, docker

### Community 73 - "Workflows — Ci"
Cohesion: 0.50
Nodes (4): test, name, needs, runs-on

### Community 74 - "Workflows — Ci"
Cohesion: 0.67
Nodes (3): lint, name, runs-on

### Community 84 - "steps"
Cohesion: 0.07
Nodes (32): name, needs, runs-on, steps, jobs, docker-ci, test-and-lint, verify-firmware (+24 more)

### Community 85 - "database.py"
Cohesion: 0.13
Nodes (7): Metadata, Entity-Relationship Diagram (ERD), Metadata, Relationship Notes, Storage & Integrity Principles, 2. Feature Classification Inventory, root_discovery()

### Community 90 - "backup.sh"
Cohesion: 0.27
Nodes (8): 3. Pre-Demo Security Hardening Checklist, Berkas dan dokumen non-kode, Jadwal F-5 sampai F0 (centang saat selesai), 3.2 Creating a Snapshot Backup, info(), backup.sh script, success(), warn()

### Community 91 - "handle_telemetry_message"
Cohesion: 0.27
Nodes (4): evaluate_sensor_flag(), get_config(), handle_telemetry_message(), _save_event_record()

### Community 92 - "compute_status"
Cohesion: 0.19
Nodes (11): compute_status(), explain_status(), test_consent_case_insensitivity_and_whitespace(), test_explain_status_metadata_and_sellability(), test_priority_1_consent_none_is_blocked(), test_priority_1_consent_none_overrides_dispute_and_sensor(), test_priority_2_consent_revoked_is_dispute(), test_priority_2_dispute_open_with_granted_consent() (+3 more)

### Community 93 - "docs/security/INCIDENT_RESPONSE.md"
Cohesion: 0.20
Nodes (9): 1. Incident Classification Matrix, 2. Incident Response Workflow, 3. Playbooks for Common Incidents, 4. Post-Incident Review, Docker mode, ExcbonCP Incident Response Plan, Playbook A: Leaked AI Provider API Key, Playbook B: Database Tampering or Corruption (+1 more)

### Community 95 - "UserResponse"
Cohesion: 0.12
Nodes (9): UserResponse, get_users(), me(), health_check(), query_audit_logs(), server_metrics(), server_status(), get_task_details() (+1 more)

### Community 97 - "os"
Cohesion: 0.27
Nodes (4): generate_payload(), run_publisher(), generate_payload(), main()

### Community 99 - "health-check.sh"
Cohesion: 0.40
Nodes (5): 4. Verify deployment health, 3.1 Executing Health Checks, Local mode, check(), health-check.sh script

### Community 100 - "start-server.sh"
Cohesion: 0.25
Nodes (10): Mode A: Production / Staging using Docker Compose, Mode B: Local Development with Uvicorn Hot-Reload, 2. Start the server, 3. Start the server with Docker, 4. Start in local mode with hot reload, error(), info(), start-server.sh script (+2 more)

### Community 102 - "Panduan Penggunaan & Eksekusi"
Cohesion: 0.20
Nodes (9): 1. Persiapan Virtual Environment & Dependencies, 2. Konfigurasi Environment (`.env`), 3. Kredensial Google Earth Engine, 4. Menjalankan Unit Test, 5. Menjalankan MQTT Subscriber, 6. Simulasi Pengujian ESP32 (Mock Publisher), AI & Earth Engine (GEE) Data Pipeline, Panduan Penggunaan & Eksekusi (+1 more)

### Community 104 - "create_new_task"
Cohesion: 0.12
Nodes (11): audit_auth_action(), change_role(), change_status(), login(), logout(), update_me(), get_db(), cancel_existing_task() (+3 more)

### Community 106 - "diagram.json"
Cohesion: 0.29
Nodes (6): author, connections, dependencies, editor, parts, version

### Community 108 - "dependencies.py"
Cohesion: 0.13
Nodes (6): _extract_token(), get_current_user(), require_owner(), require_role(), TokenPayload, decode_access_token()

### Community 109 - "volumes"
Cohesion: 0.40
Nodes (5): driver, volumes, excboncp-data, mosquitto_data, mosquitto_log

### Community 111 - "docs/project-status.md"
Cohesion: 0.50
Nodes (3): 1. Executive Summary, 3. Human Team Milestones, ExcbonCP Project Status & Implementation Dashboard

## Knowledge Gaps
- **389 isolated node(s):** `excboncp`, `1. Install Hardhat and EAS dependencies`, `2. Deploy the contract`, `3. Configure .env`, `4. Register and verify` (+384 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 930 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `2. Feature Classification Inventory` connect `database.py` to `database.py`, `Password Hashing & Seed Data`, `docs/project-status.md`, `Runbook Module`, `Windows — Day1`, `backup.sh`, `Docker Compose Module`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `UserResponse` (e.g. with `execute_agent()` and `execute_agent_direct()`) actually correct?**
  _`UserResponse` has 35 INFERRED edges - model-reasoned connections that need verification._
- **What connects `excboncp`, `1. Install Hardhat and EAS dependencies`, `2. Deploy the contract` to the rest of the system?**
  _389 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth/service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07402031930333818 - nodes in this community are weakly interconnected._
- **Why does `get_db()` connect `create_new_task` to `auth/service.py`, `Credential Vault Models`, `database.py`, `test_eas.py`, `create-admin.py`, `dependencies.py`, `Password Hashing & Seed Data`, `Agent Registry & Execution Models`, `fixture`, `test_schema.py`, `market/service.py`, `database.py`, `ledger/router.py`, `UserResponse`, `execute_agent`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `EasClient` (e.g. with `attest_block()` and `_eas_dependency()`) actually correct?**
  _`EasClient` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Should `tasks/service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13054187192118227 - nodes in this community are weakly interconnected._