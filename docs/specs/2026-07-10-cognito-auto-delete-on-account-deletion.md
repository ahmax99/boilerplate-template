# Spec: Cognito Auto-Delete on Account Deletion

> Status: Draft · 2026-07-10

## Problem / Context

The account-deletion flow (`DeleteAccountButton` → `useAccountActions.handleDeleteAccount` → `DELETE /api/account` → `DELETE /api/v1/users/:id` → `UserService.delete`) currently only removes the Prisma `User` row. It never touches the Cognito user pool, leaving an orphaned Cognito identity (email, sub, group membership) behind after the app-side account is gone.

While tracing this flow, a blocking prerequisite surfaced: `UserService.delete` (`apps/backend-boilerplate/src/modules/users/user.service.ts:98-108`) only allows the delete when `ability.can('manage', 'all')` — i.e. **Admins only**. `getUserPermissions` (`apps/backend-boilerplate/src/modules/auth/permission.ts`) grants the authenticated `Users` role `create`/`update`/`delete` on their own `Comment`, but grants **no** `delete` on `User` at all for that role. So today, a non-admin user clicking "Delete Account Permanently" gets a `403 FORBIDDEN` from the backend — the self-service delete-account flow doesn't actually work for ordinary users. This must be fixed as part of this issue, or the Cognito-deletion code added here would be unreachable for the common case.

## Goals

- A `Users`-role member can delete their own account end-to-end: the request succeeds, their `User` row is removed, and their Cognito user pool entry is removed.
- Admins retain their existing ability to delete any user (unchanged).

## Non-Goals

- Building an admin tool to bulk-delete or reconcile Cognito users orphaned by account deletions that happened before this change shipped.
- Guaranteeing atomicity between the Prisma delete and the Cognito delete (they are two different systems; see Open Questions).
- Any change to comment/post cascade behavior on user deletion beyond what already exists.

## Requirements

### Functional

- A `Users`-role user can delete their own `User` record via the existing `DELETE /api/v1/users/:id` endpoint when `:id` is their own id (mirroring the existing self-scoped `Comment` delete pattern in `permission.ts`). Admins keep unrestricted delete.
- On a successful `User` deletion (self-service or admin-initiated), the service also deletes the corresponding user from the Cognito user pool identified by `COGNITO_USERPOOL_ID` (already a validated env var in `apps/backend-boilerplate/src/config/env.ts`), using the deleted user's `cognitoSub` as the Cognito username.
- If the Cognito deletion call fails after the Prisma row is already gone, the failure surfaces through this repo's `AppError`/`ResultAsync` pipeline (not swallowed) so it's visible in logs/Sentry for manual reconciliation — the app-side deletion is not rolled back for this.

### Constraints

- Follow `.claude/rules/conventions.md`: logic lives in `UserService` (not the controller), wrapped via `catchAsyncError`; authorization is enforced through the CASL `ability` already threaded into `UserService.delete`, not a new ad hoc check.
- Requires adding `@aws-sdk/client-cognito-identity-provider` (this repo already depends on `@aws-sdk/client-s3` and `@aws-sdk/client-secrets-manager` at `^3.1083.0` — match that version line) and calling `AdminDeleteUserCommand`.
- The backend Lambda's execution role needs `cognito-idp:AdminDeleteUser` IAM permission for the user pool — this is an `infra/terraform/**` change. Per `.claude/rules/infra.md` and this repo's backlog-runner anomaly gate, any Terraform diff is routed to human review; `/plan` should call this out explicitly as a separate, reviewable step rather than bundling it invisibly into the backend code change.

## Affected Areas

- [x] `apps/backend-boilerplate` — `src/modules/auth/permission.ts` (CASL rule), `src/modules/users/user.service.ts` (Cognito delete call), `src/modules/users/user.plugin.ts` if a Cognito client needs decorating onto context
- [ ] `apps/nextjs-boilerplate` — not touched; existing delete-account UI flow is reused as-is
- [ ] `shared/config` — not touched; no schema shape changes
- [ ] `shared/neon` — not touched
- [x] `infra/terraform` — IAM permission grant for `cognito-idp:AdminDeleteUser` on the backend Lambda role

## Acceptance Criteria

- [ ] A user with the `Users` role can call `DELETE /api/v1/users/:id` with their own id and receive a success response (no more 403 for self-delete).
- [ ] A user with the `Users` role calling `DELETE /api/v1/users/:id` with **someone else's** id still receives `403 FORBIDDEN` (no authorization regression).
- [ ] After a successful self-delete, the user's Prisma `User` row no longer exists.
- [ ] After a successful self-delete, the user's Cognito user pool entry no longer exists (verifiable via `aws cognito-idp admin-get-user` returning not-found, or equivalent).
- [ ] Deleting an account through the app UI still ends in the existing logout redirect behavior (`useAccountActions.handleDeleteAccount`), unchanged.
- [ ] If the Cognito `AdminDeleteUser` call throws, the error is converted to an `AppError` via `catchAsyncError` (not an unhandled rejection or a swallowed failure), and the already-completed Prisma deletion is not silently hidden from observability (e.g. it's logged/reported to Sentry per the existing `catchAsyncError` behavior).
- [ ] An admin (`Admins` role) can still delete any user's account, including a user who isn't themselves — unchanged from current behavior.

## Open Questions / Risks

- **Cross-system atomicity**: the Prisma delete and the Cognito delete cannot share a transaction. `/plan` needs to pick an order (this spec assumes DB-then-Cognito, matching "the app-side account is the source of truth") and accept that a Cognito-side failure after a successful DB delete leaves a stale Cognito identity requiring manual cleanup — this is a known, accepted gap per the Non-Goals (no reconciliation tool in scope).
- **IAM change ships separately**: the Terraform grant for `cognito-idp:AdminDeleteUser` will need its own review per `infra.md`'s existing rule against unattended infra changes — `/plan` should sequence this as an explicit, separately-callable-out step, not something that gets silently bundled and then blocked by the backlog-runner's anomaly gate mid-implementation.
- Whether comments/posts authored by a deleted user should cascade-delete or be preserved (e.g. with a nulled/orphaned `authorId`) is pre-existing behavior, not something this issue changes — confirm current Prisma schema's `onDelete` behavior during `/plan` rather than assuming.
