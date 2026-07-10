# Spec: Homepage Redesign + Admin Post Delete

> Status: Draft · 2026-07-10

## Problem / Context

The `nextjs-boilerplate` homepage (`HeroSection` + `FeatureSection`) reads as a generic tutorial/blog demo ("Welcome to My Blog", a 2-card icon-heading-text grid) and directly contradicts the app's own `DESIGN.md` ("Boilerplate Baseline" — monochrome, quiet, technical; explicitly rejects "identical icon-heading-text card grids") and `PRODUCT.md` (the demo should read as extensible scaffolding, not admired content). Since this repo is meant to be used as a starter template, the first thing a new user sees should look deliberately designed, not like a tutorial.

Separately, there's no way to delete a post from the UI. The backend already supports it — `DELETE /posts/:id` (`post.controller.ts:110`) plus `post.service.ts`'s `delete()` already soft-deletes via `ability.can('delete', subject('Post', post))`, and `permission.ts:23`'s `can('manage', 'all')` for the `Admins` Cognito group already makes it admin-only server-side. The gap is entirely frontend: no delete button exists anywhere, and the BFF route handler at `api/posts/[postId]/route.ts` only exports `GET`.

## Goals

- The homepage visually and textually matches `DESIGN.md`'s defined design language — no generic blog-tutorial framing, no icon-heading-text card grid anti-pattern.
- An admin (a user in the Cognito `Admins` group) can delete a post from the UI (at minimum from the post detail page), with the request enforced server-side by the already-existing CASL rule.

## Non-Goals

- No backend, service, or CASL changes — the server-side admin-only delete authorization already exists and is out of scope to modify.
- No changes to post creation, editing, or comment functionality.
- No changes to Cognito groups/roles or the auth/authentication flow.
- No new marketing routes (`/pricing`, `/about`, etc.) unless the homepage redesign genuinely needs one — default to reworking the existing home route only.
- No changes to `(authorized)/account` pages.

## Requirements

### Functional

- Home page (`app/(public)/(main)/page.tsx`) presents hero + supporting content that reflects a "starter template" framing rather than a blog tutorial, and does not use an undifferentiated icon-card grid for its feature/supporting section.
- A user whose CASL ability includes `can('delete', subject('Post', post))` sees a delete affordance on the post detail page; other users (including unauthenticated visitors) do not see it.
- Triggering delete calls through to the existing `DELETE /posts/:id` backend route and, on success, removes the post from view / navigates the user away from the now-deleted post.
- A direct call to the new BFF `DELETE` route handler by a non-admin still receives the backend's `403` — the UI hiding the button is not the only enforcement (defense in depth already exists server-side; the new frontend code must not swallow or mask that error).

### Constraints

- Must follow the `app-design` skill (impeccable + shadcn + `.claude/rules/conventions.md` atomic-design placement) for all new/changed UI.
- New delete-post UI belongs in `apps/nextjs-boilerplate/src/features/posts/client/` (feature-specific), not `src/components/`.
- The new BFF route handler follows the existing pattern used elsewhere in this codebase for authenticated write calls (`serverAuthApiClient`), matching how `DeleteCommentButton`'s route handler already does this for comments.
- CASL visibility check on the frontend must mirror the backend rule (admin/`manage all`), using the existing `PermissionProvider`/ability pattern already used elsewhere in the app — not a hardcoded role string check.

## Affected Areas

- [x] `apps/nextjs-boilerplate` — home page + `common/` sections (redesign); `features/posts/client/` (new delete UI); `app/api/posts/[postId]/route.ts` (new `DELETE` handler)
- [ ] `apps/backend-boilerplate` — none (already supports this)
- [ ] `shared/config` — none expected (no new request/response shape beyond what the existing `DELETE /posts/:id` route already returns)
- [ ] `shared/neon` — none

## Acceptance Criteria

- [ ] The homepage no longer contains the literal "Welcome to My Blog" copy or any wording that reads as blog-tutorial content rather than template/starter framing.
- [ ] The redesigned homepage does not use an undifferentiated icon-heading-text card grid (`DESIGN.md`'s anti-pattern list).
- [ ] The redesigned homepage matches `DESIGN.md`'s defined palette, typography, radii, and shadow/border language.
- [ ] A user in the `Admins` Cognito group sees a delete action on the post detail page that, on confirmation, calls `DELETE /posts/:id` and removes the post from view / navigates away on success.
- [ ] A non-admin authenticated user and an unauthenticated visitor do not see the delete action on the post detail page.
- [ ] A direct `DELETE` call to the new BFF route handler by a non-admin still results in a `403` surfaced from the backend (not swallowed).
- [ ] `bunx react-doctor@latest --verbose --scope changed` reports no new errors.
- [ ] No files under `apps/backend-boilerplate/**` are modified.

## Open Questions / Risks

- Whether the delete affordance also belongs on the posts list page, not just the detail page — left to `/plan` to decide based on what reads better; not required by acceptance criteria above (detail page is the floor).
- Confirmation UX for delete (dialog vs. inline) — this repo already has `AlertDialog` (molecules) and `DeleteAccountButton`/`DeleteCommentButton` as existing precedent; `/plan` should follow the closest existing pattern rather than invent a new one.
