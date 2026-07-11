output "role_arn" {
  description = "ARN of the IAM role for GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}

output "terraform_plan_role_arn" {
  description = "ARN of the terraform_plan IAM role (empty string when enable_terraform_roles = false)"
  value       = var.enable_terraform_roles ? aws_iam_role.terraform_plan[0].arn : ""
}

output "terraform_apply_role_arn" {
  description = "ARN of the terraform_apply IAM role (empty string when enable_terraform_roles = false)"
  value       = var.enable_terraform_roles ? aws_iam_role.terraform_apply[0].arn : ""
}
