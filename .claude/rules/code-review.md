---
description: Code review checklist and quality gates to enforce during reviews
---

# Code Review Priorities

- Business logic and direct Prisma access belong in `*.service.ts`, not in controllers — controllers only validate, call the service, and shape the response.
- Backend services return `ResultAsync<T, AppError>` (neverthrow) and never `throw` to the caller; failures are signalled with `throw new AppError(code, msg)` only inside the `catchAsyncError`-wrapped body.
- Protected routes declare the `auth: true` macro; the resolved CASL `ability` is actually enforced (`accessibleBy(...)` in list queries, `ability.can(...)` on single resources).
- Every external data input is validated with a `@shared/config` Zod schema at the controller boundary.
- Multi-step writes require `prisma.$transaction([...])`.
- `any` types are banned (Biome `noExplicitAny` error).
- Unbounded `findMany` calls need `take`/`skip` (or cursor) pagination.
- Browser code never calls the Elysia backend directly — only via the Next.js BFF.
- No dead/unused code and no copy-paste duplication (3+ near-identical blocks) — extract a shared helper into the right layer instead. Keep functions low-complexity; split one that sprawls. These are what **fallow** (local, `.fallowrc.json`) and **SonarQube** (CI) flag automatically, and they map directly to `principles.md` ("complexity is the enemy").
