#!/bin/bash
set -euo pipefail

echo "Merged PR head branch: $BRANCH"

# Exclude exact names
case "$BRANCH" in
  main|staging|production)
    echo "Excluded protected branch: $BRANCH — not deleting."
    exit 0
    ;;
esac

# Example: exclude branches matching patterns (uncomment if needed)
# if [[ "$BRANCH" =~ ^(release/|hotfix/|protected-) ]]; then
#   echo "Branch matches excluded pattern; not deleting."
#   exit 0
# fi

# Delete the remote branch via GitHub REST API
resp=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$OWNER/$REPO/git/refs/heads/$BRANCH")

if [ "$resp" = "204" ]; then
  echo "Deleted branch $BRANCH"
elif [ "$resp" = "422" ]; then
  echo "Could not delete branch (maybe protected or already deleted). HTTP $resp"
  exit 0
else
  echo "Unexpected response: HTTP $resp"
  exit 1
fi
