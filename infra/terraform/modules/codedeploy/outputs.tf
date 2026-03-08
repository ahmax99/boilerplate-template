output "app_name" {
  description = "Name of the CodeDeploy application"
  value       = aws_codedeploy_app.lambda.name
}

output "app_id" {
  description = "ID of the CodeDeploy application"
  value       = aws_codedeploy_app.lambda.id
}

output "deployment_group_name" {
  description = "Name of the deployment group"
  value       = aws_codedeploy_deployment_group.lambda.deployment_group_name
}

output "deployment_group_id" {
  description = "ID of the deployment group"
  value       = aws_codedeploy_deployment_group.lambda.id
}

output "deployment_group_arn" {
  description = "ARN of the deployment group"
  value       = aws_codedeploy_deployment_group.lambda.arn
}

output "service_role_arn" {
  description = "ARN of the CodeDeploy service role"
  value       = aws_iam_role.codedeploy.arn
}

output "deployment_config_name" {
  description = "Name of the deployment configuration being used"
  value       = var.create_custom_deployment_config ? aws_codedeploy_deployment_config.lambda[0].id : var.deployment_config_name
}
