"""
ExcbonCP Central Server — Agent registry.

Defines the 8 specialised agents with their capabilities, directory access
rules, and provider requirements.
"""

from __future__ import annotations

from server.agents.models import AgentDefinition, AgentType

# ---------------------------------------------------------------------------
# Agent catalogue
# ---------------------------------------------------------------------------

_AGENTS: dict[AgentType, AgentDefinition] = {
    AgentType.ARCHITECT: AgentDefinition(
        type=AgentType.ARCHITECT,
        name="Architect Agent",
        purpose="Architecture decisions and system design",
        description=(
            "Responsible for high-level architecture, system design documents, "
            "component diagrams, and cross-cutting technical decisions."
        ),
        responsibilities=[
            "Define system architecture and component boundaries",
            "Create and maintain architecture decision records (ADRs)",
            "Review design proposals from other agents",
            "Ensure consistency across the stack",
        ],
        required_context=["project_structure", "existing_adrs", "tech_stack"],
        allowed_dirs=["docs/", "server/"],
        restricted_dirs=[".env", "credentials/", "data/"],
        required_provider="anthropic",
    ),
    AgentType.BACKEND: AgentDefinition(
        type=AgentType.BACKEND,
        name="Backend Agent",
        purpose="Backend services, APIs, and database layer",
        description=(
            "Handles all server-side logic including FastAPI endpoints, "
            "database schemas, migrations, and background workers."
        ),
        responsibilities=[
            "Implement and maintain API endpoints",
            "Design and evolve the database schema",
            "Write backend service logic",
            "Integrate external APIs and services",
        ],
        required_context=["api_spec", "database_schema", "existing_services"],
        allowed_dirs=["server/", "backend/", "db/"],
        restricted_dirs=["frontend/", "firmware/"],
        required_provider="anthropic",
    ),
    AgentType.FRONTEND: AgentDefinition(
        type=AgentType.FRONTEND,
        name="Frontend Agent",
        purpose="DApp UI, maps, and user experience",
        description=(
            "Builds and maintains the decentralised application frontend, "
            "including map visualisations, dashboards, and responsive layouts."
        ),
        responsibilities=[
            "Implement UI components and pages",
            "Integrate map and satellite imagery layers",
            "Ensure responsive and accessible design",
            "Connect frontend to backend APIs",
        ],
        required_context=["design_specs", "api_endpoints", "component_library"],
        allowed_dirs=["frontend/", "public/"],
        restricted_dirs=["server/", "firmware/"],
        required_provider="openai",
    ),
    AgentType.IOT: AgentDefinition(
        type=AgentType.IOT,
        name="IoT Agent",
        purpose="ESP32 firmware, MQTT, and sensor integration",
        description=(
            "Develops firmware for ESP32 devices, manages MQTT communication, "
            "and handles sensor data acquisition and edge processing."
        ),
        responsibilities=[
            "Write and test ESP32 firmware in C/C++",
            "Configure MQTT topics and message formats",
            "Implement sensor reading and calibration logic",
            "Manage OTA firmware updates",
        ],
        required_context=["hardware_specs", "mqtt_topics", "sensor_datasheets"],
        allowed_dirs=["firmware/", "iot/"],
        restricted_dirs=["frontend/", "server/"],
        required_provider="anthropic",
    ),
    AgentType.DATA_AI: AgentDefinition(
        type=AgentType.DATA_AI,
        name="Data & AI Agent",
        purpose="Satellite data processing, AI explanations, anomaly detection",
        description=(
            "Processes satellite imagery and sensor data, builds ML models "
            "for anomaly detection, and generates AI-powered explanations."
        ),
        responsibilities=[
            "Process and analyse satellite data",
            "Train and deploy anomaly detection models",
            "Generate explainable AI summaries",
            "Build data pipelines for ingestion and transformation",
        ],
        required_context=["data_sources", "model_registry", "feature_specs"],
        allowed_dirs=["data/", "ml/", "docs/"],
        restricted_dirs=["firmware/"],
        required_provider="openai",
    ),
    AgentType.BLOCKCHAIN: AgentDefinition(
        type=AgentType.BLOCKCHAIN,
        name="Blockchain Agent",
        purpose="Smart contracts and EAS integration",
        description=(
            "Develops Solidity smart contracts, integrates Ethereum Attestation "
            "Service (EAS), and manages on-chain logic for the platform."
        ),
        responsibilities=[
            "Write and audit Solidity smart contracts",
            "Integrate EAS for attestation workflows",
            "Manage contract deployment and upgrades",
            "Implement on-chain data verification",
        ],
        required_context=["contract_abis", "chain_config", "eas_schemas"],
        allowed_dirs=["contracts/", "blockchain/"],
        restricted_dirs=["server/", "firmware/"],
        required_provider="anthropic",
    ),
    AgentType.SECURITY: AgentDefinition(
        type=AgentType.SECURITY,
        name="Security Agent",
        purpose="Security review and vulnerability scanning",
        description=(
            "Performs code security reviews, scans for vulnerabilities, "
            "and enforces security best practices across the codebase."
        ),
        responsibilities=[
            "Review code for security vulnerabilities",
            "Scan dependencies for known CVEs",
            "Enforce authentication and authorisation best practices",
            "Audit cryptographic implementations",
        ],
        required_context=["codebase_overview", "dependency_list", "auth_flows"],
        allowed_dirs=["*"],  # read access to ALL
        restricted_dirs=["credentials/"],  # no credential writes
        required_provider="anthropic",
    ),
    AgentType.REVIEWER: AgentDefinition(
        type=AgentType.REVIEWER,
        name="Reviewer Agent",
        purpose="Code review, QA, and test validation",
        description=(
            "Conducts thorough code reviews, validates test coverage, "
            "and ensures code quality standards are met before merging."
        ),
        responsibilities=[
            "Review pull requests and code changes",
            "Validate test coverage and quality",
            "Check adherence to coding standards",
            "Suggest improvements and refactoring opportunities",
        ],
        required_context=["diff_context", "test_results", "coding_standards"],
        allowed_dirs=["*", "tests/"],  # read access to ALL + write to tests
        restricted_dirs=["production/", ".env"],  # no production config writes
        required_provider="anthropic",
    ),
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def get_agent(agent_type: AgentType) -> AgentDefinition | None:
    """Return the agent definition for the given type, or *None*."""
    return _AGENTS.get(agent_type)


def list_agents() -> list[AgentDefinition]:
    """Return all registered agent definitions."""
    return list(_AGENTS.values())
