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
# Manages PR approval labels for a single PR:
#   - missing:docs-approval  -> when docs-approvers approval is pending
#   - missing:sig-approval   -> when SIG approval is pending
#   - ready-to-be-merged     -> when all required approvals are present
#
# Required environment variables:
#   GITHUB_TOKEN  - GitHub token with repo/org read access
#   REPO          - Repository in "owner/repo" format
#   PR            - Pull request number to process
#
# Optional environment variables:
#   LABELED_PRS_OUTPUT_FILE - Path to append newly-labeled PR metadata (JSONL)

set -euo pipefail

LABEL_DOCS_MISSING="missing:docs-approval"
LABEL_SIG_MISSING="missing:sig-approval"
LABEL_READY="ready-to-be-merged"

DOCS_APPROVERS_TEAM="docs-approvers"
DOCS_MAINTAINERS_TEAM="docs-maintainers"
COMPONENT_OWNERS_FILE=".github/component-owners.yml"
ORG="open-telemetry"

# Labels that indicate a PR may contain content with a publish date in its
# frontmatter. Set via the PUBLISH_DATE_LABELS environment variable (space-
# separated list) in the workflow YAML. Falls back gracefully if unset.
if [[ -z "${PUBLISH_DATE_LABELS:-}" ]]; then
  echo "WARNING: PUBLISH_DATE_LABELS not set. Skipping publish date checks."
  _PUBLISH_DATE_LABELS=()
else
  read -ra _PUBLISH_DATE_LABELS <<< "${PUBLISH_DATE_LABELS}"
fi

if [[ -z "${REPO:-}" ]]; then
  echo "ERROR: REPO environment variable must be set."
  exit 1
fi

if [[ -z "${PR:-}" ]]; then
  echo "ERROR: PR environment variable must be set."
  exit 1
fi

# ---------------------------------------------------------------------------
# Helper: add a label if not already present
# ---------------------------------------------------------------------------
add_label() {
  local label="$1"
  if echo "${CURRENT_LABELS}" | grep -qxF "${label}"; then
    echo "Label '${label}' already present."
  else
    echo "Adding label '${label}'."
    gh pr edit "${PR}" --repo "${REPO}" --add-label "${label}"
  fi
}

# ---------------------------------------------------------------------------
# Helper: remove a label if present
# ---------------------------------------------------------------------------
remove_label() {
  local label="$1"
  if echo "${CURRENT_LABELS}" | grep -qxF "${label}"; then
    echo "Removing label '${label}'."
    gh pr edit "${PR}" --repo "${REPO}" --remove-label "${label}"
  else
    echo "Label '${label}' not present, nothing to remove."
  fi
}

# ---------------------------------------------------------------------------
# Fetch team members for a given team slug (e.g. "docs-approvers").
# Returns newline-separated list of GitHub usernames (lowercased).
# ---------------------------------------------------------------------------
get_team_members() {
  local team_slug="$1"
  gh api \
    --paginate \
    "/orgs/${ORG}/teams/${team_slug}/members" \
    --jq '.[].login' 2>/dev/null | tr '[:upper:]' '[:lower:]' || true
}

# ---------------------------------------------------------------------------
# Parse component-owners.yml to find SIG teams for the given PR files.
# Excludes docs-maintainers since that is not a SIG team.
#
# Reads the YAML manually (no yq dependency) -- the format is simple enough:
#   components:
#     path/to/component:
#       - open-telemetry/team-name
#
# Outputs unique team slugs (without the org prefix), one per line.
# ---------------------------------------------------------------------------
get_sig_teams_for_files() {
  local pr_files="$1"
  local sig_teams=""

  local current_component=""
  local current_teams=""

  while IFS= read -r line; do
    # Skip blank lines and comments
    [[ -z "${line}" || "${line}" =~ ^[[:space:]]*# ]] && continue

    # Match a component path line (e.g. "  content/en/docs/languages/go:")
    if [[ "${line}" =~ ^[[:space:]]+([^[:space:]-][^:]+):[[:space:]]*$ ]]; then
      # Before moving to new component, process the previous one
      if [[ -n "${current_component}" && -n "${current_teams}" ]]; then
        for file in ${pr_files}; do
          if [[ "${file}" == "${current_component}"/* || "${file}" == "${current_component}" ]]; then
            sig_teams="${sig_teams} ${current_teams}"
            break
          fi
        done
      fi
      current_component="${BASH_REMATCH[1]}"
      current_teams=""
      continue
    fi

    # Match a team entry (e.g. "    - open-telemetry/go-approvers")
    if [[ "${line}" =~ ^[[:space:]]*-[[:space:]]+(open-telemetry/)(.+)[[:space:]]*$ ]]; then
      local team_slug="${BASH_REMATCH[2]}"
      # Skip docs-maintainers -- they are not a SIG team
      if [[ "${team_slug}" != "${DOCS_MAINTAINERS_TEAM}" ]]; then
        current_teams="${current_teams} ${team_slug}"
      fi
    fi
  done < "${COMPONENT_OWNERS_FILE}"

  # Process the last component
  if [[ -n "${current_component}" && -n "${current_teams}" ]]; then
    for file in ${pr_files}; do
      if [[ "${file}" == "${current_component}"/* || "${file}" == "${current_component}" ]]; then
        sig_teams="${sig_teams} ${current_teams}"
        break
      fi
    done
  fi

  # Deduplicate and output
  echo "${sig_teams}" | tr ' ' '\n' | sort -u | grep -v '^$' || true
}

# ---------------------------------------------------------------------------
# Check if the PR has potentially a publish date in the frontmatter of 
# changed files.
# -------------------------------------------------------------------------
should_check_publish_date() {
  local label
  for label in "${_PUBLISH_DATE_LABELS[@]}"; do
    if echo "${CURRENT_LABELS}" | grep -qxF "${label}"; then
      return 0
    fi
  done
  return 1
}

# ---------------------------------------------------------------------------
# Fetch the latest publish date (YYYY-MM-DD) from the 'date:' frontmatter
# field of all markdown files changed in the PR, commonly used on blog posts.
# Uses the GitHub API to read content from the PR head (handles fork PRs).
# Returns the latest date found, or empty string if none.
# ---------------------------------------------------------------------------
get_publish_date() {
  local pr_files="$1"
  local head_sha="$2"
  local latest_date=""

  for file in ${pr_files}; do
    # Only inspect markdown files in known content paths to avoid unnecessary
    # GitHub API calls, which can cause rate limiting in batch mode.
    if [[ ! "${file}" == *.md && ! "${file}" == *.mdx ]]; then
      continue
    fi
    # Restrict to paths that commonly contain publish dates in frontmatter.
    if [[ ! "${file}" == content/en/blog/* && ! "${file}" == content/en/announcements/* ]]; then
      continue
    fi
    # Skip any file path containing potentially unsafe characters to avoid
    # shell injection when constructing the GitHub API URL.
    if [[ ! "${file}" =~ ^[A-Za-z0-9._/-]+$ ]]; then
      echo "Skipping potentially unsafe file path: ${file}" >&2
      continue
    fi
    local content
    content=$(gh api "/repos/${REPO}/contents/${file}?ref=${head_sha}" \
      --jq '.content' 2>/dev/null | base64 --decode 2>/dev/null || true)
    [[ -z "${content}" ]] && continue

    local raw_date_line
    raw_date_line=$(echo "${content}" | grep -m 1 '^date:' || true)
    [[ -z "${raw_date_line}" ]] && continue

    # Strip the "date:" prefix.
    local file_date
    file_date=$(echo "${raw_date_line}" | sed 's/date:[[:space:]]*//')
    # Remove any inline comment starting with '#'.
    file_date=${file_date%%#*}
    # Remove surrounding quotes.
    file_date=$(echo "${file_date}" | tr -d "\"'")
    # Take the first whitespace-delimited token as the date.
    file_date=$(echo "${file_date}" | awk '{print $1}')
    # Ensure we only keep the first 10 characters (YYYY-MM-DD).
    file_date=${file_date:0:10}
    # Validate that the extracted string is a proper YYYY-MM-DD date.
    if [[ ! "${file_date}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
      continue
    fi

    echo "Found date '${file_date}' in ${file}" >&2
    if [[ -z "${latest_date}" || "${file_date}" > "${latest_date}" ]]; then
      latest_date="${file_date}"
    fi
  done

  echo "${latest_date}"
}

# ===========================================================================
# Main
# ===========================================================================
main() {
  echo "Checking approval labels for PR #${PR} in ${REPO}..."

  # Fetch PR data
  local pr_json
  pr_json=$(gh pr view "${PR}" --repo "${REPO}" \
    --json "files,latestReviews,labels,headRefOid,headRepository,title,url")

  local pr_files
  pr_files=$(echo "${pr_json}" | jq -r '.files[].path')

  local latest_reviews
  latest_reviews=$(echo "${pr_json}" | jq -c '.latestReviews')

  CURRENT_LABELS=$(echo "${pr_json}" | jq -r '.labels[].name')

  local head_sha
  head_sha=$(echo "${pr_json}" | jq -r '.headRefOid')
  local head_repo
  head_repo=$(echo "${pr_json}" | jq -r '.headRepository.nameWithOwner')

  # -------------------------------------------------------------------------
  # 1. Check docs approval
  # -------------------------------------------------------------------------
  echo ""
  echo "=== Checking docs approval ==="
  local docs_members
  docs_members=$(get_team_members "${DOCS_APPROVERS_TEAM}")

  local docs_approved=false
  if [[ -n "${docs_members}" ]]; then
    while IFS= read -r review; do
      local reviewer
      reviewer=$(echo "${review}" | jq -r '.author.login' | tr '[:upper:]' '[:lower:]')
      local state
      state=$(echo "${review}" | jq -r '.state')

      if [[ "${state}" == "APPROVED" ]]; then
        if echo "${docs_members}" | grep -qxF "${reviewer}"; then
          echo "Docs approval found from: ${reviewer}"
          docs_approved=true
          break
        fi
      fi
    done < <(echo "${latest_reviews}" | jq -c '.[]')
  else
    echo "WARNING: Could not fetch docs-approvers team members. Skipping docs approval check."
    # If we can't fetch team members, don't change labels
    docs_approved="unknown"
  fi

  # -------------------------------------------------------------------------
  # 2. Determine SIG teams and check SIG approval
  # -------------------------------------------------------------------------
  echo ""
  echo "=== Checking SIG approval ==="
  local sig_teams
  sig_teams=$(get_sig_teams_for_files "${pr_files}")

  local sig_needed=false
  local sig_approved=false

  if [[ -n "${sig_teams}" ]]; then
    sig_needed=true
    echo "SIG teams required for this PR: ${sig_teams}"

    # Collect all SIG team members
    local all_sig_members=""
    while IFS= read -r team_slug; do
      [[ -z "${team_slug}" ]] && continue
      local members
      members=$(get_team_members "${team_slug}")
      if [[ -n "${members}" ]]; then
        all_sig_members="${all_sig_members}
${members}"
      fi
    done <<< "${sig_teams}"

    all_sig_members=$(echo "${all_sig_members}" | sort -u | grep -v '^$' || true)

    if [[ -n "${all_sig_members}" ]]; then
      while IFS= read -r review; do
        local reviewer
        reviewer=$(echo "${review}" | jq -r '.author.login' | tr '[:upper:]' '[:lower:]')
        local state
        state=$(echo "${review}" | jq -r '.state')

        if [[ "${state}" == "APPROVED" ]]; then
          if echo "${all_sig_members}" | grep -qxF "${reviewer}"; then
            echo "SIG approval found from: ${reviewer}"
            sig_approved=true
            break
          fi
        fi
      done < <(echo "${latest_reviews}" | jq -c '.[]')
    else
      echo "WARNING: Could not fetch SIG team members. Skipping SIG approval check."
      sig_approved="unknown"
    fi
  else
    echo "No SIG-specific teams required for this PR."
  fi

  # -------------------------------------------------------------------------
  # 3. Check publish date, if applicable
  # -------------------------------------------------------------------------
  echo ""
  echo "=== Checking publish date ==="
  local publish_date_ready="true"

  if should_check_publish_date; then
    local publish_date
    publish_date=$(get_publish_date "${pr_files}" "${head_sha}")

    if [[ -n "${publish_date}" ]]; then
      local today
      today=$(date -u +%Y-%m-%d)
      echo "Publish date: ${publish_date}, today: ${today}"
      if [[ "${publish_date}" > "${today}" ]]; then
        echo "Publish date is in the future. Not labeling ready-to-be-merged."
        publish_date_ready="false"
      else
        echo "Publish date is today or past. Labeling ready-to-be-merged."
      fi
    else
      echo "No publish date found in changed files."
    fi
  else
    echo "PR does not have any of the '${_PUBLISH_DATE_LABELS[*]}' labels. Skipping date check."
  fi

  # -------------------------------------------------------------------------
  # 4. Apply / remove labels
  # -------------------------------------------------------------------------
  echo ""
  echo "=== Applying labels ==="

  # Docs approval label
  if [[ "${docs_approved}" == "true" ]]; then
    remove_label "${LABEL_DOCS_MISSING}"
  elif [[ "${docs_approved}" == "false" ]]; then
    add_label "${LABEL_DOCS_MISSING}"
  fi

  # SIG approval label
  if [[ "${sig_needed}" == "true" ]]; then
    if [[ "${sig_approved}" == "true" ]]; then
      remove_label "${LABEL_SIG_MISSING}"
    elif [[ "${sig_approved}" == "false" ]]; then
      add_label "${LABEL_SIG_MISSING}"
    fi
  else
    # No SIG component touched -- remove the SIG label if it was there
    remove_label "${LABEL_SIG_MISSING}"
  fi

  # Ready-to-be-merged label
  # Use a tri-state value to avoid changing the label when approval state is unknown.
  local all_approved="unknown"
  if [[ "${sig_needed}" == "true" ]]; then
    if [[ "${docs_approved}" == "true" && "${sig_approved}" == "true" ]]; then
      all_approved="true"
    elif [[ "${docs_approved}" == "false" || "${sig_approved}" == "false" ]]; then
      all_approved="false"
    fi
  else
    if [[ "${docs_approved}" == "true" ]]; then
      all_approved="true"
    elif [[ "${docs_approved}" == "false" ]]; then
      all_approved="false"
    fi
  fi

  # Do not label ready-to-be-merged if publish date is in the future
  if [[ "${all_approved}" == "true" && "${publish_date_ready}" == "false" ]]; then
    all_approved="false"
  fi

  if [[ "${all_approved}" == "true" ]]; then
    local was_ready_before="false"
    if echo "${CURRENT_LABELS}" | grep -qxF "${LABEL_READY}"; then
      was_ready_before="true"
    fi
    add_label "${LABEL_READY}"
    if [[ "${was_ready_before}" == "false" && -n "${LABELED_PRS_OUTPUT_FILE:-}" ]]; then
      echo "${pr_json}" | jq -c --argjson number "${PR}" '{number: $number, title, url}' \
        >> "${LABELED_PRS_OUTPUT_FILE}"
    fi
  elif [[ "${all_approved}" == "false" ]]; then
    remove_label "${LABEL_READY}"
  else
    echo "Skipping ${LABEL_READY} label update due to unknown approval status."
  fi

  echo ""
  echo "Done."
}

# Ensure the script does not block a PR even if it fails
main || echo "Failed to run $0"
