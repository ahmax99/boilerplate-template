output "oidc_provider_arn" {
  description = "ARN of the GitHub OIDC provider (created here when create_oidc_provider = true, otherwise looked up)"
  value       = local.oidc_provider_arn
}

output "role_arn" {
  description = "ARN of the IAM role for GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}

output "role_name" {
  description = "Name of the IAM role for GitHub Actions"
  value       = aws_iam_role.github_actions.name
}

output "terraform_plan_role_arn" {
  description = "ARN of the terraform_plan IAM role (empty string when enable_terraform_roles = false)"
  value       = var.enable_terraform_roles ? aws_iam_role.terraform_plan[0].arn : ""
}

output "terraform_apply_role_arn" {
  description = "ARN of the terraform_apply IAM role (empty string when enable_terraform_roles = false)"
  value       = var.enable_terraform_roles ? aws_iam_role.terraform_apply[0].arn : ""
}
