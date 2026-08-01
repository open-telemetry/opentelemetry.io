// Characterization tests for the recovered probe's pure parts: pin the
// battle-tested behavior as-is (no red-green cycle -- the code predates the
// tests). Browser-dependent paths are covered by the opt-in live smoke check
// (./live-check.mjs), not here.

import { test, suite } from 'node:test';
import assert from 'node:assert/strict';
import {
  isHttp2XX,
  isStatusNotFound,
  npmPackageNameFromUrl,
} from './get-url-status.mjs';

suite('npmPackageNameFromUrl', () => {
  // Recovered from the original script's inline test table.
  const cases = [
    ['https://www.npmjs.com/package/@otel/rd-aws', '@otel/rd-aws'],
    ['https://npmjs.com/package/@otel/rd-azure', '@otel/rd-azure'],
    ['https://www.npmjs.com/package/express', 'express'],
    ['https://npmjs.com/package/lodash/', 'lodash'],
    ['https://www.npmjs.com/package/@scope/pkg/v/1.0.0', '@scope/pkg'],
    ['https://npmjs.com/package/@otel/api?activeTab=versions', '@otel/api'],
    ['https://www.npmjs.com/package/@scope/pkg#readme', '@scope/pkg'],
    ['https://www.npmjs.com/package/@scope/pkg/', '@scope/pkg'],
    ['https://example.com/package/foo', null],
  ];

  for (const [url, expected] of cases) {
    test(`${url} -> ${expected}`, () => {
      assert.equal(npmPackageNameFromUrl(url), expected);
    });
  }
});

suite('isHttp2XX', () => {
  test('accepts the 2xx range, including synthetic 206', () => {
    for (const status of [200, 204, 206, 299]) {
      assert.ok(isHttp2XX(status), `${status} is 2xx`);
    }
  });

  test('rejects non-2xx statuses and null', () => {
    for (const status of [199, 300, 404, 422, null, undefined, 0]) {
      assert.ok(!isHttp2XX(status), `${status} is not 2xx`);
    }
  });
});

suite('isStatusNotFound', () => {
  test('404 means not found for ordinary URLs', () => {
    assert.ok(isStatusNotFound(404, 'https://example.com/x'));
    assert.ok(isStatusNotFound(404));
  });

  test('other statuses are not not-found', () => {
    assert.ok(!isStatusNotFound(200, 'https://example.com/x'));
    assert.ok(!isStatusNotFound(422, 'https://example.com/x'));
  });

  test('crates.io 404s are exempt (server always 404s; see probe note)', () => {
    assert.ok(!isStatusNotFound(404, 'https://crates.io/crates/no-such'));
  });
});
