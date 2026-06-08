#!/usr/bin/env bash
#
# Manual smoke test for the locale-auto-merge CLI.
#
# Runs the CLI in --dry-run mode (no mutations) against real PRs so you can
# eyeball the end-to-end verdicts, including the locale-team authorization gate.
# Use --user to test the verdict *as if* a given user had commented.
#
# Dry run is the default locally, but this script passes --dry-run explicitly so
# it stays read-only even under GitHub Actions.
#
# The seeded PR numbers go stale as PRs merge/close; override them via env:
#   ELIGIBLE_PR=123 INELIGIBLE_PR=456 USER_LOGIN=some-login ./smoke-test.sh
#
# Swap `--dry-run` for `--no-dry-run` to actually enable auto-merge (needs a
# sufficiently privileged token; the workflow uses the DOCS bot).

set -euo pipefail

cd "$(dirname "$0")/../../.." # repo root, so `gh` and discoverLocales() resolve

cli=(node scripts/gh/locale-auto-merge/cli.mjs --dry-run)

# A PR whose changes are confined to locale-owned files (eligible).
eligible_pr="${ELIGIBLE_PR:-10094}"
# A PR that also touches files outside any locale (ineligible).
ineligible_pr="${INELIGIBLE_PR:-10235}"
# Impersonate this user for the authorization check (default: the gh user).
author_args=()
if [[ -n "${USER_LOGIN:-}" ]]; then author_args=(--user "$USER_LOGIN"); fi

echo "## enable on an eligible locale PR (#${eligible_pr})"
"${cli[@]}" --pr "${eligible_pr}" --enable "${author_args[@]}"

echo
echo "## disable on the same PR (#${eligible_pr})"
"${cli[@]}" --pr "${eligible_pr}" --disable "${author_args[@]}"

echo
echo "## enable on an ineligible PR (#${ineligible_pr}) -> expected to exit 1"
"${cli[@]}" --pr "${ineligible_pr}" --enable "${author_args[@]}" ||
  echo "(non-zero exit, as expected for an ineligible PR)"
