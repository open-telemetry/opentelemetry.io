---
title: Build
description: >-
  CI/CD workflows, how to build this site, and how to perform various site
  maintenance activities
weight: 40
cSpell:ignore: otelwebtelemetry
---

This section documents the CI/CD workflows, NPM scripts, and helper scripts that
power the OpenTelemetry website's build, deployment, and maintenance processes.

## Build kinds: full and lean {#build-kinds}

In addition to **full** (regular) Hugo website builds, Docsy supports **lean
builds** that, among other things, allow for much faster link checking while
still maintaining full check coverage. For details, see [Chrome build modes][]
in the Docsy docs.

Some build npm scripts always build the same kind of site (full or lean). Others
use the value of the `BUILD_KIND` environment variable and default to `lean`
when unset.

| Script                     | Build kind   | Drafts/future | Minify |
| -------------------------- | ------------ | ------------- | ------ |
| `build`                    | `BUILD_KIND` | yes           | no     |
| `build:full`               | full         | yes           | no     |
| `build:lean`               | lean         | yes           | no     |
| `build:preview`            | full         | yes           | yes    |
| `build:production`         | full         | no            | yes    |
| `log:build` (CI artifact)  | `BUILD_KIND` | yes           | no     |
| `netlify-build:preview`    | full         | yes           | yes    |
| `netlify-build:production` | full         | no            | yes    |
| Most other commands        | `BUILD_KIND` | yes           | no     |

Most checks that force a fresh build first, such as link-checking, use
`BUILD_KIND`. For details about the link checking scripts, see
[Link checking](./link-checking/).

## Website tracing

The site instruments itself with the OpenTelemetry JS SDK
([`assets/js/tracing.js`][]): page loads, user interactions, and `fetch`/XHR
calls produce spans, exported to `otelwebtelemetry.com` and to the browser
console.

Tracing is enabled only when Netlify supplies `SITE_NAME=opentelemetry`, the
official site's identity across production, deploy previews, and branch deploys.
Builds elsewhere (local, CI, a fork's own Netlify site) omit the script. This is
a simple deployment gate, not an authentication mechanism.

To exercise tracing in a local build, set the variable yourself:
`SITE_NAME=opentelemetry npm run build:preview`. Do not set it in
[`netlify.toml`][], which forks inherit.

<!-- prettier-ignore-start -->
[`assets/js/tracing.js`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/assets/js/tracing.js
[Chrome build modes]: https://github.com/docsy/docsy/blob/main/docsy.dev/content/en/docs/deployment/chrome.md
[`netlify.toml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/netlify.toml
<!-- prettier-ignore-end -->
