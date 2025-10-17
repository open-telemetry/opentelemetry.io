#!/bin/bash

# Script to add anchors to titles in a translated file based on the English version
# Usage: ./generate_i18n-anchors.sh <translated_file>

if [ $# -ne 1 ]; then
  echo "Usage: $0 <translated_file>"
  echo "Example: $0 content/fr/docs/platforms/kubernetes/operator/_index.md"
  exit 1
fi

file="$1"

# Determine the English file path by replacing /fr/ with /en/
en_file="${file/fr/en}"

if [ ! -f "$en_file" ]; then
  echo "Error: English file $en_file not found"
  exit 1
fi

if [ ! -f "$file" ]; then
  echo "Error: Translated file $file not found"
  exit 1
fi

# Function to generate anchor from title
generate_anchor() {
  local title="$1"
  # Convert to lowercase
  local anchor=$(echo "$title" | tr '[:upper:]' '[:lower:]')
  # Replace spaces and special chars with hyphens, remove multiple hyphens
  anchor=$(echo "$anchor" | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
  echo "$anchor"
}

# Arrays to store English titles and their generated anchors
declare -a en_titles
declare -a en_anchors

# Read English file and extract titles, generate anchors
while IFS= read -r line; do
  if [[ $line =~ ^(#+)\ (.+)$ ]]; then
    level="${#BASH_REMATCH[1]}"
    title="${BASH_REMATCH[2]}"
    # Remove existing anchor if present
    title=$(echo "$title" | sed 's/ {#.*}//')
    anchor=$(generate_anchor "$title")
    en_titles+=("$level|$title")
    en_anchors+=("$anchor")
  fi
done < "$en_file"

# Process the translated file
temp_file=$(mktemp)
index=0

while IFS= read -r line; do
  if [[ $line =~ ^(#+)\ (.+)\ \{#(.+)\}$ ]]; then
    # Title already has an anchor, keep as is
    echo "$line" >> "$temp_file"
    ((index++))
  elif [[ $line =~ ^(#+)\ (.+)$ ]]; then
    # Title without anchor
    level="${#BASH_REMATCH[1]}"
    title="${BASH_REMATCH[2]}"

    if [ $index -lt ${#en_titles[@]} ]; then
      en_anchor="${en_anchors[$index]}"
      if [ -n "$en_anchor" ]; then
        # Add the anchor from the English version
        echo "$line {#${en_anchor}}" >> "$temp_file"
      else
        # No anchor in English version
        echo "$line" >> "$temp_file"
      fi
      ((index++))
    else
      # No corresponding English title
      echo "$line" >> "$temp_file"
    fi
  else
    # Not a title line
    echo "$line" >> "$temp_file"
  fi
done < "$file"

# Replace the original file with the modified version
mv "$temp_file" "$file"

echo "Anchors added to $file based on $en_file"
