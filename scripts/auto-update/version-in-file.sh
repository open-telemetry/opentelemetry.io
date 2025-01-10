#!/bin/bash -e

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
latest_version=$(gh api -q .tag_name "repos/open-telemetry/$repo/releases/latest")
latest_vers_no_v="${latest_version#v}" # Remove leading 'v'

echo "REPO:            $repo"
echo "LATEST VERSION:  $latest_version"

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
    vers="$latest_vers_no_v"
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
  git diff "${file_names[@]}"
  echo
fi

message="Update $repo version to $latest_version"
body="Update $repo version to \`$latest_version\`.

See https://github.com/open-telemetry/$repo/releases/tag/$latest_version."

existing_pr_count=$(gh pr list --state all --search "in:title $message" | wc -l)
if [ "$existing_pr_count" -gt 0 ]; then
    echo "PR(s) already exist for '$message'"
    gh pr list --state all --search "\"$message\" in:title"
    echo "So we won't create another. Exiting."
    exit 0
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

branch="opentelemetrybot/auto-update-$repo-$latest_version"

$GIT checkout -b "$branch"
$GIT commit -a -m "$message"
$GIT push --set-upstream origin "$branch"

echo "Submitting auto-update PR '$message'."
$GH pr create --title "$message" --body "$body"
