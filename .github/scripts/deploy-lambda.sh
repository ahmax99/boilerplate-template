#!/bin/bash
set -e

FUNCTION_NAME="${1}"
S3_BUCKET="${2}"
S3_KEY="${3}"
ALIAS_NAME="${4}"
AWS_REGION="${5}"
CODEDEPLOY_APP="${6}"
CODEDEPLOY_GROUP="${7}"
GIT_SHA="${8}"
RELEASE_TAG="${9}"

if [ -z "$FUNCTION_NAME" ] || [ -z "$S3_BUCKET" ] || [ -z "$S3_KEY" ] || [ -z "$ALIAS_NAME" ] || [ -z "$AWS_REGION" ] || [ -z "$CODEDEPLOY_APP" ] || [ -z "$CODEDEPLOY_GROUP" ]; then
  echo "❌ Error: Missing required parameters"
  echo "Usage: $0 <function_name> <s3_bucket> <s3_key> <alias_name> <aws_region> <codedeploy_app> <codedeploy_group> [git_sha] [release_tag]"
  exit 1
fi

echo "🚀 Deploying Lambda function"
echo "Function: $FUNCTION_NAME"
echo "Alias: $ALIAS_NAME"
echo "Region: $AWS_REGION"

echo "Updating Lambda function code..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --s3-bucket "$S3_BUCKET" \
  --s3-key "$S3_KEY" \
  --region "$AWS_REGION" \
  --output json > /tmp/lambda-update.json

echo "Waiting for function update to complete..."
aws lambda wait function-updated \
  --function-name "$FUNCTION_NAME" \
  --region "$AWS_REGION"

echo "Publishing new Lambda version..."
DESCRIPTION="Deployed from GitHub Actions"
[ -n "$GIT_SHA" ] && DESCRIPTION="$DESCRIPTION - SHA: $GIT_SHA"
[ -n "$RELEASE_TAG" ] && DESCRIPTION="$DESCRIPTION, Tag: $RELEASE_TAG"

VERSION_OUTPUT=$(aws lambda publish-version \
  --function-name "$FUNCTION_NAME" \
  --description "$DESCRIPTION" \
  --region "$AWS_REGION" \
  --output json)

NEW_VERSION=$(echo "$VERSION_OUTPUT" | jq -r '.Version')
echo "✅ Published version: $NEW_VERSION"

echo "Getting current version from alias: $ALIAS_NAME"
CURRENT_VERSION=$(aws lambda get-alias \
  --function-name "$FUNCTION_NAME" \
  --name "$ALIAS_NAME" \
  --region "$AWS_REGION" \
  --query 'FunctionVersion' \
  --output text)

echo "Current version: $CURRENT_VERSION"

echo "Generating AppSpec (JSON format)..."

APPSPEC_JSON=$(cat <<EOF
{
  "version": "0.0",
  "Resources": [{
    "LambdaFunction": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Name": "${FUNCTION_NAME}",
        "Alias": "${ALIAS_NAME}",
        "CurrentVersion": "${CURRENT_VERSION}",
        "TargetVersion": "${NEW_VERSION}"
      }
    }
  }]
}
EOF
)

echo "Creating CodeDeploy deployment..."
echo "Application: $CODEDEPLOY_APP"
echo "Deployment Group: $CODEDEPLOY_GROUP"
echo "Current Version: $CURRENT_VERSION"
echo "Target Version: $NEW_VERSION"

DEPLOYMENT_DESCRIPTION="GitHub Actions deployment"
[ -n "$GIT_SHA" ] && DEPLOYMENT_DESCRIPTION="$DEPLOYMENT_DESCRIPTION - SHA: $GIT_SHA"
[ -n "$RELEASE_TAG" ] && DEPLOYMENT_DESCRIPTION="$DEPLOYMENT_DESCRIPTION, Tag: $RELEASE_TAG"

APPSPEC_CONTENT=$(echo "$APPSPEC_JSON" | jq -c . | jq -Rs .)

DEPLOYMENT_ID=$(aws deploy create-deployment \
  --application-name "$CODEDEPLOY_APP" \
  --deployment-group-name "$CODEDEPLOY_GROUP" \
  --revision revisionType=AppSpecContent,appSpecContent={content="$APPSPEC_CONTENT"} \
  --description "$DEPLOYMENT_DESCRIPTION" \
  --region "$AWS_REGION" \
  --query 'deploymentId' \
  --output text)

echo "✅ Deployment created: $DEPLOYMENT_ID"

echo "Waiting for deployment to complete..."
echo "This may take several minutes due to gradual traffic shifting..."

if ! aws deploy wait deployment-successful \
  --deployment-id "$DEPLOYMENT_ID" \
  --region "$AWS_REGION"; then
  
  echo "❌ Deployment failed. Fetching error details..."
  aws deploy get-deployment \
    --deployment-id "$DEPLOYMENT_ID" \
    --region "$AWS_REGION" \
    --query 'deploymentInfo.errorInformation' \
    --output json
  
  exit 1
fi

echo "✅ Deployment completed successfully!"

if [ -n "$GITHUB_OUTPUT" ]; then
  echo "current_version=$CURRENT_VERSION" >> "$GITHUB_OUTPUT"
  echo "new_version=$NEW_VERSION" >> "$GITHUB_OUTPUT"
  echo "deployment_id=$DEPLOYMENT_ID" >> "$GITHUB_OUTPUT"
  echo "function_name=$FUNCTION_NAME" >> "$GITHUB_OUTPUT"
fi

rm -f /tmp/lambda-update.json
