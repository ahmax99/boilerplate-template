#!/usr/bin/env bash
set -euo pipefail

: "${PROJECT_NAME:?PROJECT_NAME is required}"
: "${ENVIRONMENT:?ENVIRONMENT is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${CENTRAL_ECR_ACCOUNT_ID:?CENTRAL_ECR_ACCOUNT_ID is required}"

BACKEND_REPO="$PROJECT_NAME-backend"
FRONTEND_REPO="$PROJECT_NAME-frontend"

has_latest() {
  local repo="$1"
  aws ecr batch-get-image \
    --registry-id "$CENTRAL_ECR_ACCOUNT_ID" \
    --repository-name "$repo" \
    --image-ids imageTag=latest \
    --region "$AWS_REGION" \
    --query 'images[0].imageId.imageTag' \
    --output text 2>/dev/null | grep -q '^latest$'
}

images="present"
has_latest "$BACKEND_REPO" || images="absent"
has_latest "$FRONTEND_REPO" || images="absent"

env_state="existing"
if ! aws lambda get-function \
       --function-name "$PROJECT_NAME-$ENVIRONMENT-backend" \
       --region "$AWS_REGION" \
       --output json > /dev/null 2>&1; then
  env_state="fresh"
fi

if [ "$images" = "absent" ] || [ "$env_state" = "fresh" ]; then
  MODE="bootstrap"
else
  MODE="steady-state"
fi

{
  echo "mode=$MODE"
  echo "images=$images"
} >> "$GITHUB_OUTPUT"
echo "ECR check: images=$images env=$env_state → $MODE"
