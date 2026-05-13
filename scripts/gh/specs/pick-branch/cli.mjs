#!/usr/bin/env node
// CLI entry point: pick the integration branch / version for a spec workflow.
//
// Usage:
//   node scripts/gh/specs/pick-branch/cli.mjs [--spec=<id>] [--[no-]dry-run]
//
// Flags:
//   -s, --spec=<id>   One of the keys defined in SPECS (e.g. `otel`,
//                     `semconv`). Defaults to `otel`. Determines the upstream
//                     repo and branch slug.
//       --dry-run     Skip side-effecting operations: do NOT write to
//                     $GITHUB_ENV, do NOT call `gh label create`/`gh issue
//                     create`. Read-only `git`/`gh` calls still run.
//       --no-dry-run  Force writes even when running locally.
//                     Default: dry-run is ON unless GITHUB_ACTIONS=true.
//   -h, --help        Print usage and exit.
//
// Required environment when writes are enabled:
//   GH_TOKEN          Used by `gh`; needs `issues: write` for issue creation.
//   GITHUB_ENV        Path written by GitHub Actions. Optional locally; if
//                     unset, VERSION/BRANCH are written to stdout only.

import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import {
  buildIssueBody,
  cliUsage,
  computeIntegrationVersion,
  ensureWarningIssueOpen,
  formatGithubEnv,
  parseCliArgs,
  SPECS,
} from './index.mjs';

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

  const mode = dryRun ? 'DRY-RUN' : 'WRITE';
  console.log(`[mode] ${mode} (reason: ${dryRunReason}; spec=${spec})`);
  if (dryRun) {
    console.log(
      '  No writes to $GITHUB_ENV; no `gh label create`/`gh issue create`. Read-only `git`/`gh` calls still run. Pass --no-dry-run to perform writes.',
    );
  } else {
    console.log(
      '  Will append VERSION/BRANCH to $GITHUB_ENV (if set) and may create a tracking issue via `gh`. Pass --dry-run to skip writes.',
    );
  }

  const githubEnv = dryRun ? null : process.env.GITHUB_ENV || null;
  if (!dryRun && !githubEnv) {
    console.log(
      '[note] GITHUB_ENV is unset; VERSION/BRANCH will be printed to stdout only.',
    );
  }

  const branchPrefix = `otelbot/${abbr}-integration`;
  const repoUrl = `https://github.com/open-telemetry/${repo}`;

  const branchesOutput = execFileSync('git', ['branch', '-r'], {
    encoding: 'utf8',
  });

  const isReleased = (version) =>
    spawnSync('git', ['ls-remote', '--exit-code', '--tags', repoUrl, version], {
      stdio: 'ignore',
    }).status === 0;

  const getLatestReleaseTag = () => {
    const out = execFileSync(
      'gh',
      [
        'release',
        'view',
        '--repo',
        `open-telemetry/${repo}`,
        '--json',
        'tagName',
        '--jq',
        '.tagName',
      ],
      { encoding: 'utf8' },
    );
    return out.trim();
  };

  const { version, branch, warnings, latestRelease } =
    computeIntegrationVersion({
      branchPrefix,
      branchesOutput,
      isReleased,
      getLatestReleaseTag,
    });

  console.log(`[upstream] Latest released ${repo} version: ${latestRelease}`);
  console.log(`[picked]   Next dev VERSION: ${version} (BRANCH: ${branch})`);

  const envLines = formatGithubEnv({ version, branch });
  if (githubEnv) appendFileSync(githubEnv, envLines);
  process.stdout.write(envLines);

  if (warnings.length > 0) {
    ensureWarningIssueOpen({
      title: `${repo} integration workflow: warnings detected`,
      label: `${abbr}-integration-warning`,
      body: buildIssueBody({ warnings, repo, abbr, runUrl: actionsRunUrl() }),
      dryRun,
      runGh,
    });
  }
}

/**
 * Real `gh` runner used by the CLI. Always returns `{ stdout, status }` so the
 * pure helper can branch on exit code without throwing.
 *
 * @param {string[]} args
 * @returns {{ stdout: string, status: number }}
 */
function runGh(args) {
  const result = spawnSync('gh', args, { encoding: 'utf8' });
  return { stdout: result.stdout ?? '', status: result.status ?? 1 };
}

function actionsRunUrl() {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
  if (!GITHUB_SERVER_URL || !GITHUB_REPOSITORY || !GITHUB_RUN_ID) return null;
  return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
}

function fatal(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}
