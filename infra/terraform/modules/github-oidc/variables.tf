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

variable "codedeploy_arns" {
  description = "List of CodeDeploy resource ARNs (application, deployment group)"
  type        = list(string)
}

variable "ecr_repository_arns" {
  description = "List of ECR repository ARNs that GitHub Actions can push images to"
  type        = list(string)
}

variable "s3_static_assets_bucket_id" {
  description = "S3 bucket ID (name) for static assets"
  type        = string
}

variable "s3_static_assets_bucket_arn" {
  description = "S3 bucket ARN for static assets"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
}
