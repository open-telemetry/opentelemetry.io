#!/bin/bash

# Script to clean up refcache.json by first extracting external links,
# then removing unused entries from the refcache.
#
# Usage: ./scripts/clean-refcache-workflow.sh

set -e

EXTERNAL_LINKS_PATH="tmp/external-links.txt"

echo "Cleaning up refcache of unused external links"
echo

echo "> Extracting external links from site HTML files"
node scripts/_extract-external-links.js

if [ ! -f $EXTERNAL_LINKS_PATH ]; then
    echo "Error: Failed to create $EXTERNAL_LINKS_PATH"
    exit 1
fi

link_count=$(wc -l < $EXTERNAL_LINKS_PATH)
echo "Found $link_count external links"
echo

echo "> Clean refcache.json: keep only links that are in use"
node scripts/_clean-refcache-from-list.js
