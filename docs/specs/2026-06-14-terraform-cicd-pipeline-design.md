# Design: Terraform CI/CD Pipeline (GitHub Actions) — Multi-Environment

**Date:** 2026-06-14
**Status:** Approved — ready for implementation planning
**Plans:** `.claude/plans/2026-06-14-terraform-cicd-iam-module.md` (Part 1) · `.claude/plans/2026-06-14-terraform-cicd-workflows.md` (Part 2)

---

## Problem

Terraform infrastructure changes in `infra/terraform/` are currently applied manually via
`initial-deploy.sh` or local `terraform apply`. There is no automated plan review on PRs, no
apply gating, and the first-time environment setup has no CI equivalent. This creates
inconsistency risk (local state drift), no audit trail, and friction when onboarding. The
repo has **two environments** (`dev`, `prod`) — see `infra/terraform/vars/{dev,prod}.tfvars`
and `infra/terraform/backends/{dev,prod}.hcl` — but no pipeline covers either.

## Goals

1. Auto-run `terraform plan` on every PR touching `infra/terraform/**` and post the output as a PR comment.
2. Auto-apply to **dev** on merge to `main` (same path filter); apply to **prod** on `v*` tag pushes, gated by a required-reviewer environment.
3. Replace `initial-deploy.sh` — the CI pipeline handles first-time ECR bootstrap idempotently, per environment.
4. No long-lived AWS credentials in CI — OIDC only, with per-environment role isolation.

## Non-goals

- AWS CodePipeline, Atlantis, or any third-party plan action (`dflook`).
- App deploy pipeline (`deploy.yml`) — untouched (this pipeline mirrors its conventions).
- Separate AWS accounts per environment — dev and prod share one account (state isolated by key prefix).

---

## Chosen approach

**Approach 1 — faithful `deploy.yml` mirror.** One `terraform-apply.yml` with two jobs
(`apply-dev`, `apply-prod`), prod gated behind the existing `prod` GitHub Environment, env
differences resolved entirely through **environment-scoped GitHub variables/secrets** (no
matrix, no conditionals in the steps). This matches how `deploy.yml` already separates dev
and prod, keeps complexity lowest (`principles.md`), and yields per-environment IAM isolation
as a side effect.

Rejected: a reusable `workflow_call` workflow with four isolated roles (more moving parts than
two environments justify) and four explicit per-env workflow files (copy-paste drift that
SonarQube/fallow flag).

---

## Architecture

### Single AWS account, per-environment state

Both environments live in one AWS account. State is one S3 bucket
(`boilerplate-template-terraform-state`) keyed by environment: `dev/terraform.tfstate`,
`prod/terraform.tfstate`. The root module is applied **once per environment** with
`-backend-config=backends/<env>.hcl`; each env's state therefore owns its own copy of the
`github-oidc` module and the env-prefixed roles it creates (`name_prefix = "${project}-${env}"`).

### Workflows

| Workflow | Trigger | Job(s) | IAM Role (per job) | Gate |
|---|---|---|---|---|
| `terraform-plan.yml` | PR → `main` (`infra/terraform/**`) | `plan` (dev) | `terraform_plan` (read-only, dev) | None |
| `terraform-apply.yml` | push → `main` + `workflow_dispatch` | `apply-dev` (`environment: dev`) | dev `terraform_apply` | None |
| | `v*` tag push | `apply-prod` (`needs: apply-dev`, `environment: prod`) | prod `terraform_apply` | `prod` env (required reviewer) |

`apply-prod`'s trigger guard mirrors `deploy.yml` exactly:
`if: github.event_name == 'push' && github.ref_type == 'tag'`. On a tag push, `apply-dev`
runs first (re-applying the identical code to dev, usually a no-op), and only then is
`apply-prod` offered for approval — so prod is never applied with code that hasn't just
applied cleanly to dev.

Both apply jobs share one composite action, `terraform-apply-env`, wrapping
init → ECR-check → bootstrap-or-steady-state → summary. The backend/tfvars selection and role
ARN come from environment-scoped variables (`vars.TF_VAR_environment`, `vars.TF_APPLY_ROLE_ARN`),
so the two jobs are near-identical thin wrappers differing only in `environment:` and trigger.

### IAM roles (per environment, in the `github-oidc` module)

Each env-stack creates one plan role and one apply role, env-prefixed:

| Role | OIDC `sub` claim | Permissions |
|---|---|---|
| `…-<env>-…-terraform-plan` | `repo:org/repo:pull_request` | `ReadOnlyAccess` + S3 state read on `<bucket>/<env>/*` |
| `…-<env>-…-terraform-apply` | `repo:org/repo:environment:<env>` | Infra mgmt scoped to `${project}-<env>-*` + S3 state r/w on `<bucket>/<env>/*` |

- The apply role's trust `sub` is **environment-derived** (`:environment:${var.environment}`),
  so it can only be assumed from a job running in the matching GitHub Environment. The prod
  apply role is assumable only from the required-reviewer `prod` environment.
- Permissions are scoped per environment (`${project}-${var.environment}-*`), so a dev-context
  token can never mutate prod resources or prod state. Genuinely global services (CloudFront,
  Route53, ACM, WAF, Cognito) remain `Resource = "*"` — a single-account limitation, documented.
- Both trust policies pin `aud: sts.amazonaws.com` (omitting it lets any GitHub OIDC token assume the role).

### OIDC provider — account-global, created once

`aws_iam_openid_connect_provider.github` is account-global (one per account for
`token.actions.githubusercontent.com`). Because the root module is applied per environment,
two stacks creating it would collide. Resolution: a `create_oidc_provider` flag on the module,
auto-derived in the root as `var.environment == "dev"`. The dev stack creates the provider;
every other env sets the flag `false` and resolves the ARN via a
`data "aws_iam_openid_connect_provider"` lookup. A `local.oidc_provider_arn` feeds all role
trust policies.

### Idempotent apply (per environment)

The apply composite detects whether the env's ECR repos contain a `:latest` image:

- **Missing (fresh env):** targeted ECR apply → `build-and-push.sh` (backend + frontend `:latest`) → full apply → publish Lambda versions + update aliases.
- **Exists (steady-state):** `init` → `plan` → `apply -auto-approve`.

The check and bootstrap are already environment-parameterized
(`terraform-ecr-check`, `terraform-bootstrap` composite actions take `environment`), so prod
bootstraps the same way dev does on its first `v*` tag.

### One-time manual seed (per environment)

The apply role cannot create itself. A human runs the seed once per env with admin creds:

```bash
# dev (creates the OIDC provider + dev apply role)
terraform init -backend-config=backends/dev.hcl
terraform apply -target=module.github_oidc.aws_iam_openid_connect_provider.github \
                -target=module.github_oidc.aws_iam_role.terraform_apply \
                -var-file=vars/dev.tfvars

# prod (create_oidc_provider=false — provider already exists, only the prod apply role is made)
terraform init -reconfigure -backend-config=backends/prod.hcl
terraform apply -target=module.github_oidc.aws_iam_role.terraform_apply \
                -var-file=vars/prod.tfvars
```

Each seed's `terraform output terraform_apply_role_arn` populates that **environment's**
`TF_APPLY_ROLE_ARN` GitHub variable. Everything after is CI-managed.

---

## GitHub configuration

Environment differences ride on GitHub's **var/secret precedence**: an environment-scoped value
overrides the repository value of the same name; if unset in the environment, the repository
value is used. So the **repository level holds the dev baseline**, the `dev` environment adds
only its apply-role ARN, and the `prod` environment overrides every env-specific value.

This precedence is also why the **plan job declares no `environment:`** — doing so would change
its OIDC `sub` from `pull_request` (which the read-only plan role trusts) to `:environment:<env>`.
With no environment, the plan job sees only repository-level config, which is exactly the dev
baseline it should plan against.

- **Repository variables (dev baseline, also feeds the PR plan job):** `TF_PLAN_ROLE_ARN`
  (dev plan role), `TF_VAR_project_name`, `TF_VAR_environment = dev`, `TF_VAR_aws_region`,
  `TF_VAR_domain_name` (dev), `TF_VAR_github_org`, `TF_VAR_contact_to_email`, `TF_VAR_from_email`,
  `NEXT_PUBLIC_BASE_URL` (dev), `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_SENTRY_DSN`.
- **Repository secrets (dev baseline):** `TF_VAR_database_url`, `TF_VAR_google_client_id`,
  `TF_VAR_google_client_secret`, `TF_VAR_resend_api_key`, `TF_VAR_session_secret`, `TF_VAR_sentry_dsn`.
- **`dev` environment:** only `TF_APPLY_ROLE_ARN` (dev apply role). No required reviewer.
- **`prod` environment:** `TF_APPLY_ROLE_ARN` (prod apply role) + overrides for `TF_VAR_environment = prod`,
  `TF_VAR_domain_name`, `NEXT_PUBLIC_*`, and all six secrets with prod values. Carries a
  **required reviewer** (already configured for `deploy.yml`).

---

## Files changed

**New:**
- `.github/workflows/terraform-plan.yml`
- `.github/workflows/terraform-apply.yml`
- `.github/actions/terraform-apply-env/action.yml`
- `.github/actions/terraform-ecr-check/action.yml`, `.github/actions/terraform-bootstrap/action.yml`, `.github/actions/terraform-plan-comment/action.yml`
- `.github/scripts/terraform-plan-comment.sh`, `build-and-push.sh`, `terraform-ecr-check.sh`, `terraform-bootstrap.sh`

**Modified:**
- `infra/terraform/modules/github-oidc/variables.tf` — add `environment`, `create_oidc_provider`
- `infra/terraform/modules/github-oidc/main.tf` — conditional OIDC provider + data source + `local.oidc_provider_arn`; env-derived apply-role trust claim; per-env permission scoping
- `infra/terraform/modules/github-oidc/outputs.tf` — `oidc_provider_arn` reads `local.oidc_provider_arn`
- `infra/terraform/main.tf` — wire `environment` + `create_oidc_provider = var.environment == "dev"`
- `docs/deployment-environments.md` — Terraform plan/apply folded into the existing `dev`/`prod` rows
- `infra/terraform/bootstrap/README.md` — per-environment seed steps

**Removed (after verification):**
- `infra/scripts/initial-deploy.sh`

---

## Security

- Plan role is OIDC-scoped to the `pull_request` sub — a malicious PR's blast radius is read-level AWS access only.
- Apply roles are OIDC-scoped to `:environment:<env>` and permission-scoped to `${project}-<env>-*` — dev and prod are mutually isolated despite sharing an account.
- Never use `pull_request_target` — it gives PR authors code execution on base-branch credentials.
- `sensitive = true` does not protect state files — access is controlled via IAM (only the env's apply role has write to that env's state prefix).
- Plan binary artifacts are not uploaded publicly — the custom script posts text output only.
- All action refs pinned to SHA before production use.

---

## Key constraints

- **S3 native locking** (`use_lockfile = true`) already in `backend.tf` — no DynamoDB needed (deprecated TF 1.11).
- **`cancel-in-progress: false`** for apply concurrency — mid-apply cancellation leaves partial state.
- **Public repo** — GitHub Environment required reviewers work on the free plan.
- **Plan role created by first apply** — the first PR plan fails until the dev seed runs. Expected, documented.
- **`prod` apply is approved before its plan is visible** — the job-level environment gate pauses the whole job. Mitigated by `apply-dev` (identical code) succeeding first in the same run. Documented as an accepted tradeoff of mirroring `deploy.yml`.
