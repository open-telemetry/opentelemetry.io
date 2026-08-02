// Pure logic for the double-check driver: turn probe results for
// Lychee-reported link failures into committed link-cache entries with the
// synthetic status 206, "OK by analysis": verified by the browser-grade
// probe (./get-url-status.mjs) rather than by Lychee's plain HTTP client. Process wiring lives in ./cli.mjs; tests in ./index.test.mjs.

import { sortCacheText } from 'link-cache/check/index.mjs';
import { isHttp2XX } from './get-url-status.mjs';

export const STATUS_OK_BY_ANALYSIS = 206;

// Probe status marker for URLs whose probe errored out (null status).
export const UNVERIFIED = 'UNVERIFIED';

// Cache lines (`url,206,epoch`) for the probe results that resolved.
export function cacheLinesFor(results, nowEpoch) {
  return results
    .filter(({ status }) => isHttp2XX(status))
    .map(({ url }) => `${csvField(url)},${STATUS_OK_BY_ANALYSIS},${nowEpoch}`);
}

// URL as a .lycheecache CSV field: quoted only when it contains a comma or a
// double quote, with embedded quotes doubled (RFC 4180).
export function csvField(url) {
  if (!/[",]/.test(url)) return url;
  return `"${url.replaceAll('"', '""')}"`;
}

// The (possibly quoted) URL field of a cache line, in its as-written form.
function lineUrlField(line) {
  const match = line.match(/^"(?:[^"]|"")*"|^[^,]*/);
  return match[0];
}

// Cache text with the new lines merged in (an existing entry for the same
// URL is replaced), normalized the way lychee-norm-cache leaves the file
// (C-locale sort, trailing newline).
export function mergedCacheText(cacheText, newLines) {
  if (newLines.length === 0) return cacheText;
  const newUrls = new Set(newLines.map(lineUrlField));
  const keptLines = cacheText
    .split('\n')
    .filter((line) => line !== '' && !newUrls.has(lineUrlField(line)));
  return sortCacheText([...keptLines, ...newLines].join('\n') + '\n');
}

// False-green guard: the Lychee summary line declares an error count; if it
// is positive but the failure parse found nothing, the report format has
// drifted and silently probing nothing would masquerade as success.
//
// With `expectFailures` (set when the caller knows the link check exited
// nonzero), "nothing parsed" means parser drift or a failure unrelated to
// links, so throw even without a summary line.
export function checkReportConsistency(
  output,
  failures,
  { expectFailures = false } = {},
) {
  const summary = output.match(/🚫 (\d+) Errors?/);
  const declared = summary ? Number(summary[1]) : 0;
  if (declared > 0 && failures.length === 0) {
    throw new Error(
      `Lychee reports ${declared} error(s) but no failure lines were parsed; ` +
        'the report format may have changed.',
    );
  }
  if (expectFailures && failures.length === 0) {
    throw new Error(
      'The link check failed, but no failure lines were parsed from its ' +
        'log; the failure may be unrelated to links, or the report format ' +
        'may have changed.',
    );
  }
}

// Human-readable outcome: how many URLs resolved, and which did not.
export function summaryReport(results) {
  const unresolved = results.filter(({ status }) => !isHttp2XX(status));
  const resolvedCount = results.length - unresolved.length;
  const lines = [
    `Double-check: ${resolvedCount} of ${results.length} failing URL(s) resolved by the browser probe.`,
  ];
  if (unresolved.length > 0) {
    lines.push(
      'Unresolved (probe status shown):',
      ...unresolved.map(
        ({ status, url }) => `  [${status ?? UNVERIFIED}] ${url}`,
      ),
    );
  }
  return lines.join('\n');
}
