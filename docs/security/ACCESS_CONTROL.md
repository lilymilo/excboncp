# ExcbonCP Access Control & Authorization

> Server-side Role-Based Access Control (RBAC), user permissions matrix, and agent boundary policies.

---

## 1. Identity & Role Hierarchy

ExcbonCP defines three system roles with strict privilege separation:

1. **Owner (`owner`):**
   - Held initially by **Revand** (Project Owner & Architecture Lead).
   - Full administrative control: user role assignment, user activation/deactivation, global server configurations, task deletion, audit log inspection.
2. **Member (`member`):**
   - Assigned to active team members (**Bagus**, **Davin**, **Malik**).
   - Operational rights: task creation, execution of authorized agents, viewing shared documentation, managing their own AI provider credentials.
3. **Auditor (`auditor`):**
   - Independent inspection role for verification and compliance review.
   - Read-only access to tasks, parcels, ledger, audit logs, and on-chain attestation workflows.

---

## 2. Permissions Matrix

| Capability / Resource | Owner | Member | Auditor | Enforcement Mechanism |
|---|:---:|:---:|:---:|---|
| **View Shared Documentation & Models** | Yes | Yes | Yes | Unrestricted / Public |
| **View System Status & Health** | Yes | Yes | Yes | `get_current_user` / `/api/health` |
| **List Available Agents** | Yes | Yes | Yes | `get_current_user` |
| **Create & Execute Agent Tasks** | Yes | Yes | No | `require_role(["owner", "member"])` |
| **Manage Own AI Credentials** | Yes | Yes | No | Filtered by authenticated `user_id` |
| **View Another User's Credentials** | **NEVER** | **NEVER** | **NEVER** | Cryptographic & SQL `user_id` barrier |
| **View Audit Logs** | Yes | No | Yes | `require_role(["owner", "auditor"])` |
| **Modify User Roles & Status** | Yes | No | No | `require_owner()` dependency |
| **Delete Tasks** | Yes | No | No | `require_owner()` dependency |
| **Approve EAS On-Chain Attestation** | Yes | No | Yes | Dual-sign verification requirement |
| **Deploy to Production** | Explicit Approval | No | No | Out-of-band human sign-off |

---

## 3. Server-Side Enforcement Architecture

All authorization is verified server-side on every request using FastAPI dependency injection. Client-side state or claims are never trusted for authorization decisions.

```python
# Pattern: server/auth/dependencies.py


async def require_role(allowed_roles: list[str]):
    async def role_checker(user: UserResponse = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {allowed_roles}",
            )
        return user

    return role_checker


def require_owner():
    return require_role(["owner"])
```

---

## 4. Per-User AI Credential Isolation

To guarantee financial and data independence between team members:
1. **Zero Sharing:** No central shared API key is used as a fallback for agents.
2. **Strict Ownership:** Every API endpoint querying or updating credentials explicitly joins on `user_id = current_user.id`.
3. **Masked Egress:** GET endpoints return only the display label, provider type, and registration timestamp. The secret key is never included in HTTP response payloads.
4. **Execution Injection:** When an agent task executes, the decrypted credential is temporarily loaded into memory solely for that task process and immediately cleared afterward.

---

## 5. Agent Execution Directory Boundaries

Agents operate under least-privilege directory boundaries:

| Agent | Allowed Directories | Restricted Directories | Allowed Provider(s) |
|---|---|---|---|
| **Architect** | `docs/`, `config/`, `scripts/` | `src/firmware/`, `src/dapp/`, `contracts/`, `credentials/` | Anthropic, Custom |
| **Backend** | `src/api/`, `src/core/`, `src/db/`, `tests/` | `src/firmware/`, `src/dapp/`, `contracts/`, `credentials/` | Anthropic, OpenAI, Custom |
| **Frontend** | `src/dapp/`, `public/`, `tests/e2e/` | `src/api/`, `src/firmware/`, `contracts/`, `credentials/` | OpenAI, Anthropic, Custom |
| **IoT** | `src/firmware/`, `tests/firmware/`, `config/mqtt/` | `src/api/`, `src/dapp/`, `contracts/`, `credentials/` | Anthropic, OpenAI, Custom |
| **Data / AI** | `src/ai/`, `src/satellite/`, `tests/ai/`, `data/` | `src/firmware/`, `src/dapp/`, `contracts/`, `credentials/` | OpenAI, Anthropic, Gemini, Custom |
| **Blockchain** | `contracts/`, `src/blockchain/`, `tests/blockchain/` | `src/firmware/`, `src/dapp/`, `src/api/`, `credentials/` | Anthropic, OpenAI, Custom |
| **Security** | Read: `*`, Write: `docs/security/`, `tests/security/` | Write: all other directories; `credentials/` | Anthropic, Custom |
| **Reviewer** | Read: `*`, Write: `tests/`, `docs/` | Write: `src/`, `contracts/`, `credentials/` | Anthropic, Custom |
