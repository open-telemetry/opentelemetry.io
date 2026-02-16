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
# Automatically manages PR approval labels:
#   - missing:docs-approval  -> when docs-approvers approval is pending
#   - missing:sig-approval   -> when SIG approval is pending
#   - ready-to-be-merged     -> when all required approvals are present

set -euo pipefail

LABEL_DOCS_MISSING="missing:docs-approval"
LABEL_SIG_MISSING="missing:sig-approval"
LABEL_READY="ready-to-be-merged"

DOCS_APPROVERS_TEAM="docs-approvers"
DOCS_MAINTAINERS_TEAM="docs-maintainers"
COMPONENT_OWNERS_FILE=".github/component-owners.yml"
ORG="open-telemetry"

if [[ -z "${REPO:-}" || -z "${PR:-}" ]]; then
  echo "ERROR: REPO and PR environment variables must be set."
  exit 0
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

# ===========================================================================
# Main
# ===========================================================================
main() {
  echo "Checking approval labels for PR #${PR} in ${REPO}..."

  # Fetch PR data
  local pr_json
  pr_json=$(gh pr view "${PR}" --repo "${REPO}" --json "files,latestReviews,labels")

  local pr_files
  pr_files=$(echo "${pr_json}" | jq -r '.files[].path')

  local latest_reviews
  latest_reviews=$(echo "${pr_json}" | jq -c '.latestReviews')

  CURRENT_LABELS=$(echo "${pr_json}" | jq -r '.labels[].name')

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
  # 3. Apply / remove labels
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

  if [[ "${all_approved}" == "true" ]]; then
    add_label "${LABEL_READY}"
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
