// Unit tests for the content -> built-HTML path mapping used by the
// diff-scoped lychee check. Covers the default-language strip, locale prefix,
// and `_index`/`index`/leaf-page bundling rules.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { contentToPublic, confineToPublic, changedFiles } from './index.mjs';

describe('contentToPublic()', () => {
  test('an EN section index drops the locale prefix', () => {
    assert.equal(
      contentToPublic('content/en/docs/_index.md'),
      'public/docs/index.html',
    );
  });

  test('an EN leaf page maps to a pretty-URL index.html', () => {
    assert.equal(
      contentToPublic('content/en/docs/concepts/signals.md'),
      'public/docs/concepts/signals/index.html',
    );
  });

  test('a localized page keeps its locale prefix', () => {
    assert.equal(
      contentToPublic('content/ja/docs/concepts/signals.md'),
      'public/ja/docs/concepts/signals/index.html',
    );
  });

  test('the EN site root maps to public/index.html', () => {
    assert.equal(contentToPublic('content/en/_index.md'), 'public/index.html');
  });

  test('a localized site root maps to public/<lang>/index.html', () => {
    assert.equal(
      contentToPublic('content/de/_index.md'),
      'public/de/index.html',
    );
  });

  test('a plain index.md bundles like _index.md', () => {
    assert.equal(
      contentToPublic('content/en/blog/index.md'),
      'public/blog/index.html',
    );
  });

  test('a non-content path is not mappable', () => {
    assert.equal(contentToPublic('layouts/partials/head.html'), null);
  });

  test('a non-Markdown content file is not mappable', () => {
    assert.equal(contentToPublic('content/en/docs/img/diagram.svg'), null);
  });
});

describe('confineToPublic()', () => {
  const root = '/tmp/site';

  test('a normal mapped page resolves under public/', () => {
    assert.equal(
      confineToPublic('public/docs/concepts/signals/index.html', root),
      '/tmp/site/public/docs/concepts/signals/index.html',
    );
  });

  test('the public/ root itself is allowed', () => {
    assert.equal(
      confineToPublic('public/index.html', root),
      '/tmp/site/public/index.html',
    );
  });

  test('a path that escapes public/ via .. is rejected', () => {
    // A crafted changed-file path like content/en/../../../etc/passwd.md maps to
    // a `..`-laden public path; confinement must reject it.
    const rel = contentToPublic('content/en/../../../etc/passwd.md');
    assert.equal(confineToPublic(rel, root), null);
  });

  test('a null input stays null', () => {
    assert.equal(confineToPublic(null, root), null);
  });
});

describe('changedFiles()', () => {
  test('an unresolvable diff base is reported as an error', () => {
    // A silent empty result here would false-green the diff-scoped check.
    process.env.LYCHEE_DIFF_BASE = 'definitely-not-a-git-ref';
    try {
      assert.throws(() => changedFiles(), /cannot resolve the diff base/i);
    } finally {
      delete process.env.LYCHEE_DIFF_BASE;
    }
  });
});
