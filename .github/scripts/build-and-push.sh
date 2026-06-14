#!/usr/bin/env bash
set -euo pipefail

: "${ECR_BACKEND_URL:?ECR_BACKEND_URL is required}"
: "${ECR_FRONTEND_URL:?ECR_FRONTEND_URL is required}"
: "${AWS_REGION:?AWS_REGION is required}"

echo "==> Building backend image..."
docker build --platform linux/amd64 \
  -t "${ECR_BACKEND_URL}:latest" \
  -f apps/backend-boilerplate/Dockerfile \
  --build-arg DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder?schema=public" \
  .

echo "==> Pushing backend image..."
docker push "${ECR_BACKEND_URL}:latest"
echo "Backend pushed: ${ECR_BACKEND_URL}:latest"

echo "==> Building frontend image..."
docker build --platform linux/amd64 \
  -t "${ECR_FRONTEND_URL}:latest" \
  -f apps/nextjs-boilerplate/Dockerfile \
  --build-arg NEXT_PUBLIC_BASE_URL="${NEXT_PUBLIC_BASE_URL:-}" \
  --build-arg NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL:-}" \
  --build-arg NEXT_PUBLIC_SENTRY_DSN="${NEXT_PUBLIC_SENTRY_DSN:-}" \
  .

echo "==> Pushing frontend image..."
docker push "${ECR_FRONTEND_URL}:latest"
echo "Frontend pushed: ${ECR_FRONTEND_URL}:latest"

echo "==> Both images pushed successfully."
