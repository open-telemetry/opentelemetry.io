// Tests for the do-not-copy-images rule. The copied-image rule is exercised
// via findCopiedImages() with an injected in-memory fs so no real files are
// touched.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { enCounterpart, isImagePath, findCopiedImages } from './index.mjs';

// Builds a minimal fs API over a { path: contents } map.
function fakeFs(map) {
  return {
    existsSync: (p) => Object.prototype.hasOwnProperty.call(map, p),
    readFileSync: (p) => Buffer.from(map[p]),
  };
}

describe('isImagePath', () => {
  test('matches known image/asset extensions (case-insensitive)', () => {
    assert.equal(isImagePath('content/ja/x/a.png'), true);
    assert.equal(isImagePath('content/ja/x/a.SVG'), true);
    assert.equal(isImagePath('content/ja/x/a.webp'), true);
  });

  test('rejects markdown and other non-asset files', () => {
    assert.equal(isImagePath('content/ja/x/index.md'), false);
    assert.equal(isImagePath('content/ja/x/data.yaml'), false);
    assert.equal(isImagePath('content/ja/x/license'), false);
  });
});

describe('enCounterpart', () => {
  test('maps a localized path to its English counterpart', () => {
    assert.equal(
      enCounterpart('content/ja/docs/x/img.png'),
      'content/en/docs/x/img.png',
    );
  });

  test('returns null for English paths', () => {
    assert.equal(enCounterpart('content/en/docs/x/img.png'), null);
  });

  test('returns null for non-content paths', () => {
    assert.equal(enCounterpart('static/img.png'), null);
  });
});

describe('findCopiedImages', () => {
  test('flags a byte-identical copy of the English asset', () => {
    const fs = fakeFs({
      'content/ja/docs/x/img.png': 'IMG',
      'content/en/docs/x/img.png': 'IMG',
    });
    assert.deepEqual(findCopiedImages(['content/ja/docs/x/img.png'], fs), [
      {
        file: 'content/ja/docs/x/img.png',
        enFile: 'content/en/docs/x/img.png',
      },
    ]);
  });

  test('allows a localized image that differs in bytes', () => {
    const fs = fakeFs({
      'content/ja/docs/x/img.png': 'LOCALIZED',
      'content/en/docs/x/img.png': 'ENGLISH',
    });
    assert.deepEqual(findCopiedImages(['content/ja/docs/x/img.png'], fs), []);
  });

  test('ignores locale assets that have no English counterpart', () => {
    const fs = fakeFs({ 'content/ja/docs/x/only.png': 'X' });
    assert.deepEqual(findCopiedImages(['content/ja/docs/x/only.png'], fs), []);
  });

  test('ignores non-image files even when identical', () => {
    const fs = fakeFs({
      'content/ja/docs/x/index.md': 'SAME',
      'content/en/docs/x/index.md': 'SAME',
    });
    assert.deepEqual(findCopiedImages(['content/ja/docs/x/index.md'], fs), []);
  });

  test('ignores English files (never compared to themselves)', () => {
    const fs = fakeFs({ 'content/en/docs/x/img.png': 'IMG' });
    assert.deepEqual(findCopiedImages(['content/en/docs/x/img.png'], fs), []);
  });

  test('reports each violation across multiple locales', () => {
    const fs = fakeFs({
      'content/ja/a/img.png': 'IMG',
      'content/zh/a/img.png': 'IMG',
      'content/en/a/img.png': 'IMG',
    });
    const result = findCopiedImages(
      ['content/ja/a/img.png', 'content/zh/a/img.png'],
      fs,
    );
    assert.equal(result.length, 2);
  });
});
