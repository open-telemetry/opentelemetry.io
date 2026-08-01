#!/usr/bin/env bash

set -euo pipefail

target_dir="${1:-public}"

if [[ ! -d "$target_dir" ]]; then
  echo "Directory not found: $target_dir"
  exit 0
fi

find -L "$target_dir" -type f -name '*.md' -exec perl -i -ne '
  # Drop whole-line markers: opening (pid=…), closing ({{__hugo_ctx/}}), optional
  # Markdown blockquote prefix (e.g. callouts), and leading indent (fenced code).
  print unless /^(?:\s*>\s*)*\s*(?:\{\{__hugo_ctx\s+pid=\d+\}\}|\{\{__hugo_ctx\/\}\})\s*$/;
' {} +
