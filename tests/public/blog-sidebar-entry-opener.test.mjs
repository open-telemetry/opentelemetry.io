// Checks the blog sidebar entry opener (assets/js/blog-sidebar-entry-opener.js)
// as the build emits it from the body-end hook, and the sidebar structure the
// script relies on:
//
// - every locale's blog index first page loads the script exactly once; later
//   pages, year and post pages, and non-blog pages don't;
// - the en blog index carries no inline copy of the opener (ja and ko keep
//   theirs until their locale sync);
// - in the blog sidebar, each year link sits inside a label tied to a checkbox,
//   which is how the script opens a group.
//
// It reads the built site, so it skips when `public/` is absent. Patterns allow
// the unquoted attributes of a minified build.

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

// Fingerprinted in production builds, plain otherwise.
const openerScriptRE =
  /<script\b[^>]*\bsrc="?[^"\s>]*\/js\/blog-sidebar-entry-opener(\.[0-9a-f]+)?\.js"?[\s>]/g;
const inlineScriptRE = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

const exists = (rel) => fs.existsSync(path.join(publicDir, rel));
const read = (rel) => {
  assert.ok(exists(rel), `public/${rel} is built`);
  return fs.readFileSync(path.join(publicDir, rel), 'utf8');
};
const openerCount = (html) => html.match(openerScriptRE)?.length ?? 0;
const inlineCount = (html) =>
  [...html.matchAll(inlineScriptRE)].filter(([, body]) =>
    body.includes('m-blog'),
  ).length;
const yearLabelFor = (html, href) =>
  html.match(
    new RegExp(
      `<label\\s+for="?([^"\\s>]+)"?\\s*>\\s*<a\\b[^>]*\\bhref="?${href}"?[\\s>]`,
    ),
  )?.[1];

// Path prefixes of the built blog indexes: '' for en, 'ja/' and so on.
const blogLocales = () =>
  ['', ...fs.readdirSync(publicDir).map((name) => `${name}/`)].filter(
    (prefix) => exists(`${prefix}blog/index.html`),
  );

// A locale's blog year sections, newest first, as the sidebar lists them.
const blogYears = (prefix) =>
  fs
    .readdirSync(path.join(publicDir, `${prefix}blog`))
    .filter((name) => /^\d{4}$/.test(name))
    .sort()
    .reverse();

if (!exists('index.html')) {
  test(
    'blog sidebar entry opener (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  test("every locale's blog index first page loads the opener once", () => {
    const locales = blogLocales();
    assert.ok(
      ['', 'ja/', 'ko/'].every((prefix) => locales.includes(prefix)),
      `en, ja and ko blog indexes are built (found: ${locales.join(' ')})`,
    );
    for (const prefix of locales) {
      const rel = `${prefix}blog/index.html`;
      assert.equal(openerCount(read(rel)), 1, `${rel} loads the opener once`);
    }
  });

  test('other pages do not load the opener', () => {
    const postDir = fs
      .readdirSync(path.join(publicDir, 'blog/2025'), { withFileTypes: true })
      .find((e) => e.isDirectory() && e.name !== 'page');
    assert.ok(postDir, 'a 2025 blog post is built');
    const pages = [
      'index.html',
      'docs/index.html',
      'blog/page/2/index.html',
      'blog/2025/index.html',
      `blog/2025/${postDir.name}/index.html`,
      'ja/blog/page/2/index.html',
      'ja/blog/2025/index.html',
    ];
    for (const rel of pages) {
      assert.equal(openerCount(read(rel)), 0, `${rel} omits the opener`);
    }
  });

  test('en blog index carries no inline copy of the opener', () => {
    assert.equal(
      inlineCount(read('blog/index.html')),
      0,
      'blog/index.html has no inline copy',
    );
  });

  test('blog sidebar ties each year link to a checkbox', () => {
    for (const prefix of ['', 'ja/']) {
      const html = read(`${prefix}blog/index.html`);
      const years = blogYears(prefix);
      assert.ok(years.length >= 2, `${prefix}blog has two or more years`);
      for (const year of years) {
        const href = `/${prefix}blog/${year}/`;
        const id = yearLabelFor(html, href);
        assert.ok(id, `${href} link is inside a label`);
        assert.match(
          html,
          new RegExp(
            `<input\\b[^>]*\\btype="?checkbox"?[^>]*\\bid="?${id}"?[\\s/>]`,
          ),
          `${href} label's control is a checkbox`,
        );
      }
    }
  });
}
