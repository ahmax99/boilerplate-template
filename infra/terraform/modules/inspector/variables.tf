variable "account_ids" {
  description = "List of AWS account IDs to enable Inspector for"
  type        = list(string)
}

variable "resource_types" {
  description = "List of resource types to enable Inspector for (EC2, ECR, LAMBDA, LAMBDA_CODE)"
  type        = list(string)
}

variable "timeout_create" {
  description = "Timeout for creating Inspector enabler"
  type        = string
}

variable "timeout_update" {
  description = "Timeout for updating Inspector enabler"
  type        = string
}

variable "timeout_delete" {
  description = "Timeout for deleting Inspector enabler"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
