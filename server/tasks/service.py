"""
ExcbonCP Central Server — Task service layer.

Manages task lifecycle, workspace creation / cleanup, and conflict locking.
"""

from __future__ import annotations

import logging
import os
import shutil
import uuid
from datetime import UTC, datetime
from pathlib import Path

import aiosqlite

from server.tasks.models import TaskCreate, TaskResponse, TaskStatus, TaskUpdate

logger = logging.getLogger("excboncp.tasks.service")

# In-memory lock table: maps file paths to task IDs
_file_locks: dict[str, str] = {}

# ---------------------------------------------------------------------------
# Row mapping
# ---------------------------------------------------------------------------


def _row_to_response(row: aiosqlite.Row) -> TaskResponse:
    return TaskResponse(
        id=row["id"],
        title=row["title"],
        description=row["description"],
        agent_type=row["agent_type"],
        assigned_to=row["assigned_to"],
        created_by=row["created_by"],
        status=row["status"],
        workspace_path=row["workspace_path"],
        result=row["result"],
        created_at=row["created_at"],
        started_at=row["started_at"],
        completed_at=row["completed_at"],
    )


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------


async def create_task(
    db: aiosqlite.Connection, data: TaskCreate, user_id: str
) -> TaskResponse:
    """Create a new task record in *pending* status."""
    task_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()

    await db.execute(
        """
        INSERT INTO tasks
            (id, title, description, assigned_to, created_by, agent_type,
             status, workspace_path, result, created_at, started_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL)
        """,
        (
            task_id,
            data.title,
            data.description,
            data.assigned_to,
            user_id,
            data.agent_type,
            TaskStatus.PENDING.value,
            now,
        ),
    )
    await db.commit()

    logger.info("Task created: %s — %s", task_id, data.title)
    return TaskResponse(
        id=task_id,
        title=data.title,
        description=data.description,
        agent_type=data.agent_type,
        assigned_to=data.assigned_to,
        created_by=user_id,
        status=TaskStatus.PENDING.value,
        workspace_path=None,
        result=None,
        created_at=now,
        started_at=None,
        completed_at=None,
    )


async def get_task(
    db: aiosqlite.Connection, task_id: str
) -> TaskResponse | None:
    """Fetch a single task by ID."""
    async with db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)) as cur:
        row = await cur.fetchone()
    return _row_to_response(row) if row else None


async def list_tasks(
    db: aiosqlite.Connection,
    *,
    user_id: str | None = None,
    status: str | None = None,
) -> list[TaskResponse]:
    """List tasks with optional filters by assignee and/or status."""
    query = "SELECT * FROM tasks WHERE 1=1"
    params: list[str] = []

    if user_id is not None:
        query += " AND (assigned_to = ? OR created_by = ?)"
        params.extend([user_id, user_id])
    if status is not None:
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY created_at DESC"

    async with db.execute(query, tuple(params)) as cur:
        rows = await cur.fetchall()
    return [_row_to_response(r) for r in rows]


async def update_task(
    db: aiosqlite.Connection, task_id: str, data: TaskUpdate
) -> TaskResponse:
    """Update a task's status and/or result."""
    now = datetime.now(UTC).isoformat()
    fields: list[str] = []
    values: list[str] = []

    if data.status is not None:
        fields.append("status = ?")
        values.append(data.status.value)

        if data.status == TaskStatus.RUNNING:
            fields.append("started_at = ?")
            values.append(now)
        elif data.status in (
            TaskStatus.COMPLETED,
            TaskStatus.FAILED,
            TaskStatus.CANCELLED,
        ):
            fields.append("completed_at = ?")
            values.append(now)
            # Release file locks for this task
            _release_locks(task_id)

    if data.result is not None:
        fields.append("result = ?")
        values.append(data.result)

    if not fields:
        task = await get_task(db, task_id)
        if task is None:
            raise ValueError("Task not found.")
        return task

    values.append(task_id)
    await db.execute(
        f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?",
        tuple(values),
    )
    await db.commit()

    task = await get_task(db, task_id)
    if task is None:
        raise ValueError("Task not found after update.")
    return task


async def cancel_task(db: aiosqlite.Connection, task_id: str) -> TaskResponse:
    """Cancel a task (only if pending or running)."""
    task = await get_task(db, task_id)
    if task is None:
        raise ValueError("Task not found.")

    if task.status not in (TaskStatus.PENDING.value, TaskStatus.RUNNING.value):
        raise ValueError(
            f"Cannot cancel task in '{task.status}' status. "
            "Only pending or running tasks can be cancelled."
        )

    return await update_task(
        db, task_id, TaskUpdate(status=TaskStatus.CANCELLED)
    )


async def delete_task(db: aiosqlite.Connection, task_id: str) -> bool:
    """Hard-delete a task.  Returns success flag."""
    # Clean up workspace if it exists
    task = await get_task(db, task_id)
    if task and task.workspace_path:
        cleanup_workspace(task.workspace_path)

    _release_locks(task_id)

    cursor = await db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    await db.commit()
    deleted = cursor.rowcount > 0  # type: ignore[union-attr]
    if deleted:
        logger.info("Task deleted: %s", task_id)
    return deleted


# ---------------------------------------------------------------------------
# Workspace management
# ---------------------------------------------------------------------------


def create_workspace(task_id: str, base_repo_path: str) -> str:
    """Create an isolated workspace directory for a task.

    Attempts to create a git worktree first; falls back to a directory copy
    for non-git repositories.

    Returns the absolute path to the workspace.
    """
    workspace_dir = os.path.join(base_repo_path, ".workspaces", task_id)

    git_dir = os.path.join(base_repo_path, ".git")
    if os.path.isdir(git_dir):
        # Try git worktree
        import subprocess

        branch_name = f"task/{task_id[:8]}"
        try:
            subprocess.run(
                ["git", "worktree", "add", "-b", branch_name, workspace_dir, "HEAD"],
                cwd=base_repo_path,
                check=True,
                capture_output=True,
                text=True,
            )
            logger.info("Created git worktree at %s", workspace_dir)
            return workspace_dir
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.warning("Git worktree creation failed; falling back to copy.")

    # Fallback: shallow copy
    Path(workspace_dir).mkdir(parents=True, exist_ok=True)
    shutil.copytree(
        base_repo_path,
        workspace_dir,
        dirs_exist_ok=True,
        ignore=shutil.ignore_patterns(
            ".git", ".workspaces", "__pycache__", "node_modules", ".venv"
        ),
    )
    logger.info("Created workspace copy at %s", workspace_dir)
    return workspace_dir


def cleanup_workspace(workspace_path: str) -> bool:
    """Remove a workspace directory.  Returns True on success."""
    try:
        if os.path.isdir(workspace_path):
            shutil.rmtree(workspace_path)
            logger.info("Cleaned up workspace: %s", workspace_path)
            return True
    except OSError as exc:
        logger.error("Failed to clean workspace %s: %s", workspace_path, exc)
    return False


# ---------------------------------------------------------------------------
# File locking (in-memory)
# ---------------------------------------------------------------------------


def acquire_lock(task_id: str, file_paths: list[str]) -> list[str]:
    """Attempt to acquire locks on the given file paths for a task.

    Returns a list of paths that are already locked by *another* task.
    """
    conflicts: list[str] = []
    for fp in file_paths:
        holder = _file_locks.get(fp)
        if holder is not None and holder != task_id:
            conflicts.append(fp)

    if not conflicts:
        for fp in file_paths:
            _file_locks[fp] = task_id

    return conflicts


def _release_locks(task_id: str) -> None:
    """Release all file locks held by a task."""
    to_remove = [fp for fp, tid in _file_locks.items() if tid == task_id]
    for fp in to_remove:
        del _file_locks[fp]
