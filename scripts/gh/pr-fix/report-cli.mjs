#!/usr/bin/env node
// CLI entry point: post the single outcome comment for a `/fix` run. Runs in the
// trusted `report` job so the requestor always learns the result, even when
// patch generation failed before anything could be applied. All pure logic
// (message selection) lives in ./index.mjs.
//
// Required environment:
//   GH_TOKEN            Used by `gh`; needs `pull-requests: write`.
//   PR_NUM              The pull request number to comment on.
//
// Outcome inputs (passed from job results/outputs; may be empty):
//   ACTION_NAME         The `/fix` directive as written.
//   GENERATE_RESULT     Result of the patch-generation job.
//   PATCH_SKIPPED       'true' when generation produced no changes.
//   ACTION_EXIT_STATUS  Exit status of the fix command.
//   APPLY_RESULT        Result of the apply job.
//
// Provided by GitHub Actions:
//   GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID

import { spawnSync } from 'node:child_process';

import { buildOutcomeComment } from './index.mjs';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
const runUrl = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;

const body = buildOutcomeComment({
  actionName: process.env.ACTION_NAME || '',
  generateResult: process.env.GENERATE_RESULT || '',
  patchSkipped: process.env.PATCH_SKIPPED || '',
  actionExitStatus: process.env.ACTION_EXIT_STATUS || '',
  applyResult: process.env.APPLY_RESULT || '',
  runId: GITHUB_RUN_ID || '',
  runUrl,
});

const prNum = requireEnv('PR_NUM');

console.log(`Posting outcome comment to PR #${prNum}:`);
console.log(body);

const res = spawnSync('gh', ['pr', 'comment', prNum, '--body', body], {
  stdio: 'inherit',
});
process.exit(res.status ?? 1);
