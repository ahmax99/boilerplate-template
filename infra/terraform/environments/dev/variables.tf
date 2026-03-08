variable "aws_region" {
  description = "AWS region for resources"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming and tagging"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "domain_name" {
  description = "Application domain name"
  type        = string
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

variable "sentry_dsn" {
  description = "Sentry DSN for error tracking"
  type        = string
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