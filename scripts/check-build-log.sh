#!/bin/bash
#
# NOTE: add warning skip patterns, one per line to WARNINGS_SKIP_LIST to
# temporarily skip known warnings or errors.

BUILD_LOG=tmp/build-log.txt
WARNINGS_SKIP_LIST=.warnings-skip-list.txt

WARNINGS=`grep -E -ie 'warn(ing)?|error' $BUILD_LOG | grep -v -f $WARNINGS_SKIP_LIST`

if [ -e $BUILD_LOG ]; then
  if [ -n "$WARNINGS" ]; then
    echo "WARNINGs or ERRORs found in build log:"
    echo "$WARNINGS"
    echo
    echo "INFO: if this is run in the context of a GitHub job, you can see"
    echo "      the full build log output from the previous step."
    exit 1
  fi
else
  echo "INFO: $BUILD_LOG file not found."
fi
