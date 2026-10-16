---
title: Site scripts
description: >-
  Where the site's own JavaScript loads, how it is gated to pages, and what Hugo
  pagination and Docsy's sidebar hydration mean for it
cSpell:ignore: subresource
---

The site adds a few scripts of its own to Docsy's. They live under `assets/js/`
and load through the `script.html` partial: Hugo's `js.Build` bundles each file,
and production builds also minify and fingerprint it and emit a
subresource-integrity hash. Two kinds of template load them:

- **Hooks**: the body-end hook, `layouts/_partials/hooks/body-end.html`, for
  scripts that run on every page or on a gated subset of them; the head-end
  hook, for the Kapa widget's pre-initialization.
- **Shortcodes**, for scripts a feature needs on the pages that use it, for
  example the registry search form and the config-types accordion.

The rest of this page covers the body-end hook.

## Gating on pages

The hook renders on every page, so a script that applies to one page is gated on
the page's `.Path`, which is the same in every locale (`/blog` for the blog
index).

Hugo renders a paginated list's pages from the one section page: `.Path`,
`.RelPermalink` and `.Pages` are identical on `/blog/` and `/blog/page/2/`, and
the current slice is reachable only through `.Paginator`. Calling `.Paginator`
on a list page that Docsy's template leaves unpaginated, such as an empty blog,
paginates it and publishes a `page/1/` alias. A script that applies to the first
page only therefore checks `location.pathname` for `/page/` at runtime.

## Timing against the sidebar

The site uses Docsy's cached sidebar (`ui.sidebar_cache_limit: 1`): one nav per
sidebar root, shipped hidden (`d-none`) with no active state. Docsy's
`chrome-nav.js` hydrates it at `DOMContentLoaded`: it applies the active state
and reveals the nav. A plain script at body end runs during parsing, before
that, so it can set sidebar state before the sidebar appears. With JavaScript
disabled, the sidebar stays hidden.

## Body-end scripts

| Script                         | Pages                                          | Purpose                                                                                                            |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `blog-sidebar-entry-opener.js` | Blog index and pager pages (acts on the first) | Opens the two newest year groups in the sidebar                                                                    |
| `imageZoom.js`                 | All                                            | Click-to-zoom for content images                                                                                   |
| `navScroll.js`                 | All                                            | Meant to scroll the sidebar's active entry into view; inert today, since the active state is applied after it runs |
| `tracing.js`                   | Netlify builds, when unpaused                  | [Website telemetry](../../features/#website-telemetry), paused                                                     |
