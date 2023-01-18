#!/bin/bash -e
REPO_DIR=$(realpath $(dirname $0)/../../..)
EXIT_CODE=0
for file in $(npx prettier --loglevel log --ignore-path=.github/prettierignore -l ${REPO_DIR} ) 
do 
echo "::error file=${file}::Code style issues found. Forgot to run Prettier?"
EXIT_CODE=1
echo "Some code style issues were found, did you forget to run prettier?" > ${GITHUB_STEP_SUMMARY}
done;

exit ${EXIT_CODE}
