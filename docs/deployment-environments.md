# Deployment Environments

This document covers the two GitHub Actions environments (`dev` and `prod`) — their triggers, the pipeline flow between them, and the per-environment hardening. For the step-by-step bring-up (prerequisites, GitHub variable/secret tables, first applies), see [`runbook.md`](runbook.md).

## Overview

| Environment | Trigger                                                                                                                                                                                                                                                                                                                 | Approval                                          | AWS account         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------- |
| `dev`       | Push to `main` — apps (`deploy.yml`, paths-filtered) and Terraform (`terraform-apply.yml`, `infra/**`) + `workflow_dispatch`                                                                                                                                                                                            | None                                              | Dev member account  |
| `prod`      | `v*` tag pushes — apps and Terraform, same tag. Also reachable via `workflow_dispatch` run **against that tag ref**: `deploy.yml`'s prod jobs key off `ref_type`/`ref_name` (not `event_name`), and `terraform-apply.yml` additionally accepts `apply_prod: true` from any ref (first bring-up only — see the runbook). | Required reviewer (**twice** per tag — see below) | Prod member account |

**dev and prod are dedicated AWS accounts** (member accounts under a shared AWS Organization, managed by the [org repo](https://github.com/ahmax99/ahmax99-aws-org)) — the account boundary, not just the resource-name prefix, is the isolation mechanism. A third **shared-services** account hosts the two org-wide resources both environments depend on: the Route 53 apex zone and the **central ECR registry**. Account-level plumbing — the GitHub OIDC providers, per-account `gha-deploy` roles, the `gha-ecr-push` role, the `dns-apex-manager` role, DNS zones and delegation, and the ECR repositories themselves — is owned by the org repo, not this one; this repo's Terraform manages only the app infrastructure inside each environment account.

PRs touching `infra/**` get an automatic `terraform plan` comment (dev) via `terraform-plan.yml`.

**Two prod approvals per release.** `terraform-apply.yml`'s prod job and `deploy.yml`'s prod jobs both run under `environment: prod`, and `deploy.yml`'s prod deploy jobs wait for that same-commit `terraform-apply.yml` run to finish (`wait-for-prod-infra` gate) before starting — enforcing Terraform-first ordering on a single `v*` tag. That means a release pauses at the reviewer gate twice: once for the prod Terraform apply, once for the prod app deploy. This is accepted so the release stays a single `v*` tag (no new trigger mechanism).

## Central ECR (build once, deploy everywhere)

The frontend and backend images are built **once** per commit/tag and pushed into the central ECR repositories in the shared-services account (`<project>-backend` / `<project>-frontend` — env-agnostic names), tagged `:<tag>` and `:latest`. The build jobs assume the org-provided `gha-ecr-push` role directly — they carry no GitHub `environment:` and touch neither app account.

Both environments then deploy the **same image URI**: the repos' resource policy grants pull to any principal in the AWS Organization (`aws:PrincipalOrgID`), plus the Lambda service principal for cross-account function image pulls (see the runbook's prerequisites). There is **no image promotion step** — prod deploys the exact URI the build job produced, so digest identity between dev and prod is structural rather than enforced by a copy step.

Image URLs are never configured by hand: workflows derive them from `vars.CENTRAL_ECR_ACCOUNT_ID` + the repo name (`deploy.yml`'s `ECR_REGISTRY` env), and Terraform derives the same URLs from `var.central_ecr_account_id` (`infra/locals.tf`), so the two can't drift.

`NEXT_PUBLIC_*` values are **not** part of the build: the frontend Docker image takes no `NEXT_PUBLIC_*` build-arg (see `.claude/rules/architecture.md`'s "build once, deploy many" rule); any config the browser needs at runtime (e.g. the Sentry DSN) is fetched from a runtime `/api/config` route, not baked into the image.

## DNS

The apex zone (`<root_domain>`) lives in shared-services. The org repo delegates `dev.<root_domain>` into the dev account, where this repo's dev apply writes its records (`<project>.dev.<root_domain>`) directly — same-account, no cross-account role. Prod's records (`<project>.<root_domain>`) go into the apex zone itself, written cross-account through the org-provided `dns-apex-manager` role, which Terraform assumes via the `aws.dns` provider alias (`vars.DNS_ACCOUNT_ROLE_ARN` → `TF_VAR_dns_account_role_arn`; empty on dev, where `aws.dns` degrades to the ambient credentials).

## Pipeline Flow

### Day-to-day development (branch push to `main`)

```
push to main (paths match)
  └── detect (affected apps)
        ├── build-backend (if affected) ──→ deploy-dev-backend
        └── build-frontend (if affected) ─→ deploy-dev-frontend
```

Prod is not touched. `IMAGE_TAG` = commit SHA. Terraform: `terraform-apply.yml`'s `apply-dev` job also runs on this push if `infra/**` changed.

### Release (tag push `v*`)

```
release-please merges Release PR → creates tag v1.2.3
  ├── terraform-apply.yml: apply-dev ──→ [prod reviewer gate] ──→ apply-prod
  └── deploy.yml:
        detect (both apps, fail-safe)
          ├── build-backend ──→ deploy-dev-backend ─┐
          └── build-frontend ─→ deploy-dev-frontend ─┤
                                                       ├──→ wait-for-prod-infra (blocks until apply-prod above succeeds)
                                                       │       ├── [prod reviewer gate] ──→ deploy-prod-backend
                                                       │       └── [prod reviewer gate] ──→ deploy-prod-frontend
```

Both environments deploy the **same central-registry image URI** — built once, no per-environment copy. `IMAGE_TAG` = `v1.2.3`. `terraform-apply.yml` and `deploy.yml` both trigger off the same tag; `deploy.yml`'s prod jobs wait for `terraform-apply.yml`'s prod apply on that tag to conclude before starting, so infra always lands before the app.

### Hotfix

```
hotfix/* branch → merge to main → manually trigger release-please.yml (workflow_dispatch)
  → release-please creates patch tag v1.2.x
  → tag triggers the release pipeline above
```

## Release automation

`release-please.yml` and `auto-merge.yml` create commits, PR merges, and tags
on `main` — all of which are the exact events that trigger `terraform-apply.yml`
and `deploy.yml`. GitHub Actions has a deliberate anti-recursion rule for this:
_"events triggered by the `GITHUB_TOKEN` will not create a new workflow run,
even when the repository contains a workflow configured to run when `push`
events occur"_ (GitHub Actions docs). Two places in this pipeline hit that rule,
and each needed a different fix:

- **Merging the release PR.** `auto-merge.yml` used to auto-merge
  `release-please`'s PR on approval using `GITHUB_TOKEN`. That merge is a push
  to `main`, so it never re-triggered `release-please.yml` itself — the tag
  was never cut. Fix: that job was removed. A human now merges the release PR
  by hand (after approving it) — a merge from a real account is a normal push
  event, so `release-please.yml` runs immediately afterward.
- **Creating the release tag.** `release-please.yml` still needs to create the
  `v*` tag (and the GitHub Release) itself, and doing that with `GITHUB_TOKEN`
  hits the same rule — the tag push wouldn't trigger `terraform-apply.yml` or
  `deploy.yml`. Fix: it authenticates as a **GitHub App** installation instead
  (minted per-run via `actions/create-github-app-token`, short-lived and
  scoped to just this repo's `contents`/`pull-requests` permissions) —
  preferred over a long-lived PAT for the same reason this repo avoids static
  AWS keys elsewhere (see `.claude/rules/infra.md`). See
  [`runbook.md`'s prerequisite 5](runbook.md#5-release-automation-github-app-repo-level-one-time)
  for how to create and install that App.

Net effect: a release PR still needs a human to click merge, but from there
the tag, the prod Terraform apply, and the prod app deploy all cascade
automatically, same as before these fixes.

## OIDC Roles

GitHub→AWS authentication uses the OIDC **providers** the org repo creates in each member account. The account-level roles (below) are org-owned; the one app-specific role, `gha-app-deploy`, is created by **this repo's own Terraform** against that provider. Each role is scoped to the least privilege its step needs:

- **`gha-ecr-push`** (shared-services, _org-owned_): assumed by the build jobs from any ref; push/pull scoped to the shared-services registry only. Read into the workflows as repo-level `vars.ECR_PUSH_ROLE_ARN`.
- **`gha-plan`** (dev, read-only, _org-owned_): assumed by the PR `terraform plan` job (`vars.TF_PLAN_ROLE_ARN`, repo-level — plans only run against dev). `ReadOnlyAccess` plus a scoped `secretsmanager:GetSecretValue` on the dev project secrets (plan refreshes the secret-version resources, which `ReadOnlyAccess` alone can't read) — no write/apply, so a tampered PR can't mutate state or resources; the plan runs `-lock=false` because the role can't write the S3-native lock.
- **`gha-deploy`** (dev / prod, admin, _org-owned_): assumed by `terraform-apply.yml` (`vars.TF_APPLY_ROLE_ARN` per env). Broad by necessity — Terraform manages the whole account's app infra. The prod role's trust requires the `environment:prod` OIDC subject claim, so only the reviewer-gated `prod` environment can assume it.
- **`gha-app-deploy`** (dev / prod, scoped, _created by this repo_): assumed by `deploy.yml`'s app deploy jobs (`vars.APP_DEPLOY_ROLE_ARN` per env). This repo's `modules/github-deploy-role` creates it against the org-provided OIDC provider (discovered via a `data` lookup) and scopes its inline policy to the **exact ARNs** of the Lambda functions, CodeDeploy apps, static-assets bucket, CloudFront distribution, and ECR repos this Terraform manages — tighter than a name wildcard, and owned next to the resources it grants. The prod role's trust requires the `environment:prod` claim.

Trust policies pin the **numeric** GitHub org/repo IDs (immutable subject claims), so renamed or recreated repos don't inherit access — the org roles from the org repo's variables, and `gha-app-deploy` from `TF_VAR_github_org*`/`_repo_id`, which CI supplies from the Actions context.

## Per-Environment Hardening (`local.env_config`)

Prod runs a hardened configuration while dev stays cheap. All the differences live in **one** place — the `env_config` map in `infra/locals.tf`, keyed on `var.environment`. It resolves purely from `var.environment` (which CI sets via `TF_VAR_environment`), so it works with **no `-var-file`** — CI never passes one at all (`terraform-plan.yml` / `terraform-apply.yml` call `plan`/`apply` with no `-var-file` flag); every CI-supplied variable comes from the whitelist of `TF_VAR_*` exported by `terraform-env`. To tune a per-environment value, edit that map — nothing else.

This is deliberately a `locals` map, not a `variable` sourced from `vars/*.tfvars`. The `vars/*.tfvars` files (and their `TF_VAR_*` CI counterparts) exist for values a human must externally supply per environment — secrets, external resource IDs (Neon DB URL, Google OAuth client, Resend key, Sentry DSN), cross-account identifiers (`central_ecr_account_id`, `dns_account_role_arn`) — things Terraform can't derive on its own. The hardening knobs here (log retention, concurrency, deployment strategy, alarm toggle) are internal policy that Terraform derives entirely from `var.environment`; making them `variable`s would mean also adding them to `terraform-env`, both workflows, and both GitHub environments' UI for no operational benefit. See `.claude/rules/infra.md` for the full rule.

| Key                                 | `dev`              | `prod`                           | Effect                                                                                                                        |
| ----------------------------------- | ------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `log_retention_days`                | `7`                | `30`                             | CloudWatch Lambda log retention                                                                                               |
| `reserved_concurrent_executions`    | `-1` (unreserved)  | `10`                             | Caps prod blast radius / cost; bounds each function's share of the account concurrency pool                                   |
| `provisioned_concurrent_executions` | `0` (off, no cost) | `2`                              | Pre-warmed Lambda envs on the alias to eliminate cold starts (prod only)                                                      |
| `deployment_config_name`            | `…LambdaAllAtOnce` | `…LambdaCanary10Percent5Minutes` | Prod shifts 10% of traffic first and watches alarms before going to 100%                                                      |
| `enable_alarms`                     | `false`            | `true`                           | Gates the `monitoring` module (`count`) so dev creates zero alarm resources                                                   |
| `cognito_deletion_protection`       | `"INACTIVE"`       | `"ACTIVE"`                       | Dev's user pool can be torn down freely; prod's requires deliberately flipping this before `terraform destroy` can remove it. |
| `s3_logs_expiration_days`           | `7`                | `90`                             | Access-log objects (CloudFront + S3) in the shared logs bucket self-delete after this many days                               |

**Safe prod deploys.** In prod, CodeDeploy shifts traffic gradually and monitors CloudWatch alarms; if the new version errors, it auto-rolls-back (`DEPLOYMENT_STOP_ON_ALARM`, already in `auto_rollback_events`). The `modules/monitoring` module creates four alarms per release target — `Errors` and `Throttles` on the backend and frontend Lambda **aliases** — and CodeDeploy consumes their names via `alarm_names`. These alarms exist to **gate the deployment**, not to page a human: there is intentionally **no SNS topic**. Human error alerting stays on **Sentry** (app-side). CloudWatch still earns its place because CodeDeploy can only read CloudWatch alarms (not Sentry), and `Throttles` / init-crashes / timeouts never reach the app-level Sentry SDK — `Throttles` especially matters now that prod caps reserved concurrency. If you later want proactive push alerts for those platform-level signals, add an SNS topic (with a **customer-managed** KMS key — CloudWatch cannot publish to a topic encrypted with the AWS-managed `alias/aws/sns` key) and wire it into the alarms' `alarm_actions`.

## Setup

Bring-up of a new environment — prerequisites, the GitHub variable/secret tables, state-bucket creation, first applies, and the release flow — is documented step by step in [`runbook.md`](runbook.md).
