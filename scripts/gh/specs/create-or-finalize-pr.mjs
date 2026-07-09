#!/usr/bin/env node
// Create or finalize the integration-branch PR of a spec workflow, according
// to the MODE picked by ./pick-branch. Run with --help for usage.

import { spawnSync } from 'node:child_process';

import { parseCliArgs, SPECS } from './pick-branch/index.mjs';
import {
  createOrFinalizePullRequest,
  readEnvInputs,
} from './create-or-finalize-pr/index.mjs';

main();

function main() {
  let parsed;
  try {
    parsed = parseCliArgs(process.argv.slice(2));
  } catch (err) {
    fatal(`${err.message}\n\n${cliUsage()}`);
  }

  if (parsed.help) {
    process.stdout.write(`${cliUsage()}\n`);
    process.exit(0);
  }

  const { spec, dryRun, dryRunReason } = parsed;
  const { repo, abbr } = SPECS[spec];

  let inputs;
  try {
    inputs = readEnvInputs(process.env, { abbr });
  } catch (err) {
    fatal(`${err.message}\n\n${cliUsage()}`);
  }
  const { mode, version, branch } = inputs;

  console.log(
    `[mode] ${dryRun ? 'DRY-RUN' : 'WRITE'} (reason: ${dryRunReason}; spec=${spec})`,
  );
  console.log(`[input] MODE: ${mode}; VERSION: ${version}; BRANCH: ${branch}`);

  const outcome = createOrFinalizePullRequest({
    mode,
    repo,
    version,
    branch,
    dryRun,
    runGh: (args) => run('gh', args),
    runGit: (args) => run('git', args),
  });

  console.log(`[done] outcome: ${outcome}${dryRun ? ' (dry-run)' : ''}`);
}

/**
 * Run a command synchronously, returning `{ stdout, status }` so the pure
 * helper can branch on exit code without throwing. Stderr passes through to
 * the workflow log.
 *
 * @param {string} cmd
 * @param {string[]} args
 * @returns {{ stdout: string, status: number }}
 */
function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  return { stdout: result.stdout ?? '', status: result.status ?? 1 };
}

function fatal(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

/** Help text for `--help`. */
function cliUsage() {
  return [
    'Create or finalize the pull request of an integration-branch workflow',
    'run. In dev mode, open the draft integration PR if none exists; in',
    'release mode, create the release PR, promote the existing draft, or',
    're-sync the title of an already-final PR.',
    '',
    'Usage: scripts/gh/specs/create-or-finalize-pr.mjs \\',
    '         [--spec <otel|semconv>] [--[no-]dry-run]',
    '',
    'Options:',
    '  -s, --spec <otel|semconv>  Selects the upstream spec (default: otel).',
    '      --dry-run              Skip writes (default when run locally).',
    '      --no-dry-run           Perform writes (default under GitHub Actions).',
    '  -h, --help                 Show this help.',
    '',
    'Environment:',
    '  MODE, VERSION, BRANCH  As written to $GITHUB_ENV by pick-branch;',
    '                         strictly validated (set manually for local runs).',
    '  GH_TOKEN               Used by `gh`; needs PR write access when writes',
    '                         are enabled.',
    '',
    'Expects the integration branch to be checked out, with origin/main',
    'fetched (for the branch-has-commits check).',
  ].join('\n');
}
