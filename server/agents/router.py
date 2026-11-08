"""
ExcbonCP Central Server — Agent router.

Endpoints for listing agents and triggering agent execution.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status

from server.agents.models import AgentDefinition, AgentExecutionRequest, AgentType
from server.agents.registry import get_agent, list_agents
from server.auth.dependencies import audit_auth_action, get_current_user
from server.auth.models import UserResponse
from server.config import settings
from server.credentials.service import get_credential_for_agent
from server.database import get_db
from server.tasks.models import TaskCreate
from server.tasks.service import create_task

logger = logging.getLogger("excboncp.agents.router")

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get(
    "",
    response_model=list[AgentDefinition],
    summary="List available agents",
)
async def get_agents() -> list[AgentDefinition]:
    """Return all available agent definitions."""
    return list_agents()


@router.get(
    "/{agent_type}",
    response_model=AgentDefinition,
    summary="Get agent definition",
)
async def get_agent_details(agent_type: AgentType) -> AgentDefinition:
    """Return the full definition for a specific agent type."""
    agent = get_agent(agent_type)
    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent type '{agent_type}' not found.",
        )
    return agent


@router.post(
    "/execute",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Start agent task via payload",
)
async def execute_agent_direct(
    body: AgentExecutionRequest,
    request: Request,
    user: UserResponse = Depends(get_current_user),
) -> dict:
    """Queue an agent task directly from the payload."""
    return await execute_agent(body.agent_type, body, request, user)


@router.post(
    "/{agent_type}/execute",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Start agent task",
)
async def execute_agent(
    agent_type: AgentType,
    body: AgentExecutionRequest,
    request: Request,
    user: UserResponse = Depends(get_current_user),
) -> dict:
    """Create a task for the specified agent and launch workspace preparation.

    The endpoint:
    1. Validates the agent type exists.
    2. Checks the user has a credential for the required provider.
    3. Creates a task record.
    4. Returns the task ID for the caller to track progress.
    """
    # Validate agent
    agent = get_agent(agent_type)
    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent type '{agent_type}' not found.",
        )

    # Determine provider
    provider = body.provider or agent.required_provider
    db = await get_db()

    # Verify credentials exist (do NOT expose the key)
    try:
        _ = await get_credential_for_agent(
            db, user.id, provider, settings.CREDENTIAL_ENCRYPTION_KEY
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    # Create the task
    task_data = TaskCreate(
        title=f"[{agent.name}] {body.task_description[:80]}",
        description=body.task_description,
        agent_type=agent_type.value,
        assigned_to=user.id,
    )
    task = await create_task(db, task_data, user.id)

    await audit_auth_action(
        request,
        user.id,
        "agent.execute",
        resource_type="task",
        resource_id=task.id,
        details=f"agent={agent_type}, provider={provider}",
    )

    logger.info(
        "Agent execution started: agent=%s task=%s user=%s",
        agent_type,
        task.id,
        user.id,
    )

    return {
        "task_id": task.id,
        "agent_type": agent_type.value,
        "status": task.status,
        "message": f"Task created. Agent '{agent.name}' execution queued.",
    }
