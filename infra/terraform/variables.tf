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

variable "github_org" {
  description = "GitHub organization name"
  type        = string
}

variable "create_github_oidc_provider" {
  description = "Create the account-global GitHub OIDC provider. Set true for exactly one environment (dev) applied first; false for the others, which resolve the existing provider via a data source."
  type        = bool
}

variable "database_url" {
  description = "Database connection URL (Neon PostgreSQL)"
  type        = string
  sensitive   = true
}

variable "sentry_dsn" {
  description = "Sentry DSN for error tracking"
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
