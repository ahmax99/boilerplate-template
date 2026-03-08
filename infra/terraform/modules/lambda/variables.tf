variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "lambda_code_s3_bucket" {
  description = "S3 bucket containing the Lambda deployment package"
  type        = string
}

variable "lambda_code_s3_key" {
  description = "S3 key for the Lambda deployment package"
  type        = string
}

variable "lambda_layers" {
  description = "List of Lambda layer ARNs (including Bun runtime layer)"
  type        = list(string)
}

variable "runtime" {
  description = "Lambda runtime identifier"
  type        = string
}

variable "handler" {
  description = "Lambda function handler"
  type        = string
}

variable "memory_size" {
  description = "Amount of memory in MB for Lambda function"
  type        = number
}

variable "timeout" {
  description = "Function timeout in seconds"
  type        = number
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
}

variable "reserved_concurrent_executions" {
  description = "Reserved concurrent executions for the Lambda function"
  type        = number
}

variable "s3_bucket_name" {
  description = "S3 bucket name for file uploads"
  type        = string
}

variable "secrets_arns" {
  description = "List of Secrets Manager ARNs to grant access to"
  type        = list(string)
}

variable "environment_variables" {
  description = "Environment variables for the Lambda function"
  type        = map(string)
}

variable "enable_function_url" {
  description = "Enable Lambda Function URL"
  type        = bool
}

variable "cors_allow_origins" {
  description = "CORS allowed origins for Function URL"
  type        = list(string)
}

variable "cors_allow_methods" {
  description = "CORS allowed methods for Function URL"
  type        = list(string)
}

variable "cors_allow_headers" {
  description = "CORS allowed headers for Function URL"
  type        = list(string)
}

variable "cors_max_age" {
  description = "CORS max age for Function URL"
  type        = number
}

variable "create_alias" {
  description = "Whether to create a Lambda alias for blue/green deployments"
  type        = bool
}

variable "alias_name" {
  description = "Name of the Lambda alias"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
