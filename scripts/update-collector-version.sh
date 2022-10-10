#!/bin/bash
# this uses a lot of the code that already exists in
# https://github.com/grafana/opentelemetry-collector-components/blob/main/scripts/update-to-latest-otelcol.sh

REPO_DIR="$( cd "$(dirname $( dirname "${BASH_SOURCE[0]}" ))" &> /dev/null && pwd )"

command -v gh 2>/dev/null
if [ $? != 0 ]; then
    echo "The command 'gh' is expected to exist and be configured in order to update to the latest otelcol."
    exit 1
fi

command -v jq 2>/dev/null
if [ $? != 0 ]; then
    echo "The command 'jq' is expected to exist."
    exit 1
fi

while getopts d:c: flag
do
    case "${flag}" in
        d) directory=${OPTARG};;
        c) create_pr=${OPTARG};;
    esac
done

if [[ -z $directory ]]; then
    directory=$(mktemp -d)
    echo "Directory containing the release JSON files not provided. Created '${directory}' to host the latest from GitHub."
    gh api -H "Accept: application/vnd.github+json" /repos/open-telemetry/opentelemetry-collector/releases/latest > "${directory}/latest-core.json"
    gh api -H "Accept: application/vnd.github+json" /repos/open-telemetry/opentelemetry-collector-contrib/releases/latest > "${directory}/latest-contrib.json"
fi

# get the latest tag, without the "v" prefix
latest_core_version=$(jq -r .tag_name "${directory}/latest-core.json" | sed 's/^v//')
latest_contrib_version=$(jq -r .tag_name "${directory}/latest-contrib.json" | sed 's/^v//')

# here we don't like having different versions, so we skip creating the PR if contrib & core are not equal
if [ $latest_core_version != $latest_contrib_version ]; then
    echo "The contrib and core versions aren't matching. This might be OK, but perhaps there's a release in process?"
    exit -1
fi

branch="auto-update/collector_version_${latest_core_version}"

# git checkout -b "${branch}" main

gettingStartedFile=${REPO_DIR}/content/en/docs/collector/getting-started.md

# sed -i "s/collectorVersion:.*/collectorVersion: ${latest_core_version}/" ${gettingStartedFile}

git diff --quiet ${gettingStartedFile}
if [[ $? == 0 ]]; then
    echo "We are already at the latest versions."
    exit 0
fi

git add ${gettingStartedFile}

git commit -sm "Bump OpenTelemetry collector version to ${latest_core_version}"
git push --set-upstream origin "${branch}"

echo "Creating the pull request on your behalf."
gh pr create -l auto-update,sig:collector --title  "Bump collector version to ${latest_core_version}" --body "Use OpenTelemetry collector v${latest_core_version} in the collector getting started."