#!/bin/bash

# Script to diff all refcache.json files under a given directory These files are
# assumed to be (possibly) updated refcache files from sharded link checks. They
# are compared against the main refcache.json file in static/refcache.json.
# Exit code: 0 if all files are identical, 1 if any are different

set -e

if [ $# -eq 0 ]; then
  DIRECTORY="tmp/check-refcache"
elif [ $# -eq 1 ]; then
  DIRECTORY="$1"
else
  echo "Usage: $0 [directory]"
  echo ""
  echo "Default directory: tmp/check-refcache"
  exit 1
fi

if [ ! -d "$DIRECTORY" ]; then
  echo "ERROR: Directory '$DIRECTORY' does not exist"
  exit 1
fi

REFERENCE_FILE="static/refcache.json"

if [ ! -f "$REFERENCE_FILE" ]; then
  echo "ERROR: Reference file '$REFERENCE_FILE' does not exist"
  exit 1
else
  echo "Compare shard refcache files against '$REFERENCE_FILE':"
fi

# Find all refcache.json files in the directory
REFCACHE_FILES=$(find "$DIRECTORY" -name "refcache.json" -type f | sort)

if [ -z "$REFCACHE_FILES" ]; then
  echo "WARNING: no refcache.json files found in '$DIRECTORY'"
  exit 0
fi

DIFFS_FOUND=0
for file in $REFCACHE_FILES; do
  if ! diff -q "$REFERENCE_FILE" "$file" >/dev/null 2>&1; then
    DIFFS_FOUND=1
    echo " - $file differs"
    diff "$REFERENCE_FILE" "$file" | tail -n 100
    echo ""
  else
    echo " - $file is identical"
  fi
done

# Report results
if [ $DIFFS_FOUND -eq 0 ]; then
  echo "✅ All refcache.json files are identical"
  exit 0
fi

echo ""
echo "WARNING: the main refcache.json file needs to be updated."
echo "  Run 'npm run fix:refcache' locally and commit the changes,"
echo "  or add the comment '/fix:refcache' to your PR in GitHub."
exit 1
