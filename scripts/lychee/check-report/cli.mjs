#!/usr/bin/env node
// Run the site link check (lychee-norm-cache) and make the outcome
// actionable: when a successful run updates the committed .lycheecache, print
// a loud notice so the cache change gets committed with the PR.
//
// Used by `check:links` — local runs and the bot's `fix:link-cache`. The CI
// `CHECK LINKS and CACHE` job invokes `_check:links` directly and reports
// cache staleness itself (see .github/workflows/check-links.yml).

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cacheUpdatedNotice } from './index.mjs';

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);

// The bin behind the `_check:links` npm script; invoked directly so this
// wrapper observes its exit status.
const bin = path.join(root, 'node_modules', '.bin', 'lychee-norm-cache');
const status =
  spawnSync(bin, process.argv.slice(2), { stdio: 'inherit', cwd: root })
    .status ?? 1;

if (status === 0 && cacheModified()) {
  console.log(cacheUpdatedNotice());
}
process.exit(status);

// True when the working-tree .lycheecache differs from the committed one.
function cacheModified() {
  const r = spawnSync('git', ['diff', '--quiet', '--', '.lycheecache'], {
    cwd: root,
  });
  return r.status === 1;
}
