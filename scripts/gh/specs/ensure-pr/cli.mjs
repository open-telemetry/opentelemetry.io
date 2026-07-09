#!/usr/bin/env node
// CLI entry point: create or finalize the integration-branch PR of a spec
// workflow, according to the MODE picked by ../pick-branch.
//
// Usage:
//   node scripts/gh/specs/ensure-pr/cli.mjs [--spec=<id>] [--[no-]dry-run]
//
// Flags:
//   -s, --spec=<id>   One of the keys defined in SPECS (e.g. `otel`,
//                     `semconv`). Defaults to `otel`. Determines the upstream
//                     repo name used in PR titles and bodies.
//       --dry-run     Skip side-effecting operations: no `git commit`/`git
//                     push`, no `gh pr create`/`ready`/`edit`. Read-only
//                     `git`/`gh` state queries still run.
//       --no-dry-run  Force writes even when running locally.
//                     Default: dry-run is ON unless GITHUB_ACTIONS=true.
//   -h, --help        Print usage and exit.
//
// Required environment:
//   MODE, VERSION, BRANCH   As written to $GITHUB_ENV by pick-branch; strictly
//                           validated (set them manually for local runs).
//   GH_TOKEN                Used by `gh`; needs PR write access when writes
//                           are enabled.
//
// The integration branch is expected to be checked out (with origin/main
// fetched) so that the bootstrap check `git rev-list origin/main..HEAD` is
// meaningful.

import { spawnSync } from 'node:child_process';

import { parseCliArgs, SPECS } from '../pick-branch/index.mjs';
import { cliUsage, ensurePullRequest, readEnvInputs } from './index.mjs';

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

  const { action } = ensurePullRequest({
    mode,
    repo,
    version,
    branch,
    dryRun,
    runGh: (args) => run('gh', args),
    runGit: (args) => run('git', args),
  });

  console.log(`[done] action: ${action}`);
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
