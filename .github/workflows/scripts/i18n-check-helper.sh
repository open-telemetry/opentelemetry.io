#!/bin/bash -e

echo "For localization docs, see https://opentelemetry.io/docs/contributing/localization"

CHANGES=`git status --porcelain`

if [[ -z $CHANGES ]]; then
  echo "All localization pages have the requisit commit hash. <3"
  exit;
fi

cat <<EOS
Some i18n pages are missing the 'default_lang_commit' front matter field.
To fix this in your local development environment, run

    scripts/i18n-check.sh -u

and commit the changes for your locale. Here are the list of pages that
need to be updated:
---
EOS

echo "$CHANGES"
echo "---"

exit 1
