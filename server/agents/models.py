"""
ExcbonCP Central Server — Agent Pydantic models.

Defines agent type enum, agent definitions, and execution request schemas.
"""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class AgentType(StrEnum):
    """Specialised agent roles available in the ExcbonCP system."""

    ARCHITECT = "architect"
    BACKEND = "backend"
    FRONTEND = "frontend"
    IOT = "iot"
    DATA_AI = "data_ai"
    BLOCKCHAIN = "blockchain"
    SECURITY = "security"
    REVIEWER = "reviewer"


class AgentDefinition(BaseModel):
    """Complete definition of an agent's capabilities and constraints."""

    type: AgentType
    name: str
    purpose: str
    description: str
    responsibilities: list[str]
    required_context: list[str]
    allowed_dirs: list[str]
    restricted_dirs: list[str]
    required_provider: str = Field(
        ..., description="AI provider needed to run this agent"
    )


class AgentExecutionRequest(BaseModel):
    """Payload for requesting agent execution."""

    agent_type: AgentType
    task_description: str = Field(..., min_length=1, max_length=4096)
    target_files: list[str] | None = None
    provider: str | None = None
