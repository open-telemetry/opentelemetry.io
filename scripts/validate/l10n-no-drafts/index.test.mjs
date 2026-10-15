// Tests for the no-drafts rule. The rule is exercised via findDraftPages()
// with an injected in-memory fs so no real files are touched.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { findDraftPages, hasDraftKey, isLocalizedPagePath } from './index.mjs';

// Builds a minimal fs API over a { path: contents } map.
function fakeFs(map) {
  return { readFileSync: (p) => map[p] };
}

const page = (frontMatter, body = '\nBody text.\n') =>
  `---\n${frontMatter}\n---\n${body}`;

describe('isLocalizedPagePath', () => {
  test('matches non-English content pages', () => {
    assert.equal(isLocalizedPagePath('content/es/docs/x.md'), true);
    assert.equal(isLocalizedPagePath('content/zh/_index.md'), true);
  });

  test('rejects English pages, non-content paths and non-markdown files', () => {
    assert.equal(isLocalizedPagePath('content/en/docs/x.md'), false);
    assert.equal(isLocalizedPagePath('layouts/docs/x.md'), false);
    assert.equal(isLocalizedPagePath('content/es/docs/img.png'), false);
  });
});

describe('hasDraftKey', () => {
  test('detects a top-level draft key, whatever its value', () => {
    assert.equal(hasDraftKey(page('title: T\ndraft: true')), true);
    assert.equal(hasDraftKey(page('title: T\ndraft: false')), true);
    assert.equal(hasDraftKey(page('draft: true # keep hidden')), true);
  });

  test('detects quoted and differently cased keys', () => {
    assert.equal(hasDraftKey(page('"draft": true')), true);
    assert.equal(hasDraftKey(page('Draft: True')), true);
  });

  test('detects a cascaded draft key, as a mapping or a list item', () => {
    assert.equal(hasDraftKey(page('cascade:\n  draft: true')), true);
    assert.equal(hasDraftKey(page('cascade:\n  - draft: true')), true);
    assert.equal(
      hasDraftKey(
        page('cascade:\n  - _target:\n      path: /docs/**\n    draft: true'),
      ),
      true,
    );
  });

  test('does not detect a flow-style mapping (known limitation)', () => {
    assert.equal(hasDraftKey(page('cascade: {draft: true}')), false);
  });

  test('ignores body text and pages without front matter', () => {
    assert.equal(hasDraftKey(page('title: T', '\ndraft: true\n')), false);
    assert.equal(hasDraftKey('draft: true\n\nNo front matter here.'), false);
  });

  test('ignores keys that merely contain "draft"', () => {
    assert.equal(hasDraftKey(page('draft_note: true\nis_draft: true')), false);
  });
});

describe('findDraftPages', () => {
  test('flags localized pages with a draft key only', () => {
    const files = {
      'content/es/docs/a.md': page('draft: true'),
      'content/pt/docs/b.md': page('title: T'),
      'content/en/docs/c.md': page('draft: true'),
      'content/ja/docs/d.md': page('cascade:\n  - draft: true'),
    };
    assert.deepEqual(findDraftPages(Object.keys(files), fakeFs(files)), [
      'content/es/docs/a.md',
      'content/ja/docs/d.md',
    ]);
  });

  test('returns an empty list when no localized page has a draft key', () => {
    const files = { 'content/es/docs/a.md': page('title: T') };
    assert.deepEqual(findDraftPages(Object.keys(files), fakeFs(files)), []);
  });
});
