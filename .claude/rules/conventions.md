---
description: Code conventions, patterns, and style requirements
---

# Conventions

The concrete "how to write code here" rules. `architecture.md` covers *where things live*; `principles.md` covers *why*. Biome owns pure style (single quotes, no semicolons, 2-space, 80 cols, no trailing commas) — these are the conventions Biome can't enforce.

- The backend uses ESM with explicit `.js` import extensions (`import { x } from './foo.js'`) even though sources are `.ts` — match this in `apps/backend-boilerplate`.
- Prefer the neverthrow `Result` pattern in backend services over throwing across layers; only throw `AppError` inside the `catchAsyncError`-wrapped body.
- Put shared types/schemas in `@shared/config` so both apps stay in sync.

## Code Style

- Prefer `const` arrow functions over `function` declarations: `const fn = () => {}` not `function fn() {}`. **Exception:** TypeScript function overloads require the `function` keyword (e.g., a utility with multiple call signatures); the `function` keyword is acceptable only in that case.
- Prefer `switch-case` over `else-if` chains when 3 or more branches test the same discriminant expression. For simple value-to-value mappings, prefer a `Record<K, V>` lookup table over both (exhaustiveness is enforced by the type).

## Validation

- Validate all external input (request `body` / `query` / `params`, headers, env) with a Zod schema at the boundary — for the backend that's the Elysia route options (e.g. `body: PostModel.createPostBody`), never inside a service.
- Schemas live in `@shared/config` as `*.model.ts` and are imported by both apps. Add new validation there, not in an app.

## Transactions

- Use `prisma.$transaction([...])` for any multi-step write that must be atomic.
- Services call `prisma` directly (there is no separate model layer). When a transaction spans helpers, thread the `tx` client (`Prisma.TransactionClient`) into each Prisma call rather than reaching for the singleton `prisma`.

## Auth Context

- Gate protected backend routes with the `auth: true` route macro from `authPlugin`; it verifies the Cognito JWT and resolves `user: AuthUser`.
- Authorization is CASL: build the ability with `getUserPermissions(user)` and enforce it — `accessibleBy(ability).ofType('<Model>')` in list `where` clauses and `ability.can('<action>', subject('<Model>', record))` for single resources. Unauthenticated callers get read-only public permissions.
- The frontend mirrors this with CASL (`src/lib/casl.ts`, `PermissionProvider`) and never calls the Elysia backend directly — it goes through the Next.js BFF (route handlers / server components / server actions using the `serverApiClient` / `serverAuthApiClient` clients).

## Exports

Always use named exports, never default exports — except where Next.js requires a default export (pages, layouts, route segments, middleware).

## Frontend Components (nextjs-boilerplate)

- Use CVA (`class-variance-authority`) for variant systems in atoms and organisms; co-export `<Name>Variants` alongside the component for consumers that need raw class strings.
- Mark each component's root element with `data-slot="<component-name>"` (e.g. `data-slot="button"`) to enable parent styling via attribute selectors.
- Compose subcomponents (e.g. `Card`, `CardHeader`, `CardContent`) as separate named exports from a single file — not separate files.
- Atoms and molecules carry no `'use client'` directive by default; add it only when event handlers, hooks, or browser APIs are genuinely required.
- Feature-specific components go in `features/<name>/client/components/` (client) or `features/<name>/server/components/` (server); never in `src/components/`.
- Server components (`features/<name>/server/components/`) must have no `'use client'`, no React hooks, and no browser APIs.

## Error Handling

- Prefer the shared `catchError` utils over hand-written `try/catch`: `catchAsyncError(promise)` for async work and `catchSyncError(() => …)` for synchronous calls that can throw (`new URL(...)`, `JSON.parse`, …). Both map the failure to an `AppError` and return a neverthrow `Result`/`ResultAsync`, so callers handle it as a value (`.match(...)`, `.unwrapOr(...)`). `catchAsyncError` also reports to Sentry — use it when a throw is genuinely exceptional; `catchSyncError` does not — use it for expected, recoverable failures (input validation, parsing untrusted data). Each app has its own copy: backend `src/error/utils/catchError.ts`, frontend `src/features/error/utils/catchError.ts`. Reserve raw `try/catch` for cases these helpers can't express.
- Service methods wrap their async work in `catchAsyncError(...)` and return `ResultAsync<T, AppError>`; they never `throw` to the caller. Signal failures with `throw new AppError(code, msg)` **only inside** the wrapped body, using codes from `@shared/config` (`errorDefinition`).
- Controllers wrap every service call in `handleApiError(...)`; the mounted `errorHandler` plugin converts the `AppError` into the HTTP response. No raw `try/catch` in controllers, and never leak internal stack traces.
