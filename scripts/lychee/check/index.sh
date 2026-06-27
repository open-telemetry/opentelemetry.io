#!/usr/bin/env bash
#
# Run lychee over the built site (or over an explicit list of HTML files passed
# as arguments, used by the diff-scoped check). Always passes an ABSOLUTE
# `public/` path: lychee matches `exclude_path` against the input path as given,
# and the IgnoreDirs port is anchored on `/public/...`, so a relative path would
# silently disable every `exclude_path` entry.
#
# Usage: scripts/lychee/check/index.sh [html-file ...]
set -euo pipefail
cd "$(dirname "$0")/../../.."

command -v lychee >/dev/null || {
  echo '[help] lychee not found. Install it: https://github.com/lycheeverse/lychee#installation' >&2
  exit 1
}

PUBLIC="$PWD/public"
test -d "$PUBLIC" || {
  echo "[help] $PUBLIC not found. Build the site first: npm run build" >&2
  exit 1
}

if [ "$#" -gt 0 ]; then
  exec lychee --config lychee.toml --root-dir "$PUBLIC" "$@"
fi
exec lychee --config lychee.toml --root-dir "$PUBLIC" "$PUBLIC"
