locals {
  oidc_provider_arn = aws_iam_openid_connect_provider.github.arn
  resource_prefix   = "${var.project_name}-${var.environment}"
}
