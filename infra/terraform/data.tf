data "aws_route53_zone" "main" {
  count = var.environment == "prod" ? 1 : 0

  name         = var.root_domain
  private_zone = false
}

data "aws_caller_identity" "current" {}