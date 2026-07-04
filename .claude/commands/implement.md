# Implement

You are a **generator agent**. Your job is to implement features methodically, one step at a time, following the current plan.

## Input

If `$ARGUMENTS` is provided, use it as additional context or to specify which step(s) to implement.

## Setup

Parse `$ARGUMENTS` for an optional `--plan=<slug-prefix>` flag.

1. **Resolve the plan path:**
   - Default: read the active plan filename from `.claude/plans/.current` (`cat .claude/plans/.current`), then use `.claude/plans/<that-filename>`.
   - If `--plan=<prefix>`: `ls .claude/plans/<prefix>*.md`. Zero matches → abort. Multiple matches → list them and abort. Exactly one → use it.
2. If the resolved path doesn't exist or isn't a regular file, tell the user to run `/spec <feature>` then `/plan <task | spec path>` first.
3. Read the plan. Identify which steps are not yet completed (unchecked acceptance criteria).

Remaining `$ARGUMENTS` tokens (after stripping `--plan=...`) are passed through as the step selector or additional context.

## Implementation Rules

### Work in sprints

- Pick the **next uncompleted step** from the plan
- Implement it fully before moving to the next step
- After completing a step, check off its acceptance criteria in the plan file
- Tell the user which step you're starting and when you've finished it

### Follow project patterns exactly

Read `.claude/rules/architecture.md`, `conventions.md`, and `principles.md` first. The non-negotiables:

- **Backend services** (`*.service.ts`): plain object literal (`export const XService = {...}`) — non-instance, per Elysia best practice. Each method wraps its async work in `catchAsyncError(...)` and returns `ResultAsync<T, AppError>`. Signal failures with `throw new AppError('NOT_FOUND' | ..., msg)` **only inside** that wrapped body — never throw to the caller. Enforce CASL with `accessibleBy(ability).ofType(...)` and `ability.can(...)`.
- **Backend plugins** (`*.plugin.ts`): an Elysia plugin that `.decorate()`s the service onto the context.
- **Backend controllers** (`*.controller.ts`): thin Elysia routes. Validate input with Zod schemas from `@shared/config` via the route's `body`/`query`/`params`. Gate protected routes with the `auth: true` macro. Wrap every service call in `handleApiError(...)`. No business logic.
- **Imports**: backend uses explicit `.js` extensions (ESM) even from `.ts` sources.
- **Schemas/types**: add new Zod schemas to `@shared/config` (`*.model.ts`), never inside an app.
- **Frontend**: browser code never calls Elysia directly — go through Next.js route handlers / server components / server actions using the `ky` clients in `src/lib/serverApiClient.ts`. Keep `server/`, `client/`, and `schemas/` separated by execution context.
- **Exports**: named exports only (except Next.js-required default exports for pages/layouts/route segments).
- A new backend resource needs the full triad: `*.plugin.ts` + `*.controller.ts` + `*.service.ts`, plus route registration in `src/routes/index.ts`.

### Quality gates per step

After implementing each step, self-check:

1. Does it type-check? Run `bun run check-types` (Turbo runs `tsc --noEmit` across packages; deps build first).
2. Does it pass Biome? Run `bun run check-format` (lint + format check). `noExplicitAny` is an **error** here.
3. Is all external input validated with a `@shared/config` Zod schema at the controller boundary?
4. Are services returning `ResultAsync` (not throwing), and are multi-step writes wrapped in `prisma.$transaction([...])`?
5. If the Prisma schema changed, run `/db-check` before applying the migration.
6. If the step touched React code (`apps/nextjs-boilerplate`), run `bunx react-doctor@latest --verbose --scope changed` and fix any new **errors** before moving on (warnings are advisory). CI enforces the same gate on the PR, so regressions caught here are regressions the reviewer never sees.
7. If the step touched `infra/terraform/**`, run the Terraform gates from `.claude/rules/infra.md` (`terraform fmt -check`, `tflint`, `terraform validate`) and fix failures before moving on — they mirror what `terraform-plan.yml` will reject on the PR. Steps 1–2 (`check-types` / `check-format`) don't cover HCL, so these are the *only* local gates for infra steps.

There is **no test runner** configured in this repo. Don't write or run tests unless the plan explicitly adds one. If a quality gate fails, fix it before moving on — do not accumulate technical debt across steps.

### Use subagents for parallel work

When a step involves independent work, dispatch the right subagent type:

- **`Explore`** — for codebase research before you start coding (e.g., "which module is the closest template for a new resource? where is `getUserPermissions` called?"). Read-only; cheaper than running the same searches in the main session.
- **`general-purpose`** — for parallel independent implementation chunks within one step (e.g., a `@shared/config` schema AND a util that don't depend on each other). Pass each subagent the exact file path, the pattern to follow, and the expected interface.

Do not invoke `/qa`, `/review`, or the project's reviewer subagents (`security-reviewer`, `correctness-reviewer`, `acceptance-criteria-reviewer`) from inside `/implement`. Those run after a step completes, invoked by the user.

### Reach for the right plugin

The enabled plugins (see `.claude/rules/harness.md`) cover gaps the project commands don't:

- **Frontend UI** — build `nextjs-boilerplate` components/pages via the project `app-design` skill, which wires the `impeccable` plugin (`/impeccable craft|shape`) and the `shadcn` skill into this repo's component conventions.
- **Unfamiliar API** — pull current docs with `context7` (MCP) before using an Elysia/Next.js/Prisma/CASL/Zod feature; don't rely on memory.
- **Terraform work** — the `terraform-skill` plugin (antonbabenko) triggers on Terraform/HCL tasks with best-practice patterns for modules, testing, and state ops; `.claude/rules/infra.md` holds this repo's specific conventions and wins on conflicts.
- **Verifying the UI** — there is no unit-test runner here, so use `playwright` (MCP) to drive a browser and confirm a flow actually works.
- **A bug you can't place** — use `superpowers:systematic-debugging` (root-cause first) instead of guess-and-patch.
- **A messy diff that works** — run `code-simplifier` over the just-written code before suggesting `/qa`.

### Communicate progress

After each step:

- Mark acceptance criteria as complete in the resolved plan file
- Briefly tell the user what was done and what's next
- If you hit a blocker or design decision not covered by the plan, ask the user rather than guessing

## When finished

After all steps are complete:

1. Run `bun run check-format` and `bun run check-types` — fix any issues
2. Summarize what was built
3. Suggest running `/qa` to get an independent evaluation
