---
title: Site scripts
description: >-
  Where the site's own JavaScript loads, how a script is gated to a page, and
  what Hugo pagination and Docsy's sidebar hydration mean for one that acts on
  the sidebar
cSpell:ignore: subresource
---

The site adds a few scripts of its own to Docsy's, under `assets/js/`. Three
kinds of template load them:

- **Hooks**: the body-end hook, `layouts/_partials/hooks/body-end.html`, for
  scripts that run on every page or on a gated subset of them; the head-end
  hook, for the Kapa widget's pre-initialization.
- **Shortcodes**, for scripts a feature needs on the pages that use it, for
  example the registry search form and the config-types accordion.
- **Docsy's plugin loader**, for the scripts under `assets/js/plugins/`
  ([Docsy plugins](../docsy-plugins/)).

Hooks and shortcodes load a script through the `script.html` partial: Hugo's
`js.Build` bundles each file, and production builds also minify and fingerprint
it and emit a subresource-integrity hash.

## Body-end scripts

| Script                         | Pages                                          | Purpose                                                                                                            |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `blog-sidebar-entry-opener.js` | Blog index and pager pages (acts on the first) | Opens the two newest year groups in the sidebar                                                                    |
| `imageZoom.js`                 | All                                            | Click-to-zoom for content images                                                                                   |
| `navScroll.js`                 | All                                            | Meant to scroll the sidebar's active entry into view; inert today, since the active state is applied after it runs |
| `tracing.js`                   | Netlify builds, when unpaused                  | [Website telemetry](../../features/#website-telemetry), paused                                                     |

## Plugins

| Script               | Pages                                 | Purpose                                                 |
| -------------------- | ------------------------------------- | ------------------------------------------------------- |
| `otel-benchmarks.js` | Pages with the `benchmarks` shortcode | Renders a repository's benchmark history as line charts |

## Benchmarks

`otel-benchmarks.js` is a fork of the renderer that [github-action-benchmark][]
publishes with a repository's benchmark history (a `data.js` on its `gh-pages`
branch); the action documents the data's shape nowhere else, so that [stock
renderer][] is the reference for it. The fork adds the Collector testbed's
grouping and filtering of benches. How the page, shortcode and plugin fit
together: [Docsy plugins](../docsy-plugins/). The language pages for JavaScript
and Python still carry the stock renderer inline.

## Blog sidebar entry opener

`blog-sidebar-entry-opener.js` is the one body-end script gated to a page and
the one that acts on the sidebar.

### Gating to the blog index

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

### Acting on the sidebar

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

[github-action-benchmark]:
  https://github.com/benchmark-action/github-action-benchmark
[stock renderer]:
  https://github.com/benchmark-action/github-action-benchmark/blob/master/src/default_index_html.ts
