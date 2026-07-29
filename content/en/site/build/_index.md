---
title: Build
description: >-
  CI/CD workflows, how to build this site, and how to perform various site
  maintenance activities
weight: 40
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

<!-- prettier-ignore-start -->
[Chrome build modes]: https://github.com/google/docsy/blob/main/docsy.dev/content/en/docs/deployment/chrome.md
<!-- prettier-ignore-end -->
