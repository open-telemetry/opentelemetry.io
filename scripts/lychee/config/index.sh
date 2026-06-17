#!/usr/bin/env bash
#
# Generate `lychee.toml` = `lychee.base.toml` + an `exclude_path` block derived
# from the (generated) `.htmltest.yml` IgnoreDirs. The base is hand-maintained
# and committed; `lychee.toml` is generated and gitignored. Mirrors how
# `.htmltest.yml` is generated from `.htmltest.base.yml`.
#
# Run via `npm run generate:config:links:lychee` (its pre-hook regenerates
# `.htmltest.yml` first).
#
# cSpell:ignore ignoredirs
set -euo pipefail
cd "$(dirname "$0")/../../.."

{
  cat lychee.base.toml
  echo
  echo '# --- IgnoreDirs port (GENERATED) ---'
  echo '# Pages htmltest skips (old blog years, blog pagination, drifted localized'
  echo '# pages), translated from .htmltest.yml. Do not edit here; regenerate with:'
  echo '#   npm run generate:config:links:lychee'
  echo 'exclude_path = ['
  node scripts/lychee/htmltest-ignoredirs-to-lychee/index.mjs .htmltest.yml
  echo ']'
} >lychee.toml

echo "Generated lychee.toml ($(grep -c '' lychee.toml) lines)." >&2
