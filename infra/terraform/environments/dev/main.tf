# -------------------
# S3 Buckets
# -------------------
module "s3_logs" {
  source = "../../modules/s3"

  bucket_name = local.s3_logs_bucket_name

  enable_versioning       = false
  enforce_https           = true
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
  enforce_https           = true
  enable_encryption       = true
  block_public_access     = true
  enable_cors             = true
  cors_allowed_origins    = ["https://${var.domain_name}", "http://localhost:3000"]
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
# ECR
# -------------------
module "ecr_backend" {
  source = "../../modules/ecr"

  project_name    = var.project_name
  environment     = var.environment
  repository_name = "${local.name_prefix}-backend"

  image_tag_mutability = "MUTABLE"
  scan_on_push         = true

  lifecycle_policy = {
    max_image_count = 10
    max_image_age   = 30
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-backend-ecr"
    }
  )
}

module "ecr_frontend" {
  source = "../../modules/ecr"

  project_name    = var.project_name
  environment     = var.environment
  repository_name = "${local.name_prefix}-frontend"

  image_tag_mutability = "MUTABLE"
  scan_on_push         = true

  lifecycle_policy = {
    max_image_count = 10
    max_image_age   = 30
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-frontend-ecr"
    }
  )
}

# -------------------
# Lambda
# -------------------
module "backend" {
  source = "../../modules/lambda"

  function_name       = "${local.name_prefix}-backend"
  image_uri           = "${module.ecr_backend.repository_url}:latest"
  ecr_repository_arn  = module.ecr_backend.repository_arn

  memory_size                    = 512
  timeout                        = 30
  log_retention_days             = 7
  reserved_concurrent_executions = -1

  s3_bucket_name = local.s3_uploads_bucket_name

  secrets_arns = [
    module.database_secret.secret_arn
  ]

  environment_variables = {
    BACKEND_PORT             = "4000"
    COGNITO_CLIENT_ID        = module.cognito.client_id
    COGNITO_USERPOOL_ID      = module.cognito.user_pool_id
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

module "frontend" {
  source = "../../modules/lambda"

  function_name      = "${local.name_prefix}-frontend"
  image_uri          = "${module.ecr_frontend.repository_url}:latest"
  ecr_repository_arn = module.ecr_frontend.repository_arn

  memory_size                    = 512
  timeout                        = 30
  log_retention_days             = 7
  reserved_concurrent_executions = -1

  s3_bucket_name = null

  secrets_arns = []

  environment_variables = {
    COGNITO_CLIENT_ID   = module.cognito.client_id
    COGNITO_DOMAIN      = module.cognito.user_pool_domain
    COGNITO_USERPOOL_ID = module.cognito.user_pool_id
    CONTACT_TO_EMAIL    = var.contact_to_email
    FROM_EMAIL          = var.from_email
    NODE_ENV            = "production"
    RESEND_API_KEY      = var.resend_api_key
    SESSION_SECRET      = var.session_secret
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
      Name = "${local.name_prefix}-frontend"
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

  create_custom_deployment_config = false
  deployment_config_name          = "CodeDeployDefault.LambdaAllAtOnce"
  traffic_routing_type            = "AllAtOnce"
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

module "codedeploy_frontend" {
  source = "../../modules/codedeploy"

  application_name       = "${local.name_prefix}-frontend"
  deployment_group_name  = "${local.name_prefix}-frontend-dg"
  lambda_function_arn    = module.frontend.function_arn

  create_custom_deployment_config = false
  deployment_config_name          = "CodeDeployDefault.LambdaAllAtOnce"
  traffic_routing_type            = "AllAtOnce"
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
      Name = "${local.name_prefix}-frontend-codedeploy"
    }
  )
}

# -------------------
# Cognito
# -------------------
module "cognito" {
  source = "../../modules/cognito"

  user_pool_name   = "${local.name_prefix}-user-pool"
  user_pool_domain = local.name_prefix
  app_client_name  = "${local.name_prefix}-web-app-client"

  callback_urls = [
    "https://${var.domain_name}/api/auth/callback",
    "http://localhost:3000/api/auth/callback",
  ]
  logout_urls = [
    "https://${var.domain_name}",
    "http://localhost:3000",
  ]

  password_policy = {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }

  mfa_configuration      = "OPTIONAL"
  advanced_security_mode = "OFF"
  deletion_protection    = "ACTIVE"

  token_validity = {
    id_token_validity      = 60
    access_token_validity  = 60
    refresh_token_validity = 30
    id_token_unit          = "minutes"
    access_token_unit      = "minutes"
    refresh_token_unit     = "days"
  }

  generate_client_secret = false

  enable_google_oauth  = true
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-cognito"
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
    module.backend.function_arn,
    module.frontend.function_arn
  ]

  codedeploy_arns = [
    "arn:aws:codedeploy:${var.aws_region}:${data.aws_caller_identity.current.account_id}:application:${module.codedeploy_backend.app_name}",
    module.codedeploy_backend.deployment_group_arn,
    "arn:aws:codedeploy:${var.aws_region}:${data.aws_caller_identity.current.account_id}:application:${module.codedeploy_frontend.app_name}",
    module.codedeploy_frontend.deployment_group_arn
  ]

  ecr_repository_arns = [
    module.ecr_backend.repository_arn,
    module.ecr_frontend.repository_arn
  ]

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-github-actions"
    }
  )
}