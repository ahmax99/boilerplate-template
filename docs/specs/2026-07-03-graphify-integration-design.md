# Graphify Integration Design

**Date:** 2026-07-03
**Status:** Approved

## Problem

During AI-driven development, agents re-analyze the whole codebase from scratch every session — reading files, tracing imports, rebuilding mental models. On a monorepo of this size (`apps/backend-boilerplate`, `apps/nextjs-boilerplate`, `shared/*`, `infra/`), that burns significant tokens and slows every session start.

## Goal

Integrate [graphify](https://github.com/safishamsi/graphify) to build a persistent, queryable knowledge graph of the codebase. Agents load the graph summary automatically at session start and can query it via MCP tools — without re-reading source files.

## Non-Goals

- LLM-enriched semantic analysis (requires `ANTHROPIC_API_KEY`; not used here — user authenticates via OAuth)
- Replacing `CLAUDE.md` or the `.claude/rules/` rule files
- Any changes to application source code

## Decisions

| Question | Decision |
|---|---|
| Agent consumption | Markdown `@`-import (auto-loaded) + MCP server (queryable) |
| Graph persistence | Committed to git + auto-rebuilt on every commit via Husky post-commit hook |
| Scope | Whole repo (`.`); `docs/` included initially — move to `.graphifyignore` if it triggers API calls |
| LLM backend | None — tree-sitter structural extraction only, no API key required |

## Architecture

### Output Directory: `graphify-out/`

Committed to git. Three files produced by every build:

- `report.md` — Markdown summary: module map, key clusters, import relationships, design-note extraction. Auto-loaded into every Claude Code session via `@graphify-out/report.md` in `CLAUDE.md`.
- `graph.json` — Full structural graph. Queried by the MCP server.
- `graph.html` — Interactive visualization for human browsing (not used by agents).

### Scripts (`package.json` root)

```json
"graphify:install": "uv tool install graphifyy",
"graphify:build":   "graphify .",
"graphify:serve":   "python -m graphify.serve graphify-out/graph.json"
```

- `graphify:install` — one-time prerequisite setup per machine.
- `graphify:build` — full rebuild from repo root; run manually or via hook.
- `graphify:serve` — starts the MCP stdio server; invoked by Claude Code on session start.

### MCP Server (`.claude/settings.json`)

```json
"mcpServers": {
  "graphify": {
    "type": "stdio",
    "command": "python3",
    "args": ["-m", "graphify.serve", "graphify-out/graph.json"]
  }
}
```

Runs on-demand (stdio transport) when a Claude Code session starts. Exposes tools for querying the graph by concept, module path, or relationship without touching source files.

### CLAUDE.md

A single line added to the "Context management" section:

```
@graphify-out/report.md
```

This loads the Markdown summary into every agent session automatically.

### Git Hook (`.husky/post-commit`)

Runs after every commit:

1. Checks `command -v graphify` — skips silently if not installed (CI, fresh clones).
2. Sets `GRAPHIFY_RUNNING=1` to prevent re-entrant hook execution.
3. Runs `graphify .` from repo root.
4. Stages `graphify-out/` and creates a follow-up commit: `chore: update codebase graph`.

The follow-up commit is clearly labeled so it doesn't pollute feature commit diffs.

### `.graphifyignore`

```
node_modules/
.turbo/
.next/
dist/
build/
graphify-out/
bun.lock
*.lock
*.log
infra/terraform/.terraform/
```

Excludes generated artifacts, lock files, and the output directory itself (prevents self-referential loops).

## Developer Setup (one-time per machine)

Prerequisites: Python 3.10+, `uv` (see [uv install docs](https://docs.astral.sh/uv/getting-started/installation/))

```bash
bun run graphify:install   # install graphify via uv
bun run graphify:build     # generate initial graphify-out/
```

After this, every commit auto-rebuilds the graph. Other developers who clone the repo can use the pre-committed `graphify-out/` immediately — they only need to run setup if they want the auto-rebuild hook to fire on their machine.

### If `docs/` triggers API calls

If `bun run graphify:build` prompts for an API key or errors on Markdown files, add the following to `.graphifyignore`:

```
docs/
```

Then re-run `bun run graphify:build`.

## File Inventory

| File | Action |
|---|---|
| `.graphifyignore` | Create |
| `graphify-out/report.md` | Create (generated) |
| `graphify-out/graph.json` | Create (generated) |
| `graphify-out/graph.html` | Create (generated) |
| `package.json` (root) | Edit — add three scripts |
| `.husky/post-commit` | Create |
| `.claude/settings.json` | Edit — add MCP server entry |
| `CLAUDE.md` | Edit — add `@graphify-out/report.md` |
| `README.md` | Edit — add prerequisites section |

## Acceptance Criteria

- [ ] `bun run graphify:build` succeeds from repo root without an API key
- [ ] `graphify-out/report.md`, `graph.json`, and `graph.html` are present and non-empty
- [ ] Making a commit triggers the post-commit hook and produces a follow-up `chore: update codebase graph` commit
- [ ] The hook skips gracefully when `graphify` is not on `$PATH`
- [ ] A new Claude Code session loads `graphify-out/report.md` automatically (visible in context)
- [ ] The graphify MCP server appears in `/mcp` and its tools are callable
- [ ] `docs/` fallback: if markdown triggers API calls, adding `docs/` to `.graphifyignore` and rebuilding resolves it
