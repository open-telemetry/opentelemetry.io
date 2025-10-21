#!/bin/bash -e

# Run textlint and translate the JSON output into a format that provides file annotations for github PRs
# https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message
ERRORS=$(npm run --silent _check:text -- -f json | jq -r  '
    .[] |
    ( .filePath | sub(env.PWD + "/"; "")  ) as $fp |
    .messages[] |
    .message as $message |
    {line, file: $fp, column, endLine: .loc.end.line, endColumn: .loc.end.column, title: "textlint terminology error" }
    | . as $in
    | keys
    | map("\(.)=\($in[.])")
    | join(",")
    | "::error \(.)::\($message)" '
)

# Print the errors line by line
if [[ -n "${ERRORS}" ]] ; then
    OLDIFS=$IFS
    IFS=$'\n'
    for ERROR in ${ERRORS}; do
        echo "$ERROR"
    done
    IFS=$OLDIFS

    # if there are errors the workflow run fails
    exit 1
fi

# no errors, success!
exit 0