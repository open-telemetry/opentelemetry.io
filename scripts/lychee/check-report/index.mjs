// Pure logic for the check-report wrapper around the site link check: the
// messages that make a link-check outcome actionable. Process wiring lives in
// ./cli.mjs; tests in ./index.test.mjs.

const RULE = '='.repeat(74);

// Loud end-of-run notice for a successful check that modified the committed
// link cache: the cache change must land with the PR, or CI fails (see the
// `CHECK LINKS and CACHE` job of .github/workflows/check-links.yml).
export function cacheUpdatedNotice() {
  return [
    RULE,
    'NOTE: the link check updated the committed link cache (.lycheecache).',
    'Commit the modified .lycheecache together with your content changes;',
    'otherwise the CHECK LINKS and CACHE job will fail on your PR.',
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

// Report for a failed check whose links are genuinely dead: names the count,
// lists each URL with its status, and points at the fixes — repair or remove
// the link, or mark a checker-hostile URL with `?link-check=no`.
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
    'Fix or remove these links. For a URL that you have verified manually',
    'but that blocks link checkers, append `?link-check=no` -- see',
    'https://opentelemetry.io/docs/contributing/pr-checks/#handling-valid-external-links',
    RULE,
  ].join('\n');
}
