#!/usr/bin/env bash
#
# Check that all redirect targets are valid by parsing the generated redirects page
# and validating each target URL exists in the built site.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PUBLIC_DIR="${PUBLIC_DIR:-$PROJECT_ROOT/public}"
REDIRECTS_FILE="${PUBLIC_DIR}/_redirects"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0
checked=0

echo "Checking redirect rules..."
echo "Public directory: $PUBLIC_DIR"
echo "Redirects file: $REDIRECTS_FILE"
echo ""

if [ ! -f "$REDIRECTS_FILE" ]; then
  echo -e "${RED}ERROR: Redirects file not found: $REDIRECTS_FILE${NC}"
  echo "Please build the site first with: npm run build"
  exit 1
fi

# Parse the _redirects file and check each target
while IFS= read -r line; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue
  
  # Parse redirect rule (format: from to [status])
  # shellcheck disable=SC2086
  read -r from to status <<< $line
  
  # Skip if no 'to' field
  [ -z "$to" ] && continue
  
  # Skip external URLs
  [[ "$to" =~ ^https?:// ]] && continue
  
  # Skip Netlify special syntax like :splat
  [[ "$to" =~ :splat ]] && continue
  
  # Skip relative paths that can't be easily validated
  [[ "$to" =~ ^\.\. ]] && continue
  
  checked=$((checked + 1))
  
  # Remove trailing slash for checking
  target="${to%/}"
  
  # Check if target exists in public directory
  # Try both with and without index.html
  target_file="${PUBLIC_DIR}${target}"
  target_index="${PUBLIC_DIR}${target}/index.html"
  
  if [ -f "$target_file" ] || [ -f "$target_index" ] || [ -d "$target_file" ]; then
    # Target exists
    :
  else
    echo -e "${RED}ERROR: Redirect target not found${NC}"
    echo "  From: $from"
    echo "  To:   $to"
    echo "  Expected file: $target_file or $target_index"
    echo ""
    errors=$((errors + 1))
  fi
done < "$REDIRECTS_FILE"

echo ""
echo "Summary:"
echo "  Checked: $checked redirects"
echo -e "  ${GREEN}Passed: $((checked - errors))${NC}"
if [ $errors -gt 0 ]; then
  echo -e "  ${RED}Failed: $errors${NC}"
fi
if [ $warnings -gt 0 ]; then
  echo -e "  ${YELLOW}Warnings: $warnings${NC}"
fi

if [ $errors -gt 0 ]; then
  echo ""
  echo -e "${RED}Redirect validation failed!${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}All redirect targets are valid!${NC}"
  exit 0
fi
