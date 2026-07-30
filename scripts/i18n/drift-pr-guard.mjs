#!/usr/bin/env node

// Scoped drift-state guard (the `I18N check` workflow): each localized page
// changed by a PR must leave the PR with an accurate drift state — synced
// (pin current, status cleared) or explicitly marked drifted. Runs the
// drift-status writer over the changed pages only and fails when it corrects
// anything; tree-wide status syncs belong to the nightly Housekeeping run.
// Needs history down to the changed pages' pins (CI uses fetch-depth: 0).
// Dependency-free, like drift.mjs: the workflow runs it without npm install.
// Known benign race: in a merge_group, the diff can include another queued
// PR's EN edits, flagging a copy this PR didn't touch — the failure output
// names the page and remedy, and the next queue run clears it.
// Policy:
// https://opentelemetry.io/docs/contributing/localization/#drift-status
//
// Usage: drift-pr-guard.mjs [BASE_REF]   (default: origin/main)

import { execFile } from 'node:child_process';
import * as path from 'node:path';
import { realpathSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { driftReportForRepo, writeStatuses } from './drift.mjs';

const execFileP = promisify(execFile);

// Localized (non-EN) content pages among the given repo-relative paths.
export function selectLocalizedPages(paths) {
  return paths.filter(
    (p) =>
      p.startsWith('content/') &&
      !p.startsWith('content/en/') &&
      p.endsWith('.md'),
  );
}

// Report of the localized pages the PR changes (vs the merge-base with
// baseRef) whose stored drift state needed correcting; empty means the PR
// leaves every changed page accurate. Deletions are excluded (nothing left
// to carry a status); renames surface as additions so the new path is
// guarded. Corrections are written to the working tree so the caller can
// show them as a diff.
export async function guardDriftState(rootDir, baseRef) {
  const git = async (...args) =>
    (await execFileP('git', args, { cwd: rootDir })).stdout.trim();
  const base = await git('merge-base', baseRef, 'HEAD');
  const diffOut = await git(
    'diff',
    '--name-only',
    '--no-renames',
    '--diff-filter=d',
    base,
    'HEAD',
    '--',
    'content',
  );
  const pages = selectLocalizedPages(diffOut.split('\n').filter(Boolean));
  if (!pages.length) return { pages, actions: [] };
  const report = await driftReportForRepo(rootDir, pages);
  return { pages, actions: writeStatuses(rootDir, report) };
}

async function mainCLI() {
  const rootDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..',
  );
  const { pages, actions } = await guardDriftState(
    rootDir,
    process.argv[2] ?? 'origin/main',
  );
  if (!pages.length) {
    console.log('No localized pages changed; drift-state guard is a no-op.');
    return;
  }
  if (!actions.length) {
    console.log(
      `Every changed localized page (${pages.length}) leaves an accurate drift state. <3`,
    );
    return;
  }
  const { stdout: diff } = await execFileP(
    'git',
    ['diff', '--', ...actions.map(([page]) => page)],
    { cwd: rootDir },
  );
  console.log(diff);
  console.log(`---
Each localized page changed by this PR must leave the PR with an accurate
drift state; the diff above shows the corrections needed. Either sync a page
with its English counterpart and refresh its pin,

    npm run check:i18n -- commit HEAD PATHS

or record the remaining drift,

    npm run fix:i18n:status -- PATHS

then commit the result. For details, see
https://opentelemetry.io/docs/contributing/localization/#drift-status`);
  process.exitCode = 1;
}

// Robust under symlinked invocation paths (worktrees): compare real paths.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  await mainCLI();
}
