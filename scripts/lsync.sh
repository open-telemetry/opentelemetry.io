#!/bin/bash
#
# Inspired by https://github.com/kubernetes/website/blob/main/scripts/lsync.sh

EXTRA_DIFF_ARGS="--numstat"
TARGET_PATHS=""

function _usage() {
  cat <<EOS
Usage: $(basename "$0") [options] TARGET_PATH ...

  For each localized page target, this script reports whether the English
  language version of that page has changed since the localized file was
  first written or last edited.

  TARGET_PATH can be a single markdown file of a localized page, such as
  'content/ja/_index.md', or a directory of localized pages, such as 'content/ja'.

  -h  Output this usage info.
  -d  Output diff details.
  -v  Verbose mode.
EOS
}

function usage() {
  local status=${1:-0}
  _usage 1>&2
  exit $status
}

function process_CLI_args() {
  while getopts ":hdv" opt; do
    case $opt in
      h)
        usage
        ;;
      d)
        EXTRA_DIFF_ARGS=""
        ;;
      v)
        VERBOSE=1
        ;;
      \?)
        echo "ERROR: unrecognized flag: -$OPTARG"
        usage 1
        ;;
    esac
  done

  shift $((OPTIND-1))
  if [ "$#" -lt 1 ]; then
    echo "ERROR: target path argument is missing" >&2
    usage 1
  fi

  TARGET_PATHS="$@"

  if [[ -f "TARGET_PATHS" && ! -e "$TARGET_PATHS" ]] ; then
    echo "Path not found: '$TARGET_PATHS'" >&2
    exit 2
  fi
}

function main() {
  process_CLI_args "$@"

  if [ -f "$TARGET_PATHS" ] ; then
    TARGETS="$TARGET_PATHS"
  else
    TARGETS=$(find $TARGET_PATHS -name "*.md")
    if [[ -z "$TARGETS" ]]; then
      echo "ERROR: target directory contains no markdown files: '$TARGET_PATHS'" >&2
      exit 1
    fi
    # if [[ -n $VERBOSE ]]; then echo -e "All targets: $TARGETS"; fi
  fi

  SYNCED=1
  for f in $TARGETS; do
    # if [[ -n $VERBOSE ]]; then echo -e "Checking\t$f"; fi
    EN_VERSION=$(echo "$f" | sed "s/content\/.\{2,5\}\//content\/en\//g")
    if [[ ! -e "$EN_VERSION" ]]; then
      echo "Base file renamed or removed: $EN_VERSION"
      SYNCED=0
      continue
    fi

    LASTCOMMIT=$(git log -n 1 --pretty=format:%h -- "$f")
    git diff --exit-code $EXTRA_DIFF_ARGS $LASTCOMMIT...HEAD "$EN_VERSION"
    if [ $? -ne 0 ] ; then
      SYNCED=0
    elif [[ -n $VERBOSE ]]; then
      echo -e "File is in sync\t$f"
    fi
  done
  if [ $SYNCED -ne 1 ]; then
    exit 1
  fi

  echo "$TARGET_PATHS is still in sync"
}

main "$@"
