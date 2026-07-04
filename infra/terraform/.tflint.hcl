# TFLint configuration — https://github.com/terraform-linters/tflint
# Plugins are installed with `tflint --init`; CI runs this in terraform-plan.yml
# before `tflint --recursive`.

plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

plugin "aws" {
  enabled = true
  version = "0.48.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}
