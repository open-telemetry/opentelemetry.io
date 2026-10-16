import { test, suite } from 'node:test';
import assert from 'node:assert/strict';
import {
  cacheEntriesFor,
  checkProbeResults,
  checkReportConsistency,
  mergedCacheText,
  summaryReport,
  UNVERIFIED,
  VIA,
} from './index.mjs';

const now = 1754_000_000; // 2025-07-31T22:13:20Z

function entry(url, result, via = VIA) {
  return { url, result, ts: now, via, comments: [] };
}

function owned(...entries) {
  const lines = entries.map(
    ({ url, result, when, via }) =>
      `  ${JSON.stringify(url)}: {\n    "result": ${JSON.stringify(result)},\n` +
      `    "when": "${when}",\n    "via": "${via}",\n  },`,
  );
  return `{\n${lines.join('\n')}\n}\n`;
}

suite('cacheEntriesFor', () => {
  test('writes a 206 double-check entry for each URL the probe resolved', () => {
    const entries = cacheEntriesFor(
      [
        { url: 'https://blocked.test/page', status: 200 },
        { url: 'https://crates.io/crates/foo', status: 206 },
      ],
      now,
    );
    assert.deepEqual(entries, [
      entry('https://blocked.test/page', 206),
      entry('https://crates.io/crates/foo', 206),
    ]);
  });

  test('skips URLs that the probe could not resolve', () => {
    const entries = cacheEntriesFor(
      [
        { url: 'https://gone.test/', status: 404 },
        { url: 'https://frag.test/#nope', status: 422 },
        { url: 'https://err.test/', status: null },
        { url: 'https://ok.test/', status: 204 },
      ],
      now,
    );
    assert.deepEqual(entries, [entry('https://ok.test/', 206)]);
  });

  test('is empty when nothing resolved', () => {
    assert.deepEqual(
      cacheEntriesFor([{ url: 'https://gone.test/', status: 404 }], now),
      [],
    );
  });
});

suite('mergedCacheText', () => {
  const a = {
    url: 'https://a.test/',
    result: 200,
    when: '2025-01-01T00:00:00Z',
    via: 'lychee',
  };
  const c = {
    url: 'https://c.test/',
    result: 200,
    when: '2025-01-02T00:00:00Z',
    via: 'lychee',
  };
  const b206 = {
    url: 'https://b.test/',
    result: 206,
    when: '2025-07-31T22:13:20Z',
    via: VIA,
  };

  test('inserts new entries in URL order, in the owned-file shape', () => {
    const merged = mergedCacheText(
      owned(a, c),
      [entry('https://b.test/', 206)],
      now,
    );
    assert.equal(merged, owned(a, b206, c));
  });

  test('returns the cache unchanged when there is nothing to add', () => {
    const cache = owned(a);
    assert.equal(mergedCacheText(cache, [], now), cache);
  });

  test('replaces the failure entry the check recorded for the same URL', () => {
    const bErr = { ...b206, result: 'error', via: 'lychee' };
    const merged = mergedCacheText(
      owned(a, bErr),
      [entry('https://b.test/', 206)],
      now,
    );
    assert.equal(merged, owned(a, b206));
  });

  test('rejects a malformed cache rather than rewriting it', () => {
    assert.throws(() =>
      mergedCacheText('', [entry('https://b.test/', 206)], now),
    );
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

suite('checkProbeResults', () => {
  // Probe-infrastructure guard: see checkProbeResults in index.mjs.
  test('throws when every probe errored out', () => {
    assert.throws(
      () =>
        checkProbeResults([
          { url: 'https://a.test/', status: null },
          { url: 'https://b.test/', status: null },
        ]),
      /every probe/i,
    );
  });

  test('accepts results where at least one probe completed', () => {
    checkProbeResults([
      { url: 'https://a.test/', status: null },
      { url: 'https://gone.test/', status: 404 },
    ]);
  });

  test('accepts an empty result list', () => {
    checkProbeResults([]);
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
