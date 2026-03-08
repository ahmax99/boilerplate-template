variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, production)"
  type        = string
}

variable "repository_name" {
  description = "Name of the ECR repository"
  type        = string
}

variable "image_tag_mutability" {
  description = "The tag mutability setting for the repository (MUTABLE or IMMUTABLE)"
  type        = string
}

variable "scan_on_push" {
  description = "Indicates whether images are scanned after being pushed to the repository"
  type        = bool
}

variable "lifecycle_policy" {
  description = "Lifecycle policy for the repository"
  type = object({
    max_image_count = number
    max_image_age   = number
  })
  default = {
    max_image_count = 10
    max_image_age   = 30
  }
}

variable "tags" {
  description = "Additional tags for the ECR repository"
  type        = map(string)
}
