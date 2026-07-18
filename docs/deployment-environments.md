# Deployment Environments

This document covers the two GitHub Actions environments (`dev` and `prod`) — their triggers, the pipeline flow between them, and the per-environment hardening. For the step-by-step bring-up (prerequisites, GitHub variable/secret tables, first applies), see [`runbook.md`](runbook.md).

## Overview

| Environment | Trigger                                                                                                                                                                       | Approval                                          | AWS account         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------- |
| `dev`       | Push to `main` — apps (`deploy.yml`, paths-filtered) and Terraform (`terraform-apply.yml`, `infra/terraform/**`) + `workflow_dispatch`                                        | None                                              | Dev member account  |
| `prod`      | `v*` tag pushes — apps and Terraform, same tag. First bring-up only: a reviewer-gated `workflow_dispatch` with `apply_prod: true` on `terraform-apply.yml` (see the runbook). | Required reviewer (**twice** per tag — see below) | Prod member account |

**dev and prod are dedicated AWS accounts** (member accounts under a shared AWS Organization, managed by the [org repo](https://github.com/ahmax99/ahmax99-aws-org)) — the account boundary, not just the resource-name prefix, is the isolation mechanism. A third **shared-services** account hosts the two org-wide resources both environments depend on: the Route 53 apex zone and the **central ECR registry**. Account-level plumbing — the GitHub OIDC providers, per-account `gha-deploy` roles, the `gha-ecr-push` role, the `dns-apex-manager` role, DNS zones and delegation, and the ECR repositories themselves — is owned by the org repo, not this one; this repo's Terraform manages only the app infrastructure inside each environment account.

PRs touching `infra/terraform/**` get an automatic `terraform plan` comment (dev) via `terraform-plan.yml`.

**Two prod approvals per release.** `terraform-apply.yml`'s prod job and `deploy.yml`'s prod jobs both run under `environment: prod`, and `deploy.yml`'s prod deploy jobs wait for that same-commit `terraform-apply.yml` run to finish (`wait-for-prod-infra` gate) before starting — enforcing Terraform-first ordering on a single `v*` tag. That means a release pauses at the reviewer gate twice: once for the prod Terraform apply, once for the prod app deploy. This is accepted so the release stays a single `v*` tag (no new trigger mechanism).

## Central ECR (build once, deploy everywhere)

The frontend and backend images are built **once** per commit/tag and pushed into the central ECR repositories in the shared-services account (`<project>-backend` / `<project>-frontend` — env-agnostic names), tagged `:<tag>` and `:latest`. The build jobs assume the org-provided `gha-ecr-push` role directly — they carry no GitHub `environment:` and touch neither app account.

Both environments then deploy the **same image URI**: the repos' resource policy grants pull to any principal in the AWS Organization (`aws:PrincipalOrgID`), plus the Lambda service principal for cross-account function image pulls (see the runbook's prerequisites). There is **no image promotion step** — prod deploys the exact URI the build job produced, so digest identity between dev and prod is structural rather than enforced by a copy step.

Image URLs are never configured by hand: workflows derive them from `vars.CENTRAL_ECR_ACCOUNT_ID` + the repo name (`deploy.yml`'s `ECR_REGISTRY` env), and Terraform derives the same URLs from `var.central_ecr_account_id` (`infra/terraform/locals.tf`), so the two can't drift.

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

Prod is not touched. `IMAGE_TAG` = commit SHA. Terraform: `terraform-apply.yml`'s `apply-dev` job also runs on this push if `infra/terraform/**` changed.

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

## OIDC Roles (org-provided)

All GitHub→AWS authentication uses the OIDC providers and roles created by the org repo — this repo's Terraform creates none of its own:

- **`gha-ecr-push`** (shared-services): assumed by the build jobs from any ref; push/pull scoped to the shared-services registry only. Read into the workflows as repo-level `vars.ECR_PUSH_ROLE_ARN`.
- **`gha-deploy`** (dev): assumed by dev deploy jobs and dev Terraform plan/apply (`secrets.AWS_ROLE_ARN` / `vars.TF_APPLY_ROLE_ARN` / `vars.TF_PLAN_ROLE_ARN` in the `dev` scope). Trust allows any ref of this repo.
- **`gha-deploy`** (prod): assumed by prod deploy jobs and prod Terraform apply. Its trust policy requires the `environment:prod` OIDC subject claim, so only jobs running in the `prod` GitHub environment — which requires reviewer approval — can assume it; a compromised branch push with no `environment:` context cannot.

The org repo pins the **numeric** GitHub org/repo IDs in the trust policies (immutable subject claims), so renamed or recreated repos don't inherit access.

## Per-Environment Hardening (`local.env_config`)

Prod runs a hardened configuration while dev stays cheap. All the differences live in **one** place — the `env_config` map in `infra/terraform/locals.tf`, keyed on `var.environment`. It resolves purely from `var.environment` (which CI sets via `TF_VAR_environment`), so it works with **no `-var-file`** — CI never passes one at all (`terraform-plan.yml` / `terraform-apply.yml` call `plan`/`apply` with no `-var-file` flag); every CI-supplied variable comes from the whitelist of `TF_VAR_*` exported by `terraform-env`. To tune a per-environment value, edit that map — nothing else.

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
