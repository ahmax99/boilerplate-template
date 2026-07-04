---
description: Code review checklist and quality gates to enforce during reviews
---

# Code Review Priorities

The full, calibrated review checklists live with the reviewer subagents that enforce them — each dimension has exactly one owner:

- `.claude/agents/security-reviewer.md` — auth (`auth: true`), CASL enforcement, Zod-at-the-boundary, the BFF rule, injection, secrets, S3 scoping.
- `.claude/agents/correctness-reviewer.md` — the neverthrow `Result` flow, layer boundaries (logic in services, thin controllers), Prisma queries/transactions/pagination, type safety (`any` is a Biome error), atomic-design and feature-folder placement, code style rules.
- `.claude/agents/infra-reviewer.md` — Terraform: IAM least-privilege, state safety, destructive-change risk, `.claude/rules/infra.md` conventions.
- `.claude/agents/acceptance-criteria-reviewer.md` — plan-vs-diff verification (`/qa` only).

When reviewing outside those agents (an ad-hoc look at a diff), apply the same sources: the rule files for conventions, and remember dead code / duplication / complexity are flagged automatically by **fallow** (local, `.fallowrc.json`) and **SonarQube** (CI) — they map to `principles.md` ("complexity is the enemy").
