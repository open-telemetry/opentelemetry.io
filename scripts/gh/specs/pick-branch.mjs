#!/usr/bin/env node
// Pick the integration branch, version, and MODE (dev vs release) for a spec
// workflow run, and write them to $GITHUB_ENV. Run with --help for usage.

import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import {
  buildIssueBody,
  computeIntegrationVersion,
  ensureWarningIssueOpen,
  formatGithubEnv,
  parseCliArgs,
  SPECS,
} from './pick-branch/index.mjs';

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
      '  Will append MODE/VERSION/BRANCH to $GITHUB_ENV (if set) and may create a tracking issue via `gh`. Pass --dry-run to skip writes.',
    );
  }

  const githubEnv = dryRun ? null : process.env.GITHUB_ENV || null;
  if (!dryRun && !githubEnv) {
    console.log(
      '[note] GITHUB_ENV is unset; MODE/VERSION/BRANCH will be printed to stdout only.',
    );
  }

  const branchPrefix = `otelbot/${abbr}-integration`;
  const repoUrl = `https://github.com/open-telemetry/${repo}`;

  const branchesOutput = execFileSync('git', ['branch', '-r'], {
    encoding: 'utf8',
  });

  // Submodule pin on the current checkout (main), e.g. `spec-pin = v1.58.0`.
  const pinnedVersion = execFileSync(
    'git',
    [
      'config',
      '-f',
      '.gitmodules',
      `submodule.content-modules/${repo}.${abbr}-pin`,
    ],
    { encoding: 'utf8' },
  ).trim();

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

  const {
    mode: pickMode,
    version,
    branch,
    warnings,
    latestRelease,
  } = computeIntegrationVersion({
    branchPrefix,
    branchesOutput,
    pinnedVersion,
    isReleased,
    getLatestReleaseTag,
  });

  console.log(`[upstream] Latest released ${repo} version: ${latestRelease}`);
  console.log(`[pinned]   Version pinned on main: ${pinnedVersion}`);
  console.log(
    `[picked]   MODE: ${pickMode}; VERSION: ${version} (BRANCH: ${branch})`,
  );

  const envLines = formatGithubEnv({ mode: pickMode, version, branch });
  if (githubEnv) appendFileSync(githubEnv, envLines);
  process.stdout.write(envLines);

  if (warnings.length > 0) {
    ensureWarningIssueOpen({
      title: `${repo} integration workflow: warnings detected`,
      label: `${abbr}-integration-warning`,
      body: buildIssueBody({ warnings, repo, spec, runUrl: actionsRunUrl() }),
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

/** Help text for `--help`. */
function cliUsage() {
  return [
    'Pick the integration-branch MODE, VERSION, and BRANCH for a spec',
    'workflow run and write them to $GITHUB_ENV (or stdout when GITHUB_ENV',
    'is unset). MODE is `release` when the latest upstream release is newer',
    'than the version pinned on main, else `dev`. Opens a tracking issue on',
    'warnings.',
    '',
    'Usage: scripts/gh/specs/pick-branch.mjs \\',
    '         [--spec <otel|semconv>] [--[no-]dry-run]',
    '',
    'Options:',
    '  -s, --spec <otel|semconv>  Selects the upstream spec (default: otel).',
    '      --dry-run              Skip writes (default when run locally).',
    '      --no-dry-run           Perform writes (default under GitHub Actions).',
    '  -h, --help                 Show this help.',
    '',
    'Environment:',
    '  GH_TOKEN    Used by `gh`; needs `issues: write` when writes are enabled.',
    '  GITHUB_ENV  Output path (set by GitHub Actions). Optional locally; if',
    '              unset, MODE/VERSION/BRANCH are written to stdout only.',
  ].join('\n');
}
