#!/usr/bin/env node

import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

// Load .env file if present (for local testing)
config();

/**
 * Configuration class for AI content detection
 */
class AIDetectionConfig {
  constructor() {
    // Required configuration
    this.ghToken = process.env.GH_TOKEN;
    this.prNumber = parseInt(process.env.PR_NUMBER, 10);
    this.repo = process.env.GITHUB_REPOSITORY;

    // Optional configuration with defaults
    this.threshold = parseInt(process.env.CONFIDENCE_THRESHOLD || '80', 10);
    this.labelName = process.env.PR_LABEL || 'ai-generated';
    this.skipUsers = (process.env.SKIP_USERS || '')
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
    this.failOnDetection =
      process.env.FAIL_ON_DETECTION === 'true' ||
      process.env.FAIL_ON_DETECTION === '1';
    this.dryRun = process.env.DRY_RUN === 'true' || process.env.DRY_RUN === '1';
    this.customPrompt = process.env.CUSTOM_PROMPT || null;
    this.diffMaxChars = parseInt(process.env.DIFF_MAX_CHARS || '20000', 10);
  }

  /**
   * Validates required configuration
   * @throws {Error} If required configuration is missing or invalid
   */
  validate() {
    if (!this.ghToken) {
      throw new Error('GH_TOKEN is required');
    }

    if (!this.prNumber || isNaN(this.prNumber)) {
      throw new Error('PR_NUMBER is required and must be a number');
    }

    if (!this.repo) {
      throw new Error('GITHUB_REPOSITORY is required');
    }

    if (this.threshold < 0 || this.threshold > 100) {
      throw new Error('CONFIDENCE_THRESHOLD must be between 0 and 100');
    }

    if (this.diffMaxChars < 1000) {
      throw new Error('DIFF_MAX_CHARS must be at least 1000');
    }
  }
}

/**
 * Fetches PR author and checks if they should be skipped
 * @param {Octokit} octokit - GitHub API client
 * @param {AIDetectionConfig} config - Configuration object
 * @returns {Promise<string|null>} PR author login or null if should skip
 */
async function fetchPRAuthor(octokit, config) {
  const [owner, repo] = config.repo.split('/');

  console.log(`Fetching PR #${config.prNumber} from ${config.repo}...`);

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: config.prNumber,
  });

  const author = pr.user.login;
  console.log(`PR author: ${author}`);

  if (config.skipUsers.includes(author)) {
    console.log(`Author '${author}' is in skip list. Skipping analysis.`);
    return null;
  }

  return author;
}

/**
 * Fetches the diff for the PR
 * @param {AIDetectionConfig} config - Configuration object
 * @returns {string} PR diff content
 */
function fetchPRDiff(config) {
  console.log(`Fetching diff for PR #${config.prNumber}...`);

  try {
    const command = `gh pr diff ${config.prNumber} --repo ${config.repo}`;
    const diff = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      env: { ...process.env, GH_TOKEN: config.ghToken },
    });

    // Truncate if too large
    if (diff.length > config.diffMaxChars) {
      console.log(
        `Diff truncated from ${diff.length} to ${config.diffMaxChars} characters`,
      );
      return diff.substring(0, config.diffMaxChars);
    }

    console.log(`Diff fetched successfully (${diff.length} characters)`);
    return diff;
  } catch (error) {
    console.error('Error fetching PR diff.');
    throw new Error('Failed to fetch PR diff.');
  }
}

/**
 * Builds the default analysis prompt
 * @param {string} diff - Git diff content
 * @returns {string} Formatted prompt
 */
function buildDefaultPrompt(diff) {
  return `You are a code auditor. Analyze the following git diff.
Determine if the additions likely come from an AI generator.

Rules:
1. Ignore imports and config files.
2. Start your response EXACTLY with 'Confidence Score: X%' where X is 0-100.
3. Provide brief reasoning.

Diff to analyze:
${diff}`;
}

/**
 * Escapes a string for safe use as a shell argument
 * @param {string} arg - Argument to escape
 * @returns {string} Escaped argument
 */
function escapeShellArg(arg) {
  // Replace single quotes with '\'' and wrap in single quotes
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Runs Copilot CLI analysis on the diff
 * @param {string} diff - Git diff content
 * @param {AIDetectionConfig} config - Configuration object
 * @returns {string} Copilot analysis output
 */
function runCopilotAnalysis(diff, config) {
  console.log('Running Copilot analysis...');

  // Build prompt
  const prompt = config.customPrompt || buildDefaultPrompt(diff);

  try {
    // Execute copilot CLI in programmatic mode
    const escapedPrompt = escapeShellArg(prompt);
    const command = `copilot -p ${escapedPrompt}`;

    const output = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      env: { ...process.env, GH_TOKEN: config.ghToken },
    });

    console.log('--- Copilot Analysis Output ---');
    console.log(output);
    console.log('-------------------------------');

    return output;
  } catch (error) {
    console.error('Error running Copilot analysis.');
    throw new Error(`Copilot analysis failed.`);
  }
}

/**
 * Parses confidence score from Copilot output
 * @param {string} output - Copilot analysis output
 * @returns {number} Confidence score (0-100)
 */
function parseConfidenceScore(output) {
  // Match "Confidence Score: XX%" (case insensitive)
  const regex = /Confidence Score:\s*(\d+)%?/i;
  const match = output.match(regex);

  if (match && match[1]) {
    const score = parseInt(match[1], 10);
    console.log(`Parsed confidence score: ${score}%`);
    return score;
  }

  console.warn(
    'Could not parse confidence score from output. Defaulting to 0.',
  );
  return 0;
}

/**
 * Posts a comment on the PR with analysis results
 * @param {Octokit} octokit - GitHub API client
 * @param {AIDetectionConfig} config - Configuration object
 * @param {number} score - Confidence score
 * @param {string} analysis - Full analysis text
 */
async function postPRComment(octokit, config, score, analysis) {
  if (config.dryRun) {
    console.log('[DRY RUN] Would post PR comment (skipping)');
    return;
  }

  const [owner, repo] = config.repo.split('/');

  const body = `## 🤖 AI Detection Warning

**Confidence Score:** ${score}%

Copilot CLI analysis suggests this code is likely AI-generated.

<details>
<summary>Full Analysis</summary>

${analysis}
</details>`;

  try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: config.prNumber,
      body,
    });
    console.log('Posted warning comment to PR');
  } catch (error) {
    console.error('Error posting PR comment.');
    throw new Error('Failed to post PR comment.');
  }
}

/**
 * Adds a label to the PR
 * @param {Octokit} octokit - GitHub API client
 * @param {AIDetectionConfig} config - Configuration object
 */
async function addPRLabel(octokit, config) {
  if (!config.labelName) {
    console.log('No label configured, skipping label addition');
    return;
  }

  if (config.dryRun) {
    console.log(`[DRY RUN] Would add label: ${config.labelName} (skipping)`);
    return;
  }

  const [owner, repo] = config.repo.split('/');

  try {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: config.prNumber,
      labels: [config.labelName],
    });
    console.log(`Added label: ${config.labelName}`);
  } catch (error) {
    // Only ignore 404 (label doesn't exist), log other errors
    if (error.status === 404) {
      console.warn(
        `Label '${config.labelName}' does not exist in repository. Skipping label.`,
      );
    } else {
      console.error('Failed to add label.');
      // Don't throw - label is optional, only log the error for debugging purposes
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('=== AI Content Detection Starting ===');

    // 1. Load and validate configuration
    const cfg = new AIDetectionConfig();
    cfg.validate();

    if (cfg.dryRun) {
      console.log('*** DRY RUN MODE ENABLED ***');
      console.log(
        'Analysis will run but no comments/labels/failures will occur',
      );
    }

    // 2. Initialize Octokit
    const octokit = new Octokit({ auth: cfg.ghToken });

    // 3. Check if PR author should be skipped
    const author = await fetchPRAuthor(octokit, cfg);
    if (!author) {
      console.log('Skipping analysis due to skip list match');
      process.exit(0);
    }

    // 4. Fetch PR diff
    const diff = fetchPRDiff(cfg);
    if (!diff || diff.trim().length === 0) {
      console.log('No diff content found or diff is empty. Exiting.');
      process.exit(0);
    }

    // 5. Run Copilot analysis
    const analysis = runCopilotAnalysis(diff, cfg);

    // 6. Parse confidence score
    const score = parseConfidenceScore(analysis);

    // 7. Take action based on score
    if (score >= cfg.threshold) {
      console.log(
        `Score (${score}%) meets or exceeds threshold (${cfg.threshold}%)`,
      );

      // Post comment
      await postPRComment(octokit, cfg, score, analysis);

      // Add label
      await addPRLabel(octokit, cfg);

      // Fail if configured (and not dry run)
      if (cfg.failOnDetection && !cfg.dryRun) {
        console.error(
          'Failing workflow due to AI content detection above threshold',
        );
        process.exit(1);
      } else if (cfg.dryRun) {
        console.log('[DRY RUN] Would fail workflow (skipping)');
      }
    } else {
      console.log(
        `Score (${score}%) is below threshold (${cfg.threshold}%). No action taken.`,
      );
    }

    console.log('=== AI Content Detection Complete ===');
  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run main function
main();
