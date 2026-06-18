// Unit tests for the htmltest `IgnoreDirs` -> lychee `exclude_path` translator.
// Guards the key parity property: the `(../)?` locale prefix is preserved, so a
// single pattern keeps excluding old blog posts in every locale, not just EN.
//
// cSpell:ignore ignoredirs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { parseIgnoreDirs, translate, toExcludePaths } from './index.mjs';

describe('translate()', () => {
  test('a single-page bundle maps to its index.html', () => {
    assert.equal(
      translate('^bn/docs/demo/$'),
      '/public/bn/docs/demo/index\\.html$',
    );
  });

  test('a subtree pattern anchors onto /public/', () => {
    assert.equal(
      translate('^(../)?blog/20(19|21|22|23|24)/'),
      '/public/(../)?blog/20(19|21|22|23|24)/',
    );
  });

  test('a substring pattern keeps its tail', () => {
    assert.equal(
      translate('^(../)?blog/(\\d+/)?page/\\d+'),
      '/public/(../)?blog/(\\d+/)?page/\\d+',
    );
  });

  test('the `(../)?` locale prefix is preserved verbatim', () => {
    assert.ok(
      translate('^(../)?blog/2019/').includes('(../)?'),
      'optional locale segment is kept',
    );
  });
});

describe('translated subtree pattern matches old blog posts in every locale', () => {
  const re = new RegExp(translate('^(../)?blog/20(19|21|22|23|24)/'));

  for (const path of [
    '/public/blog/2024/foo/index.html',
    '/public/ja/blog/2024/foo/index.html',
    '/public/es/blog/2021/bar/index.html',
    '/public/zz/blog/2019/baz/index.html',
  ]) {
    test(`matches ${path}`, () => assert.match(path, re));
  }

  test('does not match a non-blog directory', () => {
    assert.doesNotMatch('/public/docs/blog/2024/foo/index.html', re);
  });

  test('does not match a two-segment prefix', () => {
    assert.doesNotMatch('/public/zz/foo/blog/2024/bar/index.html', re);
  });
});

describe('parseIgnoreDirs()', () => {
  const yml = [
    '# header comment',
    'IgnoreInternalEmptyHash: true',
    'IgnoreDirs:',
    "  - '^(../)?blog/20(19|21|22|23|24)/'",
    '  # a comment inside the block',
    "  - '^bn/docs/demo/$'",
    '',
    "  - '^uk/docs/legacy/$'",
    'IgnoreURLs:',
    "  - '^https://example\\.com'",
  ].join('\n');

  test('extracts list items, skipping comments and blanks', () => {
    assert.deepEqual(parseIgnoreDirs(yml), [
      '^(../)?blog/20(19|21|22|23|24)/',
      '^bn/docs/demo/$',
      '^uk/docs/legacy/$',
    ]);
  });

  test('stops at the next top-level key', () => {
    assert.ok(
      !parseIgnoreDirs(yml).some((p) => p.includes('example')),
      'IgnoreURLs entries are not captured',
    );
  });
});

describe('toExcludePaths()', () => {
  test('de-duplicates repeated translations', () => {
    const yml = [
      'IgnoreDirs:',
      "  - '^(../)?blog/2019/'",
      "  - '^(../)?blog/2019/'",
    ].join('\n');
    const { patterns, entries } = toExcludePaths(yml);
    assert.equal(patterns.length, 2, 'both source patterns parsed');
    assert.deepEqual(entries, ['/public/(../)?blog/2019/'], 'output deduped');
  });
});
