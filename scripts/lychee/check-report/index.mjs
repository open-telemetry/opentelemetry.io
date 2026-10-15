// Pure logic for the check-report wrapper around the site link check: the
// messages that make a link-check outcome actionable. Process wiring lives in
// ./cli.mjs; tests in ./index.test.mjs.

import { fileURLToPath } from 'node:url';

const RULE = '='.repeat(74);

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

// Pages a production build didn't produce, from an offline lychee run over
// its public/: `file://` targets reported as missing, grouped under the source
// page that links to them, both as paths under public/. Missing fragments on
// existing pages stay with the generic report.
export function missingPagesOf(output) {
  return groupMissingPages(output).groups;
}

// The groups plus the failure URLs they consumed, as lychee printed them, so
// partitionFailures can keep every other failure.
function groupMissingPages(output) {
  const bySource = new Map();
  const consumed = new Set();
  let source = null;
  for (const line of output.split('\n')) {
    const header = line.match(/^\[(.*)\]:$/);
    if (header) {
      source = sitePathOf(header[1]);
      continue;
    }
    const failure = line.match(
      /^\[[A-Z0-9]+\] (file:\/\/\S+) \(at \d+:\d+\) \| (File not found|Cannot find index file)/,
    );
    if (!failure || !source) continue;
    const target = sitePathOf(filePathOf(failure[1]));
    if (!target) continue;
    consumed.add(failure[1]);
    const targets = bySource.get(source) ?? [];
    if (!targets.includes(target)) targets.push(target);
    bySource.set(source, targets);
  }
  return {
    groups: [...bySource].map(([source, targets]) => ({ source, targets })),
    consumed,
  };
}

// `/abs/checkout/public/docs/x` -> `/docs/x`; null outside a public/ directory.
function sitePathOf(fsPath) {
  const i = fsPath.indexOf('/public/');
  return i < 0 ? null : fsPath.slice(i + '/public'.length);
}

// Query and fragment drop out; a URL that isn't a well-formed file: URL maps
// nowhere (and stays with the generic report).
function filePathOf(url) {
  try {
    return fileURLToPath(url);
  } catch {
    return '';
  }
}

// Every failure split into the missing-page groups and the rest, so a run
// with both kinds reports both.
export function partitionFailures(output, { production = false } = {}) {
  const { groups, consumed } = production
    ? groupMissingPages(output)
    : { groups: [], consumed: new Set() };
  const other = failedUrlsOf(output).filter(({ url }) => !consumed.has(url));
  return { missingPages: groups, other };
}

// Report for a production-build check that found links into pages the build
// doesn't contain. The remedy lives at the linked PR-check entry.
export function missingPagesReport(groups) {
  const n = groups.reduce((sum, g) => sum + g.targets.length, 0);
  if (n === 0) return '';
  return [
    RULE,
    `ERROR: ${n} link(s) point at page(s) that the production build doesn't`,
    'contain.',
    '',
    ...groups.flatMap(({ source, targets }) => [
      `  ${source}`,
      ...targets.map((t) => `    → ${t}`),
    ]),
    '',
    'For how to fix this, see https://opentelemetry.io/docs/contributing/pr-checks/#check-links-production-internal',
    RULE,
  ].join('\n');
}
