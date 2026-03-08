# -------------------
# IAM Role for Lambda@Edge
# -------------------
resource "aws_iam_role" "lambda_edge" {
  name = "${var.name_prefix}-lambda-edge-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "edgelambda.amazonaws.com"
          ]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_edge_basic" {
  role       = aws_iam_role.lambda_edge.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Write the rendered JS to a temp file so archive_file can package it
resource "local_file" "function_rendered" {
  content  = local.function_source
  filename = "${path.module}/function/index.rendered.js"
}

# -------------------
# Lambda@Edge function
# -------------------
resource "aws_lambda_function" "this" {
  function_name    = "${var.name_prefix}-lambda-edge-restrict-host"
  role             = aws_iam_role.lambda_edge.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.function.output_path
  source_code_hash = data.archive_file.function.output_base64sha256

  
  timeout     = 5 # viewer-request: max 5 seconds
  memory_size = 128

  publish = true

  tags = var.tags
}

resource "aws_lambda_permission" "cloudfront_invoke" {
  statement_id  = "AllowCloudFrontInvokeLambdaEdge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.qualified_arn
  principal     = "edgelambda.amazonaws.com"
  source_arn    = var.cloudfront_distribution_arn
}
