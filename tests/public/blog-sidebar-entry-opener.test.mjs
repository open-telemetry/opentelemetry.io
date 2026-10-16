// Checks that the build emits the blog sidebar entry opener
// (assets/js/blog-sidebar-entry-opener.js) on blog index pages and nowhere
// else, and that en's blog index no longer inlines a script. It reads the built
// site, so it skips when `public/` is absent.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const publicDir = path.join(repoRoot, 'public');

// Minified and fingerprinted in production builds, plain otherwise; a minified
// build may drop the attribute quotes.
const openerScriptRE =
  /<script\b[^>]*\ssrc="?[^"\s>]*\/js\/blog-sidebar-entry-opener(\.min)?(\.[0-9a-f]+)?\.js"?[\s>]/g;

const read = (rel) => {
  const file = path.join(publicDir, rel);
  assert.ok(fs.existsSync(file), `public/${rel} is built`);
  return fs.readFileSync(file, 'utf8');
};
const openerCount = (html) => html.match(openerScriptRE)?.length ?? 0;

if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
  test(
    'blog sidebar entry opener (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  test('blog index pages load the opener once; other pages not at all', () => {
    for (const rel of ['blog', 'ja/blog', 'ko/blog']) {
      assert.equal(
        openerCount(read(`${rel}/index.html`)),
        1,
        `${rel} loads the opener once`,
      );
    }
    for (const rel of ['', 'docs', 'blog/2025']) {
      assert.equal(
        openerCount(read(`${rel}/index.html`)),
        0,
        `${rel || 'home'} omits the opener`,
      );
    }
  });

  // ja and ko keep their inline copies until their locale sync.
  test("en blog index's Markdown output carries no script", () => {
    assert.doesNotMatch(
      read('blog/index.md'),
      /<script\b/,
      'blog/index.md is script-free',
    );
  });
}
