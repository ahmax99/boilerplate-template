#!/usr/bin/env bash
set -euo pipefail

MAX_ATTEMPTS=3

attempt=1
while true; do
  terraform -chdir=infra plan -no-color -lock-timeout=300s -out=tfplan.binary

  if output=$(terraform -chdir=infra apply -auto-approve -lock-timeout=300s tfplan.binary 2>&1); then
    echo "$output"
    break
  fi

  echo "$output"

  if [ "$attempt" -ge "$MAX_ATTEMPTS" ] || ! grep -q 'WAFAssociatedItemException' <<<"$output"; then
    exit 1
  fi

  sleep_seconds=$((attempt * 20))
  echo "WAF/CloudFront disassociation hasn't propagated yet — retrying in ${sleep_seconds}s (attempt ${attempt}/${MAX_ATTEMPTS})"
  sleep "$sleep_seconds"
  attempt=$((attempt + 1))
done
