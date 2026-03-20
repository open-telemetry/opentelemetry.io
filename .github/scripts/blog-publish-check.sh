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
# Batch check for blog/announcement PRs ready to publish.
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
PUBLISH_DATE_LABELS=("blog" "announcements")

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ -z "${REPO:-}" ]]; then
  echo "ERROR: REPO environment variable must be set."
  exit 1
fi

echo "Running blog publish check in batch mode."
echo "Fetching open PRs with labels: ${PUBLISH_DATE_LABELS[*]}"

all_prs=""
for label in "${PUBLISH_DATE_LABELS[@]}"; do
  prs=$(gh pr list \
    --repo "${REPO}" \
    --label "${label}" \
    --state open \
    --json number \
    --jq '.[].number' 2>/dev/null || true)
  all_prs="${all_prs} ${prs}"
done

pr_nums=$(echo "${all_prs}" | tr ' ' '\n' | sort -un | grep -v '^$' || true)

if [[ -z "${pr_nums}" ]]; then
  echo "No open PRs found with labels: ${PUBLISH_DATE_LABELS[*]}"
  exit 0
fi

echo "Found PRs: ${pr_nums}"
while IFS= read -r pr_num; do
  [[ -z "${pr_num}" ]] && continue
  echo ""
  echo "--- Processing PR #${pr_num} ---"
  PR="${pr_num}" "${SCRIPT_DIR}/pr-approval-labels.sh" \
    || echo "WARNING: Failed for PR #${pr_num}"
done <<< "${pr_nums}"
