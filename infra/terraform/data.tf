data "aws_route53_zone" "main" {
  name         = var.root_domain
  private_zone = false
}

data "aws_caller_identity" "current" {}