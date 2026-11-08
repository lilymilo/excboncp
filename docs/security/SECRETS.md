# ExcbonCP Secrets Management

> Policies and procedures for generation, storage, encryption at rest, injection, and rotation of system secrets and AI provider credentials.

---

## 1. Classification of Secrets

| Secret Category | Description | Storage Location | Protection Mechanism |
|---|---|---|---|
| **JWT Signing Secret (`JWT_SECRET`)** | Used to sign and verify HMAC-SHA256 authentication tokens. | `.env` (server environment variable) | High-entropy random token (minimum 48-64 bytes urlsafe base64). |
| **Credential Encryption Key (`CREDENTIAL_ENCRYPTION_KEY`)** | 32-byte AES key used by Fernet to encrypt/decrypt per-user AI API keys. | `.env` (server environment variable) | Standard URL-safe base64-encoded 32-byte key. Accessible only by the central server process. |
| **User Passwords** | Local user authentication credentials. | `users` SQLite table | Salted bcrypt hash with work factor 12. Plaintext passwords are never stored or logged. |
| **User AI Provider API Keys** | OpenAI, Anthropic, Gemini, Groq, Mistral, and custom provider tokens. | `credentials` SQLite table | Encrypted at rest via Fernet. Decrypted strictly in memory for authorized task invocation. |
| **Blockchain Private Keys / RPC URLs** | Testnet deployer keys for Base Sepolia EAS attestations. | Hardware wallet / external secret vault | Never stored on the central development server. Human approval mandatory for all on-chain transactions. |

---

## 2. Encryption at Rest (Fernet Architecture)

Per-user API keys are encrypted at rest using Fernet (AES-128-CBC with PKCS7 padding and HMAC-SHA256 authentication).

```python
# server/credentials/service.py
from cryptography.fernet import Fernet

def _get_fernet() -> Fernet:
    return Fernet(settings.CREDENTIAL_ENCRYPTION_KEY.encode())

def encrypt_api_key(raw_key: str) -> str:
    return _get_fernet().encrypt(raw_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    return _get_fernet().decrypt(encrypted_key.encode()).decode()
```

### Invariants:
1. **Never Log:** The decrypted secret key must never appear in `logger` messages, exception tracebacks, or audit log entries.
2. **Never Return to Frontend:** The API only exposes masked representations (e.g. `sk-ant-api03-****`).
3. **Never Share Across Users:** Database queries always enforce `WHERE user_id = ? AND id = ?`.

---

## 3. Secret Generation

System administrators generate cryptographic secrets using the provided utility:

```bash
# Generate high-entropy secrets for .env
python3 scripts/generate-secrets.py
```

This outputs pre-validated values for `JWT_SECRET` and `CREDENTIAL_ENCRYPTION_KEY` ready to be copied into `.env`.

---

## 4. Key Rotation Procedures

### 4.1 JWT Secret Rotation
1. Update `JWT_SECRET` in `.env`.
2. Restart the server (`./scripts/start-server.sh`).
3. Existing active sessions will expire and require team members to log in again.

### 4.2 Credential Encryption Key Rotation
When rotating `CREDENTIAL_ENCRYPTION_KEY`:
1. Generate new key: `NEW_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")`.
2. Re-encrypt all records in `credentials` table:
   - Read record with current key $\rightarrow$ decrypt.
   - Encrypt with new key $\rightarrow$ update database record.
3. Update `.env` with `NEW_KEY`.
4. Restart central server.

---

## 5. Accidental Exposure Prevention

1. **Git Isolation:** `.env`, `*.pem`, `*.key`, `*.sqlite`, `*.db`, and `credentials.json` are strictly ignored in `.gitignore`.
2. **Pre-commit & CI:** Gitleaks runs on every pull request and push to block commits containing entropy matching known secret patterns.
3. **No Global Fallback:** If a user does not have a configured AI key for an agent, the task fails with an explicit error prompting them to configure their credential rather than falling back to a shared system key.
