variable "aws_region" {
  description = "AWS region for resources"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming and tagging"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
}

variable "root_domain" {
  description = "Root domain (Route 53 hosted zone name) the app's domain is derived from"
  type        = string
}

variable "dns_account_role_arn" {
  description = "IAM role ARN to assume in the AWS account hosting the root Route 53 zone for cross-account DNS writes; empty string when the zone lives in this same account"
  type        = string

  validation {
    condition     = can(regex("^$|^arn:aws:iam::[0-9]{12}:role/.+$", var.dns_account_role_arn))
    error_message = "dns_account_role_arn must be a valid IAM role ARN or empty."
  }
}

variable "github_org" {
  description = "GitHub organization name"
  type        = string
}

variable "database_url" {
  description = "Database connection URL (Neon PostgreSQL)"
  type        = string
  sensitive   = true
}

variable "backend_sentry_dsn" {
  description = "Sentry DSN for the backend's error tracking"
  type        = string
  sensitive   = true
}

variable "frontend_sentry_dsn" {
  description = "Sentry DSN for the frontend's error tracking"
  type        = string
  sensitive   = true
}

variable "contact_to_email" {
  description = "Email address to receive contact form submissions"
  type        = string
}

variable "from_email" {
  description = "Email address for sending emails"
  type        = string
}

variable "resend_api_key" {
  description = "Resend API key for sending emails"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "Session secret for signing cookies (generated with: openssl rand -base64 32)"
  type        = string
  sensitive   = true
}

variable "source_ecr_account_id" {
  description = "Account ID hosting the source/build ECR repos images are promoted FROM (the dev account). Set on prod; empty elsewhere."
  type        = string

  validation {
    condition     = can(regex("^([0-9]{12})?$", var.source_ecr_account_id))
    error_message = "source_ecr_account_id must be a 12-digit AWS account ID or empty."
  }
}

variable "promotion_grantee_account_id" {
  description = "Account ID whose deploy role may pull images from this env's ECR for promotion (the prod account). Set on dev; empty elsewhere."
  type        = string

  validation {
    condition     = can(regex("^([0-9]{12})?$", var.promotion_grantee_account_id))
    error_message = "promotion_grantee_account_id must be a 12-digit AWS account ID or empty."
  }
}
