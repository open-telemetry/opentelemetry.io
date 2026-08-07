#!/usr/bin/env node
// CLI entry point for the locale team cleanup helper. Wires the real `gh`
// runner and delegates all logic to `runCleanup` in ./index.mjs.

import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

import { DOCS_CORE, LOCALES, runCleanup } from './index.mjs';

const DEFAULT_TIMEOUT_S = 10;

const HELP = `Usage: cli.mjs [options]

Remove interim docs-core members from docs-<loc>-* teams; see README.md and
https://github.com/open-telemetry/opentelemetry.io/issues/10374.

The run is idempotent: it plans from live rosters, so re-running after a
(partial) cleanup only removes what is left.

Options:
  -n, --dry-run        Read-only: print planned removals (the default).
  -f, --no-dry-run     Actually remove memberships. Requires org-owner
                       privileges -- see the README cautions.
  -l, --locale <loc>   Restrict to this locale (repeatable), e.g. -l bn.
  -u, --user <login>   Restrict to this user (repeatable), e.g. -u cartermp.
      --max <n>        Remove at most <n> memberships.
      --self-too       Also remove the runner (last from each team). By
                       default the runner's memberships are listed but
                       skipped, since self-removal destroys their
                       team-maintainer role and cannot be undone by the
                       runner.
      --timeout <s>    Per-gh-call timeout in seconds (default: ${DEFAULT_TIMEOUT_S}).
  -h, --help           Show this help.
`;

function makeRunGh(timeoutS) {
  return (args) => {
    const res = spawnSync('gh', args, {
      encoding: 'utf8',
      timeout: timeoutS * 1000,
    });
    if (res.error?.code === 'ETIMEDOUT') {
      return {
        stdout: '',
        stderr: `gh timed out after ${timeoutS}s: gh ${args.join(' ')}`,
        status: 1,
      };
    }
    return {
      stdout: res.stdout ?? '',
      stderr: res.stderr ?? '',
      status: res.status ?? 1,
    };
  };
}

function main() {
  let values;
  try {
    ({ values } = parseArgs({
      options: {
        'dry-run': { type: 'boolean', short: 'n' },
        'no-dry-run': { type: 'boolean', short: 'f' },
        locale: { type: 'string', short: 'l', multiple: true },
        user: { type: 'string', short: 'u', multiple: true },
        max: { type: 'string' },
        'self-too': { type: 'boolean' },
        timeout: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
      },
    }));
  } catch (err) {
    console.error(`${err.message}\n\n${HELP}`);
    process.exit(2);
  }

  if (values.help) {
    console.log(HELP);
    return;
  }
  function usageError(msg) {
    console.error(`${msg}\n\n${HELP}`);
    process.exit(2);
  }

  if (values['dry-run'] && values['no-dry-run']) {
    usageError('Pass at most one of --dry-run and --no-dry-run.');
  }

  const locales = values.locale;
  for (const loc of locales ?? []) {
    if (!LOCALES.includes(loc)) {
      usageError(
        `Unknown locale: ${loc}. Expected one of: ${LOCALES.join(', ')}.`,
      );
    }
  }

  const users = values.user;
  for (const user of users ?? []) {
    if (!DOCS_CORE.includes(user)) {
      usageError(
        `Not a docs-core member: ${user}. ` +
          `Expected one of: ${DOCS_CORE.join(', ')}.`,
      );
    }
  }

  let max;
  if (values.max !== undefined) {
    max = Number(values.max);
    if (!Number.isInteger(max) || max < 1) {
      usageError(`--max must be a positive integer, got: ${values.max}.`);
    }
  }

  let timeoutS = DEFAULT_TIMEOUT_S;
  if (values.timeout !== undefined) {
    timeoutS = Number(values.timeout);
    if (!Number.isFinite(timeoutS) || timeoutS <= 0) {
      usageError(
        `--timeout must be a positive number, got: ${values.timeout}.`,
      );
    }
  }

  const dryRun = !values['no-dry-run'];
  const selfToo = values['self-too'] ?? false;

  // Removing yourself from a team destroys your team-maintainer role on it,
  // which the remaining removals may depend on. So by default the runner's
  // memberships are listed but skipped; with --self-too they are removed
  // last from each team. Detect who is running.
  const runGh = makeRunGh(timeoutS);
  const whoami = runGh(['api', 'user', '-q', '.login']);
  if (whoami.status !== 0) {
    console.error(`Could not determine current gh user: ${whoami.stderr}`);
    process.exit(1);
  }
  const self = whoami.stdout.trim();

  console.log(
    `== Locale team cleanup (${dryRun ? 'DRY RUN' : 'APPLY'}; as ${self}) ==\n`,
  );
  const { exitCode } = runCleanup({
    runGh,
    dryRun,
    locales,
    users,
    max,
    self,
    selfToo,
    log: console.log,
  });
  process.exit(exitCode);
}

main();
