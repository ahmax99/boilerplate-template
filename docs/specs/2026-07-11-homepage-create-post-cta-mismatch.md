# Spec: Homepage "Create a Post" CTA Misleads Non-Admin Users

> Status: Draft · 2026-07-11

## Problem / Context

The homepage's `FeatureSection` (`apps/nextjs-boilerplate/src/components/common/FeatureSection.tsx:13-19`) shows a "Create a post" card to every visitor, with copy implying that simply being signed in is enough ("Sign in and try the full write path..."). Post creation is actually gated to the `Admins` CASL group only (`apps/backend-boilerplate/src/modules/auth/permission.ts`, enforced again client-side in `CreatePostPage`, `apps/nextjs-boilerplate/src/app/(authorized)/posts/create/page.tsx:20-23`). A signed-in non-admin following this CTA lands back on Home with an "Only admins can create posts" error instead of the promised demo. The authorization itself is correct; this is a copy/UX mismatch, not a security issue. `PageHeader.tsx:24` already handles the equivalent case correctly by disabling the "Create" nav link when `!permission.can('create', 'Post')`.

## Goals

- A non-admin signed-in user is not invited by homepage copy into an action that will fail with a permissions error.
- The admin experience and the unauthenticated-visitor experience are unchanged.

## Non-Goals

- Changing the underlying authorization rule — post creation remaining Admin-only is intentional (matches the existing admin-post-delete feature).

## Requirements

### Functional

- The homepage "Create a post" CTA must not promise a capability the current viewer cannot use.
- `/plan` should choose between: (a) rewording the CTA copy so it's accurate regardless of who's viewing (e.g. "Admins can create posts — sign in as an admin to try the full write path"), or (b) making the CTA permission-aware like `PageHeader.tsx` (disable/hide for signed-in non-admins). Whichever is chosen should read as consistent with how the header nav already handles this same distinction.

### Constraints

- `FeatureSection` is currently a plain (non-async, no `'use client'`) server component rendered on the public homepage (`apps/nextjs-boilerplate/src/app/(public)/(main)/page.tsx`) with no awareness of the viewer's auth/permission state — unlike `PageHeader`, which is already an async server component calling `getMe()` + `getUserPermissions()`. If approach (b) is chosen, `/plan` must specify how `FeatureSection` obtains that state (e.g. becoming async like `PageHeader`) without duplicating the BFF call pattern.

## Affected Areas

- [ ] `apps/nextjs-boilerplate` — `src/components/common/FeatureSection.tsx`; possibly `src/app/(public)/(main)/page.tsx` if data-fetching moves up

## Acceptance Criteria

- [ ] A non-admin signed-in user is not invited by homepage copy to do something that will fail with a permissions error.
- [ ] An admin user's experience creating a post from the homepage CTA is unchanged.
- [ ] An unauthenticated visitor's experience (sign-in prompt via the protected route redirect) is unchanged.

## Open Questions / Risks

- Whether to fix by copy alone (simplest, no new data fetching) or by making the CTA permission-aware (more consistent with the header's existing pattern, but requires `FeatureSection` to fetch user/permission data) is left to `/plan` to decide, weighing complexity against consistency with `PageHeader.tsx`.
