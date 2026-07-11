output "app_name" {
  description = "Name of the CodeDeploy application"
  value       = aws_codedeploy_app.lambda.name
}

output "deployment_group_arn" {
  description = "ARN of the deployment group"
  value       = aws_codedeploy_deployment_group.lambda.arn
}
