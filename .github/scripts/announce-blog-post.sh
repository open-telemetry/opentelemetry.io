#!/usr/bin/env bash
#
# Writes announcement files for newly published English blog posts into a
# checkout of open-telemetry/opentelemetry-announcements. Used by
# .github/workflows/announce-blog-post.yml, which opens the pull request.
#
# A post is newly published if it isn't a draft now, and it didn't exist or was
# a draft at BEFORE. Posts with `announcement: false` are skipped.
#
# Usage: announce-blog-post.sh BEFORE OUT_DIR [POST...]
#   BEFORE   Commit to compare HEAD with (ignored when POSTs are given).
#   OUT_DIR  Root of the announcements repository checkout.
#   POST     Blog post files to announce regardless of BEFORE.
#
# Writes `branch`, `title` and `body` to $GITHUB_OUTPUT when it creates any
# file.

set -euo pipefail

BEFORE=$1
OUT_DIR=$2
shift 2

SITE=https://opentelemetry.io
POST_RE='^content/en/blog/([0-9]{4})/([a-z0-9][a-z0-9._-]*)(/index)?\.md$'

fm() { # fm EXPR [FILE] -- read front matter from FILE or stdin
  yq --front-matter=extract "$1" "${2:--}"
}

is_draft() { # is_draft REV PATH -- true if the post is missing or a draft at REV
  local content
  content=$(git show "$1:$2" 2>/dev/null) || return 0
  [[ $(fm '.draft // false' <<<"$content") == true ]]
}

if (($# > 0)); then
  posts=("$@")
else
  mapfile -t posts < <(git diff --name-only --no-renames --diff-filter=AM \
    "$BEFORE" HEAD -- content/en/blog)
fi

today=$(date -u +%Y-%m-%d)
slugs=()
titles=()
lines=()

for post in "${posts[@]}"; do
  [[ $post =~ $POST_RE ]] || continue
  year=${BASH_REMATCH[1]}
  slug=${BASH_REMATCH[2]}
  [[ -f $post ]] || continue

  if [[ $(fm '.draft // false' "$post") == true ]]; then
    echo "Skipping draft: $post"
    continue
  fi
  if (($# == 0)); then
    # A page bundle and a single-file post are the same post.
    old_md=content/en/blog/$year/$slug.md
    old_bundle=content/en/blog/$year/$slug/index.md
    if ! is_draft "$BEFORE" "$old_md" || ! is_draft "$BEFORE" "$old_bundle"; then
      echo "Already published before this push: $post"
      continue
    fi
  fi

  short=$(fm '.announcement' "$post")
  if [[ $short == false ]]; then
    echo "Skipping, announcement: false: $post"
    continue
  fi
  if [[ ! $(fm '.announcement | type' "$post") =~ ^\!\!(str|null)$ ]]; then
    echo "::error file=$post::announcement must be a string or false"
    exit 1
  fi
  title=$(fm '.title' "$post")
  [[ $short == null || -z $short ]] && short=$title

  url=$SITE/blog/$year/$slug/
  file=$OUT_DIR/announcements/${today:0:4}/${today:5:5}-blog-$slug.yaml
  mkdir -p "$(dirname "$file")"
  {
    # shellcheck disable=SC2016 # literal $schema
    echo '# yaml-language-server: $schema=../../schema/announcement.schema.json'
    SUBJECT="New on the OpenTelemetry blog: $title" TEXT="$short"$'\n\n'"$url" \
      yq -n '.subject = strenv(SUBJECT) | .text = strenv(TEXT)'
  } >"$file"
  echo "Wrote $file"
  slugs+=("$slug")
  titles+=("$title")
  date=$(fm '.date // ""' "$post")
  date=${date:0:10}
  if [[ $date > $today ]]; then
    lines+=("- [$title]($url): goes live on $date, merge on or after that day")
  else
    lines+=("- [$title]($url)")
  fi
done

if ((${#slugs[@]} == 0)); then
  echo 'No newly published blog posts.'
  exit 0
fi

if ((${#slugs[@]} == 1)); then
  pr_title="Announce blog post: ${titles[0]}"
else
  pr_title="Announce ${#slugs[@]} blog posts"
fi
{
  echo "branch=otelbot/announce-blog-${slugs[0]}"
  echo "title=$pr_title"
  echo 'body<<EOF_BODY'
  printf '%s\n' "${lines[@]}"
  echo 'EOF_BODY'
} >>"${GITHUB_OUTPUT:-/dev/stdout}"
