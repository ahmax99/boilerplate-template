---
description: Claude Code multi-agent harness — slash commands, hooks, and design principles
globs:
  - '.claude/**'
---

# Claude Code Harness

Multi-agent harness inspired by the generator/evaluator pattern. Slash commands implement specialized agent roles, and a spec → plan → implement → review flow supports spec-driven development.

## Workflow Commands (use in order for a feature)

- `/spec <description>` — Spec agent: captures the *what & why* (problem, requirements, acceptance criteria, non-goals) of a feature and writes it to `docs/specs/<YYYY-MM-DD-slug>.md`. The upstream artifact.
- `/plan <task | path/to/spec.md>` — Planner agent: expands a task or a spec into a detailed implementation plan with ordered steps and acceptance criteria. Writes to `.claude/plans/<YYYY-MM-DD-slug>.md` and records it in the `.claude/plans/.current` pointer file. Use `/plan list` to view all plans and `/plan switch <prefix>` to repoint `.current`.
- `/implement [context]` — Generator agent: implements the current plan step by step, self-checking `bun run check-types` + `bun run check-format` after each step (plus the Terraform gates from `.claude/rules/infra.md` for steps that touch `infra/terraform/**`).
- `/qa [scope]` — QA orchestrator: runs the deterministic gates, then spawns three reviewers in parallel (security, correctness, acceptance-criteria — plus infra when the diff touches `infra/terraform/**`) and synthesizes a scored verdict against the plan's acceptance criteria.

## Unattended loop (optional)

- `/run-backlog [issue-number]` — manual trigger for the `backlog-runner` loop (`.claude/skills/backlog-runner/`, built with `loop-maker`): discovers `ready-for-agent` GitHub issues and orchestrates the same `/spec → /plan → /implement → /qa` commands above, advancing each issue one phase at a time and pausing at human gates (after spec, after plan, before merge). Gate and budget specifics live in `.claude/skills/backlog-runner/HUMAN-GATES.md`, not here.

## Quality Commands

- `/review [files]` — Code-review orchestrator: spawns the security and correctness reviewers (no plan needed). Works on the current branch vs `origin/main`.
- `/pre-commit` — Quick quality gate: Biome (lint + format) + types + a security eyeball before committing.
- `/design-review` — Design-quality review of UI changes: impeccable critique + audit driven through Playwright, reported as Blockers/High/Medium/Nitpicks. Complements `/qa` (which covers code correctness) for any UI-touching branch.
- `/db-check` — Database migration safety: reviews Prisma schema changes for data loss, performance, compatibility, and authz/soft-delete risks.
- `/doctor` — React health triage via the `react-doctor` skill (`.claude/skills/react-doctor/`): scans React code for security, performance, correctness, a11y, and architecture issues (0–100 score) and runs the canonical scan → triage → fix → validate loop. The quick form — `bunx react-doctor@latest --verbose --scope changed` — is also a per-step gate in `/implement` and a Phase 1 gate in `/qa` + `/review` + `/pre-commit` for React-touching diffs. CI mirrors it in `react-doctor.yml` (new errors fail the PR).

## Reviewer subagents (`.claude/agents/`)

- `security-reviewer` — Cognito `auth: true` enforcement, CASL authorization, Zod-at-the-boundary, the BFF rule, secrets, S3 scoping. Emits **Security**.
- `correctness-reviewer` — neverthrow `Result` flow, `AppError` usage, layer boundaries, Prisma queries/transactions, type safety, code quality. Emits **Correctness**, **Architecture**, **Code quality**.
- `acceptance-criteria-reviewer` — walks the plan's acceptance criteria against the diff. Emits **Acceptance criteria**. (`/qa` only — it needs a plan.)
- `infra-reviewer` — Terraform/HCL diffs: IAM least privilege, public exposure, state safety, destructive-change risk, module conventions. Emits **Infrastructure**. (Spawned by `/qa` and `/review` only when the diff touches `infra/terraform/**`.)
- `cicd-reviewer` — GitHub Actions / CI-CD diffs: least-privilege `GITHUB_TOKEN`, action SHA-pinning, expression injection, fork-safety, OIDC usage, concurrency/timeout hygiene, deploy-pipeline invariants, DORA-metric impact. Emits **CI/CD**. (Spawned by `/qa` and `/review` only when the diff touches `.github/**`.) It doubles as a standalone **DevOps engineer** agent — dispatch it directly to audit, improve, or author workflows and DORA instrumentation.

So `/qa` produces five scores from three reviewers (plus Infrastructure and/or CI/CD when the diff touches `infra/terraform/**` or `.github/**`); `/review` produces four (it drops acceptance-criteria; same conditional additions).

## Hooks (automatic)

- Edited/written files are auto-formatted with **Biome** (`auto-format.sh`, PostToolUse).
- `.env` files and other secret-bearing files are protected from reads/edits (`protect-env.sh`); secret literals are blocked from being written.
- Destructive and secret-exfiltrating shell commands are blocked (`protect-destructive.sh`, `protect-bash.sh`).
- On session start, branch + active plan + recent commits are surfaced (`session-start.sh`).
- On stop, a TypeScript check gates the turn from ending with type errors (`stop-typecheck.sh`).

## Design Principles

- Generator and evaluator are separate agents — self-evaluation is unreliable.
- Plans and specs use acceptance criteria — "works correctly" is not testable; "returns 403 when a non-author calls PUT /posts/:id" is.
- File-based inter-agent communication — specs live in `docs/specs/`, plans in `.claude/plans/` (active one named in `.current`), read by the other commands.
- Evaluators are calibrated for skepticism — leniency bias is counteracted with explicit grading anchors.
- Engineering principles live in `.claude/rules/principles.md` (clean code + *A Philosophy of Software Design*); tech-stack docs win on conflict.

## Project commands vs plugin skills

The `.claude/commands/` files are **project-specific orchestrators** — they encode this codebase's conventions (Elysia plugin/controller/service triad, neverthrow `ResultAsync`, Zod at the boundary in `@shared/config`, CASL, the BFF boundary) and delegate to subagents in `.claude/agents/`. Use them when working on this repo.

The enabled plugins (`.claude/settings.json`) are **generic workflows** independent of this codebase. They handle the meta-work *around* implementation and slot into the same pipeline. Rule of thumb: plugins decide *what to build and in what order*; project commands build it *correctly in this codebase*.

Where each plugin fits the spec → plan → implement → review → ship flow:

- **`superpowers:brainstorming`** — shape a fuzzy idea into an agreed design *before* `/spec` captures it. One question at a time, 2–3 approaches with trade-offs.
- **`superpowers:writing-plans`** — the generic small-verifiable-steps discipline the project `planner` builds on; runs behind `/plan`.
- **`feature-dev`** (command + `code-explorer` / `code-architect` agents) — trace how an existing feature works and produce an architecture blueprint before planning a change. Feeds a sharper `/spec`/`/plan`.
- **`impeccable`** — design fluency during `/implement` and review: `/impeccable init` writes per-app `PRODUCT.md`/`DESIGN.md`, `craft`/`shape` build UI, `critique`/`audit`/`polish` review it (45 deterministic anti-pattern rules). Replaces the `frontend-design` plugin (now disabled — impeccable is its superset). The project `app-design` skill (`.claude/skills/app-design/`) wires impeccable + the `shadcn` skill + this repo's component conventions together and sets precedence between them.
- **`superpowers:using-git-worktrees`** — isolate feature work in a worktree during `/implement`.
- **`superpowers:systematic-debugging`** — root-cause loop when `/implement` hits a bug, instead of guess-and-patch.
- **`playwright`** (MCP) — drive a real browser to verify UI / E2E flows. There is **no unit-test runner** in this repo, so browser-level checks are the primary frontend verification.
- **`superpowers:verification-before-completion`** — no "it's done" claims without running the command and showing output. Gates the same turn the Stop type-check hook does.
- **`code-simplifier`** — simplify a working diff for clarity (no behavior change) after `/implement`, before `/qa`.
- **`react-doctor`** (project skill, `.claude/skills/react-doctor/`) — deterministic React scanner complementing the reviewer subagents: they judge against this repo's conventions; it catches framework-level React mistakes (hooks misuse, derived state, a11y, bundle size) with exact rules. Regression-check after React changes; `/doctor` for a full triage pass.
- **`feature-dev:code-reviewer`**, **`superpowers:requesting-code-review`** / **`receiving-code-review`** — general review passes that complement the project's `/qa` + `/review` reviewers.
- **`superpowers:finishing-a-development-branch`** — structured merge / PR / cleanup once QA is green.
- **`context7`** (MCP) — fetch *current* docs for any library (Elysia, Next.js, Prisma, CASL, Zod, Tailwind) instead of relying on the training cutoff. Use anytime; especially before applying an unfamiliar API.
- **`claude-md-management`** (`/revise-claude-md`, `claude-md-improver`) — keep `CLAUDE.md` and the rule files accurate as conventions evolve.
- **`terraform-skill`** (antonbabenko) — generic Terraform/OpenTofu best practice: module design, native `terraform test`, state ops, CI/CD and scan patterns. Triggers automatically on Terraform/HCL work. Repo-specific conventions and the local gates live in `.claude/rules/infra.md`, which wins on conflict; the `infra-reviewer` subagent covers review.
- **`terraform`** (MCP, `.mcp.json`) — HashiCorp's terraform-mcp-server (Docker): authoritative Terraform Registry lookups — provider resource/data-source schemas, module inputs, versions. Use it before writing HCL against an unfamiliar resource, the way `context7` is used for app libraries.
- **`deploy-on-aws`** (MCP: `awsknowledge` / `awsiac` / `awspricing`) — AWS documentation search, IaC validation helpers, and pricing lookups. Use for AWS service questions and cost estimates during infra work; the deploy skills themselves are out of scope (this repo's deployment is already defined in `infra/terraform/`).

For the full developer-facing walkthrough of this flow, see `docs/ai-driven-development.md`.
