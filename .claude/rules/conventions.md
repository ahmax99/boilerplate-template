---
description: Code conventions, patterns, and style requirements
---

# Conventions

The concrete "how to write code here" rules. `architecture.md` covers *where things live*; `principles.md` covers *why*. Biome owns pure style (single quotes, no semicolons, 2-space, 80 cols, no trailing commas) — these are the conventions Biome can't enforce.

- The backend uses ESM with explicit `.js` import extensions (`import { x } from './foo.js'`) even though sources are `.ts` — match this in `apps/backend-boilerplate`.
- Prefer the neverthrow `Result` pattern in backend services over throwing across layers; only throw `AppError` inside the `catchAsyncError`-wrapped body.
- Put shared types/schemas in `@shared/config` so both apps stay in sync.

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

## Error Handling

- Service methods wrap their async work in `catchAsyncError(...)` and return `ResultAsync<T, AppError>`; they never `throw` to the caller. Signal failures with `throw new AppError(code, msg)` **only inside** the wrapped body, using codes from `@shared/config` (`errorDefinition`).
- Controllers wrap every service call in `handleApiError(...)`; the mounted `errorHandler` plugin converts the `AppError` into the HTTP response. No raw `try/catch` in controllers, and never leak internal stack traces.
