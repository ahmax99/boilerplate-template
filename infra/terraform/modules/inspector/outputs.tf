output "enabler_id" {
  description = "The ID of the Inspector enabler"
  value       = aws_inspector2_enabler.this.id
}

output "account_ids" {
  description = "List of account IDs with Inspector enabled"
  value       = aws_inspector2_enabler.this.account_ids
}

output "resource_types" {
  description = "List of resource types with Inspector enabled"
  value       = aws_inspector2_enabler.this.resource_types
}
