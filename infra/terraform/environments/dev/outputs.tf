# -------------------
# Common
# -------------------
output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "aws_account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

# -------------------
# S3
# -------------------
output "s3_uploads_bucket_name" {
  description = "Name of the S3 uploads bucket for frontend configuration"
  value       = module.s3_uploads.bucket_name
}

output "lambda_code_bucket_name" {
  description = "Name of the S3 bucket for Lambda deployment packages"
  value       = module.s3_lambda_code.bucket_name
}

# -------------------
# Backend Lambda
# -------------------
output "backend_function_url" {
  description = "Backend Lambda Function URL for frontend configuration"
  value       = module.backend.function_url
}

output "backend_function_name" {
  description = "Backend Lambda function name for debugging"
  value       = module.backend.function_name
}

output "backend_alias_name" {
  description = "Backend Lambda alias name"
  value       = module.backend.alias_name
}

output "backend_alias_arn" {
  description = "Backend Lambda alias ARN"
  value       = module.backend.alias_arn
}

# -------------------
# CodeDeploy
# -------------------
output "codedeploy_app_name" {
  description = "CodeDeploy application name"
  value       = module.codedeploy_backend.app_name
}

output "codedeploy_deployment_group_name" {
  description = "CodeDeploy deployment group name"
  value       = module.codedeploy_backend.deployment_group_name
}

# -------------------
# GitHub Actions OIDC
# -------------------
output "github_actions_role_arn" {
  description = "ARN of the IAM role for GitHub Actions (use as AWS_ROLE_ARN secret)"
  value       = module.github_oidc.role_arn
}

output "github_actions_role_name" {
  description = "Name of the IAM role for GitHub Actions"
  value       = module.github_oidc.role_name
}