# UserResponse

> God node · 48 connections · `server/auth/models.py`

**Community:** [Auth & User Models](Auth_&_User_Models.md)

## Connections by Relation

### calls
- create_user() `EXTRACTED`
- _row_to_user() `EXTRACTED`

### contains
- auth/models.py `EXTRACTED`

### imports
- auth/service.py `EXTRACTED`
- auth/router.py `EXTRACTED`
- blockchain/router.py `EXTRACTED`
- agents/router.py `EXTRACTED`
- dependencies.py `EXTRACTED`
- tasks/router.py `EXTRACTED`
- credentials/router.py `EXTRACTED`
- monitoring/router.py `EXTRACTED`

### inherits
- BaseModel `EXTRACTED`

### rationale_for
- Public-facing user representation — no password hash. `EXTRACTED`

### uses
- [get_current_user()](get_current_user.md) `INFERRED`
- execute_agent() `INFERRED`
- get_user_by_id() `INFERRED`
- update_existing_task() `INFERRED`
- save_credential() `INFERRED`
- update_own_credential() `INFERRED`
- create_new_task() `INFERRED`
- change_role() `INFERRED`
- change_status() `INFERRED`
- register() `INFERRED`
- authenticate_user() `INFERRED`
- cancel_existing_task() `INFERRED`
- update_me() `INFERRED`
- update_user() `INFERRED`
- logout() `INFERRED`
- delete_own_credential() `INFERRED`
- delete_existing_task() `INFERRED`
- attest_block() `INFERRED`
- update_user_status() `INFERRED`
- require_role() `INFERRED`
- *…and 15 more `uses` connection(s) not listed (lowest-degree first to go)*

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*