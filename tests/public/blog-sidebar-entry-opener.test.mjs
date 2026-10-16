// Checks the blog sidebar entry opener (assets/js/blog-sidebar-entry-opener.js)
// as the build emits it, and the sidebar structure the script relies on:
//
// - every locale's blog index first page loads the script exactly once, and
//   sampled later, year, post and non-blog pages don't;
// - the en blog index carries no inline copy of the opener (ja and ko keep
//   theirs until their locale sync);
// - the blog sidebar's root link and year groups, each a link inside a label
//   tied to a checkbox, are where the script looks for them.
//
// It reads the built site, so it skips when `public/` is absent. Patterns allow
// the unquoted attributes of a minified build and any attribute order.

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

// Minified and fingerprinted in production builds, plain otherwise.
const openerScriptRE =
  /<script\b[^>]*\bsrc="?[^"\s>]*\/js\/blog-sidebar-entry-opener(\.min)?(\.[0-9a-f]+)?\.js"?[\s>]/g;
const inlineScriptRE = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
// The old snippet's checkbox IDs, or the opener's own lookup.
const inlineOpenerRE = /m-blog|td-section-nav/;

// A lookahead per attribute keeps a tag matcher independent of attribute order.
const attrAhead = (name, value) => `(?=[^>]*\\b${name}="?${value}"?[\\s/>])`;
const rootLinkRE = (href) =>
  new RegExp(
    `<a\\b${attrAhead('href', href)}(?=[^>]*\\bclass="[^"]*\\btree-root\\b)`,
  );
const yearLabelRE = (href) =>
  new RegExp(
    `<label\\b(?=[^>]*\\bfor="?([^"\\s>]+)"?[\\s>])[^>]*>\\s*<a\\b${attrAhead('href', href)}`,
  );
const checkboxRE = (id) =>
  new RegExp(`<input\\b${attrAhead('type', 'checkbox')}${attrAhead('id', id)}`);

const exists = (rel) => fs.existsSync(path.join(publicDir, rel));
const read = (rel) => {
  assert.ok(exists(rel), `public/${rel} is built`);
  return fs.readFileSync(path.join(publicDir, rel), 'utf8');
};
const openerCount = (html) => html.match(openerScriptRE)?.length ?? 0;
const inlineCount = (html) =>
  [...html.matchAll(inlineScriptRE)].filter(([, body]) =>
    inlineOpenerRE.test(body),
  ).length;
const sectionNav = (html) => {
  const nav = html.match(
    /<nav\b(?=[^>]*\bid="?td-section-nav"?[\s>])[\s\S]*?<\/nav>/,
  )?.[0];
  assert.ok(nav, 'sidebar section nav is built');
  return nav;
};

// Path prefixes of the built blog indexes: '' for en, 'ja/' and so on.
const blogLocales = () =>
  ['', ...fs.readdirSync(publicDir).map((name) => `${name}/`)].filter(
    (prefix) => exists(`${prefix}blog/index.html`),
  );

const blogYears = (prefix) =>
  fs
    .readdirSync(path.join(publicDir, `${prefix}blog`))
    .filter((name) => /^\d{4}$/.test(name));

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
      'blog/index.html is free of inline openers',
    );
  });

  test('blog sidebar has the root link and year groups the script keys on', () => {
    for (const prefix of ['', 'ja/']) {
      const nav = sectionNav(read(`${prefix}blog/index.html`));
      const root = `/${prefix}blog/`;
      assert.match(
        nav,
        rootLinkRE(root),
        `${root} is the nav's tree-root link`,
      );
      const years = blogYears(prefix);
      assert.ok(years.length >= 2, `${prefix}blog has two or more years`);
      for (const year of years) {
        const href = `${root}${year}/`;
        const id = nav.match(yearLabelRE(href))?.[1];
        assert.ok(id, `${href} link is a label's child`);
        assert.match(
          nav,
          checkboxRE(id),
          `${href} label's control is a checkbox`,
        );
      }
    }
  });
}
