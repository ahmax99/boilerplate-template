# Lambda Function URL IAM Auth — Implementation Plan

## Why This Fits the Architecture

The Case 1 architecture doc already specifies this pattern:

```
CloudFront → Signed Request (SigV4) → Lambda URL
Lambda → Verify IAM signature → Allow / Deny (403)
"Direct Lambda URL access blocked — Only CloudFront can invoke"
```

The current Terraform has `authorization_type = "NONE"` on both Lambda Function URLs — this plan closes that gap. It also secures the image proxy endpoint: only the Next.js Lambda (server-to-server) and CloudFront can call `GET /api/v1/images/*` on the backend.

---

## Two Callers of the Backend Lambda

| Caller | Path | How it authenticates |
|--------|------|----------------------|
| **Browser → CloudFront** | `/api/*` | CloudFront OAC signs with SigV4 |
| **Next.js Lambda (SSR/BFF)** | Direct server-to-server | Frontend Lambda IAM role signs with SigV4 |

Both must be granted `lambda:InvokeFunctionUrl` on the backend.

---

## Changes Required

### 1. `infra/terraform/modules/lambda/main.tf`

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

> **Note:** With `authorization_type = "AWS_IAM"`, CORS headers on the Function URL are no longer enforced by AWS (CORS is handled by the app itself). CloudFront becomes the CORS boundary.

---

### 2. `infra/terraform/environments/dev/main.tf` — Frontend Lambda → Backend permission

Grant the frontend Lambda's execution role permission to invoke the backend Function URL:

```hcl
resource "aws_lambda_permission" "frontend_invoke_backend" {
  statement_id           = "AllowFrontendInvokeBackend"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = module.backend.function_name
  principal              = module.frontend.lambda_role_arn
  function_url_auth_type = "AWS_IAM"
}
```

Add `lambda_role_arn` as an output in `infra/terraform/modules/lambda/outputs.tf`:

```hcl
output "lambda_role_arn" {
  value = aws_iam_role.lambda.arn
}
```

---

### 3. `infra/terraform/environments/dev/main.tf` — CloudFront OAC → Backend permission

Create a CloudFront Origin Access Control for Lambda and grant it invoke permission:

```hcl
resource "aws_cloudfront_origin_access_control" "backend" {
  name                              = "${var.project_name}-${var.environment}-backend-oac"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_lambda_permission" "cloudfront_invoke_backend" {
  statement_id           = "AllowCloudFrontInvokeBackend"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = module.backend.function_name
  principal              = "cloudfront.amazonaws.com"
  source_arn             = aws_cloudfront_distribution.this.arn
  function_url_auth_type = "AWS_IAM"
}
```

Attach the OAC to the backend origin in the CloudFront distribution:

```hcl
origin {
  domain_id                = # backend function url host
  origin_access_control_id = aws_cloudfront_origin_access_control.backend.id
}
```

---

### 4. `apps/nextjs-boilerplate/src/lib/apiClient.ts` — Sign server-to-server requests

The `serverApiClient` and `serverAuthApiClient` call the backend Lambda directly from the Next.js Lambda. With `authorization_type = "AWS_IAM"`, these calls must be SigV4-signed.

Use `@aws-sdk/signature-v4` + `@aws-crypto/sha256-js`:

```ts
import { SignatureV4 } from '@aws-sdk/signature-v4'
import { Sha256 } from '@aws-crypto/sha256-js'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'

const signer = new SignatureV4({
  credentials: fromNodeProviderChain(), // picks up Lambda execution role automatically
  region: process.env.AWS_REGION ?? 'ap-northeast-1',
  service: 'lambda',
  sha256: Sha256
})

export const serverApiClient = ky.create({
  prefixUrl: env.NEXT_PUBLIC_BACKEND_URL,
  // ...existing config...
  hooks: {
    beforeRequest: [
      async (request) => {
        const url = new URL(request.url)
        const signed = await signer.sign({
          method: request.method,
          headers: Object.fromEntries(request.headers),
          hostname: url.hostname,
          path: url.pathname + url.search,
          body: request.body ?? undefined,
          protocol: url.protocol
        })
        Object.entries(signed.headers).forEach(([k, v]) =>
          request.headers.set(k, v as string)
        )
      }
    ]
  }
})
```

The Lambda execution role credentials are available automatically via the Lambda runtime environment — no access keys needed.

---

## Result

| Request | Before | After |
|---------|--------|-------|
| Browser → Backend Lambda URL directly | ✅ Allowed | ❌ 403 Forbidden |
| Browser → CloudFront → Backend | ✅ Allowed | ✅ Allowed (OAC signs) |
| Next.js Lambda → Backend Lambda URL | ✅ Allowed | ✅ Allowed (IAM role signs) |
| `GET /api/v1/images/*` from curl | ✅ Allowed | ❌ 403 Forbidden |

---

## Local Development

SigV4 signing only applies in production (Lambda environment). In local dev, `serverApiClient` calls `http://localhost:4000` directly — no signing needed. Guard the signing hook:

```ts
const isProduction = process.env.NODE_ENV === 'production'

hooks: {
  beforeRequest: [
    ...(isProduction ? [signingHook] : [])
  ]
}
```
