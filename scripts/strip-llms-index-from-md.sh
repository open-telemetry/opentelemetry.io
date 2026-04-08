#!/usr/bin/env bash
# Strip the Docsy Markdown "LLMS index" block from generated .md files (see
# themes/docsy/layouts/all.md). Removes:
#   LLMS index: [llms.txt](/…/llms.txt)
#   (blank line)
#   ---
#
# Usage: scripts/strip-llms-index-from-md.sh [DIR]
# Default DIR is public.
#
# cSpell:ignore: llms

set -euo pipefail

target_dir="${1:-public}"

if [[ ! -d "$target_dir" ]]; then
  echo "Directory not found: $target_dir" >&2
  exit 1
fi

find -L "$target_dir" -type f -name '*.md' -exec perl -i -0777 -pe '
  s/\nLLMS index:\s*\[[^\]]+\]\([^)]+\)\n\n---\n\n/\n/g;
  s/\nLLMS index:\s*\[[^\]]+\]\([^)]+\)\n---\n\n/\n/g;
  s/^LLMS index:\s*\[[^\]]+\]\([^)]+\)\n\n---\n\n/\n/m;
' {} +
