#!/bin/bash -e
#
# cSpell:ignore opentelemetrybot

GH=gh
GIT=git

if [[ -n "$GITHUB_ACTIONS" ]]; then
  # Ensure that we're starting from a clean state
  git reset --hard origin/main
elif [[ "$1" != "-f" ]]; then
  # Do a dry-run when script it executed locally, unless the
  # force flag is specified (-f).
  echo "Doing a dry-run when run locally. Use -f as the first argument to force execution."
  GH="echo > DRY RUN: gh "
  GIT="echo > DRY RUN: git "
else
  # Local execution with -f flag (force real vs. dry run)
  shift
fi

repo=$1; shift;

# `latest_version_full` is expected to end with a "vX.Y.Z". Note that it can
# have a prefix, such as `cmd/builder/v0.119.0`.
latest_version_full=$(gh api -q .tag_name "repos/open-telemetry/$repo/releases/latest")

# Extract only the semver:
latest_semver=$(echo "$latest_version_full" | sed -E 's/.*v([0-9]+\.[0-9]+\.[0-9]+.*)$/\1/')
latest_version="v$latest_semver"

echo "REPO:            $repo"
echo "LATEST VERSION:  $latest_semver ($latest_version_full)"

function process_file() {
  local name="$1"
  local file_path="$2"

  if [[ -z "$file_path" ]]; then
      echo "ERROR: Missing name or file path for processing." >&2
      return 1
  fi

  # Version line regex `vers_match_regex` to match version specifier -- works under Linux and macOS.
  if [[ $file_name == ".gitmodules" ]]; then
    vers_match_regex="$variable_name-pin ="
    vers="$latest_version"
  else
    vers_match_regex="^ *$variable_name:"
    vers="$latest_semver"
  fi
  echo "SEARCHING for:   '$vers_match_regex' in $file_name"
  if ! grep -q "$vers_match_regex" "$file_name"; then
    echo "Could not find regex \"$vers_match_regex\" in $file_name. Aborting."
    exit 1
  fi
  current_version=$(grep "$vers_match_regex" "$file_name")
  echo "CURRENT VERSION: $current_version"

  (set -x; sed -i.bak -e "s/\($vers_match_regex\) .*/\1 $vers/" "$file_name")

  if [[ -e "$file_name".bak ]]; then
    rm "$file_name".bak
  fi
}

while [[ $# -gt 0 ]]; do
  variable_name=$1; shift;
  file_name=$1; shift;
  process_file $variable_name $file_name
done

if git diff --quiet "${file_names[@]}"; then
  echo "Already at the latest version. Exiting"
  exit 0
else
  echo
  echo "Version update necessary:"
  git diff --color "${file_names[@]}" | cat - # to disable pager
  echo
fi

message="Update $repo version to $latest_version"
body="Update $repo version to \`$latest_version\`.

See https://github.com/open-telemetry/$repo/releases/tag/$latest_version."
branch="opentelemetrybot/auto-update-$repo-$latest_version"

echo "Looking for existing PRs with branch '$branch'."
existing_pr_all=$(gh pr list --state all --head "$branch")
# `gh pr list` a list of PRs, each line starting with a PR number if there's a
# match. Otherwise returns "no ... matches". Test for PR number:
if [[ "$existing_pr_all" =~ ^[0-9] ]]; then
    echo "PR(s) already exist for '$message':"
    echo $existing_pr_all
    echo "So we won't create another. Exiting."
    exit 0
else
  echo "None found."
fi

if [[ "$repo" == "opentelemetry-specification"
  || "$repo" == "opentelemetry-proto"
  || "$repo" == "semantic-conventions" ]]; then
  echo "Switching to $repo at tag $latest_version"
  ( set -x;
    npm run get:submodule -- content-modules/$repo &&
    cd content-modules/$repo &&
    git fetch &&
    git switch --detach $latest_version
  )
fi

$GIT checkout -b "$branch"
$GIT commit -a -m "$message"
$GIT push --set-upstream origin "$branch"

echo "Submitting auto-update PR '$message'."
$GH pr create --title "$message" --body "$body"
