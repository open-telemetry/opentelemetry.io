#!/usr/bin/env node
// CLI entry point for the "Locale auto-merge" workflow. Wires the real `gh`
// runner and delegates all logic to `runAutoMergeCommand` in ./index.mjs.
// Run with `--help` for usage (the `HELP` text below is the single source).

import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

import { discoverLocales, runAutoMergeCommand } from './index.mjs';

const DEFAULT_REPO = 'open-telemetry/opentelemetry.io';

const SYNOPSIS = 'Usage: cli.mjs --pr <num> [options]';

const HELP = `${SYNOPSIS}

Toggle auto-merge on a locale-only PR for the "Locale auto-merge" workflow.

Use --user to test the verdict *as if* a given user had commented, so you can
confirm the locale-team authorization gate before wiring up the workflow.

Command (default: --enable):
  -e, --enable         Enable auto-merge (the default). Shortcut for
                       --comment '/auto-merge:enable'.
  -d, --disable        Shortcut for --comment '/auto-merge:disable'.
  -c, --comment <body> Raw triggering comment body (the workflow passes this).

Options:
  -p, --pr <num>       Pull request number. Required.
  -r, --repo <o/n>     Default: $REPO or ${DEFAULT_REPO}.
  -u, --user <login>   Requesting user whose locale-team membership is checked
                       (the auto-merge comment author). Default: $COMMENT_AUTHOR
                       or the authenticated gh user.
  -n, --dry-run        Read-only: print the verdict and the mutating commands
                       it would run, without changing anything. The default,
                       except under GitHub Actions.
  -f, --no-dry-run     Actually mutate auto-merge and comment. The default
                       under GitHub Actions; pass it to force a real run
                       locally.
  -v, --verbose        Log each changed file as it is classified and each
                       locale-team membership check (pass/fail).
  -h, --help           Show this help.

gh uses your existing gh authentication (or GH_TOKEN if set). Reading team
membership needs a token with org read access; a real (non-dry) run needs a
sufficiently privileged token (the workflow uses the DOCS bot token).
See ./smoke-test.sh for ready-to-run examples against real PRs.`;

/** Print a message plus the one-line synopsis to stderr and exit non-zero. */
function fail(message) {
  console.error(message);
  console.error(SYNOPSIS);
  process.exit(1);
}

/**
 * Run `gh` and return `{ stdout, status }` without throwing.
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

/** Resolve the login of the authenticated `gh` user. */
function ghCurrentUser() {
  const { stdout, status } = runGh(['api', 'user', '--jq', '.login']);
  if (status !== 0) fail('Could not resolve the current gh user; pass --user.');
  return stdout.trim();
}

let values;
try {
  ({ values } = parseArgs({
    options: {
      pr: { type: 'string', short: 'p' },
      enable: { type: 'boolean', short: 'e', default: false },
      disable: { type: 'boolean', short: 'd', default: false },
      comment: { type: 'string', short: 'c' },
      repo: { type: 'string', short: 'r' },
      user: { type: 'string', short: 'u' },
      'dry-run': { type: 'boolean', short: 'n', default: false },
      'no-dry-run': { type: 'boolean', short: 'f', default: false },
      verbose: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  }));
} catch (err) {
  fail(err.message);
}

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

// Resolve the command: at most one of --enable / --disable / --comment;
// defaults to enable when none is given (the common manual case).
const commands = [];
if (values.enable) commands.push('/auto-merge:enable');
if (values.disable) commands.push('/auto-merge:disable');
if (values.comment !== undefined) commands.push(values.comment);
if (commands.length > 1) {
  fail('Specify only one of --enable, --disable, or --comment.');
}
const commentBody = commands.length === 1 ? commands[0] : '/auto-merge:enable';

if (!values.pr) fail('Missing required --pr <number>.');

// Resolve dry-run: explicit flags win; otherwise default to a dry run unless
// running under GitHub Actions.
if (values['dry-run'] && values['no-dry-run']) {
  fail('Specify only one of --dry-run / --no-dry-run.');
}
const dryRun = values['no-dry-run']
  ? false
  : values['dry-run'] || process.env.GITHUB_ACTIONS !== 'true';

const repo = values.repo || process.env.REPO || DEFAULT_REPO;
const commentAuthor =
  values.user || process.env.COMMENT_AUTHOR || ghCurrentUser();

const { exitCode } = runAutoMergeCommand({
  repo,
  prNum: values.pr,
  commentAuthor,
  commentBody,
  knownLocales: discoverLocales(),
  dryRun,
  verbose: values.verbose,
  runGh,
  log: (message) => console.log(message),
});

process.exit(exitCode);
