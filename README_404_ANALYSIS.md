# 404 URLs Analysis from PR #8043

## Overview

This directory contains the analysis of 404 URLs found in `static/refcache.json` from PR #8043, along with verified replacement URLs.

## Files

### 1. `ISSUE_404_URLS.md`
Complete issue description in markdown format, ready to be posted as a GitHub issue. Contains:
- List of all 404 URLs
- Context for each URL
- Verified replacement URLs with recommendations
- Summary and next steps

### 2. `404_urls_data.json`
Machine-readable JSON format containing:
- All 404 URLs
- Status codes
- Context information
- Replacement URLs with verification status
- Recommendation flags

### 3. `create_404_issue.sh`
Bash script to automatically create the GitHub issue using the `gh` CLI tool.

## How to Create the Issue

### Option 1: Using the gh CLI (Recommended)

If you have the `gh` CLI installed and authenticated:

```bash
./create_404_issue.sh
```

Or manually:

```bash
gh issue create \
    --title "404 URLs found in refcache.json (from PR #8043)" \
    --body-file ISSUE_404_URLS.md \
    --label "bug,documentation" \
    --repo open-telemetry/opentelemetry.io
```

### Option 2: Manual Creation

1. Go to https://github.com/open-telemetry/opentelemetry.io/issues/new
2. Copy the content from `ISSUE_404_URLS.md`
3. Paste it as the issue body
4. Set title to: "404 URLs found in refcache.json (from PR #8043)"
5. Add labels: `bug`, `documentation`
6. Submit

### Option 3: Using the GitHub API

```bash
gh api /repos/open-telemetry/opentelemetry.io/issues \
  --method POST \
  --field title="404 URLs found in refcache.json (from PR #8043)" \
  --field body="$(cat ISSUE_404_URLS.md)" \
  --field labels[]="bug" \
  --field labels[]="documentation"
```

## Summary of Findings

**Total 404 URLs found:** 3

1. **Ubuntu 20.04 Runner Images** - EOL, last valid commit or replaced with Ubuntu 22.04 or 24.04
2. **OpenTelemetry JS Contrib Node Detectors** - Moved to `/packages/` directory
3. **OpenTelemetry JS Contrib Express Instrumentation** - Moved from `/plugins/node/` to `/packages/`

All replacement URLs have been verified as working (HTTP 200 status).

## Next Steps After Issue Creation

1. Update documentation references to use the new URLs
2. The `static/refcache.json` will be automatically updated on the next cache refresh
3. Consider updating any other references to the old URLs in:
   - `content/ja/docs/languages/js/resources.md`
   - `content/fr/docs/zero-code/js/configuration.md`
   - `content/ja/docs/languages/js/libraries.md`

## Methodology

The analysis was performed by:
1. Comparing PR #8043 changes to `static/refcache.json`
2. Identifying URLs that changed from non-404 to 404 status
3. Researching the reason for each 404
4. Finding and verifying replacement URLs using HTTP requests
5. Documenting context and recommendations

All replacement URLs were verified as working before being included in this report.
