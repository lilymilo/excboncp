# get_current_user()

> God node · 17 connections · `server/auth/dependencies.py`

**Community:** [FastAPI Auth Dependencies](FastAPI_Auth_Dependencies.md)

## Connections by Relation

### calls
- [get_db()](get_db.md) `EXTRACTED`
- get_user_by_id() `EXTRACTED`
- register() `EXTRACTED`
- decode_access_token() `EXTRACTED`
- is_session_active() `EXTRACTED`
- _extract_token() `EXTRACTED`

### contains
- dependencies.py `EXTRACTED`

### imports
- auth/router.py `EXTRACTED`
- blockchain/router.py `EXTRACTED`
- agents/router.py `EXTRACTED`
- tasks/router.py `EXTRACTED`
- credentials/router.py `EXTRACTED`
- monitoring/router.py `EXTRACTED`

### rationale_for
- FastAPI dependency — resolve the authenticated user from the JWT. Also verifies… `EXTRACTED`

### references
- Request `EXTRACTED`

### uses
- [UserResponse](UserResponse.md) `INFERRED`
- TokenPayload `INFERRED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*