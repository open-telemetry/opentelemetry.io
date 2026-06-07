#!/bin/bash

# Check links for a specific shard. For usage, see below.

set -e

function usage() {
  local status=${1:-0}
  cat << EOF
Usage: $0 [-qk] <shard-id> <shard-regex>

Check links for a specific shard by appending a shard-specific IgnoreDirs regex
to the generated .htmltest.yml.

Options:
  -h    Show this help message
  -q    Quiet mode
  -k    Keep modified .htmltest.yml (default is to delete it after the run)

Arguments:
  shard-id     Identifier for the shard (e.g., 'en', 'locales-A-to-M')
  shard-regex  Regex pattern to add to IgnoreDirs in .htmltest.yml

EOF
  exit "$status"
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

# The committed source is `.htmltest.base.yml`; the effective `.htmltest.yml` is
# generated from it. In CI it arrives fully generated via the build artifact;
# locally, generate it on demand if it's missing.
if [[ ! -f .htmltest.yml ]]; then
  [[ -z $QUIET ]] && echo "Generating .htmltest.yml from .htmltest.base.yml"
  npm run fix:htmltest-config
fi

# Append this shard's IgnoreDirs regex to the generated config.
perl -i -ne 'print; print "  - '"$SHARD_REGEX"'\n" if /^IgnoreDirs:/' .htmltest.yml

if [[ -z $QUIET ]]; then
  echo "Updated .htmltest.yml:"
  cat .htmltest.yml
fi

# Run htmltest with DEBUG log-level so that we can filter the output to show the
# checked files. Use `--ignore-scripts` so the `pre__check:links` hook does not
# regenerate `.htmltest.yml` and discard the shard regex appended above.
export HTMLTEST_ARGS='--log-level 0'
npm run --ignore-scripts __check:links 2>&1 | \
  tee tmp/check-links-log.txt | \
  grep -Ev '(anchor without href|OK|cache|Content) --- |^[0-9]+:|ignored |testDocument on|DOCTYPE|<nil>'
EXIT_CODE=${PIPESTATUS[0]}

# Remove the generated, shard-modified `.htmltest.yml` unless -k is given, so
# repeated local runs start from a freshly generated config (it is regenerated
# above when missing). In CI the file comes from the build artifact and is not
# needed after this step.
if [[ -z $KEEP ]]; then
  rm -f .htmltest.yml
  [[ -z $QUIET ]] && echo "Removed generated .htmltest.yml"
else
  [[ -z $QUIET ]] && echo "Keeping generated .htmltest.yml (-k)"
fi

exit "$EXIT_CODE"
