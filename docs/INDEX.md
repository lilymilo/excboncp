# ExcbonCP Documentation Index

> Complete table of contents for the ExcbonCP Decentralized MRV Forest System documentation.

---

## Root

| Document | Description |
|----------|-------------|
| [AGENTS.md](../AGENTS.md) | Agent configuration index — 8 AI engineering agents with scope and context |

## Architecture

| Document | Description |
|----------|-------------|
| [architecture/OVERVIEW.md](architecture/OVERVIEW.md) | Full system architecture — sensor pipeline, satellite, blockchain, DApp |
| [architecture/CENTRAL_SERVER.md](architecture/CENTRAL_SERVER.md) | Central engineering server — FastAPI gateway, agent runtime, credential storage |

## System Models

| Document | Description |
|----------|-------------|
| [models/CONTEXT_DIAGRAM.md](models/CONTEXT_DIAGRAM.md) | System boundary and external actor diagram |
| [models/USE_CASE_DIAGRAM.md](models/USE_CASE_DIAGRAM.md) | Primary use cases with actor relationships |
| [models/DATA_FLOW_DIAGRAM.md](models/DATA_FLOW_DIAGRAM.md) | Data flow from sensors through processing to DApp |
| [models/SEQUENCE_DIAGRAM.md](models/SEQUENCE_DIAGRAM.md) | Key interaction flows — ingestion, status, attestation, consent |
| [models/STATE_DIAGRAM.md](models/STATE_DIAGRAM.md) | Land parcel status state machine |
| [models/ER_DIAGRAM.md](models/ER_DIAGRAM.md) | Entity-relationship diagram for application database |
| [models/DEPLOYMENT_DIAGRAM.md](models/DEPLOYMENT_DIAGRAM.md) | Infrastructure deployment topology |
| [models/DAPP_FLOWCHART.md](models/DAPP_FLOWCHART.md) | DApp user interaction flowcharts |

## Technical Reference

| Document | Description |
|----------|-------------|
| [api-reference.md](api-reference.md) | REST API endpoint reference with request/response schemas |
| [database-schema.md](database-schema.md) | SQLite database schema — tables, columns, constraints, indexes |
| [contract.md](contract.md) | EAS smart contract schema and attestation documentation |
| [toolchain.md](toolchain.md) | Development toolchain versions and configuration |

## Project Management

| Document | Description |
|----------|-------------|
| [requirements-traceability.md](requirements-traceability.md) | R1–R29 traceability matrix — requirements to code to tests |
| [project-status.md](project-status.md) | Current status dashboard with phase targets |
| [team-ownership.md](team-ownership.md) | Team member responsibility matrix |
| [decisions.md](decisions.md) | Architecture Decision Records (ADR-001 through ADR-008) |

## Operations

| Document | Description |
|----------|-------------|
| [deployment.md](deployment.md) | Deployment guide — local, server, staging, production |
| [runbook.md](runbook.md) | Operational runbook — startup, shutdown, backup, troubleshooting |

## Agent System

| Document | Description |
|----------|-------------|
| [agent-workflow.md](agent-workflow.md) | Detailed agent workflow — responsibilities, handoffs, escalation |
| [token-efficiency.md](token-efficiency.md) | Token efficiency strategies for agent context management |

## Security

| Document | Description |
|----------|-------------|
| [security/THREAT_MODEL.md](security/THREAT_MODEL.md) | STRIDE threat model with mitigations |
| [security/ACCESS_CONTROL.md](security/ACCESS_CONTROL.md) | Roles, permissions matrix, and authorization rules |
| [security/SECRETS.md](security/SECRETS.md) | Secrets management — storage, encryption, rotation |
| [security/INCIDENT_RESPONSE.md](security/INCIDENT_RESPONSE.md) | Incident response plan — detection, classification, recovery |
