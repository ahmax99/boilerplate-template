# -------------------
# S3 Buckets
# -------------------
module "s3_lambda_code" {
  source = "../../modules/s3"

  bucket_name = "${local.name_prefix}-lambda-code"

  enable_versioning       = true
  enable_encryption       = true
  block_public_access     = true
  enable_cors             = false
  cors_allowed_origins    = []
  cors_allowed_methods    = []
  cors_allowed_headers    = []
  cors_max_age_seconds    = 0
  enable_access_logging   = false
  logging_target_bucket   = ""
  logging_target_prefix   = ""

  lifecycle_rules = [
    {
      id                            = "delete-old-versions"
      enabled                       = true
      noncurrent_version_expiration = 30
    }
  ]

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-lambda-code"
    }
  )
}

module "s3_logs" {
  source = "../../modules/s3"

  bucket_name = local.s3_logs_bucket_name

  enable_versioning       = false
  enable_encryption       = true
  block_public_access     = true
  enable_cors             = false
  cors_allowed_origins    = []
  cors_allowed_methods    = []
  cors_allowed_headers    = []
  cors_max_age_seconds    = 0
  enable_access_logging   = false
  logging_target_bucket   = ""
  logging_target_prefix   = ""

  lifecycle_rules = [
    {
      id              = "expire-old-logs"
      enabled         = true
      expiration_days = 90
    }
  ]

  tags = merge(
    local.common_tags,
    {
      Name = local.s3_logs_bucket_name
    }
  )
}

module "s3_uploads" {
  source = "../../modules/s3"

  bucket_name = local.s3_uploads_bucket_name

  enable_versioning       = true
  enable_encryption       = true
  block_public_access     = true
  enable_cors             = true
  cors_allowed_origins    = ["https://${var.domain_name}"]
  cors_allowed_methods    = ["GET", "PUT", "POST", "DELETE", "HEAD"]
  cors_allowed_headers    = ["*"]
  cors_max_age_seconds    = 3600

  enable_access_logging  = true
  logging_target_bucket  = module.s3_logs.bucket_id
  logging_target_prefix  = "uploads/"

  lifecycle_rules = [
    {
      id                            = "delete-old-versions"
      enabled                       = true
      noncurrent_version_expiration = 30
    }
  ]

  tags = merge(
    local.common_tags,
    {
      Name = local.s3_uploads_bucket_name
    }
  )
}

# -------------------
# Secret Manager
# -------------------
module "database_secret" {
  source = "../../modules/secret-manager"

  secret_name         = "${local.name_prefix}/database-url"
  secret_description  = "Database connection URL for ${var.environment} environment"
  secret_value        = var.database_url
  recovery_window_days = 7

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-database-url"
    }
  )
}

# -------------------
# Lambda
# -------------------
module "backend" {
  source = "../../modules/lambda-backend"

  function_name = "${local.name_prefix}-backend"

  lambda_code_s3_bucket = module.s3_lambda_code.bucket_name
  lambda_code_s3_key    = "${local.backend_artifact_prefix}/lambda-backend.zip"

  runtime = "provided.al2023"
  handler = "bootstrap"

  lambda_layers = [
    "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:layer:boilerplate-bun-runtime:1", // enabled after running deploy-bun-layer.sh
    "arn:aws:lambda:${var.aws_region}:753240598075:layer:LambdaAdapterLayerX86:27"
  ]

  memory_size                    = 512
  timeout                        = 30
  log_retention_days             = 7
  reserved_concurrent_executions = -1

  s3_bucket_name = local.s3_uploads_bucket_name

  secrets_arns = [
    module.database_secret.secret_arn
  ]

  environment_variables = {
    AWS_LWA_PORT             = "4000"
    AWS_LAMBDA_EXEC_WRAPPER  = "/opt/bootstrap"
    DATABASE_URL_SECRET_NAME = module.database_secret.secret_name
    FRONTEND_URL             = "https://${var.domain_name}"
    NODE_ENV                 = "production"
    S3_BUCKET_NAME           = local.s3_uploads_bucket_name
    SENTRY_DSN               = var.sentry_dsn
  }

  enable_function_url = true
  cors_allow_origins  = ["https://${var.domain_name}"]
  cors_allow_methods  = ["*"]
  cors_allow_headers  = ["*"]
  cors_max_age        = 86400

  create_alias = true
  alias_name   = var.environment

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-backend"
    }
  )
}

# -------------------
# CodeDeploy
# -------------------
module "codedeploy_backend" {
  source = "../../modules/codedeploy"

  application_name       = "${local.name_prefix}-backend"
  deployment_group_name  = "${local.name_prefix}-backend-dg"
  lambda_function_arn    = module.backend.function_arn
  artifact_bucket_arn    = module.s3_lambda_code.bucket_arn

  create_custom_deployment_config = false
  deployment_config_name          = "CodeDeployDefault.LambdaLinear10PercentEvery1Minute"
  traffic_routing_type            = "TimeBasedLinear"
  linear_interval                 = 1
  linear_percentage               = 10
  canary_interval                 = 5
  canary_percentage               = 10

  enable_auto_rollback   = true
  auto_rollback_events   = ["DEPLOYMENT_FAILURE", "DEPLOYMENT_STOP_ON_ALARM"]
  alarm_names            = []

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-backend-codedeploy"
    }
  )
}

# -------------------
# GitHub Actions OIDC
# -------------------
module "github_oidc" {
  source = "../../modules/github-oidc"

  role_name    = "${local.name_prefix}-github-actions"
  project_name = var.project_name

  github_repositories = [
    "repo:${var.github_org}/${var.project_name}:*"
  ]

  lambda_function_arns = [
    module.backend.function_arn
  ]

  s3_bucket_arn = module.s3_lambda_code.bucket_arn

  codedeploy_arns = [
    "arn:aws:codedeploy:${var.aws_region}:${data.aws_caller_identity.current.account_id}:application:${module.codedeploy_backend.app_name}",
    module.codedeploy_backend.deployment_group_arn
  ]

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-github-actions"
    }
  )
}

# -------------------
# Inspector
# -------------------
module "inspector" {
  source = "../../modules/inspector"

  account_ids    = [data.aws_caller_identity.current.account_id]
  resource_types = ["LAMBDA", "LAMBDA_CODE"]

  timeout_create = "15m"
  timeout_update = "15m"
  timeout_delete = "15m"

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-inspector"
    }
  )
}

