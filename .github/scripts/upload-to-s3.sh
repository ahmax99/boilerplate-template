#!/bin/bash
set -e

ARTIFACT_PATH="${1}"
S3_BUCKET="${2}"
S3_KEY="${3}"
AWS_REGION="${4}"
GIT_SHA="${5}"
RELEASE_TAG="${6}"
ENVIRONMENT="${7}"

if [ -z "$ARTIFACT_PATH" ] || [ -z "$S3_BUCKET" ] || [ -z "$S3_KEY" ] || [ -z "$AWS_REGION" ]; then
  echo "❌ Error: Missing required parameters"
  echo "Usage: $0 <artifact_path> <s3_bucket> <s3_key> <aws_region> [git_sha] [release_tag] [environment]"
  exit 1
fi

if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "❌ Error: Artifact not found at: $ARTIFACT_PATH"
  exit 1
fi

echo "📤 Uploading artifact to S3"
echo "Artifact: $ARTIFACT_PATH"
echo "Bucket: $S3_BUCKET"
echo "Key: $S3_KEY"
echo "Region: $AWS_REGION"

METADATA=""
[ -n "$GIT_SHA" ] && METADATA="git-sha=$GIT_SHA" && echo "Git SHA: $GIT_SHA"
[ -n "$RELEASE_TAG" ] && METADATA="${METADATA:+$METADATA,}release-tag=$RELEASE_TAG" && echo "Release Tag: $RELEASE_TAG"
[ -n "$ENVIRONMENT" ] && METADATA="${METADATA:+$METADATA,}environment=$ENVIRONMENT" && echo "Environment: $ENVIRONMENT"

DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
METADATA="${METADATA:+$METADATA,}deployed-by=github-actions,deployed-at=$DEPLOYED_AT"

aws s3 cp "$ARTIFACT_PATH" \
  "s3://${S3_BUCKET}/${S3_KEY}" \
  --metadata "$METADATA" \
  --region "$AWS_REGION"

echo "✅ Upload complete: s3://${S3_BUCKET}/${S3_KEY}"

if [ -n "$GITHUB_OUTPUT" ]; then
  echo "s3_bucket=$S3_BUCKET" >> "$GITHUB_OUTPUT"
  echo "s3_key=$S3_KEY" >> "$GITHUB_OUTPUT"
  echo "s3_uri=s3://${S3_BUCKET}/${S3_KEY}" >> "$GITHUB_OUTPUT"
fi
