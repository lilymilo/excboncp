# Tasks — Service

> 14 nodes · cohesion 0.22

## Key Concepts

- **test_tasks.py** (10 connections) — `tests/test_tasks.py`
- **_get_or_create_user()** (5 connections) — `tests/test_tasks.py`
- **acquire_lock()** (4 connections) — `server/tasks/service.py`
- **TestClient** (4 connections)
- **test_file_locking_isolation()** (4 connections) — `tests/test_tasks.py`
- **test_task_cancellation()** (4 connections) — `tests/test_tasks.py`
- **test_task_creation_and_retrieval()** (4 connections) — `tests/test_tasks.py`
- **test_task_status_lifecycle()** (4 connections) — `tests/test_tasks.py`
- **Attempt to acquire locks on the given file paths for a task. Returns a list of…** (1 connections) — `server/tasks/service.py`
- **Tests for ExcbonCP Task Management and Workspace Isolation.** (1 connections) — `tests/test_tasks.py`
- **User can create and retrieve tasks.** (1 connections) — `tests/test_tasks.py`
- **Task status progresses from pending -> running -> completed.** (1 connections) — `tests/test_tasks.py`
- **Task can be cancelled.** (1 connections) — `tests/test_tasks.py`
- **File locks prevent two concurrent tasks from modifying identical files.** (1 connections) — `tests/test_tasks.py`

## Relationships

- [Task Management & Lifecycle](Task_Management_&_Lifecycle.md) (4 shared connections)
- [Credential Encryption & Agent Tests](Credential_Encryption_&_Agent_Tests.md) (1 shared connections)

## Source Files

- `server/tasks/service.py`
- `tests/test_tasks.py`

## Audit Trail

- EXTRACTED: 25 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*