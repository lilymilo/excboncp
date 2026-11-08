"""
ExcbonCP Central Server — Task Pydantic models.

Defines status enum, request / response schemas for the task orchestration layer.
"""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class TaskStatus(StrEnum):
    """Lifecycle states for a task."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REVIEW = "review"


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------


class TaskCreate(BaseModel):
    """Payload for creating a new task."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=4096)
    agent_type: str | None = None
    assigned_to: str | None = None


class TaskUpdate(BaseModel):
    """Payload for updating a task."""

    status: TaskStatus | None = None
    result: str | None = None


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------


class TaskResponse(BaseModel):
    """Public-facing task representation."""

    id: str
    title: str
    description: str | None = None
    agent_type: str | None = None
    assigned_to: str | None = None
    created_by: str
    status: str
    workspace_path: str | None = None
    result: str | None = None
    created_at: str
    started_at: str | None = None
    completed_at: str | None = None
