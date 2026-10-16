// Checks the Collector benchmarks page's script delivery in the built site:
// the `otel-collector-benchmarks` Docsy plugin (assets/js/plugins/) replaces
// the inline script on the en page, loads only there, and ships Chart.js from
// the site with subresource integrity; locales not yet converted keep their
// inline copy and no page carries both. The theme's own plugins must survive
// the per-language registration (params merge).
//
// It reads the built site, so it skips when `public/` is absent (convention:
// tests/public/favicons.test.mjs).

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

const PLUGIN_SRC = /\/js\/plugins\/otel-collector-benchmarks[.\w-]*\.js/;
const CHARTJS_SRC = /\/js\/vendor\/chart-2\.9\.2[.\w-]*\.js/;
const CHARTJS_CDN = /cdn\.jsdelivr\.net\/npm\/chart\.js@/;
const DATA_SRC =
  /open-telemetry\.github\.io\/opentelemetry-collector-contrib\/benchmarks\/loadtests\/data\.js/;
const INLINE_ID = /<script\b[^>]*\bid=["']?main-script["'\s>]/;

const PAGES = {
  en: 'docs/collector/benchmarks/index.html',
  ja: 'ja/docs/collector/benchmarks/index.html',
  enCollectorIndex: 'docs/collector/index.html',
  enMermaid: 'docs/demo/architecture/index.html',
};

const read = (rel) => fs.readFileSync(path.join(publicDir, rel), 'utf8');
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

if (!fs.existsSync(path.join(publicDir, PAGES.en))) {
  test(
    'collector benchmarks plugin (skipped: no build)',
    { skip: 'run `npm run build` first' },
    () => {},
  );
} else {
  test('en page loads the plugin once, with SRI, and no inline copy', () => {
    const html = read(PAGES.en);
    const plugin = tagsWithSrc(html, PLUGIN_SRC);
    assert.equal(plugin.length, 1, 'plugin script tag appears once');
    assert.ok(attr(plugin[0], 'integrity'), 'plugin script carries integrity');
    assert.doesNotMatch(html, INLINE_ID, 'inline main-script is gone');
  });

  test('en page ships Chart.js from the site, not the CDN', () => {
    const html = read(PAGES.en);
    const chart = tagsWithSrc(html, CHARTJS_SRC);
    assert.equal(chart.length, 1, 'vendored Chart.js tag appears once');
    assert.ok(attr(chart[0], 'integrity'), 'Chart.js tag carries integrity');
    assert.equal(
      tagsWithSrc(html, CHARTJS_CDN).length,
      0,
      'no Chart.js CDN tag remains',
    );
  });

  test('en page loads Chart.js, then data.js, then the plugin', () => {
    const html = read(PAGES.en);
    const tags = scriptTags(html);
    const at = (re) => tags.findIndex((t) => re.test(attr(t, 'src')));
    const [chart, data, plugin] = [CHARTJS_SRC, DATA_SRC, PLUGIN_SRC].map(at);
    assert.equal(tagsWithSrc(html, DATA_SRC).length, 1, 'data.js appears once');
    assert.ok(chart < data && data < plugin, 'script order is preserved');
    for (const tag of [tags[chart], tags[data], tags[plugin]]) {
      assert.ok(!hasAttr(tag, 'defer'), 'script loads synchronously');
    }
  });

  test('ja page keeps its inline copy until converted', () => {
    const html = read(PAGES.ja);
    assert.match(html, INLINE_ID, 'inline main-script is present');
    assert.equal(tagsWithSrc(html, PLUGIN_SRC).length, 0, 'plugin is absent');
    assert.equal(
      tagsWithSrc(html, CHARTJS_CDN).length,
      1,
      'CDN Chart.js tag appears once',
    );
  });

  test('plugin and its dependencies load on no other page', () => {
    const html = read(PAGES.enCollectorIndex);
    for (const [name, re] of [
      ['plugin', PLUGIN_SRC],
      ['Chart.js', CHARTJS_SRC],
      ['data.js', DATA_SRC],
    ]) {
      assert.equal(tagsWithSrc(html, re).length, 0, `${name} is absent`);
    }
  });

  test("theme plugins survive the site plugin's registration", () => {
    assert.match(
      read(PAGES.enMermaid),
      /data-docsy-plugin=["']?mermaid["'\s>]/,
      'mermaid plugin is configured on an en diagram page',
    );
    const clickToCopy = tagsWithSrc(
      read(PAGES.en),
      /\/js\/plugins\/click-to-copy[.\w-]*\.js/,
    );
    assert.equal(
      clickToCopy.length,
      1,
      'click-to-copy plugin loads on the en benchmarks page',
    );
    // Docsy defers click-to-copy: the positive case for the defer check above.
    assert.ok(hasAttr(clickToCopy[0], 'defer'), 'click-to-copy is deferred');
  });
}
