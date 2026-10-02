// The committed link cache is a JSONC file lychee can't read, so the check
// wrapper derives lychee's .lycheecache from it on every full run. A diff-scoped
// check runs lychee directly and must derive the same way, or lychee serves
// whatever stale CSV the last full run left (a URL the owned file has since
// dropped or marked failed would still pass).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { projectCache } from './project-cache.mjs';

const owned = `{
  "https://fresh.example/": {
    "result": 200,
    "when": "2026-10-01T00:00:00Z",
    "via": "lychee",
  },
  "https://broken.example/": {
    "result": "error",
    "when": "2026-10-01T00:00:00Z",
    "via": "lychee",
  },
}
`;

describe('projectCache', () => {
  const fixture = (csv) => {
    const root = mkdtempSync(path.join(tmpdir(), 'project-cache-test-'));
    writeFileSync(path.join(root, 'link-cache.jsonc'), owned);
    if (csv !== undefined) writeFileSync(path.join(root, '.lycheecache'), csv);
    return {
      root,
      csv: () => readFileSync(path.join(root, '.lycheecache'), 'utf8'),
      cleanup: () => rmSync(root, { recursive: true, force: true }),
    };
  };

  it("replaces a stale derived CSV with the owned file's projection", () => {
    const f = fixture(
      'https://fresh.example/,200,1759276800\nhttps://stale.example/,200,1759276800\n',
    );
    try {
      projectCache(f.root);
      const csv = f.csv();
      assert.match(
        csv,
        /^https:\/\/fresh\.example\/,200,/m,
        'fresh entry projected',
      );
      assert.doesNotMatch(csv, /stale\.example/, 'stale row gone');
      assert.doesNotMatch(
        csv,
        /broken\.example/,
        'failure entry not vouched for',
      );
    } finally {
      f.cleanup();
    }
  });

  it('derives the CSV when none exists', () => {
    const f = fixture();
    try {
      projectCache(f.root);
      assert.match(f.csv(), /fresh\.example/, 'CSV derived');
    } finally {
      f.cleanup();
    }
  });
});
