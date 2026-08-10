// Pure logic for the check-report wrapper around the site link check: the
// messages that make a link-check outcome actionable. Process wiring lives in
// ./cli.mjs; tests in ./index.test.mjs.

const RULE = '='.repeat(74);

// Loud end-of-run notice for a successful check that modified the committed
// link cache.
export function cacheUpdatedNotice() {
  return [
    RULE,
    'NOTE: the link check updated the committed link cache (.lycheecache).',
    'Commit the modified .lycheecache together with your content changes;',
    "otherwise the 'CACHE updates committed?' job will fail on your PR.",
    RULE,
  ].join('\n');
}

// Report for a link check requested against an absent or stale site build;
// empty when public/index.html is at least as new as the content tree.
// Guards the false green where the site build silently doesn't run: the
// build lives in the precheck:links lifecycle hook, and npm skips lifecycle
// hooks entirely when `ignore-scripts` is enabled — the link check would
// then "pass" against a stale public/.
export function staleBuildReport({ publicIndexMtimeMs, newestContent }) {
  const remedy = [
    'Build the site first, for example:',
    '',
    '  npm run build && npm run check:links',
    '',
    'check:links normally builds through its precheck:links hook; npm skips',
    'lifecycle hooks when `ignore-scripts` is enabled.',
  ];
  if (publicIndexMtimeMs === undefined) {
    return [
      RULE,
      'ERROR: link checking requires a built site, and public/index.html is',
      'absent.',
      '',
      ...remedy,
      RULE,
    ].join('\n');
  }
  if (newestContent && newestContent.mtimeMs > publicIndexMtimeMs) {
    const at = (ms) => new Date(ms).toISOString();
    return [
      RULE,
      'ERROR: link checking requires a freshly built site, and the content',
      'tree is newer than the build:',
      '',
      `  ${newestContent.path} (${at(newestContent.mtimeMs)})`,
      `  public/index.html (${at(publicIndexMtimeMs)})`,
      '',
      ...remedy,
      RULE,
    ].join('\n');
  }
  return '';
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
