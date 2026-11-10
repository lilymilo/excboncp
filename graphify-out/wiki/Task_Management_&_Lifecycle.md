# Task Management & Lifecycle

> 55 nodes · cohesion 0.08

## Key Concepts

- **tasks/router.py** (29 connections) — `server/tasks/router.py`
- **tasks/service.py** (27 connections) — `server/tasks/service.py`
- **TaskResponse** (16 connections) — `server/tasks/models.py`
- **update_existing_task()** (11 connections) — `server/tasks/router.py`
- **create_task()** (11 connections) — `server/tasks/service.py`
- **get_task()** (11 connections) — `server/tasks/service.py`
- **update_task()** (11 connections) — `server/tasks/service.py`
- **tasks/models.py** (10 connections) — `server/tasks/models.py`
- **create_new_task()** (10 connections) — `server/tasks/router.py`
- **cancel_task()** (10 connections) — `server/tasks/service.py`
- **TaskCreate** (9 connections) — `server/tasks/models.py`
- **cancel_existing_task()** (9 connections) — `server/tasks/router.py`
- **TaskUpdate** (8 connections) — `server/tasks/models.py`
- **delete_existing_task()** (8 connections) — `server/tasks/router.py`
- **delete_task()** (8 connections) — `server/tasks/service.py`
- **TaskStatus** (7 connections) — `server/tasks/models.py`
- **get_task_details()** (7 connections) — `server/tasks/router.py`
- **get_tasks()** (7 connections) — `server/tasks/router.py`
- **list_tasks()** (7 connections) — `server/tasks/service.py`
- **Connection** (6 connections)
- **_release_locks()** (6 connections) — `server/tasks/service.py`
- **_row_to_response()** (5 connections) — `server/tasks/service.py`
- **Request** (4 connections)
- **cleanup_workspace()** (4 connections) — `server/tasks/service.py`
- **BaseModel** (3 connections)
- *... and 30 more nodes in this community*

## Relationships

- [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md) (15 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (7 shared connections)
- [Database Module](Database_Module.md) (7 shared connections)
- [Agent Registry & Execution Models](Agent_Registry_&_Execution_Models.md) (6 shared connections)
- [Tasks — Service](Tasks_—_Service.md) (4 shared connections)
- [Credential Vault Models](Credential_Vault_Models.md) (2 shared connections)
- [Database Connection & ERD](Database_Connection_&_ERD.md) (2 shared connections)
- [Server Configuration & Settings](Server_Configuration_&_Settings.md) (1 shared connections)
- [Database Schema & Verification Tests](Database_Schema_&_Verification_Tests.md) (1 shared connections)
- [Conftest Module](Conftest_Module.md) (1 shared connections)

## Source Files

- `server/tasks/models.py`
- `server/tasks/router.py`
- `server/tasks/service.py`

## Audit Trail

- EXTRACTED: 140 (86%)
- INFERRED: 23 (14%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*