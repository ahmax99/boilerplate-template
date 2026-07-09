# -------------------
# IAM: CloudFront OAC → Backend Lambda
# -------------------
resource "aws_lambda_permission" "cloudfront_invoke_backend" {
  statement_id           = "AllowCloudFrontInvokeBackend"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = var.backend_function_name
  qualifier              = var.backend_alias_name
  principal              = "cloudfront.amazonaws.com"
  source_arn             = var.cloudfront_distribution_arn
  function_url_auth_type = "AWS_IAM"
}

resource "aws_lambda_permission" "cloudfront_invoke_backend_fn" {
  statement_id  = "AllowCloudFrontInvokeBackendFn"
  action        = "lambda:InvokeFunction"
  function_name = var.backend_function_name
  qualifier     = var.backend_alias_name
  principal     = "cloudfront.amazonaws.com"
  source_arn    = var.cloudfront_distribution_arn
}

# -------------------
# IAM: CloudFront OAC → Frontend Lambda
# -------------------
resource "aws_lambda_permission" "cloudfront_invoke_frontend" {
  statement_id           = "AllowCloudFrontInvokeFrontend"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = var.frontend_function_name
  qualifier              = var.frontend_alias_name
  principal              = "cloudfront.amazonaws.com"
  source_arn             = var.cloudfront_distribution_arn
  function_url_auth_type = "AWS_IAM"
}

resource "aws_lambda_permission" "cloudfront_invoke_frontend_fn" {
  statement_id  = "AllowCloudFrontInvokeFrontendFn"
  action        = "lambda:InvokeFunction"
  function_name = var.frontend_function_name
  qualifier     = var.frontend_alias_name
  principal     = "cloudfront.amazonaws.com"
  source_arn    = var.cloudfront_distribution_arn
}

# -------------------
# IAM: Lambda@Edge origin-request signer → Frontend Lambda
#
# The frontend Function URL is AWS_IAM-authed. With OAC removed, the only caller
# is the origin-request SigV4 signer, which authenticates as the Lambda@Edge role.
# The CloudFront service-principal grants above only cover the (now-gone) OAC path;
# -------------------
resource "aws_lambda_permission" "edge_signer_invoke_frontend" {
  statement_id           = "AllowEdgeSignerInvokeFrontend"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = var.frontend_function_name
  qualifier              = var.frontend_alias_name
  principal              = var.edge_signer_role_arn
  function_url_auth_type = "AWS_IAM"
}

# -------------------
# IAM: Frontend Lambda (SSR) → Backend Lambda (server-to-server)
# -------------------
resource "aws_lambda_permission" "frontend_invoke_backend" {
  statement_id           = "AllowFrontendInvokeBackend"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = var.backend_function_name
  qualifier              = var.backend_alias_name
  principal              = var.frontend_lambda_role_arn
  function_url_auth_type = "AWS_IAM"
}

resource "aws_lambda_permission" "frontend_invoke_backend_fn" {
  statement_id  = "AllowFrontendInvokeBackendFn"
  action        = "lambda:InvokeFunction"
  function_name = var.backend_function_name
  qualifier     = var.backend_alias_name
  principal     = var.frontend_lambda_role_arn
}

resource "aws_iam_role_policy" "frontend_invoke_backend" {
  name = "invoke-backend-function-url"
  role = var.frontend_lambda_role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunctionUrl",
          "lambda:InvokeFunction"
        ]
        Resource = [
          var.backend_function_arn,
          "${var.backend_function_arn}:${var.backend_alias_name}"
        ]
      }
    ]
  })
}
