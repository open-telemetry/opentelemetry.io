---
title: Plugins and scripts
description: >-
  Where the site's own JavaScript loads, how a script is gated to a page, and
  what each gated script relies on
aliases: [scripts]
cSpell:ignore: subresource
---

The site adds a few scripts of its own to Docsy's, under `assets/js/`, loaded
three ways:

- [Plugins](#plugins), through Docsy's loader
- [Body-end scripts](#body-end-scripts), through the body-end hook
- Shortcode scripts, by the shortcode of the feature that needs them: the
  registry search form, the config-types accordion

Hooks and shortcodes load a script through the `script.html` partial: Hugo's
`js.Build` bundles each file, and production builds also minify, fingerprint and
add subresource integrity.

## Plugins

Site plugins follow Docsy's [custom-script contract][Docsy plugins] under the
`otel-` prefix. One that renders markup of its own is gated by a shortcode that
owns the markup and marks the page; the shim reads the mark.

### Benchmarks plugin {#benchmarks}

`otel-benchmarks.js` is a fork of the renderer that [github-action-benchmark][]
publishes with a repository's benchmark history (a `data.js` on its `gh-pages`
branch); the action documents the data's shape nowhere else, so that [stock
renderer][] is the reference for it. The fork adds the Collector testbed's
grouping and filtering of benches. The language pages for JavaScript and Python
still carry the stock renderer inline. The plugin's parts:

- **Shortcode**, `layouts/_shortcodes/benchmarks.html`: emits the chart
  container and records the page's `benchmark_data_url` front-matter param in
  the page [store][] as `otelBenchmarks`. Links and text belong in the page's
  prose, where each language writes its own; the prose links the same param
  through `_param`. Top level and once per page (the renderer targets a fixed
  element ID): a nested or second call fails the build. Included content isn't
  marked ([Page flags in included content][]).
- **Markdown variant**, `benchmarks.md` beside it: empty by design. Nothing the
  charts show is worth more to an agent than the data file the page links to,
  and without a variant the HTML template's markup would land in the page's
  [Markdown output][], which the site serves per
  [Agent support](../../design/agent-support/).
- **Shim**, `layouts/_partials/scripts/plugins/otel-benchmarks_docsy-shim.html`
  ([Adjust a plugin per page][]): disables the plugin on pages without the
  record.
- **Companion**, `layouts/_partials/scripts/plugins/otel-benchmarks.html`
  ([Plugin files][]): vendors Chart.js on the entry's
  [`version`][Dependency versions] pin, then loads the data file from the
  record. The data stays a live remote script so the charts update between site
  builds, which a fixed integrity hash would forbid; the shim keeps that remote
  code off every other page ([Security][]).
- **Script**, `assets/js/plugins/otel-benchmarks.js`: the renderer; its header
  names what it assumes loaded.
- **Registration**, `config/_default/hugo.yaml` ([Configuration reference][]):
  one site-level entry, since the shim decides per page.
- **Tests**, `tests/public/otel-benchmarks.test.mjs`: the built pages, in both
  output formats, across converted, unconverted and fallback languages.

#### Localized pages

A page's localized copies keep inlining the script until they convert. To
convert a copy, replace its markup and `<script>` tags with the shortcode line
from the English page, copy its `benchmark_data_url` param, and link the data
from the prose as the English page does: the tests accept either delivery mode
per page, never both or neither. Languages without their own copy serve the
English page and convert with it.

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
[Adjust a plugin per page]: https://www.docsy.dev/docs/content/plugins/#adjust-a-plugin-per-page
[Configuration reference]: https://www.docsy.dev/docs/content/plugins/#configuration-reference
[Dependency versions]: https://www.docsy.dev/docs/content/plugins/#dependency-versions
[Docsy plugins]: https://www.docsy.dev/docs/content/plugins/#add-a-custom-script
[github-action-benchmark]: https://github.com/benchmark-action/github-action-benchmark
[Markdown output]: https://www.docsy.dev/docs/content/agent-support/#markdown-output
[Page flags in included content]: https://www.docsy.dev/docs/content/plugins/#page-flags-in-included-content
[Plugin files]: https://www.docsy.dev/docs/content/plugins/#plugin-files
[Security]: https://www.docsy.dev/docs/content/plugins/#security
[stock renderer]: https://github.com/benchmark-action/github-action-benchmark/blob/master/src/default_index_html.ts
[store]: https://gohugo.io/methods/page/store/
<!-- prettier-ignore-end -->
