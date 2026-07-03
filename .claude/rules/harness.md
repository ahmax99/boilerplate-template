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
- `/implement [context]` — Generator agent: implements the current plan step by step, self-checking `bun run check-types` + `bun run check-format` after each step.
- `/qa [scope]` — QA orchestrator: runs the deterministic gates, then spawns three reviewers in parallel (security, correctness, acceptance-criteria) and synthesizes a scored verdict against the plan's acceptance criteria.

## Quality Commands

- `/review [files]` — Code-review orchestrator: spawns the security and correctness reviewers (no plan needed). Works on the current branch vs `origin/main`.
- `/pre-commit` — Quick quality gate: Biome (lint + format) + types + a security eyeball before committing.
- `/design-review` — Design-quality review of UI changes: impeccable critique + audit driven through Playwright, reported as Blockers/High/Medium/Nitpicks. Complements `/qa` (which covers code correctness) for any UI-touching branch.
- `/db-check` — Database migration safety: reviews Prisma schema changes for data loss, performance, compatibility, and authz/soft-delete risks.

## Reviewer subagents (`.claude/agents/`)

- `security-reviewer` — Cognito `auth: true` enforcement, CASL authorization, Zod-at-the-boundary, the BFF rule, secrets, S3 scoping. Emits **Security**.
- `correctness-reviewer` — neverthrow `Result` flow, `AppError` usage, layer boundaries, Prisma queries/transactions, type safety, code quality. Emits **Correctness**, **Architecture**, **Code quality**.
- `acceptance-criteria-reviewer` — walks the plan's acceptance criteria against the diff. Emits **Acceptance criteria**. (`/qa` only — it needs a plan.)

So `/qa` produces five scores from three reviewers; `/review` produces four (it drops acceptance-criteria).

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
- **`feature-dev:code-reviewer`**, **`superpowers:requesting-code-review`** / **`receiving-code-review`** — general review passes that complement the project's `/qa` + `/review` reviewers.
- **`superpowers:finishing-a-development-branch`** — structured merge / PR / cleanup once QA is green.
- **`context7`** (MCP) — fetch *current* docs for any library (Elysia, Next.js, Prisma, CASL, Zod, Tailwind) instead of relying on the training cutoff. Use anytime; especially before applying an unfamiliar API.
- **`claude-md-management`** (`/revise-claude-md`, `claude-md-improver`) — keep `CLAUDE.md` and the rule files accurate as conventions evolve.
- **`terraform`** — enabled but out of scope for app development; ignore unless touching `infra/`.

For the full developer-facing walkthrough of this flow, see `docs/ai-driven-development.md`.
