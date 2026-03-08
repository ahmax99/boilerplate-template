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
    Statement = concat(
      [
        # Lambda permissions
        {
          Sid    = "AllowLambdaDeployment"
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
          Resource = concat(
            var.lambda_function_arns,
            [for arn in var.lambda_function_arns : "${arn}:*"]
          )
        },
        # CodeDeploy permissions
        {
          Sid    = "AllowCodeDeployDeployment"
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
          Sid    = "AllowCodeDeployConfigRead"
          Effect = "Allow"
          Action = [
            "codedeploy:GetDeploymentConfig"
          ]
          Resource = "arn:aws:codedeploy:*:*:deploymentconfig:*"
        },
        # ECR permissions for Docker image push
        {
          Sid    = "AllowECRAuthToken"
          Effect = "Allow"
          Action = [
            "ecr:GetAuthorizationToken"
          ]
          Resource = "*"
        },
        {
          Sid    = "AllowECRImagePush"
          Effect = "Allow"
          Action = [
            "ecr:BatchCheckLayerAvailability",
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchGetImage",
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload"
          ]
          Resource = var.ecr_repository_arns
        }
      ],
      # S3 static assets permissions
      [
        {
          Sid    = "AllowStaticAssetSync"
          Effect = "Allow"
          Action = [
            "s3:PutObject",
            "s3:DeleteObject",
            "s3:ListBucket"
          ]
          Resource = [
            var.s3_static_assets_bucket_arn,
            "${var.s3_static_assets_bucket_arn}/*"
          ]
        }
      ],
      # CloudFront cache invalidation permissions
      [
        {
          Sid      = "AllowCacheInvalidation"
          Effect   = "Allow"
          Action   = ["cloudfront:CreateInvalidation"]
          Resource = [var.cloudfront_distribution_arn]
        }
      ]
    )
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

# -------------------
# S3 Bucket Policy — static assets
# Consolidated here to avoid a circular dependency between the cloudfront module and the github-oidc module
# -------------------
resource "aws_s3_bucket_policy" "static_assets" {
  bucket = var.s3_static_assets_bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${var.s3_static_assets_bucket_arn}/*"
        Condition = {
          StringEquals = {
            "aws:SourceArn" = var.cloudfront_distribution_arn
          }
        }
      },
      {
        Sid    = "AllowGitHubActionsStaticAssets"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.github_actions.arn
        }
        Action = [
          "s3:ListBucket",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          var.s3_static_assets_bucket_arn,
          "${var.s3_static_assets_bucket_arn}/*",
        ]
      },
      {
        Sid       = "DenyNonHTTPS"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          var.s3_static_assets_bucket_arn,
          "${var.s3_static_assets_bucket_arn}/*",
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      },
    ]
  })
}
