#!/usr/bin/env bash
# Frontmatter validation hook for OTel blog posts.
# Fires on Write/Edit tool calls targeting content/en/blog/**/*.md files.
# Reads TOOL_INPUT from stdin (JSON with file_path and content/new_string).

set -euo pipefail

INPUT=$(cat)

# Extract file path from the tool input JSON
FILE_PATH=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('file_path', ''))
except Exception as e:
    print(f'frontmatter-check: failed to parse TOOL_INPUT JSON: {e}', file=sys.stderr)
" || echo "")

# Only check blog posts
if [[ ! "$FILE_PATH" =~ content/en/blog/.*\.md$ ]]; then
  exit 0
fi

# Extract content: prefer "content" (Write tool), fall back to "new_string" (Edit tool)
CONTENT=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('content', data.get('new_string', '')))
except:
    pass
" 2>/dev/null || echo "")

# If no content to check (e.g., Edit with no frontmatter), skip
if [[ -z "$CONTENT" ]]; then
  exit 0
fi

# Only validate if content contains frontmatter (starts with ---)
if [[ ! "$CONTENT" =~ ^--- ]]; then
  exit 0
fi

ERRORS=()

# Extract frontmatter (between first two --- lines)
FRONTMATTER=$(echo "$CONTENT" | sed -n '/^---$/,/^---$/p' | sed '1d;$d')

if [[ -z "$FRONTMATTER" ]]; then
  exit 0
fi

# Check required fields
if ! echo "$FRONTMATTER" | grep -q '^title:'; then
  ERRORS+=("Missing required frontmatter field: title")
fi

if ! echo "$FRONTMATTER" | grep -q '^date:'; then
  ERRORS+=("Missing required frontmatter field: date")
fi

if ! echo "$FRONTMATTER" | grep -q '^author:'; then
  ERRORS+=("Missing required frontmatter field: author")
fi

if ! echo "$FRONTMATTER" | grep -q '^linkTitle:'; then
  ERRORS+=("Missing required frontmatter field: linkTitle")
else
  LINK_TITLE_VALUE=$(echo "$FRONTMATTER" | grep '^linkTitle:' | sed 's/^linkTitle:[[:space:]]*//' | tr -d "'\"" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || true)
  if [[ -z "$LINK_TITLE_VALUE" ]]; then
    ERRORS+=("Required frontmatter field linkTitle must be non-empty")
  fi
fi

# Validate date format (YYYY-MM-DD)
DATE_VALUE=$(echo "$FRONTMATTER" | grep '^date:' | sed 's/^date:[[:space:]]*//' | tr -d "'\"" || true)
if [[ -n "$DATE_VALUE" ]] && ! echo "$DATE_VALUE" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
  ERRORS+=("Date format must be YYYY-MM-DD, got: $DATE_VALUE")
fi

# Validate author format. Accept YAML block scalar forms for multi-author
# entries, and validate single-line values as Markdown links with optional
# surrounding quotes.
AUTHOR_LINE=$(echo "$FRONTMATTER" | grep '^author:' | head -1 || true)
AUTHOR_VALUE=$(echo "$AUTHOR_LINE" | sed 's/^author:[[:space:]]*//' || true)
if [[ -n "$AUTHOR_VALUE" ]]; then
  if echo "$AUTHOR_VALUE" | grep -qE '^(>|\|)([-+])?$'; then
    :
  elif ! echo "$AUTHOR_VALUE" | grep -qE '^["'"'"']?\[[^]]+\]\(https?://[^)]+\)["'"'"']?$'; then
    ERRORS+=("Author should be a Markdown link like [First Last](https://github.com/username), optionally quoted, or use YAML block scalar form for multi-author entries")
  fi
fi

# Check for H1 headings in content (after frontmatter)
BODY=$(echo "$CONTENT" | awk 'BEGIN{n=0} /^---$/{n++; next} n>=2{print}')
if echo "$BODY" | grep -qE '^# [^#]'; then
  ERRORS+=("Blog posts must not use H1 (#) headings. Start with ## (H2) instead")
fi

# Output errors
if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo "OTel Blog Frontmatter Issues:"
  for err in "${ERRORS[@]}"; do
    echo "  - $err"
  done
  exit 1
fi

exit 0
