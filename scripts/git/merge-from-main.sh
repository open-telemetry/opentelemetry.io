#!/usr/bin/env bash
#
# Merge BASE_REF (default origin/main) into the current branch for the bot
# lanes that commit link-cache updates (refcache-refresh, specs-integration).
# A conflict confined to the link cache self-heals, since the caller's next
# check run regenerates whatever the branch needed: the owned file takes
# BASE_REF's version (voiding the branch's pending refresh, so a caller that
# pruned re-prunes), and a derived .lycheecache that BASE_REF deleted is
# dropped (the cutover from the committed CSV). Any wider conflict is left in
# place for a human.
#
# Exit 0 on a clean or healed merge, 1 otherwise. On a heal, appends
# CACHE_SELF_HEALED=true to $GITHUB_ENV when set.

set -euo pipefail

BASE_REF="${1:-origin/main}"
CACHE_FILES=(link-cache.jsonc .lycheecache)

if git merge "$BASE_REF"; then
  exit 0
fi

conflicts=$(git diff --name-only --diff-filter=U)
conflict_list=${conflicts//$'\n'/ }
if [[ -z "$conflicts" ]]; then
  echo "::error::merge from $BASE_REF failed without conflicts: see the git output above."
  exit 1
fi
for f in $conflicts; do
  cache_file=false
  for c in "${CACHE_FILES[@]}"; do
    [[ "$f" == "$c" ]] && cache_file=true
  done
  if [[ "$cache_file" == false ]]; then
    echo "::error::merge from $BASE_REF conflicts ($conflict_list): resolve manually."
    exit 1
  fi
done

echo "Cache-only merge conflict: taking $BASE_REF's cache."
for f in $conflicts; do
  if git cat-file -e "$BASE_REF:$f" 2>/dev/null; then
    git checkout --theirs -- "$f"
    git add -- "$f"
  else
    git rm -q -- "$f"
  fi
done
git commit --no-edit
if [[ -n "${GITHUB_ENV:-}" ]]; then
  echo "CACHE_SELF_HEALED=true" >>"$GITHUB_ENV"
fi
