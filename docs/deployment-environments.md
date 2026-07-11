# Deployment Environments

This document covers the two GitHub Actions environments (`dev` and `prod`), the variables and secrets each must hold, and the manual setup steps required in the GitHub UI.

## Overview

| Environment | Trigger                                                                                                                                | Approval          | AWS account |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ----------- |
| `dev`       | Push to `main` — apps (`deploy.yml`, paths-filtered) and Terraform (`terraform-apply.yml`, `infra/terraform/**`) + `workflow_dispatch` | None              | Shared      |
| `prod`      | `v*` tag pushes — apps and Terraform, same tag                                                                                         | Required reviewer | Shared      |

Both environments deploy to the **same AWS account**. Namespace isolation is by resource naming prefix (`boilerplate-template-dev-*` vs `boilerplate-template-prod-*`).

PRs touching `infra/terraform/**` get an automatic `terraform plan` comment (dev) via `terraform-plan.yml`.

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

| Name                          | Type     | Value                                                                                 | Notes                                                                          |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `AWS_REGION`                  | variable | `ap-northeast-1`                                                                      | AWS region                                                                     |
| `ECR_BACKEND_REPOSITORY_URL`  | variable | `<account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/boilerplate-template-dev-backend`  | ECR repos are owned by the dev Terraform state and shared between environments |
| `ECR_FRONTEND_REPOSITORY_URL` | variable | `<account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/boilerplate-template-dev-frontend` | Same shared ECR                                                                |

### Per-environment values

| Name                         | Type       | `dev` value                              | `prod` value                              | Notes                                                                                                  |
| ---------------------------- | ---------- | ---------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `AWS_ROLE_ARN`               | **secret** | Dev OIDC role ARN                        | Prod OIDC role ARN                        | Different OIDC roles per environment. The prod ARN is output by the prod Terraform apply (sub-plan 2). |
| `STATIC_ASSETS_BUCKET`       | variable   | `boilerplate-template-dev-static-assets` | `boilerplate-template-prod-static-assets` | S3 bucket for Next.js static files                                                                     |
| `CLOUDFRONT_DISTRIBUTION_ID` | variable   | Dev distribution ID                      | Prod distribution ID                      | CloudFront distribution for cache invalidation                                                         |
| `NEXT_PUBLIC_BASE_URL`       | variable   | `https://dev.your-domain.com`            | `https://your-domain.com`                 | Public base URL injected at Docker build time                                                          |
| `NEXT_PUBLIC_SENTRY_DSN`     | variable   | Dev Sentry DSN                           | Prod Sentry DSN                           | Sentry project DSN (can be the same project)                                                           |

> The `AWS_ROLE_ARN` for `dev` is output by running `terraform output` in `infra/terraform/` with `backends/dev.hcl`. The `prod` ARN is output by the same root with `backends/prod.hcl`.

## Pipeline Flow

### Day-to-day development (branch push to `main`)

```
push to main (paths match)
  └── detect (affected apps)
        ├── build-backend (if affected) ──→ deploy-dev-backend
        └── build-frontend (if affected) ─→ deploy-dev-frontend
```

Prod is not touched. `IMAGE_TAG` = commit SHA.

### Release (tag push `v*`)

```
release-please merges Release PR → creates tag v1.2.3
  └── detect (both apps, fail-safe)
        ├── build-backend ──→ deploy-dev-backend ──→ [approval gate] ──→ deploy-prod-backend
        └── build-frontend ─→ deploy-dev-frontend ─→ [approval gate] ──→ deploy-prod-frontend
```

Both environments use the **same image URI** — the image built once at `ECR_URL:v1.2.3`. `IMAGE_TAG` = `v1.2.3`.

### Hotfix

```
hotfix/* branch → merge to main → manually trigger release-please.yml (workflow_dispatch)
  → release-please creates patch tag v1.2.x
  → tag triggers the release pipeline above
```

## OIDC Role Scoping

- **Dev** OIDC role: allows any ref from this repository (`repo:org/repo:*`). Used by build jobs and dev deploy jobs.
- **Prod** OIDC role: restricted to the `prod` GitHub environment (`repo:org/repo:environment:prod`). Used only by `deploy-prod-*` jobs. Provisioned in sub-plan 2.

This means a compromised branch push cannot assume the prod role — only jobs running in the GitHub `prod` environment (which requires reviewer approval) can do so.
