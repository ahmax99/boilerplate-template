data "aws_route53_zone" "main" {
  name         = "ahmax99.online"
  private_zone = false
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}
