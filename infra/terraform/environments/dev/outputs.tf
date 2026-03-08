# -------------------
# Common
# -------------------
output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

# -------------------
# ECR
# -------------------
output "ecr_backend_repository_url" {
  description = "ECR repository URL for backend container images"
  value       = module.ecr_backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend container images"
  value       = module.ecr_frontend.repository_url
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

# -------------------
# Frontend Lambda
# -------------------
output "frontend_function_url" {
  description = "Frontend Lambda Function URL for frontend configuration"
  value       = module.frontend.function_url
}

output "frontend_function_name" {
  description = "Frontend Lambda function name for debugging"
  value       = module.frontend.function_name
}

output "frontend_alias_name" {
  description = "Frontend Lambda alias name"
  value       = module.frontend.alias_name
}

# -------------------
# Cognito
# -------------------
output "cognito_domain" {
  description = "Cognito User Pool domain"
  value       = module.cognito.user_pool_domain
}