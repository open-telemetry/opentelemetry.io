# AI Content Detection

Analyzes PR diffs using GitHub Copilot CLI to detect AI-generated content.

## Prerequisites

- Node.js 22+
- GitHub CLI (`gh`) authenticated
- GitHub Copilot CLI installed: `npm install -g @github/copilot`

## Local Testing

1. **Install dependencies**

   ```bash
   cd scripts/ai-content-detection
   npm install
   ```

2. **Set environment variables**

   ```bash
   export GH_TOKEN="your-github-token"
   export PR_NUMBER="123"
   export GITHUB_REPOSITORY="open-telemetry/opentelemetry.io"

   # Optional configuration
   export CONFIDENCE_THRESHOLD="80"          # 0-100
   export PR_LABEL="ai-generated"            # Label to add
   export SKIP_USERS="dependabot,renovate"   # Skip these users
   export FAIL_ON_DETECTION="false"          # Exit 1 if detected
   export DRY_RUN="true"                     # Test mode (no actions)
   export DIFF_MAX_CHARS="20000"             # Max diff size
   ```

3. **Run the script**

   ```bash
   node analyze.js
   ```

## Configuration

| Variable               | Required | Default        | Description                   |
| ---------------------- | -------- | -------------- | ----------------------------- |
| `GH_TOKEN`             | Yes      | -              | GitHub token with repo access |
| `PR_NUMBER`            | Yes      | -              | Pull request number           |
| `GITHUB_REPOSITORY`    | Yes      | -              | Repository (owner/repo)       |
| `CONFIDENCE_THRESHOLD` | No       | `80`           | Detection threshold (0-100)   |
| `PR_LABEL`             | No       | `ai-generated` | Label for detected PRs        |
| `SKIP_USERS`           | No       | `""`           | Comma-separated users to skip |
| `FAIL_ON_DETECTION`    | No       | `false`        | Fail if AI detected           |
| `DRY_RUN`              | No       | `true`         | Test mode (no PR updates)     |
| `CUSTOM_PROMPT`        | No       | `""`           | Custom analysis prompt        |
| `DIFF_MAX_CHARS`       | No       | `20000`        | Max diff characters           |

## Quick Test Example

```bash
# Test against a specific PR without making changes
cd scripts/ai-content-detection
npm install
export GH_TOKEN=$(gh auth token)
export PR_NUMBER=1234
export GITHUB_REPOSITORY="open-telemetry/opentelemetry.io"
export DRY_RUN="true"
node analyze.js
```

## How It Works

1. Fetches PR diff using GitHub CLI
2. Sends diff to Copilot CLI for analysis
3. Parses confidence score from response
4. If score ≥ threshold: posts comment, adds label, optionally fails
5. Dry run mode: analyzes but skips all PR modifications
