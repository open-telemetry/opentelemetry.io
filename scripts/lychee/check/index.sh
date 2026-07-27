#!/usr/bin/env bash
#
# Run lychee over the built site (or over an explicit list of HTML files passed
# as arguments, used by the diff-scoped check). Always passes an ABSOLUTE
# `public/` path: lychee matches `exclude_path` against the input path as given,
# and the generated `exclude_path` patterns are anchored on `/public/...`, so a
# relative path would silently disable every `exclude_path` entry.
#
# Usage: scripts/lychee/check/index.sh [html-file ...]
set -euo pipefail
cd "$(dirname "$0")/../../.."

command -v lychee >/dev/null || {
  echo '[help] lychee not found. Install it: https://github.com/lycheeverse/lychee#installation' >&2
  exit 1
}

# Authenticated github.com checks (rate limits): bridge a token from a local
# `gh` login when GITHUB_TOKEN is unset — same as lychee-norm-cache; CI sets
# GITHUB_TOKEN directly.
if [[ -z "${GITHUB_TOKEN:-}" ]] && command -v gh >/dev/null; then
  if token=$(gh auth token 2>/dev/null) && [[ -n "$token" ]]; then
    export GITHUB_TOKEN="$token"
  fi
fi

PUBLIC="$PWD/public"
test -d "$PUBLIC" || {
  echo "[help] $PUBLIC not found. Build the site first: npm run build" >&2
  exit 1
}

if [ "$#" -gt 0 ]; then
  exec lychee --config lychee.toml --root-dir "$PUBLIC" "$@"
fi
exec lychee --config lychee.toml --root-dir "$PUBLIC" "$PUBLIC"
