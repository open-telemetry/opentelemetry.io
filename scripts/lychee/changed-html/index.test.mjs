// Unit tests for the content -> built-HTML path mapping used by the
// diff-scoped lychee check. Covers the default-language strip, locale prefix,
// and `_index`/`index`/leaf-page bundling rules.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { contentToPublic } from './index.mjs';

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
