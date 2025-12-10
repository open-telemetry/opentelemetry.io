#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

# --- Validation ---
if [ -z "$GH_TOKEN" ]; then
  echo "Error: GH_TOKEN is not set."
  exit 1
fi

if [ -z "$PR_NUMBER" ]; then
  echo "Error: PR_NUMBER is not set."
  exit 1
fi

# --- 1. Fetch the PR Diff ---
echo "Fetching diff for PR #$PR_NUMBER..."
# We use the standard GH CLI to get the diff content
DIFF_CONTENT=$(gh pr diff "$PR_NUMBER" --repo "$REPO")

# If diff is too large, truncate it to avoid token limits (approx 20k chars)
DIFF_CONTENT=$(echo "$DIFF_CONTENT" | head -c 20000)

if [ -z "$DIFF_CONTENT" ]; then
  echo "No diff content found or diff is empty."
  exit 0
fi

# --- 2. Construct the Prompt ---
PROMPT="You are a code auditor. Analyze the following git diff. 
Determine if the additions likely come from an AI generator.

Rules:
1. Ignore imports and config files.
2. Start your response EXACTLY with 'Confidence Score: X%' where X is 0-100.
3. Provide brief reasoning.

Diff to analyze:
$DIFF_CONTENT"

# --- 3. Run Copilot CLI ---
echo "Running Copilot analysis..."
# Run in Programmatic Mode (-p) and capture output
OUTPUT=$(copilot -p "$PROMPT")

echo "--------------------------------"
echo "Copilot Output:"
echo "$OUTPUT"
echo "--------------------------------"

# --- 4. Parse Score ---
# Extracts the number after "Confidence Score:" using grep with PCRE
SCORE=$(echo "$OUTPUT" | grep -oP 'Confidence Score: \K\d+')

# Default to 0 if parsing fails
if [ -z "$SCORE" ]; then
  echo "Could not parse confidence score. Defaulting to 0."
  SCORE=0
fi

echo "Parsed Score: $SCORE"

# --- 5. Take Action ---
if [ "$SCORE" -gt 80 ]; then
  echo "Score is above threshold (80%). Posting comment and label."

  COMMENT_BODY="## 🤖 AI Detection Warning

**Confidence Score:** ${SCORE}%

Copilot CLI analysis suggests this code is likely AI-generated.

<details>
<summary>Full Analysis</summary>

$OUTPUT
</details>"

  gh pr comment "$PR_NUMBER" --repo "$REPO" --body "$COMMENT_BODY"

  # Add label (fails silently if label doesn't exist, which is fine)
  gh issue edit "$PR_NUMBER" --repo "$REPO" --add-label "ai-generated"
else
  echo "Score ($SCORE) is below threshold. No action taken."
fi
