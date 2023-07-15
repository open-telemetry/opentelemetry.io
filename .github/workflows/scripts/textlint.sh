#!/bin/bash -e

ERRORS=$(npx textlint -f json content/en/*.md | jq -r  '.[] | ( .filePath | sub(env.PWD + "/"; "")  ) as $fp | .messages[] | .message as $message |{line, file: $fp, column, endLine: .loc.end.line, endColumn: .loc.end.column, title: "textlint terminology error" } | . as $in | keys | map("\(.)=\($in[.])") | join(",") | "::error \(.)::\($message)" ')


if [[ -n "${ERRORS}" ]] ; then
    if [[ -z "${GITHUB_ACTIONS}" ]]; then
        GITHUB_STEP_SUMMARY=$(mktemp)
    fi

    OLDIFS=$IFS
    IFS=$'\n'
    for ERROR in ${ERRORS}; do
        echo "$ERROR"
    done
    IFS=$OLDIFS
    echo "This is the lead in sentence for the list" >> "${GITHUB_STEP_SUMMARY}"
    echo "" >> "${GITHUB_STEP_SUMMARY}" # this is a blank line
    echo "- Lets add a bullet point" >> "${GITHUB_STEP_SUMMARY}"
    echo "- Lets add a second bullet point" >> "${GITHUB_STEP_SUMMARY}"
    echo "- How about a third one?" >> "${GITHUB_STEP_SUMMARY}"

    if [[ -z "$GITHUB_ACTIONS" ]]; then
        cat "${GITHUB_STEP_SUMMARY}"
        rm "${GITHUB_STEP_SUMMARY}"
    fi

    exit 1
fi

exit 0