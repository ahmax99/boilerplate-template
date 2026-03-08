variable "aws_region" {
  description = "AWS region for backend resources"
  type        = string
  default     = "ap-northeast-1"
}

variable "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
  default     = "boilerplate-template-terraform-state"
}
