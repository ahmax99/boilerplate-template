variable "role_name" {
  description = "Name of the IAM role for GitHub Actions"
  type        = string
}

variable "project_name" {
  description = "Project name for constructing Lambda function ARN patterns"
  type        = string
}

variable "github_repositories" {
  description = "List of GitHub repository patterns allowed to assume this role (e.g., 'repo:owner/repo:*')"
  type        = list(string)
}

variable "lambda_function_arns" {
  description = "List of Lambda function ARNs that GitHub Actions can deploy"
  type        = list(string)
}

variable "codedeploy_arns" {
  description = "List of CodeDeploy resource ARNs (application, deployment group)"
  type        = list(string)
}

variable "ecr_repository_arns" {
  description = "List of ECR repository ARNs that GitHub Actions can push images to"
  type        = list(string)
}

variable "source_ecr_repository_arns" {
  description = "Source/build ECR repository ARNs this role may pull from during registry-side image promotion (empty for envs that don't promote from another env's repo)"
  type        = list(string)
  default     = []
}

variable "s3_static_assets_bucket_id" {
  description = "S3 bucket ID (name) for static assets"
  type        = string
}

variable "s3_static_assets_bucket_arn" {
  description = "S3 bucket ARN for static assets"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
}

variable "enable_terraform_roles" {
  description = "Create the terraform_plan and terraform_apply OIDC roles. Requires github_org and state_bucket_arn."
  type        = bool
}

variable "github_org" {
  description = "GitHub organisation name — required when enable_terraform_roles = true"
  type        = string
}

variable "state_bucket_arn" {
  description = "ARN of the S3 Terraform state bucket — required when enable_terraform_roles = true"
  type        = string
}

variable "environment" {
  description = "Environment name — used in the apply role's OIDC :environment sub-claim and per-env resource scoping"
  type        = string
}

variable "create_oidc_provider" {
  description = "Create the account-global GitHub OIDC provider. true for the first env applied (dev); false for other envs, which resolve the existing provider via a data source."
  type        = bool
}
