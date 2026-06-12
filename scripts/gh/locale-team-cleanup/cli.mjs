#!/usr/bin/env node
// CLI entry point for the locale team cleanup helper. Wires the real `gh`
// runner and delegates all logic to `runCleanup` in ./index.mjs.

import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

import { runCleanup } from './index.mjs';

const HELP = `Usage: cli.mjs [options]

Remove interim docs-core members from docs-<loc>-* teams; see README.md and
https://github.com/open-telemetry/opentelemetry.io/issues/10374.

Options:
  -n, --dry-run     Read-only: print planned removals (the default).
  -f, --no-dry-run  Actually remove memberships. Requires org-owner
                    privileges — see the README cautions.
  -h, --help        Show this help.
`;

function runGh(args) {
  const res = spawnSync('gh', args, { encoding: 'utf8' });
  return {
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
    status: res.status ?? 1,
  };
}

function main() {
  let values;
  try {
    ({ values } = parseArgs({
      options: {
        'dry-run': { type: 'boolean', short: 'n' },
        'no-dry-run': { type: 'boolean', short: 'f' },
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
  if (values['dry-run'] && values['no-dry-run']) {
    console.error(`Pass at most one of --dry-run and --no-dry-run.\n\n${HELP}`);
    process.exit(2);
  }

  const dryRun = !values['no-dry-run'];
  console.log(`== Locale team cleanup (${dryRun ? 'DRY RUN' : 'APPLY'}) ==\n`);
  const { exitCode } = runCleanup({ runGh, dryRun, log: console.log });
  process.exit(exitCode);
}

main();
