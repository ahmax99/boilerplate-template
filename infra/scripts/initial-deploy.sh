#!/bin/bash
set -e

# Constants
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🚀 Initial Lambda Deployment Setup"
echo "This script performs the first-time deployment of your Lambda functions"
echo ""

# Step 1: Initialize Terraform and create ECR repositories
echo "Step 1: Initializing Terraform..."
cd "$PROJECT_ROOT/infra/terraform/environments/dev"

if [[ ! -d ".terraform" ]]; then
    echo "Initializing Terraform..."
    terraform init
fi

echo "Creating ECR repositories..."
terraform apply -target=module.ecr_backend -target=module.ecr_frontend -auto-approve

ECR_BACKEND_URL=$(terraform output -raw ecr_backend_repository_url)
ECR_FRONTEND_URL=$(terraform output -raw ecr_frontend_repository_url)
REGION=$(terraform output -raw aws_region)

echo "ECR Backend Repository: $ECR_BACKEND_URL"
echo "ECR Frontend Repository: $ECR_FRONTEND_URL"
echo "AWS Region: $REGION"
echo "✅ ECR repositories ready"
echo ""

# Step 2: Build and push backend Docker image to ECR
echo "Step 2: Building and pushing backend Docker image..."
cd "$PROJECT_ROOT"

echo "Installing dependencies..."
bun install

echo "Logging in to ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_BACKEND_URL"

echo "Building backend Docker image..."
docker build --platform linux/amd64 \
  -t "$ECR_BACKEND_URL:latest" \
  -f apps/backend-boilerplate/Dockerfile \
  --build-arg DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder?schema=public \
  .

echo "Pushing backend image to ECR..."
docker push "$ECR_BACKEND_URL:latest"

echo "✅ Backend Docker image pushed to ECR"
echo ""

# Step 3: Build and push frontend Docker image to ECR
echo "Step 3: Building and pushing frontend Docker image..."
cd "$PROJECT_ROOT"

echo "Logging in to ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_FRONTEND_URL"

# Get frontend environment variables from Terraform outputs or environment
NEXT_PUBLIC_BASE_URL="${NEXT_PUBLIC_BASE_URL:-}"
NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL:-}"
NEXT_PUBLIC_SENTRY_DSN="${NEXT_PUBLIC_SENTRY_DSN:-}"

echo "Building frontend Docker image..."
docker build --platform linux/amd64 \
  -t "$ECR_FRONTEND_URL:latest" \
  -f apps/nextjs-boilerplate/Dockerfile \
  --build-arg NEXT_PUBLIC_BASE_URL="$NEXT_PUBLIC_BASE_URL" \
  --build-arg NEXT_PUBLIC_BACKEND_URL="$NEXT_PUBLIC_BACKEND_URL" \
  --build-arg NEXT_PUBLIC_SENTRY_DSN="$NEXT_PUBLIC_SENTRY_DSN" \
  .

echo "Pushing frontend image to ECR..."
docker push "$ECR_FRONTEND_URL:latest"

echo "✅ Frontend Docker image pushed to ECR"
echo ""

# Step 4: Apply full Terraform configuration
echo "Step 4: Applying full Terraform configuration..."
cd "$PROJECT_ROOT/infra/terraform/environments/dev"

terraform apply -auto-approve

echo "✅ Terraform applied successfully"
echo ""

# Step 5: Publish versions and update aliases
echo "Step 5: Publishing Lambda versions and updating aliases..."

# Backend Lambda
echo ""
echo "📋 Processing backend Lambda..."

BACKEND_FUNCTION_NAME=$(terraform output -raw backend_function_name)
BACKEND_ALIAS_NAME=$(terraform output -raw backend_alias_name)

echo "Function: $BACKEND_FUNCTION_NAME"
echo "Alias: $BACKEND_ALIAS_NAME"

# Publish backend version
BACKEND_VERSION_OUTPUT=$(aws lambda publish-version \
  --function-name "$BACKEND_FUNCTION_NAME" \
  --description "Initial deployment" \
  --region "$REGION" \
  --output json)

BACKEND_NEW_VERSION=$(echo "$BACKEND_VERSION_OUTPUT" | jq -r '.Version')
echo "Published version: $BACKEND_NEW_VERSION"

# Update backend alias
aws lambda update-alias \
  --function-name "$BACKEND_FUNCTION_NAME" \
  --name "$BACKEND_ALIAS_NAME" \
  --function-version "$BACKEND_NEW_VERSION" \
  --region "$REGION" \
  --output json > /dev/null

echo "✅ Backend alias '$BACKEND_ALIAS_NAME' updated to version $BACKEND_NEW_VERSION"

# Frontend Lambda
echo ""
echo "📋 Processing frontend Lambda..."

FRONTEND_FUNCTION_NAME=$(terraform output -raw frontend_function_name)
FRONTEND_ALIAS_NAME=$(terraform output -raw frontend_alias_name)

echo "Function: $FRONTEND_FUNCTION_NAME"
echo "Alias: $FRONTEND_ALIAS_NAME"

# Publish frontend version
FRONTEND_VERSION_OUTPUT=$(aws lambda publish-version \
  --function-name "$FRONTEND_FUNCTION_NAME" \
  --description "Initial deployment" \
  --region "$REGION" \
  --output json)

FRONTEND_NEW_VERSION=$(echo "$FRONTEND_VERSION_OUTPUT" | jq -r '.Version')
echo "Published version: $FRONTEND_NEW_VERSION"

# Update frontend alias
aws lambda update-alias \
  --function-name "$FRONTEND_FUNCTION_NAME" \
  --name "$FRONTEND_ALIAS_NAME" \
  --function-version "$FRONTEND_NEW_VERSION" \
  --region "$REGION" \
  --output json > /dev/null

echo "✅ Frontend alias '$FRONTEND_ALIAS_NAME' updated to version $FRONTEND_NEW_VERSION"

echo ""
echo "✅ All Lambda functions deployed successfully"
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
