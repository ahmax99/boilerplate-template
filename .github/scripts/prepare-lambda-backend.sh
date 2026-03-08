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

echo "Preparing package.json with shared dependencies..."
cd dist/lambda-backend

# Remove workspace dependencies and add actual versions from shared packages
sed -i '/"@shared\/.*": "workspace:\*"/d' package.json

# Add @shared dependencies to package.json so bun install handles them
cat > /tmp/add_deps.js << 'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const configPkg = JSON.parse(fs.readFileSync('../../shared/config/package.json', 'utf8'));
const neonPkg = JSON.parse(fs.readFileSync('../../shared/neon/package.json', 'utf8'));

// Merge @shared dependencies into main package.json
pkg.dependencies = pkg.dependencies || {};
Object.assign(pkg.dependencies, configPkg.dependencies);
Object.assign(pkg.dependencies, neonPkg.dependencies);

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
EOF

node /tmp/add_deps.js
rm /tmp/add_deps.js

echo "Installing all dependencies..."
bun install --production --no-save

echo "Copying shared packages to node_modules..."
mkdir -p node_modules/@shared

# Copy @shared/config
mkdir -p node_modules/@shared/config
cp -r ../../shared/config/dist node_modules/@shared/config/
cp ../../shared/config/package.json node_modules/@shared/config/

# Copy @shared/neon
mkdir -p node_modules/@shared/neon
cp -r ../../shared/neon/dist node_modules/@shared/neon/
cp -r ../../shared/neon/prisma node_modules/@shared/neon/
cp ../../shared/neon/package.json node_modules/@shared/neon/

echo "Cleaning up unnecessary files..."
# Remove documentation and metadata
find node_modules -type f -name "*.md" -delete
find node_modules -type f -name "*.markdown" -delete
find node_modules -type f -name "LICENSE*" -delete
find node_modules -type f -name "CHANGELOG*" -delete
find node_modules -type f -name "HISTORY*" -delete
find node_modules -type f -name "AUTHORS*" -delete
find node_modules -type f -name "CONTRIBUTORS*" -delete

# Remove source files
find node_modules -type f -name "*.ts" ! -name "*.d.ts" -delete
find node_modules -type f -name "*.tsx" -delete
find node_modules -type f -name "*.map" -delete
find node_modules -type f -name "*.flow" -delete

# Remove test and development files
find node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "coverage" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name ".nyc_output" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "examples" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "example" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "doc" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "benchmark" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "benchmarks" -exec rm -rf {} + 2>/dev/null || true

# Remove config files
find node_modules -type f -name "tsconfig.json" -delete
find node_modules -type f -name ".gitignore" -delete
find node_modules -type f -name ".github" -delete

# Remove Prisma CLI (keep only client)
rm -rf node_modules/prisma 2>/dev/null || true
rm -rf node_modules/@prisma/engines 2>/dev/null || true
rm -rf node_modules/@prisma/client/node_modules/.prisma/client/*.node.* 2>/dev/null || true

# Keep only necessary Prisma engine for Lambda (Linux x64)
if [ -d "node_modules/@prisma/client" ]; then
  find node_modules/@prisma/client -name "*.node" ! -name "*linux-*" -delete 2>/dev/null || true
fi

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

# Create zip with maximum compression (level 9)
find . -type f -print0 | sort -z | xargs -0 touch -t 202401010000.00
find . -type f -print0 | sort -z | xargs -0 zip -X -9 -q ../lambda-backend.zip
cd ..

PACKAGE_SIZE=$(stat -c%s lambda-backend.zip 2>/dev/null || stat -f%z lambda-backend.zip 2>/dev/null)
echo "✅ Package created: $(du -h lambda-backend.zip | cut -f1) ($PACKAGE_SIZE bytes)"

if [ $PACKAGE_SIZE -gt 52428800 ]; then
  echo "⚠️  Warning: Package is larger than 50MB"
fi
