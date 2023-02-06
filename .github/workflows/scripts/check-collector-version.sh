#!/bin/bash -e
#
# Use `--dry-run` to perform a dry run of `gh` and `git` commands that might change your environment.
# Set env var `latest_version`` to force a specific version (or for testing purposes).
#
# This uses a lot of the code from:
# https://github.com/grafana/opentelemetry-collector-components/blob/main/scripts/update-to-latest-otelcol.sh

GH=gh
GIT=git
REALPATH=realpath
BACKUP_EXT=.bak

if [[ $OSTYPE == 'darwin'* ]]; then
  REALPATH=echo
fi

if [[ "$1" == "--dry-run" ]]; then
  echo Doing a dry run.
  GH="echo > DRY RUN: gh "
  GIT="echo > DRY RUN: git "
fi

REPO_DIR=$($REALPATH $(dirname $0)/../../..)

if ! command -v gh &>/dev/null; then
    echo "Command 'gh' not found, but is required by this script. Exiting."
    exit 1
fi

# Get the latest tag, without the "v" prefix
: ${latest_version:=$(gh api -q .tag_name repos/open-telemetry/opentelemetry-collector-releases/releases/latest | sed 's/^v//')}

echo "Latest version: $latest_version"

fileWithVersInfo=${REPO_DIR}/content/en/docs/collector/_index.md

sed -i$BACKUP_EXT -e "s/collectorVersion:.*/collectorVersion: $latest_version/" $fileWithVersInfo

if [[ -e $fileWithVersInfo$BACKUP_EXT ]]; then
  rm $fileWithVersInfo$BACKUP_EXT
fi

if git diff --quiet ${fileWithVersInfo}; then
    echo "We are already at the latest version."
    exit 0
else
  echo "Version update necessary:"
  git diff ${fileWithVersInfo}
  echo
fi

pr_title="Bump collector version to ${latest_version}"
existing_pr_count=$(gh pr list -s all -S "in:title ${pr_title}" | wc -l)
if [ $existing_pr_count -gt 0 ] ; then
    echo "PR for this version was already created:"
    gh pr list -s all -S "in:title ${pr_title}"
    echo
    echo "I won't create a new one. Exiting."
    exit 0
fi

branch="opentelemetrybot/collector_version_${latest_version}_r${RANDOM}"

# While developing the workflow this will map to the dev branch, will map to "main" when in production
base_branch=$(git rev-parse --abbrev-ref HEAD)

$GIT checkout -b "${branch}" "${base_branch}"

$GIT add ${fileWithVersInfo}

$GIT commit -m "Bump OpenTelemetry collector version to ${latest_version}"
$GIT push --set-upstream origin "${branch}"

echo "Creating a pull request on your behalf."
$GH pr create --label auto-update,sig:collector \
             --title "${pr_title}" \
             --body "Update OpenTelemetry collector to v${latest_version}."
