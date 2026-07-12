#!/bin/bash
set -e

REPOSITORY_NAME="${1}"
SOURCE_IMAGE_URI="${2}"
TARGET_IMAGE_URI="${3}"
AWS_REGION="${4}"

if [[ -z "$REPOSITORY_NAME" ]] || [[ -z "$SOURCE_IMAGE_URI" ]] || [[ -z "$TARGET_IMAGE_URI" ]] || [[ -z "$AWS_REGION" ]]; then
  echo "❌ Error: Missing required parameters" >&2
  echo "Usage: $0 <repository_name> <source_image_uri> <target_image_uri> <aws_region>" >&2
  exit 1
fi

TARGET_TAG="${TARGET_IMAGE_URI##*:}"

if aws ecr describe-images \
  --repository-name "$REPOSITORY_NAME" \
  --image-ids imageTag="$TARGET_TAG" \
  --region "$AWS_REGION" >/dev/null 2>&1; then
  echo "Tag $TARGET_TAG already present in $REPOSITORY_NAME — skipping promotion."
else
  echo "Promoting $SOURCE_IMAGE_URI -> $TARGET_IMAGE_URI"
  docker buildx imagetools create --tag "$TARGET_IMAGE_URI" "$SOURCE_IMAGE_URI"
fi
