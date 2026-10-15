// Pure logic for the check-report wrapper around the site link check: the
// messages that make a link-check outcome actionable. Process wiring lives in
// ./cli.mjs; tests in ./index.test.mjs.

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

// Missing-page failures from an offline lychee run over public/: `file://`
// targets that the build didn't produce, grouped under the source page that
// links to them. Both sides as site paths (`/docs/x/`), derived from the
// `/public/` segment of the paths lychee prints.
export function missingPagesOf(output) {
  const bySource = new Map();
  let source = null;
  for (const line of output.split('\n')) {
    const header = line.match(/^\[(\S+\/public\/.*?)\]:$/);
    if (header) {
      source = sitePathOf(header[1]);
      continue;
    }
    const failure = line.match(/^\[[A-Z0-9]+\] file:\/\/(\S+\/public\/\S*)/);
    if (!failure || !source) continue;
    const target = sitePathOf(failure[1]);
    const targets = bySource.get(source) ?? [];
    if (!targets.includes(target)) targets.push(target);
    bySource.set(source, targets);
  }
  return [...bySource].map(([source, targets]) => ({ source, targets }));
}

function sitePathOf(fsPath) {
  return (
    fsPath
      .replace(/^.*?\/public(?=\/|$)/, '')
      .replace(/\/index\.html$/, '')
      .replace(/\/?$/, '/') || '/'
  );
}

// Report for a production-build check that found links into pages the build
// doesn't contain; empty when there are none.
export function missingPagesReport(groups) {
  const n = groups.reduce((sum, g) => sum + g.targets.length, 0);
  if (n === 0) return '';
  const count = n === 1 ? '1 link points' : `${n} links point`;
  return [
    RULE,
    `ERROR: ${count} at a page that production doesn't serve:`,
    '',
    ...groups.flatMap(({ source, targets }) => [
      `  ${source}`,
      ...targets.map((t) => `    → ${t}`),
    ]),
    '',
    'The target renders in the deploy preview but is a draft or future-dated',
    'page, so production omits it. Link to a published page instead, or publish',
    'the target first. See',
    'https://opentelemetry.io/docs/contributing/pr-checks/#check-links-production-internal',
    RULE,
  ].join('\n');
}
