# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Doc map:** human setup/onboarding lives in the `README.md` files (per package); Claude's rules and patterns live here and in `.claude/rules/`. The source of truth for runnable scripts is each `package.json`.

@.claude/rules/architecture.md
@.claude/rules/conventions.md
@.claude/rules/principles.md

## Commands

Full script list is in each `package.json`. Run from the repo root unless noted. Turbo respects the task graph (`dependsOn`), so building an app builds its `@shared/*` deps first. Non-obvious ones:

```bash
turbo dev --filter=backend-boilerplate   # run one app (swap for nextjs-boilerplate)
turbo build --filter=@shared/neon        # build one package
bun run check-types                      # tsc --noEmit across all packages
bun run check-format                     # biome check (lint + format, no writes)
```

**Database** (`@shared/neon`, requires `DATABASE_URL`; full list in its `package.json`):

```bash
turbo db:generate --filter=@shared/neon   # prisma generate — runs as neon's prebuild
cd shared/neon && bun run db:migrate       # prisma migrate dev (interactive)
```

There is **no test runner configured** in this repo yet. CI runs type-checking, Biome, `njsscan`, and SonarQube — not unit tests.

### Tooling notes

- **Biome** (not ESLint/Prettier) is the linter+formatter. Config in `biome.json`: single quotes, no semicolons, 2-space indent, 80 cols, `trailingCommas: none`. `noExplicitAny` is an **error**. Imports are auto-organized into ordered groups; Tailwind classes are auto-sorted (`useSortedClasses`).
- A Husky pre-commit hook runs `lint-staged` → `biome check --write` on staged TS/JS/YAML.
- Package versions are kept in sync across workspaces with `syncpack` (`bun run check-mismatches` / `bun run sync-packages`).
- **[fallow](https://docs.fallow.tools/)** is a *local* static-analysis CLI configured by `.fallowrc.json` (repo root). It flags unused/dead code, semantic code duplication (≥3 occurrences, `**/lib/**` ignored), high complexity, and architecture drift across the `apps/*` + `shared/*` workspaces. Run `fallow` from the repo root.
- **SonarQube** is the *CI* code-quality backstop. It scans every push to `main` and every PR (dependabot excluded) for bugs, vulnerabilities, and code smells — you don't run it locally.

## Rules

**Backend:**
- All imports in `apps/backend-boilerplate` use explicit `.js` extensions (ESM)
- Service layer: wrap async calls in `catchAsyncError`; throw only `AppError` inside that body — never throw across service layers
- New modules need the full triad: `*.plugin.ts` + `*.controller.ts` + `*.service.ts`

**Frontend:**
- Browser code never calls the Elysia backend directly — always via Next.js server actions, route handlers, or server components
- Feature modules at `src/features/<name>/` split by context: `client/` (`'use client'` components/hooks/API callers), `server/` (server components + Elysia calls), `schemas/`, `lib/`, `utils/`, `constants/`, `providers/`
- Shared cross-feature UI only goes in `src/components/` (atoms → molecules → organisms → layout → common); feature-specific components stay inside their feature folder

**Shared:**
- New Zod schemas/types go in `@shared/config`, never in an individual app

## Codebase graph

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships. Use it to navigate the repo without re-reading files. Query the graph via the `graphify` MCP tools in any session.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

@graphify-out/GRAPH_REPORT.md

## Context management

When compacting, always preserve:
- The list of files modified this session
- Any unresolved type errors or Biome violations
- The active task or goal
