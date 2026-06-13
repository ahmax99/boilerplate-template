locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  name_prefix = "${var.project_name}-${var.environment}"

  # S3 bucket names
  s3_uploads_bucket_name       = "${local.name_prefix}-uploads"
  s3_logs_bucket_name          = "${local.name_prefix}-logs"
  s3_static_assets_bucket_name = "${local.name_prefix}-static-assets"

  # S3 object key prefix
  frontend_artifact_prefix = "frontend"
  backend_artifact_prefix  = "backend"

  # CloudFront distribution ARN
  cloudfront_distribution_arn = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${module.cloudfront.distribution_id}"
}
