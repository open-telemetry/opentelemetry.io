#!/usr/bin/env node
// CLI entry point: post the single outcome comment for a patch-pipeline run.
// Runs in a trusted job so the requestor always learns the result, even when
// the patch could not be generated or applied. All pure logic (message
// selection) lives in ./index.mjs.

import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

import { buildOutcomeComment } from './index.mjs';

const HELP = `Usage: cli.mjs --pr <num> [options]

Compose the outcome comment for a patch-pipeline run and post it to the PR
with \`gh pr comment\` (which authenticates via $GH_TOKEN).

Options:
  -p, --pr <num>               Pull request number to comment on. Required.
      --label <name>           The action as requested (e.g. the command).
      --pr-state <state>       PR state: 'open' or 'closed' ('' acts as open).
      --pr-merged <bool>       'true' when the PR is merged.
      --generate-result <r>    Result of the patch-generation job.
      --patch-skipped <bool>   'true' when generation produced no changes.
      --command-exit-status <n> Exit status of the patch-producing command.
      --apply-result <r>       Result of the apply job.
      --hint <text>            Guidance shown when the request could not be
                               identified (e.g. how to phrase it correctly).
  -n, --dry-run                Print the comment without posting it.
  -h, --help                   Show this help.

The run link is derived from $GITHUB_SERVER_URL, $GITHUB_REPOSITORY, and
$GITHUB_RUN_ID (provided by GitHub Actions).
`;

const { values } = parseArgs({
  options: {
    pr: { type: 'string', short: 'p' },
    label: { type: 'string', default: '' },
    'pr-state': { type: 'string', default: '' },
    'pr-merged': { type: 'string', default: '' },
    'generate-result': { type: 'string', default: '' },
    'patch-skipped': { type: 'string', default: '' },
    'command-exit-status': { type: 'string', default: '' },
    'apply-result': { type: 'string', default: '' },
    hint: { type: 'string', default: '' },
    'dry-run': { type: 'boolean', short: 'n', default: false },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

if (!values.pr) {
  console.error('Missing required option: --pr\n');
  console.error(HELP);
  process.exit(1);
}

const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
const runUrl = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;

const body = buildOutcomeComment({
  label: values.label,
  prState: values['pr-state'],
  prMerged: values['pr-merged'],
  generateResult: values['generate-result'],
  patchSkipped: values['patch-skipped'],
  commandExitStatus: values['command-exit-status'],
  applyResult: values['apply-result'],
  runId: GITHUB_RUN_ID || '',
  runUrl,
  hint: values.hint,
});

console.log(`Posting outcome comment to PR #${values.pr}:`);
console.log(body);

if (values['dry-run']) process.exit(0);

const res = spawnSync('gh', ['pr', 'comment', values.pr, '--body', body], {
  stdio: 'inherit',
});
process.exit(res.status ?? 1);
