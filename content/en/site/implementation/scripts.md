---
title: Site scripts
description: >-
  Where the site's own JavaScript loads, how a script is gated to a page, and
  what Hugo pagination and Docsy's sidebar hydration mean for one that acts on
  the sidebar
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

## Body-end scripts

| Script                         | Pages                                          | Purpose                                                                                                            |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `blog-sidebar-entry-opener.js` | Blog index and pager pages (acts on the first) | Opens the two newest year groups in the sidebar                                                                    |
| `imageZoom.js`                 | All                                            | Click-to-zoom for content images                                                                                   |
| `navScroll.js`                 | All                                            | Meant to scroll the sidebar's active entry into view; inert today, since the active state is applied after it runs |
| `tracing.js`                   | Netlify builds, when unpaused                  | [Website telemetry](../../features/#website-telemetry), paused                                                     |

## Blog sidebar entry opener

`blog-sidebar-entry-opener.js` is the one body-end script gated to a page and
the one that acts on the sidebar. What it relies on holds for any script of
either kind.

### Gating to the blog index

The body-end hook renders on every page, so the opener is gated there on the
page's `.Path`, which is the same in every locale: `{{ if eq .Path "/blog" }}`.

A `.Path` gate can't single out the first page of a paginated list. Hugo renders
a list's pager pages from the one section page, so `.Path`, `.RelPermalink` and
`.Pages` are identical on `/blog/` and `/blog/page/2/`, and the current slice is
reachable only through `.Paginator`. Calling `.Paginator` on a list page that
Docsy's template leaves unpaginated, such as an empty blog, paginates it and
publishes a `page/1/` alias. The opener therefore loads on every pager page and
skips them at runtime, by testing `location.pathname` for `/page/`.

### Acting on the sidebar

The site uses Docsy's cached sidebar (`ui.sidebar_cache_limit: 1`): one nav per
sidebar root, shipped hidden (`d-none`) with no active state. Docsy's
`chrome-nav.js` hydrates it at `DOMContentLoaded`: it applies the active state
and reveals the nav. A body-end script runs during parsing, before that, so it
can set sidebar state before the sidebar appears; the opener checks its two year
groups then. With JavaScript disabled, the sidebar stays hidden.
