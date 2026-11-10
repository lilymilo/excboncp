# audit_auth_action()

> God node · 23 connections · `server/auth/dependencies.py`

**Community:** [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md)

## Connections by Relation

### calls
- [get_db()](get_db.md) `EXTRACTED`
- execute_agent() `EXTRACTED`
- login() `EXTRACTED`
- update_existing_task() `EXTRACTED`
- change_role() `EXTRACTED`
- change_status() `EXTRACTED`
- register() `EXTRACTED`
- save_credential() `EXTRACTED`
- update_own_credential() `EXTRACTED`
- create_new_task() `EXTRACTED`
- update_me() `EXTRACTED`
- cancel_existing_task() `EXTRACTED`
- logout() `EXTRACTED`
- delete_own_credential() `EXTRACTED`
- delete_existing_task() `EXTRACTED`
- log_audit() `EXTRACTED`

### contains
- dependencies.py `EXTRACTED`

### imports
- auth/router.py `EXTRACTED`
- agents/router.py `EXTRACTED`
- tasks/router.py `EXTRACTED`
- credentials/router.py `EXTRACTED`

### rationale_for
- Helper to log an auth-related audit event. `EXTRACTED`

### references
- Request `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*