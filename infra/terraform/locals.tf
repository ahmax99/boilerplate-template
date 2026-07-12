locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  name_prefix = "${var.project_name}-${var.environment}"

  account_id = data.aws_caller_identity.current.account_id

  domain_name = var.environment == "prod" ? "${var.project_name}.${var.root_domain}" : "${var.environment}.${var.project_name}.${var.root_domain}"

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
      create_oidc_provider              = true
    }
    prod = {
      log_retention_days                = 30
      reserved_concurrent_executions    = 10
      provisioned_concurrent_executions = 2
      deployment_config_name            = "CodeDeployDefault.LambdaCanary10Percent5Minutes"
      enable_alarms                     = true
      create_oidc_provider              = false
    }
  }

  env = local.env_config[var.environment]
}
