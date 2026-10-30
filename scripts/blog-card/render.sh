#!/usr/bin/env bash
# Renders a 1200x630 social card for a blog post: the homepage hero pattern with
# the post title on top. Used by .github/workflows/announce-blog-post.yml.
#
# Usage: render.sh TITLE OUTPUT.jpg
set -euo pipefail

title=$1
out=$2
here=$(cd "$(dirname "$0")" && pwd)
bg="$here/../../content/en/homepage-hero-background.png"
font="$here/Lato-Bold.ttf"

if command -v magick >/dev/null; then im=(magick); else im=(convert); fi

# ImageMagick reads "caption:@file" and expands "%" escapes, so neutralize both.
text=${title//%/%%}
while [[ $text == @* ]]; do text=${text#@}; done

len=${#title}
if ((len <= 60)); then size=68; elif ((len <= 100)); then size=56; else size=46; fi

"${im[@]}" "$bg" \
  -resize 1200x630^ -gravity center -extent 1200x630 \
  -brightness-contrast -5 \
  -font "$font" -pointsize 32 -fill '#f5a800' \
  -gravity NorthWest -annotate +80+40 'OpenTelemetry Blog' \
  \( -background none -fill white -font "$font" -pointsize "$size" \
  -size 1040x400 -gravity West "caption:$text" \) \
  -gravity NorthWest -geometry +80+130 -composite \
  -strip -sampling-factor 4:2:0 -quality 75 "$out"
