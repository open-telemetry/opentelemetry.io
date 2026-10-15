// Tests for the no-drafts rule. The rule is exercised via findDraftPages()
// with an injected in-memory fs so no real files are touched.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { findDraftPages, isDraftPage, isLocalizedPagePath } from './index.mjs';

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

describe('isDraftPage', () => {
  test('detects a top-level draft', () => {
    assert.equal(isDraftPage(page('title: T\ndraft: true')), true);
  });

  test('detects a draft with a trailing comment or quoted value', () => {
    assert.equal(isDraftPage(page('draft: true # keep hidden')), true);
    assert.equal(isDraftPage(page("draft: 'true'")), true);
  });

  test('detects a cascaded draft', () => {
    assert.equal(
      isDraftPage(page('title: Section\ncascade:\n  draft: true')),
      true,
    );
  });

  test('ignores draft: false', () => {
    assert.equal(isDraftPage(page('title: T\ndraft: false')), false);
  });

  test('ignores body text and pages without front matter', () => {
    assert.equal(isDraftPage(page('title: T', '\ndraft: true\n')), false);
    assert.equal(isDraftPage('draft: true\n\nNo front matter here.'), false);
  });

  test('ignores a draft-like key with a different name', () => {
    assert.equal(isDraftPage(page('draft_note: true\nis_draft: true')), false);
  });
});

describe('findDraftPages', () => {
  test('flags localized draft pages only', () => {
    const files = {
      'content/es/docs/a.md': page('draft: true'),
      'content/pt/docs/b.md': page('draft: false'),
      'content/en/docs/c.md': page('draft: true'),
      'content/ja/docs/d.md': page('cascade:\n  draft: true'),
    };
    assert.deepEqual(findDraftPages(Object.keys(files), fakeFs(files)), [
      'content/es/docs/a.md',
      'content/ja/docs/d.md',
    ]);
  });

  test('returns an empty list when no localized page is a draft', () => {
    const files = { 'content/es/docs/a.md': page('title: T') };
    assert.deepEqual(findDraftPages(Object.keys(files), fakeFs(files)), []);
  });
});
