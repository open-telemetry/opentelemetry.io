#!/bin/bash
set -e

SCHEMA_URL="https://raw.githubusercontent.com/open-telemetry/opentelemetry-configuration/main/opentelemetry_configuration.json"
SCHEMA_PATH="data/opentelemetry/configuration.json"

echo "Downloading OpenTelemetry configuration schema..."
curl -fsSL "$SCHEMA_URL" -o "$SCHEMA_PATH"

echo "Schema updated successfully: $SCHEMA_PATH"
echo "Size: $(wc -c < "$SCHEMA_PATH" | awk '{print int($1/1024)"K"}')"
echo "Lines: $(wc -l < "$SCHEMA_PATH" | tr -d ' ')"

echo ""
echo "Transforming schema to simplified format..."
node scripts/transform-config-schema.js