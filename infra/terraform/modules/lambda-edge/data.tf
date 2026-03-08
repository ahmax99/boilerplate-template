data "archive_file" "function" {
  type        = "zip"
  output_path = local.function_zip_path

  source {
    content  = local_file.function_rendered.content
    filename = "index.js"
  }
}
