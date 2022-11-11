#!/bin/bash -e
# this uses a lot of the code that already exists in
# https://github.com/grafana/opentelemetry-collector-components/blob/main/scripts/update-to-latest-otelcol.sh

REPO_DIR="$( cd "$(dirname $( dirname "${BASH_SOURCE[0]}" ))" &> /dev/null && pwd )"

if ! command -v gh &>/dev/null; then
    echo "The command 'gh' is expected to exist and be configured in order to update to the latest otelcol."
    exit 1
fi

# get the latest tag, without the "v" prefix
latest_core_version=$(gh api -q .tag_name repos/open-telemetry/opentelemetry-collector/releases/latest | sed 's/^v//')
latest_contrib_version=$(gh api -q .tag_name repos/open-telemetry/opentelemetry-collector-contrib/releases/latest | sed 's/^v//')

# here we don't like having different versions, so we skip creating the PR if contrib & core are not equal
if [ $latest_core_version != $latest_contrib_version ]; then
    echo "The contrib and core versions aren't matching. This might be OK, but perhaps there's a release in process?"
    exit 1
fi

branch="opentelemetrybot/collector_version_${latest_core_version}"

git checkout -b "${branch}" main

gettingStartedFile=${REPO_DIR}/content/en/docs/collector/getting-started.md

sed -i "s/collectorVersion:.*/collectorVersion: ${latest_core_version}/" ${gettingStartedFile}

if git diff --quiet ${gettingStartedFile}; then
    echo "We are already at the latest versions."
    exit 0
fi

git add ${gettingStartedFile}

git commit -m "Bump OpenTelemetry collector version to ${latest_core_version}"
git push --set-upstream origin "${branch}"

echo "Creating the pull request on your behalf."
gh pr create --label auto-update,sig:collector \
             --title "Bump collector version to ${latest_core_version}" \
             --body "Use OpenTelemetry collector v${latest_core_version} in the collector getting started."
