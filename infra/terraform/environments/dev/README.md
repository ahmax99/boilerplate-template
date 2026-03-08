# Development Environment

This directory contains the Terraform configuration for the **development** environment.

## Environment Details

- **Domain**: `dev.boilerplate-template.ahmax99.online`
- **AWS Region**: `ap-northeast-1`
- **Environment**: `dev`

## Prerequisites

1. AWS credentials configured (`aws configure` or environment variables)
2. Terraform >= 1.14.0 installed
3. Bun installed (`curl -fsSL https://bun.sh/install | bash`)
4. Docker installed and running
5. **S3 backend resources created** - Run the bootstrap configuration first:
   ```bash
   cd ../../bootstrap
   terraform init && terraform apply -auto-approve
   cd ../environments/dev
   ```

## Initial Setup (First Time Only)

For the **first deployment**, use the automated initial deployment script:

```bash
# Set required environment variables for frontend
export NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
export NEXT_PUBLIC_BACKEND_URL="https://xxx.lambda-url.ap-northeast-1.on.aws/"
export NEXT_PUBLIC_SENTRY_DSN=""  # Optional

# From project root
./infra/scripts/initial-deploy.sh
```

This script will:
1. ✅ Initialize Terraform and create ECR repositories
2. ✅ Build backend Docker image with Prisma support
3. ✅ Build frontend Docker image with Next.js environment variables
4. ✅ Push Docker images to ECR
5. ✅ Apply full Terraform configuration (creates all infrastructure)
6. ✅ Publish Lambda versions and update aliases

After the script completes:
```bash
git add .
git commit -m "Initial setup"
git push origin main
```

**GitHub Actions will handle all future deployments automatically.**

## Google OAuth Setup

Google OAuth is **enabled by default** in this environment. To configure it:

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Enable **Google+ API**
5. Go to **APIs & Services** > **OAuth consent screen**
   - Select **External** user type
   - Fill in app name, support email, and developer contact
   - Add scopes: `openid`, `profile`, `email`
   - Add test users (if using External type)
6. Go to **APIs & Services** > **Credentials**
7. Click **Create Credentials** > **OAuth client ID**
8. Select **Web application** and configure:
   - **Name**: Your app name (e.g., "Boilerplate Template - Dev")
   - **Authorized redirect URIs**: 
     ```
     https://boilerplate-template-dev.auth.ap-northeast-1.amazoncognito.com/oauth2/idpresponse
     ```
     *(Replace with your actual Cognito domain after first deployment)*
9. **Save the Client ID and Client Secret**

### 2. Update Terraform Variables

Add to your `terraform.tfvars`:

```hcl
google_client_id     = "your-client-id.apps.googleusercontent.com"
google_client_secret = "your-client-secret"
```