variable "name_prefix" {
  description = "Prefix for all resource names"
  type        = string
}

variable "frontend_function_url" {
  description = "Frontend Lambda Function URL (without https://)"
  type        = string
}

variable "backend_function_url" {
  description = "Backend Lambda Function URL (without https://)"
  type        = string
}

variable "static_assets_bucket_domain_name" {
  description = "Regional domain name of the S3 bucket"
  type        = string
}

variable "static_assets_bucket_id" {
  description = "S3 bucket ID that holds /_next/static/* and /static/* files"
  type        = string
}

variable "static_assets_bucket_arn" {
  description = "S3 bucket ARN for the static assets bucket"
  type        = string
}

variable "logs_bucket_id" {
  description = "S3 bucket for CloudFront access logs"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}

variable "web_acl_id" {
  description = "ARN of the WAFv2 Web ACL to associate with this distribution (must be CLOUDFRONT scope, us-east-1)"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for CloudFront"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for custom domain (must be in us-east-1)"
  type        = string
}

variable "lambda_edge_viewer_request_arn" {
  description = "Versioned ARN of the Lambda@Edge function to run on viewer-request (must be in us-east-1)"
  type        = string
}
