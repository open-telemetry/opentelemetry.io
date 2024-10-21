#!/usr/bin/env bash
#
# We handle listing all markdown files here because it is more portable across
# supported operating systems.

SCRIPT_DIR=$(dirname $0)
FILES=$(find content -name "*.md")
exec $SCRIPT_DIR/htmltest-config.pl $FILES
