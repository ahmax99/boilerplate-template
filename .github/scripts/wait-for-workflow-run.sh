#!/usr/bin/env bash
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${REPO:?REPO is required}"
: "${WORKFLOW_FILE:?WORKFLOW_FILE is required}"
: "${REF_NAME:?REF_NAME is required}"
: "${HEAD_SHA:?HEAD_SHA is required}"
: "${MAX_ATTEMPTS:?MAX_ATTEMPTS is required}"
: "${POLL_INTERVAL_SECONDS:?POLL_INTERVAL_SECONDS is required}"

echo "Waiting for a push-triggered ${WORKFLOW_FILE} run on ${REF_NAME}@${HEAD_SHA}..."

RUN_ID=""
for _ in $(seq 1 "$MAX_ATTEMPTS"); do
  # Matched by commit, not branch: a branch name like "main" is reused across
  # every push, so matching by branch alone can pick up an unrelated run.
  RUN_ID=$(gh run list --repo "$REPO" --workflow="$WORKFLOW_FILE" --event push --commit "$HEAD_SHA" \
    --json databaseId --jq '.[0].databaseId // empty')
  [ -n "$RUN_ID" ] && break
  echo "No push-triggered ${WORKFLOW_FILE} run found yet for ${REF_NAME}@${HEAD_SHA} — retrying in ${POLL_INTERVAL_SECONDS}s..."
  sleep "$POLL_INTERVAL_SECONDS"
done

if [ -z "$RUN_ID" ]; then
  echo "::error::No push-triggered ${WORKFLOW_FILE} run found for ${REF_NAME}@${HEAD_SHA} after waiting."
  exit 1
fi

echo "Found run ${RUN_ID} — watching until it completes..."
gh run watch "$RUN_ID" --repo "$REPO" --exit-status
