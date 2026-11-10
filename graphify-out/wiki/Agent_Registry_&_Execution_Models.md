# Agent Registry & Execution Models

> 29 nodes · cohesion 0.13

## Key Concepts

- **agents/router.py** (29 connections) — `server/agents/router.py`
- **execute_agent()** (14 connections) — `server/agents/router.py`
- **AgentDefinition** (9 connections) — `server/agents/models.py`
- **agents/models.py** (8 connections) — `server/agents/models.py`
- **AgentType** (8 connections) — `server/agents/models.py`
- **registry.py** (7 connections) — `server/agents/registry.py`
- **get_agent()** (7 connections) — `server/agents/registry.py`
- **execute_agent_direct()** (7 connections) — `server/agents/router.py`
- **AgentExecutionRequest** (6 connections) — `server/agents/models.py`
- **get_agent_details()** (6 connections) — `server/agents/router.py`
- **list_agents()** (5 connections) — `server/agents/registry.py`
- **get_agents()** (5 connections) — `server/agents/router.py`
- **BaseModel** (2 connections)
- **get** (2 connections)
- **post** (2 connections)
- **Request** (2 connections)
- **StrEnum** (1 connections)
- **ExcbonCP Central Server — Agent Pydantic models. Defines agent type enum, agent…** (1 connections) — `server/agents/models.py`
- **Specialised agent roles available in the ExcbonCP system.** (1 connections) — `server/agents/models.py`
- **Complete definition of an agent's capabilities and constraints.** (1 connections) — `server/agents/models.py`
- **Payload for requesting agent execution.** (1 connections) — `server/agents/models.py`
- **ExcbonCP Central Server — Agent registry. Defines the 8 specialised agents with…** (1 connections) — `server/agents/registry.py`
- **Return the agent definition for the given type, or *None*.** (1 connections) — `server/agents/registry.py`
- **Return all registered agent definitions.** (1 connections) — `server/agents/registry.py`
- **ExcbonCP Central Server — Agent router. Endpoints for listing agents and…** (1 connections) — `server/agents/router.py`
- *... and 4 more nodes in this community*

## Relationships

- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (7 shared connections)
- [Task Management & Lifecycle](Task_Management_&_Lifecycle.md) (6 shared connections)
- [Credential Vault Models](Credential_Vault_Models.md) (5 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (3 shared connections)
- [Database Module](Database_Module.md) (2 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (2 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (1 shared connections)

## Source Files

- `server/agents/models.py`
- `server/agents/registry.py`
- `server/agents/router.py`

## Audit Trail

- EXTRACTED: 67 (85%)
- INFERRED: 12 (15%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*