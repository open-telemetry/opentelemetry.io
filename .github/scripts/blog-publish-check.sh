#!/usr/bin/env bash
#
# Copyright The OpenTelemetry Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Batch check for blog PRs ready to publish.
#
# Queries all open PRs carrying any of the PUBLISH_DATE_LABELS and runs
# pr-approval-labels.sh for each one. PRs that transition to
# ready-to-be-merged are written to LABELED_PRS_OUTPUT_FILE (if set) for
# downstream Slack notification.
#
# Required environment variables:
#   GITHUB_TOKEN  - GitHub token with repo read access
#   REPO          - Repository in "owner/repo" format
#
# Optional environment variables:
#   LABELED_PRS_OUTPUT_FILE - Path to write newly-labeled PR metadata (JSONL)

set -euo pipefail

# Labels that indicate a PR may contain content with a publish date.
# Set via the PUBLISH_DATE_LABELS environment variable (space-separated list).
if [[ -z "${PUBLISH_DATE_LABELS:-}" ]]; then
  echo "ERROR: PUBLISH_DATE_LABELS environment variable must be set."
  exit 1
fi
read -ra _PUBLISH_DATE_LABELS <<< "${PUBLISH_DATE_LABELS}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ -z "${REPO:-}" ]]; then
  echo "ERROR: REPO environment variable must be set."
  exit 1
fi

# ---------------------------------------------------------------------------
# Rate-limit awareness: pause if close to exhausting the GitHub API budget.
# ---------------------------------------------------------------------------
check_rate_limit() {
  local remaining
  remaining=$(gh api /rate_limit --jq '.resources.core.remaining' 2>/dev/null || echo "unknown")
  if [[ "${remaining}" == "unknown" ]]; then
    return 0
  fi
  if (( remaining < 100 )); then
    local reset_at
    reset_at=$(gh api /rate_limit --jq '.resources.core.reset' 2>/dev/null || echo "0")
    local now
    now=$(date +%s)
    local wait_secs=$(( reset_at - now + 5 ))
    if (( wait_secs > 0 && wait_secs < 3600 )); then
      echo "::warning::API rate limit low (${remaining} remaining). Waiting ${wait_secs}s for reset."
      sleep "${wait_secs}"
    fi
  fi
}

# Set up a shared cache directory for team membership lookups so that
# pr-approval-labels.sh can reuse results across PRs in the batch.
TEAM_CACHE_DIR=$(mktemp -d)
export TEAM_CACHE_DIR
trap 'rm -rf "${TEAM_CACHE_DIR}"' EXIT

echo "Running blog publish check in batch mode."
echo "Fetching open PRs with labels: ${_PUBLISH_DATE_LABELS[*]}"

all_prs=""
for label in "${_PUBLISH_DATE_LABELS[@]}"; do
  if ! prs=$(gh pr list \
    --repo "${REPO}" \
    --label "${label}" \
    --state open \
    --json number \
    --jq '.[].number' 2>&1); then
    echo "::warning::Failed to list PRs with label '${label}': ${prs}"
    prs=""
  fi
  all_prs="${all_prs} ${prs}"
done

pr_nums=$(echo "${all_prs}" | tr ' ' '\n' | sort -un | grep -v '^$' || true)

if [[ -z "${pr_nums}" ]]; then
  echo "No open PRs found with labels: ${_PUBLISH_DATE_LABELS[*]}"
  exit 0
fi

echo "Found PRs: ${pr_nums}"
while IFS= read -r pr_num; do
  [[ -z "${pr_num}" ]] && continue
  check_rate_limit
  echo ""
  echo "--- Processing PR #${pr_num} ---"
  PR="${pr_num}" "${SCRIPT_DIR}/pr-approval-labels.sh" \
    || echo "::warning::Failed to process PR #${pr_num}"
done <<< "${pr_nums}"
