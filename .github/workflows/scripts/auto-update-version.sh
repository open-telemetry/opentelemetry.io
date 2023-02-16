#!/bin/bash -e

repo=$1
variable_name=$2
file_names=("${@:3}") # remaining args

latest_version=$(gh api -q .tag_name "repos/open-telemetry/$repo/releases/latest" | sed 's/^v//')

echo "Repo: $repo"
echo "Latest version: $latest_version"

for file_name in "${file_names[@]}"
do
  sed -i -e "s/$variable_name: .*/$variable_name: $latest_version/" "$file_name"
done

if git diff --quiet; then
  echo "Already at the latest version."
  exit 0
fi

message="Update $repo version to $latest_version"
body="Update $repo version to \`$latest_version\`."

existing_pr_count=$(gh pr list --state all --search "in:title $message" | wc -l)
if [ "$existing_pr_count" -gt 0 ]; then
    echo "PR(s) for version $latest_version of $repo already exist:"
    gh pr list --state all --search "in:title $message"
    echo "So we won't create another. Exiting."
    exit 0
fi

branch="opentelemetrybot/auto-update-$repo-$latest_version"

git checkout -b "$branch"
git commit -a -m "$message"
git push --set-upstream origin "$branch"

echo "Submitting auto-update PR '$message'."
gh pr create --label auto-update \
             --title "$message" \
             --body "$body"
