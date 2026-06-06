#!/usr/bin/env node
// CLI entry point for the "Report workflow failure" reusable workflow.
//
// Reads the failing run's context from the environment (set by the workflow)
// and opens or updates the tracking issue. All pure logic lives in ./index.mjs.
//
// Required environment:
//   GH_TOKEN        Used by `gh`; needs `issues: write`.
//   REPO            `owner/name` of the caller repository.
//   WORKFLOW_NAME   Caller workflow name.
//   WORKFLOW_URL    URL of the failing run.
//   HEAD_BRANCH     Branch that failed.
//   HEAD_SHA        Commit that failed.
//
// Optional environment (with defaults):
//   LABEL           Existing label to apply. Default: `CI/infra`.
//   ISSUE_TYPE      Org issue type name. Default: `Bug`.
//   ISSUE_PREFIX    Title prefix. Default: `Workflow failed`.

import { spawnSync } from 'node:child_process';

import { reportFailure } from './index.mjs';

/**
 * Synchronous `gh` runner used by the orchestrator.
 *
 * @param {string[]} args
 * @returns {{ stdout: string, status: number }}
 */
function runGh(args) {
  const res = spawnSync('gh', args, { encoding: 'utf8' });
  if (res.error) throw res.error;
  if (res.stderr) process.stderr.write(res.stderr);
  return { stdout: res.stdout ?? '', status: res.status ?? 1 };
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

reportFailure({
  repo: requireEnv('REPO'),
  workflow: requireEnv('WORKFLOW_NAME'),
  branch: requireEnv('HEAD_BRANCH'),
  sha: requireEnv('HEAD_SHA'),
  runUrl: requireEnv('WORKFLOW_URL'),
  label: process.env.LABEL || 'CI/infra',
  issueType: process.env.ISSUE_TYPE || 'Bug',
  issuePrefix: process.env.ISSUE_PREFIX || 'Workflow failed',
  runGh,
});
