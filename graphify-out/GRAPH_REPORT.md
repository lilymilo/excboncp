# Graph Report - excboncp  (2026-11-10)

## Corpus Check
- 99 files · ~68,832 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 4, .example 1, .toml 1)

## Summary
- 1338 nodes · 2351 edges · 84 communities (71 shown, 13 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 109 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SHA-256 Hash-Chain Ledger
- Auth & User Models
- Task Management & Lifecycle
- Credential Vault Models
- Blockchain EAS Anchor Service
- Deployment & Runbook Guides
- Blueprint System Modeling v5
- Credential Encryption & Agent Tests
- REST API Reference
- EAS Attestation Client
- FastAPI Auth Dependencies
- Admin Bootstrap & CLI
- Password Hashing & Seed Data
- Server Configuration & Settings
- Agent Registry & Execution Models
- Database Schema & Verification Tests
- SQLite Schema Specification
- Database Connection & ERD
- Contribution Guidelines
- Authentication & RBAC Test Suite
- Blockchain API Integration Tests
- Blockchain Attestation Router
- MRV Simulation Runbook
- Conftest Module
- Architecture — Central Server
- Windows — Day1
- Docker Compose Module
- Contract Module
- Docker Compose Module
- Architecture — Overview
- Toolchain Module
- Deployment Module
- Tasks — Service
- Workflows — Ci
- Database Module
- Contracts — Readme
- Agent Workflow Module
- Deployment Module
- Agents Module
- Contributing Module
- Deployment Module
- Index Module
- Security — Incident Response
- Auth — Service
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
- Blockchain — Eas
- Deployment Module
- Models — Deployment Diagram
- Models — Sequence Diagram
- Security — Threat Model
- Token Efficiency Module
- Main Module
- Workflows — Ci
- Models — State Diagram
- Project Status Module
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

## God Nodes (most connected - your core abstractions)
1. `UserResponse` - 48 edges
2. `EasClient` - 47 edges
3. `get_db()` - 44 edges
4. `audit_auth_action()` - 23 edges
5. `append_block()` - 23 edges
6. `anchor_block_to_eas()` - 21 edges
7. `canonical_json()` - 19 edges
8. `verify_block()` - 19 edges
9. `get_current_user()` - 17 edges
10. `seed_demo_data()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `attest_block()` --uses--> `UserResponse`  [INFERRED]
  src/blockchain/router.py → server/auth/models.py
- `attestation_status()` --uses--> `UserResponse`  [INFERRED]
  src/blockchain/router.py → server/auth/models.py
- `list_attestations()` --uses--> `UserResponse`  [INFERRED]
  src/blockchain/router.py → server/auth/models.py
- `register_schema()` --uses--> `UserResponse`  [INFERRED]
  src/blockchain/router.py → server/auth/models.py
- `eas_client()` --uses--> `EasClient`  [INFERRED]
  tests/blockchain/conftest.py → src/blockchain/eas.py

## Import Cycles
- None detected.

## Communities (84 total, 13 thin omitted)

### Community 0 - "SHA-256 Hash-Chain Ledger"
Cohesion: 0.05
Nodes (28): LedgerVerifyResponse, verify_ledger_block(), append_block(), canonical_json(), compute_hash(), _get_append_lock(), get_block(), LedgerValidationError (+20 more)

### Community 1 - "Auth & User Models"
Cohesion: 0.06
Nodes (30): RoleUpdate, StatusUpdate, TokenResponse, UserCreate, UserLogin, UserResponse, UserUpdate, change_role() (+22 more)

### Community 2 - "Task Management & Lifecycle"
Cohesion: 0.08
Nodes (20): TaskCreate, TaskResponse, TaskStatus, TaskUpdate, cancel_existing_task(), create_new_task(), delete_existing_task(), get_task_details() (+12 more)

### Community 3 - "Credential Vault Models"
Cohesion: 0.07
Nodes (16): CredentialCreate, CredentialResponse, CredentialUpdate, Provider, delete_own_credential(), list_credentials(), list_providers(), save_credential() (+8 more)

### Community 4 - "Blockchain EAS Anchor Service"
Cohesion: 0.08
Nodes (21): Metadata, get_eas_client(), anchor_block_to_eas(), AnchoringResult, _failure(), get_attestation_status(), get_attested_blocks(), verify_auditor() (+13 more)

### Community 5 - "Deployment & Runbook Guides"
Cohesion: 0.05
Nodes (43): Mode A: Production / Staging using Docker Compose, Mode B: Local Development with Uvicorn Hot-Reload, 1. Clone the repository, 1. Configure your auditor wallet (Base Sepolia), 1. Create and activate a virtual environment, 1. Create .venv, install dependencies, generate .env, and prepare data/, 2. Install dependencies, 2. Run Ruff and pytest (+35 more)

### Community 6 - "Blueprint System Modeling v5"
Cohesion: 0.05
Nodes (43): 8A: Gerbang masuk (dari membuka alamat sampai keluar), 8B: Alur layar setelah masuk, 8C: Auditor menyetujui, hash dikunci, 8D: Verifikasi publik, 8E: Perjalanan satu orang dari masuk sampai selesai, per peran, Apa yang berubah dari localhost ke link, Aturan keputusan dan aturan ekonomi, Bahasa di layar (istilah teknis menjadi kata sehari-hari) (+35 more)

### Community 7 - "Credential Encryption & Agent Tests"
Cohesion: 0.07
Nodes (17): decrypt_credential(), _get_or_create_user(), test_execute_agent_fails_without_credentials(), test_execute_agent_succeeds_with_credentials(), test_get_specific_agent_definition(), test_list_all_eight_agents(), _get_or_create_user(), test_create_and_list_own_credential() (+9 more)

### Community 8 - "REST API Reference"
Cohesion: 0.05
Nodes (37): 1. Authentication & Session Management, 2. Per-User AI Credential Vault, 3. Agent Execution & Orchestration, 4. Task Management & Workspaces, 5. System Health & Monitoring, 6. Public Ledger Verification, 7. Blockchain — EAS Attestation (Day 3, R7), DELETE /api/credentials/{credential_id} (+29 more)

### Community 9 - "EAS Attestation Client"
Cohesion: 0.10
Nodes (6): EasClient, EasClientError, test_attest_rejects_duplicate_block(), test_attest_rejects_non_verified_status(), test_attest_simulation(), test_register_schema_simulation()

### Community 10 - "FastAPI Auth Dependencies"
Cohesion: 0.09
Nodes (9): audit_auth_action(), _extract_token(), get_current_user(), require_owner(), require_role(), TokenPayload, decode_access_token(), is_session_active() (+1 more)

### Community 11 - "Admin Bootstrap & CLI"
Cohesion: 0.07
Nodes (22): 3. Create initial Owner account (Revand), 4. Create the initial admin user, async_main(), main(), validate_password(), main(), _get_env(), 1. Install Hardhat and EAS dependencies (+14 more)

### Community 12 - "Password Hashing & Seed Data"
Cohesion: 0.11
Nodes (12): hash_password(), _insert_rows(), load_seed_data(), _main(), _print_seed_accounts(), seed_demo_data(), _seed_ledger_blocks(), test_seed_file_is_explicitly_simulated_and_has_no_passwords() (+4 more)

### Community 13 - "Server Configuration & Settings"
Cohesion: 0.09
Nodes (10): _load_settings(), Settings, AttestationResult, _compute_schema_id(), reset_eas_client(), auditor_user(), eas_client(), member_user() (+2 more)

### Community 14 - "Agent Registry & Execution Models"
Cohesion: 0.13
Nodes (9): AgentDefinition, AgentExecutionRequest, AgentType, get_agent(), list_agents(), execute_agent(), execute_agent_direct(), get_agent_details() (+1 more)

### Community 15 - "Database Schema & Verification Tests"
Cohesion: 0.12
Nodes (11): Metadata, R1–R14: Mandatory Demo, get_db_context(), _migrate_schema(), _table_columns(), test_foreign_keys_are_enforced(), test_migration_adds_r23_columns_to_legacy_users_table(), test_mrv_tables_exist() (+3 more)

### Community 16 - "SQLite Schema Specification"
Cohesion: 0.08
Nodes (24): 1. Engine & Configuration, 2.1 users, 2.2 credentials, 2.3 tasks, 2.4 audit_logs, 2.5 sessions, 2. Central Server Tables, 3.1 zones (+16 more)

### Community 17 - "Database Connection & ERD"
Cohesion: 0.12
Nodes (8): Entity-Relationship Diagram (ERD), Metadata, Relationship Notes, Storage & Integrity Principles, close_db(), init_db(), lifespan(), root_discovery()

### Community 18 - "Contribution Guidelines"
Cohesion: 0.09
Nodes (21): Branch Naming, Code Review, Commit Messages, Contributing to ExcbonCP, Examples, For Authors, For Reviewers, Must Follow (+13 more)

### Community 19 - "Authentication & RBAC Test Suite"
Cohesion: 0.13
Nodes (10): Run specific test, Run specific test file, test_get_current_user_profile(), test_login_invalid_password(), test_login_success(), test_logout_revokes_token(), test_member_cannot_update_roles(), test_owner_can_update_user_role() (+2 more)

### Community 20 - "Blockchain API Integration Tests"
Cohesion: 0.16
Nodes (10): blockchain_client(), _login(), _seed_api_database(), test_attest_missing_block_returns_404(), test_attest_rejects_identity_mismatch(), test_double_attestation_returns_conflict(), test_full_attestation_flow(), test_non_auditor_cannot_attest() (+2 more)

### Community 21 - "Blockchain Attestation Router"
Cohesion: 0.15
Nodes (8): References, Day 3 Implementation (R7), attest_block(), attestation_status(), _eas_dependency(), list_attestations(), register_schema(), simulation_status()

### Community 22 - "MRV Simulation Runbook"
Cohesion: 0.11
Nodes (18): 1.1.1 Loading Simulation-Only MRV Demo Data, 1.1.2 Windows Setup Helper (PowerShell), 1.1 Initial Setup, 1.2 Starting the Central Server, 1.3 Stopping the Server, 1. Clone repository, 1. Server Lifecycle Management, 2.1 Registering a New Member (+10 more)

### Community 23 - "Conftest Module"
Cohesion: 0.17
Nodes (7): auth_headers(), owner_headers(), _setup_env(), test_client(), test_db(), test_owner(), test_user()

### Community 24 - "Architecture — Central Server"
Cohesion: 0.11
Nodes (17): 1. FastAPI Gateway, 2. JWT Authentication, 3. Credential Service (Encrypted Storage), 4. Task Orchestrator, 5. Agent Manager & Skill System, 6. Per-User OpenCode Instances, 7. Monitoring & Health Checks, Central Engineering Server Architecture (+9 more)

### Community 25 - "Windows — Day1"
Cohesion: 0.30
Nodes (16): Assert-Venv(), Get-PythonLauncher(), Import-DotEnv(), Invoke-Docker(), Invoke-Health(), Invoke-Python(), Invoke-Seed(), Invoke-Serve() (+8 more)

### Community 26 - "Docker Compose Module"
Cohesion: 0.12
Nodes (17): context, dockerfile, interval, retries, start_period, test, timeout, build (+9 more)

### Community 27 - "Contract Module"
Cohesion: 0.12
Nodes (16): 1. Scope and Authority, 2.1 Sensor Reading — ESP32 → P1, 2.2 Satellite Observation — Sentinel → P2, 2.3 Consent — Community → P3, 2.4 Status Result — P4 → P5, 2.5 Ledger Entry — P5 → D2, 2.6 Verification Response — GET /verify/{id}, 2. Blueprint v5 Model 3 JSON Contracts (+8 more)

### Community 29 - "Docker Compose Module"
Cohesion: 0.14
Nodes (13): services, driver, driver, networks, excboncp-network, volumes, excboncp-data, Kartu per orang (+5 more)

### Community 30 - "Architecture — Overview"
Cohesion: 0.13
Nodes (14): Application Layer, Blockchain Layer, Central Engineering Server, Client Layer, Component Descriptions, Data & AI Layer, Data Flow Summary, Design Principles (+6 more)

### Community 31 - "Toolchain Module"
Cohesion: 0.13
Nodes (14): 1. Verified Toolchain Inventory, 2. Package Management & Virtual Environments, 3. Code Style & Quality Configuration, 4. Rollback and Cleanup, Automatically fix supported lint issues, Check code formatting, Check for lint errors, Clean temporary Python artifacts and caches (+6 more)

### Community 32 - "Deployment Module"
Cohesion: 0.14
Nodes (13): 1. Clone repository to server host, 1. Environment Topology, 1. Stop containers, 2.1 Server Host Provisioning, 2.2 Automated Deployment Steps, 2. Central Team Server Deployment, 2. Reset database and run migrations, 3. Build and launch container stack (+5 more)

### Community 33 - "Tasks — Service"
Cohesion: 0.22
Nodes (6): acquire_lock(), _get_or_create_user(), test_file_locking_isolation(), test_task_cancellation(), test_task_creation_and_retrieval(), test_task_status_lifecycle()

### Community 34 - "Workflows — Ci"
Cohesion: 0.17
Nodes (12): with, cache, cache-from, cache-to, context, fetch-depth, file, name (+4 more)

### Community 35 - "Database Module"
Cohesion: 0.24
Nodes (5): get_db(), health_check(), query_audit_logs(), server_metrics(), server_status()

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

### Community 40 - "Contributing Module"
Cohesion: 0.36
Nodes (9): Getting Started, 2. Run automated setup script, 2. Run setup (generates secrets, installs deps), check_cmd(), error(), info(), setup.sh script, success() (+1 more)

### Community 41 - "Deployment Module"
Cohesion: 0.27
Nodes (8): 3. Pre-Demo Security Hardening Checklist, Berkas dan dokumen non-kode, Jadwal F-5 sampai F0 (centang saat selesai), 3.2 Creating a Snapshot Backup, info(), backup.sh script, success(), warn()

### Community 42 - "Index Module"
Cohesion: 0.20
Nodes (9): Agent System, Architecture, ExcbonCP Documentation Index, Operations, Project Management, Root, Security, System Models (+1 more)

### Community 43 - "Security — Incident Response"
Cohesion: 0.20
Nodes (9): 1. Incident Classification Matrix, 2. Incident Response Workflow, 3. Playbooks for Common Incidents, 4. Post-Incident Review, Docker mode, ExcbonCP Incident Response Plan, Playbook A: Leaked AI Provider API Key, Playbook B: Database Tampering or Corruption (+1 more)

### Community 44 - "Auth — Service"
Cohesion: 0.22
Nodes (4): verify_password(), test_bcrypt_long_password_truncation_safety(), test_bcrypt_password_hashing_and_verification(), test_seeded_account_can_authenticate()

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

### Community 56 - "Deployment Module"
Cohesion: 0.40
Nodes (5): 4. Verify deployment health, 3.1 Executing Health Checks, Local mode, check(), health-check.sh script

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

### Community 64 - "Models — State Diagram"
Cohesion: 0.40
Nodes (4): Domain Invariants, Metadata, Precedence Hierarchy, State Diagram — Parcel Status Engine

### Community 65 - "Project Status Module"
Cohesion: 0.40
Nodes (4): 1. Executive Summary, 2. Feature Classification Inventory, 3. Human Team Milestones, ExcbonCP Project Status & Implementation Dashboard

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

## Knowledge Gaps
- **389 isolated node(s):** `excboncp`, `Description`, `Steps to Reproduce`, `Expected Behavior`, `Actual Behavior` (+384 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 789 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `2. Feature Classification Inventory` connect `Project Status Module` to `Deployment Module`, `Password Hashing & Seed Data`, `Server Configuration & Settings`, `Database Connection & ERD`, `Runbook Module`, `Windows — Day1`, `Docker Compose Module`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `UserResponse` (e.g. with `execute_agent()` and `execute_agent_direct()`) actually correct?**
  _`UserResponse` has 35 INFERRED edges - model-reasoned connections that need verification._
- **What connects `excboncp`, `Description`, `Steps to Reproduce` to the rest of the system?**
  _389 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SHA-256 Hash-Chain Ledger` be split into smaller, more focused modules?**
  _Cohesion score 0.054527750730282376 - nodes in this community are weakly interconnected._
- **Why does `get_db()` connect `Database Module` to `SHA-256 Hash-Chain Ledger`, `Auth & User Models`, `Task Management & Lifecycle`, `Credential Vault Models`, `Blockchain EAS Anchor Service`, `FastAPI Auth Dependencies`, `Admin Bootstrap & CLI`, `Password Hashing & Seed Data`, `Agent Registry & Execution Models`, `Database Schema & Verification Tests`, `Database Connection & ERD`, `Blockchain Attestation Router`, `Conftest Module`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `EasClient` (e.g. with `attest_block()` and `_eas_dependency()`) actually correct?**
  _`EasClient` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Should `Auth & User Models` be split into smaller, more focused modules?**
  _Cohesion score 0.0635814889336016 - nodes in this community are weakly interconnected._