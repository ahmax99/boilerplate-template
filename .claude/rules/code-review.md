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
- Components respect atomic-design hierarchy: atoms don't import molecules or organisms; molecules import atoms only; organisms may import atoms and molecules.
- Feature-specific UI lives inside `features/<name>/client/components/` or `features/<name>/server/components/` — not in `src/components/` (shared cross-feature only).
- Server components in `features/<name>/server/components/` have no `'use client'` directive, no React hooks, and no browser APIs.
- Multi-variant components use CVA, not ad-hoc inline ternaries for class strings.
- `const` arrow functions used throughout; `function` declarations are only acceptable for TypeScript overloads (multiple call signatures).
- 3+ branches on the same discriminant use `switch-case`; simple value-to-value mappings use a `Record<K, V>` lookup table.
- No dead/unused code and no copy-paste duplication (3+ near-identical blocks) — extract a shared helper into the right layer instead. Keep functions low-complexity; split one that sprawls. These are what **fallow** (local, `.fallowrc.json`) and **SonarQube** (CI) flag automatically, and they map directly to `principles.md` ("complexity is the enemy").
