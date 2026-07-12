# Terraform Backend Bootstrap

This directory contains the Terraform configuration to create the **S3 state buckets** — one dedicated bucket per environment (`<project>-dev-terraform-state`, `<project>-prod-terraform-state`), each holding its state at the bucket root (`terraform.tfstate`, no key prefix needed since the bucket itself is the environment boundary).

## Purpose

Creates the following resources (once per environment):

- **S3 Bucket**: Stores that environment's Terraform state with native S3 locking

## Prerequisites

1. AWS credentials configured (`aws configure` or environment variables)
2. Terraform >= 1.14.0 installed

## Important Notes

⚠️ **Run this ONCE per environment, before setting that environment up (dev before prod)**

⚠️ **dev and prod are separate AWS accounts.** Every step below runs against one account at a time — switch your local AWS credentials/profile (e.g. `AWS_PROFILE=<project>-dev` vs `AWS_PROFILE=<project>-prod`) before each environment's commands. There is no shared account-global resource between them anymore; both environments bootstrap their own state bucket, OIDC provider, and apply role independently.

⚠️ **This configuration uses LOCAL state** (not remote S3 backend) because it creates the backend resources themselves — use a separate Terraform **workspace** per environment so each environment's bucket is tracked independently and running one environment can never touch another's tracked resource

⚠️ **Keep the `terraform.tfstate.d/` directory safe** - it's stored locally in this directory (one state file per workspace)

## Setup Instructions

### One-time bootstrap (human, admin AWS credentials — run ONCE per environment, dev before prod)

These steps create the irreducible seed the CI pipeline needs to authenticate. After them, the
pipeline manages everything (open a PR → plan comment → merge applies dev → `v*` tag applies prod).

**S1 — Create each environment's state bucket** (skip an environment if already done). Run the `dev` block with dev-account credentials, the `prod` block with prod-account credentials — these are two separate accounts, not two workspaces in one:

```bash
cd infra/terraform/bootstrap
# --- dev-account credentials ---
terraform init
terraform workspace new dev
terraform apply -var="project_name=boilerplate-template" -var="environment=dev" -auto-approve
# --- switch to prod-account credentials ---
terraform workspace new prod
terraform apply -var="project_name=boilerplate-template" -var="environment=prod" -auto-approve
cd ../..
```

**S2 — Seed dev** (dev-account credentials; creates the dev-account OIDC provider + dev apply role):

```bash
cd infra/terraform
terraform init -backend-config=backends/dev.hcl
terraform apply \
  -target=module.github_oidc.aws_iam_openid_connect_provider.github \
  -target=module.github_oidc.aws_iam_role.terraform_apply \
  -target=module.github_oidc.aws_iam_policy.terraform_apply_permissions \
  -target=module.github_oidc.aws_iam_role_policy_attachment.terraform_apply_permissions \
  -var-file=vars/dev.tfvars -auto-approve
terraform output terraform_apply_role_arn   # → dev env TF_APPLY_ROLE_ARN
terraform output terraform_plan_role_arn     # → repo-level TF_PLAN_ROLE_ARN (terraform-plan.yml only plans dev)
```

**S3 — Seed prod** (switch to prod-account credentials; prod is a separate account, so it creates its **own** OIDC provider too — not a reuse of dev's):

```bash
terraform init -reconfigure -backend-config=backends/prod.hcl
terraform apply \
  -target=module.github_oidc.aws_iam_openid_connect_provider.github \
  -target=module.github_oidc.aws_iam_role.terraform_apply \
  -target=module.github_oidc.aws_iam_policy.terraform_apply_permissions \
  -target=module.github_oidc.aws_iam_role_policy_attachment.terraform_apply_permissions \
  -var-file=vars/prod.tfvars -auto-approve
terraform output terraform_apply_role_arn   # → prod env TF_APPLY_ROLE_ARN
```

**S4 — Set GitHub config** per `docs/deployment-environments.md`: repo baseline (dev vars/secrets) +
`dev` environment (`TF_APPLY_ROLE_ARN`) + `prod` environment (apply role ARN + prod-specific overrides),
and ensure `prod` has a required reviewer.

### From this point on — no local `terraform apply` needed

Open a PR → plan comment appears → merge applies dev → push a `v*` tag and approve the gate to apply prod.

## Security Features

✅ **S3 Bucket**:

- Versioning enabled (recover from accidental deletions)
- Server-side encryption (AES256)
- Public access blocked
- Native S3 locking (`.tflock` files created automatically)
- No lifecycle policies (keep all state versions)

## Cleanup

⚠️ **DO NOT destroy an environment's bucket while that environment is using it!**

To destroy one environment's bucket (only once you're completely done with that environment):

```bash
terraform workspace select dev   # or prod
terraform destroy -var="project_name=boilerplate-template" -var="environment=dev"
```
