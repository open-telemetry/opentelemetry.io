// Unit tests for the front-matter -> lychee `exclude_path` generator
// (./index.mjs), including preservation of the `(../)?` locale prefix that
// lets a single pattern cover every locale.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  EXCLUDE_MARKER,
  FRONT_MATTER_KEY,
  driftedIgnoreDirOf,
  excludePathPatternsOf,
  fragmentExcludeOf,
  frontMatterOf,
  pageIgnoreDirOf,
  toExcludePaths,
  translate,
  withFragmentExcludes,
} from './index.mjs';

describe('frontMatterOf()', () => {
  test('extracts the front-matter block', () => {
    assert.equal(frontMatterOf('---\ntitle: Hi\n---\n\nBody.\n'), 'title: Hi');
  });

  test('returns undefined without front matter', () => {
    assert.equal(frontMatterOf('# Just a heading\n'), undefined);
  });
});

describe('excludePathPatternsOf()', () => {
  test('extracts a block-style list', () => {
    const fm = [
      'title: Blog',
      `${FRONT_MATTER_KEY}:`,
      '  # a comment',
      '  - ^(../)?blog/(\\d+/)?page/\\d+',
      '  - ^(../)?blog/20(19|21|22|23|24)/',
    ].join('\n');
    assert.deepEqual(excludePathPatternsOf(fm, 'f.md'), [
      '^(../)?blog/(\\d+/)?page/\\d+',
      '^(../)?blog/20(19|21|22|23|24)/',
    ]);
  });

  test('extracts a flow-style (one-line) list', () => {
    const fm = `${FRONT_MATTER_KEY}: [/en/docs/contributing/blog/]`;
    assert.deepEqual(excludePathPatternsOf(fm, 'f.md'), [
      '/en/docs/contributing/blog/',
    ]);
  });

  test('returns [] when the key is absent', () => {
    assert.deepEqual(excludePathPatternsOf('title: Hi', 'f.md'), []);
  });

  test('throws on a scalar value', () => {
    assert.throws(
      () => excludePathPatternsOf(`${FRONT_MATTER_KEY}: nope`, 'f.md'),
      /f\.md.*non-empty list/,
    );
  });

  test('throws on an empty list', () => {
    assert.throws(
      () => excludePathPatternsOf(`${FRONT_MATTER_KEY}: []`, 'f.md'),
      /f\.md.*non-empty list/,
    );
  });

  // A blank pattern would translate to `/public/`, excluding every page and
  // false-greening the whole check.
  test('throws on an empty-string pattern', () => {
    assert.throws(
      () => excludePathPatternsOf(`${FRONT_MATTER_KEY}: ['']`, 'f.md'),
      /f\.md.*non-blank/,
    );
  });

  test('throws on a whitespace-only pattern', () => {
    assert.throws(
      () => excludePathPatternsOf(`${FRONT_MATTER_KEY}: ['  ']`, 'f.md'),
      /f\.md.*non-blank/,
    );
  });
});

describe('driftedIgnoreDirOf()', () => {
  const page = (fm) => `---\n${fm}\n---\n\nBody.\n`;
  const drifted = page('title: Hi\ndrifted_from_default: true');

  test('a section or leaf-bundle page maps to its directory', () => {
    assert.equal(
      driftedIgnoreDirOf(drifted, 'content/bn/docs/demo/index.md'),
      '^bn/docs/demo/$',
    );
    assert.equal(
      driftedIgnoreDirOf(drifted, 'content/ja/docs/concepts/_index.md'),
      '^ja/docs/concepts/$',
    );
  });

  test('a leaf page maps to its filename slug', () => {
    assert.equal(
      driftedIgnoreDirOf(drifted, 'content/zh/docs/kubernetes/collector.md'),
      '^zh/docs/kubernetes/collector/$',
    );
  });

  test('a deleted-EN page ("file not found" status) is covered too', () => {
    assert.equal(
      driftedIgnoreDirOf(
        page('title: Hi\ndrifted_from_default: file not found'),
        'content/bn/docs/demo/index.md',
      ),
      '^bn/docs/demo/$',
    );
  });

  test('underscore-directory fragments are skipped', () => {
    assert.equal(
      driftedIgnoreDirOf(drifted, 'content/ja/docs/_includes/foo.md'),
      undefined,
    );
  });

  test('non-drifted pages are skipped', () => {
    assert.equal(
      driftedIgnoreDirOf(page('title: Hi'), 'content/bn/docs/demo/index.md'),
      undefined,
    );
  });

  test('a body-only status does not mark the page', () => {
    assert.equal(
      driftedIgnoreDirOf(
        `---\ntitle: Hi\n---\n\n\`\`\`yaml\ndrifted_from_default: true\n\`\`\`\n`,
        'content/bn/docs/demo/index.md',
      ),
      undefined,
    );
  });
});

describe('pageIgnoreDirOf()', () => {
  test('maps bundle and leaf pages, skips fragments and non-content paths', () => {
    assert.equal(
      pageIgnoreDirOf('content/ja/docs/concepts/_index.md'),
      '^ja/docs/concepts/$',
    );
    assert.equal(
      pageIgnoreDirOf('content/zh/docs/kubernetes/collector.md'),
      '^zh/docs/kubernetes/collector/$',
    );
    assert.equal(
      pageIgnoreDirOf('content/ja/docs/_includes/foo.md'),
      undefined,
    );
    assert.equal(pageIgnoreDirOf('scripts/foo.md'), undefined);
  });
});

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

describe('fragmentExcludeOf()', () => {
  const pattern = fragmentExcludeOf('^es/docs/setup/kubernetes/$');
  const re = new RegExp(pattern);
  const uri = (tail) => `file:///repo/public/es/docs/setup/kubernetes${tail}`;

  test('maps a page directory to a fragment-only `exclude` regex', () => {
    assert.equal(
      pattern,
      '/public/es/docs/setup/kubernetes(/(index\\.html)?)?#',
    );
  });

  for (const tail of ['#sec', '/#sec', '/index.html#sec']) {
    test(`matches a fragment link: …kubernetes${tail}`, () =>
      assert.match(uri(tail), re));
  }

  for (const tail of ['', '/', '/index.html', '-helm#sec', '-helm/#sec']) {
    test(`does not match …kubernetes${tail}`, () =>
      assert.doesNotMatch(uri(tail), re));
  }

  test('escapes regex metacharacters in the path', () => {
    assert.equal(
      fragmentExcludeOf('^xx/docs/v1.2/$'),
      '/public/xx/docs/v1\\.2(/(index\\.html)?)?#',
    );
  });
});

describe('withFragmentExcludes()', () => {
  const base = ['exclude = [', "  '/api/?$',", EXCLUDE_MARKER, ']', ''].join(
    '\n',
  );

  test('replaces the marker line with the entries', () => {
    assert.equal(
      withFragmentExcludes(base, ['/public/a(/(index\\.html)?)?#']),
      [
        'exclude = [',
        "  '/api/?$',",
        "  '/public/a(/(index\\.html)?)?#',",
        ']',
        '',
      ].join('\n'),
    );
  });

  test('removes the marker line when there are no entries', () => {
    assert.equal(
      withFragmentExcludes(base, []),
      ['exclude = [', "  '/api/?$',", ']', ''].join('\n'),
    );
  });

  test('throws when the marker is missing', () => {
    assert.throws(() => withFragmentExcludes('exclude = []\n', []), /marker/);
  });

  test('throws when the marker appears more than once', () => {
    assert.throws(
      () => withFragmentExcludes(`${base}${EXCLUDE_MARKER}\n`, []),
      /marker/,
    );
  });
});

describe('toExcludePaths()', () => {
  const page = (fm) => `---\n${fm}\n---\n\nBody.\n`;

  test('collects, translates, sorts drifted, and de-duplicates', () => {
    const pages = [
      [
        'content/en/blog/_index.md',
        page(`${FRONT_MATTER_KEY}:\n  - ^(../)?blog/2019/`),
      ],
      ['content/zh/docs/demo/index.md', page('drifted_from_default: true')],
      ['content/bn/docs/demo/index.md', page('drifted_from_default: true')],
      ['content/en/docs/plain.md', page('title: Plain')],
      ['README.md', 'No front matter.\n'],
    ];
    const { patterns, drifted, entries } = toExcludePaths(pages);
    assert.deepEqual(patterns, ['^(../)?blog/2019/']);
    assert.deepEqual(drifted, ['^bn/docs/demo/$', '^zh/docs/demo/$']);
    assert.deepEqual(entries, [
      '/public/(../)?blog/2019/',
      '/public/bn/docs/demo/index\\.html$',
      '/public/zh/docs/demo/index\\.html$',
    ]);
  });

  test('de-duplicates repeated translations', () => {
    const pages = [
      [
        'content/en/blog/_index.md',
        page(
          `${FRONT_MATTER_KEY}:\n  - ^(../)?blog/2019/\n  - ^(../)?blog/2019/`,
        ),
      ],
    ];
    const { patterns, entries } = toExcludePaths(pages);
    assert.equal(patterns.length, 2, 'both source patterns parsed');
    assert.deepEqual(entries, ['/public/(../)?blog/2019/'], 'output deduped');
  });

  test('merges drift-pending dirs, deduped against stored-drifted ones', () => {
    const pages = [
      ['content/zh/docs/demo/index.md', page('drifted_from_default: true')],
    ];
    const { drifted, driftPending, entries } = toExcludePaths(pages, [
      '^zh/docs/demo/$', // already stored-drifted
      '^ja/docs/demo/$',
    ]);
    assert.deepEqual(drifted, ['^zh/docs/demo/$']);
    assert.deepEqual(driftPending, ['^ja/docs/demo/$', '^zh/docs/demo/$']);
    assert.deepEqual(entries, [
      '/public/zh/docs/demo/index\\.html$',
      '/public/ja/docs/demo/index\\.html$',
    ]);
  });

  test('fragment excludes cover drifted and drift-pending pages only', () => {
    const pages = [
      [
        'content/en/blog/_index.md',
        page(`${FRONT_MATTER_KEY}:\n  - ^(../)?blog/2019/`),
      ],
      ['content/zh/docs/demo/index.md', page('drifted_from_default: true')],
      ['content/ja/docs/plain.md', page('title: In sync')],
    ];
    const { fragmentExcludes } = toExcludePaths(pages, [
      '^zh/docs/demo/$', // already stored-drifted
      '^ja/docs/pending/$',
    ]);
    assert.deepEqual(fragmentExcludes, [
      '/public/zh/docs/demo(/(index\\.html)?)?#',
      '/public/ja/docs/pending(/(index\\.html)?)?#',
    ]);
  });
});
