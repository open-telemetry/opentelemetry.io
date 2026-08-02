import { test, suite } from 'node:test';
import assert from 'node:assert/strict';
import {
  cacheLinesFor,
  checkReportConsistency,
  csvField,
  mergedCacheText,
  summaryReport,
  UNVERIFIED,
} from './index.mjs';

suite('cacheLinesFor', () => {
  const now = 1754_000_000;

  test('writes a 206 line for each URL the probe resolved', () => {
    const lines = cacheLinesFor(
      [
        { url: 'https://blocked.test/page', status: 200 },
        { url: 'https://crates.io/crates/foo', status: 206 },
      ],
      now,
    );
    assert.deepEqual(lines, [
      `https://blocked.test/page,206,${now}`,
      `https://crates.io/crates/foo,206,${now}`,
    ]);
  });

  test('skips URLs that the probe could not resolve', () => {
    const lines = cacheLinesFor(
      [
        { url: 'https://gone.test/', status: 404 },
        { url: 'https://frag.test/#nope', status: 422 },
        { url: 'https://err.test/', status: null },
        { url: 'https://ok.test/', status: 204 },
      ],
      now,
    );
    assert.deepEqual(lines, [`https://ok.test/,206,${now}`]);
  });

  test('is empty when nothing resolved', () => {
    assert.deepEqual(
      cacheLinesFor([{ url: 'https://gone.test/', status: 404 }], now),
      [],
    );
  });
});

suite('csvField', () => {
  test('leaves ordinary URLs bare', () => {
    assert.equal(csvField('https://a.test/b?c=d#e'), 'https://a.test/b?c=d#e');
  });

  test('quotes URLs containing a comma', () => {
    assert.equal(
      csvField('https://en.wikipedia.org/wiki/A,_B_and_C'),
      '"https://en.wikipedia.org/wiki/A,_B_and_C"',
    );
  });

  test('quotes and escapes URLs containing a double quote', () => {
    assert.equal(csvField('https://a.test/"x"'), '"https://a.test/""x"""');
  });
});

suite('mergedCacheText', () => {
  test('inserts new lines in C-locale sort order', () => {
    const cache = 'https://a.test/,200,1\nhttps://c.test/,200,2\n';
    const merged = mergedCacheText(cache, ['https://b.test/,206,3']);
    assert.equal(
      merged,
      'https://a.test/,200,1\nhttps://b.test/,206,3\nhttps://c.test/,200,2\n',
    );
  });

  test('returns the cache unchanged when there is nothing to add', () => {
    const cache = 'https://a.test/,200,1\n';
    assert.equal(mergedCacheText(cache, []), cache);
  });

  test('replaces an existing entry for the same URL', () => {
    const cache = 'https://a.test/,404,1\nhttps://b.test/,200,2\n';
    const merged = mergedCacheText(cache, ['https://a.test/,206,3']);
    assert.equal(merged, 'https://a.test/,206,3\nhttps://b.test/,200,2\n');
  });

  test('replaces an existing entry for the same quoted URL', () => {
    const cache = '"https://a.test/x,y",404,1\n';
    const merged = mergedCacheText(cache, ['"https://a.test/x,y",206,3']);
    assert.equal(merged, '"https://a.test/x,y",206,3\n');
  });
});

suite('checkReportConsistency', () => {
  // False-green guard: see checkReportConsistency in index.mjs.
  test('throws when the report counts errors but no failure lines parsed', () => {
    const malformed = '🔍 9 Total (in 3s) 🔗 5 Unique ✅ 7 OK 🚫 2 Errors\n';
    assert.throws(() => checkReportConsistency(malformed, []), /2 error/i);
  });

  test('accepts a clean report with no failures', () => {
    const clean = '🔍 9 Total (in 3s) 🔗 9 Unique ✅ 9 OK 🚫 0 Errors\n';
    checkReportConsistency(clean, []);
  });

  test('accepts a failing report whose failures were parsed', () => {
    const out =
      '[404] https://gone.test/ (at 3:1) | Rejected status code: 404\n' +
      '🔍 2 Total (in 1s) 🔗 2 Unique ✅ 1 OK 🚫 1 Error\n';
    checkReportConsistency(out, [{ status: '404', url: 'https://gone.test/' }]);
  });

  test('accepts a log without a summary line (e.g. aborted run)', () => {
    checkReportConsistency('some build output, no lychee summary\n', []);
  });

  // expectFailures semantics: see checkReportConsistency in index.mjs.
  test('with expectFailures, throws when no failure lines parsed', () => {
    const malformed = '🔍 9 Total (in 3s) 🔗 5 Unique ✅ 7 OK 🚫 2 Errors\n';
    assert.throws(
      () => checkReportConsistency(malformed, [], { expectFailures: true }),
      /2 error/i,
    );
  });

  test('with expectFailures, throws even without a summary line', () => {
    assert.throws(
      () =>
        checkReportConsistency('build output, no lychee summary\n', [], {
          expectFailures: true,
        }),
      /no failure lines/i,
    );
  });

  test('with expectFailures, accepts a report whose failures were parsed', () => {
    const out =
      '[404] https://gone.test/ (at 3:1) | Rejected status code: 404\n' +
      '🔍 2 Total (in 1s) 🔗 2 Unique ✅ 1 OK 🚫 1 Error\n';
    checkReportConsistency(
      out,
      [{ status: '404', url: 'https://gone.test/' }],
      {
        expectFailures: true,
      },
    );
  });
});

suite('summaryReport', () => {
  test('counts resolved and lists unresolved URLs with probe statuses', () => {
    const report = summaryReport([
      { url: 'https://ok.test/', status: 200 },
      { url: 'https://gone.test/', status: 404 },
      { url: 'https://err.test/', status: null },
    ]);
    assert.match(report, /1 of 3 .*resolved/i);
    assert.match(report, /\[404\] https:\/\/gone\.test\//);
    assert.match(report, new RegExp(`\\[${UNVERIFIED}\\] https://err\\.test/`));
    assert.doesNotMatch(report, /ok\.test/);
  });

  test('reports a fully resolved run without an unresolved section', () => {
    const report = summaryReport([{ url: 'https://ok.test/', status: 200 }]);
    assert.match(report, /1 of 1 .*resolved/i);
    assert.doesNotMatch(report, /unresolved/i);
  });
});
