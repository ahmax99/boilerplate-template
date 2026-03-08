# -------------------
# Common
# -------------------
output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
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