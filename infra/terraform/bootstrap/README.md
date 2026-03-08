# Terraform Backend Bootstrap

This directory contains the Terraform configuration to create the **S3 bucket** required for storing Terraform state across all environments.

## Purpose

Creates the following resources:
- **S3 Bucket**: Stores Terraform state files for dev/staging/prod environments with native S3 locking

## Prerequisites

1. AWS credentials configured (`aws configure` or environment variables)
2. Terraform >= 1.14.0 installed

## Important Notes

⚠️ **Run this ONCE before setting up any environment (dev/staging/prod)**

⚠️ **This configuration uses LOCAL state** (not remote S3 backend) because it creates the backend resources themselves

⚠️ **Keep the `terraform.tfstate` file safe** - it's stored locally in this directory

## Setup Instructions

### 1. Initialize Terraform
```bash
cd infra/terraform/bootstrap && terraform init
```

### 2. Review the plan
```bash
terraform plan
```

### 3. Apply the configuration
```bash
terraform apply -auto-approve
```

### 4. Proceed to environment setup
Now you can set up your environments (dev/staging/prod) which will use this S3 backend.

```bash
cd ../environments/dev && terraform init
```

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