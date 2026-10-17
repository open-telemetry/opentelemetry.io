---
title: Docsy plugins
description: Ship a site-owned script as a Docsy plugin instead of inlining it
cSpell:ignore: subresource
---

The site ships some of its own scripts as [Docsy plugins][]: a script file that
Docsy builds, fingerprints, and emits once at the end of the page body with
[subresource integrity][SRI], gated to the pages that use it. Inlining the same
`<script>` in every locale's copy of a page is the pattern this replaces.

| Plugin            | Effect                                                                       | Loads on                              |
| ----------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| `otel-benchmarks` | Renders a repository's [benchmark history](../scripts/#benchmarks) as charts | Pages with the `benchmarks` shortcode |

## Plugin files

For a plugin named _`NAME`_, where _`NAME`_ carries the `otel-` prefix:

- **Script**: `assets/js/plugins/`_`NAME`_`.js`, the plugin's code. Docsy builds
  it with `js.Build` and emits it synchronously, after the page's markup.
- **Companion**: `layouts/_partials/scripts/plugins/`_`NAME`_`.html`, emitted
  before the script, for the plugin's dependencies. Vendor a third-party library
  at build time from the entry's `version` pin and serve it with SRI, as the
  `otel-benchmarks` companion does with Chart.js. Data that changes between
  builds, such as a benchmark `data.js`, stays a remote script: it can't be
  vendored or carry SRI, and it executes as JavaScript, so load it only where
  the page needs it.
- **Shim**: `layouts/_partials/scripts/plugins/`_`NAME`_`_docsy-shim.html`,
  returns the plugin entry with `enable: false` on pages that don't need the
  plugin. The `otel-benchmarks` shim gates on a page record that the
  `benchmarks` shortcode sets with `.Page.Store`, so the page that renders the
  markup is the page that loads the script, in every language.
- **Shortcode**: when the plugin renders into markup of its own, a shortcode
  under `layouts/_shortcodes/` owns that markup and the page record.
  `{{</* benchmarks */>}}` emits the chart container, nothing more: links and
  text belong in the page's prose, where each language writes its own. The data
  file's URL has one home, the page's `benchmark_data_url` front-matter param:
  the shortcode reads it, and the prose links it through `_param`. A page holds
  one such shortcode, since the renderer targets a fixed element ID, and a
  second one fails the build. A Markdown variant, `benchmarks.md` beside the
  HTML template, serves the page's
  [Markdown output](/site/design/agent-support/): the HTML filtered to what
  survives without a browser, which for charts is nothing, rather than the empty
  chart markup Hugo would emit from the HTML template.
- **Registration**: `params.docsy.plugins.`_`NAME`_ in
  `config/_default/hugo.yaml`, with `enable` and the dependency `version`. The
  shim decides per page, so one site-level entry serves every language.
- **Tests**: a `tests/public/`_`NAME`_`.test.mjs` file checks the built pages:
  the plugin loads once where it should, with SRI, and nowhere else; see
  `otel-benchmarks.test.mjs`.

For the file contract, see Docsy's [Add a custom script][Docsy plugins]. Docsy
marks plugin authoring as experimental. A page that pulls the shortcode in
through included content doesn't get the plugin: the record lands on the page
whose file holds the shortcode ([Page flags in included content][]).

## Localized pages

A page's localized copies keep inlining the script until they convert. To
convert a copy, replace its markup and `<script>` tags with the shortcode line
from the English page, copy its `benchmark_data_url` param, and link the data
from the prose as the English page does: the plugin tests accept either delivery
mode per page, never both or neither. Languages without their own copy serve the
English page and convert with it.

[Docsy plugins]: https://www.docsy.dev/docs/content/plugins/#add-a-custom-script
[Page flags in included content]:
  https://www.docsy.dev/docs/content/plugins/#page-flags-in-included-content
[SRI]: https://developer.mozilla.org/docs/Web/Security/Subresource_Integrity
