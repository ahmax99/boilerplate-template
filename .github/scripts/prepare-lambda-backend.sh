#!/bin/bash
set -e

echo "📦 Preparing Lambda package"

echo "Cleaning previous builds..."
rm -rf dist/lambda-backend
mkdir -p dist/lambda-backend

echo "Copying built application..."
cp -r apps/backend-boilerplate/dist/* dist/lambda-backend/
cp apps/backend-boilerplate/package.json dist/lambda-backend/
cp apps/backend-boilerplate/bootstrap dist/lambda-backend/
chmod +x dist/lambda-backend/bootstrap

echo "Copying shared packages..."
mkdir -p dist/lambda-backend/shared
cp -r shared/config/dist dist/lambda-backend/shared/config
cp -r shared/neon/dist dist/lambda-backend/shared/neon
cp -r shared/neon/prisma dist/lambda-backend/shared/neon/prisma
cp shared/config/package.json dist/lambda-backend/shared/config/
cp shared/neon/package.json dist/lambda-backend/shared/neon/

echo "Removing workspace dependencies from package.json..."
cd dist/lambda-backend
sed -i '/"@shared\/.*": "workspace:\*"/d' package.json

echo "Installing production dependencies..."
bun install --production --no-save

echo "Cleaning up unnecessary files..."
find node_modules -type f -name "*.md" -delete
find node_modules -type f -name "*.ts" -delete
find node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "*.test.*" -delete 2>/dev/null || true

cd ..

echo "Creating deterministic zip package..."
cd lambda-backend

# Check if directory has files
FILE_COUNT=$(find . -type f | wc -l)
echo "Files found: $FILE_COUNT"

if [ "$FILE_COUNT" -eq 0 ]; then
  echo "❌ Error: No files found in lambda-backend directory!"
  ls -la
  exit 1
fi

# Create zip
find . -type f -print0 | sort -z | xargs -0 touch -t 202401010000.00
find . -type f -print0 | sort -z | xargs -0 zip -X -0 -q ../lambda-backend.zip
cd ..

PACKAGE_SIZE=$(stat -c%s lambda-backend.zip 2>/dev/null || stat -f%z lambda-backend.zip 2>/dev/null)
echo "✅ Package created: $(du -h lambda-backend.zip | cut -f1) ($PACKAGE_SIZE bytes)"

if [ $PACKAGE_SIZE -gt 52428800 ]; then
  echo "⚠️  Warning: Package is larger than 50MB"
fi
