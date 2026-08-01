#!/usr/bin/env node
// Double-check driver: re-verify Lychee-reported link failures with the
// browser-grade probe, and record each resolved URL in the committed link
// cache (.lycheecache) as a synthetic-206 entry. Rationale and usage:
// content/en/site/build/link-checking.md, "Double-check of failing links".
//
// Usage: cli.mjs [--verbose] [--expect-failures] [LYCHEE_LOG_FILE]
//
// --expect-failures: fail unless at least one failure line was parsed from
// the log. Set by the workflow when the link check exited nonzero, so a
// nonzero status is only suppressed once it is attributed to ordinary,
// parsed link failures.
//
// LYCHEE_LOG_FILE is a captured `check:links` log (default:
// tmp/check-links-log.txt, where `log:check:links` tees it). Pure logic in
// ./index.mjs; probe in ./get-url-status.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { failedUrlsOf } from '../check-report/index.mjs';
import { getUrlStatus } from './get-url-status.mjs';
import {
  cacheLinesFor,
  checkReportConsistency,
  mergedCacheText,
  summaryReport,
} from './index.mjs';

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);
const cachePath = path.join(root, '.lycheecache');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const expectFailures = args.includes('--expect-failures');
const logFile =
  args.find((a) => !a.startsWith('-')) ??
  path.join(root, 'tmp', 'check-links-log.txt');

if (!fs.existsSync(logFile)) {
  console.error(`Error: link-check log not found: ${logFile}`);
  console.error('Run `npm run log:check:links` first, or pass the log path.');
  process.exit(1);
}

const output = fs.readFileSync(logFile, 'utf8');
const failures = failedUrlsOf(output);
checkReportConsistency(output, failures, { expectFailures });

if (failures.length === 0) {
  console.log('Double-check: no link failures to re-verify.');
  process.exit(0);
}

console.log(`Double-check: re-verifying ${failures.length} failing URL(s):`);
const results = [];
for (const { status, url } of failures) {
  console.log(`  [${status}] ${url}`);
  const probed = await getUrlStatus(url, verbose);
  if (verbose) console.log(); // probe log lines end without a newline
  console.log(`    -> probe status: ${probed}`);
  results.push({ url, status: probed });
}

const lines = cacheLinesFor(results, Math.floor(Date.now() / 1000));
if (lines.length > 0) {
  const cacheText = fs.readFileSync(cachePath, 'utf8');
  fs.writeFileSync(cachePath, mergedCacheText(cacheText, lines));
  console.log(
    `Recorded ${lines.length} browser-verified (206) entr${
      lines.length === 1 ? 'y' : 'ies'
    } in .lycheecache.`,
  );
}
console.log(summaryReport(results));

// Exit 0 even when some URLs stay unresolved: those are genuinely dead (or
// still blocked) and are for humans to fix, not this driver.
