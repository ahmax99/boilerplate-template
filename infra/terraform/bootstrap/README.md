# Terraform Backend Bootstrap

This directory contains the Terraform configuration to create the **S3 bucket** required for storing Terraform state across all environments.

## Purpose

Creates the following resources:
- **S3 Bucket**: Stores Terraform state files for dev/prod environments with native S3 locking

## Prerequisites

1. AWS credentials configured (`aws configure` or environment variables)
2. Terraform >= 1.14.0 installed

## Important Notes

⚠️ **Run this ONCE before setting up any environment (dev/prod)**

⚠️ **This configuration uses LOCAL state** (not remote S3 backend) because it creates the backend resources themselves

⚠️ **Keep the `terraform.tfstate` file safe** - it's stored locally in this directory

## Setup Instructions

### One-time bootstrap (human, admin AWS credentials — run ONCE, dev before prod)

These steps create the irreducible seed the CI pipeline needs to authenticate. After them, the
pipeline manages everything (open a PR → plan comment → merge applies dev → `v*` tag applies prod).

**S1 — Create the state bucket** (skip if already done):
```bash
cd infra/terraform/bootstrap && terraform init && terraform apply -auto-approve && cd ../..
```

**S2 — Seed dev** (creates the account-global OIDC provider + dev apply role):
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
terraform output terraform_plan_role_arn     # → repo-level TF_PLAN_ROLE_ARN
```

**S3 — Seed prod** (provider already exists; creates the prod apply role only):
```bash
terraform init -reconfigure -backend-config=backends/prod.hcl
terraform apply \
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

⚠️ **DO NOT destroy these resources while environments are using them!**

To destroy (only if you're completely done with all environments):
```bash
terraform destroy
```