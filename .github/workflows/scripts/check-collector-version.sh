#!/bin/bash -e
# this uses a lot of the code that already exists in
# https://github.com/grafana/opentelemetry-collector-components/blob/main/scripts/update-to-latest-otelcol.sh

REPO_DIR=$(realpath $(dirname $0)/../../..)

if ! command -v gh &>/dev/null; then
    echo "The command 'gh' is expected to exist and be configured in order to update to the latest otelcol."
    exit 1
fi

# get the latest tag, without the "v" prefix
latest_version=$(gh api -q .tag_name repos/open-telemetry/opentelemetry-collector-releases/releases/latest | sed 's/^v//')

branch="opentelemetrybot/collector_version_${latest_version}_r${RANDOM}"

# While developing the workflow this will map to the dev branch, will map to "main" when in production
base_branch=$(git rev-parse --abbrev-ref HEAD)

git checkout -b "${branch}" "${base_branch}"

gettingStartedFile=${REPO_DIR}/content/en/docs/collector/getting-started.md

sed -i "s/collectorVersion:.*/collectorVersion: ${latest_version}/" ${gettingStartedFile}

if git diff --quiet ${gettingStartedFile}; then
    echo "We are already at the latest versions."
    exit 0
fi

git add ${gettingStartedFile}

git commit -m "Bump OpenTelemetry collector version to ${latest_version}"
git push --set-upstream origin "${branch}"

echo "Creating the pull request on your behalf."
gh pr create --label auto-update,sig:collector \
             --title "Bump collector version to ${latest_version}" \
             --body "Use OpenTelemetry collector v${latest_version} in the collector getting started."
