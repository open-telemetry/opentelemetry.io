import { test, suite } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cacheUpdatedNotice, deadLinksReport, failedUrlsOf } from './index.mjs';

suite('failedUrlsOf', () => {
  const lycheeOutput = `Issues found in 1 input. Find details below.

[/tmp/dead-links.html]:
[410] https://httpbin.org/status/410 (at 4:10) | Rejected status code: 410 Gone
[404] https://opentelemetry.io/no-such-page/ (at 3:10) | Rejected status code: 404 Not Found

🔍 2 Total (in 398ms) 🔗 2 Unique ✅ 0 OK 🚫 2 Errors
`;

  test('extracts status and URL of each failure', () => {
    assert.deepEqual(failedUrlsOf(lycheeOutput), [
      { status: '410', url: 'https://httpbin.org/status/410' },
      { status: '404', url: 'https://opentelemetry.io/no-such-page/' },
    ]);
  });

  test('reports each URL once, even when it fails in several inputs', () => {
    const twice = lycheeOutput + lycheeOutput;
    assert.equal(failedUrlsOf(twice).length, 2);
  });

  test('is empty for a clean run', () => {
    const clean = '🔍 9 Total (in 3s) 🔗 5 Unique ✅ 9 OK 🚫 0 Errors\n';
    assert.deepEqual(failedUrlsOf(clean), []);
  });

  test('includes TIMEOUT and ERROR failures alongside status codes', () => {
    const out =
      '[TIMEOUT] https://slow.test/ (at 1:1) | Timeout\n' +
      '[ERROR] https://cannot.test/ (at 2:1) | Network error\n' +
      '[404] https://gone.test/ (at 3:1) | Rejected status code: 404 Not Found\n';
    assert.deepEqual(failedUrlsOf(out), [
      { status: 'TIMEOUT', url: 'https://slow.test/' },
      { status: 'ERROR', url: 'https://cannot.test/' },
      { status: '404', url: 'https://gone.test/' },
    ]);
  });
});

suite('deadLinksReport', () => {
  test('names the count and lists each URL with its status', () => {
    const report = deadLinksReport([
      { status: '404', url: 'https://gone.test/' },
      { status: '410', url: 'https://also-gone.test/' },
    ]);
    assert.match(report, /2 links? are genuinely unreachable/);
    assert.match(report, /nothing cache-side to fix/);
    assert.match(report, /can be transient/);
    assert.match(report, /\[404\] https:\/\/gone\.test\//);
    assert.match(report, /\[410\] https:\/\/also-gone\.test\//);
    assert.match(report, /link-check=no/);
  });

  test('uses singular phrasing for one failure', () => {
    const report = deadLinksReport([
      { status: '404', url: 'https://gone.test/' },
    ]);
    assert.match(report, /1 link is genuinely unreachable/);
  });

  test('is empty when there are no failures', () => {
    assert.equal(deadLinksReport([]), '');
  });
});

suite('cacheUpdatedNotice', () => {
  test('says the cache was updated and how to commit it', () => {
    const notice = cacheUpdatedNotice();
    assert.match(notice, /\.lycheecache/);
    assert.match(notice, /commit/i);
  });
});

suite('wiring drift guard', () => {
  test('_check:links still is the bin that cli.mjs invokes directly', () => {
    // cli.mjs bypasses npm and spawns node_modules/.bin/lychee-norm-cache to
    // capture output npm-noise-free; this guard fails if the canonical
    // _check:links script moves off that bare bin, forcing reconciliation.
    const pkg = JSON.parse(
      fs.readFileSync(new URL('../../../package.json', import.meta.url)),
    );
    assert.equal(pkg.scripts['_check:links'], 'lychee-norm-cache');
  });
});
