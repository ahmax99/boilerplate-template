# Spec: Fix Broken Write Operations on Deployed App (CloudFront OAC + Lambda Function URL)

> Status: Draft · 2026-07-02

## Problem / Context

Manual exploration of the deployed dev environment (`https://dev.boilerplate-template.ahmax99.online/`) with a real signed-in Google account shows that **every read (GET) path works, but every write (POST/PUT/PATCH) path fails** with an AWS `InvalidSignatureException` returned by CloudFront:

> "The request signature we calculated does not match the signature you provided."
> `x-amzn-errortype: InvalidSignatureException` · `x-cache: Error from cloudfront`

The frontend BFF and the backend are both **Lambda Function URLs** (`AWS_IAM` auth) fronted by **CloudFront Origin Access Control** (`aws_cloudfront_origin_access_control`, `signing_behavior = "always"`, `signing_protocol = "sigv4"`; see `infra/terraform/modules/cloudfront/main.tf`). CloudFront OAC **does not include the request body when it computes the SigV4 signature**. Requests with no body (GET/HEAD) validate fine; any request carrying a body fails IAM auth at the Function URL. The result: the app is effectively read-only in the deployed environment — comments, contact, profile edits, and post creation are all broken.

This is an **infrastructure** defect (CloudFront ↔ Lambda Function URL signing), not application code. The Next.js/Elysia code paths are exercised correctly up to the CloudFront→origin hop.

## Goals

- Authenticated and unauthenticated **write requests** through CloudFront reach their Lambda Function URL origin with a valid SigV4 signature and are processed (no `InvalidSignatureException`).
- All observed broken features work end-to-end in the deployed dev environment: post a comment, submit the contact form, update profile, create a post (and image upload).
- Existing read paths and the login flow continue to work unchanged.
- Failed writes that are genuinely rejected (e.g., a real 401/403 for an unauthenticated action) surface a helpful message, not a generic crash dialog.

## Non-Goals

- No changes to application business logic, Zod schemas, CASL rules, or the neverthrow/`AppError` flow — the app code behaves correctly; the fault is in the CloudFront→origin signing.
- Not redesigning the deployment topology (CloudFront → Next BFF Lambda + backend Lambda + S3 + Cognito stays as-is).
- Not adding an automated test runner (out of scope for this fix).

## Requirements

### Functional

Verified broken in the deployed dev environment (all return `403 InvalidSignatureException` at CloudFront):

- **Comment posting** — `POST /api/comments` (route handler → backend). Fails signed-out *and* signed-in.
- **Contact form** — `POST /contact` (Next.js server action → email). Fails.
- **Profile update** — `PUT /api/account` (route handler → backend). Fails (signed in).
- **Create post** — `POST /api/posts` (route handler → backend). Fails (signed in).
- **Image upload** (create post / edit profile) — presigned-URL/proxy write path; not exercised directly but rides the same broken POST path and must be re-verified after the fix.

After the fix, each of the above must complete successfully against the deployed environment.

Confirmed working (must not regress):

- Home `/`, Blog `/posts`, post detail `/posts/[id]`, contact page render, account page (GET, shows profile), edit page render.
- Login: `Sign In` → Cognito Hosted UI (PKCE) → Google → `/api/auth/callback` → session cookie set; nav switches to `Create` / `Go to Account` / `Sign Out`. **Sign Out** works.

### Constraints

- Fix lives in `infra/terraform` (CloudFront and/or Lambda Function URL modules). No app-code workaround that undermines the IAM-auth boundary (e.g., do not switch Function URLs to `NONE` auth to sidestep signing).
- The signing method chosen must sign the **request body** for POST/PUT/PATCH so the Function URL's `AWS_IAM` authorizer validates it.
- Keep the BFF boundary intact: browser → CloudFront → Next BFF Lambda → backend. Do not expose the backend Function URL publicly.
- Preserve the header handling already in place (`lambda_all` origin request policy excludes `Host` and `Authorization`; see `cloudfront/main.tf`).

## Affected Areas

- [x] `infra/terraform` — `modules/cloudfront` (OAC vs. Lambda@Edge origin-request SigV4 signing), possibly `modules/lambda` / `modules/lambda-edge`.
- [ ] `apps/backend-boilerplate` — no change expected.
- [x] `apps/nextjs-boilerplate` — minor: replace the generic "Something went wrong" crash dialog for failed writes with a user-friendly error/toast; add a `favicon.ico` (currently 404s).
- [ ] `shared/config` — no change.
- [ ] `shared/neon` — no change.

## Acceptance Criteria

- [ ] `POST /api/comments` from the deployed site (signed in) returns 2xx and the comment appears; the comment count increments.
- [ ] `POST /contact` (contact form) returns success and the confirmation/notification emails are sent (or a success toast is shown).
- [ ] `PUT /api/account` (profile name change) returns 2xx and the updated name persists on the account page after reload.
- [ ] `POST /api/posts` (create post) returns 2xx and the new post appears in `/posts`.
- [ ] Image upload during create-post / edit-profile completes and the image renders.
- [ ] No response in any of the above carries `x-amzn-errortype: InvalidSignatureException`.
- [ ] Read paths (`/`, `/posts`, `/posts/[id]`, `/contact`, `/account`) and the full Google login + sign-out flow still work.
- [ ] An unauthenticated write that is legitimately denied returns a real 401/403 from the app (not a CloudFront signature error) and the UI shows a friendly "please sign in"-style message rather than the generic crash dialog.
- [ ] `GET /favicon.ico` no longer 404s.

## Chosen Remediation — Strategy A: Lambda@Edge origin-request SigV4 signer

**Verified root cause (AWS CloudFront Developer Guide, "Restricting access to Lambda function URLs"):**
> "If you use `PUT` or `POST` methods with your Lambda function URL, your users must compute the SHA256 of the body and include the payload hash value of the request body in the `x-amz-content-sha256` header when sending the request to CloudFront. **Lambda doesn't support unsigned payloads.**"

Native CloudFront OAC therefore cannot sign anonymous browser POST/PUT traffic: the viewer would have to send `x-amz-content-sha256` = SHA256(body), which browsers, Next.js server actions, and RSC POSTs do not do. Hence `InvalidSignatureException` on every body-bearing request; GET/HEAD (no body) pass.

**Fix:** on the **frontend-lambda** origin (CloudFront default behavior — the only origin browsers hit, via ky `prefix: '/api/'`):
1. Remove the frontend OAC (`aws_cloudfront_origin_access_control.frontend`) from that origin; keep it as a plain `custom_origin_config` origin.
2. Add an **origin-request** Lambda@Edge (`include_body = true`) that reads the body, computes `x-amz-content-sha256`, and builds a full SigV4 `Authorization` header targeting the Function URL host, then forwards to the origin.
3. Grant that function's execution role `lambda:InvokeFunctionUrl` on the frontend Lambda's ARN.
4. Keep the existing viewer-request `restrict-host` Lambda@Edge; the new function is a distinct `origin-request` trigger on the same behavior.

**Why A over B (frontend URL `NONE` + secret header):** keeps the frontend Function URL IAM-locked (no publicly-invocable Lambda surface, no shared secret to manage/rotate) — the stronger posture. Its usual downside (standing up Lambda@Edge) is largely pre-paid: the repo already deploys a Lambda@Edge via the `aws.us_east_1` provider alias (`module "lambda_edge"`), so the region provider, IAM-role/`templatefile`/`archive_file` packaging, and CloudFront association wiring already exist and are reused.

**Scope note:** the **backend** Function URL is unchanged — it is called server-side by `serverAuthApiClient` (SigV4-signed inside the Next Lambda, directly, not via CloudFront). Browsers never hit `/api/v1/*`. Whether to also convert the backend's `/api/v1/*` OAC path is optional and only matters for direct/Swagger POST access; decide in `/plan`.

## Open Questions / Risks

- **us-east-1 requirement (confirmed):** Lambda@Edge functions must be authored/updated in `us-east-1`; CloudFront replicates the published version to edge locations. Already handled by the existing `aws.us_east_1` provider — reuse it.
- **Possible simplification to test in `/plan`:** rather than full SigV4 in the edge function, have the origin-request function set only `x-amz-content-sha256` = SHA256(body) and *keep* OAC to do the signing. This is unverified (unclear whether OAC incorporates an edge-added hash); the reliable baseline is OAC-off + full SigV4 in the edge function.
- **Body-size limit:** Lambda@Edge origin-request exposes/replaces at most **1 MB** of body. All body-bearing CloudFront→Lambda requests here are small JSON (comments/posts/account/contact); binary image uploads go **direct to S3 via presigned PUT** (`GET .../presigned-url` then `PUT` to S3), so they never traverse the edge signer. Confirm no route sends a >1 MB body through CloudFront.
- **Edge cost/latency:** the signer runs on every default-behavior request (incl. page loads), adding ms-level latency and edge cold starts; changes incur ~minutes of replication lag on deploy. Accepted trade-off for the stronger auth posture.
- Verify the OPTIONS/CORS preflight path for the route handlers still behaves after the change.
- Must be validated in the deployed dev environment, not just locally (the fault only manifests through CloudFront).

## Appendix: Evidence

- `POST /contact` → 403, body: *"The request signature we calculated does not match the signature you provided…"*, headers include `x-amzn-errortype: InvalidSignatureException`, `via: … .cloudfront.net`, `x-cache: Error from cloudfront`.
- `POST /api/comments` → 403 (same body) — both signed-out and signed-in.
- `PUT /api/account` → 403 (same body), signed in.
- `POST /api/posts` → 403 (same body), signed in.
- All read GETs (page loads, `?_rsc=` RSC fetches) → 200.
- Infra: `infra/terraform/modules/cloudfront/main.tf` — `aws_cloudfront_origin_access_control.{backend,frontend}` (lambda, sigv4, always); `locals.tf` — origins are the backend/frontend **Function URLs**.
