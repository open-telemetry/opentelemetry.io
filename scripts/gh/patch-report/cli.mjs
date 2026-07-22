#!/usr/bin/env node
// CLI entry point: post or update the comment that tracks a patch-pipeline
// run. Runs in trusted jobs so the requestor always learns the result, even
// when the patch could not be generated or applied. All pure logic (message
// selection) lives in ./index.mjs.

import { appendFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

import { buildAckComment, buildOutcomeComment } from './index.mjs';

const HELP = `Usage: cli.mjs --pr <num> [options]

Compose the comment that tracks a patch-pipeline run and post it to the PR
via the GitHub API (authenticating with $GH_TOKEN). With --ack, posts an
acknowledgement that the run is in progress and emits the comment id (as a
\`comment_id\` step output under GitHub Actions); the outcome invocation can
then pass that id as --comment-id to update the same comment in place.

Options:
  -p, --pr <num>               Pull request number to comment on. Required.
  -a, --ack                    Post the in-progress acknowledgement instead of
                               an outcome, and emit its comment id.
      --comment-id <id>        Update this existing comment instead of
                               creating a new one (e.g. the ack comment).
                               Mutually exclusive with --ack.
      --directive-url <url>    URL of the comment that requested the action;
                               linked from the posted comment.
      --label <name>           The action as requested (e.g. the command).
      --pr-state <state>       PR state: 'open' or 'closed' ('' acts as open).
      --pr-merged <bool>       'true' when the PR is merged.
      --not-run-reason <text>  Reason the pipeline deliberately declined to
                               run the action; when set, it is relayed instead
                               of a generation/apply outcome.
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
    ack: { type: 'boolean', short: 'a', default: false },
    'comment-id': { type: 'string', default: '' },
    'directive-url': { type: 'string', default: '' },
    label: { type: 'string', default: '' },
    'pr-state': { type: 'string', default: '' },
    'pr-merged': { type: 'string', default: '' },
    'not-run-reason': { type: 'string', default: '' },
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

if (values.ack && values['comment-id']) {
  console.error('--ack and --comment-id are mutually exclusive\n');
  console.error(HELP);
  process.exit(1);
}

const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
const runUrl = `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
const runId = GITHUB_RUN_ID || '';
const directiveUrl = values['directive-url'];

const body = values.ack
  ? buildAckComment({ directiveUrl, runId, runUrl })
  : buildOutcomeComment({
      label: values.label,
      prState: values['pr-state'],
      prMerged: values['pr-merged'],
      notRunReason: values['not-run-reason'],
      generateResult: values['generate-result'],
      patchSkipped: values['patch-skipped'],
      commandExitStatus: values['command-exit-status'],
      applyResult: values['apply-result'],
      runId,
      runUrl,
      directiveUrl,
      hint: values.hint,
    });

const commentId = values['comment-id'];
const action = commentId
  ? `Updating comment ${commentId} on`
  : 'Posting comment to';
console.log(`${action} PR #${values.pr}:`);
console.log(body);

if (values['dry-run']) process.exit(0);

// Use the REST API directly (rather than `gh pr comment`) so that we can
// capture the comment id on create, and update an existing comment in place.
const endpoint = commentId
  ? `repos/${GITHUB_REPOSITORY}/issues/comments/${commentId}`
  : `repos/${GITHUB_REPOSITORY}/issues/${values.pr}/comments`;
const res = spawnSync(
  'gh',
  [
    'api',
    ...(commentId ? ['-X', 'PATCH'] : []),
    endpoint,
    '-f',
    `body=${body}`,
    '--jq',
    '.id',
  ],
  { encoding: 'utf8' },
);
process.stderr.write(res.stderr ?? '');
if (res.status !== 0) {
  // Surface any captured API error body, which gh writes to stdout.
  process.stdout.write(res.stdout ?? '');
  process.exit(res.status ?? 1);
}

const id = (res.stdout ?? '').trim();
console.log(`Comment id: ${id}`);
// Only the ack invocation's comment id is a meaningful output (on the
// report invocation's fallback create, the new comment's id has no consumer).
const githubOutput = process.env.GITHUB_OUTPUT;
if (values.ack && githubOutput) {
  appendFileSync(githubOutput, `comment_id=${id}\n`);
}
