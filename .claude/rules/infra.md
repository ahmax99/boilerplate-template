# Infrastructure (Terraform)

Repo-specific Terraform conventions and the local quality gates. The **`terraform-skill`** plugin (antonbabenko) provides generic Terraform/OpenTofu best practice — module design, testing, state ops, debugging. On repo-specific matters (layout, environments, pipeline), **this file wins**; on generic HCL style and patterns, follow the skill. Read `docs/architecture.md` before changing deployment topology.

For provider/module facts (resource arguments, module inputs, latest versions), query the **`terraform` MCP server** (`hashicorp/terraform-mcp-server` via Docker, registered in `.mcp.json`) instead of relying on memory — it reads the Terraform Registry directly.

## Layout

- `infra/terraform/` — the single root module. `main.tf` wires the reusable modules (CloudFront, Cognito, Lambda, S3, CodeDeploy, WAF, Route53/ACM, Secrets Manager). Account-level plumbing — GitHub OIDC providers/roles, the central ECR registry, DNS zones and delegation — is owned by the separate org repo (`ahmax99-aws-org`), not this one; don't reintroduce those resources here.
- `infra/terraform/modules/<name>/` — reusable modules. `main.tf` + `variables.tf` + `outputs.tf` + `versions.tf` are the standard four; add `locals.tf`, `data.tf`, or `providers.tf` only when a module actually needs one — and when it does, that block type gets its own dedicated file, never inlined in `main.tf`. Every module in this repo already follows this: `locals` blocks live in `locals.tf` (`modules/cloudfront`, `modules/lambda-edge`, `modules/monitoring`), `data` sources live in `data.tf` (`modules/lambda-edge`) — none inline either in any module's `main.tf`. This mirrors the root module's own `locals.tf`; `main.tf` stays reserved for `resource`/`module` blocks. A per-module `README.md` is **not** a repo convention — no module has one today, and this isn't the place to invent that mandate.
- **Environments are config, not directories.** One root module, switched by `-backend-config=backends/<env>.hcl`. Never create per-environment directory trees.
- **Per-environment values: `vars/*.tfvars` vs `locals.env_config`.** These are two different mechanisms for two different kinds of value, and CI only wires up the first:
  - `variable` + `vars/<env>.tfvars` (local-only) / `TF_VAR_*` (CI, via `terraform-env` — see below) is for values that are **externally supplied per environment**: secrets, external resource identifiers (Neon DB URL, Google OAuth client, Resend key, Sentry DSN), operator-facing contact info. These can't be derived from `var.environment` alone — a human has to provide them.
  - `infra/terraform/locals.tf`'s `env_config` map, keyed on `var.environment`, is for **internal, code-owned policy** that legitimately differs dev vs prod but needs no operator input — log retention, concurrency limits, deployment strategy, alarm toggles (see `local.env` / `local.env_config`). Put a new per-environment value here, not in a new `variable`, unless it's the externally-supplied kind above.
  - **CI never passes `-var-file`** — `terraform-plan.yml` / `terraform-apply.yml` call `terraform plan`/`apply` with no `-var-file` flag at all; every CI-supplied variable comes from `TF_VAR_*` exported by `.github/actions/terraform-env`, which only covers the externally-supplied list. Adding a new `variable` for an internal policy value means also adding it to `terraform-env`, both calling workflows, and both GitHub environments' UI — real added surface for a value that didn't need to be operator-configurable.
- `infra/terraform/bootstrap/` — separate root module that creates the state bucket. It has its own state; don't entangle it with the main root.

## State

- S3 backend (`backends/dev.hcl` / `backends/prod.hcl`), `encrypt = true`, **S3-native locking via `use_lockfile`** — there is no DynamoDB lock table; don't add one.
- Never run `terraform state` mutations, `import`, or `apply` locally against dev/prod without the user explicitly asking. Plans are fine; state changes go through CI.

## Conventions

- Pin versions: providers in each module's `versions.tf`, Terraform version matches CI (`~> 1.14`).
- Every `variable` has `type` and `description`; add `validation` blocks where a bad value would only surface at apply time.
- **No `default` on `variable` blocks.** Every value must be supplied explicitly via `vars/*.tfvars` / `TF_VAR_*`, including an explicit empty string for an environment that doesn't use it. A default lets an unset value silently fall through instead of showing up in the plan/tfvars as a deliberate choice.
- No secret values in `vars/*.tfvars` (they're committed). Secrets live in AWS Secrets Manager and are referenced by ARN/name; the apps load them at runtime.
- Stateful or hard-to-recreate resources (Cognito user pool, S3 buckets with data, Route53 zone) deserve `lifecycle { prevent_destroy = true }` or an explicit comment on why not.
- Trivy findings are suppressed only in `infra/terraform/.trivyignore`, one ID per line **with a justification comment** (see AVD-AWS-0132 there for the pattern).
- tflint config is `infra/terraform/.tflint.hcl` (terraform preset `recommended` + AWS ruleset). Fix findings rather than inline-disabling them; if a rule is genuinely wrong for this repo, disable it in `.tflint.hcl` with a comment.

## Design conventions

Practices this repo holds new/changed HCL to, beyond what tflint/trivy catch mechanically. These apply to _new_ additions in a diff — they are not a mandate to refactor the module's existing, already-legitimate `depends_on`/`lifecycle`/`data` usages.

- **Implicit dependencies over `depends_on`.** Order operations by referencing another resource's or module's attribute (`module.lambda.function_arn`) so Terraform infers the dependency from the graph. Add `depends_on` only for a dependency Terraform genuinely can't infer from any attribute reference (e.g. an IAM policy that must exist before a resource relies on it at runtime without referencing it in HCL). A new `depends_on` that duplicates an already-inferrable reference is the smell to flag, not the existing ones in `modules/s3`, `modules/lambda`, `modules/cognito`.
- **No module-level `depends_on`; modules communicate via inputs/outputs.** Wire `module.X.output` into `module.Y`'s input in the root `main.tf` rather than reaching across modules with a `data` source or a module-level `depends_on`.
- **Module outputs are a public API — export only what a caller consumes.** Don't add an `outputs.tf` attribute nobody in root `main.tf` reads.
- **Small, single-responsibility modules.** One concern per `modules/<name>/`, mirroring the existing split (`acm`, `waf`, `cognito`, …) — don't grow a mega-module that owns unrelated concerns.
- **Small module interfaces.** Expose only the `variable`s a module actually reads; don't pass through an input it never uses.
- **No hardcoded environment-specific literals.** Region, account ID, domain, environment name, and ARNs come from `var.*` / `vars/*.tfvars` / `local.*` or a `data` source — never a literal in a resource block. This generalizes the existing secrets rule to all environment-specific values.
- **`locals` for repeated expressions.** Factor a value used more than once into `locals.tf` — see `local.name_prefix = "${var.project_name}-${var.environment}"` and the derived bucket-name locals in `infra/terraform/locals.tf` as the pattern to follow.
- **Prefer already-managed resources/outputs over re-reading via `data`.** If this root module already creates a resource, reference its attribute or a module output instead of a `data` source that re-reads it. This does **not** apply to legitimately external state this config doesn't manage — the externally-owned Route53 zone, `aws_caller_identity`, `aws_region`, a conditionally pre-existing OIDC provider, and `archive_file` build-time zips are all correct, expected `data` source usage.
- **`lifecycle` blocks are justified exceptions, not defaults.** Any `ignore_changes` / `create_before_destroy` / `prevent_destroy` needs a reason — a comment, or an obvious one like `prevent_destroy` on a data-bearing bucket. This extends the existing stateful-resource `prevent_destroy` rule to all `lifecycle` meta-arguments.
- **Consistent `<project>-<environment>-<resource>` naming.** Derive resource names/identifiers from `local.name_prefix` (e.g. `"${local.name_prefix}-backend"`) rather than hand-writing a name that breaks the pattern.

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
- Auth is GitHub OIDC role assumption (`TF_PLAN_ROLE_ARN` for plans, `DEPLOY_ROLE_ARN` for applies/deploys) against the org-provided `gha-deploy` roles — no static AWS keys; don't introduce any.
