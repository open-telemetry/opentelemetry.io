// Checks the benchmarks pages' script delivery in the built site: the behavior
// owned by Docsy's plugin loading and by the `benchmarks` shortcode's gate,
// which no unit sees.
//
// A `test:public` check (Site § Testing): skips without a build; a missing
// expected page is a failure, not a skip.

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
// Any version: the pin is hugo.yaml's business; vendoring with SRI is ours.
const CHARTJS_SRC = /\/js\/vendor\/chart-\d[.\w-]*\.js/;
const ANY_CHARTJS_SRC = /chart/i;
const DATA_URL =
  'https://open-telemetry.github.io/opentelemetry-collector-contrib/benchmarks/loadtests/data.js';
const DATA_SRC = new RegExp(RegExp.escape(DATA_URL));
const INLINE_ID = /<script\b[^>]*\bid=["']?main-script(?=["'\s>])/g;
const HOOK = /<div\b[^>]*\bdata-otel-benchmarks(?=[\s>=])/g;
const HOOK_TAG = /<div\b[^>]*\bdata-otel-benchmarks\b[^>]*>/;
const PLUGIN_CSS =
  /<link\b[^>]*\bhref=["']?[^"'\s>]*\/scss\/plugins\/otel-benchmarks[.\w-]*\.css(?=["'\s>])[^>]*>/g;

const PAGE = (lang) =>
  `${lang === 'en' ? '' : `${lang}/`}docs/collector/benchmarks/index.html`;
const MD_PAGE = (lang) => PAGE(lang).replace(/\.html$/, '.md');
// Languages without their own copy serve the en content as fallback
// (config/_default/module.yaml), so es stands in for the seven.
const LANGS = ['en', 'ja', 'pt', 'zh', 'es'];
// A locale moving over joins this list; when the last one does, the
// delivery-mode duality here goes with the inline copies.
const CONVERTED = ['en', 'es'];
const OTHER_PAGE = 'docs/collector/index.html';

const read = (rel) => {
  const file = path.join(publicDir, rel);
  assert.ok(fs.existsSync(file), `public/${rel} is built`);
  return fs.readFileSync(file, 'utf8');
};
const count = (html, re) => (html.match(re) ?? []).length;
const scriptTags = (html) => html.match(/<script\b[^>]*>/gi) ?? [];
// An attribute's value by its exact name (`src`, not `data-src`), quoted or
// not: the production build minifies the HTML.
const attr = (tag, name) =>
  tag
    .match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
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
  for (const lang of LANGS) {
    test(`${lang}: exactly one delivery mode`, () => {
      const html = read(PAGE(lang));
      const plugin = tagsWithSrc(html, PLUGIN_SRC).length;
      const inline = count(html, INLINE_ID);
      assert.equal(plugin + inline, 1, 'one of plugin or inline script');
      assert.equal(tagsWithSrc(html, DATA_SRC).length, 1, 'data.js tag once');
      assert.equal(
        tagsWithSrc(html, CHARTJS_SRC).length,
        plugin,
        'vendored Chart.js accompanies the plugin, and only it',
      );
      assert.equal(
        plugin,
        CONVERTED.includes(lang) ? 1 : 0,
        'plugin on converted pages only',
      );
    });

    if (!CONVERTED.includes(lang)) continue;

    test(`${lang}: the plugin's file set, in order, synchronously`, () => {
      const html = read(PAGE(lang));
      assert.equal(count(html, HOOK), 1, 'one plugin container');
      const container = html.match(HOOK_TAG)?.[0] ?? '';
      const reading = JSON.parse(
        attr(container, 'data-reading').replaceAll('&#34;', '"'),
      );
      assert.deepEqual(
        reading.filter,
        ['10kDPS', '10kSPS'],
        'container carries the reading from the call',
      );
      const css = html.match(PLUGIN_CSS) ?? [];
      assert.equal(css.length, 1, 'plugin stylesheet linked once');
      assert.ok(
        attr(css[0], 'integrity'),
        'plugin stylesheet carries integrity',
      );
      assert.equal(
        tagsWithSrc(html, ANY_CHARTJS_SRC).length,
        1,
        'vendored Chart.js is the only Chart.js',
      );
      const tags = scriptTags(html);
      const at = (re) => tags.findIndex((t) => re.test(attr(t, 'src')));
      const [c, d, p] = [CHARTJS_SRC, DATA_SRC, PLUGIN_SRC].map(at);
      assert.ok(
        c < d && d < p,
        `Chart.js (${c}), then data.js (${d}), then the plugin (${p})`,
      );
      assert.ok(
        html.search(HOOK) < html.indexOf(tags[p]),
        'container precedes the plugin tag',
      );
      for (const tag of [tags[c], tags[p]]) {
        assert.ok(attr(tag, 'integrity'), `integrity on ${attr(tag, 'src')}`);
      }
      for (const tag of [tags[c], tags[d], tags[p]]) {
        assert.ok(
          !hasAttr(tag, 'defer'),
          `defer absent on ${attr(tag, 'src')}`,
        );
        assert.ok(
          !hasAttr(tag, 'async'),
          `async absent on ${attr(tag, 'src')}`,
        );
      }
    });

    test(`${lang}: Markdown output has no chart markup; prose links the data`, () => {
      const md = read(MD_PAGE(lang));
      assert.doesNotMatch(
        md,
        /<(main|div|link|script)\b/,
        'chart markup absent',
      );
      assert.ok(md.includes(DATA_URL), 'prose links the data');
    });
  }

  test('plugin and its dependencies are absent from a page without the shortcode', () => {
    const html = read(OTHER_PAGE);
    for (const [name, re] of [
      ['plugin', PLUGIN_SRC],
      ['Chart.js', CHARTJS_SRC],
      ['data.js', DATA_SRC],
    ]) {
      assert.equal(tagsWithSrc(html, re).length, 0, `${name} is absent`);
    }
    assert.equal(count(html, HOOK), 0, 'plugin container absent');
    assert.equal(count(html, PLUGIN_CSS), 0, 'plugin stylesheet absent');
  });

  test("theme plugins survive the site plugin's registration", () => {
    const clickToCopy = tagsWithSrc(
      read(PAGE('en')),
      /\/js\/plugins\/click-to-copy[.\w-]*\.js/,
    );
    assert.equal(clickToCopy.length, 1, 'click-to-copy loads on en benchmarks');
    // Docsy defers click-to-copy: the positive case for the defer check above.
    assert.ok(hasAttr(clickToCopy[0], 'defer'), 'click-to-copy is deferred');
  });
}
