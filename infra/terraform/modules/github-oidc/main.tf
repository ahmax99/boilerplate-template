# -------------------
# IAM Roles and Policies
# -------------------
resource "aws_iam_role" "github_actions" {
  name        = var.role_name
  description = "IAM role for GitHub Actions OIDC authentication"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = var.github_repositories
          }
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_policy" "lambda_deployment" {
  name        = "${var.role_name}-lambda-deployment"
  description = "Policy for deploying Lambda functions via GitHub Actions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # Lambda permissions
      {
        Effect = "Allow"
        Action = [
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:PublishVersion",
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration",
          "lambda:ListVersionsByFunction",
          "lambda:GetAlias",
          "lambda:UpdateAlias"
        ]
        Resource = [
          "arn:aws:lambda:*:*:function:${var.project_name}-*-backend",
          "arn:aws:lambda:*:*:function:${var.project_name}-*-backend:*"
        ]
      },
      # S3 permissions for Lambda code
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "${var.s3_bucket_arn}",
          "${var.s3_bucket_arn}/*"
        ]
      },
      # CodeDeploy permissions
      {
        Effect = "Allow"
        Action = [
          "codedeploy:CreateDeployment",
          "codedeploy:GetDeployment",
          "codedeploy:GetApplicationRevision",
          "codedeploy:RegisterApplicationRevision",
          "codedeploy:GetApplication",
          "codedeploy:GetDeploymentGroup"
        ]
        Resource = var.codedeploy_arns
      },
      # CodeDeploy deployment configs (global resources)
      {
        Effect = "Allow"
        Action = [
          "codedeploy:GetDeploymentConfig"
        ]
        Resource = "arn:aws:codedeploy:*:*:deploymentconfig:*"
      }
    ]
  })

  tags = var.tags
}

# -------------------
# GitHub OIDC Provider
# -------------------
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_deployment" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.lambda_deployment.arn
}
