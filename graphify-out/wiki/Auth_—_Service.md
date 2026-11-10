# Auth — Service

> 9 nodes · cohesion 0.22

## Key Concepts

- **verify_password()** (9 connections) — `server/auth/service.py`
- **test_seeded_account_can_authenticate()** (6 connections) — `tests/test_seed.py`
- **test_bcrypt_long_password_truncation_safety()** (4 connections) — `tests/test_security.py`
- **test_bcrypt_password_hashing_and_verification()** (4 connections) — `tests/test_security.py`
- **bcrypt** (3 connections)
- **Verify *plain* against a bcrypt *hashed* value.** (1 connections) — `server/auth/service.py`
- **Password hashing works and handles strings safely.** (1 connections) — `tests/test_security.py`
- **Passwords exceeding 72 bytes are safely truncated to conform with the bcrypt…** (1 connections) — `tests/test_security.py`
- **A seeded community account can log in with the seed password.** (1 connections) — `tests/test_seed.py`

## Relationships

- [Password Hashing & Seed Data](Password_Hashing_&_Seed_Data.md) (7 shared connections)
- [Auth & User Models](Auth_&_User_Models.md) (4 shared connections)
- [Credential Encryption & Agent Tests](Credential_Encryption_&_Agent_Tests.md) (3 shared connections)

## Source Files

- `server/auth/service.py`
- `tests/test_security.py`
- `tests/test_seed.py`

## Audit Trail

- EXTRACTED: 22 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*