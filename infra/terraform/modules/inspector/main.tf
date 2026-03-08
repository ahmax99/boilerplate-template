resource "aws_inspector2_enabler" "this" {
  account_ids    = var.account_ids
  resource_types = var.resource_types

  timeouts {
    create = var.timeout_create
    update = var.timeout_update
    delete = var.timeout_delete
  }
}
