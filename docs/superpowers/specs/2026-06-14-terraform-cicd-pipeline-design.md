# Design: Terraform CI/CD Pipeline (GitHub Actions)

**Date:** 2026-06-14  
**Status:** Approved — ready for implementation planning  
**Full plan:** `docs/terraform-pipeline-plan.md`

---

## Problem

Terraform infrastructure changes in `infra/terraform/` are currently applied manually via
`initial-deploy.sh` or local `terraform apply`. There is no automated plan review on PRs, no
apply gating, and the first-time environment setup has no CI equivalent. This creates
inconsistency risk (local state drift), no audit trail, and friction when onboarding.

## Goals

1. Auto-run `terraform plan` on every PR touching `infra/terraform/**` and post the output as a PR comment.
2. Auto-apply on merge to `main` (same path filter), gated by a required-reviewer environment.
3. Replace `initial-deploy.sh` — the CI pipeline handles first-time ECR bootstrap idempotently.
4. No long-lived AWS credentials in CI — OIDC only.

## Non-goals

- AWS CodePipeline, Atlantis, or any third-party plan action (`dflook`).
- `prod` Terraform environment (sub-plan 2, future).
- App deploy pipeline (`deploy.yml`) — untouched.

---

## Architecture

### Two workflows

| Workflow | Trigger | IAM Role | Gate |
|---|---|---|---|
| `terraform-plan.yml` | PR to `main` (`infra/terraform/**`) | `terraform_plan` (read-only) | None |
| `terraform-apply.yml` | Push to `main` (`infra/terraform/**`) + `workflow_dispatch` | `terraform_apply` (read-write) | `terraform-apply` GitHub Environment (required reviewer) |

### Two new IAM roles (added to `github-oidc` module)

| Role | OIDC `sub` claim | Permissions |
|---|---|---|
| `terraform_plan` | `repo:org/repo:pull_request` | `ReadOnlyAccess` + S3 state read |
| `terraform_apply` | `repo:org/repo:environment:terraform-apply` | Full infra mgmt + S3 state read/write |

Both trust policies include `aud: sts.amazonaws.com` (required — omitting it allows any GitHub OIDC token to assume the role).

### Idempotent apply

The apply workflow detects whether ECR repos contain a `:latest` image:

- **Missing (fresh env):** targeted ECR apply → `build-and-push.sh` (backend + frontend `:latest`) → full apply → publish Lambda versions + update aliases
- **Exists (steady-state):** `init` → `plan` → `apply -auto-approve`

### One-time manual seed

The `terraform_apply` role cannot create itself. A human runs once with admin creds:

```bash
terraform apply \
  -target=module.github_oidc.aws_iam_openid_connect_provider.github \
  -target=module.github_oidc.aws_iam_role.terraform_apply
```

Then adds `TF_APPLY_ROLE_ARN` to GitHub repository variables. Everything after is CI-managed.

---

## Files changed

**New:**
- `.github/workflows/terraform-plan.yml`
- `.github/workflows/terraform-apply.yml`
- `.github/scripts/terraform-plan-comment.sh`
- `.github/scripts/build-and-push.sh`

**Modified:**
- `infra/terraform/modules/github-oidc/main.tf` — add `terraform_plan` + `terraform_apply` roles
- `infra/terraform/modules/github-oidc/variables.tf` — add `state_bucket_arn`, `enable_terraform_roles`
- `infra/terraform/modules/github-oidc/outputs.tf` — add role ARNs
- `infra/terraform/main.tf` — wire new vars into `github_oidc` module
- `infra/terraform/outputs.tf` — expose role ARNs
- `docs/deployment-environments.md` — add `terraform-apply` environment
- `infra/terraform/bootstrap/README.md` — update one-time seed instructions

**Removed (after verification):**
- `infra/scripts/initial-deploy.sh`

---

## Security

- Plan role is OIDC-scoped to `pull_request` sub — blast radius of a malicious PR data source is read-level AWS access only.
- Never use `pull_request_target` — gives PR authors code execution on base branch credentials.
- `sensitive = true` does not protect state files — access controlled via IAM (only apply role has state bucket write).
- Plan binary artifacts not uploaded publicly — custom script posts text output only.
- All action refs pinned to SHA.

---

## Key constraints

- **S3 native locking** (`use_lockfile = true`) already in `backend.tf` — no DynamoDB needed (deprecated TF 1.11).
- **`cancel-in-progress: false`** for apply concurrency — mid-apply cancellation leaves partial state.
- **Public repo** — GitHub Environment required reviewers work on free plan.
- **Plan role created by first apply** — first PR plan will fail until the apply seed runs. Expected, documented.
