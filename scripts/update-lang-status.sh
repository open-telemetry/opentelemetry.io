#!/bin/bash
set -e

LANG_STATUS_URL="https://raw.githubusercontent.com/open-telemetry/opentelemetry-configuration/main/language-support-status.md"
TEMP_FILE="/tmp/language-support-status.md"
TARGET_FILE="content/en/docs/specs/declarative-configuration/language-status.md"

echo "Downloading language implementation status..."
curl -fsSL "$LANG_STATUS_URL" -o "$TEMP_FILE"

echo "Downloaded successfully: $TEMP_FILE"

echo ""
echo "Transforming and injecting into language-status.md..."
node scripts/transform-lang-status.js "$TEMP_FILE" "$TARGET_FILE"

echo ""
echo "Formatting with Prettier..."
npm run fix:format -- "$TARGET_FILE" > /dev/null 2>&1 || true

echo ""
echo "Language status updated successfully!"
