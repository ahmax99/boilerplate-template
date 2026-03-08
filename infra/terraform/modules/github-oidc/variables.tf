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

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket for Lambda code artifacts"
  type        = string
}

variable "codedeploy_arns" {
  description = "List of CodeDeploy resource ARNs (application, deployment group)"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
}
