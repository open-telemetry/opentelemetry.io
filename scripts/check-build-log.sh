#!/bin/bash
#
# NOTE: add warning skip patterns, one per line to WARNINGS_SKIP_LIST to
# temporarily skip known warnings or errors.

BUILD_LOG=tmp/build-log.txt
WARNINGS_SKIP_LIST=.warnings-skip-list.txt
WARNING_OR_ERROR_REGEX='warn(ing)?|error'

echo "Checking for WARNINGs or ERRORs in build log at $BUILD_LOG"
echo " > Using regex: /$WARNING_OR_ERROR_REGEX/i"
echo " > Skipping warnings listed in $WARNINGS_SKIP_LIST"

WARNINGS=`grep -E -ie $WARNING_OR_ERROR_REGEX $BUILD_LOG | grep -v -f <(grep -Ev '^(#|[[:space:]]*)$' $WARNINGS_SKIP_LIST 2>/dev/null || true)`

if [ -e $BUILD_LOG ]; then
  if [ -n "$WARNINGS" ]; then
    echo "Unexpected WARNINGs or ERRORs found in build log:"
    echo "$WARNINGS"
    echo
    echo "INFO: if this is run in the context of a GitHub job, you can see"
    echo "      the full build log output from the previous step."
    exit 1
  else
    echo "No WARNINGs or ERRORs found in build log."
  fi
else
  echo "INFO: $BUILD_LOG file not found."
fi
