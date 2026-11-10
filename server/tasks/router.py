"""
ExcbonCP Central Server — Task router.

Endpoints for task creation, listing, updating, cancellation, and deletion.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from server.auth.dependencies import audit_auth_action, get_current_user, require_owner
from server.auth.models import UserResponse
from server.database import get_db
from server.tasks.models import TaskCreate, TaskResponse, TaskUpdate
from server.tasks.service import (
    cancel_task,
    create_task,
    delete_task,
    get_task,
    list_tasks,
    update_task,
)

logger = logging.getLogger("excboncp.tasks.router")

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a task",
)
async def create_new_task(
    body: TaskCreate,
    request: Request,
    user: UserResponse = Depends(get_current_user),
) -> TaskResponse:
    """Create a new task assigned to the current user (or a specified user)."""
    db = await get_db()
    task = await create_task(db, body, user.id)
    await audit_auth_action(
        request,
        user.id,
        "task.create",
        resource_type="task",
        resource_id=task.id,
        details=f"title={task.title}",
    )
    return task


@router.get(
    "",
    response_model=list[TaskResponse],
    summary="List tasks",
)
async def get_tasks(
    status_filter: str | None = Query(None, alias="status"),
    assignee: str | None = Query(None),
    user: UserResponse = Depends(get_current_user),
) -> list[TaskResponse]:
    """List tasks, optionally filtered by status and/or assignee."""
    db = await get_db()
    return await list_tasks(db, user_id=assignee, status=status_filter)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get task details",
)
async def get_task_details(
    task_id: str,
    user: UserResponse = Depends(get_current_user),
) -> TaskResponse:
    """Return details for a specific task."""
    db = await get_db()
    task = await get_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    return task


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update task",
)
async def update_existing_task(
    task_id: str,
    body: TaskUpdate,
    request: Request,
    user: UserResponse = Depends(get_current_user),
) -> TaskResponse:
    """Update a task's status and/or result."""
    db = await get_db()
    existing = await get_task(db, task_id)
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    try:
        task = await update_task(db, task_id, body)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    await audit_auth_action(
        request,
        user.id,
        "task.update",
        resource_type="task",
        resource_id=task_id,
        details=f"status={body.status}" if body.status else None,
    )
    return task


@router.post(
    "/{task_id}/cancel",
    response_model=TaskResponse,
    summary="Cancel a task",
)
async def cancel_existing_task(
    task_id: str,
    request: Request,
    user: UserResponse = Depends(get_current_user),
) -> TaskResponse:
    """Cancel a pending or running task."""
    db = await get_db()
    try:
        task = await cancel_task(db, task_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    await audit_auth_action(
        request,
        user.id,
        "task.cancel",
        resource_type="task",
        resource_id=task_id,
    )
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task (owner only)",
)
async def delete_existing_task(
    task_id: str,
    request: Request,
    user: UserResponse = Depends(require_owner()),
):
    """Permanently delete a task.  Requires owner role."""
    db = await get_db()
    deleted = await delete_task(db, task_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    await audit_auth_action(
        request,
        user.id,
        "task.delete",
        resource_type="task",
        resource_id=task_id,
    )
