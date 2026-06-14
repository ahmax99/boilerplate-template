#!/usr/bin/env bash
set -euo pipefail

: "${PROJECT_NAME:?PROJECT_NAME is required}"
: "${ENVIRONMENT:?ENVIRONMENT is required}"
: "${AWS_REGION:?AWS_REGION is required}"

BACKEND_REPO="$PROJECT_NAME-$ENVIRONMENT-backend"
FRONTEND_REPO="$PROJECT_NAME-$ENVIRONMENT-frontend"

backend_ok=false
frontend_ok=false

if aws ecr describe-images \
     --repository-name "$BACKEND_REPO" \
     --image-ids imageTag=latest \
     --region "$AWS_REGION" \
     --output json > /dev/null 2>&1; then
  backend_ok=true
fi

if aws ecr describe-images \
     --repository-name "$FRONTEND_REPO" \
     --image-ids imageTag=latest \
     --region "$AWS_REGION" \
     --output json > /dev/null 2>&1; then
  frontend_ok=true
fi

if [ "$backend_ok" = "true" ] && [ "$frontend_ok" = "true" ]; then
  MODE="steady-state"
else
  MODE="bootstrap"
fi

echo "mode=$MODE" >> "$GITHUB_OUTPUT"
echo "ECR check: backend=$backend_ok frontend=$frontend_ok → $MODE"
