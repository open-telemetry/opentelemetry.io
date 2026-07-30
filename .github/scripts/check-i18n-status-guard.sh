#!/usr/bin/env bash
#
# Scoped drift-state guard (I18N check): each localized page changed by a PR
# must leave the PR with an accurate drift state — synced (pin current, status
# cleared) or explicitly marked drifted. Runs the drift-status writer over the
# changed pages only and fails when it changes anything; tree-wide status syncs
# belong to the nightly Housekeeping run. Policy:
# https://opentelemetry.io/docs/contributing/localization/#drift-status
#
# Usage: check-i18n-status-guard.sh [BASE_REF]   (default: origin/main)
set -euo pipefail
cd "$(dirname "$0")/../.."

base=$(git merge-base "${1:-origin/main}" HEAD)

# Changed non-EN pages; deletions excluded (nothing left to carry a status),
# renames surfaced as additions so the new path is guarded.
changed_pages=$(git diff --name-only --no-renames --diff-filter=d "$base" -- content/ |
  grep -v '^content/en/' | grep '\.md$' || true)

if [[ -z $changed_pages ]]; then
  echo "No localized pages changed; drift-state guard has nothing to check."
  exit 0
fi

# shellcheck disable=SC2086 # content paths contain no spaces
node scripts/i18n/drift.mjs status --write -- $changed_pages

if git diff --quiet; then
  echo "Every changed localized page leaves an accurate drift state. <3"
  exit 0
fi

git diff
cat <<EOS
---
Each localized page changed by this PR must leave the PR with an accurate
drift state; the diff above shows the corrections needed. Either sync a page
with its English counterpart and refresh its pin,

    npm run check:i18n -- commit HEAD PATHS

or record the remaining drift,

    npm run fix:i18n:status -- PATHS

then commit the result. For details, see
https://opentelemetry.io/docs/contributing/localization/#drift-status
EOS
exit 1
