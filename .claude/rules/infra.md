# Infrastructure (Terraform)

Repo-specific Terraform conventions and the local quality gates. The **`terraform-skill`** plugin (antonbabenko) provides generic Terraform/OpenTofu best practice — module design, testing, state ops, debugging. On repo-specific matters (layout, environments, pipeline), **this file wins**; on generic HCL style and patterns, follow the skill. Read `docs/architecture.md` before changing deployment topology.

For provider/module facts (resource arguments, module inputs, latest versions), query the **`terraform` MCP server** (`hashicorp/terraform-mcp-server` via Docker, registered in `.mcp.json`) instead of relying on memory — it reads the Terraform Registry directly.

## Layout

- `infra/terraform/` — the single root module. `main.tf` wires the reusable modules (CloudFront, Cognito, Lambda, S3, ECR, CodeDeploy, WAF, Route53/ACM, GitHub OIDC, Secrets Manager).
- `infra/terraform/modules/<name>/` — reusable modules, each with `main.tf` + `variables.tf` + `outputs.tf` + `versions.tf`. New shared infra goes in a module, not inline in the root.
- **Environments are config, not directories.** One root module, switched by `-backend-config=backends/<env>.hcl` + `-var-file=vars/<env>.tfvars`. Never create per-environment directory trees.
- `infra/terraform/bootstrap/` — separate root module that creates the state bucket. It has its own state; don't entangle it with the main root.

## State

- S3 backend (`backends/dev.hcl` / `backends/prod.hcl`), `encrypt = true`, **S3-native locking via `use_lockfile`** — there is no DynamoDB lock table; don't add one.
- Never run `terraform state` mutations, `import`, or `apply` locally against dev/prod without the user explicitly asking. Plans are fine; state changes go through CI.

## Conventions

- Pin versions: providers in each module's `versions.tf`, Terraform version matches CI (`~> 1.14`).
- Every `variable` has `type` and `description`; add `validation` blocks where a bad value would only surface at apply time.
- No secret values in `vars/*.tfvars` (they're committed). Secrets live in AWS Secrets Manager and are referenced by ARN/name; the apps load them at runtime.
- Stateful or hard-to-recreate resources (Cognito user pool, S3 buckets with data, Route53 zone) deserve `lifecycle { prevent_destroy = true }` or an explicit comment on why not.
- Trivy findings are suppressed only in `infra/terraform/.trivyignore`, one ID per line **with a justification comment** (see AVD-AWS-0132 there for the pattern).
- tflint config is `infra/terraform/.tflint.hcl` (terraform preset `recommended` + AWS ruleset). Fix findings rather than inline-disabling them; if a rule is genuinely wrong for this repo, disable it in `.tflint.hcl` with a comment.

## Local gates (mirror of CI)

Run these when a change touches `infra/terraform/**` — they are the same checks `terraform-plan.yml` runs on the PR, minus the plan itself:

```bash
terraform -chdir=infra/terraform fmt -check -recursive
tflint --chdir=infra/terraform --init          # first run / after ruleset changes
tflint --chdir=infra/terraform --recursive --format compact --minimum-failure-severity=error
terraform -chdir=infra/terraform validate      # needs init; use `terraform -chdir=infra/terraform init -backend=false` if .terraform/ is missing
trivy config infra/terraform --ignorefile infra/terraform/.trivyignore --severity CRITICAL,HIGH   # only if trivy is installed; CI enforces it either way (security.yml)
```

`terraform fmt` (writing mode) also runs automatically on staged HCL via the Lefthook pre-commit hook.

## Pipeline (what a merge actually does)

- **PR touching `infra/terraform/**`** → `terraform-plan.yml`: fmt-check → tflint → validate → `plan` against **dev**, posted as a PR comment. Read that plan output in the PR before approving — it is the review artifact.
- **Merge to `main`** → `terraform-apply.yml` applies **dev**.
- **`v*` tag** → applies **prod**, gated by the `prod` GitHub environment (required reviewer).
- Auth is GitHub OIDC role assumption (`TF_PLAN_ROLE_ARN` / `TF_APPLY_ROLE_ARN`) — no static AWS keys; don't introduce any.
