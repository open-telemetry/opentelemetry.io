// Unit tests for the refcache.json -> .lycheecache converter.
//
// cSpell:ignore lycheecache refcache

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { csvField, refcacheToRows } from './index.mjs';

describe('csvField()', () => {
  test('passes plain values through unchanged', () => {
    assert.equal(csvField('https://example.com/a'), 'https://example.com/a');
  });

  test('quotes and escapes values containing a comma', () => {
    assert.equal(csvField('https://x.test/a,b'), '"https://x.test/a,b"');
  });

  test('doubles embedded double quotes', () => {
    assert.equal(csvField('a"b'), '"a""b"');
  });
});

describe('refcacheToRows()', () => {
  test('writes a CSV row of url,status,unix-seconds for 2xx entries', () => {
    const { rows, written, skipped } = refcacheToRows({
      'https://example.com/ok': {
        StatusCode: 200,
        LastSeen: '2024-01-01T00:00:00Z',
      },
    });
    assert.equal(written, 1, 'rows written');
    assert.equal(skipped, 0, 'rows skipped');
    assert.deepEqual(rows, ['https://example.com/ok,200,1704067200']);
  });

  test('seeds 206 (partial content) the same as 200', () => {
    const { rows } = refcacheToRows({
      'https://example.com/partial': {
        StatusCode: 206,
        LastSeen: '2024-01-01T00:00:00Z',
      },
    });
    assert.deepEqual(rows, ['https://example.com/partial,206,1704067200']);
  });

  test('skips non-2xx entries (lychee always rechecks failures)', () => {
    const { rows, written, skipped } = refcacheToRows({
      'https://example.com/missing': {
        StatusCode: 404,
        LastSeen: '2024-01-01T00:00:00Z',
      },
      'https://example.com/moved': {
        StatusCode: 301,
        LastSeen: '2024-01-01T00:00:00Z',
      },
    });
    assert.equal(written, 0, 'rows written');
    assert.equal(skipped, 2, 'rows skipped');
    assert.deepEqual(rows, []);
  });

  test('skips entries with an unparsable LastSeen', () => {
    const { written, skipped } = refcacheToRows({
      'https://example.com/bad-date': {
        StatusCode: 200,
        LastSeen: 'not-a-date',
      },
    });
    assert.equal(written, 0, 'rows written');
    assert.equal(skipped, 1, 'rows skipped');
  });

  test('quotes a URL containing a comma', () => {
    const { rows } = refcacheToRows({
      'https://example.com/a,b': {
        StatusCode: 200,
        LastSeen: '2024-01-01T00:00:00Z',
      },
    });
    assert.deepEqual(rows, ['"https://example.com/a,b",200,1704067200']);
  });
});
