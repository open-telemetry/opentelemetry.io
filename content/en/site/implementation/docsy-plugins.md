---
title: Docsy plugins
description: Package and gate a site-owned script as a Docsy plugin.
---

Site-owned plugins follow Docsy's [custom-script contract][Docsy plugins], under
names with the `otel-` prefix. For the plugins in service, see
[Site scripts § Plugins](../scripts/#plugins); this page is the pattern, through
its first instance, `otel-benchmarks`.

## Shortcode-gated pattern

Docsy loads a plugin on every page unless its shim says otherwise. Where a
plugin renders into markup of its own, a shortcode owns that markup and marks
the page, so the page that shows the markup is the page that loads the script,
in every language:

- **Shortcode**, `layouts/_shortcodes/benchmarks.html`: emits the chart
  container and records the page's `benchmark_data_url` front-matter param in
  the page [store][] as `otelBenchmarks`. Links and text belong in the page's
  prose, where each language writes its own; the prose links the same param
  through `_param`. Top level and once per page (the renderer targets a fixed
  element ID): a nested or second call fails the build. Included content isn't
  marked ([Page flags in included content][]).
- **Markdown variant**, `benchmarks.md` beside it ([Markdown output
  variants][]): renders nothing, since the charts need a browser and the prose
  links the data, so the page's [Markdown output](/site/design/agent-support/)
  carries no empty container.
- **Shim**, `layouts/_partials/scripts/plugins/otel-benchmarks_docsy-shim.html`
  ([Adjust a plugin per page][]): disables the plugin on pages without the
  record.
- **Companion**, `layouts/_partials/scripts/plugins/otel-benchmarks.html`
  ([Plugin files][]): vendors Chart.js on the entry's
  [`version`][Dependency versions] pin, then loads the data file from the
  record. The data stays a live remote script so the charts update between site
  builds; the shim keeps that remote code off every other page ([Security][]).
- **Script**, `assets/js/plugins/otel-benchmarks.js`: the renderer; its header
  names what it assumes loaded.
- **Registration**, `config/_default/hugo.yaml` ([Configuration reference][]):
  one site-level entry, since the shim decides per page.
- **Tests**, `tests/public/otel-benchmarks.test.mjs`: the built pages, in both
  output formats, across converted, unconverted and fallback languages.

## Localized pages

A page's localized copies keep inlining the script until they convert. To
convert a copy, replace its markup and `<script>` tags with the shortcode line
from the English page, copy its `benchmark_data_url` param, and link the data
from the prose as the English page does: the tests accept either delivery mode
per page, never both or neither. Languages without their own copy serve the
English page and convert with it.

<!-- prettier-ignore-start -->
[Adjust a plugin per page]: https://www.docsy.dev/docs/content/plugins/#adjust-a-plugin-per-page
[Configuration reference]: https://www.docsy.dev/docs/content/plugins/#configuration-reference
[Dependency versions]: https://www.docsy.dev/docs/content/plugins/#dependency-versions
[Docsy plugins]: https://www.docsy.dev/docs/content/plugins/#add-a-custom-script
[Markdown output variants]: https://www.docsy.dev/docs/content/shortcodes/#markdown-output-variants
[Page flags in included content]: https://www.docsy.dev/docs/content/plugins/#page-flags-in-included-content
[Plugin files]: https://www.docsy.dev/docs/content/plugins/#plugin-files
[Security]: https://www.docsy.dev/docs/content/plugins/#security
[store]: https://gohugo.io/methods/page/store/
<!-- prettier-ignore-end -->
