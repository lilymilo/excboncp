# get_db()

> God node · 44 connections · `server/database.py`

**Community:** [Database Module](Database_Module.md)

## Connections by Relation

### calls
- [audit_auth_action()](audit_auth_action.md) `EXTRACTED`
- [anchor_block_to_eas()](anchor_block_to_eas.md) `EXTRACTED`
- [get_current_user()](get_current_user.md) `EXTRACTED`
- execute_agent() `EXTRACTED`
- async_main() `EXTRACTED`
- login() `EXTRACTED`
- update_existing_task() `EXTRACTED`
- change_role() `EXTRACTED`
- change_status() `EXTRACTED`
- register() `EXTRACTED`
- save_credential() `EXTRACTED`
- update_own_credential() `EXTRACTED`
- _main() `EXTRACTED`
- create_new_task() `EXTRACTED`
- update_me() `EXTRACTED`
- cancel_existing_task() `EXTRACTED`
- logout() `EXTRACTED`
- delete_own_credential() `EXTRACTED`
- delete_existing_task() `EXTRACTED`
- test_db() `EXTRACTED`
- *…and 9 more `calls` connection(s) not listed (lowest-degree first to go)*

### contains
- database.py `EXTRACTED`

### imports
- auth/router.py `EXTRACTED`
- blockchain/router.py `EXTRACTED`
- agents/router.py `EXTRACTED`
- dependencies.py `EXTRACTED`
- tasks/router.py `EXTRACTED`
- credentials/router.py `EXTRACTED`
- seed.py `EXTRACTED`
- blockchain/service.py `EXTRACTED`
- monitoring/router.py `EXTRACTED`
- create-admin.py `EXTRACTED`
- tests/conftest.py `EXTRACTED`
- ledger/router.py `EXTRACTED`

### rationale_for
- Return the active database connection. Raises *RuntimeError* if the database… `EXTRACTED`

### references
- Connection `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*