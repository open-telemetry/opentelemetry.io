#!/bin/sh
#
# Pre-commit hook that runs formatting on staged files
#

exec npm run fix:format:staged

