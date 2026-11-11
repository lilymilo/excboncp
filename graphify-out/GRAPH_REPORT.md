# Graph Report - excboncp  (2026-11-11)

## Corpus Check
- 141 files · ~86,816 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 6, .example 2, .toml 1)

## Summary
- 1766 nodes · 3307 edges · 131 communities (104 shown, 27 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bff50c76`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_ledger.py
- auth/router.py
- tasks/service.py
- credentials/service.py
- test_eas.py
- README.md
- docs/Excboncp_Blueprint_System_Modeling_6_Hari_v5.md
- ledger/service.py
- docs/api-reference.md
- EasClient
- async_main
- blockchain/README.md
- seed.py
- blockchain/conftest.py
- agents/router.py
- tests/conftest.py
- docs/database-schema.md
- aiosqlite
- CONTRIBUTING.md
- test_auth.py
- _insert_http_ledger_block
- attest_block
- docs/runbook.md
- market/service.py
- docs/architecture/CENTRAL_SERVER.md
- day1.ps1
- environment
- docs/contract.md
- docker-compose.yml
- docs/architecture/OVERVIEW.md
- docs/toolchain.md
- test_approve.py
- test_tasks.py
- with
- blockchain/router.py
- contracts/README.md
- docs/agent-workflow.md
- generate-secrets.py
- AGENTS.md
- mqtt_subscriber.py
- approve_parcel
- docs/INDEX.md
- docs/deployment.md
- validate_telemetry
- docs/requirements-traceability.md
- .github/ISSUE_TEMPLATE/bug_report.md
- jobs
- server
- restore.sh
- docs/security/ACCESS_CONTROL.md
- .github/ISSUE_TEMPLATE/task.md
- steps
- .github/ISSUE_TEMPLATE/feature_request.md
- .github/PULL_REQUEST_TEMPLATE.md
- ledger/router.py
- package.json
- docs/models/DEPLOYMENT_DIAGRAM.md
- docs/models/SEQUENCE_DIAGRAM.md
- docs/security/THREAT_MODEL.md
- docs/token-efficiency.md
- main.py
- env
- execute_agent
- docs/models/STATE_DIAGRAM.md
- start_subscriber
- docs/team-ownership.md
- on
- test_sensor.py
- docs/models/DAPP_FLOWCHART.md
- docs/models/DATA_FLOW_DIAGRAM.md
- test_telemetry_parser.py
- docker
- test
- lint
- Development and testing dependencies
- steps
- database.py
- create_credential
- CLAUDE.md
- GEMINI.md
- copilot-instructions.md
- backup.sh
- handle_telemetry_message
- compute_status
- docs/security/INCIDENT_RESPONSE.md
- _get_append_lock
- query_audit_logs
- hash_password
- json
- auth/service.py
- health-check.sh
- start-server.sh
- tasks/models.py
- Panduan Penggunaan & Eksekusi
- UserResponse
- get_db
- mqtt_worker.py
- diagram.json
- test_agents.py
- dependencies.py
- volumes
- test_monitoring.py
- 2. Feature Classification Inventory
- create-admin.py
- setup.sh
- credentials/router.py
- test_credentials.py
- sys
- logging
- credentials/models.py
- update_own_credential
- .simulation_mode
- Connection
- demo_smoke_pipeline.py
- reset_failed_attempts
- create_client

## God Nodes (most connected - your core abstractions)
1. `get_db()` - 60 edges
2. `UserResponse` - 51 edges
3. `EasClient` - 49 edges
4. `append_block()` - 24 edges
5. `anchor_block_to_eas()` - 24 edges
6. `audit_auth_action()` - 23 edges
7. `canonical_json()` - 21 edges
8. `seed_demo_data()` - 20 edges
9. `validate_telemetry()` - 19 edges
10. `parse_and_analyze_telemetry()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `attest_block()` --uses--> `UserResponse`  [INFERRED]
  src/blockchain/router.py → server/auth/models.py
- `attestation_status()` --uses--> `UserResponse`  [INFERRED]
  src/blockchain/router.py → server/auth/models.py
- `list_attestations()` --uses--> `UserResponse`  [INFERRED]
  src/blockchain/router.py → server/auth/models.py
- `register_schema()` --uses--> `UserResponse`  [INFERRED]
  src/blockchain/router.py → server/auth/models.py
- `test_append_rejects_invalid_payload()` --uses--> `LedgerValidationError`  [INFERRED]
  tests/test_ledger.py → server/ledger/service.py

## Import Cycles
- None detected.

## Communities (131 total, 27 thin omitted)

### Community 0 - "test_ledger.py"
Cohesion: 0.14
Nodes (13): append_block(), compute_hash(), verify_block(), _insert_parcel_and_auditor(), test_append_block_uses_genesis_and_contract_hash(), test_append_rejects_invalid_payload(), test_canonical_json_is_order_independent(), test_second_block_links_to_the_first() (+5 more)

### Community 1 - "auth/router.py"
Cohesion: 0.15
Nodes (13): audit_auth_action(), UserUpdate, change_role(), change_status(), logout(), register(), update_me(), deactivate_user() (+5 more)

### Community 2 - "tasks/service.py"
Cohesion: 0.13
Nodes (12): TaskResponse, TaskStatus, cancel_task(), cleanup_workspace(), create_task(), create_workspace(), delete_task(), get_task() (+4 more)

### Community 3 - "credentials/service.py"
Cohesion: 0.22
Nodes (5): CredentialResponse, delete_credential(), get_user_credentials(), _row_to_response(), update_credential()

### Community 4 - "test_eas.py"
Cohesion: 0.08
Nodes (19): anchor_block_to_eas(), AnchoringResult, _failure(), verify_auditor(), test_anchor_block_not_found(), test_anchor_block_rejects_non_verified(), test_anchor_block_to_eas_simulation(), test_anchor_block_twice_conflicts() (+11 more)

### Community 5 - "README.md"
Cohesion: 0.06
Nodes (33): 1. Clone the repository, 1. Configure your auditor wallet (Base Sepolia), 1. Create and activate a virtual environment, 1. Create .venv, install dependencies, generate .env, and prepare data/, 2. Install dependencies, 2. Run Ruff and pytest, 3. Load the simulation-only demo data (prompts for a demo password), 3. Register the EAS schema (auditor only) (+25 more)

### Community 6 - "docs/Excboncp_Blueprint_System_Modeling_6_Hari_v5.md"
Cohesion: 0.05
Nodes (43): 8A: Gerbang masuk (dari membuka alamat sampai keluar), 8B: Alur layar setelah masuk, 8C: Auditor menyetujui, hash dikunci, 8D: Verifikasi publik, 8E: Perjalanan satu orang dari masuk sampai selesai, per peran, Apa yang berubah dari localhost ke link, Aturan keputusan dan aturan ekonomi, Bahasa di layar (istilah teknis menjadi kata sehari-hari) (+35 more)

### Community 7 - "ledger/service.py"
Cohesion: 0.20
Nodes (6): canonical_json(), get_block(), LedgerValidationError, _parse_canonical_data(), _validate_payload(), verify_chain()

### Community 8 - "docs/api-reference.md"
Cohesion: 0.05
Nodes (37): 1. Authentication & Session Management, 2. Per-User AI Credential Vault, 3. Agent Execution & Orchestration, 4. Task Management & Workspaces, 5. System Health & Monitoring, 6. Public Ledger Verification, 7. Blockchain — EAS Attestation (Day 3, R7), DELETE /api/credentials/{credential_id} (+29 more)

### Community 9 - "EasClient"
Cohesion: 0.12
Nodes (3): EasClient, EasClientError, test_attest_simulation()

### Community 10 - "async_main"
Cohesion: 0.15
Nodes (7): async_main(), RoleUpdate, StatusUpdate, UserCreate, UserLogin, create_user(), _user_count()

### Community 11 - "blockchain/README.md"
Cohesion: 0.13
Nodes (14): 1. Install Hardhat and EAS dependencies, 2. Deploy the contract, 3. Configure .env, 4. Register and verify, Architecture, Components, Contract reference, Deployment to Base Sepolia (Day 4) (+6 more)

### Community 12 - "seed.py"
Cohesion: 0.11
Nodes (12): Metadata, _insert_rows(), load_seed_data(), _main(), _print_seed_accounts(), seed_demo_data(), _seed_ledger_blocks(), test_seed_file_is_explicitly_simulated_and_has_no_passwords() (+4 more)

### Community 13 - "blockchain/conftest.py"
Cohesion: 0.16
Nodes (7): reset_eas_client(), auditor_user(), eas_client(), member_user(), _reset_eas_singleton(), sample_ledger_blocks(), test_get_eas_client_singleton()

### Community 14 - "agents/router.py"
Cohesion: 0.20
Nodes (6): AgentDefinition, AgentType, get_agent(), list_agents(), get_agent_details(), get_agents()

### Community 15 - "tests/conftest.py"
Cohesion: 0.18
Nodes (7): auth_headers(), owner_headers(), _setup_env(), test_client(), test_db(), test_owner(), test_user()

### Community 16 - "docs/database-schema.md"
Cohesion: 0.08
Nodes (24): 1. Engine & Configuration, 2.1 users, 2.2 credentials, 2.3 tasks, 2.4 audit_logs, 2.5 sessions, 2. Central Server Tables, 3.1 zones (+16 more)

### Community 17 - "aiosqlite"
Cohesion: 0.22
Nodes (5): _migrate_schema(), _table_columns(), test_migration_adds_r23_columns_to_legacy_users_table(), test_sensor_columns_follow_blueprint_v5(), test_users_table_supports_r23()

### Community 18 - "CONTRIBUTING.md"
Cohesion: 0.09
Nodes (21): Branch Naming, Code Review, Commit Messages, Contributing to ExcbonCP, Examples, For Authors, For Reviewers, Must Follow (+13 more)

### Community 19 - "test_auth.py"
Cohesion: 0.09
Nodes (15): Run specific test, Run specific test file, seeded_test_entities(), test_get_current_user_profile(), test_login_invalid_password(), test_login_success(), test_login_with_email_or_username(), test_logout_revokes_token() (+7 more)

### Community 20 - "_insert_http_ledger_block"
Cohesion: 0.16
Nodes (6): _insert_http_ledger_block(), ledger_client(), test_verify_endpoint_is_public_and_valid(), test_verify_endpoint_mentions_eas_lock(), test_verify_endpoint_reports_tampering(), test_verify_endpoint_returns_404_for_unknown_entry()

### Community 21 - "attest_block"
Cohesion: 0.13
Nodes (7): attest_block(), attestation_status(), list_attestations(), register_schema(), simulation_status(), get_attestation_status(), get_attested_blocks()

### Community 22 - "docs/runbook.md"
Cohesion: 0.11
Nodes (18): 1.1.1 Loading Simulation-Only MRV Demo Data, 1.1.2 Windows Setup Helper (PowerShell), 1.1 Initial Setup, 1.2 Starting the Central Server, 1.3 Stopping the Server, 1. Clone repository, 1. Server Lifecycle Management, 2.1 Registering a New Member (+10 more)

### Community 23 - "market/service.py"
Cohesion: 0.09
Nodes (25): settle(), TestEconomySettlement, MarketOrderCreate, MarketOrderResponse, MarketOrderStatus, ParcelMarketResponse, SettlementBreakdown, create_order() (+17 more)

### Community 24 - "docs/architecture/CENTRAL_SERVER.md"
Cohesion: 0.11
Nodes (17): 1. FastAPI Gateway, 2. JWT Authentication, 3. Credential Service (Encrypted Storage), 4. Task Orchestrator, 5. Agent Manager & Skill System, 6. Per-User OpenCode Instances, 7. Monitoring & Health Checks, Central Engineering Server Architecture (+9 more)

### Community 25 - "day1.ps1"
Cohesion: 0.30
Nodes (16): Assert-Venv(), Get-PythonLauncher(), Import-DotEnv(), Invoke-Docker(), Invoke-Health(), Invoke-Python(), Invoke-Seed(), Invoke-Serve() (+8 more)

### Community 26 - "environment"
Cohesion: 0.05
Nodes (43): context, dockerfile, mqtt-broker, IOT_GATEWAY_PORT, MQTT_BROKER, MQTT_PORT, MQTT_TOPIC_SUBSCRIPTION, MQTT_TOPIC_TELEMETRY (+35 more)

### Community 27 - "docs/contract.md"
Cohesion: 0.12
Nodes (15): 1. Scope and Authority, 2.1 Sensor Reading — ESP32 → P1, 2.2 Satellite Observation — Sentinel → P2, 2.3 Consent — Community → P3, 2.4 Status Result — P4 → P5, 2.5 Ledger Entry — P5 → D2, 2.6 Verification Response — GET /verify/{id}, 2. Blueprint v5 Model 3 JSON Contracts (+7 more)

### Community 29 - "docker-compose.yml"
Cohesion: 0.18
Nodes (10): services, driver, networks, excboncp-network, Kartu per orang, Kartu peran (ringkas), Metode: System Modeling, Mulai di sini (3 menit) (+2 more)

### Community 30 - "docs/architecture/OVERVIEW.md"
Cohesion: 0.13
Nodes (14): Application Layer, Blockchain Layer, Central Engineering Server, Client Layer, Component Descriptions, Data & AI Layer, Data Flow Summary, Design Principles (+6 more)

### Community 31 - "docs/toolchain.md"
Cohesion: 0.13
Nodes (14): 1. Verified Toolchain Inventory, 2. Package Management & Virtual Environments, 3. Code Style & Quality Configuration, 4. Rollback and Cleanup, Automatically fix supported lint issues, Check code formatting, Check for lint errors, Clean temporary Python artifacts and caches (+6 more)

### Community 32 - "test_approve.py"
Cohesion: 0.07
Nodes (21): blockchain_client(), _login(), _seed_api_database(), test_attest_missing_block_returns_404(), test_attest_rejects_identity_mismatch(), test_double_attestation_returns_conflict(), test_full_attestation_flow(), test_non_auditor_cannot_attest() (+13 more)

### Community 33 - "test_tasks.py"
Cohesion: 0.22
Nodes (6): acquire_lock(), _get_or_create_user(), test_file_locking_isolation(), test_task_cancellation(), test_task_creation_and_retrieval(), test_task_status_lifecycle()

### Community 34 - "with"
Cohesion: 0.17
Nodes (12): with, cache, cache-from, cache-to, context, fetch-depth, file, name (+4 more)

### Community 35 - "blockchain/router.py"
Cohesion: 0.13
Nodes (10): References, Day 3 Implementation (R7), Metadata, R1–R14: Mandatory Demo, _load_settings(), Settings, AttestationResult, _compute_schema_id() (+2 more)

### Community 36 - "contracts/README.md"
Cohesion: 0.18
Nodes (10): 0x4200000000000000000000000000000000000021, // EAS, Add a deployment script for:, Contract, Dependencies, Deployment (Day 4 milestone), EasProof.sol — ExcbonCPAttestation, ExcbonCP Smart Contracts, Install Hardhat (+2 more)

### Community 37 - "docs/agent-workflow.md"
Cohesion: 0.18
Nodes (10): 1. Agent Execution Lifecycle, 2. Standardized Agent Handoff Formats, 3. Directory Boundary Enforcement, 4. Escalation Procedures, Architect $\rightarrow$ Any Agent, Backend $\rightarrow$ Frontend, ExcbonCP Agent Workflow & Orchestration Protocol, IoT $\rightarrow$ Backend (+2 more)

### Community 38 - "generate-secrets.py"
Cohesion: 0.22
Nodes (6): 2. Configure environment, 4. Troubleshooting Guide, 3. Copy environment config, generate_fernet_key(), generate_jwt_secret(), main()

### Community 39 - "AGENTS.md"
Cohesion: 0.20
Nodes (9): 1. Architect, 2. Backend, 3. Frontend, 4. IoT, 5. Data/AI, 6. Blockchain, 7. Security, 8. Reviewer (+1 more)

### Community 40 - "mqtt_subscriber.py"
Cohesion: 0.17
Nodes (6): fetch_satellite_data(), _get_cache_path(), initialize_gee(), _is_placeholder_credential(), load_cached_satellite_data(), get_config()

### Community 41 - "approve_parcel"
Cohesion: 0.20
Nodes (6): approve_parcel(), _collect_sensor_and_ndvi(), _evaluate_parcel_status(), _explorer_urls(), list_approvals(), _resolve_parcel_row()

### Community 42 - "docs/INDEX.md"
Cohesion: 0.11
Nodes (15): Agent System, Architecture, ExcbonCP Documentation Index, Operations, Project Management, Root, Security, System Models (+7 more)

### Community 43 - "docs/deployment.md"
Cohesion: 0.14
Nodes (13): 1. Clone repository to server host, 1. Environment Topology, 1. Stop containers, 2.1 Server Host Provisioning, 2.2 Automated Deployment Steps, 2. Central Team Server Deployment, 2. Reset database and run migrations, 3. Build and launch container stack (+5 more)

### Community 44 - "validate_telemetry"
Cohesion: 0.12
Nodes (9): validate_telemetry(), TestAIPipeline, test_validate_corrupt_json(), test_validate_device_id_fallback(), test_validate_flame_int_alias(), test_validate_legacy_payload(), test_validate_missing_soil(), test_validate_missing_temperature() (+1 more)

### Community 45 - "docs/requirements-traceability.md"
Cohesion: 0.22
Nodes (8): Coverage Summary, Ownership Summary, Priority Groups, R15–R19: Secondary, R20–R24: Application/Usability, R25–R29: Finalist Deployment, Requirements Traceability Matrix, Traceability Matrix

### Community 46 - ".github/ISSUE_TEMPLATE/bug_report.md"
Cohesion: 0.22
Nodes (8): Actual Behavior, Additional Context, Description, Environment, Expected Behavior, Logs / Error Output, Screenshots, Steps to Reproduce

### Community 47 - "jobs"
Cohesion: 0.22
Nodes (8): concurrency, cancel-in-progress, group, jobs, security, name, name, runs-on

### Community 48 - "server"
Cohesion: 0.25
Nodes (8): context, dockerfile, build, command, environment, ports, volumes, server

### Community 49 - "restore.sh"
Cohesion: 0.39
Nodes (7): List available snapshots, Restore specific snapshot, error(), info(), restore.sh script, success(), warn()

### Community 50 - "docs/security/ACCESS_CONTROL.md"
Cohesion: 0.25
Nodes (7): 1. Identity & Role Hierarchy, 2. Permissions Matrix, 3. Server-Side Enforcement Architecture, 4. Per-User AI Credential Isolation, 5. Agent Execution Directory Boundaries, ExcbonCP Access Control & Authorization, Pattern: server/auth/dependencies.py

### Community 51 - ".github/ISSUE_TEMPLATE/task.md"
Cohesion: 0.25
Nodes (7): Acceptance Criteria, Additional Context, Agent Type, Assigned To, Dependencies, Description, Related Requirements

### Community 52 - "steps"
Cohesion: 0.39
Nodes (8): steps, steps, steps, if, name, run, uses, steps

### Community 53 - ".github/ISSUE_TEMPLATE/feature_request.md"
Cohesion: 0.29
Nodes (6): Acceptance Criteria, Additional Context, Alternatives Considered, Description, Implementation Notes, Requirement Reference

### Community 54 - ".github/PULL_REQUEST_TEMPLATE.md"
Cohesion: 0.29
Nodes (6): Checklist, Description, Requirements Addressed, Screenshots / Logs, Team Review Required From, Type of Change

### Community 55 - "ledger/router.py"
Cohesion: 0.11
Nodes (10): ApprovalLogEntry, ApproveParcelRequest, ApproveParcelResponse, LedgerVerifyResponse, approve_parcel_endpoint(), get_approvals_endpoint(), retry_approve_anchoring_endpoint(), verify_ledger_block() (+2 more)

### Community 56 - "package.json"
Cohesion: 0.07
Nodes (25): author, dependencies, mqtt@^5.10.3, description, engines, node, keywords, license (+17 more)

### Community 57 - "docs/models/DEPLOYMENT_DIAGRAM.md"
Cohesion: 0.33
Nodes (5): Deployment Diagram, Metadata, Network Segmentation & Port Map, Production / Staging deployment, Reproducible Startup

### Community 58 - "docs/models/SEQUENCE_DIAGRAM.md"
Cohesion: 0.33
Nodes (5): 1. Sensor Ingestion & Deterministic Evaluation, 2. Community Consent Workflow, 3. EAS Blockchain Attestation Workflow, Metadata, Sequence Diagram

### Community 59 - "docs/security/THREAT_MODEL.md"
Cohesion: 0.33
Nodes (5): 1. Scope and System Boundaries, 2. STRIDE Threat Analysis, 3. Defense-in-Depth Architecture, 4. Verification and Compliance, ExcbonCP Threat Model

### Community 60 - "docs/token-efficiency.md"
Cohesion: 0.33
Nodes (5): 1. Principles of Context Efficiency, 2. Context Allocation by Agent Role, 3. Metrics & Baseline Tracking, 4. Verification & Best Practices, ExcbonCP Token & Context Efficiency Protocol

### Community 62 - "env"
Cohesion: 0.33
Nodes (6): CREDENTIAL_ENCRYPTION_KEY, DATABASE_PATH, GITHUB_TOKEN, GITLEAKS_CONFIG, JWT_SECRET, env

### Community 63 - "execute_agent"
Cohesion: 0.24
Nodes (4): AgentExecutionRequest, execute_agent(), execute_agent_direct(), get_credential_for_agent()

### Community 64 - "docs/models/STATE_DIAGRAM.md"
Cohesion: 0.40
Nodes (4): Domain Invariants, Metadata, Precedence Hierarchy, State Diagram — Parcel Status Engine

### Community 65 - "start_subscriber"
Cohesion: 0.20
Nodes (3): create_mqtt_client(), start_subscriber(), on_message()

### Community 66 - "docs/team-ownership.md"
Cohesion: 0.40
Nodes (4): 1. Primary Human Ownership Areas, 2. Detailed Ownership Matrix, 3. Human Governance Invariants (Rules 9 & 10), Team Ownership & Human Accountability Matrix

### Community 67 - "on"
Cohesion: 0.40
Nodes (5): on, pull_request, push, branches, branches

### Community 68 - "test_sensor.py"
Cohesion: 0.09
Nodes (30): SensorReadingResponse, SensorReadingWire, SensorSummaryResponse, process_message(), get_sensor_readings(), get_summary(), ingest_sensor_reading(), evaluate_fire_level() (+22 more)

### Community 69 - "docs/models/DAPP_FLOWCHART.md"
Cohesion: 0.50
Nodes (3): DApp Flowchart, Metadata, Screen Inventory

### Community 70 - "docs/models/DATA_FLOW_DIAGRAM.md"
Cohesion: 0.50
Nodes (3): Data Flow Descriptions, Data Flow Diagram (DFD), Metadata

### Community 71 - "test_telemetry_parser.py"
Cohesion: 0.16
Nodes (20): evaluate_sensor_flag(), parse_and_analyze_telemetry(), test_fire_status_critical_fire_level(), test_fire_status_critical_flame_detected(), test_fire_status_critical_high_temp(), test_fire_status_critical_wins_over_warning(), test_fire_status_normal(), test_fire_status_warning_high_temp() (+12 more)

### Community 72 - "docker"
Cohesion: 0.50
Nodes (4): name, needs, runs-on, docker

### Community 73 - "test"
Cohesion: 0.50
Nodes (4): test, name, needs, runs-on

### Community 74 - "lint"
Cohesion: 0.67
Nodes (3): lint, name, runs-on

### Community 84 - "steps"
Cohesion: 0.07
Nodes (32): name, needs, runs-on, steps, jobs, docker-ci, test-and-lint, verify-firmware (+24 more)

### Community 85 - "database.py"
Cohesion: 0.20
Nodes (6): 3. Blueprint v5 Model 6 Persistence Contract, Entity-Relationship Diagram (ERD), Metadata, Relationship Notes, Storage & Integrity Principles, get_db_context()

### Community 86 - "create_credential"
Cohesion: 0.25
Nodes (4): create_credential(), decrypt_credential(), encrypt_credential(), test_fernet_encryption_roundtrip()

### Community 90 - "backup.sh"
Cohesion: 0.27
Nodes (8): 3. Pre-Demo Security Hardening Checklist, Berkas dan dokumen non-kode, Jadwal F-5 sampai F0 (centang saat selesai), 3.2 Creating a Snapshot Backup, info(), backup.sh script, success(), warn()

### Community 91 - "handle_telemetry_message"
Cohesion: 0.32
Nodes (3): format_telemetry_report(), handle_telemetry_message(), _save_event_record()

### Community 92 - "compute_status"
Cohesion: 0.19
Nodes (11): compute_status(), explain_status(), test_consent_case_insensitivity_and_whitespace(), test_explain_status_metadata_and_sellability(), test_priority_1_consent_none_is_blocked(), test_priority_1_consent_none_overrides_dispute_and_sensor(), test_priority_2_consent_revoked_is_dispute(), test_priority_2_dispute_open_with_granted_consent() (+3 more)

### Community 93 - "docs/security/INCIDENT_RESPONSE.md"
Cohesion: 0.20
Nodes (9): 1. Incident Classification Matrix, 2. Incident Response Workflow, 3. Playbooks for Common Incidents, 4. Post-Incident Review, Docker mode, ExcbonCP Incident Response Plan, Playbook A: Leaked AI Provider API Key, Playbook B: Database Tampering or Corruption (+1 more)

### Community 95 - "query_audit_logs"
Cohesion: 0.27
Nodes (4): health_check(), query_audit_logs(), server_metrics(), server_status()

### Community 96 - "hash_password"
Cohesion: 0.17
Nodes (6): hash_password(), verify_password(), test_bcrypt_long_password_truncation_safety(), test_bcrypt_password_hashing_and_verification(), test_root_discovery_endpoint(), test_seeded_account_can_authenticate()

### Community 97 - "json"
Cohesion: 0.19
Nodes (7): _build_timestamp(), generate_payload(), run_publisher(), detect_location(), generate_payload(), main(), test_validate_bytes_input()

### Community 98 - "auth/service.py"
Cohesion: 0.12
Nodes (12): TokenResponse, login(), authenticate_user(), check_lockout(), _clear_failed_attempts(), create_access_token(), create_session(), decode_access_token() (+4 more)

### Community 99 - "health-check.sh"
Cohesion: 0.40
Nodes (5): 4. Verify deployment health, 3.1 Executing Health Checks, Local mode, check(), health-check.sh script

### Community 100 - "start-server.sh"
Cohesion: 0.25
Nodes (10): Mode A: Production / Staging using Docker Compose, Mode B: Local Development with Uvicorn Hot-Reload, 2. Start the server, 3. Start the server with Docker, 4. Start in local mode with hot reload, error(), info(), start-server.sh script (+2 more)

### Community 102 - "Panduan Penggunaan & Eksekusi"
Cohesion: 0.20
Nodes (9): 1. Persiapan Virtual Environment & Dependencies, 2. Konfigurasi Environment (`.env`), 3. Kredensial Google Earth Engine, 4. Menjalankan Unit Test, 5. Menjalankan MQTT Subscriber, 6. Simulasi Pengujian ESP32 (Mock Publisher), AI & Earth Engine (GEE) Data Pipeline, Panduan Penggunaan & Eksekusi (+1 more)

### Community 103 - "UserResponse"
Cohesion: 0.17
Nodes (8): UserResponse, get_users(), me(), get_user_by_username(), list_users(), _row_to_user(), get_task_details(), get_tasks()

### Community 104 - "get_db"
Cohesion: 0.15
Nodes (6): save_credential(), get_db(), cancel_existing_task(), create_new_task(), delete_existing_task(), update_existing_task()

### Community 105 - "mqtt_worker.py"
Cohesion: 0.21
Nodes (5): close_db(), init_db(), lifespan(), _normalize_payload(), run_worker()

### Community 106 - "diagram.json"
Cohesion: 0.29
Nodes (6): author, connections, dependencies, editor, parts, version

### Community 107 - "test_agents.py"
Cohesion: 0.29
Nodes (5): _get_or_create_user(), test_execute_agent_fails_without_credentials(), test_execute_agent_succeeds_with_credentials(), test_get_specific_agent_definition(), test_list_all_eight_agents()

### Community 108 - "dependencies.py"
Cohesion: 0.15
Nodes (5): _extract_token(), get_current_user(), require_owner(), require_role(), TokenPayload

### Community 109 - "volumes"
Cohesion: 0.40
Nodes (5): driver, volumes, excboncp-data, mosquitto_data, mosquitto_log

### Community 110 - "test_monitoring.py"
Cohesion: 0.27
Nodes (5): _get_or_create_user(), test_audit_logs_role_enforcement(), test_health_check_unauthenticated(), test_server_status_authenticated(), test_system_metrics_aggregation()

### Community 111 - "2. Feature Classification Inventory"
Cohesion: 0.40
Nodes (4): 1. Executive Summary, 2. Feature Classification Inventory, 3. Human Team Milestones, ExcbonCP Project Status & Implementation Dashboard

### Community 115 - "create-admin.py"
Cohesion: 0.24
Nodes (4): 3. Create initial Owner account (Revand), 4. Create the initial admin user, main(), validate_password()

### Community 116 - "setup.sh"
Cohesion: 0.36
Nodes (9): Getting Started, 2. Run automated setup script, 2. Run setup (generates secrets, installs deps), check_cmd(), error(), info(), setup.sh script, success() (+1 more)

### Community 117 - "credentials/router.py"
Cohesion: 0.24
Nodes (3): Provider, list_credentials(), list_providers()

### Community 118 - "test_credentials.py"
Cohesion: 0.31
Nodes (4): _get_or_create_user(), test_create_and_list_own_credential(), test_credential_user_isolation(), test_list_supported_providers()

### Community 119 - "sys"
Cohesion: 0.29
Nodes (3): main(), _get_env(), See also

### Community 124 - "Connection"
Cohesion: 0.29
Nodes (3): test_foreign_keys_are_enforced(), test_mrv_tables_exist(), test_sensor_source_must_be_esp_or_simulator()

### Community 125 - "demo_smoke_pipeline.py"
Cohesion: 0.53
Nodes (3): main(), on_connect(), on_message()

### Community 126 - "reset_failed_attempts"
Cohesion: 0.33
Nodes (3): reset_failed_attempts(), test_blueprint_v5_alias_routes(), test_login_rate_limiting_lockout()

## Knowledge Gaps
- **389 isolated node(s):** `excboncp`, `1. Install Hardhat and EAS dependencies`, `2. Deploy the contract`, `3. Configure .env`, `4. Register and verify` (+384 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 955 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `2. Feature Classification Inventory` connect `2. Feature Classification Inventory` to `blockchain/router.py`, `seed.py`, `restore.sh`, `database.py`, `day1.ps1`, `backup.sh`, `docker-compose.yml`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Are the 37 inferred relationships involving `UserResponse` (e.g. with `execute_agent()` and `execute_agent_direct()`) actually correct?**
  _`UserResponse` has 37 INFERRED edges - model-reasoned connections that need verification._
- **What connects `excboncp`, `1. Install Hardhat and EAS dependencies`, `2. Deploy the contract` to the rest of the system?**
  _389 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_ledger.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14022988505747128 - nodes in this community are weakly interconnected._
- **Why does `get_db()` connect `get_db` to `auth/router.py`, `test_eas.py`, `async_main`, `seed.py`, `agents/router.py`, `tests/conftest.py`, `aiosqlite`, `test_auth.py`, `market/service.py`, `blockchain/router.py`, `ledger/router.py`, `execute_agent`, `test_sensor.py`, `database.py`, `query_audit_logs`, `auth/service.py`, `UserResponse`, `mqtt_worker.py`, `dependencies.py`, `create-admin.py`, `credentials/router.py`, `update_own_credential`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `EasClient` (e.g. with `attest_block()` and `_eas_dependency()`) actually correct?**
  _`EasClient` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Should `tasks/service.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13054187192118227 - nodes in this community are weakly interconnected._