# Deployment Environments

This document covers the two GitHub Actions environments (`dev` and `prod`), the variables and secrets each must hold, and the manual setup steps required in the GitHub UI.

## Overview

| Environment | Trigger                                                                                                                                                                         | Approval                                          | AWS account         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------- |
| `dev`       | Push to `main` — apps (`deploy.yml`, paths-filtered) and Terraform (`terraform-apply.yml`, `infra/terraform/**`) + `workflow_dispatch`                                          | None                                              | Dev member account  |
| `prod`      | `v*` tag pushes — apps and Terraform, same tag. First bring-up only: a reviewer-gated `workflow_dispatch` with `apply_prod: true` on `terraform-apply.yml` (see Runbook below). | Required reviewer (**twice** per tag — see below) | Prod member account |

**dev and prod are dedicated AWS accounts** (member accounts under a shared AWS Organization) — the account boundary, not just the resource-name prefix, is the isolation mechanism. Each account still uses `boilerplate-template-dev-*` / `boilerplate-template-prod-*` naming and its own ECR repositories, but a broad IAM policy or a mis-scoped delete in one account has no path to the other's resources. The one deliberate cross-account link is **image promotion**: prod's deploy role is granted read-only pull access to dev's ECR repos so the exact built digest can be promoted without a rebuild (see "Cross-Account Image Promotion" below).

PRs touching `infra/terraform/**` get an automatic `terraform plan` comment (dev) via `terraform-plan.yml`.

**Two prod approvals per release.** `terraform-apply.yml`'s prod job and `deploy.yml`'s prod jobs both run under `environment: prod`, and `deploy.yml`'s prod deploy jobs wait for that same-commit `terraform-apply.yml` run to finish (`wait-for-prod-infra` gate) before starting — enforcing Terraform-first ordering on a single `v*` tag. That means a release pauses at the reviewer gate twice: once for the prod Terraform apply, once for the prod app deploy. This is accepted so the release stays a single `v*` tag (no new trigger mechanism).

## Required GitHub UI Setup

These settings must be configured manually in **Settings → Environments** — no committed file enforces them.

### `dev` environment

1. Go to **Settings → Environments → New environment** and create `dev`.
2. Leave protection rules empty (no required reviewers, no wait timer).

### `prod` environment

1. Go to **Settings → Environments → New environment** and create `prod`.
2. Under **Deployment protection rules**, add at least one **Required reviewer**.
3. Optionally add a **Wait timer** (e.g. 5 minutes) as a deployment cool-down.

> **Important:** If the `prod` environment protection rule is not created, prod deploys will run automatically after dev without any approval gate.

## Environment Variables & Secrets

Set these under each environment in **Settings → Environments → \<name\> → Environment variables / Environment secrets**.

### Shared values (same for `dev` and `prod`)

| Name         | Type     | Value            | Notes      |
| ------------ | -------- | ---------------- | ---------- |
| `AWS_REGION` | variable | `ap-northeast-1` | AWS region |

### Per-environment values

| Name                           | Type       | `dev` value                                                                           | `prod` value                                                                           | Notes                                                                                                                                                                          |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AWS_ROLE_ARN`                 | **secret** | Dev OIDC role ARN                                                                     | Prod OIDC role ARN                                                                     | Different OIDC roles per environment; each is a Terraform output of its own root apply.                                                                                        |
| `ECR_BACKEND_REPOSITORY_URL`   | variable   | `<account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/boilerplate-template-dev-backend`  | `<account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/boilerplate-template-prod-backend`  | **Per-environment ECR repo** — Terraform output of that environment's own apply, not shared with dev.                                                                          |
| `ECR_FRONTEND_REPOSITORY_URL`  | variable   | `<account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/boilerplate-template-dev-frontend` | `<account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/boilerplate-template-prod-frontend` | Same per-environment split as the backend repo.                                                                                                                                |
| `STATIC_ASSETS_BUCKET`         | variable   | `boilerplate-template-dev-static-assets`                                              | `boilerplate-template-prod-static-assets`                                              | S3 bucket for Next.js static files                                                                                                                                             |
| `CLOUDFRONT_DISTRIBUTION_ID`   | variable   | Dev distribution ID                                                                   | Prod distribution ID                                                                   | CloudFront distribution for cache invalidation                                                                                                                                 |
| `TF_APPLY_ROLE_ARN`            | variable   | Dev terraform-apply role ARN                                                          | Prod terraform-apply role ARN                                                          | Read by `terraform-apply.yml` only. Prod's does not exist until the first prod apply — see Runbook.                                                                            |
| `SOURCE_ECR_ACCOUNT_ID`        | variable   | _(empty)_                                                                             | Dev account ID                                                                         | `TF_VAR_source_ecr_account_id` — the account prod's deploy role pulls source images from. Also passed to `promote-image` in `deploy.yml` so it can log in to the dev registry. |
| `PROMOTION_GRANTEE_ACCOUNT_ID` | variable   | Prod account ID                                                                       | _(empty)_                                                                              | `TF_VAR_promotion_grantee_account_id` — the account dev's ECR repo policy grants pull access to.                                                                               |

The app image itself is **built once** (in the `dev` environment, tagged with the release's commit SHA / `v*` tag) and never rebuilt per environment — see "Cross-account image promotion" below. `NEXT_PUBLIC_*` values are **not** part of this table: the frontend Docker image takes no `NEXT_PUBLIC_*` build-arg (see `.claude/rules/architecture.md`'s "build once, deploy many" rule); any config the browser needs at runtime (e.g. the Sentry DSN) is fetched from a runtime `/api/config` route, not baked into the image or read from a GitHub environment variable.

## Cross-Account Image Promotion (prod)

The frontend and backend images are built **once**, in the `dev` environment/account, tagged into the `dev` ECR repos (`<project>-dev-backend` / `<project>-dev-frontend`) at both `:<tag>` and `:latest`. Prod never runs `docker build`. Instead, `deploy.yml`'s `deploy-prod-backend` / `deploy-prod-frontend` jobs **pull the image from dev's ECR, retag it, and push it** into the prod account's ECR repos, then deploy the **prod-repo** URI. Registry-side blob-mount (`docker buildx imagetools create`) only works within a single account/region, so it can't be used once dev and prod are separate accounts — the promotion step authenticates to both registries (`aws-actions/amazon-ecr-login`'s `registries` input) and does a real pull-then-push. This is still idempotent: the promote step first checks `aws ecr describe-images` for the tag in the prod repo and skips the copy if it's already there (prod ECR repos are `IMMUTABLE_WITH_EXCLUSION`, so re-pushing an existing content tag would otherwise fail). Same digest, same tag — no rebuild, just a different transport.

This requires two cross-account grants, both derived from the account-ID variables above (see `.claude/rules/infra.md`'s cross-account design decisions):

- **Identity policy** on the prod deploy role: pull-only access to the dev ECR repo ARNs, built from `var.source_ecr_account_id` (`source_ecr_repository_arns` on the `github-oidc` module).
- **Resource policy** on dev's ECR repos: naming the prod deploy role as an allowed principal, built from `var.promotion_grantee_account_id` (`cross_account_pull_principal_arns` on the `ecr` module).

Both ARNs are constructed deterministically from account-ID variables rather than read from the other account's live state, so there's no bootstrap cycle — see "Two-Account Bring-Up Ordering" below.

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
                                                       │       ├── [prod reviewer gate] ──→ promote image + deploy-prod-backend
                                                       │       └── [prod reviewer gate] ──→ promote image + deploy-prod-frontend
```

Both environments deploy the **same image digest** — built once in `dev`, promoted cross-account (pull-then-push) into prod's ECR repos (see above). `IMAGE_TAG` = `v1.2.3`. `terraform-apply.yml` and `deploy.yml` both trigger off the same tag; `deploy.yml`'s prod jobs wait for `terraform-apply.yml`'s prod apply on that tag to conclude before starting, so infra always lands before the app.

### Hotfix

```
hotfix/* branch → merge to main → manually trigger release-please.yml (workflow_dispatch)
  → release-please creates patch tag v1.2.x
  → tag triggers the release pipeline above
```

## OIDC Role Scoping

- **Dev** OIDC role: lives in the dev account, trust restricted to the `dev` GitHub environment (`repo:org/repo:environment:dev`). Used by build jobs and dev deploy jobs — every one of them already declares `environment: dev`. Push-only on the dev ECR repos.
- **Prod** OIDC role: lives in the prod account, trust restricted to the `prod` GitHub environment (`repo:org/repo:environment:prod`). Used only by `deploy-prod-*` jobs. Push on the prod ECR repos, **plus pull-only** on the dev ECR repos (`source_ecr_repository_arns`, built from `var.source_ecr_account_id`) so it can pull the built image cross-account during promotion — no broader ECR scope than that.

Each account creates its **own** GitHub OIDC provider — the `github_oidc` module always creates it unconditionally now (no toggle, no data-source fallback), since a separate account never has an existing provider to resolve, unlike the earlier single-account model. Both roles' IAM trust policy enforces the same gate GitHub's environment protection rule does (rather than relying on workflow authors to always declare the right `environment:` key) — a compromised branch push with no `environment:` context cannot assume either role, and only jobs running in the `prod` GitHub environment (which requires reviewer approval) can assume the prod role.

## Per-Environment Hardening (`local.env_config`)

Prod runs a hardened configuration while dev stays cheap. All the differences live in **one** place — the `env_config` map in `infra/terraform/locals.tf`, keyed on `var.environment`. It resolves purely from `var.environment` (which CI sets via `TF_VAR_environment`), so it works with **no `-var-file`** — CI never passes one at all (`terraform-plan.yml` / `terraform-apply.yml` call `plan`/`apply` with no `-var-file` flag); every CI-supplied variable comes from the whitelist of `TF_VAR_*` exported by `terraform-env`. To tune a per-environment value, edit that map — nothing else.

This is deliberately a `locals` map, not a `variable` sourced from `vars/*.tfvars`. The `vars/*.tfvars` files (and their `TF_VAR_*` CI counterparts) exist for values a human must externally supply per environment — secrets, external resource IDs (Neon DB URL, Google OAuth client, Resend key, Sentry DSN) — things Terraform can't derive on its own. The hardening knobs here (log retention, concurrency, deployment strategy, alarm toggle, OIDC provider bootstrap) are internal policy that Terraform derives entirely from `var.environment`; making them `variable`s would mean also adding them to `terraform-env`, both workflows, and both GitHub environments' UI for no operational benefit. See `.claude/rules/infra.md` for the full rule.

| Key                                 | `dev`              | `prod`                           | Effect                                                                                                                        |
| ----------------------------------- | ------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `log_retention_days`                | `7`                | `30`                             | CloudWatch Lambda log retention                                                                                               |
| `reserved_concurrent_executions`    | `-1` (unreserved)  | `10`                             | Caps prod blast radius / cost; bounds each function's share of the account concurrency pool                                   |
| `provisioned_concurrent_executions` | `0` (off, no cost) | `2`                              | Pre-warmed Lambda envs on the alias to eliminate cold starts (prod only)                                                      |
| `deployment_config_name`            | `…LambdaAllAtOnce` | `…LambdaCanary10Percent5Minutes` | Prod shifts 10% of traffic first and watches alarms before going to 100%                                                      |
| `enable_alarms`                     | `false`            | `true`                           | Gates the `monitoring` module (`count`) so dev creates zero alarm resources                                                   |
| `cognito_deletion_protection`       | `"INACTIVE"`       | `"ACTIVE"`                       | Dev's user pool can be torn down freely; prod's requires deliberately flipping this before `terraform destroy` can remove it. |
| `s3_logs_expiration_days`           | `7`                | `90`                             | Access-log objects (CloudFront + S3) in the shared logs bucket self-delete after this many days                               |

`create_oidc_provider` used to live in this map (it differed dev/prod under the old single-account model), but isn't per-environment policy anymore — every environment is its own account, so the provider is always created. The `github_oidc` module dropped the toggle entirely: it now creates the OIDC provider unconditionally, with no variable and no data-source fallback (see "OIDC Role Scoping" above).

**Safe prod deploys.** In prod, CodeDeploy shifts traffic gradually and monitors CloudWatch alarms; if the new version errors, it auto-rolls-back (`DEPLOYMENT_STOP_ON_ALARM`, already in `auto_rollback_events`). The `modules/monitoring` module creates four alarms per release target — `Errors` and `Throttles` on the backend and frontend Lambda **aliases** — and CodeDeploy consumes their names via `alarm_names`. These alarms exist to **gate the deployment**, not to page a human: there is intentionally **no SNS topic**. Human error alerting stays on **Sentry** (app-side). CloudWatch still earns its place because CodeDeploy can only read CloudWatch alarms (not Sentry), and `Throttles` / init-crashes / timeouts never reach the app-level Sentry SDK — `Throttles` especially matters now that prod caps reserved concurrency. If you later want proactive push alerts for those platform-level signals, add an SNS topic (with a **customer-managed** KMS key — CloudWatch cannot publish to a topic encrypted with the AWS-managed `alias/aws/sns` key) and wire it into the alarms' `alarm_actions`.

## Prod `environment: prod` Variable/Secret Checklist

Every `vars.*` / `secrets.*` read under `environment: prod` across `deploy.yml`, `terraform-apply.yml`, and their composite actions, annotated by source:

| Name                                  | Kind     | Source                                                                                                                                                                       |
| ------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secrets.AWS_ROLE_ARN`                | secret   | **Terraform output** (`github_actions_role_arn`) — capture after the first prod apply.                                                                                       |
| `vars.TF_APPLY_ROLE_ARN`              | variable | **Terraform output** (`terraform_apply_role_arn`) — does not exist before the first prod apply; that apply must run with bootstrap-credentialed access (see Runbook step b). |
| `vars.ECR_BACKEND_REPOSITORY_URL`     | variable | **Terraform output** (`ecr_backend_repository_url`) — the **prod** repo, not the dev repo.                                                                                   |
| `vars.ECR_FRONTEND_REPOSITORY_URL`    | variable | **Terraform output** (`ecr_frontend_repository_url`) — the **prod** repo.                                                                                                    |
| `vars.STATIC_ASSETS_BUCKET`           | variable | **Terraform output** (`static_assets_bucket_name`).                                                                                                                          |
| `vars.CLOUDFRONT_DISTRIBUTION_ID`     | variable | **Terraform output** (`cloudfront_distribution_id`).                                                                                                                         |
| `vars.AWS_REGION`                     | variable | Manually set (`ap-northeast-1`).                                                                                                                                             |
| `secrets.TF_VAR_database_url`         | secret   | Manually set — Neon **prod branch** connection string (Step 0).                                                                                                              |
| `secrets.TF_VAR_google_client_id`     | secret   | Manually set — separate prod Google OAuth client (Step 0).                                                                                                                   |
| `secrets.TF_VAR_google_client_secret` | secret   | Manually set — same prod Google OAuth client (Step 0).                                                                                                                       |
| `secrets.TF_VAR_resend_api_key`       | secret   | Manually set — prod Resend API key (Step 0).                                                                                                                                 |
| `secrets.TF_VAR_session_secret`       | secret   | Manually set — freshly generated, distinct from dev (Step 0).                                                                                                                |
| `secrets.TF_VAR_backend_sentry_dsn`   | secret   | Manually set — prod **backend** Sentry project DSN, separate from the frontend's (Step 0).                                                                                   |
| `secrets.TF_VAR_frontend_sentry_dsn`  | secret   | Manually set — prod **frontend** Sentry project DSN, separate from the backend's (Step 0).                                                                                   |
| `vars.TF_VAR_root_domain`             | variable | Manually set (non-secret) — e.g. `ahmax99.online`.                                                                                                                           |
| `vars.TF_VAR_contact_to_email`        | variable | Manually set (non-secret).                                                                                                                                                   |
| `vars.TF_VAR_from_email`              | variable | Manually set (non-secret).                                                                                                                                                   |
| `vars.SOURCE_ECR_ACCOUNT_ID`          | variable | Manually set (non-secret) — the **dev** account ID. Also read directly by `deploy.yml`'s promote-image step for the cross-account registry login.                            |

The `dev` environment's equivalent checklist sets `vars.PROMOTION_GRANTEE_ACCOUNT_ID` (the **prod** account ID) instead of `SOURCE_ECR_ACCOUNT_ID` — see "Two-Account Bring-Up Ordering" below for which account sets which.

## Two-Account Bring-Up Ordering

Dev and prod each need their own account-level bootstrap (state bucket, OIDC provider, apply role — see `infra/terraform/bootstrap/README.md`) before the root module can apply into them. The cross-account ECR grants (dev → prod) are built from account-ID **variables**, not from reading the other account's live Terraform state, so there is no real bootstrap cycle — the order below is a straight sequence, not a two-pass dance:

1. **Provision the AWS Organization and the two member accounts** (dev, prod) — out of scope for this repo's Terraform; assumed done via the Org's own bring-up process before step 2.
2. **Bootstrap the dev account** (`infra/terraform/bootstrap/`, dev-account admin credentials): creates the dev state bucket, then the dev-account OIDC provider + dev apply role (`bootstrap/README.md` steps S1–S3, dev workspace only).
3. **Bootstrap the prod account** (prod-account admin credentials, same bootstrap module, prod workspace): creates the prod state bucket, then the **prod-account's own** OIDC provider + prod apply role — the `github_oidc` module always creates the provider now, so this is a full bootstrap in the prod account too, not a "provider already exists" shortcut.
4. **Apply dev** (`vars/dev.tfvars` with `promotion_grantee_account_id` set to the prod account ID, `source_ecr_account_id` left empty): creates dev's ECR repos, each with a resource policy naming the (not-yet-existing) prod deploy role ARN as an allowed pull principal — safe because that ARN is deterministic (`arn:aws:iam::<prod-account-id>:role/boilerplate-template-prod-github-actions-role`), not read from prod's state. Also creates dev's delegated Route 53 zone (`aws_route53_zone.delegated`).
5. **Delegate DNS for dev** (manual, cross-account — dev apply cannot write into prod's zone): read the `dev_zone_name_servers` output from step 4, then in the **prod** account create an `NS` record for `dev.<project>.<root_domain>` in the parent root-domain zone pointing at those name servers. ACM validation for dev's certificate will not complete until this propagates (can take minutes).
6. **Apply prod** (`vars/prod.tfvars` with `source_ecr_account_id` set to the dev account ID, `promotion_grantee_account_id` left empty): creates the prod deploy role — its identity policy grants pull on dev's ECR ARNs (also deterministic), and dev's repo policy from step 4 already names this exact role ARN, so the trust is live on both sides as soon as this apply completes. Prod writes directly into the root zone (`data.aws_route53_zone.main`) — no delegation needed on this side.
7. **Continue into "First bring-up" below** to wire up the `prod` GitHub environment and cut the first release.

**Local credential profiles.** Once dev and prod are separate accounts, a `terraform apply` run with the wrong local AWS profile can apply into the wrong account with no name-prefix safety net to catch it. Make the target account explicit for any local command (`AWS_PROFILE=<project>-dev` / `AWS_PROFILE=<project>-prod`, or equivalent), and remember `.claude/rules/infra.md` restricts local `apply`/`state`/`import` outside the bootstrap steps above — steady-state applies go through CI.

## Runbook

### First bring-up (empty `prod` environment → app live on the prod domain)

1. **Collect external prerequisites** and enter them as `prod` environment secrets: Neon prod-branch connection string, a separate prod Google OAuth client (id + secret), a prod Resend API key, a freshly generated `session_secret` (`openssl rand -base64 32`), and **two** prod Sentry DSNs — one for the backend project, one for the frontend project. Also set `vars.SOURCE_ECR_ACCOUNT_ID` (dev account ID) per the checklist above. Confirm `infra/terraform/vars/prod.tfvars` has no secret values (all secret fields stay empty — CI supplies them via `TF_VAR_*`).
2. **Run the first prod Terraform apply** (this is bring-up step 6 above). The prod `terraform-apply` OIDC role is _created by_ this apply, so it can't authorize itself — run it via the reviewer-gated `workflow_dispatch` (`terraform-apply.yml`, input `apply_prod: true`), using **user-authorized elevated/bootstrap credentials** for this one run (the `.claude/rules/infra.md` controlled-bring-up exception), not the not-yet-existing `vars.TF_APPLY_ROLE_ARN`. This also seeds the initial prod images via `terraform-bootstrap.sh` (env-agnostic — no `NEXT_PUBLIC_*` inputs).
3. **Capture the Terraform outputs** from that apply into the `prod` environment: `secrets.AWS_ROLE_ARN`, `vars.TF_APPLY_ROLE_ARN`, `vars.ECR_BACKEND_REPOSITORY_URL`, `vars.ECR_FRONTEND_REPOSITORY_URL`, `vars.STATIC_ASSETS_BUCKET`, `vars.CLOUDFRONT_DISTRIBUTION_ID` (see checklist above). All subsequent prod applies use `vars.TF_APPLY_ROLE_ARN`, not bootstrap credentials.
4. **Register the Google OAuth prod redirect URI** (`https://<prod-cognito-domain>/oauth2/idpresponse`) using the `cognito_domain` Terraform output from step 2/3, if it wasn't predictable ahead of time.
5. **Cut the first `v*` release tag.** `deploy.yml` builds once in dev and deploys to dev; `terraform-apply.yml`'s prod job re-applies (steady-state, idempotent) behind the `prod` reviewer gate; `deploy.yml`'s `wait-for-prod-infra` gate then unblocks, a second `prod` reviewer approval promotes the image (pull-then-push from dev's ECR, cross-account) and deploys prod. App is live on the prod domain.

### Steady-state releases (after bring-up)

```
merge Release PR → v* tag → dev deploys → [prod reviewer: terraform-apply] → [prod reviewer: deploy] → prod live
```

No manual variable wrangling — every `environment: prod` value used after bring-up is either a stable Terraform output (already captured) or a secret set once in step 1.
