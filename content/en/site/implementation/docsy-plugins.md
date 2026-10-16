---
title: Docsy plugins
description: Ship a site-owned script as a Docsy plugin instead of inlining it
cSpell:ignore: subresource
---

The site ships some of its own scripts as [Docsy plugins][]: a script file that
Docsy builds, fingerprints, and emits once at the end of the page body with
[subresource integrity][SRI], gated to the pages that use it. Inlining the same
`<script>` in every locale's copy of a page is the pattern this replaces.

| Plugin                      | Effect                                                         | Loads on                      | Languages |
| --------------------------- | -------------------------------------------------------------- | ----------------------------- | --------- |
| `otel-collector-benchmarks` | Renders the Collector load-test charts (Chart.js, remote data) | `/docs/collector/benchmarks/` | `en`      |

## Plugin files

For a plugin named _`NAME`_, where _`NAME`_ carries the `otel-` prefix:

- **Script**: `assets/js/plugins/`_`NAME`_`.js`, the plugin's code. Docsy builds
  it with `js.Build` and emits it synchronously, after the page's markup.
- **Companion**: `layouts/_partials/scripts/plugins/`_`NAME`_`.html`, emitted
  before the script, for the plugin's dependencies. Vendor a third-party library
  at build time from the entry's `version` pin and serve it with SRI, as the
  `otel-collector-benchmarks` companion does with Chart.js; emit data that
  changes between builds as a remote script.
- **Shim**: `layouts/_partials/scripts/plugins/`_`NAME`_`_docsy-shim.html`,
  returns the plugin entry with `enable: false` on pages that don't need the
  plugin. Gate on `.Page.Path`, the page's logical path, which is the same in
  every language.
- **Registration**: `params.docsy.plugins.`_`NAME`_ in
  `config/_default/hugo.yaml`, with `enable` and the dependency `version`. Under
  a language's `params`, the plugin loads for that language only.
- **Tests**: a `tests/public/`_`NAME`_`.test.mjs` file checks the built pages:
  the plugin loads once where it should, with SRI, and nowhere else; see
  `otel-collector-benchmarks.test.mjs`.

For the file contract, see Docsy's [Add a custom script][Docsy plugins]. Docsy
marks plugin authoring as experimental.

## Localized pages

A page's localized copies still inline the script until their language converts.
To convert a language, register the plugin under that language's `params` and
remove the inline `<script>` tags from its copy of the page, in the same PR: the
plugin's tests fail when a page carries both or neither.

[Docsy plugins]: https://www.docsy.dev/docs/content/plugins/#add-a-custom-script
[SRI]: https://developer.mozilla.org/docs/Web/Security/Subresource_Integrity
