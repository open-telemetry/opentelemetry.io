// Logic for the check-report wrapper around the site link check: the
// messages that make a link-check outcome actionable, and the stale-branch
// guard that runs before the check. Process wiring lives in ./cli.mjs; tests
// in ./index.test.mjs.

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const RULE = '='.repeat(74);

// True on a branch from before the owned cache: no link-cache.jsonc while git
// still tracks .lycheecache. The check would run in lychee-norm-cache's legacy
// mode there and rewrite a CSV that main has since deleted.
export function preMigrationTree(cwd) {
  if (existsSync(path.join(cwd, 'link-cache.jsonc'))) return false;
  const r = spawnSync(
    'git',
    ['ls-files', '--error-unmatch', '--', '.lycheecache'],
    { cwd, stdio: ['ignore', 'ignore', 'pipe'], encoding: 'utf8' },
  );
  if (r.status === 0) return true;
  if (r.status === 1) return false;
  // Any other outcome is a git failure, not evidence of a migrated tree.
  throw new Error(
    `git ls-files failed: ${r.stderr?.trim() || r.error?.message || `exit ${r.status}`}`,
  );
}

export function preMigrationNotice() {
  return [
    RULE,
    'ERROR: this branch predates the owned link cache (link-cache.jsonc) and still',
    'tracks .lycheecache, so the check would regenerate an obsolete file.',
    'Merge in the latest main first, resolving the modify/delete conflict with',
    '`git rm .lycheecache`, then rerun the check.',
    RULE,
  ].join('\n');
}

// Loud end-of-run notice for a successful check that modified the committed
// link cache.
export function cacheUpdatedNotice() {
  return [
    RULE,
    'NOTE: the link check updated the committed link cache (link-cache.jsonc).',
    'Commit the modified link-cache.jsonc together with your content changes;',
    "otherwise the 'CACHE updates committed?' job will fail on your PR.",
    RULE,
  ].join('\n');
}

// Failed links from lychee output: `[STATUS] URL (at L:C) | reason` lines,
// one entry per unique URL. STATUS is an HTTP status code or a lychee marker
// such as TIMEOUT or ERROR.
export function failedUrlsOf(output) {
  const failures = [];
  const seen = new Set();
  for (const [, status, url] of output.matchAll(/^\[([A-Z0-9]+)\] (\S+)/gm)) {
    if (seen.has(url)) continue;
    seen.add(url);
    failures.push({ status, url });
  }
  return failures;
}

// Report for a failed check whose links are genuinely dead; empty when there
// are no failures.
export function deadLinksReport(failures) {
  if (failures.length === 0) return '';
  const count =
    failures.length === 1 ? '1 link is' : `${failures.length} links are`;
  return [
    RULE,
    `ERROR: ${count} genuinely unreachable — nothing cache-side to fix:`,
    '',
    ...failures.map(({ status, url }) => `  [${status}] ${url}`),
    '',
    'Note: TIMEOUT, ERROR, and 5xx statuses can be transient — if in doubt,',
    'rerun the check before fixing.',
    '',
    'Fix or remove these links. For a URL that you have verified manually',
    'but that blocks link checkers, append `?link-check=no` — see',
    'https://opentelemetry.io/docs/contributing/pr-checks/#handling-valid-external-links',
    RULE,
  ].join('\n');
}
