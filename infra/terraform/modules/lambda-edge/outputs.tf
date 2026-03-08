output "qualified_arn" {
  description = "Versioned ARN of the Lambda@Edge function"
  value       = aws_lambda_function.this.qualified_arn
}
