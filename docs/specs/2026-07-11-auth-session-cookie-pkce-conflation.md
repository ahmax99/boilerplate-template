# Spec: Auth Session Cookie Conflates PKCE State With a Real Session

> Status: Draft · 2026-07-11

## Problem / Context

`handleLogin` (`apps/nextjs-boilerplate/src/features/auth/server/services/auth.ts:52-80`) writes in-flight PKCE state (`codeVerifier`, `state`, `nonce`, `callbackUrl`) into the same `auth_session` iron-session cookie that later holds the real authenticated session (`userId`, `email`, `refreshToken`). `proxy.ts`'s middleware (`src/proxy.ts:16`) treats the cookie's mere presence as `isAuthenticated`, so a visitor who only *initiates* login (hits `/api/auth/login`) is immediately treated as signed in — before Cognito is ever reached. This soft-locks the login UI (revisiting `/auth/login` bounces to Home with no recovery) and lets the visitor's requests to protected routes (`/account`, `/account/edit`, `/posts/create`) reach the origin instead of being redirected at the edge, defeating the documented defense-in-depth routing guard (`.claude/rules/architecture.md`).

## Goals

- The middleware's `isAuthenticated` check (or an equivalent) is satisfied only by a real, completed session — never by in-flight PKCE/OAuth state alone.
- A visitor who starts but abandons login can always retry `/auth/login` and is still redirected away from protected routes until they complete a real login.

## Non-Goals

- Rewriting the OIDC/PKCE flow itself (`openid-client` usage, token exchange, `handleCallback` logic).
- Changing backend Cognito JWT verification (`authPlugin`) — real auth is still fully verified server-side.

## Requirements

### Functional

- Abandoning login (visiting `/auth/login` without completing it) and then revisiting `/auth/login` again must reach the real login page (redirect to Cognito), not bounce to Home.
- Hitting a protected route while only PKCE state (no real session) is present must still return a 307 redirect to `/auth/login?callbackUrl=...`, same as a visitor with no cookie at all.
- A fully completed login must be unaffected: session established, protected routes reachable, logout still works.

### Constraints

- Middleware (`proxy.ts`) only checks cookie presence/shape at the edge — it must not need to decrypt/verify the iron-session payload itself if avoidable, matching the existing "cookie presence, not validity" pattern in `.claude/rules/architecture.md`; if the fix requires the middleware to distinguish PKCE-state cookies from session cookies, prefer a scheme decidable from the edge (e.g. a distinct cookie/key) over one requiring a backend round-trip.
- Must not weaken the existing behavior where authentication is presence-only at the edge and real verification happens in the backend — this fix corrects *what* "presence" means, not the layering.

## Affected Areas

- [ ] `apps/nextjs-boilerplate` — `src/proxy.ts` (middleware auth check), `src/features/auth/server/services/auth.ts` (`handleLogin`/`handleCallback`), `src/features/auth/server/services/session.ts` (session/cookie shape)
- [ ] `shared/config` — none expected (no cross-app schema involved)

## Acceptance Criteria

- [ ] Visiting `/auth/login`, abandoning the flow, then visiting `/auth/login` again reaches the real login page (redirects to Cognito), not Home.
- [ ] Visiting a protected route (`/account`, `/account/edit`, `/posts/create`) after only initiating (not completing) login still returns a 307 redirect to `/auth/login?callbackUrl=...`, matching the no-cookie-at-all case.
- [ ] A genuinely completed login still works end-to-end (session established, protected routes accessible, logout still works) — no regression to the happy path.
- [ ] No change to how a fully authenticated session is validated on the backend (Cognito JWT verification in `authPlugin` is unaffected).

## Open Questions / Risks

- Two viable approaches exist for `/plan` to weigh: (a) split PKCE state and the final session into separate cookies, so the middleware can key off the session-only cookie's presence; or (b) keep one cookie but have the middleware/session check inspect it for actual auth fields (`userId`) rather than raw presence. Approach (a) keeps the middleware doing presence-only checks (cheaper, matches current architecture); approach (b) may require decrypting the iron-session payload at the edge, which has runtime/perf implications in middleware.
- Risk: whichever approach is chosen must not leave a window where a completed session is briefly indistinguishable from PKCE state (e.g. during the `setSessionData` write in `handleCallback` at `auth.ts:143-148`, which sets user fields then separately clears PKCE data in two sequential writes).
