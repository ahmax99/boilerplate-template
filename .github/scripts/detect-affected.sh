#!/bin/bash
set -euo pipefail

if [[ -z "${GITHUB_OUTPUT:-}" ]]; then
  echo "❌ Error: GITHUB_OUTPUT is not set" >&2
  exit 1
fi

BACKEND_PACKAGE="backend-boilerplate"
FRONTEND_PACKAGE="nextjs-boilerplate"

deploy_both() {
  echo "backend=true" >> "$GITHUB_OUTPUT"
  echo "frontend=true" >> "$GITHUB_OUTPUT"
}

# Manual dispatch => deploy the whole environment, skip affected-detection.
if [[ "${EVENT_NAME:-}" != "push" ]]; then
  echo "🚀 Manual dispatch: deploying both apps."
  deploy_both
  exit 0
fi

# Fail safe: no usable base (first push, force-push, or all-zero SHA) => deploy both.
if [[ -z "${BEFORE_SHA:-}" || "$BEFORE_SHA" =~ ^0+$ ]] || ! git cat-file -e "${BEFORE_SHA}^{commit}" 2>/dev/null; then
  echo "⚠️  Base commit '${BEFORE_SHA:-}' unavailable; deploying both apps (fail-safe)."
  deploy_both
  exit 0
fi

echo "🔍 Computing affected packages between $BEFORE_SHA and $HEAD_SHA"
affected="$(TURBO_SCM_BASE="$BEFORE_SHA" TURBO_SCM_HEAD="$HEAD_SHA" \
  bunx turbo ls --affected --output=json \
  | jq -r '.packages.items[].name')"
echo "Affected packages:"
echo "$affected"

if echo "$affected" | grep -qx "$BACKEND_PACKAGE"; then
  echo "backend=true" >> "$GITHUB_OUTPUT"
else
  echo "backend=false" >> "$GITHUB_OUTPUT"
fi

if echo "$affected" | grep -qx "$FRONTEND_PACKAGE"; then
  echo "frontend=true" >> "$GITHUB_OUTPUT"
else
  echo "frontend=false" >> "$GITHUB_OUTPUT"
fi
