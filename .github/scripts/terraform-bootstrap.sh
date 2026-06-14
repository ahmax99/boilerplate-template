#!/usr/bin/env bash
set -euo pipefail

: "${AWS_REGION:?AWS_REGION is required}"

echo "==> Creating ECR repositories..."
terraform -chdir=infra/terraform apply \
  -target=module.ecr_backend \
  -target=module.ecr_frontend \
  -auto-approve \
  -lock-timeout=300s

echo "==> Capturing ECR repository URLs..."
ECR_BACKEND_URL=$(terraform -chdir=infra/terraform output -raw ecr_backend_repository_url)
ECR_FRONTEND_URL=$(terraform -chdir=infra/terraform output -raw ecr_frontend_repository_url)

echo "==> Building and pushing Docker images..."
ECR_BACKEND_URL="$ECR_BACKEND_URL" \
ECR_FRONTEND_URL="$ECR_FRONTEND_URL" \
  .github/scripts/build-and-push.sh

echo "==> Running full Terraform apply..."
terraform -chdir=infra/terraform apply \
  -auto-approve \
  -lock-timeout=300s

echo "==> Publishing Lambda versions and updating aliases..."
BACKEND_FN=$(terraform -chdir=infra/terraform output -raw backend_function_name)
BACKEND_ALIAS=$(terraform -chdir=infra/terraform output -raw backend_alias_name)
FRONTEND_FN=$(terraform -chdir=infra/terraform output -raw frontend_function_name)
FRONTEND_ALIAS=$(terraform -chdir=infra/terraform output -raw frontend_alias_name)

for pair in "backend:$BACKEND_FN:$BACKEND_ALIAS" "frontend:$FRONTEND_FN:$FRONTEND_ALIAS"; do
  APP=$(echo "$pair" | cut -d: -f1)
  FN=$(echo "$pair" | cut -d: -f2)
  ALIAS=$(echo "$pair" | cut -d: -f3)
  echo "==> Publishing $APP Lambda version..."
  VERSION=$(aws lambda publish-version \
    --function-name "$FN" \
    --description "Bootstrap via CI" \
    --output json | jq -r '.Version')
  echo "==> Updating $APP alias '$ALIAS' → version $VERSION..."
  aws lambda update-alias \
    --function-name "$FN" \
    --name "$ALIAS" \
    --function-version "$VERSION" \
    --output json > /dev/null
  echo "$APP alias updated to version $VERSION"
done
