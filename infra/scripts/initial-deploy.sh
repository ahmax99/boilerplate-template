#!/bin/bash
set -e

# Constants
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LAYER_NAME="boilerplate-bun-runtime"

echo "🚀 Initial Lambda Deployment Setup"
echo "This script performs the first-time deployment of your Lambda function"
echo ""

# Step 0: Deploy Bun Lambda Layer (if not exists)
echo "Step 0: Checking Bun Lambda Layer..."

# Check if layer exists
if aws lambda list-layer-versions --layer-name "$LAYER_NAME" --query 'LayerVersions[0].Version' --output text 2>/dev/null | grep -q '^[0-9]'; then
    echo "ℹ️  Layer '$LAYER_NAME' already exists"
    echo "⏭️  Skipping layer deployment"
else
    echo "📦 Layer '$LAYER_NAME' not found, deploying..."
    chmod +x "$SCRIPT_DIR/deploy-bun-layer.sh"
    "$SCRIPT_DIR/deploy-bun-layer.sh"
    echo "✅ Bun Lambda layer deployed"
fi

# Get layer version and construct ARN
LAYER_VERSION=$(aws lambda list-layer-versions --layer-name "$LAYER_NAME" --query 'LayerVersions[0].Version' --output text)
cd "$PROJECT_ROOT/infra/terraform/environments/dev"
ACCOUNT_ID=$(terraform output -raw aws_account_id 2>/dev/null || aws sts get-caller-identity --query Account --output text)
REGION=$(terraform output -raw aws_region 2>/dev/null || aws configure get region)
cd "$PROJECT_ROOT"

LAYER_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:layer:${LAYER_NAME}:${LAYER_VERSION}"
echo ""
echo "📋 Layer ARN for Terraform (copy this to main.tf):"
echo "   $LAYER_ARN"
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

# Step 2: Build and deploy Lambda packages
echo "Step 2: Building and deploying Lambda packages..."
cd "$PROJECT_ROOT"

echo "Installing dependencies..."
bun install

# Define Lambda functions to deploy
declare -A LAMBDAS=(
  # ["backend"]="backend-boilerplate:prepare-lambda-backend.sh:lambda-backend.zip"
  ["frontend"]="nextjs-boilerplate:prepare-lambda-frontend.sh:lambda-frontend.zip"
)

# Build and upload each Lambda function
for LAMBDA_TYPE in "${!LAMBDAS[@]}"; do
  IFS=':' read -r APP_NAME SCRIPT_NAME ZIP_NAME <<< "${LAMBDAS[$LAMBDA_TYPE]}"
  
  echo ""
  echo "📦 Processing $LAMBDA_TYPE Lambda..."
  
  echo "Building $APP_NAME application..."
  bun run build --filter=$APP_NAME
  
  echo "Preparing $LAMBDA_TYPE Lambda package..."
  chmod +x .github/scripts/$SCRIPT_NAME
  .github/scripts/$SCRIPT_NAME
  
  echo "Uploading $LAMBDA_TYPE package to S3..."
  aws s3 cp dist/$ZIP_NAME \
    "s3://${BUCKET}/${LAMBDA_TYPE}/${ZIP_NAME}" \
    --region "$REGION"
  
  echo "✅ $LAMBDA_TYPE package uploaded successfully"
done

echo ""
echo "✅ All Lambda packages built and uploaded"
echo ""

# Step 3: Apply full Terraform configuration
echo "Step 3: Applying full Terraform configuration..."
cd "$PROJECT_ROOT/infra/terraform/environments/dev"

terraform apply

echo "✅ Terraform applied successfully"
echo ""

# Step 4: Publish versions and update aliases
echo "Step 4: Publishing Lambda versions and updating aliases..."

for LAMBDA_TYPE in "${!LAMBDAS[@]}"; do
  echo ""
  echo "📋 Processing $LAMBDA_TYPE Lambda..."
  
  FUNCTION_NAME=$(terraform output -raw ${LAMBDA_TYPE}_function_name)
  ALIAS_NAME=$(terraform output -raw ${LAMBDA_TYPE}_alias_name)
  
  echo "Function: $FUNCTION_NAME"
  echo "Alias: $ALIAS_NAME"
  
  # Publish version
  VERSION_OUTPUT=$(aws lambda publish-version \
    --function-name "$FUNCTION_NAME" \
    --description "Initial deployment" \
    --region "$REGION" \
    --output json)
  
  NEW_VERSION=$(echo "$VERSION_OUTPUT" | jq -r '.Version')
  echo "Published version: $NEW_VERSION"
  
  # Update alias to point to new version
  aws lambda update-alias \
    --function-name "$FUNCTION_NAME" \
    --name "$ALIAS_NAME" \
    --function-version "$NEW_VERSION" \
    --region "$REGION" \
    --output json > /dev/null
  
  echo "✅ $LAMBDA_TYPE alias '$ALIAS_NAME' updated to version $NEW_VERSION"
done

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
