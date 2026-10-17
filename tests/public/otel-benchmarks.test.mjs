// Checks the benchmarks pages' script delivery in the built site: each page
// carries one delivery mode (the `otel-benchmarks` plugin, or the inline copy
// of a locale not yet converted), the plugin loads nowhere else, and Docsy's
// own plugins survive the site-level registration.
//
// It reads the built site, so it skips when `public/` is absent (convention:
// tests/public/favicons.test.mjs); a missing expected page is a failure, not a
// skip.

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

const PLUGIN_SRC = /\/js\/plugins\/otel-benchmarks[.\w-]*\.js/;
const CHARTJS_SRC = /\/js\/vendor\/chart-2\.9\.2[.\w-]*\.js/;
const CHARTJS_CDN = /cdn\.jsdelivr\.net\/npm\/chart\.js@/;
const DATA_SRC =
  /open-telemetry\.github\.io\/opentelemetry-collector-contrib\/benchmarks\/loadtests\/data\.js/;
const INLINE_ID = /<script\b[^>]*\bid=["']?main-script(?=["'\s>])/g;
const MAIN_ID = /<main\b[^>]*\bid=["']?main(?=["'\s>])/g;
const HOOK = /<div\b[^>]*\bdata-otel-benchmarks(?=[\s>=])/g;
const SHARED_CSS = /<link\b[^>]*\bhref=["']?\/css\/benchmarks\.css(?=["'\s>])/g;
const PLUGIN_CSS =
  /<link\b[^>]*\bhref=["']?[^"'\s>]*\/scss\/plugins\/otel-benchmarks[.\w-]*\.css(?=["'\s>])[^>]*>/g;
const BUTTON =
  /<button\b[^>]*\bid=["']?dl-button(?=["'\s>])[^>]*>([^<]*)<\/button>/g;

// The Collector benchmarks page per language. Languages without their own copy
// serve the en content as fallback (config/_default/module.yaml), so es stands
// in for the seven fallback languages.
const PAGE = (lang) =>
  `${lang === 'en' ? '' : `${lang}/`}docs/collector/benchmarks/index.html`;
const MD_PAGE = (lang) => PAGE(lang).replace(/\.html$/, '.md');
const DATA_URL =
  'https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/data.js';
const LANGS = ['en', 'ja', 'pt', 'zh', 'es'];
// Pages converted to the shortcode; a locale moving over joins this list, and
// one left out is still checked for exactly one delivery mode.
const CONVERTED = ['en', 'es'];
const OTHER_PAGES = {
  collectorIndex: 'docs/collector/index.html',
  enMermaid: 'docs/demo/architecture/index.html',
};

const read = (rel) => fs.readFileSync(path.join(publicDir, rel), 'utf8');
const count = (html, re) => (html.match(re) ?? []).length;
const scriptTags = (html) => html.match(/<script\b[^>]*>/gi) ?? [];
// Values may be unquoted: the production build minifies the HTML.
const attr = (tag, name) =>
  tag
    .match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
    ?.slice(1)
    .find((v) => v !== undefined) ?? '';
const hasAttr = (tag, name) =>
  new RegExp(`\\s${name}(?=[\\s=>])`, 'i').test(tag);
const tagsWithSrc = (html, re) =>
  scriptTags(html).filter((t) => re.test(attr(t, 'src')));

if (!fs.existsSync(path.join(publicDir, 'index.html'))) {
  test(
    'benchmarks plugin (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  test('expected pages are built', () => {
    for (const rel of [...LANGS.map(PAGE), ...Object.values(OTHER_PAGES)]) {
      assert.ok(fs.existsSync(path.join(publicDir, rel)), `${rel} is built`);
    }
  });

  for (const lang of LANGS) {
    const html = read(PAGE(lang));
    const plugin = tagsWithSrc(html, PLUGIN_SRC);
    const inline = count(html, INLINE_ID);
    const data = tagsWithSrc(html, DATA_SRC);

    test(`${lang}: exactly one delivery mode and one chart container`, () => {
      assert.equal(plugin.length + inline, 1, 'one of plugin or inline script');
      assert.equal(data.length, 1, 'data.js tag appears once');
      if (CONVERTED.includes(lang)) {
        assert.equal(plugin.length, 1, 'converted page loads the plugin');
        assert.equal(count(html, HOOK), 1, 'one plugin container');
        assert.equal(count(html, MAIN_ID), 0, 'no inline #main container');
        assert.equal(count(html, BUTTON), 0, 'no download button');
        assert.equal(count(html, SHARED_CSS), 0, 'no shared stylesheet link');
        const css = html.match(PLUGIN_CSS) ?? [];
        assert.equal(css.length, 1, 'plugin stylesheet linked once');
        assert.ok(
          attr(css[0], 'integrity'),
          'plugin stylesheet carries integrity',
        );
      } else {
        assert.equal(count(html, MAIN_ID), 1, 'one inline #main container');
        assert.equal(count(html, HOOK), 0, 'no plugin container');
        assert.equal(count(html, BUTTON), 1, 'inline copy keeps its button');
        assert.equal(
          count(html, SHARED_CSS),
          1,
          'shared stylesheet linked once',
        );
      }
    });

    if (plugin.length === 1) {
      test(`${lang}: plugin mode ships Chart.js from the site, in order, synchronously`, () => {
        const chart = tagsWithSrc(html, CHARTJS_SRC);
        assert.equal(chart.length, 1, 'vendored Chart.js tag appears once');
        assert.equal(tagsWithSrc(html, CHARTJS_CDN).length, 0, 'no CDN tag');
        for (const tag of [chart[0], plugin[0]]) {
          assert.ok(attr(tag, 'integrity'), `integrity on ${attr(tag, 'src')}`);
        }
        const tags = scriptTags(html);
        const at = (re) => tags.findIndex((t) => re.test(attr(t, 'src')));
        const [c, d, p] = [CHARTJS_SRC, DATA_SRC, PLUGIN_SRC].map(at);
        assert.ok(c < d && d < p, 'Chart.js, then data.js, then the plugin');
        for (const tag of [tags[c], tags[d], tags[p]]) {
          assert.ok(!hasAttr(tag, 'defer'), `no defer on ${attr(tag, 'src')}`);
          assert.ok(!hasAttr(tag, 'async'), `no async on ${attr(tag, 'src')}`);
        }
      });
    } else {
      test(`${lang}: inline mode keeps the CDN tag and no vendored copy`, () => {
        assert.equal(tagsWithSrc(html, CHARTJS_CDN).length, 1, 'CDN tag once');
        assert.equal(
          tagsWithSrc(html, CHARTJS_SRC).length,
          0,
          'no vendored tag',
        );
      });
    }
  }

  for (const lang of CONVERTED) {
    test(`${lang}: Markdown output has no chart markup; prose links the data`, () => {
      const md = read(MD_PAGE(lang));
      assert.doesNotMatch(md, /<(main|div|link|script)\b/, 'no chart markup');
      assert.ok(
        md.includes(`[results]: <${DATA_URL}>`),
        'prose links the data',
      );
    });
  }

  test('plugin and its dependencies load on no other page', () => {
    const html = read(OTHER_PAGES.collectorIndex);
    for (const [name, re] of [
      ['plugin', PLUGIN_SRC],
      ['Chart.js', CHARTJS_SRC],
      ['data.js', DATA_SRC],
    ]) {
      assert.equal(tagsWithSrc(html, re).length, 0, `${name} is absent`);
    }
    assert.equal(count(html, HOOK), 0, 'no plugin container');
    assert.equal(count(html, PLUGIN_CSS), 0, 'no plugin stylesheet');
  });

  test("theme plugins survive the site plugin's registration", () => {
    assert.match(
      read(OTHER_PAGES.enMermaid),
      /data-docsy-plugin=["']?mermaid["'\s>]/,
      'mermaid plugin is configured on an en diagram page',
    );
    const clickToCopy = tagsWithSrc(
      read(PAGE('en')),
      /\/js\/plugins\/click-to-copy[.\w-]*\.js/,
    );
    assert.equal(clickToCopy.length, 1, 'click-to-copy loads on en benchmarks');
    // Docsy defers click-to-copy: the positive case for the defer check above.
    assert.ok(hasAttr(clickToCopy[0], 'defer'), 'click-to-copy is deferred');
  });
}
