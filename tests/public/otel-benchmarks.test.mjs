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
const INLINE_ID = /<script\b[^>]*\bid=["']?main-script(?=["'\s>])/g;
const STOCK_CSS =
  /<link\b[^>]*\bhref=["']?\/css\/benchmarks\.css(?=["'\s>])[^>]*>/g;
const HOOK = /<div\b[^>]*\bdata-otel-benchmarks(?=[\s>=])[^>]*>/g;
const PLUGIN_CSS =
  /<link\b[^>]*\bhref=["']?[^"'\s>]*\/scss\/plugins\/otel-benchmarks[.\w-]*\.css(?=["'\s>])[^>]*>/g;

const GH_PAGES = 'https://open-telemetry.github.io';
// The benchmarks pages, each with the languages whose own copy still carries
// the stock renderer inline (their conversion: issue #12266).
const PAGES = [
  {
    path: 'docs/collector/benchmarks',
    dataUrl: `${GH_PAGES}/opentelemetry-collector-contrib/benchmarks/loadtests/data.js`,
    options: {
      filter: ['10kDPS', '10kSPS'],
      group_separator: '/',
      series_separator: ' - ',
    },
    inline: ['ja', 'pt', 'zh'],
  },
  {
    path: 'docs/languages/js/benchmarks',
    dataUrl: `${GH_PAGES}/opentelemetry-js/benchmarks/data.js`,
    options: {},
    inline: ['ja', 'pt', 'zh'],
  },
  {
    path: 'docs/languages/python/benchmarks',
    dataUrl: `${GH_PAGES}/opentelemetry-python/benchmarks/data.js`,
    options: {},
    inline: ['ja', 'pt'],
  },
];
// Languages without their own copy serve the en content as fallback
// (config/_default/module.yaml), so es stands in for the seven.
const LANGS = ['en', 'ja', 'pt', 'zh', 'es'];
const OTHER_PAGE = 'docs/collector/index.html';

const htmlPage = (page, lang) =>
  `${lang === 'en' ? '' : `${lang}/`}${page.path}/index.html`;
const mdPage = (page, lang) => htmlPage(page, lang).replace(/\.html$/, '.md');
const dataSrc = (page) => new RegExp(`^${RegExp.escape(page.dataUrl)}$`);
// Any benchmark feed: a page loading another page's data draws its charts.
const ANY_DATA_SRC = new RegExp(`^${RegExp.escape(GH_PAGES)}/.*/data\\.js$`);

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
  for (const page of PAGES) {
    const name = page.path.split('/').slice(-2, -1)[0];
    const DATA_SRC = dataSrc(page);
    for (const lang of LANGS) {
      const converted = !page.inline.includes(lang);
      test(`${name} ${lang}: exactly one delivery mode`, () => {
        const html = read(htmlPage(page, lang));
        const plugin = tagsWithSrc(html, PLUGIN_SRC).length;
        const inline = count(html, INLINE_ID);
        assert.equal(plugin + inline, 1, 'one of plugin or inline script');
        assert.deepEqual(
          tagsWithSrc(html, ANY_DATA_SRC).map((t) => attr(t, 'src')),
          [page.dataUrl],
          "data.js tag once, and the page's own",
        );
        assert.equal(
          tagsWithSrc(html, CHARTJS_SRC).length,
          plugin,
          'vendored Chart.js accompanies the plugin, and only it',
        );
        assert.equal(
          tagsWithSrc(html, ANY_CHARTJS_SRC).length,
          1,
          'one Chart.js tag, vendored or the stock CDN',
        );
        assert.equal(
          plugin,
          converted ? 1 : 0,
          'plugin on converted pages only',
        );
        assert.equal(
          count(html, STOCK_CSS),
          inline,
          'stock stylesheet accompanies the inline script, and only it',
        );
      });

      if (!converted) continue;

      test(`${name} ${lang}: the plugin's file set, in order, synchronously`, () => {
        const html = read(htmlPage(page, lang));
        assert.equal(count(html, HOOK), 1, 'one plugin container');
        const container = html.match(HOOK)?.[0] ?? '';
        const options = JSON.parse(
          attr(container, 'data-otel-benchmarks').replaceAll('&#34;', '"'),
        );
        assert.deepEqual(
          options,
          page.options,
          'container carries the call options',
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
          0 <= c && c < d && d < p,
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

      test(`${name} ${lang}: Markdown output has no chart markup; prose links the data`, () => {
        const md = read(mdPage(page, lang));
        assert.doesNotMatch(
          md,
          /<(main|div|link|style|footer|script)\b/,
          'chart markup absent',
        );
        assert.ok(md.includes(page.dataUrl), 'prose links the data');
      });
    }
  }

  test('plugin and its dependencies are absent from a page without the shortcode', () => {
    const html = read(OTHER_PAGE);
    for (const [name, re] of [
      ['plugin', PLUGIN_SRC],
      ['Chart.js', CHARTJS_SRC],
      ...PAGES.map((page) => [`${page.path} data.js`, dataSrc(page)]),
    ]) {
      assert.equal(tagsWithSrc(html, re).length, 0, `${name} is absent`);
    }
    assert.equal(count(html, HOOK), 0, 'plugin container absent');
    assert.equal(count(html, PLUGIN_CSS), 0, 'plugin stylesheet absent');
  });

  test("theme plugins survive the site plugin's registration", () => {
    const clickToCopy = tagsWithSrc(
      read(htmlPage(PAGES[0], 'en')),
      /\/js\/plugins\/click-to-copy[.\w-]*\.js/,
    );
    assert.equal(clickToCopy.length, 1, 'click-to-copy loads on en benchmarks');
    // Docsy defers click-to-copy: the positive case for the defer check above.
    assert.ok(hasAttr(clickToCopy[0], 'defer'), 'click-to-copy is deferred');
  });
}
