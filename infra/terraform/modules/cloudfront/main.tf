# -----------------------------------------------------------
# CloudFront Origin Access Control — Backend Lambda (SigV4)
# -----------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "backend" {
  name                              = "${var.name_prefix}-backend-oac"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------
# CloudFront Origin Access Control — Frontend Lambda (SigV4)
# -----------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.name_prefix}-frontend-oac"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------
# CloudFront Origin Access Control — S3 Static Assets
# -----------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "static" {
  name                              = "${var.name_prefix}-static-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}


# -----------------------------------------------------------
# Cache Policies
# -----------------------------------------------------------

# Immutable static assets (/_next/static/*)
resource "aws_cloudfront_cache_policy" "static_immutable" {
  name        = "${var.name_prefix}-static-immutable"
  default_ttl = 86400    # 1 day
  max_ttl     = 31536000 # 1 year
  min_ttl     = 86400

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true

    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

# Public static assets (/static/*, /public/*)
resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "${var.name_prefix}-static-assets"
  default_ttl = 86400
  max_ttl     = 604800 # 7 days
  min_ttl     = 3600

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true

    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

# API / Lambda origins — Only cache key-neutral headers here
resource "aws_cloudfront_cache_policy" "no_cache" {
  name        = "${var.name_prefix}-no-cache"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = false
    enable_accept_encoding_brotli = false

    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

# -----------------------------------------------------------
# Origin Request Policies (what is forwarded to origins)
# -----------------------------------------------------------

# For S3 origins: forward nothing (OAC handles auth, no cookies/qs needed)
resource "aws_cloudfront_origin_request_policy" "s3_static" {
  name = "${var.name_prefix}-s3-static"

  cookies_config { cookie_behavior = "none" }
  headers_config { header_behavior = "none" }
  query_strings_config { query_string_behavior = "none" }
}

# For Lambda origins: forward all viewer headers + cookies + query strings
resource "aws_cloudfront_origin_request_policy" "lambda_all" {
  name = "${var.name_prefix}-lambda-all"

  cookies_config { cookie_behavior = "all" }
  headers_config {
    header_behavior = "allExcept"
    headers {
      # Exclude Host: CloudFront must use the Lambda Function URL hostname for OAC SigV4 signing
      # Exclude Authorization: viewer's Authorization header must not overwrite OAC's SigV4 signature
      items = ["Host", "Authorization"]
    }
  }
  query_strings_config { query_string_behavior = "all" }
}

# -----------------------------------------------------------
# CloudFront Distribution
# -----------------------------------------------------------
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront distribution"
  default_root_object = ""
  price_class         = "PriceClass_200" # NA, EU, Asia
  web_acl_id          = var.web_acl_id
  aliases             = compact([var.domain_name])

  # ----------
  # Origin: S3 static assets (/_next/static/*, /static/*)
  # ----------
  origin {
    origin_id                = "s3-static"
    domain_name              = var.static_assets_bucket_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.static.id
  }

  # ----------
  # Origin: Backend Lambda (/api/*)
  # Lambda Function URL origins require custom_origin_config even with OAC
  # ----------
  origin {
    origin_id                = "backend-lambda"
    domain_name              = local.backend_origin_domain
    origin_access_control_id = aws_cloudfront_origin_access_control.backend.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # ----------
  # Origin: Frontend Lambda (/* default)
  # Lambda Function URL origins require custom_origin_config even with OAC
  # ----------
  origin {
    origin_id                = "frontend-lambda"
    domain_name              = local.frontend_origin_domain
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # ----------
  # Behavior 1: /_next/static/* — immutable hashed assets from S3
  # Priority order: more specific paths first
  # ----------
  ordered_cache_behavior {
    path_pattern             = "/_next/static/*"
    target_origin_id         = "s3-static"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.static_immutable.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.s3_static.id
  }

  # ----------
  # Behavior 2: /static/* — public assets from S3
  # ----------
  ordered_cache_behavior {
    path_pattern             = "/static/*"
    target_origin_id         = "s3-static"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.static_assets.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.s3_static.id
  }

  # ----------
  # Behavior 3: /api/v1/* — backend Lambda, no cache, IAM-signed by OAC
  # ----------
  ordered_cache_behavior {
    path_pattern             = "/api/v1/*"
    target_origin_id         = "backend-lambda"
    viewer_protocol_policy   = "https-only"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.lambda_all.id
  }

  # ----------
  # Behavior 4: /api/*/images — frontend Lambda image proxy, compress disabled to avoid CloudFront gzip-encoding binary image responses
  # ----------
  ordered_cache_behavior {
    path_pattern             = "/api/*/images"
    target_origin_id         = "frontend-lambda"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = false
    cache_policy_id          = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.lambda_all.id
  }

  # ----------
  # Default behavior: /* — frontend Lambda (Next.js SSR/BFF)
  # ----------
  default_cache_behavior {
    target_origin_id         = "frontend-lambda"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.lambda_all.id

    dynamic "lambda_function_association" {
      for_each = toset(compact([var.lambda_edge_viewer_request_arn]))
      content {
        event_type   = "viewer-request"
        lambda_arn   = lambda_function_association.value
        include_body = false
      }
    }
  }

  # ----------
  # TLS certificate
  # ----------
  viewer_certificate {
    acm_certificate_arn            = var.acm_certificate_arn
    cloudfront_default_certificate = var.acm_certificate_arn == null ? true : false
    minimum_protocol_version       = var.acm_certificate_arn != null ? "TLSv1.2_2021" : "TLSv1"
    ssl_support_method             = var.acm_certificate_arn != null ? "sni-only" : null
  }

  # ----------
  # Access logging
  # ----------
  logging_config {
    include_cookies = false
    bucket          = "${var.logs_bucket_id}.s3.amazonaws.com"
    prefix          = "cloudfront/"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = var.tags
}
