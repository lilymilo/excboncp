# Authentication & RBAC Test Suite

> 21 nodes · cohesion 0.13

## Key Concepts

- **test_auth.py** (12 connections) — `tests/test_auth.py`
- **TestClient** (8 connections)
- **test_get_current_user_profile()** (3 connections) — `tests/test_auth.py`
- **test_login_invalid_password()** (3 connections) — `tests/test_auth.py`
- **test_login_success()** (3 connections) — `tests/test_auth.py`
- **test_logout_revokes_token()** (3 connections) — `tests/test_auth.py`
- **test_member_cannot_update_roles()** (3 connections) — `tests/test_auth.py`
- **test_owner_can_update_user_role()** (3 connections) — `tests/test_auth.py`
- **test_register_first_user_is_owner()** (3 connections) — `tests/test_auth.py`
- **test_register_second_user_is_member()** (3 connections) — `tests/test_auth.py`
- **Run specific test** (2 connections) — `CONTRIBUTING.md`
- **Run specific test file** (2 connections) — `CONTRIBUTING.md`
- **Tests for ExcbonCP Authentication, Session Management, and RBAC.** (1 connections) — `tests/test_auth.py`
- **Profile endpoint returns details of the currently authenticated user.** (1 connections) — `tests/test_auth.py`
- **Owner can change user roles.** (1 connections) — `tests/test_auth.py`
- **Non-owner (member) receives 403 Forbidden when attempting user administration.** (1 connections) — `tests/test_auth.py`
- **Logout invalidates the session token.** (1 connections) — `tests/test_auth.py`
- **Subsequent registrations by an owner produce users with 'member' role.** (1 connections) — `tests/test_auth.py`
- **Valid credentials return a signed JWT access token.** (1 connections) — `tests/test_auth.py`
- **Invalid credentials return 401 Unauthorized.** (1 connections) — `tests/test_auth.py`
- **The very first registered user must automatically receive the 'owner' role.** (1 connections) — `tests/test_auth.py`

## Relationships

- [Contribution Guidelines](Contribution_Guidelines.md) (2 shared connections)
- [Credential Encryption & Agent Tests](Credential_Encryption_&_Agent_Tests.md) (1 shared connections)

## Source Files

- `CONTRIBUTING.md`
- `tests/test_auth.py`

## Audit Trail

- EXTRACTED: 30 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*