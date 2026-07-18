# Deployment Runbook

Step-by-step bring-up of the `dev` and `prod` environments, from an empty AWS
member account to the app live on its domain. The reference documentation for
what the environments _are_ (triggers, pipeline flow, hardening) lives in
[`deployment-environments.md`](deployment-environments.md) — this file is the
_how_, in execution order.

## Architecture recap

Three AWS member accounts under the org (managed by the separate
[`ahmax99-aws-org`](https://github.com/ahmax99/ahmax99-aws-org) repo — "the org
repo"):

| Account           | Owns                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shared-services` | Route 53 apex zone (`<root_domain>`), **central ECR** (`<project>-backend` / `<project>-frontend`), `gha-ecr-push` role, `dns-apex-manager` role |
| `dev`             | `dev.<root_domain>` zone (delegated by the org repo), all dev app infra, `gha-deploy` role                                                       |
| `prod`            | All prod app infra, `gha-deploy` role (assumable only from the `prod` GitHub environment)                                                        |

Images are **built once** into the central ECR (org-wide pull via
`aws:PrincipalOrgID`) and deployed by digest-identical URI to both
environments — there is no per-environment registry and no image promotion
step. App domains: `<project>.dev.<root_domain>` (dev),
`<project>.<root_domain>` (prod).

## Prerequisites

### 1. Org repo applied

The org repo's `accounts` stack must be applied and providing (check its
`terraform output`):

- The three member accounts, with this repo registered in `app_repositories`
  and its ECR repos in `ecr_repositories`.
- `dev_deploy_role_arn` / `prod_deploy_role_arn` — the per-account
  `gha-deploy` OIDC roles.
- `ecr_push_role_arn` — the shared-services `gha-ecr-push` role.
- `dns_apex_manager_role_arn` — the shared-services role prod assumes for
  apex-zone DNS writes.
- `ecr_repository_urls` — the central repos.
- `shared_services_account_id` — the account hosting the central ECR; becomes
  `CENTRAL_ECR_ACCOUNT_ID` below.
- Apex zone NS records set at the registrar (`apex_zone_name_servers` output),
  and the `dev.<root_domain>` zone + NS delegation created in the dev account.

### 2. Org repo requirements this pipeline depends on

Two properties of the central ECR repos this repo's pipeline assumes — verify
they hold in the org repo before first use:

- **Re-pushable `latest` tag.** The pipeline pushes `:latest` on every build
  and Terraform's Lambda definitions reference it, so the repos need
  `image_tag_mutability = "IMMUTABLE_WITH_EXCLUSION"` with a `latest*`
  wildcard exclusion filter — a strict `IMMUTABLE` registry rejects the second
  `:latest` push.
- **Lambda service-principal pull.** Cross-account Lambda container images
  require the repo policy to grant `ecr:BatchGetImage` +
  `ecr:GetDownloadUrlForLayer` to the **`lambda.amazonaws.com` service
  principal** (scoped org-wide with an `aws:SourceOrgID` condition), in
  addition to the org-wide account-principal pull statement. Without it,
  function creation/updates in dev/prod fail to pull the image. Provided by the
  org repo's `modules/ecr` (`LambdaServicePull` statement).

### 3. External SaaS accounts (per environment)

Collect before starting an environment; entered as GitHub environment secrets
in the steps below:

- **Neon**: a connection string per environment (separate branch or database).
- **Google OAuth**: a separate OAuth client per environment (redirect URI is
  registered after the first apply — step D6/P5).
- **Resend**: API key.
- **Sentry**: **two** DSNs per environment — one backend project, one frontend
  project.
- A fresh `session_secret` per environment: `openssl rand -base64 32`.

### 4. Local tooling (for the one manual step per environment)

Terraform ≥ 1.14 and admin (or SSO) credentials for the target member account
— used only to create that environment's state bucket. Everything after that
runs through GitHub Actions. Make the target account explicit
(`AWS_PROFILE=<project>-dev` / `-prod`); a wrong-profile apply lands in the
wrong account with no name-prefix safety net.

## GitHub configuration reference

Set under **Settings → Secrets and variables → Actions** (repo level) and
**Settings → Environments → `<env>`** (environment level).

### Repo-level variables (shared by both environments)

| Name                      | Value                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| `AWS_REGION`              | e.g. `ap-northeast-1`                                              |
| `CENTRAL_ECR_ACCOUNT_ID`  | org output `shared_services_account_id`                            |
| `ECR_PUSH_ROLE_ARN`       | org repo output `ecr_push_role_arn`                                |
| `TF_PLAN_ROLE_ARN`        | org repo output `dev_deploy_role_arn` (plans only ever run on dev) |
| `TF_VAR_root_domain`      | e.g. `ahmax99.online`                                              |
| `TF_VAR_contact_to_email` | contact-form recipient                                             |
| `TF_VAR_from_email`       | sender address (on the root domain)                                |

### Per-environment values

| Name                          | Kind     | `dev`                              | `prod`                                 |
| ----------------------------- | -------- | ---------------------------------- | -------------------------------------- |
| `DEPLOY_ROLE_ARN`             | variable | org output `dev_deploy_role_arn`   | org output `prod_deploy_role_arn`      |
| `DNS_ACCOUNT_ROLE_ARN`        | variable | _(leave empty)_                    | org output `dns_apex_manager_role_arn` |
| `STATIC_ASSETS_BUCKET`        | variable | Terraform output after first apply | Terraform output after first apply     |
| `CLOUDFRONT_DISTRIBUTION_ID`  | variable | Terraform output after first apply | Terraform output after first apply     |
| `TF_VAR_database_url`         | secret   | dev Neon connection string         | prod Neon connection string            |
| `TF_VAR_google_client_id`     | secret   | dev OAuth client                   | separate prod OAuth client             |
| `TF_VAR_google_client_secret` | secret   | dev OAuth client                   | prod OAuth client                      |
| `TF_VAR_resend_api_key`       | secret   | Resend key                         | prod Resend key                        |
| `TF_VAR_session_secret`       | secret   | fresh `openssl rand -base64 32`    | fresh, distinct from dev               |
| `TF_VAR_backend_sentry_dsn`   | secret   | dev backend Sentry project         | prod backend Sentry project            |
| `TF_VAR_frontend_sentry_dsn`  | secret   | dev frontend Sentry project        | prod frontend Sentry project           |

> **`DEPLOY_ROLE_ARN`** is the org-provided `gha-deploy` role for that account —
> a single per-environment value used by both the app deploy jobs (`deploy.yml`)
> and the Terraform apply jobs (`terraform-apply.yml`). It's a variable, not a
> secret (an IAM role ARN isn't sensitive). The read-only plan role
> (`TF_PLAN_ROLE_ARN`, repo-level) stays separate because plans only ever run
> against dev.

> **`DNS_ACCOUNT_ROLE_ARN`** follows the DNS ownership split: **empty ⇒ the
> zone is in this account**, so no cross-account hop is needed. Dev writes into
> its own `dev.<root_domain>` zone (delegated into the dev account by the org),
> so it stays empty and the `aws.dns` provider falls back to ambient
> credentials. Prod writes into the apex zone in shared-services, a different
> account, so it assumes the `dns-apex-manager` role.

There are **no** per-environment ECR variables: image URLs are derived in the
workflows and in Terraform from `CENTRAL_ECR_ACCOUNT_ID` + the repo name, so
they cannot drift.

## Dev environment setup

**D1 — Confirm prerequisites** (org repo applied, section above), and collect
the org repo outputs.

**D2 — Create the dev state bucket** (local, dev-account admin credentials —
the only manual Terraform of the bring-up):

```bash
cd infra/terraform/bootstrap
terraform init
terraform workspace new dev
terraform apply -var="project_name=boilerplate-template" -var="environment=dev" -auto-approve
```

**D3 — Configure GitHub**: create the `dev` environment (no protection
rules), then set the repo-level variables and dev's per-environment values per
the tables above. Skip the two Terraform-output rows for now.

**D4 — First dev apply**: run `terraform-apply.yml` via **workflow_dispatch**
(leave `apply_prod` unchecked). The org `gha-deploy` role already exists, so
no elevated-credential exception is needed. The apply detects the fresh
environment (bootstrap mode): it seeds the central ECR `:latest` images via
the `gha-ecr-push` role if they're missing, applies the full root module, and
publishes the initial Lambda versions. Dev's DNS records and ACM validation
are written into the org-created `dev.<root_domain>` zone in-account — no
manual delegation step.

**D5 — Capture Terraform outputs** from the apply's job summary into the `dev`
environment: `vars.STATIC_ASSETS_BUCKET` (`static_assets_bucket_name`),
`vars.CLOUDFRONT_DISTRIBUTION_ID` (`cloudfront_distribution_id`).

**D6 — Register the Google OAuth redirect URI**
(`https://<cognito_domain>/oauth2/idpresponse`, from the `cognito_domain`
output) on the dev OAuth client.

**D7 — Verify**: push to `main` (or re-run `deploy.yml` via dispatch) — builds
push to the central registry and deploy to dev. App is live at
`https://<project>.dev.<root_domain>`.

## Prod environment setup

Do this only after dev works — prod deploys re-use the images dev already
built.

**P1 — Create the prod state bucket** (local, **prod-account** credentials):

```bash
cd infra/terraform/bootstrap
terraform workspace new prod
terraform apply -var="project_name=boilerplate-template" -var="environment=prod" -auto-approve
```

**P2 — Configure GitHub**: create the `prod` environment and add at least one
**Required reviewer** under deployment protection rules (without it, prod
deploys run unattended). Set prod's per-environment values per the table —
including `vars.DNS_ACCOUNT_ROLE_ARN` (the `dns-apex-manager` role), which dev
doesn't set.

**P3 — First prod apply**: run `terraform-apply.yml` via **workflow_dispatch**
with `apply_prod: true`, and approve the reviewer gate. Prod's apex DNS
records and ACM validation are written cross-account through the
`dns-apex-manager` role; images already exist centrally, so bootstrap mode
only applies + publishes Lambda versions.

**P4 — Capture Terraform outputs** into the `prod` environment:
`vars.STATIC_ASSETS_BUCKET`, `vars.CLOUDFRONT_DISTRIBUTION_ID`.

**P5 — Register the prod Google OAuth redirect URI** (prod `cognito_domain`).

**P6 — Cut the first release**: merge the release PR / push a `v*` tag.
`deploy.yml` builds once, deploys dev, waits for `terraform-apply.yml`'s prod
apply on the same tag, then (behind a second reviewer approval) deploys the
same image URI to prod. App is live at `https://<project>.<root_domain>`.

## Steady state (after bring-up)

```
push to main            → build → deploy dev
merge Release PR → v*   → build → deploy dev → [prod reviewer: terraform-apply] → [prod reviewer: deploy] → prod live
```

No manual variable wrangling — every value used after bring-up is either a
stable org/Terraform output already captured, or a secret set once during
setup. Steady-state Terraform changes flow through PRs: a PR touching
`infra/terraform/**` gets a dev plan comment; merge applies dev; a `v*` tag
applies prod behind the reviewer gate.
