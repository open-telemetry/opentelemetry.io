#!/usr/bin/env bash

BASE_DIR=$(dirname $0)
SPEC=content-modules/opentelemetry-specification/specification
DEST=content/en/docs/reference/specification

git clean -xdf $DEST > /dev/null

cp -R $SPEC/* $DEST/

find $DEST/ -name "README.md" -exec sh -c 'f="{}"; mv -- "$f" "${f%README.md}_index.md"' \;

FILES=$(find $DEST -name "*.md" \
  -not -path '*/specification/_index.md' \
)

$BASE_DIR/adjust-spec-pages.pl $FILES

echo "Specification pages copied and processed."
