# Spec: Blog List Empty State

> Status: Draft · 2026-07-10

## Problem / Context

`PostsListPage` (`apps/nextjs-boilerplate/src/app/(public)/(main)/posts/page.tsx`) fetches all posts via `fetchAllPosts()` and renders them through `PostsList` (`apps/nextjs-boilerplate/src/features/post/server/components/PostsList.tsx`), which maps over the `posts` array into a card grid. There is no pagination or filtering on this page today — `fetchAllPosts()` returns the full unfiltered list. When that list is empty (fresh install, or all posts deleted — the homepage redesign in #80 added admin post delete), the grid renders as an empty `<div>` with no content and no explanation, which reads as a broken page to a visitor.

## Goals

- A visitor landing on `/posts` with zero posts in the database sees a clear, intentional empty-state message instead of a blank grid.

## Non-Goals

- Adding pagination or filtering to the posts list — none exists today, so "empty filtered view" is out of scope.
- Redesigning `PostsListPage` or `PostsList` beyond the empty-state branch.
- Any backend/API changes — `fetchAllPosts()` and its route already return `[]` for zero posts; this is purely a rendering concern.

## Requirements

### Functional

- When `posts` is empty, `PostsList` (or `PostsListPage`) renders a default message (e.g. "No posts yet — check back soon.") in place of the card grid.
- When `posts` has one or more entries, rendering is unchanged from current behavior.

### Constraints

- Follow this repo's atomic-design layering (`.claude/rules/architecture.md`): the empty state is UI for a server component (`PostsList` has no `'use client'`, no hooks, no browser APIs) — the new markup must preserve that (no client directive, no hooks).
- Style with existing Tailwind/shadcn conventions already used on this page (e.g. `text-muted-foreground`, `container` spacing) rather than introducing new ad hoc classes/tokens.
- No new Zod schema or `@shared/config` changes — `Post[]` already models zero-or-more posts.

## Affected Areas

- [ ] `apps/backend-boilerplate` — not touched
- [x] `apps/nextjs-boilerplate` — `src/features/post/server/components/PostsList.tsx` (or `PostsListPage`), posts list route
- [ ] `shared/config` — not touched
- [ ] `shared/neon` — not touched

## Acceptance Criteria

- [ ] Visiting `/posts` with zero posts in the database shows a styled empty-state message (no blank/empty-looking grid).
- [ ] Visiting `/posts` with one or more posts renders the existing card grid exactly as before (no visual regression).
- [ ] The empty-state markup does not introduce a `'use client'` directive, React hooks, or browser APIs into a server component.

## Open Questions / Risks

- Exact copy for the empty-state message is not specified by the requester beyond an example ("No posts yet — check back soon.") — `/plan` should treat this as a reasonable default, not a hard requirement, and match the page's existing tone ("Insights, thoughts, and trends from our team").
