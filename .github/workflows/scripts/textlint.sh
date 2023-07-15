#!/bin/bash -e

ERRORS=$(npx textlint -f json content/en/*.md | jq -r  '.[] | ( .filePath | sub(env.PWD + "/"; "")  ) as $fp | .messages[] | .message as $message |{line, file: $fp, column, endLine: .loc.end.line, endColumn: .loc.end.column, title: "textlint terminology error" } | . as $in | keys | map("\(.)=\($in[.])") | join(",") | "\r::error \(.)::\($message)" | @sh')

if [ -n "${ERRORS}" ] ; then
    echo "${ERRORS}"
    exit 1
fi

exit 0