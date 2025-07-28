# Generate Header IDs Script for translated documentation

This script automatically generates header IDs for markdown files by extracting headers from source files and adding corresponding IDs to target files.

> DISCLAIMER: ALWAYS CHECK THE RESULTS AND RUN `check:links`

## Usage

```bash
node scripts/i18n-generate-headers-ids/generate-header-ids.js <source-dir> <target-dir>
```

### Parameters

- `<source-dir>`: Directory containing the source markdown files (e.g., English documentation)
- `<target-dir>`: Directory containing the target markdown files (e.g., French translation)

### Example

```bash
node scripts/generate-header-ids.js content/en/docs/zero-code/java content/fr/docs/zero-code/java
```

## How it works

1. **File Discovery**: Recursively finds all `.md` files in the source directory
2. **Header Extraction**: Extracts all headers (lines starting with `#`, `##`, `###`, etc.) from source files
3. **ID Generation**: Converts header text to lowercase, replaces spaces with dashes, and removes special characters
4. **ID Insertion**: Adds the generated ID in curly brackets `{#header-id}` to the corresponding header in the target file
5. **File Update**: Saves the updated content back to the target files

## Example Transformation

**Source file (English):**
```markdown
## Capturing HTTP request and response headers
```

**Target file (French) before:**
```markdown
## Capture des en-têtes de requête et de réponse HTTP
```

**Target file (French) after:**
```markdown
## Capture des en-têtes de requête et de réponse HTTP {#capturing-http-request-and-response-headers}
```

## Features

- **Recursive processing**: Handles nested directory structures
- **Duplicate detection**: Skips headers that already have IDs
- **Level matching**: Only processes headers at the same level (e.g., `##` with `##`)
- **Safe operation**: Creates backups and validates file existence before processing
- **Detailed logging**: Shows progress and results for each file processed

## Requirements

- Node.js (any recent version)
- Read/write access to both source and target directories

## Notes

- The script matches headers by their level in the document
- Headers must be at the same hierarchical level to be matched
- Existing header IDs are preserved (no duplicates created)
- The script is reusable for any language pair or documentation structure

## Error Handling

- Validates that both source and target directories exist
- Skips files that don't have corresponding targets
- Reports missing files and processing errors
- Continues processing even if individual files fail

## Output

The script provides detailed console output showing:
- Number of files found and processed
- Headers that received new IDs
- Headers that already had IDs
- Files that were updated
- Any errors or warnings encountered
