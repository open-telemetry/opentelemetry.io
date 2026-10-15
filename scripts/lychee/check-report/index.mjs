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

// Pages a production build didn't produce, from an offline lychee run over
// its public/: `file://` targets reported as missing, grouped under the source
// page that links to them, both as site paths (`/docs/x/`). Fragments and
// queries belong to the link, not the page; missing fragments on existing
// pages stay with the generic report.
export function missingPagesOf(output) {
  const bySource = new Map();
  let source = null;
  for (const line of output.split('\n')) {
    const header = line.match(/^\[(.*\/public\/.*)\]:$/);
    if (header) {
      source = sitePathOf(header[1]);
      continue;
    }
    const failure = line.match(
      /^\[[A-Z0-9]+\] file:\/\/(\S+\/public\/\S*) \(at \d+:\d+\) \| (File not found|Cannot find index file)/,
    );
    if (!failure || !source) continue;
    const target = sitePathOf(failure[1]);
    const targets = bySource.get(source) ?? [];
    if (!targets.includes(target)) targets.push(target);
    bySource.set(source, targets);
  }
  return [...bySource].map(([source, targets]) => ({ source, targets }));
}

// `/abs/checkout/public/docs/x/index.html#frag` -> `/docs/x/`: the build
// output is the last `/public/`, whatever the checkout path contains. A target
// that names a file (`/docs/x.pdf`) keeps its form; a dotted directory
// (`/docs/v1.2`) is indistinguishable by text and comes out as a file path.
function sitePathOf(fsPath) {
  const path = decodeSafely(fsPath.replace(/[?#].*$/, ''));
  const i = path.lastIndexOf('/public/');
  const rel = path.slice(i + '/public'.length).replace(/\/index\.html$/, '');
  if (/\.[a-z0-9]+$/i.test(rel)) return rel;
  return rel.replace(/\/?$/, '/') || '/';
}

function decodeSafely(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

// Every failure split into the missing-page groups and the rest, so a run
// with both kinds reports both. Only a production run classifies: a build
// that includes drafts has no unpublished pages to be missing.
export function partitionFailures(output, { production = false } = {}) {
  const missingPages = production ? missingPagesOf(output) : [];
  const covered = new Set(missingPages.flatMap(({ targets }) => targets));
  const other = failedUrlsOf(output).filter(
    ({ url }) => !(url.startsWith('file://') && covered.has(sitePathOf(url))),
  );
  return { missingPages, other };
}

// Report for a production-build check that found links into pages the build
// doesn't contain; empty when there are none. The remedy lives at the linked
// PR-check entry.
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
