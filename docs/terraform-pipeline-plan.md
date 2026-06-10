# Plan: Terraform IaC Pipeline (GitHub Actions)

> Status: **Plan / not yet implemented.** No infra or workflow files have been changed.

## Goal

Replace manual `terraform apply` with a GitHub Actions pipeline: **plan automatically on
PRs, apply manually via `workflow_dispatch`**, authenticated via OIDC, with Terraform
variables sourced from GitHub Secrets/Variables (no `terraform.tfvars` in CI).

## Decisions locked in

| Decision | Choice |
|----------|--------|
| Apply trigger | **Manual** (`workflow_dispatch`) — plan still auto-runs on PRs |
| TF variables in CI | **GitHub Secrets + Variables** mapped to `TF_VAR_*` |
| AWS auth | **Two new OIDC roles** added to the `github-oidc` module (plan = read-only, apply = read-write) |
| Lambda `image_uri` | **Leave as `:latest`** — `deploy.yml` pushes both `:<git-sha>` and `:latest`, so `:latest` always resolves to the current image. No `ignore_changes` needed. |
| First-time setup | **Pipeline replaces `initial-deploy.sh`** — the staged "create ECR → push images → full apply → publish versions" flow moves into the `terraform-apply` workflow, which is **idempotent** (bootstrap path on a fresh env, normal apply thereafter). |
| ECR egg | **Staged apply inside the pipeline** (targeted ECR apply → docker build/push → full apply). |
| IAM egg | **One tiny manual seed**: a human creates *only* the OIDC provider + apply role once; everything else runs in the pipeline. |

---

## Hard constraints driving the design

1. **The existing OIDC role cannot run Terraform.** Its policy
   (`infra/terraform/modules/github-oidc/main.tf`, the `lambda_deployment` policy) only
   allows Lambda / CodeDeploy / ECR / S3 / CloudFront-invalidate. It has no `iam:*`,
   `cognito:*`, `s3:CreateBucket`, and no access to the Terraform state bucket.
   → **New roles are required.**

2. **Chicken-and-egg #1 (IAM):** The role that runs Terraform in CI is *created by*
   Terraform. CI cannot assume a role that does not exist yet, so on a brand-new account
   *something* outside CI must create the first OIDC role. This is an irreducible seed — but
   it can be shrunk to a single tiny step (just the OIDC provider + apply role), after which
   the pipeline manages everything (including that role's own lifecycle). See
   [Solving the chicken-and-egg problems](#solving-the-chicken-and-egg-problems).

3. **Chicken-and-egg #2 (ECR images):** The dev config's Lambdas reference ECR images
   (`:latest`) that must exist *before* `terraform apply` can create the functions. Rather
   than keep this as a manual `initial-deploy.sh` step, **the pipeline solves it in CI** with
   a staged apply (create ECR repos → build/push images → full apply). The
   `terraform-apply` workflow is **idempotent**: it runs the staged bootstrap path on a fresh
   environment and a plain apply once images already exist. **This replaces
   `infra/scripts/initial-deploy.sh`.**

4. **Bootstrap uses local state** (`infra/terraform/bootstrap/`) and creates the state
   bucket itself → **bootstrap stays manual / human-run**, out of scope for CI (runs once,
   ever). This is part of the same one-time seed as the IAM role.

---

## Pipeline architecture

```
┌─ Pull request touching infra/terraform/** ─────────────────┐
│  workflow: terraform-plan.yml                              │
│  job: plan (per environment: dev)                          │
│    OIDC → assume <proj>-terraform-plan  (READ-ONLY role)   │
│    terraform fmt -check → init → validate → plan -no-color │
│    post plan output as a PR comment (create/update)        │
│    upload plan artifact (tfplan) [optional]                │
└────────────────────────────────────────────────────────────┘

┌─ Manual: Actions tab → "Terraform Apply" → Run workflow ───┐
│  workflow: terraform-apply.yml  (workflow_dispatch)        │
│  inputs: environment (dev), confirm                        │
│  environment: terraform-apply  (GitHub Environment gate)   │
│  job: apply                                                │
│    OIDC → assume <proj>-terraform-apply (READ-WRITE role)  │
│    terraform init → plan → apply -auto-approve             │
│  concurrency: terraform-<env> (no parallel state writes)   │
└────────────────────────────────────────────────────────────┘
```

The `terraform-apply` job above is **idempotent** — its internal flow branches on whether the
environment has been bootstrapped yet (see Problem #2 below). The first dispatch on a fresh
environment runs the full staged bootstrap; every dispatch after runs a plain apply.

---

## Solving the chicken-and-egg problems

Goal: move **all** first-time setup into the pipeline so it replaces
`infra/scripts/initial-deploy.sh`, leaving only the single irreducible manual seed that OIDC
physically requires.

### The irreducible seed (one-time, human, ~5 min)

Two things genuinely cannot be created by an OIDC-authenticated pipeline, because the
pipeline needs them to authenticate / store state in the first place:

```
ONE-TIME SEED  (human, admin AWS creds — CLI or console, NOT in CI)
┌──────────────────────────────────────────────────────────────────┐
│ S1. State backend (already exists for dev):                       │
│       cd infra/terraform/bootstrap && terraform apply             │
│       └─► S3 state bucket  (local state; runs once per account)   │
│                                                                    │
│ S2. Minimal IAM seed — ONLY the OIDC provider + apply role:       │
│       a tiny `bootstrap-iam` target (or `-target=` on github-oidc)│
│       applied locally with admin creds                            │
│       └─► aws_iam_openid_connect_provider.github                  │
│       └─► aws_iam_role.terraform_apply   (READ-WRITE)             │
│                                                                    │
│ S3. Put the apply-role ARN into GitHub → vars.TF_APPLY_ROLE_ARN   │
└──────────────────────────────────────────────────────────────────┘
```

Everything else — the read-only plan role, the full infrastructure, the ECR repos, the
container images, the Lambda versions/aliases — is created **by the pipeline** on its first
run. After S2, the apply role can manage its own definition (it has `iam:*` over its
resources), so the seed is never needed again unless the role is destroyed.

> **Why not zero manual steps?** The only way to fully remove S2 is to store a long-lived
> admin IAM user's access keys in GitHub Secrets and have the pipeline bootstrap with those —
> which reintroduces exactly the long-lived credential OIDC exists to eliminate. We chose the
> tiny manual seed instead. (Documented as the rejected alternative below.)

### Problem #1 — IAM / OIDC handoff

```
SEED (human) ─── creates OIDC provider + terraform_apply role ───┐
                                                                  ▼
STEADY STATE (CI, OIDC, no human creds)
┌──────────────────────────────────────────────────────────────────┐
│ PR      → terraform-plan.yml  → OIDC assume terraform_plan  (RO)  │
│           (plan role is itself created by the first CI apply)     │
│ dispatch→ terraform-apply.yml → OIDC assume terraform_apply (RW)  │
│           └─► apply creates the plan role + all remaining infra   │
│           └─► apply can modify the very role that authenticated   │
│               it (self-managed) — no more local admin needed      │
└──────────────────────────────────────────────────────────────────┘
```

> **Break-glass:** if `terraform_apply`'s trust policy is ever broken or the role deleted, CI
> can no longer fix itself. Recovery = re-run S2 locally with admin creds. Keep an admin path
> (AWS SSO / admin user) available for this case only.

### Problem #2 — ECR images, solved inside the pipeline (replaces `initial-deploy.sh`)

`aws_lambda_function` with `package_type = "Image"` validates that `image_uri` exists at
apply time, so a fresh environment can't be created in a single apply. The `terraform-apply`
workflow detects this and runs the staged path — the same ordering `initial-deploy.sh` used,
now in CI:

```
terraform-apply.yml  (workflow_dispatch)
OIDC assume terraform_apply (RW)
        │
        ▼
┌──────────────────────────────────────────────────────────────────┐
│ DETECT: do both ECR repos contain a :latest image?                │
│   (aws ecr describe-images, or `terraform state` probe)           │
└──────────────────────────────────────────────────────────────────┘
        │                                          │
   NO  ▼  (fresh env → bootstrap path)        YES ▼  (steady state)
┌─────────────────────────────────────┐   ┌──────────────────────────┐
│ 1. terraform init                   │   │ terraform init           │
│ 2. terraform apply \                │   │ terraform plan           │
│      -target=module.ecr_backend \   │   │ terraform apply          │
│      -target=module.ecr_frontend    │   │   (Lambdas resolve       │
│    └─► ECR repos exist (empty)      │   │   :latest, already real) │
│ 3. docker build+push backend :latest│   └──────────────────────────┘
│ 4. docker build+push frontend:latest│
│    └─► :latest images now in ECR    │
│ 5. terraform apply   (full config)  │
│    └─► Lambdas created, image ✓    │
│ 6. publish Lambda versions +        │
│    point dev aliases at them        │
└─────────────────────────────────────┘
        │                                          │
        └──────────────────┬───────────────────────┘
                           ▼
              outputs surfaced to job summary
              (ECR URLs, function names, CF id, bucket)
              → copy into GitHub vars.* for deploy.yml
```

Implementation notes for the bootstrap path:
- It needs Docker + Bun on the runner and ECR push permission (already in the apply role's
  scope), plus the same build-args `initial-deploy.sh` uses
  (`DATABASE_URL=...placeholder...` for backend; `NEXT_PUBLIC_*` for frontend).
- Steps 3–4 are the existing logic from `initial-deploy.sh` — extract into a reusable
  `.github/scripts/*.sh` so the workflow stays thin (matches the repo's action/script
  convention).
- Step 6 mirrors `initial-deploy.sh`'s `publish-version` + `update-alias`. After this first
  run, `deploy.yml` owns ongoing version/alias updates.
- Guard the whole bootstrap branch behind the `terraform-apply` Environment gate, same as a
  normal apply.

### Alternative considered (not chosen)

- **Placeholder image (single apply):** seed a public base image as `:latest` so one
  `terraform apply` creates everything, then let `deploy.yml` ship real code. Rejected — the
  environment isn't functional until a second pipeline (deploy.yml) runs, whereas the staged
  path produces a working environment in one dispatch.
- **Long-lived admin keys in GitHub Secrets:** removes the S2 manual seed entirely but
  reintroduces long-lived credentials. Rejected for the security regression.

---

## Work breakdown

### A. Terraform: extend the `github-oidc` module (IAM as code)

Add to `infra/terraform/modules/github-oidc/main.tf`:

- **`aws_iam_role.terraform_plan`** — trust: `sub` like
  `repo:<org>/<repo>:pull_request`. Policy: AWS-managed `ReadOnlyAccess` **+** read access
  to the state bucket (`s3:GetObject`, `s3:ListBucket` on
  `boilerplate-template-terraform-state`).
- **`aws_iam_role.terraform_apply`** — trust: `sub` like
  `repo:<org>/<repo>:environment:terraform-apply` (ties the role to the GitHub Environment —
  best practice). Policy: broad infra-management permissions to manage everything the dev
  env creates (IAM, Lambda, ECR, CloudFront, Cognito, S3, ACM, Route53, WAF, CodeDeploy,
  Secrets Manager) **+** read/write to the state bucket + lock objects.
  - *Scoping note:* true least-privilege for a full infra role is impractical (it manages
    IAM itself). Scope by resource-name prefix / tag where reasonable and document that this
    is intentionally high-privilege, gated behind the manual + Environment approval.
- Reuse the **existing OIDC provider** (`aws_iam_openid_connect_provider.github`) — do not
  create a second one. The provider + `terraform_apply` role must be reachable via `-target`
  so the one-time seed (step S2) can create just them; the `terraform_plan` role is then
  created by the first CI apply.
- New module variables: `state_bucket_arn`, inputs/toggles for the new roles. New outputs:
  `terraform_plan_role_arn`, `terraform_apply_role_arn`.
- Wire in `infra/terraform/environments/dev/main.tf` (the `github_oidc` module block, ~line
  510) and add `outputs.tf` entries.

### B. New script (optional): `.github/scripts/terraform-plan-comment.sh`

Formats `terraform plan` output and writes the PR comment body. Keeps workflow YAML thin,
consistent with the repo's `deploy-lambda.sh` / `detect-affected.sh` convention. Preferred
over a third-party action to match house style and avoid a new dependency.

### C. New workflow: `.github/workflows/terraform-plan.yml`

- Trigger: `pull_request` with `paths: ['infra/terraform/**']`.
- Permissions: `id-token: write`, `contents: read`, `pull-requests: write` (for the comment).
- Steps: checkout → `hashicorp/setup-terraform` → configure-aws-credentials (**plan** role)
  → `fmt -check` → `init` → `validate` → `plan` → post/update PR comment.
- `TF_VAR_*` env mapped from `secrets` / `vars` (safe in PR context: read-only role means a
  leaked plan can't mutate anything).
- Matrix-ready over environments (just `dev` today; structured so `stg` / `prod` slot in).

### D. New workflow: `.github/workflows/terraform-apply.yml` (idempotent — replaces `initial-deploy.sh`)

- Trigger: `workflow_dispatch` with inputs `environment` (choice, default `dev`) and a
  `confirm` input.
- `environment: terraform-apply` → attach **required reviewers** in GitHub settings for a
  manual approval gate on top of the manual trigger.
- `concurrency: terraform-${{ inputs.environment }}` + `cancel-in-progress: false` (never
  cancel an in-flight apply).
- Needs Docker Buildx + Bun on the runner (for the bootstrap path's image build).
- Steps: checkout → setup-terraform → setup-bun → configure-aws-credentials (**apply** role)
  → ECR login → `init` → **detect whether ECR images exist**:
  - **fresh env (no images):** staged bootstrap — `apply -target=ecr_*` → docker build+push
    backend & frontend `:latest` → full `apply` → publish Lambda versions + align aliases
    (the `initial-deploy.sh` logic, extracted to scripts).
  - **steady state (images exist):** `plan` → `apply -auto-approve`.
  - → surface outputs to the job summary.
- `TF_VAR_*` from Environment Secrets / Variables.
- See [Solving the chicken-and-egg problems](#solving-the-chicken-and-egg-problems) for the
  full branch diagram.

### E. Migrate / remove `initial-deploy.sh`

- Extract the reusable parts (docker build/push, publish-version + update-alias) into
  `.github/scripts/` so both the bootstrap branch and any future env reuse them.
- Once the pipeline bootstrap path is verified end-to-end on a fresh environment, **delete
  `infra/scripts/initial-deploy.sh`** (or leave a thin stub pointing at the workflow).

### F. Documentation updates

- Update `infra/terraform/bootstrap/README.md` and
  `infra/terraform/environments/dev/README.md`: replace the "run `initial-deploy.sh`"
  instructions with the new flow — the **one-time seed** (state bucket + OIDC provider +
  apply role), then "dispatch the `terraform-apply` workflow" for everything else.
- Provide a checklist of GitHub config to set (below).

---

## GitHub configuration to set (out-of-band)

**Environment Secrets** (`terraform-apply` environment) — the 7 sensitive vars:
`TF_VAR_database_url`, `TF_VAR_google_client_id`, `TF_VAR_google_client_secret`,
`TF_VAR_resend_api_key`, `TF_VAR_session_secret`, `TF_VAR_sentry_dsn` — plus the new role
ARNs.

**Variables** (non-sensitive): `TF_VAR_project_name`, `TF_VAR_environment`,
`TF_VAR_domain_name`, `TF_VAR_github_org`, `TF_VAR_aws_region`, `TF_VAR_contact_to_email`,
`TF_VAR_from_email`, and the new role ARNs (`TF_PLAN_ROLE_ARN`, `TF_APPLY_ROLE_ARN`).

---

## Explicit non-goals / boundaries

- **Replaces `initial-deploy.sh`** — first-time ECR + image + infra bootstrap moves into the
  `terraform-apply` workflow (idempotent bootstrap path). The script is removed once verified.
- **Does NOT fully eliminate the manual seed** — the state bucket + OIDC provider + apply role
  are created once by a human with admin creds (the irreducible OIDC seed). Everything after
  that is pipeline-driven.
- **Does not touch the app-deploy pipeline** (`.github/workflows/deploy.yml`) — Terraform
  manages infra (and first-time image bootstrap), `deploy.yml` ships ongoing code. Clean
  separation preserved.
- **Apply never runs on push / merge** — only manual dispatch.

---

## Image-tag drift (resolved — no action needed)

A `terraform apply` reasserts `image_uri = "${ecr}:latest"`. Because `deploy.yml` pushes
**both** `:<git-sha>` and `:latest` on every deploy, `:latest` always points at the most
recent image, so the reassertion resolves to the current image — no rollback, no real drift.
`lifecycle { ignore_changes = [image_uri] }` is therefore **not** added.

> Nuance to note in the README: Lambda resolves an image tag to a digest at update time, so
> Terraform's `:latest` is pinned to whatever digest existed when Terraform last ran. An
> infra-only apply won't re-pull a newer `:latest` unless the `image_uri` string changes —
> but `deploy.yml` is what actually ships new code (via `update-function-code` to the `:sha`
> image + alias), so Terraform's view only matters at create / replace time.

---

## Suggested implementation order

1. Extend `github-oidc` module (plan + apply roles) + wire into dev (Terraform code only —
   no apply yet). Make the role creation `-target`-able for the seed.
2. **Human seed (one-time, admin creds):** apply `bootstrap/` (state bucket), then
   `terraform apply -target=…github_oidc…provider -target=…terraform_apply` to create just
   the OIDC provider + apply role. Put `vars.TF_APPLY_ROLE_ARN` into GitHub.
3. Extract `initial-deploy.sh` logic (docker build/push, publish-version/update-alias) into
   `.github/scripts/`; add the idempotent `terraform-apply.yml` (bootstrap + steady-state
   branches) and the `terraform-plan.yml` + comment script.
4. Set GitHub Secrets / Variables + create the `terraform-apply` Environment (add reviewers
   if wanted).
5. **First pipeline run:** dispatch `terraform-apply` on a fresh env → bootstrap path creates
   the plan role, ECR repos, images, full infra, versions/aliases. Copy outputs into
   GitHub `vars.*` for `deploy.yml`.
6. Verify steady state: open a PR touching `infra/` → confirm plan comment; dispatch apply
   again → confirm it takes the plain-apply branch.
7. Once verified end-to-end, **remove `infra/scripts/initial-deploy.sh`**.
8. Update READMEs (section F).
