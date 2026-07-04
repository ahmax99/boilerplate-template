# QA

You are a **QA orchestrator**. You run deterministic quality gates in this session, spawn three reviewer subagents in parallel, and synthesize their reports into a unified verdict. You never review code yourself in this session — that's the subagents' job.

## Input

`$ARGUMENTS` may contain:

- `--plan=<slug-prefix>` — target a non-current plan (resolve against `.claude/plans/<prefix>*.md`)
- Other tokens are treated as a scope filter (file or directory)

## Phase 1 — Deterministic checks (this session)

### Resolve the plan path

- Default: read the active plan filename from `.claude/plans/.current` (`cat .claude/plans/.current`), then use `.claude/plans/<that-filename>`.
- If `--plan=<prefix>`: `ls .claude/plans/<prefix>*.md`. Zero matches → abort. Multiple matches → list them and abort.

If the resolved path doesn't exist or isn't a regular file, report an error and stop — `/qa` requires a plan.

### Run the gates in one parallel Bash batch

Issue these in a single message with multiple Bash tool calls in parallel:

- `bun run check-format`
- `bun run check-types`
- `git diff --name-only origin/main...HEAD`
- `bunx react-doctor@latest --verbose --scope changed` — React-only scanner; reports just the issues this branch introduced. It reports clean when the diff has no React files, so run it unconditionally in the batch. New **errors** count as a gate FAIL; warnings are advisory (list them, don't block).

Capture each exit code and stdout/stderr.

## Phase 2 — Spawn reviewers (parallel Task batch)

In a single message with three parallel Task tool calls, invoke:

1. `subagent_type: "security-reviewer"` — prompt:

   ```
   DIFF_BASE=origin/main
   SCOPE=<from $ARGUMENTS scope-filter tokens, or empty>
   PLAN_PATH=<resolved plan path>

   Run the security review per your subagent instructions.
   ```

2. `subagent_type: "correctness-reviewer"` — same prompt shape.

3. `subagent_type: "acceptance-criteria-reviewer"` — same prompt shape (PLAN_PATH is mandatory for this one).

Do not pass code excerpts — the subagents read the diff themselves.

## Phase 3 — Synthesize

Merge the three returned reports into one unified report. **Scores are copied verbatim** from the owning subagent — do not re-score. Issues are aggregated and ordered by file (in the order files appear in the diff list) and within each file by line number.

```
## QA Report

### Phase 1 — Deterministic checks
- Format: PASS/FAIL
- TypeScript: PASS/FAIL
- React Doctor: PASS/FAIL (new errors only) — score if reported
- Changed files: <count>

### Acceptance criteria
[verbatim table from acceptance-criteria-reviewer]

### Scores
- Acceptance criteria: X/5  (acceptance-criteria-reviewer)
- Correctness: X/5  (correctness-reviewer)
- Security: X/5  (security-reviewer)
- Architecture: X/5  (correctness-reviewer)
- Code quality: X/5  (correctness-reviewer)

### Issues (file-ordered, severity inline)

#### path/to/file-1.ts
- **[severity] [dimension] title — file:line**
  - What: ...
  - Fix: ...

#### path/to/file-2.ts
- ...

### Verdict
[APPROVE | REQUEST CHANGES | BLOCK | INCOMPLETE]

Reasoning: ...
```

### Verdict rules

- Any Phase 1 check FAIL → **BLOCK**
- Any reviewer returned with error or missing score → **INCOMPLETE** (flag which dimension is missing)
- Any score = 1 → **BLOCK**
- Any score = 2 → **REQUEST CHANGES**
- All scores ≥ 3 → **APPROVE**

## Notes

- Do not read source files yourself in Phase 3 — synthesis is mechanical. If a subagent's report contradicts another, surface the contradiction in Reasoning rather than adjudicating.
- If `acceptance-criteria-reviewer` reports >50% UNVERIFIABLE, recommend adding more testable criteria when the next plan is written.
