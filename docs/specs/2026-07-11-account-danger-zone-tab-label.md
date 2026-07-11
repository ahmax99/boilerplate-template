# Spec: "Delete Account Permanently" Is Mislabeled Under the "Accounts" Tab

> Status: Draft · 2026-07-11

## Problem / Context

`AccountManagement` (`apps/nextjs-boilerplate/src/features/account/client/components/AccountManagement.tsx`) has two tabs: "Profile" and "Accounts" (`LinkIcon`, `value="accounts"`, lines 51-54). The destructive delete-account action — headed "Danger Zone" (line 79) — lives entirely inside the "Accounts" tab. A tab labeled "Accounts" with a link icon reads like it should be about linked identity providers/connected social accounts, not where a user would expect "permanently delete my account." The only clue that this tab is destructive ("Danger Zone") is visible only after clicking in.

## Goals

- The tab containing the delete-account action is labeled/iconed so its content is not conflated with "Accounts" (linked identity providers).
- The destructive action's existing behavior (confirmation flow, delete request, logout redirect) is unchanged — this is a labeling/IA fix only.

## Non-Goals

- Any change to delete-account authorization or the underlying delete flow (tracked separately in the Cognito auto-delete work).
- Introducing an actual linked-accounts feature — this only avoids conflating "Accounts" with "Danger Zone" today; it should not preclude a real "Accounts" tab being added later.

## Requirements

### Functional

- Rename the "Accounts" tab (label and/or icon) — e.g. to "Danger Zone", matching the heading already used inside its content — so the tab's label reflects what it actually contains.
- Keep `DeleteAccountButton`'s existing behavior (confirmation dialog via `requireAreYouSure`, delete request, logout redirect) fully unchanged.

### Constraints

- The tab's `value` (currently `"accounts"`) is read from and written to the `?tab=` URL query param (`AccountManagement.tsx:34-41`); `/plan` should decide whether the `value`/query param string changes along with the label, and if so, whether any existing bookmarked/shared `?tab=accounts` links need to keep working.

## Affected Areas

- [ ] `apps/nextjs-boilerplate` — `src/features/account/client/components/AccountManagement.tsx`

## Acceptance Criteria

- [ ] The tab containing the delete-account action is labeled in a way that reflects its actual (destructive) content, not "Accounts".
- [ ] The "Delete Account Permanently" button's existing behavior (confirmation prompt, delete request, logout redirect) is unchanged.
- [ ] A future tab for actual linked/connected accounts would not be precluded by this fix — i.e. this change doesn't repurpose "Accounts" terminology in a way that blocks introducing it later.

## Open Questions / Risks

- Whether to change the tab's `value`/query-param string (`"accounts"` → e.g. `"danger-zone"`) alongside the label is left to `/plan`; low risk either way since this is an internal single-page tab state, not a public API.
