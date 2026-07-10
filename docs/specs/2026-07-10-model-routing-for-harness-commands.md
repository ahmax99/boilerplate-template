# Spec: Model Routing for Harness Commands

> Status: Draft · 2026-07-10

## Problem / Context

This repo's spec → plan → implement → qa harness (`.claude/commands/*.md`, `.claude/agents/*.md`) mixes reasoning-heavy work (spec-writing, planning) with higher-volume, more mechanical work (implementation, review scoring). Claude Code supports a `model:` frontmatter field on both custom slash commands and subagents that overrides the session's model for that command/agent's execution only (not saved to settings). Right now this repo uses `model:` inconsistently: some reviewer subagents are pinned to `opus` (`correctness-reviewer`, `security-reviewer`, `infra-reviewer`, `cicd-reviewer`), one to `sonnet` (`acceptance-criteria-reviewer`), the `planner` subagent to `opus`, and the commands that run inline in the main loop (`/spec`, `/implement`, `/qa`'s own orchestration, `/plan`'s own dispatch logic) have no `model:` field at all, so they silently inherit whatever model the session happens to be on.

We want a deliberate, consistent split: `/spec` and `/plan` (reasoning-heavy, low-volume) always run on Opus; `/implement` and `/qa` (higher-volume, more mechanical, including `/qa`'s reviewer subagents) always run on Sonnet — regardless of which model the user's interactive session is on.

## Goals

- Invoking `/spec` or `/plan` always executes on the Opus model, independent of the session's current model.
- Invoking `/implement` or `/qa` always executes on the Sonnet model, independent of the session's current model, including every reviewer subagent `/qa` spawns (`security-reviewer`, `correctness-reviewer`, `acceptance-criteria-reviewer`, and conditionally `infra-reviewer` / `cicd-reviewer`).
- The routing is durable and documented, not a one-off runtime instruction — a future contributor reading `.claude/commands/` or `.claude/rules/harness.md` should immediately see which model each command uses.

## Non-Goals

- Changing the model used for ad-hoc conversation, `/review`, `/pre-commit`, `/db-check`, `/design-review`, or any other command not named above.
- Changing `cicd-reviewer`'s standalone "DevOps engineer" dispatch mode (only its `/qa`-spawned review mode is in scope, and it shares the same agent file/model either way).
- Introducing new model tiers or a config system beyond the `model:` frontmatter field Claude Code already supports.

## Requirements

### Functional

- `.claude/commands/spec.md` and `.claude/commands/plan.md` declare `model: opus` in frontmatter.
- `.claude/commands/implement.md` and `.claude/commands/qa.md` declare `model: sonnet` in frontmatter.
- Every subagent `/qa` spawns as a reviewer (`security-reviewer`, `correctness-reviewer`, `acceptance-criteria-reviewer`, `infra-reviewer`, `cicd-reviewer`) has `model: sonnet` in its own frontmatter, since a command's `model:` override does not automatically propagate to subagents it dispatches.
- The `planner` subagent (dispatched by `/plan`) keeps `model: opus`.
- `.claude/rules/harness.md` documents the model each of the four commands runs on, next to its existing description of that command.

### Constraints

- Use only the `model:` frontmatter field already supported by Claude Code for both commands and agents — no new tooling or settings.json changes.
- Preserve every other existing frontmatter field (`name`, `description`, `tools`, `allowed-tools`, etc.) on the touched files — this is an additive change to frontmatter, not a rewrite of the files' bodies/logic.
- `/review`'s reviewer subagents (`security-reviewer`, `correctness-reviewer`) are shared with `/qa` — changing their `model:` field affects both callers; this is accepted (`/review` isn't in scope to keep on Opus, per Non-Goals, but it does inherit the Sonnet change since the agent file is shared).

## Affected Areas

- [ ] `apps/backend-boilerplate` — not touched
- [ ] `apps/nextjs-boilerplate` — not touched
- [x] `.claude/commands/spec.md`, `.claude/commands/plan.md`, `.claude/commands/implement.md`, `.claude/commands/qa.md` — add `model:` frontmatter
- [x] `.claude/agents/security-reviewer.md`, `.claude/agents/correctness-reviewer.md`, `.claude/agents/infra-reviewer.md`, `.claude/agents/cicd-reviewer.md` — change `model: opus` → `model: sonnet`
- [x] `.claude/rules/harness.md` — document the routing

## Acceptance Criteria

- [ ] `.claude/commands/spec.md` has `model: opus` in its frontmatter.
- [ ] `.claude/commands/plan.md` has `model: opus` in its frontmatter.
- [ ] `.claude/commands/implement.md` has `model: sonnet` in its frontmatter.
- [ ] `.claude/commands/qa.md` has `model: sonnet` in its frontmatter.
- [ ] `.claude/agents/planner.md` still has `model: opus`.
- [ ] `.claude/agents/security-reviewer.md`, `.claude/agents/correctness-reviewer.md`, `.claude/agents/infra-reviewer.md`, and `.claude/agents/cicd-reviewer.md` all have `model: sonnet`.
- [ ] `.claude/agents/acceptance-criteria-reviewer.md` still has `model: sonnet` (no change needed, but must not regress).
- [ ] `.claude/rules/harness.md` states the model for `/spec`, `/plan`, `/implement`, and `/qa`.
- [ ] No other frontmatter field or file body content is altered on the touched files.

## Open Questions / Risks

- `infra-reviewer` and `cicd-reviewer` moving from Opus to Sonnet slightly reduces review depth on Terraform/CI diffs, which are lower-frequency but higher-blast-radius changes than typical app code. Accepted per the issue's explicit requirement, but worth flagging in the PR description.
- `security-reviewer` and `correctness-reviewer` are shared between `/qa` and `/review`; `/review` was not asked to move to Sonnet but will inherit the change since the agent files are shared, not duplicated per-command.
