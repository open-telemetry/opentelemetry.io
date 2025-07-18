#!/bin/bash
#
if git diff --name-only --exit-code; then
  exit
fi

if [ -n "$GITHUB_STEP_SUMMARY" ]; then
(
  echo '## git diff';
  echo '```diff';
  echo
  git diff
  echo '```'
) >> "$GITHUB_STEP_SUMMARY"
fi
exit 1
