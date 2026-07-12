locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  name_prefix = "${var.project_name}-${var.environment}"

  account_id = data.aws_caller_identity.current.account_id

  source_repo_prefix = "${var.project_name}-dev"

  # Cross-account ECR ARNs
  source_ecr_repository_arns = var.source_ecr_account_id != "" ? [
    "arn:aws:ecr:${var.aws_region}:${var.source_ecr_account_id}:repository/${local.source_repo_prefix}-backend",
    "arn:aws:ecr:${var.aws_region}:${var.source_ecr_account_id}:repository/${local.source_repo_prefix}-frontend"
  ] : []

  promotion_pull_principal_arns = var.promotion_grantee_account_id != "" ? [
    "arn:aws:iam::${var.promotion_grantee_account_id}:role/${var.project_name}-prod-github-actions-role"
  ] : []

  domain_name = var.environment == "prod" ? "${var.project_name}.${var.root_domain}" : "${var.environment}.${var.project_name}.${var.root_domain}"

  # Prod resolves the root zone directly; dev writes into its own delegated zone
  dns_zone_id = var.environment == "prod" ? data.aws_route53_zone.main[0].zone_id : aws_route53_zone.delegated[0].zone_id

  # App origins
  frontend_url      = "https://${local.domain_name}"
  dev_localhost_url = "http://localhost:3000"

  # S3 bucket names
  s3_uploads_bucket_name       = "${local.name_prefix}-uploads"
  s3_logs_bucket_name          = "${local.name_prefix}-logs"
  s3_static_assets_bucket_name = "${local.name_prefix}-static-assets"

  # CloudFront distribution ARN
  cloudfront_distribution_arn = module.cloudfront.distribution_arn

  # Per-environment hardening config
  env_config = {
    dev = {
      log_retention_days                = 7
      reserved_concurrent_executions    = -1
      provisioned_concurrent_executions = 0
      deployment_config_name            = "CodeDeployDefault.LambdaAllAtOnce"
      enable_alarms                     = false
      cognito_deletion_protection       = "INACTIVE"
      s3_logs_expiration_days           = 7
    }
    prod = {
      log_retention_days                = 30
      reserved_concurrent_executions    = 10
      provisioned_concurrent_executions = 2
      deployment_config_name            = "CodeDeployDefault.LambdaCanary10Percent5Minutes"
      enable_alarms                     = true
      cognito_deletion_protection       = "ACTIVE"
      s3_logs_expiration_days           = 90
    }
  }

  env = local.env_config[var.environment]
}
