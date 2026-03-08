locals {
  # Render the JS template with the allowed hosts list injected as a JSON array
  function_source   = templatefile("${path.module}/function/index.js.tftpl", {
    allowed_hosts_json = jsonencode(var.allowed_hosts)
  })
  function_zip_path = "${path.module}/function/index.zip"
}
