# ExcbonCP Token & Context Efficiency Protocol

> Engineering guidelines for minimizing redundant model context consumption, preventing prompt bloat, and optimizing per-task AI expenditure.

---

## 1. Principles of Context Efficiency

Unbounded prompt stuffing degrades model reasoning quality, increases task latency, and exhausts team API quotas. ExcbonCP enforces strict context budgeting:

```
Total Context = Task Prompt + Bounded System Directive + Relevant File Slice + Test Results
                └────── Keep < 12k tokens per execution turn whenever feasible ──────┘
```

1. **Modular Root AGENTS.md:** The root index provides concise 2-sentence mission statements and strict directory boundaries rather than inlining entire source code or schemas.
2. **Task-Specific Context Retrieval:** Only files directly touched by a task are loaded into the agent prompt. Never pass entire repository trees or all documentation simultaneously.
3. **Bounded Tool Output:** Terminal commands, test runners, and log outputs must be truncated to the first and last 20–30 relevant lines using `--tb=short`, `head`, `tail`, or ripgrep filters.
4. **Targeted Test Execution:** During iterative agent execution, execute only the specific test module corresponding to the modified code (e.g. `pytest tests/auth/ -k test_login`) rather than executing the entire test suite on every step.

---

## 2. Context Allocation by Agent Role

| Agent Role | Context Budget | Mandatory Context Files | Excluded from Context |
|---|:---:|---|---|
| **Architect** | Medium (~8k) | `docs/architecture/`, `docs/decisions.md` | Low-level firmware C++ code, frontend CSS. |
| **Backend** | Medium (~8k) | `docs/api-reference.md`, `server/config.py`, target file | Firmware files, DApp styling, satellite assets. |
| **Frontend** | Medium (~8k) | `docs/models/DAPP_FLOWCHART.md`, target component | Python backend internals, ESP32 headers. |
| **IoT** | Low (~4k) | `src/firmware/`, MQTT schema definitions | Web frontend, EAS contracts, Python server. |
| **Data / AI** | Medium (~8k) | Target ML/NDVI module, baseline data sample | Firmware C++ source, Solidity contracts. |
| **Blockchain** | Low (~5k) | `contracts/`, `docs/contract.md` | Frontend CSS, ESP32 sensor calibration. |
| **Security** | High (~12k) | `docs/security/`, target module under audit | Binary files, large datasets. |
| **Reviewer** | Medium (~8k) | `git diff`, test suite output, PR description | Unchanged codebase files. |

---

## 3. Metrics & Baseline Tracking

To measure actual token efficiency without fabricating savings, the central server records the following metrics in task audit logs:

| Metric | Measurement Method | Target Baseline |
|---|---|---|
| **Tokens per Completed Task** | Extracted from provider response metadata when available. | Baseline under evaluation per model. |
| **Redundant File Reads** | Count of repeated reads of identical file paths within a single task turn. | 0 redundant reads. |
| **Agent Invocations per Task** | Number of sequential agent turns required to complete a task. | $\le 3$ turns. |
| **Test Failures per Task** | Count of intermediate failed test runs before success. | $\le 2$ iterations. |
| **Total Task Duration** | Wall-clock execution time from `pending` to `completed`. | $< 60$ seconds for standard modules. |

---

## 4. Verification & Best Practices
- Never include `.env` or large `.db` files in prompt context.
- Always use specific symbol and line references rather than dumping whole files.
- Prefer diff patches for review rather than re-reading entire files.
