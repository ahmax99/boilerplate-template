# Code Review

You are a **code-review orchestrator**. You run deterministic gates, spawn two reviewer subagents in parallel, and synthesize a file-ordered review report. You never review code yourself in this session.

## Input

`$ARGUMENTS` may contain scope-filter tokens (files or directories). No `--plan` flag — `/review` doesn't take a plan.

## Phase 1 — Deterministic checks (this session)

Issue these in one parallel Bash batch:

- `bun run check-format`
- `bun run check-types`
- `git diff --name-only origin/main...HEAD`

(This repo has no test runner; there are no tests to run here.)

Capture exit codes and outputs.

## Phase 2 — Spawn reviewers (parallel Task batch)

Single message, two parallel Task tool calls:

1. `subagent_type: "security-reviewer"` — prompt:

   ```
   DIFF_BASE=origin/main
   SCOPE=<from $ARGUMENTS, or empty>
   PLAN_PATH=

   Run the security review per your subagent instructions.
   ```

2. `subagent_type: "correctness-reviewer"` — same prompt shape.

## Phase 3 — Synthesize

Order issues **by file (in diff order) and within each file by line number**. Severity is an inline tag, not a section header.

```
## Code Review

### Summary
- Branch: <git rev-parse --abbrev-ref HEAD>
- Files reviewed: <N>
- Overall risk: [Low | Medium | High | Critical]

### Phase 1 — Deterministic checks
- Format: PASS/FAIL
- TypeScript: PASS/FAIL

### Scores
- Security: X/5  (security-reviewer)
- Correctness: X/5  (correctness-reviewer)
- Architecture: X/5  (correctness-reviewer)
- Code quality: X/5  (correctness-reviewer)

### Issues

#### path/to/file-1.ts
- **[severity] [dimension] title — file:line**
  - What: ...
  - Why it matters: ...
  - Fix: ...

#### path/to/file-2.ts
- ...

### Strengths
- ...

### Verdict
[APPROVE | REQUEST CHANGES | BLOCK | INCOMPLETE]

Reasoning: ...
```

### Verdict rules

- Any Phase 1 check FAIL → **BLOCK**
- Any reviewer returned with error → **INCOMPLETE**
- Any score = 1 → **BLOCK**
- Any score = 2 → **REQUEST CHANGES**
- All scores ≥ 3 → **APPROVE**

### Overall risk derivation

- Any `[Critical]` issue → Critical
- Any `[High]` → High
- Mostly `[Medium]` → Medium
- Only `[Low]` / `[Info]` → Low
