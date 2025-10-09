#!/bin/bash
# Script to create a GitHub issue for 404 URLs found in refcache.json

# Check if gh CLI is authenticated
if ! gh auth status &>/dev/null; then
    echo "Error: gh CLI is not authenticated. Please run 'gh auth login' first."
    exit 1
fi

# Create the issue
gh issue create \
    --title "404 URLs found in refcache.json (from PR #8043)" \
    --body-file ISSUE_404_URLS.md \
    --label "bug,documentation" \
    --repo open-telemetry/opentelemetry.io

echo "Issue created successfully!"
