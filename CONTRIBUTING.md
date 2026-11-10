# Contributing to ExcbonCP

Thank you for your interest in contributing to ExcbonCP! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Review](#code-review)
- [Testing](#testing)
- [Security](#security)
- [Team Ownership](#team-ownership)

## Getting Started

1. Fork and clone the repository
2. Run `./scripts/setup.sh` to set up your environment
3. Create a feature branch from `main`
4. Make your changes
5. Run tests: `pytest`
6. Submit a pull request

## Branch Naming

Use the following prefixes for branch names:

| Prefix      | Purpose                    | Example                         |
|-------------|----------------------------|---------------------------------|
| `feature/`  | New features               | `feature/mqtt-integration`      |
| `bugfix/`   | Bug fixes                  | `bugfix/auth-token-expiry`      |
| `docs/`     | Documentation changes      | `docs/api-reference`            |
| `refactor/` | Code refactoring           | `refactor/database-layer`       |
| `test/`     | Test additions/fixes       | `test/credential-encryption`    |
| `infra/`    | Infrastructure changes     | `infra/docker-optimization`     |
| `hotfix/`   | Urgent production fixes    | `hotfix/security-patch`         |

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                          |
|------------|--------------------------------------|
| `feat`     | A new feature                        |
| `fix`      | A bug fix                            |
| `docs`     | Documentation only changes           |
| `style`    | Formatting, no code change           |
| `refactor` | Code change that neither fixes nor adds |
| `test`     | Adding or correcting tests           |
| `chore`    | Build process or auxiliary tools     |
| `security` | Security-related changes             |

### Examples

```
feat(auth): add JWT token refresh endpoint

fix(credentials): prevent unmasked secrets in list response

docs(api): update OpenAPI descriptions for health endpoint

security(auth): enforce minimum password length of 12 characters
```

## Pull Request Process

1. **Create a branch** from `main` using the naming convention above
2. **Make changes** in small, focused commits
3. **Write or update tests** for your changes
4. **Run the test suite** locally: `pytest`
5. **Run the linter**: `ruff check .`
6. **Push your branch** and open a pull request
7. **Fill out the PR template** completely
8. **Request review** from the appropriate team member
9. **Address review feedback** promptly
10. **Squash and merge** when approved

### PR Requirements

- All CI checks must pass
- At least one approval from a code owner
- No unresolved conversations
- Tests added or updated as needed
- Documentation updated if public API changes

## Code Review

### For Authors

- Keep PRs small and focused (< 400 lines when possible)
- Provide context in the PR description
- Respond to all review comments
- Don't force-push after review has started

### For Reviewers

- Review within 24 hours when possible
- Be constructive and specific
- Check for security implications
- Verify test coverage
- Run the code locally for significant changes

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=server --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_login_success -v
```

### Testing Guidelines

- Write tests for all new features and bug fixes
- Aim for ≥60% code coverage (enforced by CI)
- Use fixtures from `tests/conftest.py`
- Test both happy path and error cases
- Test security boundaries (access control, input validation)

## Security

### Must Follow

- **Never commit secrets** — use `.env` for local secrets, CI secrets for pipelines
- **Validate all inputs** — especially user-provided data
- **Use parameterized queries** — never string-concatenate SQL
- **Hash passwords** with bcrypt — never store plaintext
- **Encrypt credentials at rest** — use Fernet encryption
- **Check authorization** — verify user roles before operations
- **Review dependencies** — be cautious with new packages

### Security Review Checklist

- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all endpoints
- [ ] Proper authorization checks
- [ ] Rate limiting on sensitive endpoints
- [ ] Error messages don't leak internal details
- [ ] SQL injection prevention
- [ ] XSS prevention (if frontend)

## Team Ownership

| Area                        | Owner     |
|-----------------------------|-----------|
| Architecture & Deployment   | Revand    |
| IoT, MQTT, Sensors          | Bagus     |
| Status Engine, AI, Satellite | Davin    |
| DApp, Maps, UX              | Malik     |

When making changes to a specific area, request review from the area owner.

## Questions?

Open an issue with the `question` label or reach out to the team.
