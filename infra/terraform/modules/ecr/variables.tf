variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, production)"
  type        = string
}

variable "repository_name" {
  description = "Name of the ECR repository"
  type        = string
}

variable "image_tag_mutability" {
  description = "Tag mutability for the repository: MUTABLE, IMMUTABLE, or the *_WITH_EXCLUSION variants."
  type        = string

  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE", "IMMUTABLE_WITH_EXCLUSION", "MUTABLE_WITH_EXCLUSION"], var.image_tag_mutability)
    error_message = "image_tag_mutability must be one of MUTABLE, IMMUTABLE, IMMUTABLE_WITH_EXCLUSION, MUTABLE_WITH_EXCLUSION."
  }
}

variable "image_tag_mutability_exclusion_filters" {
  description = "Tag patterns exempt from image_tag_mutability. Only applied when image_tag_mutability is IMMUTABLE_WITH_EXCLUSION or MUTABLE_WITH_EXCLUSION."
  type = list(object({
    filter      = string
    filter_type = string
  }))
  default = []
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

variable "cross_account_pull_principal_arns" {
  description = "IAM role/principal ARNs in another account allowed to pull images for cross-account promotion. Empty when no cross-account pull is needed."
  type        = list(string)
}
