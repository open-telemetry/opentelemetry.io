---
title: Docsy plugins
description: Site-owned scripts that load through Docsy's plugin registry
cSpell:ignore: subresource
---

The site ships some of its own scripts as [Docsy plugins][]. Docsy emits each
enabled plugin once, at the end of the page body, from a fingerprinted file with
subresource integrity.

| Plugin                    | Effect                                                             | Loads on   | Languages |
| ------------------------- | ------------------------------------------------------------------ | ---------- | --------- |
| `otel-blog-sidebar-years` | Opens the blog sidebar's groups for the current and previous years | Blog index | `en`      |

## Plugin files

Prefix site plugin names with `otel-`: Docsy matches plugin files by name, and a
site file shadows the theme's, so the prefix keeps a future Docsy plugin from
colliding with ours.

For a plugin named _`NAME`_:

- **Script**: `assets/js/plugins/`_`NAME`_`.js`.
- **Page gating**: a shim,
  `layouts/_partials/scripts/plugins/`_`NAME`_`_docsy-shim.html`, returns the
  plugin entry with `enable: false` on pages that don't need the plugin.
- **Registration**: `params.docsy.plugins.`_`NAME`_ in
  `config/_default/hugo.yaml`; under a language's `params`, the plugin loads for
  that language only.
- **Tests**: check the built pages, as
  `tests/public/otel-blog-sidebar-years.test.mjs` does.

For the file contract, see Docsy's [Add a custom script][Docsy plugins]. Docsy
marks plugin authoring as experimental.

## Localized pages

The `ja` and `ko` blog indexes still inline the year-group script in their
`blog/_index.md`. To move a locale to the plugin, register the plugin under that
language's `params` and remove the inline script, in the same PR: the build
tests fail when a blog index runs the script twice, or not at all.

[Docsy plugins]: https://www.docsy.dev/docs/content/plugins/#add-a-custom-script
