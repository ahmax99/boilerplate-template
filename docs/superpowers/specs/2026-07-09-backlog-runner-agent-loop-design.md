# Backlog-runner agent loop — design

**Date:** 2026-07-09
**Status:** Approved, ready for planning
**Built with:** `loop-maker` (`.claude/skills/loop-maker`)

## Problem

This repo's AI-driven dev pipeline (`brainstorm → /spec → /plan → /implement → /qa → ship`, documented in `docs/ai-driven-development.md` and `.claude/rules/harness.md`) is entirely manual: a human runs each command and approves each gate. There's no way to point the agent at a backlog of small, well-scoped tasks and have it work through them unattended, while still keeping a human in the loop wherever the cost of a mistake is high.

## Goal

A self-running loop — `backlog-runner` — that discovers ready GitHub issues, drives each one through `/spec → /plan → /implement → /qa`, and opens a PR for merge, pausing for explicit human approval at the points where an autonomous mistake would be expensive (after spec, after plan, before merge), and escalating to a human on any anomaly.

## Non-goals

- Not a scheduler/cron system — triggered manually via `/run-backlog`.
- Not a merge bot — the loop never merges a PR.
- Not a replacement for `/spec`/`/plan`/`/implement`/`/qa` — it orchestrates the existing commands, it doesn't reimplement their logic.
- Not parallel — one invocation advances up to 3 issues, each one phase at a time, sequentially. (Considered an "orchestrator-workers" parallel variant; rejected because the approval gates already throttle throughput enough that concurrency buys little for the added complexity — see Alternatives.)

## The 7-question blueprint (loop-maker)

| # | Question | Answer |
|---|---|---|
| 1 | Goal | An issue's PR is merged (closes the issue). Per-phase: the phase's deterministic check passes (see Verification). |
| 2 | Trigger | Manual: `/run-backlog`. No cron/webhook. |
| 3 | Discovery | `gh issue list --label ready-for-agent` plus any issue currently mid-flight (see State). |
| 4 | Action | Run exactly one phase (`/spec`, `/plan`, `/implement`+`/qa`, or `gh pr create`) for each of up to 3 advanceable issues, each in its own git worktree. |
| 5 | Verification | Separate deterministic script parses `/qa`'s report; exits 0 only if every score ≥4 and no FAIL/UNVERIFIABLE acceptance-criteria row. |
| 6 | State | Two-tier — durable queue state as GitHub issue labels/comments; ephemeral per-issue counters as a gitignored file inside that issue's worktree. |
| 7 | Human gates | After spec, after plan, before merge, and on any anomaly (see Human gates). |

**Durable knowledge:** none beyond what's already in `CLAUDE.md` / `.claude/rules/*` — the skill leans on the same rule files every other command reads, no separate knowledge skill needed.

**Budget:** max 3 issues advanced per invocation; max 3 qa-retry cycles per issue before auto-blocking. No wall-clock/time cap (see Budget section) — deliberate, not an oversight.

## Architecture

```
/run-backlog  (.claude/commands/run-backlog.md — thin entry point)
     │
     ▼
backlog-runner skill (.claude/skills/backlog-runner/SKILL.md — durable logic, read fresh each run)
     │  discovers advanceable issues via gh issue list + label state
     ▼
for up to 3 advanceable issues (sequential):
     │  advance exactly one phase, inside that issue's worktree
     │  phase result → scripts/verify_qa_gate.sh (deterministic) → pass/fail
     ▼
write state back: update GitHub issue label(s) + post a comment
```

Chosen pattern: **ReAct + deterministic verifier** (loop-maker's default) — one workstream per issue, "done" for each phase is a program-checkable predicate, not a model's opinion.

## State model

### Durable (GitHub issue labels + comments)

| Label | Meaning |
|---|---|
| `ready-for-agent` | Queued, not yet picked up. |
| `agent:spec-pending-approval` | Spec drafted and posted as a comment; waiting on a human. |
| `agent:plan-pending-approval` | Plan drafted and posted as a comment; waiting on a human. |
| `agent:implementing` | Approved past plan; `/implement` → `/qa` cycle active in the worktree. |
| `agent:qa-retry` | `/qa` failed the gate; a fix-and-retry pass is queued. |
| `agent:pr-open` | PR opened; final human gate is the merge itself. |
| `agent:blocked` | Escalated (anomaly or retries exhausted). Skipped by discovery until a human clears it. |
| `agent:approved` | Human-added signal that unblocks whichever `*-pending-approval` phase the issue is in. Consumed (removed) by the skill on the run that acts on it. |

A human clears a `-pending-approval` phase by adding `agent:approved` — a checkable label, not a parsed free-text comment, matching loop-maker's "a vibe won't work; a checkable predicate will."

**Discovery priority each invocation:**
1. `agent:approved` issues (resume, highest priority)
2. `agent:qa-retry` issues (continue fix loop)
3. `agent:implementing` issues with no retry flag (resume — a previous run likely died mid-phase; treated as resumable, not an error)
4. `ready-for-agent` issues, oldest first (start a new worktree)

Issues sitting in a `-pending-approval` state or `agent:blocked` (without `agent:approved`) are skipped and don't count against the 3-issue budget.

### Ephemeral (per-issue worktree file, gitignored)

`.agent-state.json` at the root of `../wt-issue-<n>`:
```json
{ "issue": 42, "phase": "qa-retry", "qa_retries": 2, "branch": "agent/issue-42" }
```
Holds the qa-retry counter and worktree bookkeeping. Disappears automatically when the worktree is removed — no stale counter to reset by hand.

## Per-phase actions

| Current label | Action | Next label |
|---|---|---|
| `ready-for-agent` | `git worktree add ../wt-issue-<n> -b agent/issue-<n>`; run `/spec` from the issue title+body; post the spec as a comment | `agent:spec-pending-approval` |
| `agent:approved` (was spec-pending) | Run `/plan docs/specs/<spec>.md` in the worktree; post the plan as a comment | `agent:plan-pending-approval` |
| `agent:approved` (was plan-pending) | Run `/implement`, then `/qa`; pipe output through the verifier | `agent:pr-open` (pass) / `agent:qa-retry` (fail, retries<3) / `agent:blocked` (fail, retries=3) |
| `agent:qa-retry` | `/implement "fix: <qa findings>"`, re-run `/qa`, verifier again | same branching as above |
| `agent:pr-open` (on pass) | `gh pr create` from the branch, referencing the issue | *(terminal for the loop)* |

Each invocation advances a given issue by exactly one phase — spec and plan are never chained past their approval gates in the same run.

## Verification

`scripts/verify_qa_gate.sh` — deterministic, not model self-grading:

```bash
#!/usr/bin/env bash
# Usage: verify_qa_gate.sh <qa-output-file>
# Exit 0 = gate passes (all scores >=4, zero FAIL/UNVERIFIABLE) ; 1 = gate fails.
set -euo pipefail
qa_file="$1"
scores=$(grep -oE '[0-9]/5' "$qa_file" | cut -d/ -f1)
if echo "$scores" | grep -qE '^[1-3]$'; then exit 1; fi
if grep -qiE '\|\s*(FAIL|UNVERIFIABLE)\s*\|' "$qa_file"; then exit 1; fi
exit 0
```

The grep patterns must be checked against the actual `/qa` report format (`.claude/commands/qa.md`, `.claude/agents/*-reviewer.md`) during implementation — this is a first draft, not verified against real output yet.

## Human gates (`HUMAN-GATES.md`)

1. **Pre-plan gate** — spec posted as a comment; requires `agent:approved` to proceed. Nothing is written to code yet.
2. **Pre-implement gate** — plan posted as a comment; requires `agent:approved` to proceed. This is the practical "first live run" gate, since `/implement` is the first step that writes code.
3. **Pre-merge gate** — PR opened; a human merges or closes it. The loop never merges.
4. **Anomaly gate → `agent:blocked`**, triggered by any of:
   - `/qa` gate still failing after 3 retries.
   - The diff touches `infra/terraform/**` — always blocked regardless of qa score, per `.claude/rules/infra.md`'s existing rule against unattended state changes.
   - Scope drift: the worktree's `git diff --stat` touches files not named in the plan's acceptance criteria.
   - Any non-deterministic failure (crash/tool error, not a qa fail) — blocked, never silently retried.

   Blocking always removes the in-progress phase label, adds `agent:blocked`, and posts a comment naming which condition tripped.

## Budget

- Max **3 issues advanced** per `/run-backlog` invocation (issues in `-pending-approval` or `agent:blocked` don't count against this cap).
- Max **3 qa-retry cycles** per issue before auto-blocking.
- No wall-clock/cost cap. Deliberate: throughput is already bounded by the 3-issue cap and by human approval cadence; a time box would add complexity without changing behavior in practice.

## File layout

```
.claude/
  commands/
    run-backlog.md          # thin entry point, invokes the skill
  skills/
    backlog-runner/
      SKILL.md              # durable orchestration logic (loop-maker output)
      HUMAN-GATES.md         # gates + budget, from this design
      TRIGGER.md             # documents the manual /run-backlog contract
      scripts/
        verify_qa_gate.sh    # deterministic verifier
```

No new durable "knowledge" skill is needed — `backlog-runner` reads the same `.claude/rules/*` every other command already reads.

## Alternatives considered

- **Hand-rolled orchestrator command, no loop-maker artifacts.** Fastest to build, but skips loop-maker (the tool this design exists to exercise) and its forced separation of a deterministic verifier from model judgment — we'd end up eyeballing `/qa` scores inline.
- **Full loop-maker scaffold, Orchestrator-workers pattern (parallel dispatch of up to 3 issues).** Matches loop-maker's shape for genuinely parallel work, but the approval gates after spec and after plan already throttle throughput per issue — three issues rarely reach the same phase at the same moment, so the concurrency buys little for the added complexity of guarding concurrent label/comment writes on the same repo. Rejected in favor of the sequential ReAct pattern, which is loop-maker's stated default for exactly this shape of problem.

## Open items for implementation

- Verify the `/qa` report's exact markdown shape before finalizing `verify_qa_gate.sh`'s grep patterns.
- Decide the exact `gh issue comment` / `gh issue edit --add-label` invocations and confirm `gh` auth scope covers label writes in CI-less local use.
- Confirm worktree cleanup timing: after PR merge, or after PR open (leave it for manual cleanup once merged)?
