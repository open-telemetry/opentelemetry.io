#!/bin/bash

# Check links for a specific shard. For usage, see below.

set -e

function usage() {
  local status=${1:-0}
  cat << EOF
Usage: $0 [-qk] <shard-id> <shard-regex>

Check links for a specific shard by temporarily updating htmltest config.

Options:
  -h    Show this help message
  -q    Quiet mode
  -k    Keep modified htmltest config

Arguments:
  shard-id     Identifier for the shard (e.g., 'en', 'locales-A-to-M')
  shard-regex  Regex pattern to add to IgnoreDirs in .htmltest.yml

EOF
  exit $status
}

while getopts "hqk" opt; do
  case $opt in
    h) usage 0;;
    q) QUIET=1;;
    k) KEEP=1;;
    \?) echo "Invalid option: -$OPTARG" >&2; usage >&2;;
  esac
done

shift $((OPTIND-1)) # Shift past the options

# Check for required arguments
if [ $# -ne 2 ]; then
  usage >&2
fi

SHARD_ID="$1"
SHARD_REGEX="$2"

if [[ -z $QUIET ]]; then
  echo "Checking links for shard '$SHARD_ID' with regex: $SHARD_REGEX"
fi

# Update htmltest config with shard IgnoreDirs regex
perl -i -ne 'print; print "  - '"$SHARD_REGEX"'\n" if /^IgnoreDirs:/' .htmltest.yml

if [[ -z $QUIET ]]; then
  echo "Updated .htmltest.yml:"
  cat .htmltest.yml
fi

# Run htmltest with DEBUG log-level so that we can filter the output to show the checked files
export HTMLTEST_ARGS='--log-level 0'
npm run __check:links 2>&1 | \
  tee tmp/check-links-log.txt | \
  grep -Ev '(anchor without href|OK|cache|Content) --- |^[0-9]+:|ignored |testDocument on|DOCTYPE|<nil>'
EXIT_CODE=${PIPESTATUS[0]}

# Restore original htmltest config unless -k flag is used
if [[ -z $KEEP ]]; then
  git restore .htmltest.yml
  [[ -z $QUIET ]] && echo "Restored .htmltest.yml to original state"
else
  [[ -z $QUIET ]] && echo "Keeping modified .htmltest.yml (use -k flag)"
fi

exit $EXIT_CODE
