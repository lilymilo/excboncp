# Graph Report - excboncp  (2026-11-12)

## Corpus Check
- 143 files · ~89,018 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 15 file(s) not represented in the graph (top: (none) 6, .example 2, .conf 2)

## Summary
- 1813 nodes · 3420 edges · 143 communities (100 shown, 43 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 140 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4b91bce6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_ledger.py
- test_blockchain_api.py
- tasks/router.py
- credentials/router.py
- anchor_block_to_eas
- README.md
- docs/Excboncp_Blueprint_System_Modeling_6_Hari_v5.md
- LedgerValidationError
- docs/api-reference.md
- EasClient
- approve_parcel
- blockchain/README.md
- json
- blockchain/conftest.py
- execute_agent
- tests/conftest.py
- docs/database-schema.md
- aiosqlite
- CONTRIBUTING.md
- TestClient
- _insert_http_ledger_block
- attest_block
- docs/runbook.md
- market/service.py
- docs/architecture/CENTRAL_SERVER.md
- day1.ps1
- environment
- docs/contract.md
- docker-compose.yml
- anchor_block_to_eas
- docs/toolchain.md
- test_approve.py
- docs/models/USE_CASE_DIAGRAM.md
- with
- blockchain/router.py
- contracts/README.md
- docs/agent-workflow.md
- generate-secrets.py
- handle_telemetry_message
- mqtt_subscriber.py
- public_metrics
- docs/INDEX.md
- docs/deployment.md
- TestAIPipeline
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
- docs/models/USE_CASE_DIAGRAM.md
- docs/models/STATE_DIAGRAM.md
- mqtt_subscriber.py
- docs/team-ownership.md
- on
- logging
- docs/models/DAPP_FLOWCHART.md
- _load_settings
- test_telemetry_parser.py
- docker
- test
- lint
- Development and testing dependencies
- steps
- Connection
- .simulation_mode
- CLAUDE.md
- GEMINI.md
- copilot-instructions.md
- health-check.sh
- compute_status
- docs/security/INCIDENT_RESPONSE.md
- _get_append_lock
- dependencies.py
- get_db
- os
- UserResponse
- docs/models/DATA_FLOW_DIAGRAM.md
- start-server.sh
- Panduan Penggunaan & Eksekusi
- seed.py
- diagram.json
- docs/architecture/OVERVIEW.md
- volumes
- test_security.py
- tasks/service.py
- create-admin.py
- setup.sh
- database.py
- test_auth.py
- reset_failed_attempts
- create_task
- BaseModel
- AGENTS.md
- backup.sh
- create_new_task
- list_credentials
- evaluate_sensor_flag
- 2. Feature Classification Inventory
- AttestationResult
- test_register_first_user_is_owner
- test_public_guest_registration_rejects_auditor_and_admin
- test_login_invalid_password

## God Nodes (most connected - your core abstractions)
1. `get_db()` - 62 edges
2. `UserResponse` - 51 edges
3. `EasClient` - 49 edges
4. `anchor_block_to_eas()` - 24 edges
5. `append_block()` - 24 edges
6. `audit_auth_action()` - 23 edges
7. `parse_and_analyze_telemetry()` - 22 edges
8. `canonical_json()` - 21 edges
9. `seed_demo_data()` - 20 edges
10. `handle_telemetry_message()` - 20 edges

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

## Communities (143 total, 43 thin omitted)

### Community 0 - "test_ledger.py"
Cohesion: 0.13
Nodes (15): append_block(), canonical_json(), compute_hash(), verify_block(), verify_chain(), _insert_parcel_and_auditor(), test_append_block_uses_genesis_and_contract_hash(), test_append_rejects_invalid_payload() (+7 more)

### Community 1 - "test_blockchain_api.py"
Cohesion: 0.16
Nodes (10): blockchain_client(), _login(), _seed_api_database(), test_attest_missing_block_returns_404(), test_attest_rejects_identity_mismatch(), test_double_attestation_returns_conflict(), test_full_attestation_flow(), test_non_auditor_cannot_attest() (+2 more)

### Community 2 - "tasks/router.py"
Cohesion: 0.15
Nodes (10): TaskResponse, TaskUpdate, get_task_details(), get_tasks(), update_existing_task(), cancel_task(), get_task(), list_tasks() (+2 more)

### Community 3 - "credentials/router.py"
Cohesion: 0.10
Nodes (12): CredentialCreate, CredentialResponse, CredentialUpdate, delete_own_credential(), save_credential(), update_own_credential(), create_credential(), delete_credential() (+4 more)

### Community 4 - "anchor_block_to_eas"
Cohesion: 0.08
Nodes (15): anchor_block_to_eas(), AnchoringResult, _failure(), test_anchor_block_not_found(), test_anchor_block_rejects_non_verified(), test_anchor_block_to_eas_simulation(), test_anchor_block_twice_conflicts(), test_anchor_block_with_non_auditor_role() (+7 more)

### Community 5 - "README.md"
Cohesion: 0.06
Nodes (33): 1. Clone the repository, 1. Configure your auditor wallet (Base Sepolia), 1. Create and activate a virtual environment, 1. Create .venv, install dependencies, generate .env, and prepare data/, 2. Install dependencies, 2. Run Ruff and pytest, 3. Load the simulation-only demo data (prompts for a demo password), 3. Register the EAS schema (auditor only) (+25 more)

### Community 6 - "docs/Excboncp_Blueprint_System_Modeling_6_Hari_v5.md"
Cohesion: 0.05
Nodes (43): 8A: Gerbang masuk (dari membuka alamat sampai keluar), 8B: Alur layar setelah masuk, 8C: Auditor menyetujui, hash dikunci, 8D: Verifikasi publik, 8E: Perjalanan satu orang dari masuk sampai selesai, per peran, Apa yang berubah dari localhost ke link, Aturan keputusan dan aturan ekonomi, Bahasa di layar (istilah teknis menjadi kata sehari-hari) (+35 more)

### Community 8 - "docs/api-reference.md"
Cohesion: 0.05
Nodes (37): 1. Authentication & Session Management, 2. Per-User AI Credential Vault, 3. Agent Execution & Orchestration, 4. Task Management & Workspaces, 5. System Health & Monitoring, 6. Public Ledger Verification, 7. Blockchain — EAS Attestation (Day 3, R7), DELETE /api/credentials/{credential_id} (+29 more)

### Community 10 - "approve_parcel"
Cohesion: 0.13
Nodes (10): approve_parcel(), _collect_sensor_and_ndvi(), _evaluate_parcel_status(), _explorer_urls(), get_block(), list_approvals(), ParcelApprovalError, _parse_canonical_data() (+2 more)

### Community 11 - "blockchain/README.md"
Cohesion: 0.09
Nodes (17): main(), _get_env(), 1. Install Hardhat and EAS dependencies, 2. Deploy the contract, 3. Configure .env, 4. Register and verify, Architecture, Components (+9 more)

### Community 12 - "json"
Cohesion: 0.11
Nodes (12): hash_password(), verify_password(), load_seed_data(), seed_demo_data(), test_bcrypt_long_password_truncation_safety(), test_bcrypt_password_hashing_and_verification(), test_seed_file_is_explicitly_simulated_and_has_no_passwords(), test_seed_is_idempotent() (+4 more)

### Community 13 - "blockchain/conftest.py"
Cohesion: 0.19
Nodes (6): reset_eas_client(), auditor_user(), eas_client(), member_user(), _reset_eas_singleton(), sample_ledger_blocks()

### Community 14 - "execute_agent"
Cohesion: 0.12
Nodes (10): AgentDefinition, AgentExecutionRequest, AgentType, get_agent(), list_agents(), execute_agent(), execute_agent_direct(), get_agent_details() (+2 more)

### Community 15 - "tests/conftest.py"
Cohesion: 0.18
Nodes (7): Testing Guidelines, auth_headers(), owner_headers(), _setup_env(), test_client(), test_owner(), test_user()

### Community 16 - "docs/database-schema.md"
Cohesion: 0.08
Nodes (23): 2.1 users, 2.2 credentials, 2.3 tasks, 2.4 audit_logs, 2.5 sessions, 2. Central Server Tables, 3.1 zones, 3.2 parcels (+15 more)

### Community 17 - "aiosqlite"
Cohesion: 0.19
Nodes (6): Metadata, test_foreign_keys_are_enforced(), test_mrv_tables_exist(), test_sensor_columns_follow_blueprint_v5(), test_sensor_source_must_be_esp_or_simulator(), test_users_table_supports_r23()

### Community 18 - "CONTRIBUTING.md"
Cohesion: 0.10
Nodes (20): Branch Naming, Code Review, Commit Messages, Contributing to ExcbonCP, Examples, For Authors, For Reviewers, Must Follow (+12 more)

### Community 19 - "TestClient"
Cohesion: 0.15
Nodes (6): seeded_test_entities(), test_get_current_user_profile(), test_login_with_email_or_username(), test_logout_revokes_token(), test_member_cannot_update_roles(), test_register_second_user_is_member()

### Community 20 - "_insert_http_ledger_block"
Cohesion: 0.16
Nodes (6): _insert_http_ledger_block(), ledger_client(), test_verify_endpoint_is_public_and_valid(), test_verify_endpoint_mentions_eas_lock(), test_verify_endpoint_reports_tampering(), test_verify_endpoint_returns_404_for_unknown_entry()

### Community 21 - "attest_block"
Cohesion: 0.19
Nodes (5): attest_block(), attestation_status(), list_attestations(), register_schema(), simulation_status()

### Community 22 - "docs/runbook.md"
Cohesion: 0.11
Nodes (18): 1.1.1 Loading Simulation-Only MRV Demo Data, 1.1.2 Windows Setup Helper (PowerShell), 1.1 Initial Setup, 1.2 Starting the Central Server, 1.3 Stopping the Server, 1. Clone repository, 1. Server Lifecycle Management, 2.1 Registering a New Member (+10 more)

### Community 23 - "market/service.py"
Cohesion: 0.08
Nodes (30): settle(), TestEconomySettlement, MarketOrderCreate, MarketOrderResponse, MarketOrderStatus, ParcelMarketResponse, SettlementBreakdown, ZoneReportResponse (+22 more)

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
Nodes (16): 1. Scope and Authority, 2.1 Sensor Reading — ESP32 → P1, 2.2 Satellite Observation — Sentinel → P2, 2.3 Consent — Community → P3, 2.4 Status Result — P4 → P5, 2.5 Ledger Entry — P5 → D2, 2.6 Verification Response — GET /verify/{id}, 2. Blueprint v5 Model 3 JSON Contracts (+8 more)

### Community 29 - "docker-compose.yml"
Cohesion: 0.18
Nodes (10): services, driver, networks, excboncp-network, Kartu per orang, Kartu peran (ringkas), Metode: System Modeling, Mulai di sini (3 menit) (+2 more)

### Community 30 - "anchor_block_to_eas"
Cohesion: 0.16
Nodes (6): get_attestation_status(), get_attested_blocks(), verify_auditor(), test_attestation_status_before_and_after(), test_get_attested_blocks(), test_verify_auditor_failure_wrong_role()

### Community 31 - "docs/toolchain.md"
Cohesion: 0.13
Nodes (14): 1. Verified Toolchain Inventory, 2. Package Management & Virtual Environments, 3. Code Style & Quality Configuration, 4. Rollback and Cleanup, Automatically fix supported lint issues, Check code formatting, Check for lint errors, Clean temporary Python artifacts and caches (+6 more)

### Community 32 - "test_approve.py"
Cohesion: 0.14
Nodes (11): approve_client(), _login(), _seed_approve_database(), test_approve_accepts_shared_schema_alias(), test_approve_keeps_ledger_entry_when_eas_fails(), test_approve_rejects_blocked_parcel_without_writing_ledger(), test_approve_rejects_community_and_guest_roles(), test_approve_rejects_dispute_parcel() (+3 more)

### Community 33 - "docs/models/USE_CASE_DIAGRAM.md"
Cohesion: 0.33
Nodes (4): _get_or_create_user(), test_task_cancellation(), test_task_creation_and_retrieval(), test_task_status_lifecycle()

### Community 34 - "with"
Cohesion: 0.17
Nodes (12): with, cache, cache-from, cache-to, context, fetch-depth, file, name (+4 more)

### Community 35 - "blockchain/router.py"
Cohesion: 0.15
Nodes (9): References, Day 3 Implementation (R7), Metadata, R1–R14: Mandatory Demo, _compute_schema_id(), get_eas_client(), _eas_dependency(), test_get_eas_client_singleton() (+1 more)

### Community 36 - "contracts/README.md"
Cohesion: 0.18
Nodes (10): 0x4200000000000000000000000000000000000021, // EAS, Add a deployment script for:, Contract, Dependencies, Deployment (Day 4 milestone), EasProof.sol — ExcbonCPAttestation, ExcbonCP Smart Contracts, Install Hardhat (+2 more)

### Community 37 - "docs/agent-workflow.md"
Cohesion: 0.18
Nodes (10): 1. Agent Execution Lifecycle, 2. Standardized Agent Handoff Formats, 3. Directory Boundary Enforcement, 4. Escalation Procedures, Architect $\rightarrow$ Any Agent, Backend $\rightarrow$ Frontend, ExcbonCP Agent Workflow & Orchestration Protocol, IoT $\rightarrow$ Backend (+2 more)

### Community 38 - "generate-secrets.py"
Cohesion: 0.22
Nodes (6): 2. Configure environment, 4. Troubleshooting Guide, 3. Copy environment config, generate_fernet_key(), generate_jwt_secret(), main()

### Community 39 - "handle_telemetry_message"
Cohesion: 0.18
Nodes (5): generate_google_maps_url(), format_coord_sync_log(), format_realtime_sync_log(), handle_telemetry_message(), test_format_realtime_sync_log()

### Community 40 - "mqtt_subscriber.py"
Cohesion: 0.17
Nodes (8): fetch_satellite_data(), generate_copernicus_browser_url(), _get_cache_path(), initialize_gee(), _is_placeholder_credential(), load_cached_satellite_data(), test_generate_copernicus_browser_url_amsterdam(), test_generate_copernicus_browser_url_negative_coordinates()

### Community 41 - "public_metrics"
Cohesion: 0.17
Nodes (8): UserResponse, get_users(), me(), health_check(), public_metrics(), query_audit_logs(), server_metrics(), server_status()

### Community 42 - "docs/INDEX.md"
Cohesion: 0.14
Nodes (12): Agent System, Architecture, ExcbonCP Documentation Index, Operations, Project Management, Root, Security, System Models (+4 more)

### Community 43 - "docs/deployment.md"
Cohesion: 0.14
Nodes (13): 1. Clone repository to server host, 1. Environment Topology, 1. Stop containers, 2.1 Server Host Provisioning, 2.2 Automated Deployment Steps, 2. Central Team Server Deployment, 2. Reset database and run migrations, 3. Build and launch container stack (+5 more)

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
Cohesion: 0.12
Nodes (8): ApprovalLogEntry, ApproveParcelRequest, ApproveParcelResponse, LedgerVerifyResponse, approve_parcel_endpoint(), get_approvals_endpoint(), retry_approve_anchoring_endpoint(), verify_ledger_block()

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

### Community 63 - "docs/models/USE_CASE_DIAGRAM.md"
Cohesion: 0.50
Nodes (3): Actor Descriptions, Use Case Descriptions, Use Case Diagram

### Community 64 - "docs/models/STATE_DIAGRAM.md"
Cohesion: 0.40
Nodes (4): Domain Invariants, Metadata, Precedence Hierarchy, State Diagram — Parcel Status Engine

### Community 65 - "mqtt_subscriber.py"
Cohesion: 0.16
Nodes (9): create_mqtt_client(), get_config(), main(), on_connect(), on_disconnect(), on_message(), _save_event_record(), start_subscriber() (+1 more)

### Community 66 - "docs/team-ownership.md"
Cohesion: 0.40
Nodes (4): 1. Primary Human Ownership Areas, 2. Detailed Ownership Matrix, 3. Human Governance Invariants (Rules 9 & 10), Team Ownership & Human Accountability Matrix

### Community 67 - "on"
Cohesion: 0.40
Nodes (5): on, pull_request, push, branches, branches

### Community 68 - "logging"
Cohesion: 0.06
Nodes (34): SensorReadingResponse, SensorReadingWire, SensorSummaryResponse, create_client(), on_message(), _normalize_payload(), process_message(), run_worker() (+26 more)

### Community 69 - "docs/models/DAPP_FLOWCHART.md"
Cohesion: 0.50
Nodes (3): DApp Flowchart, Metadata, Screen Inventory

### Community 71 - "test_telemetry_parser.py"
Cohesion: 0.11
Nodes (31): format_telemetry_report(), parse_and_analyze_telemetry(), process_telemetry(), validate_telemetry(), test_fire_status_critical_fire_level(), test_fire_status_critical_flame_detected(), test_fire_status_critical_high_temp(), test_fire_status_critical_wins_over_warning() (+23 more)

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

### Community 85 - "Connection"
Cohesion: 0.40
Nodes (4): Entity-Relationship Diagram (ERD), Metadata, Relationship Notes, Storage & Integrity Principles

### Community 90 - "health-check.sh"
Cohesion: 0.40
Nodes (5): 4. Verify deployment health, 3.1 Executing Health Checks, Local mode, check(), health-check.sh script

### Community 92 - "compute_status"
Cohesion: 0.18
Nodes (11): compute_status(), explain_status(), test_consent_case_insensitivity_and_whitespace(), test_explain_status_metadata_and_sellability(), test_priority_1_consent_none_is_blocked(), test_priority_1_consent_none_overrides_dispute_and_sensor(), test_priority_2_consent_revoked_is_dispute(), test_priority_2_dispute_open_with_granted_consent() (+3 more)

### Community 93 - "docs/security/INCIDENT_RESPONSE.md"
Cohesion: 0.20
Nodes (9): 1. Incident Classification Matrix, 2. Incident Response Workflow, 3. Playbooks for Common Incidents, 4. Post-Incident Review, Docker mode, ExcbonCP Incident Response Plan, Playbook A: Leaked AI Provider API Key, Playbook B: Database Tampering or Corruption (+1 more)

### Community 95 - "dependencies.py"
Cohesion: 0.13
Nodes (6): _extract_token(), get_current_user(), require_owner(), require_role(), TokenPayload, decode_access_token()

### Community 96 - "get_db"
Cohesion: 0.25
Nodes (9): audit_auth_action(), change_role(), change_status(), login(), logout(), register(), update_me(), get_db() (+1 more)

### Community 97 - "os"
Cohesion: 0.18
Nodes (9): _build_timestamp(), generate_payload(), run_publisher(), main(), on_connect(), on_message(), detect_location(), generate_payload() (+1 more)

### Community 98 - "UserResponse"
Cohesion: 0.09
Nodes (21): UserCreate, UserUpdate, authenticate_user(), check_lockout(), _clear_failed_attempts(), create_session(), create_user(), deactivate_user() (+13 more)

### Community 99 - "docs/models/DATA_FLOW_DIAGRAM.md"
Cohesion: 0.50
Nodes (3): Data Flow Descriptions, Data Flow Diagram (DFD), Metadata

### Community 100 - "start-server.sh"
Cohesion: 0.25
Nodes (10): Mode A: Production / Staging using Docker Compose, Mode B: Local Development with Uvicorn Hot-Reload, 2. Start the server, 3. Start the server with Docker, 4. Start in local mode with hot reload, error(), info(), start-server.sh script (+2 more)

### Community 102 - "Panduan Penggunaan & Eksekusi"
Cohesion: 0.20
Nodes (9): 1. Persiapan Virtual Environment & Dependencies, 2. Konfigurasi Environment (`.env`), 3. Kredensial Google Earth Engine, 4. Menjalankan Unit Test, 5. Menjalankan MQTT Subscriber, 6. Simulasi Pengujian ESP32 (Mock Publisher), AI & Earth Engine (GEE) Data Pipeline, Panduan Penggunaan & Eksekusi (+1 more)

### Community 105 - "seed.py"
Cohesion: 0.14
Nodes (8): close_db(), init_db(), lifespan(), _insert_rows(), _main(), _print_seed_accounts(), _seed_ledger_blocks(), test_db()

### Community 106 - "diagram.json"
Cohesion: 0.29
Nodes (6): author, connections, dependencies, editor, parts, version

### Community 107 - "docs/architecture/OVERVIEW.md"
Cohesion: 0.13
Nodes (14): Application Layer, Blockchain Layer, Central Engineering Server, Client Layer, Component Descriptions, Data & AI Layer, Data Flow Summary, Design Principles (+6 more)

### Community 109 - "volumes"
Cohesion: 0.40
Nodes (5): driver, volumes, excboncp-data, mosquitto_data, mosquitto_log

### Community 110 - "test_security.py"
Cohesion: 0.06
Nodes (18): decrypt_credential(), _get_or_create_user(), test_execute_agent_fails_without_credentials(), test_execute_agent_succeeds_with_credentials(), test_get_specific_agent_definition(), test_list_all_eight_agents(), _get_or_create_user(), test_create_and_list_own_credential() (+10 more)

### Community 111 - "tasks/service.py"
Cohesion: 0.18
Nodes (6): acquire_lock(), cleanup_workspace(), create_workspace(), delete_task(), _release_locks(), test_file_locking_isolation()

### Community 115 - "create-admin.py"
Cohesion: 0.23
Nodes (5): 3. Create initial Owner account (Revand), 4. Create the initial admin user, async_main(), main(), validate_password()

### Community 116 - "setup.sh"
Cohesion: 0.36
Nodes (9): Getting Started, 2. Run automated setup script, 2. Run setup (generates secrets, installs deps), check_cmd(), error(), info(), setup.sh script, success() (+1 more)

### Community 118 - "database.py"
Cohesion: 0.20
Nodes (5): 1. Engine & Configuration, get_db_context(), _migrate_schema(), _table_columns(), test_migration_adds_r23_columns_to_legacy_users_table()

### Community 119 - "test_auth.py"
Cohesion: 0.17
Nodes (6): Run specific test, Run specific test file, test_login_success(), test_owner_can_update_user_role(), test_public_guest_registration_community_with_parcel(), test_public_guest_registration_manager_and_receiver()

### Community 126 - "reset_failed_attempts"
Cohesion: 0.33
Nodes (3): reset_failed_attempts(), test_blueprint_v5_alias_routes(), test_login_rate_limiting_lockout()

### Community 128 - "create_task"
Cohesion: 0.20
Nodes (3): TaskCreate, TaskStatus, create_task()

### Community 131 - "BaseModel"
Cohesion: 0.18
Nodes (5): RoleUpdate, StatusUpdate, TokenResponse, UserLogin, create_access_token()

### Community 132 - "AGENTS.md"
Cohesion: 0.20
Nodes (9): 1. Architect, 2. Backend, 3. Frontend, 4. IoT, 5. Data/AI, 6. Blockchain, 7. Security, 8. Reviewer (+1 more)

### Community 133 - "backup.sh"
Cohesion: 0.27
Nodes (8): 3. Pre-Demo Security Hardening Checklist, Berkas dan dokumen non-kode, Jadwal F-5 sampai F0 (centang saat selesai), 3.2 Creating a Snapshot Backup, info(), backup.sh script, success(), warn()

### Community 134 - "create_new_task"
Cohesion: 0.25
Nodes (3): cancel_existing_task(), create_new_task(), delete_existing_task()

### Community 135 - "list_credentials"
Cohesion: 0.25
Nodes (3): Provider, list_credentials(), list_providers()

### Community 136 - "evaluate_sensor_flag"
Cohesion: 0.29
Nodes (6): evaluate_sensor_flag(), test_sensor_flag_fire_level_active(), test_sensor_flag_flame_detected(), test_sensor_flag_high_temp(), test_sensor_flag_normal(), test_sensor_flag_smoke_elevated()

### Community 137 - "2. Feature Classification Inventory"
Cohesion: 0.40
Nodes (4): 1. Executive Summary, 2. Feature Classification Inventory, 3. Human Team Milestones, ExcbonCP Project Status & Implementation Dashboard

## Knowledge Gaps
- **389 isolated node(s):** `excboncp`, `1. Install Hardhat and EAS dependencies`, `2. Deploy the contract`, `3. Configure .env`, `4. Register and verify` (+384 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 977 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `2. Feature Classification Inventory` connect `2. Feature Classification Inventory` to `blockchain/router.py`, `backup.sh`, `seed.py`, `restore.sh`, `database.py`, `day1.ps1`, `docker-compose.yml`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Are the 34 inferred relationships involving `UserResponse` (e.g. with `execute_agent()` and `execute_agent_direct()`) actually correct?**
  _`UserResponse` has 34 INFERRED edges - model-reasoned connections that need verification._
- **What connects `excboncp`, `1. Install Hardhat and EAS dependencies`, `2. Deploy the contract` to the rest of the system?**
  _389 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_ledger.py` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._
- **Why does `get_db()` connect `get_db` to `tasks/router.py`, `credentials/router.py`, `anchor_block_to_eas`, `create_new_task`, `list_credentials`, `approve_parcel`, `execute_agent`, `tests/conftest.py`, `TestClient`, `market/service.py`, `blockchain/router.py`, `public_metrics`, `ledger/router.py`, `logging`, `dependencies.py`, `UserResponse`, `seed.py`, `create-admin.py`, `database.py`, `test_auth.py`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `EasClient` (e.g. with `attest_block()` and `_eas_dependency()`) actually correct?**
  _`EasClient` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Should `credentials/router.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09747899159663866 - nodes in this community are weakly interconnected._