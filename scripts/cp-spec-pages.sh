#!/usr/bin/env bash

BASE_DIR=$(dirname $0)
DEST_BASE=tmp

SPEC=content-modules/opentelemetry-specification/specification
DEST=$DEST_BASE/specification

rm -Rf $DEST
mkdir -p $DEST
cp -R $SPEC/* $DEST/

find $DEST/ -name "README.md" -exec sh -c 'f="{}"; mv -- "$f" "${f%README.md}_index.md"' \;

# To exclude a file use, e.g.: -not -path '*/specification/_index.md'
FILES=$(find $DEST -name "*.md")

$BASE_DIR/adjust-spec-pages.pl $FILES

echo "Specification pages copied and processed."
