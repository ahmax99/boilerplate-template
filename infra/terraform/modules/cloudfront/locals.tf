locals {
  # Strip "https://" prefix and trailing "/" from Function URLs to use as origin domains
  backend_origin_domain  = trimsuffix(replace(var.backend_function_url, "https://", ""), "/")
  frontend_origin_domain = trimsuffix(replace(var.frontend_function_url, "https://", ""), "/")
}
