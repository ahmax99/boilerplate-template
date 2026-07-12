#!/usr/bin/env bash
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${REPO:?REPO is required}"
: "${WORKFLOW_FILE:?WORKFLOW_FILE is required}"
: "${REF_NAME:?REF_NAME is required}"
: "${MAX_ATTEMPTS:?MAX_ATTEMPTS is required}"
: "${POLL_INTERVAL_SECONDS:?POLL_INTERVAL_SECONDS is required}"

echo "Waiting for a push-triggered ${WORKFLOW_FILE} run on ref ${REF_NAME}..."

RUN_ID=""
for _ in $(seq 1 "$MAX_ATTEMPTS"); do
  RUN_ID=$(gh run list --repo "$REPO" --workflow="$WORKFLOW_FILE" --event push \
    --json databaseId,headBranch \
    | jq -r --arg ref "$REF_NAME" '[.[] | select(.headBranch == $ref)][0].databaseId // empty')
  [ -n "$RUN_ID" ] && break
  echo "No push-triggered ${WORKFLOW_FILE} run found yet for ref ${REF_NAME} — retrying in ${POLL_INTERVAL_SECONDS}s..."
  sleep "$POLL_INTERVAL_SECONDS"
done

if [ -z "$RUN_ID" ]; then
  echo "::error::No push-triggered ${WORKFLOW_FILE} run found for ref ${REF_NAME} after waiting."
  exit 1
fi

echo "Found run ${RUN_ID} — watching until it completes..."
gh run watch "$RUN_ID" --repo "$REPO" --exit-status
