---
title: Plugins and scripts
description: >-
  How the site loads and gates its own JavaScript, including the benchmarks
  plugin and body-end scripts
aliases: [scripts]
cSpell:ignore: subresource
---

The site adds a few scripts of its own to Docsy's, under `assets/js/`, loaded
three ways:

- [Plugins](#plugins), through Docsy's loader
- Hook scripts, through the body-end hook ([inventory](#body-end-scripts)) and
  the head-end hook (one script, the Kapa widget's pre-initialization)
- Shortcode scripts, by the shortcode of the feature that needs them: the
  registry search form and the config-types accordion, for example

Hooks and shortcodes load a script through the `script.html` partial: Hugo's
`js.Build` bundles each file, and production builds also minify, fingerprint and
add subresource integrity.

## Plugins

Site plugins follow Docsy's [custom-script contract][Docsy plugins] under the
`otel-` prefix. One that renders markup of its own is gated by a shortcode that
owns the markup and marks the page, so the gate follows the content into every
language that serves it; the shim reads the mark. A shortcode in included
content marks the included page, not the page that includes it ([Page flags in
included content][]).

### Benchmarks plugin {#benchmarks}

The `otel-benchmarks` plugin is a fork of the renderer that
[github-action-benchmark][] publishes with a repository's benchmark history (a
`data.js` on GitHub Pages); the action defines the data's shape in its [source
types][] and reads it in that [stock renderer][]. The shortcode call names the
data and says how to read it:

```markdown
{{</* benchmarks data_url="param:otel-benchmarks.data_url" filter="10kDPS,10kSPS" group_separator="/" series_separator=" - " */>}}
```

- `data_url`: the action's `data.js`, as `https://…` or as `param:`_`NAME`_, a
  page param holding it; the pages keep the URL in
  `params.otel-benchmarks.data_url` because their prose links it too, through
  `_param`
- `filter`: keep a bench whose `extra` contains any of the comma-separated
  strings
- `group_separator`: split `extra` into a group, joined to the bench name as the
  chart's title, and a series name; an `extra` without the separator is both
- `series_separator`: trim a series name split off by `group_separator` at its
  first occurrence

Without `group_separator`, the call is bare: each bench name is its own chart
with one series, which assumes bench names are unique within a commit. A bare
call's chart draws on its own commit axis (the commits where the bench has data)
and its tooltip names no series, as the stock renderer draws it; grouped charts
share the data set's commit axis, so their series line up. The plugin's parts:

- **Shortcode**, `layouts/_shortcodes/benchmarks.html`: emits the chart
  container, a `div` whose `data-otel-benchmarks` attribute carries the call's
  options as JSON for the renderer, and records the data URL in the page
  [store][] as `otelBenchmarks`. A malformed `data_url`, an unknown or
  positional argument, or a second call naming other data fails the build. Links
  and text belong in the page's prose, where each language writes its own. Each
  call renders a chart set where it stands.
- **Markdown variant**, `benchmarks.md` beside it: empty by design, so the HTML
  template's markup stays out of the page's [Markdown output][], which the site
  serves per [Agent support](../../design/agent-support/); the data file the
  prose links is an agent's path to the numbers.
- **Shim**, `layouts/_partials/scripts/plugins/otel-benchmarks_docsy-shim.html`
  ([Adjust a plugin per page][]): disables the plugin on pages without the
  record, which keeps the remote data script off every other page
  ([Security][]).
- **Companion**, `layouts/_partials/scripts/plugins/otel-benchmarks.html`
  ([Plugin files][]): vendors Chart.js on the entry's
  [`version`][Dependency versions] pin, then loads the data file from the
  record. The data stays a live remote script so the charts update between site
  builds, which a fixed integrity hash would forbid.
- **Script**, `assets/js/plugins/otel-benchmarks/` ([Plugin files][]):
  `index.js` is the renderer; beside it, `legend.js` (the legend's shape and the
  chart height that fits it), `commit.js` (a point's value line and commit, in
  the tooltip and the popover) and `point-popover.js` (the click popover). Docsy
  resolves `js/plugins/otel-benchmarks.js` only, so that file imports the
  folder's entry.
- **Stylesheet**, `assets/scss/plugins/otel-benchmarks.scss` ([Plugin files][]):
  the charts' layout, scoped to the container (a horizontal scroller per chart
  for narrow columns, the minimum width the renderer sizes each chart from, and
  spacing); Docsy emits it with the plugin. The inline copies keep the stock
  page's `static/css/benchmarks.css`, whose bare `main`, `button` and `footer`
  selectors also reach Docsy's chrome.
- **Registration**, `config/_default/hugo.yaml` ([Configuration reference][]):
  one site-level entry, since the shim decides per page.
- **Tests**, `tests/public/otel-benchmarks.test.mjs`: its `PAGES` table is the
  inventory of the pages on the plugin and of the localized copies still inline;
  the checks cover each page's built copies across converted, inline and
  fallback languages, and the Markdown output of the converted ones.

#### Convert a localized page

To convert a localized copy that still inlines the script (the remaining copies:
[#12266][]):

1. Remove the stylesheet link above the prose (and the Python page's `<style>`
   block), and replace the block below it (from the `markdownlint` comment
   through the last `<script>` tag) with the shortcode line from the English
   page.
2. Copy the English page's `otel-benchmarks` param, translate its tip, and link
   the data from the prose as it does.
3. Remove the language from the page's `inline` list in
   `tests/public/otel-benchmarks.test.mjs`.
4. If that was the site's last inline copy, delete this section, the test's
   `inline` lists and inline delivery-mode checks, and
   `static/css/benchmarks.css`.

Languages without their own copy serve the English page and convert with it.

## Body-end scripts

| Script                         | Pages                                          | Purpose                                                                                                            |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `blog-sidebar-entry-opener.js` | Blog index and pager pages (acts on the first) | Opens the two newest year groups in the sidebar                                                                    |
| `imageZoom.js`                 | All                                            | Click-to-zoom for content images                                                                                   |
| `navScroll.js`                 | All                                            | Meant to scroll the sidebar's active entry into view; inert today, since the active state is applied after it runs |
| `tracing.js`                   | Netlify builds, when unpaused                  | [Website telemetry](../../features/#website-telemetry), paused                                                     |

### Blog sidebar entry opener

`blog-sidebar-entry-opener.js` is the one body-end script gated to a page and
the one that acts on the sidebar.

#### Gating to the blog index

The body-end hook renders on every page, so the opener is gated there on the
page's `.Path`, which is the same in every locale: `{{ if eq .Path "/blog" }}`.

A `.Path` gate can't single out the first page of a paginated list. Hugo renders
a list's pager pages from the one section page, so `.Path`, `.RelPermalink` and
`.Pages` are identical on `/blog/` and `/blog/page/2/`, and the current slice is
known only to the pager (`.Paginator`, or what `.Paginate` returned). Calling
`.Paginator` on a list page that Docsy's template leaves unpaginated, such as an
empty blog, paginates it and publishes a `page/1/` alias. The opener therefore
loads on every pager page and skips them at runtime, by testing
`location.pathname` for `/page/`.

#### Acting on the sidebar

The site uses Docsy's cached sidebar (`ui.sidebar_cache_limit: 1`): one nav per
sidebar root, shipped hidden (`d-none`) with no active state. Docsy's
`chrome-nav.js` hydrates it at `DOMContentLoaded`: it applies the active state
and reveals the nav. The blog index, like every section's landing page, carries
that nav inline in both [build kinds](../../build/#build-kinds), so a body-end
script there runs during parsing, before the reveal, and can set sidebar state
before the sidebar appears; the opener checks its two year groups then. In a
lean build, other pages carry a placeholder instead, which `chrome-nav.js` fills
after fetching the nav, too late for a body-end script. With JavaScript
disabled, the sidebar stays hidden.

<!-- prettier-ignore-start -->
[#12266]: https://github.com/open-telemetry/opentelemetry.io/issues/12266
[Adjust a plugin per page]: https://www.docsy.dev/docs/content/plugins/#adjust-a-plugin-per-page
[Configuration reference]: https://www.docsy.dev/docs/content/plugins/#configuration-reference
[Dependency versions]: https://www.docsy.dev/docs/content/plugins/#dependency-versions
[Docsy plugins]: https://www.docsy.dev/docs/content/plugins/#add-a-custom-script
[github-action-benchmark]: https://github.com/benchmark-action/github-action-benchmark
[Markdown output]: https://www.docsy.dev/docs/content/agent-support/#markdown-output
[Page flags in included content]: https://www.docsy.dev/docs/content/plugins/#page-flags-in-included-content
[Plugin files]: https://www.docsy.dev/docs/content/plugins/#plugin-files
[Security]: https://www.docsy.dev/docs/content/plugins/#security
[source types]: https://github.com/benchmark-action/github-action-benchmark/blob/master/src/extract.ts
[stock renderer]: https://github.com/benchmark-action/github-action-benchmark/blob/master/src/default_index_html.ts
[store]: https://gohugo.io/methods/page/store/
<!-- prettier-ignore-end -->
