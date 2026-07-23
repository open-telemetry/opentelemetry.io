#!/usr/bin/env node
// Run the site link check (lychee-norm-cache) and make the outcome
// actionable:
//
// - Success that updates the committed .lycheecache: print a loud notice so
//   the cache change gets committed with the PR.
// - Failure with genuinely dead links: name them and say that nothing
//   cache-side can fix them (also in the step summary when run in CI).
//
// Used by `check:links` — local runs and the bot's `fix:link-cache`. The CI
// `CHECK LINKS and CACHE` job invokes `_check:links` directly and reports
// cache staleness itself (see .github/workflows/check-links.yml).

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cacheUpdatedNotice, deadLinksReport, failedUrlsOf } from './index.mjs';

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);

// The bin behind the `_check:links` npm script; invoked directly so that
// output is captured npm-noise-free and the exit status observed; failures
// are parsed for dead links. Kept in sync with package.json by the wiring
// drift guard in ./index.test.mjs.
const bin = path.join(root, 'node_modules', '.bin', 'lychee-norm-cache');
const run = spawnSync(bin, process.argv.slice(2), {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  stdio: ['inherit', 'pipe', 'pipe'],
});
const status = run.status ?? 1;
process.stdout.write(run.stdout ?? '');
process.stderr.write(run.stderr ?? '');

if (status === 0) {
  if (cacheModified()) console.log(cacheUpdatedNotice());
} else {
  const report = deadLinksReport(
    failedUrlsOf((run.stdout ?? '') + (run.stderr ?? '')),
  );
  if (report) {
    console.log(report);
    appendToStepSummary(report);
  }
}
// Not process.exit(status): a hard exit can drop buffered stdout/stderr
// (e.g. a large dead-links report when output is piped, as under npm/tee).
process.exitCode = status;

// In CI (e.g., a bot `fix:link-cache` run), surface the report in the
// workflow step summary as well.
function appendToStepSummary(report) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  fs.appendFileSync(
    summaryPath,
    `### Unreachable links\n\n\`\`\`text\n${report}\n\`\`\`\n`,
  );
}

// True when the working-tree .lycheecache differs from the committed one.
function cacheModified() {
  const r = spawnSync('git', ['diff', '--quiet', '--', '.lycheecache'], {
    cwd: root,
  });
  return r.status === 1;
}
