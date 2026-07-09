// Unit tests for the data-proofer-ignore -> lychee exclude scanner.
//
// cSpell:ignore proofer lycheecache opentelemetry

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  findIgnoredHrefs,
  findAllHrefs,
  generalize,
  toExcludePatterns,
  loadExcludeRegexes,
} from './index.mjs';

describe('findIgnoredHrefs()', () => {
  test('collects the href of a void element carrying the attribute', () => {
    const html =
      '<link rel="canonical" href="http://localhost/x/" data-proofer-ignore>';
    assert.deepEqual(findIgnoredHrefs(html), ['http://localhost/x/']);
  });

  test('collects the href of an anchor carrying the attribute', () => {
    const html =
      '<a data-proofer-ignore href="https://github.com/o/r/commit/abc">c</a>';
    assert.deepEqual(findIgnoredHrefs(html), [
      'https://github.com/o/r/commit/abc',
    ]);
  });

  test('collects href and src of descendants of an ignored container', () => {
    const html =
      '<div data-proofer-ignore><a href="u1"><img src="u2"></a></div>';
    assert.deepEqual(findIgnoredHrefs(html), ['u1', 'u2']);
  });

  test('ignores links outside any ignored element', () => {
    const html = '<a href="kept">k</a><div data-proofer-ignore></div>';
    assert.deepEqual(findIgnoredHrefs(html), []);
  });

  test('leaves the ignored scope after the closing tag', () => {
    const html =
      '<div data-proofer-ignore><a href="in"></a></div><a href="out"></a>';
    assert.deepEqual(findIgnoredHrefs(html), ['in']);
  });

  test('raw-text element content does not unbalance the tag stack', () => {
    const html =
      '<div data-proofer-ignore><a href="in"></a></div>' +
      '<script>if (a < b) {}</script><a href="out"></a>';
    assert.deepEqual(findIgnoredHrefs(html), ['in']);
  });

  test('decodes HTML entities in collected URLs', () => {
    const html = '<a data-proofer-ignore href="https://x.test/a?b=1&amp;c=2">';
    assert.deepEqual(findIgnoredHrefs(html), ['https://x.test/a?b=1&c=2']);
  });
});

describe('findAllHrefs()', () => {
  test('collects every href/src regardless of data-proofer-ignore', () => {
    const html =
      '<a href="kept">k</a><div data-proofer-ignore><a href="ignored"></a></div>';
    assert.deepEqual(findAllHrefs(html), ['kept', 'ignored']);
  });
});

describe('loadExcludeRegexes()', () => {
  test('extracts quoted entries from the exclude array, ignoring comments', () => {
    const toml = [
      'cache = true',
      'exclude = [',
      "  '^https?://localhost', # a comment",
      '  "^https://x\\.test/",',
      ']',
      "other = ['^not-in-exclude']",
    ].join('\n');
    assert.deepEqual(loadExcludeRegexes(toml), [
      '^https?://localhost',
      '^https://x\\.test/',
    ]);
  });

  test('returns an empty list when there is no exclude array', () => {
    assert.deepEqual(loadExcludeRegexes('cache = true'), []);
  });
});

describe('generalize()', () => {
  // 20 distinct localhost directories (> default collapse threshold) plus two
  // stable github link families.
  const urls = [
    ...Array.from({ length: 20 }, (_, i) => `http://localhost/dir${i}/`),
    'https://github.com/open-telemetry/opentelemetry.io/commit/aaa',
    'https://github.com/open-telemetry/opentelemetry.io/commit/bbb',
    'https://github.com/open-telemetry/opentelemetry.io/compare/aaa..bbb',
  ];

  test('collapses a sprawling origin to its common prefix', () => {
    const rows = generalize(urls);
    const localhost = rows.find((r) => r.prefix.startsWith('http://localhost'));
    assert.equal(localhost.prefix, 'http://localhost/', 'collapsed to host');
    assert.equal(localhost.count, 20, 'distinct URL count');
  });

  test('keeps distinct link families of a focused origin separate', () => {
    const prefixes = generalize(urls).map((r) => r.prefix);
    assert.ok(
      prefixes.includes(
        'https://github.com/open-telemetry/opentelemetry.io/commit/',
      ),
      'commit family kept',
    );
    assert.ok(
      prefixes.includes(
        'https://github.com/open-telemetry/opentelemetry.io/compare/',
      ),
      'compare family kept',
    );
  });

  test('produces sorted, deduplicated groups', () => {
    const prefixes = generalize(urls).map((r) => r.prefix);
    assert.deepEqual(prefixes, [...prefixes].sort(), 'sorted by prefix');
    assert.equal(prefixes.length, 3, 'group count');
  });

  test('skips non-http(s) URLs', () => {
    assert.deepEqual(generalize(['mailto:x@y.test', '/local/page/']), []);
  });

  test('drops URLs already covered by an exclude pattern', () => {
    const rows = generalize(urls, { exclude: ['^http://localhost/'] });
    assert.ok(
      rows.every((r) => !r.prefix.startsWith('http://localhost')),
      'localhost links are pre-filtered',
    );
    assert.equal(rows.length, 2, 'only the two github families remain');
  });

  test('flags a group whose prefix also matches a checkable link', () => {
    const ignored = [
      'https://github.com/o/r/compare/aaa..bbb',
      'https://github.com/o/r/compare/ccc..ddd',
    ];
    const checkable = ['https://github.com/o/r/compare/2023...2024'];
    const [row] = generalize(ignored, { checkable });
    assert.equal(row.prefix, 'https://github.com/o/r/compare/');
    assert.deepEqual(row.conflicts, checkable, 'conflict is reported');
  });

  test('does not flag a group with no checkable collision', () => {
    const ignored = ['https://github.com/o/r/commit/aaa'];
    const checkable = ['https://example.test/other'];
    const [row] = generalize(ignored, { checkable });
    assert.equal(row.conflicts, undefined, 'no conflict for a clean prefix');
  });
});

describe('toExcludePatterns()', () => {
  test('omits groups that collide with a checkable link', () => {
    const ignored = ['https://github.com/o/r/compare/aaa..bbb'];
    const checkable = ['https://github.com/o/r/compare/2023...2024'];
    assert.deepEqual(toExcludePatterns(ignored, { checkable }), []);
  });

  test('emits anchored, regex-escaped prefixes', () => {
    const patterns = toExcludePatterns([
      'https://github.com/open-telemetry/opentelemetry.io/commit/aaa',
      'https://github.com/open-telemetry/opentelemetry.io/commit/bbb',
    ]);
    assert.deepEqual(patterns, [
      '^https://github\\.com/open-telemetry/opentelemetry\\.io/commit/',
    ]);
  });

  test('each emitted pattern matches its source URLs', () => {
    const src = 'https://github.com/open-telemetry/opentelemetry.io/commit/abc';
    const [pattern] = toExcludePatterns([src]);
    assert.match(src, new RegExp(pattern));
  });
});
