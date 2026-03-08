# CloudFront Implementation Plan

This guide covers every change needed to introduce CloudFront as the single public entry-point in front of the existing two Lambda Function URLs (Next.js frontend + Elysia backend). It also wires in the IAM-auth security model described in `lambda-iam-auth.md`.

---

## Overview of What Will Change

| Layer | What changes |
|---|---|
| Terraform modules | `lambda` module: `authorization_type`, new output |
| Terraform modules | New `cloudfront` module |
| Terraform environments | `dev/main.tf`: wire CloudFront + OAC + Lambda permissions |
| Terraform environments | `dev/outputs.tf`: expose CloudFront domain |
| Terraform environments | `dev/locals.tf`: S3 static-assets bucket name |
| Next.js | `src/lib/apiClient.ts`: SigV4 signing for server-to-server calls |
| Next.js | `src/config/env.ts`: new `NEXT_PUBLIC_BACKEND_URL` note |
| Next.js | `next.config.ts`: trusted-host / `X-Forwarded-Host` header |
| Backend | `src/` (Elysia): CORS – CloudFront domain becomes the allowed origin |
| Both apps | `.env.example` & Lambda env vars: update `FRONTEND_URL` / `NEXT_PUBLIC_BACKEND_URL` |

---

## Prerequisites

None! This guide deploys CloudFront with its default domain (e.g., `d1234abcd.cloudfront.net`).

> **Note:** This guide uses CloudFront's default domain. Your Lambda functions will be in `ap-northeast-1` (Tokyo), and CloudFront will distribute them globally.

---

## Step 1 — Terraform: `lambda` module changes

### 1a. `infra/terraform/modules/lambda/main.tf`

Change `authorization_type` on the Function URL from `"NONE"` to `"AWS_IAM"`:

```hcl
resource "aws_lambda_function_url" "this" {
  count = var.enable_function_url ? 1 : 0

  function_name      = aws_lambda_function.this.function_name
  authorization_type = "AWS_IAM"   # was "NONE"

  cors {
    allow_origins = var.cors_allow_origins
    allow_methods = var.cors_allow_methods
    allow_headers = var.cors_allow_headers
    max_age       = var.cors_max_age
  }
}
```

> **Note:** With `authorization_type = "AWS_IAM"`, AWS no longer enforces the CORS block on the Function URL. CloudFront becomes the CORS boundary; the backend app handles CORS itself for the `/api/*` path behavior.

### 1b. `infra/terraform/modules/lambda/outputs.tf`

Add the IAM role ARN output so the environment layer can reference it:

```hcl
output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda.arn
}
```

---

## Step 2 — Terraform: new `cloudfront` module

Create `infra/terraform/modules/cloudfront/`. This module encapsulates the full distribution so it can be reused per-environment.

### `infra/terraform/modules/cloudfront/variables.tf`

```hcl
variable "name_prefix" {
  description = "Prefix for all resource names"
  type        = string
}

# Frontend Lambda
variable "frontend_function_url" {
  description = "Frontend Lambda Function URL (without https://)"
  type        = string
}

# Backend Lambda
variable "backend_function_url" {
  description = "Backend Lambda Function URL (without https://)"
  type        = string
}

# S3 — static assets served directly from the Next.js standalone build
variable "static_assets_bucket_domain_name" {
  description = "Regional domain name of the S3 bucket (bucket_regional_domain_name)"
  type        = string
}

variable "static_assets_bucket_id" {
  description = "S3 bucket ID for the S3 bucket policy"
  type        = string
}

variable "static_assets_bucket_arn" {
  description = "S3 bucket ARN for the static assets bucket"
  type        = string
}

variable "logs_bucket_id" {
  description = "S3 bucket for CloudFront access logs"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
```

> **Note:** The module is split into dedicated files following project conventions:
> - `data.tf` — data sources (`aws_region`)
> - `locals.tf` — local values (strip `https://` from Function URLs)
> - `main.tf` — all resources
> - `outputs.tf` — module outputs

### `infra/terraform/modules/cloudfront/data.tf`

```hcl
data "aws_region" "current" {}
```

### `infra/terraform/modules/cloudfront/locals.tf`

```hcl
locals {
  # Strip "https://" prefix and trailing "/" from Function URLs to use as origin domains
  backend_origin_domain  = trimsuffix(replace(var.backend_function_url, "https://", ""), "/")
  frontend_origin_domain = trimsuffix(replace(var.frontend_function_url, "https://", ""), "/")
}
```

### `infra/terraform/modules/cloudfront/main.tf`

```hcl
# -----------------------------------------------------------
# CloudFront Origin Access Control — Backend Lambda (SigV4)
# -----------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "backend" {
  name                              = "${var.name_prefix}-backend-oac"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------
# CloudFront Origin Access Control — Frontend Lambda (SigV4)
# -----------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.name_prefix}-frontend-oac"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------
# CloudFront Origin Access Control — S3 Static Assets
# -----------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "static" {
  name                              = "${var.name_prefix}-static-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------
# S3 Bucket Policy — allow CloudFront OAC to read static assets
# depends_on ensures the distribution ARN is known before this policy is applied.
# DenyNonHTTPS is merged here because the S3 module's enforce_https is disabled
# on this bucket to avoid a dual bucket policy conflict (S3 allows only one policy).
# -----------------------------------------------------------
resource "aws_s3_bucket_policy" "static_assets_cf" {
  bucket = var.static_assets_bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${var.static_assets_bucket_arn}/*"
        Condition = {
          StringEquals = {
            "aws:SourceArn" = aws_cloudfront_distribution.this.arn
          }
        }
      },
      {
        Sid       = "DenyNonHTTPS"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          var.static_assets_bucket_arn,
          "${var.static_assets_bucket_arn}/*",
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      },
    ]
  })

  depends_on = [aws_cloudfront_distribution.this]
}

# -----------------------------------------------------------
# Cache Policies
# -----------------------------------------------------------

# Immutable static assets (/_next/static/*) — aggressive long-lived caching
resource "aws_cloudfront_cache_policy" "static_immutable" {
  name        = "${var.name_prefix}-static-immutable"
  default_ttl = 86400    # 1 day
  max_ttl     = 31536000 # 1 year
  min_ttl     = 86400

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true

    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

# Public static assets (/static/*, /public/*) — aggressive but not immutable
resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "${var.name_prefix}-static-assets"
  default_ttl = 86400
  max_ttl     = 604800 # 7 days
  min_ttl     = 3600

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true

    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

# API / Lambda origins — no caching
# Only cache key-neutral headers here; auth + forwarding handled by origin request policy
resource "aws_cloudfront_cache_policy" "no_cache" {
  name        = "${var.name_prefix}-no-cache"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = false
    enable_accept_encoding_brotli = false

    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

# -----------------------------------------------------------
# Origin Request Policies (what is forwarded to origins)
# -----------------------------------------------------------

# For Lambda origins: forward all viewer headers + cookies + query strings
# Note: Do NOT forward Authorization header — OAC overwrites it with SigV4 signature.
# x-amz-content-sha256 is required by Lambda Function URL for POST/PUT with OAC.
resource "aws_cloudfront_origin_request_policy" "lambda_all" {
  name = "${var.name_prefix}-lambda-all"

  cookies_config { cookie_behavior = "all" }
  headers_config {
    header_behavior = "allViewerAndWhitelistCloudFront"
    headers {
      items = [
        "CloudFront-Viewer-Country",
        "CloudFront-Is-Mobile-Viewer",
      ]
    }
  }
  query_strings_config { query_string_behavior = "all" }
}

# -----------------------------------------------------------
# CloudFront Distribution
# -----------------------------------------------------------
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.name_prefix} CloudFront distribution"
  default_root_object = ""
  price_class         = "PriceClass_200" # NA, EU, Asia

  # ----------
  # Origin: S3 static assets (/_next/static/*, /static/*)
  # ----------
  origin {
    origin_id                = "s3-static"
    domain_name              = var.static_assets_bucket_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.static.id
  }

  # ----------
  # Origin: Backend Lambda (/api/*)
  # Lambda Function URL origins require custom_origin_config even with OAC
  # ----------
  origin {
    origin_id                = "backend-lambda"
    domain_name              = local.backend_origin_domain
    origin_access_control_id = aws_cloudfront_origin_access_control.backend.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # ----------
  # Origin: Frontend Lambda (/* default)
  # Lambda Function URL origins require custom_origin_config even with OAC
  # ----------
  origin {
    origin_id                = "frontend-lambda"
    domain_name              = local.frontend_origin_domain
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # ----------
  # Behavior 1: /_next/static/* — immutable hashed assets from S3
  # Priority order: more specific paths first
  # ----------
  ordered_cache_behavior {
    path_pattern             = "/_next/static/*"
    target_origin_id         = "s3-static"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.static_immutable.id
  }

  # ----------
  # Behavior 2: /static/* — public assets from S3
  # ----------
  ordered_cache_behavior {
    path_pattern             = "/static/*"
    target_origin_id         = "s3-static"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.static_assets.id
  }

  # ----------
  # Behavior 3: /api/* — backend Lambda, no cache, IAM-signed by OAC
  # ----------
  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = "backend-lambda"
    viewer_protocol_policy   = "https-only"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.lambda_all.id
  }

  # ----------
  # Default behavior: /* — frontend Lambda (Next.js SSR/BFF)
  # ----------
  default_cache_behavior {
    target_origin_id         = "frontend-lambda"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.lambda_all.id
  }

  # ----------
  # TLS certificate (CloudFront default)
  # minimum_protocol_version must be "TLSv1" when using cloudfront_default_certificate
  # ----------
  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1"
  }

  # ----------
  # Access logging
  # ----------
  logging_config {
    include_cookies = false
    bucket          = "${var.logs_bucket_id}.s3.amazonaws.com"
    prefix          = "cloudfront/"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = var.tags
}
```

### `infra/terraform/modules/cloudfront/outputs.tf`

```hcl
output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.this.id
}

output "distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.this.arn
}

output "distribution_domain_name" {
  description = "CloudFront distribution domain name (use for DNS CNAME)"
  value       = aws_cloudfront_distribution.this.domain_name
}

output "hosted_zone_id" {
  description = "CloudFront hosted zone ID (use for Route 53 alias record)"
  value       = aws_cloudfront_distribution.this.hosted_zone_id
}

output "backend_oac_id" {
  description = "OAC ID for the backend Lambda origin"
  value       = aws_cloudfront_origin_access_control.backend.id
}

output "frontend_oac_id" {
  description = "OAC ID for the frontend Lambda origin"
  value       = aws_cloudfront_origin_access_control.frontend.id
}
```

---

## Step 3 — Terraform: `dev` environment changes

### 3a. `infra/terraform/environments/dev/locals.tf` — add static assets bucket name

```hcl
locals {
  # ... existing locals ...
  s3_static_assets_bucket_name = "${local.name_prefix}-static-assets"
}
```

### 3b. `infra/terraform/environments/dev/main.tf` — update `module "s3_logs"`

CloudFront access logging requires the logs bucket to have ACL enabled with `log-delivery-write`. Update the existing `module "s3_logs"` block:

```hcl
module "s3_logs" {
  # ... existing config ...
  enable_acl = true   # required for CloudFront log-delivery-write ACL
}
```

This requires the S3 module to expose an `enable_acl` variable that creates:
- `aws_s3_bucket_ownership_controls` with `object_ownership = "BucketOwnerPreferred"`
- `aws_s3_bucket_acl` with `acl = "log-delivery-write"`

### 3c. `infra/terraform/environments/dev/main.tf` — add five new blocks

Add these blocks **after** the existing `module "s3_uploads"` block:

```hcl
# -------------------
# S3 — Static Assets (Next.js /_next/static/* and /static/*)
# -------------------
module "s3_static_assets" {
  source = "../../modules/s3"

  bucket_name = local.s3_static_assets_bucket_name

  enable_versioning       = false
  # enforce_https is false here because the CloudFront module's S3 bucket policy
  # already includes a DenyNonHTTPS statement. Enabling it would create a dual
  # bucket policy conflict (S3 only allows one policy per bucket).
  enforce_https           = false
  enable_encryption       = true
  block_public_access     = true
  enable_acl              = false
  enable_cors             = false
  cors_allowed_origins    = []
  cors_allowed_methods    = []
  cors_allowed_headers    = []
  cors_max_age_seconds    = 0
  enable_access_logging   = true
  logging_target_bucket   = module.s3_logs.bucket_id
  logging_target_prefix   = "static-assets/"

  lifecycle_rules = []

  tags = merge(
    local.common_tags,
    {
      Name = local.s3_static_assets_bucket_name
    }
  )
}
```

Add the CloudFront module invocation **after** the `module "cognito"` block:

```hcl
# -------------------
# CloudFront
# -------------------
module "cloudfront" {
  source = "../../modules/cloudfront"

  name_prefix              = local.name_prefix

  frontend_function_url    = module.frontend.function_url
  backend_function_url     = module.backend.function_url

  static_assets_bucket_domain_name = module.s3_static_assets.bucket_regional_domain_name
  static_assets_bucket_id          = module.s3_static_assets.bucket_id
  static_assets_bucket_arn         = module.s3_static_assets.bucket_arn
  logs_bucket_id                   = module.s3_logs.bucket_id

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-cloudfront"
    }
  )

  # Lambda permissions must exist before CloudFront validates Lambda origins.
  # source_arn is omitted from permissions to break the circular dependency
  # (permissions would reference distribution_arn which doesn't exist yet).
  depends_on = [
    aws_lambda_permission.cloudfront_invoke_backend,
    aws_lambda_permission.cloudfront_invoke_frontend,
  ]
}
```

Add IAM permissions — CloudFront OAC → Backend Lambda (add **after** the `module "cloudfront"` block):

```hcl
# -------------------
# IAM: CloudFront OAC → Backend Lambda
# -------------------
# source_arn is intentionally omitted: adding it would reference module.cloudfront.distribution_arn
# which creates a circular dependency (CloudFront needs these permissions to validate Lambda
# origins during creation, but the ARN is unknown until the distribution exists).
# Security is maintained by OAC SigV4 signing — only CloudFront can produce valid signed requests.
resource "aws_lambda_permission" "cloudfront_invoke_backend" {
  statement_id           = "AllowCloudFrontInvokeBackend"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = module.backend.function_name
  principal              = "cloudfront.amazonaws.com"
  function_url_auth_type = "AWS_IAM"
}

# -------------------
# IAM: CloudFront OAC → Frontend Lambda
# -------------------
resource "aws_lambda_permission" "cloudfront_invoke_frontend" {
  statement_id           = "AllowCloudFrontInvokeFrontend"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = module.frontend.function_name
  principal              = "cloudfront.amazonaws.com"
  function_url_auth_type = "AWS_IAM"
}

# -------------------
# IAM: Frontend Lambda (SSR) → Backend Lambda (server-to-server)
# -------------------
resource "aws_lambda_permission" "frontend_invoke_backend" {
  statement_id           = "AllowFrontendInvokeBackend"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = module.backend.function_name
  principal              = module.frontend.lambda_role_arn
  function_url_auth_type = "AWS_IAM"
}
```

> **Note:** No Route 53 configuration needed. After `terraform apply`, use the CloudFront domain from the output `cloudfront_domain_name` (e.g., `d1234abcd.cloudfront.net`) to access your application.

### 3b. `infra/terraform/environments/dev/outputs.tf` — add CloudFront outputs

```hcl
# -------------------
# CloudFront
# -------------------
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (needed for cache invalidation in CI)"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.distribution_domain_name
}

output "static_assets_bucket_name" {
  description = "S3 bucket to upload Next.js static assets"
  value       = module.s3_static_assets.bucket_name
}
```

### 3c. Update Lambda environment variables in `dev/main.tf`

The frontend Lambda no longer talks to the raw backend Function URL in production — CloudFront sits in front. You'll need to update `NEXT_PUBLIC_BACKEND_URL` after deployment:

```hcl
module "frontend" {
  # ...
  environment_variables = {
    # ...existing vars...
    # After terraform apply, update this to: https://<cloudfront-domain>/api/v1
    # Get the domain from: terraform output cloudfront_domain_name
    NEXT_PUBLIC_BACKEND_URL = "https://REPLACE_WITH_CLOUDFRONT_DOMAIN/api/v1"
  }
}
```

> **Important:** After running `terraform apply`, get the CloudFront domain from `terraform output cloudfront_domain_name`, then update this environment variable and run `terraform apply` again.

---

## Step 4 — Terraform: `lambda` module — add `authorization_type` variable (optional but clean)

If you want the module to support both `NONE` (local dev) and `AWS_IAM`, add a variable:

```hcl
# variables.tf
variable "function_url_auth_type" {
  description = "Authorization type for Lambda Function URL: NONE or AWS_IAM"
  type        = string
  default     = "AWS_IAM"
  validation {
    condition     = contains(["NONE", "AWS_IAM"], var.function_url_auth_type)
    error_message = "Must be NONE or AWS_IAM"
  }
}
```

```hcl
# main.tf — update resource
resource "aws_lambda_function_url" "this" {
  # ...
  authorization_type = var.function_url_auth_type
}
```

Then set `function_url_auth_type = "AWS_IAM"` on both `module "backend"` and `module "frontend"` in `dev/main.tf`.

---

## Step 5 — Terraform: apply order

```
# 1. Apply the module changes (lambda auth type, new outputs)
terraform -chdir=infra/terraform/environments/dev apply -target=module.backend -target=module.frontend

# 2. Apply S3 static assets bucket
terraform -chdir=infra/terraform/environments/dev apply -target=module.s3_static_assets

# 3. Apply CloudFront distribution + OAC + Lambda permissions
terraform -chdir=infra/terraform/environments/dev apply -target=module.cloudfront \
  -target=aws_lambda_permission.cloudfront_invoke_backend \
  -target=aws_lambda_permission.cloudfront_invoke_frontend \
  -target=aws_lambda_permission.frontend_invoke_backend

# 4. Final full apply to catch any drift
terraform -chdir=infra/terraform/environments/dev apply
```

> CloudFront distributions take **15–30 minutes** to propagate after creation.

---

## Step 6 — Next.js code changes

### 6a. Install SigV4 packages

```bash
pnpm --filter nextjs-boilerplate add @aws-sdk/signature-v4 @aws-crypto/sha256-js @aws-sdk/credential-providers
```

### 6b. `apps/nextjs-boilerplate/src/lib/apiClient.ts`

Add SigV4 signing to `serverApiClient` so server-to-server calls to the backend Lambda URL are authenticated. The signing hook is a no-op in local development.

```ts
import { Sha256 } from '@aws-crypto/sha256-js'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { SignatureV4 } from '@aws-sdk/signature-v4'
import ky from 'ky'

import { env } from '@/config/env'
import { getTokens } from '@/features/auth/server/services/token'
import { AppError } from '@/features/error/lib/AppError'

const isProduction = process.env.NODE_ENV === 'production'

const signer = isProduction
  ? new SignatureV4({
      credentials: fromNodeProviderChain(),   // picks up Lambda execution role automatically
      region: process.env.AWS_REGION ?? 'ap-northeast-1',
      service: 'lambda',
      sha256: Sha256,
    })
  : null

const signingHook = async (request: Request): Promise<void> => {
  if (!signer) return

  const url = new URL(request.url)
  const bodyBuffer = request.body ? await request.arrayBuffer() : undefined

  const signed = await signer.sign({
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    hostname: url.hostname,
    path: url.pathname + url.search,
    body: bodyBuffer,
    protocol: url.protocol,
  })

  Object.entries(signed.headers).forEach(([k, v]) =>
    request.headers.set(k, v as string),
  )
}

export const apiClient = ky.create({
  prefix: '/api/',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export const serverApiClient = ky.create({
  prefix: env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 10000,
  credentials: 'include',
  cache: 'no-store',
  retry: {
    limit: 3,
    methods: ['get'],
    statusCodes: [408, 429, 500, 502, 503, 504],
    backoffLimit: 5000,
  },
  hooks: {
    beforeRequest: [
      ...(isProduction ? [signingHook] : []),
    ],
  },
})

export const serverAuthApiClient = serverApiClient.extend({
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        const { idToken } = await getTokens()
        request.headers.set('Authorization', `Bearer ${idToken}`)
      },
    ],
    afterResponse: [
      ({ response }) => {
        if (response.status === 401) throw new AppError('UNAUTHORIZED')
      },
    ],
  },
})
```

> **How it works in production:** the `serverApiClient` / `serverAuthApiClient` still call `env.NEXT_PUBLIC_BACKEND_URL` which now resolves to `https://<domain>/api/v1`. The SigV4 `signingHook` signs every outgoing request with the frontend Lambda's execution role, satisfying the `AWS_IAM` requirement on the backend Function URL.
>
> **Local dev:** `env.NEXT_PUBLIC_BACKEND_URL = http://localhost:4000/api/v1`; `signer` is `null`; the hook is never added. Nothing changes.

### 6c. `apps/nextjs-boilerplate/src/config/env.ts`

No schema change needed — `NEXT_PUBLIC_BACKEND_URL` already exists. In production it will resolve to `https://<domain>/api/v1` via the Lambda environment variable set in Step 3f.

### 6d. `apps/nextjs-boilerplate/next.config.ts`

Add `X-Forwarded-Host` pass-through awareness and a `serverExternalPackages` entry for the AWS SDK (prevents Next.js from bundling native modules):

```ts
const nextConfig: NextConfig = {
  // ...existing config...
  serverExternalPackages: [
    '@aws-sdk/signature-v4',
    '@aws-crypto/sha256-js',
    '@aws-sdk/credential-providers',
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // ...existing headers...
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
}
```

### 6e. `apps/nextjs-boilerplate/.env.example`

```
# Updated: in production this points to https://<domain>/api/v1 via CloudFront
NEXT_PUBLIC_BACKEND_URL="http://localhost:4000/api/v1"
```

---

## Step 7 — Backend (Elysia) code changes

### 7a. CORS origin

The backend previously allowed `https://<domain>` as the CORS origin. With CloudFront in place, the backend still only needs to allow the same domain — no change is required to the CORS logic itself.

However, because `authorization_type = "AWS_IAM"` disables the Function URL's built-in CORS enforcement, make sure the Elysia app handles `OPTIONS` preflight responses itself. Verify that your existing CORS plugin/middleware:

1. Responds `204` to `OPTIONS` requests with `Access-Control-Allow-Origin: https://<domain>`.
2. Sets `Access-Control-Allow-Credentials: true` if cookies are forwarded.
3. Sets `Access-Control-Allow-Headers` to include `Authorization`.

If you are using `@elysiajs/cors`, the existing configuration is fine as-is — confirm `origin` matches `FRONTEND_URL`.

### 7b. Trust `X-Forwarded-For` from CloudFront

CloudFront injects `X-Forwarded-For` with the real client IP. If your Elysia app uses IP-based logic (rate-limiting, logging), ensure it trusts the header when running behind a proxy. No new package is needed for Elysia — just reference `request.headers.get('x-forwarded-for')` instead of the connection's remote address.

### 7c. `apps/backend-boilerplate/.env.example`

```
FRONTEND_URL="http://localhost:3000"   # unchanged in local dev; set to https://<domain> in Lambda env vars
```

No Lambda env var changes are required in `dev/main.tf` for the backend — `FRONTEND_URL` is already `https://${var.domain_name}`.

---

## Step 8 — Static asset upload (CI/CD)

The Next.js `standalone` build puts static files in `.next/static/` and `public/`. These need to be synced to the S3 static assets bucket on every deploy so CloudFront can serve them from S3 instead of Lambda.

Add this step to your GitHub Actions workflow **after** the Docker image is pushed:

```yaml
- name: Upload static assets to S3
  run: |
    # Copy Next.js hashed static chunks
    aws s3 sync .next/static/ s3://${{ env.STATIC_ASSETS_BUCKET }}/_next/static/ \
      --cache-control "public, max-age=31536000, immutable" \
      --delete

    # Copy public/ directory
    aws s3 sync public/ s3://${{ env.STATIC_ASSETS_BUCKET }}/static/ \
      --cache-control "public, max-age=604800" \
      --delete

- name: Invalidate CloudFront cache for non-static paths
  run: |
    aws cloudfront create-invalidation \
      --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }} \
      --paths "/*"
```

Set the following secrets/variables in GitHub Actions:
- `STATIC_ASSETS_BUCKET` — value of Terraform output `static_assets_bucket_name`
- `CLOUDFRONT_DISTRIBUTION_ID` — value of Terraform output `cloudfront_distribution_id`

The GitHub OIDC role (`module.github_oidc`) needs two additional IAM permission statements — add to the `github-oidc` module policy or directly in `dev/main.tf`:

```hcl
resource "aws_iam_role_policy" "github_s3_static_assets" {
  name = "${local.name_prefix}-github-static-assets"
  role = module.github_oidc.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowStaticAssetSync"
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
        Resource = [
          module.s3_static_assets.bucket_arn,
          "${module.s3_static_assets.bucket_arn}/*",
        ]
      },
      {
        Sid      = "AllowCacheInvalidation"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = [module.cloudfront.distribution_arn]
      },
    ]
  })
}
```

---

## Step 9 — Verification checklist

After `terraform apply` completes and the CloudFront distribution is deployed (15–30 min):

| Check | Command / URL |
|---|---|
| CloudFront reachable | `curl -I https://<cloudfront-domain>/` → `200 OK` from Next.js |
| Static assets from S3 | `curl -I https://<cloudfront-domain>/_next/static/<hash>/*.js` → `x-cache: Hit from cloudfront` |
| API via CloudFront | `curl https://<cloudfront-domain>/api/v1/health` → `200 OK` from Elysia |
| Direct Lambda URL blocked | `curl https://<fn-url>.lambda-url.ap-northeast-1.on.aws/` → `403 Forbidden` (Tokyo region) |
| HTTPS works | `curl -I https://<cloudfront-domain>/` → `200 OK` with TLS |
| Cognito redirect works | Sign-in flow at `/api/auth/callback` completes successfully |

---

## Summary of Files Changed

```
infra/terraform/
  modules/
    lambda/
      main.tf                  ← authorization_type = "AWS_IAM"
      outputs.tf               ← + lambda_role_arn
      variables.tf             ← + function_url_auth_type (optional)
    cloudfront/                ← NEW MODULE
      main.tf
      outputs.tf
      variables.tf
  environments/dev/
    main.tf                    ← + s3_static_assets, cloudfront, IAM perms, Route 53
    variables.tf               ← + acm_certificate_arn, waf_web_acl_id
    locals.tf                  ← + s3_static_assets_bucket_name
    outputs.tf                 ← + cloudfront_*, static_assets_bucket_name
    terraform.tfvars           ← + acm_certificate_arn, waf_web_acl_id

apps/nextjs-boilerplate/
  src/lib/apiClient.ts         ← + SigV4 signing hook (production-only)
  next.config.ts               ← + serverExternalPackages
  .env.example                 ← clarify NEXT_PUBLIC_BACKEND_URL

apps/backend-boilerplate/
  (no code changes required)
```
