variable "backend_function_name" {
  description = "Name of the backend Lambda function"
  type        = string
}

variable "backend_alias_name" {
  description = "Name of the backend Lambda alias"
  type        = string
}

variable "frontend_function_name" {
  description = "Name of the frontend Lambda function"
  type        = string
}

variable "frontend_alias_name" {
  description = "Name of the frontend Lambda alias"
  type        = string
}

variable "frontend_lambda_role_arn" {
  description = "ARN of the frontend Lambda execution role (for server-to-server invocation)"
  type        = string
}

variable "frontend_lambda_role_name" {
  description = "Name of the frontend Lambda execution role"
  type        = string
}

variable "backend_function_arn" {
  description = "ARN of the backend Lambda function"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  type        = string
}
