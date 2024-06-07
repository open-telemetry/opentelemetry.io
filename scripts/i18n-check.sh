#!/bin/bash
#
# Inspired by https://github.com/kubernetes/website/blob/main/scripts/lsync.sh

DEFAULT_LANG="en"
DEFAULT_TARGET="content"
EXTRA_DIFF_ARGS="--numstat"
FLAG_DIFF_DETAILS=""
FLAG_UPDATE=""
FLAG_VERBOSE=""
I18N_DLC_KEY="default_lang_commit"
TARGET_PATHS=""

function _usage() {
  cat <<EOS
Usage: $(basename "$0") [options] [TARGET_PATH ...]

  For each localized page target, this script reports whether the English
  language version of that page has changed since the localized file was
  first written or last edited.

  TARGET_PATH can be a single markdown file of a localized page, such as
  'content/ja/_index.md', or a directory of localized pages, such as 'content/ja'.
  The default TARGET_PATH is '$DEFAULT_TARGET'.

  -h  Output this usage info.
  -d  Output diff details.
  -u  Update, or add, target commit hashes to match the last commit they were updated from.
  -v  Enables verbose command progress and status output.
EOS
}

function usage() {
  local status=${1:-0}
  _usage 1>&2
  exit $status
}

function process_CLI_args() {
  while getopts ":hduv" opt; do
    case $opt in
      h)
        usage
        ;;
      d)
        FLAG_DIFF_DETAILS=1
        EXTRA_DIFF_ARGS=""
        ;;
      u)
        FLAG_UPDATE=1
        ;;
      v)
        FLAG_VERBOSE=1
        ;;
      \?)
        echo "ERROR: unrecognized flag: -$OPTARG"
        usage 1
        ;;
    esac
  done

  shift $((OPTIND-1))
  TARGET_PATHS="$@"

  if [[ -z "$TARGET_PATHS" ]]; then
    TARGET_PATHS="$DEFAULT_TARGET"
    if [[ -n $FLAG_VERBOSE ]]; then echo "INFO: using default target path: $TARGET_PATHS"; fi
  fi

  if [[ -f "TARGET_PATHS" && ! -e "$TARGET_PATHS" ]] ; then
    echo "Path not found: '$TARGET_PATHS'" >&2
    exit 2
  fi
}

function update_i18n_hash() {
  # Usage: update_i18n_hash <file> <commit>
  #
  # Adds to or updates the file's front matter's field
  # $I18N_DLC_KEY with value <commit>.

  local LASTCOMMIT="$1"
  local f="$2"

  if grep -q "^$I18N_DLC_KEY:" "$f"; then
    perl -i -pe "s/(^$I18N_DLC_KEY):.*/\$1: $LASTCOMMIT/" "$f"
  else
    perl -i -0777 -pe "s/^(---.*?)(\n---\n)/\$1\n$I18N_DLC_KEY: $LASTCOMMIT\$2/sm" "$f"
  fi
  if [[ -n $FLAG_VERBOSE ]]; then
    echo -e "i18n commit ID\t$f $LASTCOMMIT - updated"
  fi
}

function main() {
  process_CLI_args "$@"

  if [ -f "$TARGET_PATHS" ] ; then
    TARGETS="$TARGET_PATHS"
  else
    TARGETS=$(find $TARGET_PATHS -name "*.md" -not -path "*/$DEFAULT_LANG/*")
    if [[ -z "$TARGETS" ]]; then
      echo "ERROR: target directory contains no markdown files: '$TARGET_PATHS'" >&2
      exit 1
    fi
    # if [[ -n $FLAG_VERBOSE ]]; then echo -e "All targets: $TARGETS"; fi
  fi

  # set -x
  # git branch -vv

  SYNCED=1
  for f in $TARGETS; do
    # if [[ -n $FLAG_VERBOSE ]]; then echo -e "Checking\t$f"; fi
    EN_VERSION=$(echo "$f" | sed "s/content\/.\{2,5\}\//content\/en\//g")

    # Try to get commit ref from file front matter
    LASTCOMMIT=$(perl -ne "print \"\$1\" if /^$I18N_DLC_KEY:\\s*(.*)/" "$f")
    if [[ -z $LASTCOMMIT ]]; then
      # Get commit hash from git commit info
      LASTCOMMIT=$(git log -n 1 --pretty=format:%h -- "$f")
    fi
    if [[ -z $LASTCOMMIT ]]; then
      # Get last commit of `main` that this branch is rooted from.
      LASTCOMMIT=$(git merge-base main HEAD)
    # elif ! git branch --contains $LASTCOMMIT | grep -q "^\s*main\b"; then # HERE
    #   # Get last commit of `main` that this branch is rooted from.
    #   LASTCOMMIT=$(git merge-base main HEAD)
    # fi

    # if ! (git branch --contains $LASTCOMMIT | grep -q "^\s*main\b"); then
    #   echo "Something is wrong, the hash is empty or isn't on 'main', aborting: $LASTCOMMIT - $f"
    #   exit 2
    fi

    if [[ -n $FLAG_UPDATE ]]; then
      update_i18n_hash "$LASTCOMMIT" "$f"
    fi

    if [[ ! -e "$EN_VERSION" ]]; then
      echo -e "File not found\t$EN_VERSION - $f - $DEFAULT_LANG was removed or renamed"
      SYNCED=0
      continue
    fi

    DIFF=$(git diff --exit-code $EXTRA_DIFF_ARGS $LASTCOMMIT...HEAD "$EN_VERSION")
    if [[ -n "$DIFF" ]]; then # [[ $? -ne 0 ]]
      SYNCED=0
      if [[ -n "$FLAG_DIFF_DETAILS" ]]; then
        echo -n "$DIFF"
      else
        echo "$DIFF - $f"
      fi
    elif [[ -n $FLAG_VERBOSE ]]; then
      echo -e "File is in sync\t$f"
    fi
  done
  if [ $SYNCED -ne 1 ]; then
    exit 1
  fi

  echo "$TARGET_PATHS is still in sync"
}

main "$@"
