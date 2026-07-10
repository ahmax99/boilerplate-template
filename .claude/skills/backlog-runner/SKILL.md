---
name: backlog-runner
description: >
  Self-running loop: discover ready-for-agent GitHub issues and advance each
  one phase at a time through /spec -> /plan -> /implement + /qa -> gh pr
  create, pausing at human gates and escalating anomalies. Triggered manually
  via /run-backlog.
---

# backlog-runner

## Goal

**Exit predicate (per issue):** the issue's PR is opened after `/implement` +
`/qa` pass the deterministic gate. Merging/closing the PR is a human action
outside this loop's exit predicate — see `HUMAN-GATES.md`.

**Exit predicate (per phase, within one issue):** the phase's deterministic
check passes — a fresh `/spec`/`/plan` draft posted as a comment, or
`scripts/verify_qa_gate.sh` returning exit 0 on the persisted `/qa` report.

The loop does not run "until done" in one sitting. Each `/run-backlog`
invocation advances up to 3 issues by exactly one phase, then stops. Run it
again to keep going.

---

## Conventions (durable only — never write progress here)

This file is **read-only at runtime.** It carries logic, not state.

Rules:
- **Never write progress, counters, timestamps, or iteration results here.**
  All changing data belongs in the external state described below.
- This file is loaded fresh on every `/run-backlog` invocation. Anything
  written here between runs disappears the moment the next run reloads it
  from disk.
- Durable knowledge only: the discovery order, the per-phase transition
  table, the verifier handoff, and the gate/budget references. No application
  domain rules live here either — this skill reads the same `.claude/rules/*`
  every other project command already reads.

The boundary is two-tier, per the design spec
(`docs/superpowers/specs/2026-07-09-backlog-runner-agent-loop-design.md`):
- **Durable queue state** — GitHub issue labels + comments (checkable, visible
  to the whole team).
- **Ephemeral per-issue state** — `.claude/backlog-state/issue-<n>/.agent-state.json`
  in the main repo, gitignored, living and dying with that issue's branch.

---

## Pattern: ReAct + deterministic verifier

The loop follows the **ReAct + deterministic verifier** pattern (loop-maker's
default: one workstream, "done" is a program-checkable predicate). Each
`/run-backlog` invocation proceeds in order:

1. **Discover** advanceable issues (below).
2. For up to 3 of them, **advance exactly one phase** by checking out that
   issue's branch directly in the main repo working directory (per-phase
   transition table below) — there is no separate per-issue worktree.
3. **Verify** deterministically where a verify step exists — never on the
   model's own reading of a report.
4. **Write state** back — both the ephemeral `.agent-state.json` and the
   durable GitHub label(s)/comment.
5. Stop. Do not chain a second phase for the same issue in the same run.

### 0 — Working-tree safety (read before every checkout)

Because there is only one working directory, switching an issue's branch in
means switching a previous issue's branch out. Before **any** `git checkout`
into an issue's branch (new or resumed):

- Run `git status --short`. If it reports anything beyond
  `.claude/backlog-state/**` (which is gitignored and branch-agnostic), the
  tree is dirty — do **not** check out. Route the issue to `agent:blocked` as
  an anomaly (see `HUMAN-GATES.md`) instead of switching over someone's
  in-progress work.
- If clean, `git checkout main && git pull` first, then check out or create
  the issue's branch.
- **Commit before yielding the directory.** Every phase that writes tracked
  files (the spec write, `/implement`'s code changes) must end with a `git
  commit` on that issue's branch before the loop moves on to another issue or
  the invocation ends — an uncommitted change left behind would otherwise
  carry onto whatever branch gets checked out next. `/plan` needs no commit
  (it only writes to the gitignored `.claude/plans/` and posts a GitHub
  comment).

### 1 — Discovery order

Query with `gh issue list --label <label> --json number,title,body,labels`,
one query per label, in this priority order:

1. `agent:approved` issues — resume immediately, highest priority.
2. `agent:qa-retry` issues — continue the fix loop.
3. `agent:implementing` issues with no retry flag — a previous run likely
   died mid-phase. Treat as **recoverable, not an error**: re-run the phase's
   action from scratch (`/implement` and `/qa` run cleanly against the
   branch's current committed state; they are not resumed mid-command).
4. `ready-for-agent` issues, oldest issue number first — create a new branch.

Skip issues sitting in any `*-pending-approval` label or in `agent:blocked`
(without `agent:approved`) — they don't count against the 3-issue budget.
Stop once 3 issues have been advanced, or once no advanceable issue remains,
whichever comes first (see `HUMAN-GATES.md` for the budget as a hard limit).

### 2 — Per-phase transition table

A `*-pending-approval` label always co-exists with `agent:approved` once a
human clears it — read the **pair** together to know which phase to run next,
then remove **both** labels when done.

| Current label(s) | Action (checked out directly in the main repo) | Next label |
|---|---|---|
| `ready-for-agent` | After the working-tree safety check (step 0): `git checkout -b agent/issue-<n>` from `main`; run `/spec` from the issue title+body; commit the spec file; post it as a `gh issue comment` | `agent:spec-pending-approval` |
| `agent:spec-pending-approval` + `agent:approved` | Working-tree safety check; `git checkout agent/issue-<n>`; run `/plan docs/specs/<spec>.md`; post the plan as a comment; remove both labels | `agent:plan-pending-approval` |
| `agent:plan-pending-approval` + `agent:approved` | Working-tree safety check; `git checkout agent/issue-<n>`; run `/implement`, then `/qa`; commit the implementation; hand off to the verifier (step 3 below); remove both labels | `agent:pr-open` / `agent:qa-retry` / `agent:blocked` (verifier-decided) |
| `agent:qa-retry` | Working-tree safety check; `git checkout agent/issue-<n>`; `/implement "fix: <qa findings>"`; commit; re-run `/qa`; hand off to the verifier again | same branching as above |
| `agent:pr-open` | Check `gh pr view --json state` — see PR outcome housekeeping below | *(terminal, or branch deleted)* |

Never advance a second gated phase for the same issue in the same
`/run-backlog` invocation — spec→plan and plan→implement are always separated
by a human-approval run boundary.

### 3 — The verifier handoff (critical)

After running `/qa` for an issue, **persist** the synthesized `## QA Report`
to `.claude/backlog-state/issue-<n>/.qa-report.md` — `/qa` only prints to the
session, so this write is the seam between the model (produces the report)
and the program (judges it). Then run:

```
scripts/verify_qa_gate.sh .claude/backlog-state/issue-<n>/.qa-report.md
```

Branch **on its exit code only** — never re-read or re-judge the report's
prose or scores in-model:

- **exit 0** → `agent:pr-open`; `gh pr create` from the branch, referencing
  the issue.
- **exit 1** → gate failed. If `qa_retries < 3` (from `.agent-state.json`):
  `agent:qa-retry`, increment `qa_retries`. If `qa_retries == 3`:
  `agent:blocked` (retries exhausted — see `HUMAN-GATES.md`).
- **exit 2** → misuse/anomaly (e.g. `/qa` crashed before producing a report).
  Always `agent:blocked`, regardless of retry count.

### 4 — State writes

On every phase advance, update together:
- `.claude/backlog-state/issue-<n>/.agent-state.json` — `{ "issue", "phase",
  "qa_retries", "branch" }`. Increment `qa_retries` only on a qa-retry
  transition; every other transition leaves it unchanged (or initializes it
  to `0` on branch creation).
- The durable GitHub label(s) (`gh issue edit --add-label ... --remove-label
  ...`) and a `gh issue comment` explaining what happened this run.

### 5 — PR outcome housekeeping

On a run where an issue is in `agent:pr-open`, check `gh pr view --json
state`:
- **MERGED** — `git checkout main && git pull && git branch -d
  agent/issue-<n>`; remove `.claude/backlog-state/issue-<n>/`. The issue
  closes automatically via GitHub's "closes #n" linking.
- **CLOSED** (not merged) — leave `agent:pr-open` as-is; take no further
  action. A human deletes the branch manually if abandoning the issue.
- **OPEN** — still awaiting merge; not an advanceable issue, skip. Leave the
  branch as-is (don't switch back to `main` mid-run just because it's
  idle — another issue's phase in the same invocation will switch branches
  as needed, guarded by the working-tree safety check in step 0).

---

## Anomalies and budget

Any anomaly (scope drift, an `infra/terraform/**` diff, a dirty working tree
before checkout, a non-deterministic crash, or verifier exit 2) always routes
to `agent:blocked` — see `HUMAN-GATES.md` for the full trigger list. The
3-issues-per-run and 3-qa-retries-per-issue limits are hard stops, also
defined in `HUMAN-GATES.md` — this file only enforces them by reading
`.agent-state.json`'s counters; it does not restate the rationale.

---

## How to run

Triggered manually via `/run-backlog` — see `TRIGGER.md` for the invocation
contract. Before the first live run:

1. Run `scripts/bootstrap_labels.sh` once (human setup — creates the 8
   `agent:*` / `ready-for-agent` labels).
2. Confirm `gh auth status` shows write access to issues/labels/PRs.
3. Review `HUMAN-GATES.md` — every gate there must be understood before real
   actions begin.
4. Confirm `scripts/verify_qa_gate.sh` is executable and passes its fixture
   suite (`scripts/fixtures/`).

---

## What "done" means

There is no single "loop done" state — `backlog-runner` is a recurring,
manually-triggered sweep, not a run-to-completion job. Per issue, that issue
is done when its PR is merged (see PR outcome housekeeping) and its branch
has been deleted. Per invocation, the run is done when 3 issues have been
advanced or no advanceable issue remains — whichever comes first.
