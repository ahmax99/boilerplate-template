#!/usr/bin/env bash
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${REPO:?REPO is required}"
: "${WORKFLOW_FILE:?WORKFLOW_FILE is required}"
: "${REQUIRE_JOB:?REQUIRE_JOB is required}"
: "${REF_NAME:?REF_NAME is required}"
: "${HEAD_SHA:?HEAD_SHA is required}"
: "${MAX_ATTEMPTS:?MAX_ATTEMPTS is required}"
: "${POLL_INTERVAL_SECONDS:?POLL_INTERVAL_SECONDS is required}"

echo "Waiting for a push-triggered ${WORKFLOW_FILE} run on ${REF_NAME}@${HEAD_SHA}..."

RUN_ID=""
for _ in $(seq 1 "$MAX_ATTEMPTS"); do
  RUN_ID=$(gh run list --repo "$REPO" --workflow="$WORKFLOW_FILE" --event push \
    --branch "$REF_NAME" --commit "$HEAD_SHA" \
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
gh run watch "$RUN_ID" --repo "$REPO" --exit-status --interval 30

JOB_CONCLUSION=$(gh run view "$RUN_ID" --repo "$REPO" --json jobs \
  --jq '.jobs[] | select(.name == env.REQUIRE_JOB) | .conclusion' | head -1)

if [ "$JOB_CONCLUSION" != "success" ]; then
  echo "::error::Job '${REQUIRE_JOB}' in run ${RUN_ID} concluded '${JOB_CONCLUSION:-not found}', not 'success'."
  exit 1
fi

echo "✅ ${WORKFLOW_FILE} job '${REQUIRE_JOB}' succeeded for ${REF_NAME}@${HEAD_SHA} (run ${RUN_ID})."
