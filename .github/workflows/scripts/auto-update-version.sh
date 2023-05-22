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

repo=$1
variable_name=$2
file_names=("${@:3}") # remaining args

latest_version=$(gh api -q .tag_name "repos/open-telemetry/$repo/releases/latest" | sed 's/^v//')

echo "REPO:            $repo"
echo "LATEST VERSION:  $latest_version"

# Version line regex, to match entire line -- works under Linux and macOS:
vers_match_regex="^ *$variable_name:"

for file_name in "${file_names[@]}"
do
  echo "SEARCHING for:   '$vers_match_regex' in $file_name"
  if ! grep -q "$vers_match_regex" "$file_name"; then
    echo "Could not find regex \"$vers_match_regex\" in $file_name. Aborting."
    exit 1
  fi
  current_version=$(grep "$vers_match_regex" "$file_name")
  echo "CURRENT VERSION: $current_version"

  (set -x; sed -i.bak -e "s/\($vers_match_regex\) .*/\1 $latest_version/" "$file_name")

  if [[ -e "$file_name".bak ]]; then
    rm "$file_name".bak
  fi
done

if git diff --quiet $file_names; then
  echo "Already at the latest version. Exiting"
  exit 0
else
  echo
  echo "Version update necessary:"
  git diff $file_names
  echo
fi

message="Update $repo version to $latest_version"
body="Update $repo version to \`$latest_version\`.

See https://github.com/open-telemetry/$repo/releases/tag/v$latest_version."

existing_pr_count=$(gh pr list --state all --search "in:title $message" | wc -l)
if [ "$existing_pr_count" -gt 0 ]; then
    echo "PR(s) for version $latest_version of $repo already exist:"
    gh pr list --state all --search "in:title $message"
    echo "So we won't create another. Exiting."
    exit 0
fi

if [[ "$repo" == "opentelemetry-specification" ]]; then
  echo "Switching to $repo at tag v$latest_version"
  ( set -x;
    npm run get:submodule -- content-modules/opentelemetry-specification &&
    cd content-modules/opentelemetry-specification &&
    git fetch &&
    git switch --detach v$latest_version
  )
fi

branch="opentelemetrybot/auto-update-$repo-$latest_version"

$GIT checkout -b "$branch"
$GIT commit -a -m "$message"
$GIT push --set-upstream origin "$branch"

echo "Submitting auto-update PR '$message'."
$GH pr create --label auto-update \
             --title "$message" \
             --body "$body"
