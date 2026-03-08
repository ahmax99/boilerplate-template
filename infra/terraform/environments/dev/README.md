# Development Environment

This directory contains the Terraform configuration for the **development** environment.

## Environment Details

- **Domain**: `nextjs-boilerplate.dev.ahmax99.online`
- **AWS Region**: `ap-northeast-1`
- **Environment**: `dev`

## Prerequisites

1. AWS credentials configured (`aws configure` or environment variables)
2. Terraform >= 1.14.0 installed
3. Bun installed (`curl -fsSL https://bun.sh/install | bash`)
4. **S3 backend resources created** - Run the bootstrap configuration first:
   ```bash
   cd ../../bootstrap
   terraform init && terraform apply -auto-approve
   cd ../environments/dev
   ```

## Initial Setup (First Time Only)

For the **first deployment**, use the automated initial deployment script:

```bash
# From project root
./infra/scripts/initial-deploy.sh
```

This script will:
1. ✅ Apply Terraform configuration (creates all infrastructure)
2. ✅ Build the Lambda package
3. ✅ Upload to S3
4. ✅ Update Lambda function with initial code
5. ✅ Publish the first version

After the script completes:
```bash
git add .
git commit -m "Initial setup"
git push origin main
```

**GitHub Actions will handle all future deployments automatically.**

---

## Manual Setup (Alternative)

If you prefer manual steps:

1. Copy the example tfvars file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your specific values

3. Deploy Bun Lambda layer:
   ```bash
   cd ../../../
   ./infra/scripts/deploy-bun-layer.sh
   cd infra/terraform/environments/dev
   ```

4. Initialize and apply Terraform:
   ```bash
   terraform init
   terraform plan
   terraform apply -auto-approve
   ```

5. Build and upload Lambda code:
   ```bash
   cd ../../../
   bun install
   bun run build --filter=backend-boilerplate
   .github/scripts/prepare-lambda-backend.sh
   
   # Upload to S3
   BUCKET=$(cd infra/terraform/environments/dev && terraform output -raw lambda_code_bucket_name)
   REGION=$(cd infra/terraform/environments/dev && terraform output -raw aws_region)
   
   aws s3 cp dist/lambda-backend.zip \
     s3://${BUCKET}/backend/lambda-backend.zip \
     --region ${REGION}
   ```

6. Update Lambda function:
   ```bash
   FUNCTION_NAME=$(cd infra/terraform/environments/dev && terraform output -raw backend_function_name)
   
   aws lambda update-function-code \
     --function-name ${FUNCTION_NAME} \
     --s3-bucket ${BUCKET} \
     --s3-key backend/lambda-backend.zip \
     --region ${REGION}
   ```