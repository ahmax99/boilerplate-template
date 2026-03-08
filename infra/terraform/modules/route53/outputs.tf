output "record_name" {
  description = "FQDN of the Route 53 record"
  value       = aws_route53_record.cloudfront.fqdn
}

output "record_id" {
  description = "Route 53 record ID"
  value       = aws_route53_record.cloudfront.id
}
