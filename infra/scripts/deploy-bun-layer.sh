#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Get AWS region from Terraform
echo "📋 Reading Terraform configuration..."
cd infra/terraform/environments/dev

if [ ! -d ".terraform" ]; then
    echo "Initializing Terraform..."
    terraform init
fi

REGION=$(terraform output -raw aws_region 2>/dev/null || echo "")

if [ -z "$REGION" ]; then
    echo "❌ Error: Could not read AWS region from Terraform outputs"
    echo "Please run 'terraform apply' first"
    exit 1
fi

cd "$PROJECT_ROOT"

# Configuration
BUN_VERSION="1.3.11"
LAYER_NAME="boilerplate-bun-runtime"
ARCH="x64"

echo "🚀 Deploying Bun Lambda Layer"
echo "Bun Version: ${BUN_VERSION}"
echo "Layer Name: ${LAYER_NAME}"
echo "Architecture: ${ARCH}"
echo "AWS Region: $REGION"

# Check if bun-lambda package exists
if [ ! -d "bun/packages/bun-lambda" ]; then
    echo "📦 Cloning bun-lambda package..."
    git clone --filter=blob:none --sparse https://github.com/oven-sh/bun.git
    git -C bun sparse-checkout set packages/bun-lambda
    echo "🧹 Removing nested .git directory..."
    rm -rf bun/.git
    cd bun/packages/bun-lambda
    bun install
    cd ../../..
fi

cd bun/packages/bun-lambda

echo "Publishing to ${REGION}..."
    
bun run publish-layer -- \
        --arch "$ARCH" \
        --release "$BUN_VERSION" \
        --layer "$LAYER_NAME" \
        --region "$REGION"

cd ../..
