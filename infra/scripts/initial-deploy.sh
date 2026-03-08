#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🚀 Initial Lambda Deployment Setup"
echo "This script performs the first-time deployment of your Lambda function"
echo ""

# Step 1: Initialize Terraform and create S3 bucket
echo "Step 1: Initializing Terraform..."
cd "$PROJECT_ROOT/infra/terraform/environments/dev"

if [ ! -d ".terraform" ]; then
    echo "Initializing Terraform..."
    terraform init
fi

echo "Creating S3 bucket (if needed)..."
terraform apply -target=module.s3_lambda_code -auto-approve

BUCKET=$(terraform output -raw lambda_code_bucket_name)
REGION=$(terraform output -raw aws_region)

echo "S3 Bucket: $BUCKET"
echo "AWS Region: $REGION"
echo "✅ S3 bucket ready"
echo ""

# Step 2: Build Lambda package
echo "Step 2: Building Lambda package..."
cd "$PROJECT_ROOT"

echo "Installing dependencies..."
bun install

echo "Building backend application..."
bun run build --filter=backend-boilerplate

chmod +x .github/scripts/prepare-lambda-backend.sh
.github/scripts/prepare-lambda-backend.sh

echo "✅ Lambda package built successfully"
echo ""

# Step 3: Upload to S3
echo "Step 3: Uploading Lambda package to S3..."

aws s3 cp dist/lambda-backend.zip \
  "s3://${BUCKET}/backend/lambda-backend.zip" \
  --region "$REGION"

echo "✅ Package uploaded to S3"
echo ""

# Step 4: Apply full Terraform configuration
echo "Step 4: Applying full Terraform configuration..."
cd "$PROJECT_ROOT/infra/terraform/environments/dev"

terraform apply

FUNCTION_NAME=$(terraform output -raw backend_function_name)
echo "Function Name: $FUNCTION_NAME"
echo "✅ Terraform applied successfully"
echo ""

# Step 5: Publish version
echo "Step 5: Publishing Lambda version..."

VERSION_OUTPUT=$(aws lambda publish-version \
  --function-name "$FUNCTION_NAME" \
  --description "Initial deployment" \
  --region "$REGION" \
  --output json)

NEW_VERSION=$(echo "$VERSION_OUTPUT" | jq -r '.Version')
echo "✅ Published version: $NEW_VERSION"
echo ""

# Step 6: Update alias to point to new version
echo "Step 6: Updating Lambda alias..."

ALIAS_NAME=$(terraform output -raw backend_alias_name)
echo "Alias Name: $ALIAS_NAME"

aws lambda update-alias \
  --function-name "$FUNCTION_NAME" \
  --name "$ALIAS_NAME" \
  --function-version "$NEW_VERSION" \
  --region "$REGION" \
  --output json > /dev/null

echo "✅ Alias '$ALIAS_NAME' updated to version $NEW_VERSION"
echo ""

# Cleanup
rm -f /tmp/lambda-update.json

echo "🎉 Initial deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Commit your changes: git add . && git commit -m 'Initial setup'"
echo "2. Push to main branch: git push origin main"
echo "3. GitHub Actions will handle all future deployments automatically"
echo ""
