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
