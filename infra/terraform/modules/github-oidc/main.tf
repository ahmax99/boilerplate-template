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
          Federated = local.oidc_provider_arn
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
  count = var.create_oidc_provider ? 1 : 0

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

# -------------------
# Terraform Plan Role (read-only, used by PR plan workflow)
# Trust: pull_request OIDC sub claim only
# -------------------
resource "aws_iam_role" "terraform_plan" {
  count = var.enable_terraform_roles ? 1 : 0

  name        = "${var.role_name}-terraform-plan"
  description = "Read-only OIDC role for GitHub Actions terraform plan (PR context)"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = local.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.project_name}:pull_request"
          }
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_policy" "terraform_plan_state" {
  count = var.enable_terraform_roles ? 1 : 0

  name        = "${var.role_name}-terraform-plan-state"
  description = "S3 state bucket read access for terraform plan role"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "TerraformStateRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
          "s3:GetBucketVersioning",
          "s3:GetBucketLocation"
        ]
        Resource = [
          var.state_bucket_arn,
          "${var.state_bucket_arn}/${var.environment}/*"
        ]
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "terraform_plan_readonly" {
  count      = var.enable_terraform_roles ? 1 : 0
  role       = aws_iam_role.terraform_plan[0].name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "terraform_plan_state" {
  count      = var.enable_terraform_roles ? 1 : 0
  role       = aws_iam_role.terraform_plan[0].name
  policy_arn = aws_iam_policy.terraform_plan_state[0].arn
}

# -------------------
# Terraform Apply Role (read-write, gated behind terraform-apply GitHub Environment)
# Trust: environment:terraform-apply OIDC sub claim only
# -------------------
resource "aws_iam_role" "terraform_apply" {
  count = var.enable_terraform_roles ? 1 : 0

  name        = "${var.role_name}-terraform-apply"
  description = "Read-write OIDC role for GitHub Actions terraform apply (environment gate required)"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = local.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.project_name}:environment:${var.environment}"
          }
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_policy" "terraform_apply_permissions" {
  count = var.enable_terraform_roles ? 1 : 0

  name        = "${var.role_name}-terraform-apply-permissions"
  description = "Broad infra-management policy for terraform apply — intentionally high-privilege, gated behind required-reviewer environment"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "TerraformStateBucket"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketVersioning",
          "s3:GetBucketLocation",
          "s3:GetBucketAcl",
          "s3:GetBucketPolicy",
          "s3:PutBucketPolicy"
        ]
        Resource = [
          var.state_bucket_arn,
          "${var.state_bucket_arn}/${var.environment}/*"
        ]
      },
      {
        Sid    = "IAMManagement"
        Effect = "Allow"
        Action = ["iam:*"]
        Resource = [
          "arn:aws:iam::*:role/${var.project_name}-${var.environment}-*",
          "arn:aws:iam::*:policy/${var.project_name}-${var.environment}-*",
          "arn:aws:iam::*:instance-profile/${var.project_name}-${var.environment}-*",
          "arn:aws:iam::*:oidc-provider/token.actions.githubusercontent.com"
        ]
      },
      {
        Sid    = "LambdaManagement"
        Effect = "Allow"
        Action = ["lambda:*"]
        Resource = [
          "arn:aws:lambda:*:*:function:${var.project_name}-${var.environment}-*",
          "arn:aws:lambda:*:*:function:${var.project_name}-${var.environment}-*:*",
          "arn:aws:lambda:*:*:layer:${var.project_name}-${var.environment}-*",
          "arn:aws:lambda:*:*:layer:${var.project_name}-${var.environment}-*:*"
        ]
      },
      {
        Sid    = "LambdaEdge"
        Effect = "Allow"
        Action = ["lambda:*"]
        Resource = [
          "arn:aws:lambda:us-east-1:*:function:${var.project_name}-${var.environment}-*",
          "arn:aws:lambda:us-east-1:*:function:${var.project_name}-${var.environment}-*:*"
        ]
      },
      {
        Sid      = "ECRManagement"
        Effect   = "Allow"
        Action   = ["ecr:*"]
        Resource = ["arn:aws:ecr:*:*:repository/${var.project_name}-${var.environment}-*"]
      },
      {
        Sid      = "ECRAuthToken"
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "S3InfraManagement"
        Effect = "Allow"
        Action = ["s3:*"]
        Resource = [
          "arn:aws:s3:::${var.project_name}-${var.environment}-*",
          "arn:aws:s3:::${var.project_name}-${var.environment}-*/*"
        ]
      },
      {
        Sid      = "CloudFrontManagement"
        Effect   = "Allow"
        Action   = ["cloudfront:*"]
        Resource = "*"
      },
      {
        Sid      = "Route53Management"
        Effect   = "Allow"
        Action   = ["route53:*"]
        Resource = "*"
      },
      {
        Sid      = "ACMManagement"
        Effect   = "Allow"
        Action   = ["acm:*"]
        Resource = "*"
      },
      {
        Sid      = "CognitoManagement"
        Effect   = "Allow"
        Action   = ["cognito-idp:*", "cognito-identity:*"]
        Resource = "*"
      },
      {
        Sid      = "WAFManagement"
        Effect   = "Allow"
        Action   = ["wafv2:*"]
        Resource = "*"
      },
      {
        Sid      = "SecretsManagerManagement"
        Effect   = "Allow"
        Action   = ["secretsmanager:*"]
        Resource = "arn:aws:secretsmanager:*:*:secret:${var.project_name}-${var.environment}*"
      },
      {
        Sid      = "CodeDeployManagement"
        Effect   = "Allow"
        Action   = ["codedeploy:*"]
        Resource = "*"
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = ["logs:*"]
        Resource = [
          "arn:aws:logs:*:*:log-group:/aws/lambda/${var.project_name}-${var.environment}-*",
          "arn:aws:logs:*:*:log-group:/aws/lambda/${var.project_name}-${var.environment}-*:*"
        ]
      },
      {
        Sid      = "STSCallerIdentity"
        Effect   = "Allow"
        Action   = ["sts:GetCallerIdentity"]
        Resource = "*"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "terraform_apply_permissions" {
  count      = var.enable_terraform_roles ? 1 : 0
  role       = aws_iam_role.terraform_apply[0].name
  policy_arn = aws_iam_policy.terraform_apply_permissions[0].arn
}
