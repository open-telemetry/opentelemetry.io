#!/bin/bash -e
#
# @chalin can't get Gulp 5 to ignore symlinks, so this wrapper creates
# bogus symlink targets to make the check:markdown Gulp task happy.

symlink_targets="content-modules/opentelemetry-go/example content-modules/opentelemetry-java-examples/doc-snippets"

for symlink_target in $symlink_targets; do
  if [[ ! -e $symlink_target ]]; then
    echo "INFO: required symlink target does not exist, creating it: $symlink_target"
    (set -x; mkdir -p "$symlink_target")
  fi
done

set -x
exec npm run _check:markdown -- "$@"
