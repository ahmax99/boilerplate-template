# AI-Driven & Spec-Driven Development

This boilerplate ships with a [Claude Code](https://claude.com/claude-code) harness so you can build features *with* an AI agent instead of just chatting at it. 

You don't need to read the harness internals to use it. Just learn the pipeline below and the order to run it in.

## The idea in one minute

**Spec-driven development** means you write down *what* you want and *how you'll
know it's done* (acceptance criteria) **before** any code is written. **AI-driven development** means an agent does the typing, while you review the idea, the spec, the plan, and the diff at each gate.

These combine into a simple pipeline. Each step writes a file (or a shared
understanding) that the next step reads, so the agent never loses the thread:

```
  brainstorm  ──►  /spec  ──►  /plan  ──►  /implement  ──►  /qa  ──►  ship
  shape the        what &      ordered     write the        scored    merge
  idea             why         steps       code             review    / PR
  (optional)
```

- **Brainstorm** *(optional, for fuzzy ideas)* — talk the idea through with the agent before committing to a spec: purpose, constraints, trade-offs, 2–3
  approaches. This is the `superpowers:brainstorming` skill; its output feeds `/spec`. Skip it when the requirement is already clear.
- **`/spec`** captures the problem, goals, non-goals, and **testable acceptance criteria**. Output: `docs/specs/<date>-<slug>.md`.
- **`/plan`** turns a spec (or a one-line task) into ordered implementation steps.
  Output: `.claude/plans/<date>-<slug>.md`, tracked as the active plan in
  `.claude/plans/.current`.
- **`/implement`** works the plan step by step, self-checking types and formatting as it goes.
- **`/qa`** runs the gates and three reviewers (security, correctness,
  acceptance-criteria) and scores the work against the plan.
- **Ship** — once QA is green, the `superpowers:finishing-a-development-branch` skill walks you through the merge / PR / cleanup decision.

Why bother instead of one big prompt? Because "make it work" isn't checkable, but *"returns 403 when a non-author calls `PUT /posts/:id`"* is. Acceptance criteria are what let the agent — and you — know the feature is actually done.

## Quick start

Open Claude Code in the repo root and build your first feature:

```text
1.  /spec add a "favorite a post" feature for logged-in users
        → review docs/specs/2026-06-13-favorite-a-post.md, edit anything off.

2.  /plan docs/specs/2026-06-13-favorite-a-post.md
        → review the ordered steps and acceptance criteria.

3.  /implement
        → the agent writes code, running `bun run check-types` and
          `bun run check-format` after each step.

4.  /qa
        → read the scored verdict. Address any FAIL/UNVERIFIABLE criteria,
          then re-run if needed.
```

You stay in the loop at every arrow: approve the spec before planning, approve the plan before implementing, and read the QA verdict before committing.

> **Lighter-weight tasks.** For a small change you don't need the full pipeline.
> Jump straight to `/plan "<task>"` and `/implement`, or just describe the change.
> The spec step earns its keep on features with real requirements and edge cases.

## Quality commands (use any time)

These don't need a spec or plan — run them on whatever you've changed:

- **`/review [files]`** — spawns the security + correctness reviewers against the current branch vs. `origin/main`. Four scores, no plan required.
- **`/pre-commit`** — fast gate before committing: Biome (lint + format) + types + a security eyeball. Also nudges toward a [Conventional Commits](https://www.conventionalcommits.org) message.
- **`/db-check`** — reviews Prisma schema/migration changes for data loss,
  performance, compatibility, and authz/soft-delete risks. Run it whenever you touch `shared/neon/prisma/`.
- **`/doctor`** — full React health triage via [react-doctor](https://github.com/millionco/react-doctor): scans for security, performance, correctness, and accessibility issues with a 0–100 score, then walks a scan → triage → fix → validate loop. The quick regression check (`npx react-doctor@latest --scope changed`) already runs inside `/implement`, `/pre-commit`, `/review`, and `/qa` for React-touching changes — and in CI on every PR, where new errors fail the build.

## Plugin skills that supercharge each phase

The project commands above are *codebase-specific* orchestrators. This template also enables a set of general-purpose Claude Code plugins — they handle the *meta-work around* implementation and slot into the same pipeline. You rarely invoke them by name; the agent reaches for them when the situation fits. Knowing they exist helps you ask for them.

| Phase | Plugin / skill | What it adds |
|-------|----------------|--------------|
| Brainstorm | `superpowers:brainstorming` | Structured dialogue to turn a fuzzy idea into an agreed design *before* `/spec`. One question at a time, 2–3 approaches with trade-offs. |
| Spec → Plan | `feature-dev` (`code-explorer`, `code-architect`) | Before planning a change to existing code, trace how the current feature works and get an architecture blueprint. Feeds a sharper `/plan`. |
| Plan | `superpowers:writing-plans` | The generic plan-writing discipline (small verifiable steps) that the project `planner` builds on. |
| Implement (UI) | `impeccable` + project `app-design` skill | Distinctive, production-grade UI. `/impeccable init` defines a per-app `PRODUCT.md`/`DESIGN.md` (optionally seeded from an [awesome-design-md](https://github.com/voltagent/awesome-design-md) reference); `craft`/`shape` build, `critique`/`audit`/`polish` review. The `app-design` skill (`.claude/skills/app-design/`) sets precedence between impeccable, the `shadcn` skill, and this repo's component rules. |
| Implement (isolation) | `superpowers:using-git-worktrees` | Isolates feature work in a separate worktree so it doesn't disturb your main checkout. |
| Implement (stuck) | `superpowers:systematic-debugging` | A disciplined find-the-root-cause loop instead of guess-and-patch when something breaks. |
| Verify | `playwright` (MCP) | Drives a real browser to verify UI and end-to-end flows. This repo has **no unit-test runner**, so browser-level verification is how you confirm the frontend actually works. |
| Verify | `superpowers:verification-before-completion` | Forbids "it's done" claims without running the command and showing the output. Evidence before assertions. |
| Review | `code-simplifier` | After the diff works (but before `/qa`), simplifies the just-written code for clarity without changing behavior. |
| Review (React) | `react-doctor` skill (`/doctor`) | Deterministic React scanner — hooks misuse, derived state, a11y, bundle size — complementing the convention-focused reviewers. Regression-checked automatically in `/implement`/`/qa`; `/doctor` runs the full triage loop. |
| Review | `feature-dev:code-reviewer`, `superpowers:requesting-code-review` | General-purpose review passes that complement the project's `/qa` + `/review` reviewers. |
| Ship | `superpowers:finishing-a-development-branch` | Structured merge / PR / cleanup options once the work is complete and green. |
| Anytime | `context7` (MCP) | Fetches **current** docs for any library (Elysia, Next.js 16, Prisma, CASL, Zod, Tailwind 4). Use it instead of relying on the model's training cutoff. |
| Maintenance | `claude-md-management` (`/revise-claude-md`) | Audits and improves `CLAUDE.md` / the rule files as the project's conventions evolve, keeping the agent's context accurate. |

> **Project commands vs. plugins, in one line:** plugins decide *what to build and
> in what order*; the `/spec`→`/plan`→`/implement`→`/qa` commands build it
> *correctly in this codebase*. The `terraform` plugin is enabled but out of scope
> for app development — ignore it unless you're touching `infra/`.

## What keeps the agent on the rails

The agent isn't guessing how this codebase works — it reads a set of rule files on every task. You generally won't edit these, but it helps to know they exist:

| File | What it encodes |
|------|-----------------|
| `CLAUDE.md` | Entry point: commands, the hard rules, and imports of the rules below. |
| `.claude/rules/architecture.md` | *Where things live* — the Elysia plugin/controller/service triad, the Next.js BFF boundary, the shared packages. |
| `.claude/rules/conventions.md` | *How to write code here* — validation at the boundary, the neverthrow `Result` flow, auth/CASL, exports. |
| `.claude/rules/principles.md` | *Why* — clean-code + *A Philosophy of Software Design*. (Tech-stack docs win on conflict.) |
| `.claude/rules/code-review.md` | The checklist the reviewers grade against. |

Two safety nets run automatically while you work: edited files are auto-formatted with Biome, secret-bearing files and destructive shell commands are blocked, and a type-check gates the end of each turn. You don't invoke these — they just run.

## Where artifacts live

```
docs/specs/                  ← specs from /spec  (committed; the "what & why")
.claude/plans/               ← plans from /plan  (git-ignored; working notes)
.claude/plans/.current       ← pointer to the active plan
```

Specs are committed because they document intent for the whole team. Plans are git-ignored working notes — use `/plan list` to see them and `/plan switch <prefix>` to change which one is active.

## Tips

- **Edit the spec and plan freely.** They're just Markdown. Fix a wrong assumption before `/implement` rather than after.
- **Make acceptance criteria concrete.** "Validates input" is weak; "returns 422 with a Zod error when `title` is empty" is gradable.
- **Let `/qa` be skeptical.** The reviewers are tuned to push back. A FAIL is cheaper to fix now than in review.
- **One feature per pipeline.** Keep specs and plans focused — small, shippable slices review better and the agent stays accurate.

For the harness internals (subagents, hooks, the generator/evaluator design), see `.claude/rules/harness.md`.
