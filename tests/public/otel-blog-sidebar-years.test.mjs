// Checks the blog sidebar year-group expander, a site-owned Docsy plugin
// (assets/js/plugins/otel-blog-sidebar-years.js, registered for `en` in
// config/_default/hugo.yaml):
//
// - en blog index pages load the plugin script exactly once, with no inline
//   copy of the expander left in the page;
// - other en pages don't load it, and en pages keep Docsy's own plugins (the
//   language-level registration merges with the theme's plugin map);
// - every locale's blog index runs the expander at most once, plugin or
//   inline, and locales that had it keep it.
//
// It reads the built site, so it skips when `public/` is absent.

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

const pluginScriptRE =
  /<script\b[^>]*\bsrc="[^"]*\/js\/plugins\/otel-blog-sidebar-years\.[0-9a-f]+\.js"[^>]*>/g;
const inlineScriptRE = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const docsyPluginRE = (name) =>
  new RegExp(`<script\\b[^>]*\\bsrc="[^"]*/js/plugins/${name}\\.`);

const read = (rel) => fs.readFileSync(path.join(publicDir, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(publicDir, rel));
const pluginCount = (html) => html.match(pluginScriptRE)?.length ?? 0;
const inlineCount = (html) =>
  [...html.matchAll(inlineScriptRE)].filter(([, body]) =>
    body.includes('m-blog'),
  ).length;

// Locales whose blog index carried the inline expander before the plugin.
const LOCALES_WITH_EXPANDER = ['en', 'ja', 'ko'];
const OTHER_BLOG_LOCALES = ['es', 'pt', 'uk', 'zh'];
const blogIndex = (lang) =>
  lang === 'en' ? 'blog/index.html' : `${lang}/blog/index.html`;

if (!exists('index.html')) {
  test(
    'blog sidebar years plugin (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  test('en blog index pages load the plugin once, with no inline copy', () => {
    for (const rel of ['blog/index.html', 'blog/page/2/index.html']) {
      assert.ok(exists(rel), `${rel} is built`);
      const html = read(rel);
      assert.equal(pluginCount(html), 1, `${rel} loads the plugin once`);
      assert.equal(inlineCount(html), 0, `${rel} has no inline expander`);
    }
  });

  test('other en pages do not load the plugin', () => {
    const postDir = fs
      .readdirSync(path.join(publicDir, 'blog/2025'), { withFileTypes: true })
      .find((e) => e.isDirectory() && e.name !== 'page');
    assert.ok(postDir, 'a 2025 blog post is built');
    const pages = [
      'index.html',
      'docs/index.html',
      'blog/2025/index.html',
      `blog/2025/${postDir.name}/index.html`,
    ];
    for (const rel of pages) {
      assert.ok(exists(rel), `${rel} is built`);
      assert.equal(pluginCount(read(rel)), 0, `${rel} omits the plugin`);
    }
  });

  test("en pages keep Docsy's own plugins", () => {
    for (const rel of ['blog/index.html', 'docs/index.html']) {
      const html = read(rel);
      for (const name of ['click-to-copy', 'tabpane-persist']) {
        assert.match(html, docsyPluginRE(name), `${rel} loads ${name}`);
      }
    }
  });

  test('each blog index runs the expander at most once', () => {
    for (const lang of LOCALES_WITH_EXPANDER) {
      const rel = blogIndex(lang);
      assert.ok(exists(rel), `${rel} is built`);
      const html = read(rel);
      assert.equal(
        pluginCount(html) + inlineCount(html),
        1,
        `${rel} runs the expander once`,
      );
    }
    for (const lang of OTHER_BLOG_LOCALES) {
      const rel = blogIndex(lang);
      if (!exists(rel)) continue;
      const html = read(rel);
      assert.equal(
        pluginCount(html) + inlineCount(html),
        0,
        `${rel} has no expander`,
      );
    }
  });
}
