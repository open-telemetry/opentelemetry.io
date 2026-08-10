#!/usr/bin/env node
// Run the site link check (lychee-norm-cache) and make the outcome
// actionable:
//
// - Success that updates the committed .lycheecache: print a loud notice so
//   the cache change gets committed with the PR.
// - Failure with genuinely dead links: name them and say that nothing
//   cache-side can fix them (also in the step summary when run in CI).
//
// Used by `check:links` — locally and in CI. The check-links.yml PR checks
// are the exception: they invoke `_check:links` directly.

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cacheUpdatedNotice,
  deadLinksReport,
  failedUrlsOf,
  staleBuildReport,
} from './index.mjs';

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);

// Fail fast when the site build is absent or older than the content tree,
// rather than link-checking a stale public/ (fs.statSync follows symlinks:
// public/ may link to a sibling directory). Report shape and rationale live
// in ./index.mjs (staleBuildReport).
const staleReport = staleBuildReport({
  publicIndexMtimeMs: mtimeMsOf(path.join(root, 'public', 'index.html')),
  newestContent: newestFileUnder(path.join(root, 'content')),
});
if (staleReport) {
  console.error(staleReport);
  process.exit(1);
}

// The bin behind the `_check:links` npm script; invoked directly so that
// output is captured npm-noise-free and the exit status observed; failures
// are parsed for dead links. Kept in sync with package.json by the wiring
// drift guard in ./index.test.mjs.
//
// Output streams through as it arrives — the run takes minutes (site build +
// link check), so buffering it until exit would leave the terminal frozen —
// while a copy accumulates for the dead-link parse.
const bin = path.join(root, 'node_modules', '.bin', 'lychee-norm-cache');
const child = spawn(bin, process.argv.slice(2), {
  cwd: root,
  stdio: ['inherit', 'pipe', 'pipe'],
});
let output = '';
child.stdout.setEncoding('utf8');
child.stderr.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  output += chunk;
});
child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
  output += chunk;
});
child.on('error', (err) => {
  console.error(err.message);
  process.exitCode = 1;
});
child.on('close', (code) => {
  const status = code ?? 1;
  if (status === 0) {
    if (cacheModified()) console.log(cacheUpdatedNotice());
  } else {
    const report = deadLinksReport(failedUrlsOf(output));
    if (report) {
      console.log(report);
      appendToStepSummary(report);
    }
  }
  // Not process.exit(status): a hard exit can drop buffered stdout/stderr
  // (e.g. a large dead-links report when output is piped, as under npm/tee).
  process.exitCode = status;
});

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

// True when .lycheecache has unstaged changes — the local analogue of the CI
// `CACHE updates committed?` verdict (see .github/workflows/check-links.yml).
function cacheModified() {
  const r = spawnSync('git', ['diff', '--quiet', '--', '.lycheecache'], {
    cwd: root,
  });
  return r.status === 1;
}

// mtime (ms) of the file at p, or undefined when it doesn't exist; follows
// symlinks.
function mtimeMsOf(p) {
  try {
    return fs.statSync(p).mtimeMs;
  } catch {
    return undefined;
  }
}

// Newest regular file under dir as { path, mtimeMs } with path relative to
// the repo root, or undefined when the tree is empty or absent.
function newestFileUnder(dir) {
  let newest;
  let entries;
  try {
    entries = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  } catch {
    return undefined;
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const p = path.join(entry.parentPath, entry.name);
    const mtimeMs = mtimeMsOf(p);
    if (mtimeMs === undefined) continue;
    if (!newest || mtimeMs > newest.mtimeMs) {
      newest = { path: path.relative(root, p), mtimeMs };
    }
  }
  return newest;
}
