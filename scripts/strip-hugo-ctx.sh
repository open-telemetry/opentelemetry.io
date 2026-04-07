#!/usr/bin/env bash

set -euo pipefail

target_dir="${1:-public}"

if [[ ! -d "$target_dir" ]]; then
  echo "Directory not found: $target_dir"
  exit 0
fi

find -L "$target_dir" -type f -name '*.md' -exec perl -i -ne '
  print unless /^\{\{__hugo_ctx pid=\d+\}\}\s*$/;
' {} +
