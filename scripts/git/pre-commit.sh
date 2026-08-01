#!/bin/sh
#
# Pre-commit hook that runs formatting on staged files
#

npm run -s fix:format:staged
if ! npm run -s _diff:check; then
  echo
  echo 'INFO: files have been changed by fix:format; those not marked (unchanged) in the list above.'
  exit 1
fi
