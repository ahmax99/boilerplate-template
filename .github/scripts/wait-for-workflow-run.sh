#!/usr/bin/env bash
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${REPO:?REPO is required}"
: "${WORKFLOW_FILE:?WORKFLOW_FILE is required}"
: "${COMMIT_SHA:?COMMIT_SHA is required}"
: "${MAX_ATTEMPTS:?MAX_ATTEMPTS is required}"
: "${POLL_INTERVAL_SECONDS:?POLL_INTERVAL_SECONDS is required}"

echo "Waiting for a ${WORKFLOW_FILE} run on commit ${COMMIT_SHA}..."

RUN_ID=""
for _ in $(seq 1 "$MAX_ATTEMPTS"); do
  RUN_ID=$(gh run list --repo "$REPO" --workflow="$WORKFLOW_FILE" --commit "$COMMIT_SHA" --json databaseId --jq '.[0].databaseId // empty')
  [ -n "$RUN_ID" ] && break
  echo "No ${WORKFLOW_FILE} run found yet for ${COMMIT_SHA} — retrying in ${POLL_INTERVAL_SECONDS}s..."
  sleep "$POLL_INTERVAL_SECONDS"
done

if [ -z "$RUN_ID" ]; then
  echo "::error::No ${WORKFLOW_FILE} run found for commit ${COMMIT_SHA} after waiting."
  exit 1
fi

echo "Found run ${RUN_ID} — watching until it completes..."
gh run watch "$RUN_ID" --repo "$REPO" --exit-status
