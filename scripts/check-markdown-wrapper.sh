#!/bin/bash -e
#
# @chalin can't get Gulp 5 to ignore symlinks, so this wrapper creates
# bogus symlink targets to make the check:markdown Gulp task happy.

symlink_target="content-modules/opentelemetry-go/example"

if [[ ! -e $symlink_target ]]; then
  echo "WARNING: required symlink target does not exist, creating it: $symlink_target"
  (set -x; mkdir -p $symlink_target)
fi

set -x
exec npx gulp lint-md "$@"
