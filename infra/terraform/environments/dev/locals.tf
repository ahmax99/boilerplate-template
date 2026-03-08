locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  name_prefix = "${var.project_name}-${var.environment}"

  # S3 bucket names
  s3_uploads_bucket_name = "${local.name_prefix}-uploads"
  s3_logs_bucket_name    = "${local.name_prefix}-logs"

  # S3 object key prefix
  frontend_artifact_prefix = "frontend"
  backend_artifact_prefix  = "backend"
}
