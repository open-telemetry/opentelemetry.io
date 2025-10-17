#!/bin/bash

# Script to add anchors to titles in a translated file or directory based on the English version
# Usage: ./generate_i18n-anchors.sh <translated_file_or_directory>

if [ $# -ne 1 ]; then
  echo "Usage: $0 <translated_file_or_directory>"
  echo "Example: $0 content/fr/docs/platforms/kubernetes/operator/_index.md"
  echo "Example: $0 content/fr/docs/platforms/kubernetes/operator/"
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

# Function to process a single file
process_file() {
  local file="$1"

  # Determine the English file path by replacing /fr/ with /en/
  local en_file="${file/fr/en}"

  if [ ! -f "$en_file" ]; then
    echo "Warning: English file $en_file not found, skipping $file"
    return
  fi

  if [ ! -f "$file" ]; then
    echo "Warning: Translated file $file not found, skipping"
    return
  fi

  # Arrays to store English titles and their generated anchors
  declare -a en_titles
  declare -a en_anchors

  # Read English file and extract titles, generate anchors
  local in_codeblock=false
  while IFS= read -r line; do
    if [[ $line =~ ^``` ]]; then
      in_codeblock=!$in_codeblock
    elif ! $in_codeblock && [[ $line =~ ^(#+)\ (.+)$ ]]; then
      local level="${#BASH_REMATCH[1]}"
      local title="${BASH_REMATCH[2]}"
      # Remove existing anchor if present
      title=$(echo "$title" | sed 's/ {#.*}//')
      local anchor=$(generate_anchor "$title")
      en_titles+=("$level|$title")
      en_anchors+=("$anchor")
    fi
  done < "$en_file"

  # Process the translated file
  local temp_file=$(mktemp)
  local index=0
  in_codeblock=false

  while IFS= read -r line; do
    if [[ $line =~ ^``` ]]; then
      in_codeblock=!$in_codeblock
      echo "$line" >> "$temp_file"
    elif $in_codeblock; then
      # Inside codeblock, keep as is
      echo "$line" >> "$temp_file"
    elif [[ $line =~ ^(#+)\ (.+)\ \{#(.+)\}$ ]]; then
      # Title already has an anchor, keep as is
      echo "$line" >> "$temp_file"
      ((index++))
    elif [[ $line =~ ^(#+)\ (.+)$ ]]; then
      # Title without anchor
      local level="${#BASH_REMATCH[1]}"
      local title="${BASH_REMATCH[2]}"

      if [ $index -lt ${#en_titles[@]} ]; then
        local en_anchor="${en_anchors[$index]}"
        if [ -n "$en_anchor" ]; then
          # Add the anchor from the English version
          echo "$line {#${en_anchor}}" >> "$temp_file"
        else
          # No anchor generated
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
}

# Main logic
input="$1"

if [ -d "$input" ]; then
  # Process directory recursively
  find "$input" -name "*.md" -type f | while read -r file; do
    echo "Processing $file"
    process_file "$file"
  done
elif [ -f "$input" ]; then
  # Process single file
  process_file "$input"
else
  echo "Error: $input is not a valid file or directory"
  exit 1
fi
