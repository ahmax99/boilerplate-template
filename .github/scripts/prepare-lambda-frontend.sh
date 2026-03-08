#!/bin/bash
set -e

echo "📦 Preparing Lambda package"

echo "Cleaning previous builds..."
rm -rf dist/lambda-frontend
mkdir -p dist/lambda-frontend

echo "Copying built application..."
cp -r apps/nextjs-boilerplate/.next/standalone/. dist/lambda-frontend/
mkdir -p dist/lambda-frontend/apps/nextjs-boilerplate/.next/static
cp -r apps/nextjs-boilerplate/.next/static/. dist/lambda-frontend/apps/nextjs-boilerplate/.next/static/
if [ -d "apps/nextjs-boilerplate/public" ]; then
  mkdir -p dist/lambda-frontend/apps/nextjs-boilerplate/public
  cp -r apps/nextjs-boilerplate/public/. dist/lambda-frontend/apps/nextjs-boilerplate/public/
fi
cp apps/nextjs-boilerplate/bootstrap dist/lambda-frontend/
chmod +x dist/lambda-frontend/bootstrap

echo "Preparing package.json with shared dependencies..."
cd dist/lambda-frontend/apps/nextjs-boilerplate

# Remove workspace dependencies and add actual versions from shared packages
sed -i '/"@shared\/.*": "workspace:\*"/d' package.json

echo "Installing production dependencies..."
bun install --production --no-save

# Copy @shared/config
mkdir -p node_modules/@shared/config
cp -r ../../../../shared/config/dist node_modules/@shared/config/
cp ../../../../shared/config/package.json node_modules/@shared/config/

echo "Cleaning up unnecessary files..."

# Remove documentation and metadata from node_modules
find node_modules -type f -name "*.md" -delete 2>/dev/null || true
find node_modules -type f -name "*.markdown" -delete 2>/dev/null || true
find node_modules -type f -name "LICENSE*" -delete 2>/dev/null || true
find node_modules -type f -name "CHANGELOG*" -delete 2>/dev/null || true
find node_modules -type f -name "HISTORY*" -delete 2>/dev/null || true
find node_modules -type f -name "AUTHORS*" -delete 2>/dev/null || true
find node_modules -type f -name "CONTRIBUTORS*" -delete 2>/dev/null || true
find node_modules -type f -name "README*" -delete 2>/dev/null || true

# Remove source files from node_modules
find node_modules -type f -name "*.ts" ! -name "*.d.ts" -delete 2>/dev/null || true
find node_modules -type f -name "*.tsx" -delete 2>/dev/null || true
find node_modules -type f -name "*.map" -delete 2>/dev/null || true
find node_modules -type f -name "*.flow" -delete 2>/dev/null || true
find node_modules -type f -name "*.coffee" -delete 2>/dev/null || true

# Remove test and development files from node_modules
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
find node_modules -type d -name ".github" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name ".vscode" -exec rm -rf {} + 2>/dev/null || true

# Remove config files from node_modules
find node_modules -type f -name "tsconfig.json" -delete 2>/dev/null || true
find node_modules -type f -name ".gitignore" -delete 2>/dev/null || true
find node_modules -type f -name "webpack.config.*" -delete 2>/dev/null || true
find node_modules -type f -name "rollup.config.*" -delete 2>/dev/null || true

# Remove unnecessary binaries and files from node_modules
find node_modules -type f -name "*.exe" -delete 2>/dev/null || true
find node_modules -type f -name "*.dll" -delete 2>/dev/null || true
find node_modules -type f -name "*.dylib" -delete 2>/dev/null || true
find node_modules -type f -name "*.so.*" -delete 2>/dev/null || true

# Remove Next.js build cache
rm -rf .next/cache 2>/dev/null || true
rm -rf .next/trace 2>/dev/null || true

# Remove unnecessary Next.js files
rm -rf node_modules/next/dist/compiled/@next/react-dev-overlay 2>/dev/null || true
rm -rf node_modules/next/dist/compiled/@next/react-refresh-utils 2>/dev/null || true
rm -rf node_modules/next/dist/compiled/webpack 2>/dev/null || true
rm -rf node_modules/next/dist/compiled/babel 2>/dev/null || true

cd ../../..

echo "Creating deterministic zip package..."
cd lambda-frontend

# Check if directory has files
FILE_COUNT=$(find . -type f | wc -l)
echo "Files found: $FILE_COUNT"
 
if [ "$FILE_COUNT" -eq 0 ]; then
  echo "❌ Error: No files found in lambda-frontend directory!"
  ls -la
  exit 1
fi

# Create zip with maximum compression (level 9)
find . -type f -print0 | sort -z | xargs -0 touch -t 202401010000.00
find . -type f -print0 | sort -z | xargs -0 zip -X -9 -q ../lambda-frontend.zip
cd ..

PACKAGE_SIZE=$(stat -c%s lambda-frontend.zip 2>/dev/null || stat -f%z lambda-frontend.zip 2>/dev/null)
echo "✅ Package created: $(du -h lambda-frontend.zip | cut -f1) ($PACKAGE_SIZE bytes)"

if [ $PACKAGE_SIZE -gt 52428800 ]; then
  echo "⚠️  Warning: Package is larger than 50MB"
fi