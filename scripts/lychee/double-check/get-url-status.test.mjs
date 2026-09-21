// Characterization tests for the recovered probe's pure parts: pin the
// existing behavior as-is (no red-green cycle: the code predates the
// tests). Browser-dependent paths are covered by the opt-in live smoke check
// (./live-check.mjs), not here.

import { test, suite } from 'node:test';
import assert from 'node:assert/strict';
import {
  isHttp2XX,
  isStatusNotFound,
  npmPackageNameFromUrl,
  parseGitHubLineRef,
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
    // Shell metacharacters and malformed names are rejected: the extracted
    // name reaches an npm CLI invocation, so it must be a syntactically
    // valid package name and nothing else.
    ['https://www.npmjs.com/package/foo;echo_INJECTED', null],
    ['https://www.npmjs.com/package/foo`id`', null],
    ['https://www.npmjs.com/package/$(id)', null],
    ['https://www.npmjs.com/package/foo|bar', null],
    ['https://www.npmjs.com/package/@scope', null],
    ['https://www.npmjs.com/package/@/pkg', null],
  ];

  for (const [url, expected] of cases) {
    test(`${url} -> ${expected}`, () => {
      assert.equal(npmPackageNameFromUrl(url), expected);
    });
  }
});

suite('parseGitHubLineRef', () => {
  const cases = [
    // Valid forms: single line, ranges, column forms, mixed sides.
    ['L5', 5],
    ['L10-L20', 20],
    ['L157C6-L157C20', 157],
    ['L5C1-L10', 10],
    ['L20-L10', 20], // reversed range: GitHub still selects it
    // Not line references: rejected (fall through to the anchor-link check).
    ['L0', null], // lines are 1-based
    ['L5C0', null], // columns are 1-based
    ['L05', null], // no leading zeros
    ['l5', null], // GitHub fragments are uppercase L
    ['L', null],
    ['L5-', null],
    ['L5C', null],
    ['L5x', null],
    ['readme-server-authenticators', null],
    ['', null],
  ];

  for (const [fragment, expected] of cases) {
    test(`${JSON.stringify(fragment)} -> ${expected}`, () => {
      assert.equal(parseGitHubLineRef(fragment), expected);
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
