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

The `benchmarks` shortcode charts a repository's benchmark history, the
`data.js` that [github-action-benchmark][] publishes on GitHub Pages (its shape:
the action's [source types][]). The call names the data; three optional
arguments say how to read it. With `data_url` alone, each benchmark gets a chart
of its own, drawn on the commits it has data for (benchmark names must be unique
within a commit):

```markdown
{{</* benchmarks data_url="param:otel-benchmarks.data_url" */>}}
```

With `group_separator`, each chart carries several benchmarks as series, which
is how the Collector page reads its data:

```markdown
{{</* benchmarks data_url="param:otel-benchmarks.data_url" filter="10kDPS,10kSPS" group_separator="/" series_separator=" - " */>}}
```

A grouped call's charts share the data set's commit axis, so their series line
up, and get a legend and a series name in the tooltip; an ungrouped call's
charts have neither, the title naming the one series.

- `data_url`: the action's `data.js`, as `https://…` or as `param:`_`NAME`_, a
  page param holding it, so that the page's prose can link the same URL through
  `_param`
- `filter` (optional): keep a bench whose `extra` contains any of the
  comma-separated strings
- `group_separator` (optional): split `extra` into a group, joined to the bench
  name as the chart's title, and a series name; an `extra` without the separator
  is both
  - `series_separator` (optional): trim the series name at its first occurrence;
    without `group_separator` there is no series name, and the argument does
    nothing

The arguments' contract, validation included, is the shortcode's doc comment.
Links and text belong in the page's prose, where each language writes its own;
the data link is also an agent's path to the numbers, since the shortcode's
Markdown output is empty.

The `otel-benchmarks` plugin behind the shortcode is a fork of the action's
[stock renderer][]. Its parts:

- **Shortcode**, `layouts/_shortcodes/benchmarks.html`: emits the chart
  container and records the data URL for the shim and companion; each call
  renders a chart set where it stands.
- **Markdown variant**, `benchmarks.md` beside it: empty, so the chart markup
  stays out of the page's [Markdown output][]
  ([Agent support](../../design/agent-support/)).
- **Shim**, `layouts/_partials/scripts/plugins/otel-benchmarks_docsy-shim.html`
  ([Adjust a plugin per page][]): disables the plugin on pages without a call,
  which keeps the remote data script off every other page ([Security][]).
- **Companion**, `layouts/_partials/scripts/plugins/otel-benchmarks.html`
  ([Plugin files][]): vendors Chart.js on the entry's
  [`version`][Dependency versions] pin, then loads the data file. The data stays
  a live remote script so the charts update between site builds, which a fixed
  integrity hash would forbid.
- **Script**, `assets/js/plugins/otel-benchmarks/` ([Plugin files][]): the
  renderer, `index.js`, and its helpers for the legend, the point's value line
  and commit, and the click popover.
- **Stylesheet**, `assets/scss/plugins/otel-benchmarks.scss` ([Plugin files][]):
  the charts' layout, scoped to the container. The inline copies keep the stock
  page's `static/css/benchmarks.css`, whose bare `main`, `button` and `footer`
  selectors also reach Docsy's chrome.
- **Registration**, `config/_default/hugo.yaml` ([Configuration reference][]):
  one site-level entry, since the shim decides per page.
- **Tests**, `tests/public/otel-benchmarks.test.mjs`: delivery on each page's
  built copies; its `PAGES` table is the inventory of the pages on the plugin
  and of the localized copies still inline, whose conversion [#12266][] tracks.

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
<!-- prettier-ignore-end -->
