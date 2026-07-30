---
title: NPM scripts
description: >-
  NPM scripts for building, serving, validating, and maintaining the
  OpenTelemetry website.
weight: 20
todo: Keep table entries sorted
---

Script definitions live in the repository root
[`package.json`](https://github.com/open-telemetry/opentelemetry.io/blob/main/package.json).
Run any script with `npm run <script-name>`. Scripts whose names start with `_`
are internal helpers and are not intended to be run directly.

> [!NOTE] Default vs `:all` script variants
>
> The **`check`**, **`fix`**, and **`test`** scripts run the most commonly
> needed subscripts for each action. To run every subscript, use the **`*:all`**
> variants:
>
> - `check:all`
> - `fix:all`
> - `test:all`

## Build and serve

| Script             | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| `build:full`       | Build the full site. For details, see [Build kinds][].         |
| `build:lean`       | Do a lean build of the site. For details, see [Build kinds][]. |
| `build:preview`    | Full build with minification (e.g. for Netlify preview).       |
| `build:production` | Production Hugo build with minification.                       |
| `build`            | Build the site. Defaults to lean; see [Build kinds][].         |
| `clean`            | Run `make clean`.                                              |
| `serve:hugo`       | Start Hugo server with in-memory render.                       |
| `serve:netlify`    | Start Netlify Dev using Hugo.                                  |
| `serve`            | Start Hugo dev server (default; full render).                  |

## Checking

| Script                 | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `check:all`            | Run all check scripts in sequence.                          |
| `check:code-excerpts`  | Check code excerpts, fail if updates needed.                |
| `check:codeowners`     | Verify CODEOWNERS locale section matches the registry.      |
| `check:collector-sync` | Run collector-sync checks.                                  |
| `check:expired`        | List expired content (by front matter).                     |
| `check:filenames`      | [Validate file naming & detect obsolete files/folders][fn]. |
| `check:format`         | Prettier and prose-wrap checks.                             |
| `check:i18n`           | Validate localization front matter (`default_lang_commit`). |
| `check:l10n`           | Run localization checks.                                    |
| `check:links:diff`     | Lychee link check of changed files only.                    |
| `check:links:internal` | Offline link check (internal links only); lean build first. |
| `check:links`          | Link check the whole site with Lychee; lean build first.    |
| `check:markdown:specs` | Markdown lint for spec fragments in `tmp/`.                 |
| `check:markdown`       | Markdown lint (content and projects).                       |
| `check:registry`       | Validate registry YAML under `data/registry/`.              |
| `check:spelling`       | cspell over content, data, and layout Markdown.             |
| `check:text`           | textlint over content and data.                             |
| `check`                | Run the most commonly needed check scripts in sequence.     |

## Fixing

| Script                    | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| `fix`                     | Run the most commonly needed fix scripts.                      |
| `fix:code-excerpts`       | Refresh code excerpts.                                         |
| `fix:codeowners`          | Regenerate CODEOWNERS locale section from the registry.        |
| `fix:all`                 | Run all fix scripts.                                           |
| `fix:format`              | Apply Prettier and trim trailing spaces.                       |
| `fix:format:staged`       | Format only staged files.                                      |
| `fix:i18n`                | Add/fix i18n front matter (`fix:i18n:new`, `fix:i18n:status`). |
| `fix:l10n`                | Apply localization fixes.                                      |
| `fix:link-cache`          | Check links, updating the committed `.lycheecache`.            |
| `fix:link-cache:refresh`  | Prune the oldest cache entries, then `fix:link-cache`.         |
| `fix:markdown`            | Fix Markdown lint issues and trailing spaces.                  |
| `fix:submodule`           | Pin submodule revisions (same as `pin:submodule`).             |
| `fix:filenames`           | [Rename files & remove obsolete files/folders][fn].            |
| `fix:dict`                | Sort cspell word lists and normalize front matter.             |
| `fix:expired`             | Delete files reported by `check:expired`.                      |
| `fix:text`                | Run textlint with --fix.                                       |
| `fix:collector-sync:lint` | Run ruff with --fix in collector-sync.                         |
| `format`                  | Alias for Prettier write (content and nowrap paths).           |

## Submodules and content

| Script             | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| `code-excerpts`    | Refresh code excerpts. DEPRECATED: use `fix:code-excerpts` or `check:code-excerpts`. |
| `cp:spec`          | Copy spec content (content-modules).                                                 |
| `get:submodule`    | Init/update git submodules (set `GET=no` to skip).                                   |
| `pin:submodule`    | Pin submodule revisions (optional `PIN_SKIP`).                                       |
| `schemas:update`   | Update OpenTelemetry spec submodule and content.                                     |
| `update:submodule` | Update submodules to latest remote and fetch tags.                                   |

## Test and CI

| Script                     | Description                                                         |
| -------------------------- | ------------------------------------------------------------------- |
| `diff:check`               | Warn if working tree has uncommitted changes.                       |
| `diff:fail`                | Fail if working tree has changes (e.g. after build).                |
| `fix-and-test:all`         | All fixes (incl. i18n), then checks; links checked once.[^fat]      |
| `netlify-build:preview`    | `build:preview` then `diff:check`.                                  |
| `netlify-build:production` | `build:production` then `diff:check`.                               |
| `test-and-fix`             | Run fix scripts (excluding i18n/link-cache/submodule), then checks. |
| `test:all`                 | Runs `test:base` then `test:compound-tests`.                        |
| `test:base`                | Base tests (same as `check`).                                       |
| `test:collector-sync`      | Collector-sync tests.                                               |
| `test:compound-tests`      | Runs compound `test:*-*` scripts.[^categories]                      |
| `test:edge-functions:live` | Optional `node:test` live suite; supports `--help`.                 |
| `test:edge-functions`      | Node test runner over `netlify/edge-functions/**/*.test.ts`.        |
| `test:local-tools`         | Node test runner for `scripts/**/*.test.mjs`.[^categories]          |
| `test:local-tools:lychee`  | Lychee-binary slice of `test:local-tools` (see Notes).              |
| `test:public`              | Runs the `tests/public/` checks over the built site.[^categories]   |
| `test`                     | Run the most commonly needed tests.                                 |

[^categories]:
    These scripts follow the test-script naming conventions; see
    [Test categories](../../testing/#test-categories).

[^fat]:
    The housekeeping default: runs `fix:link-cache` (link check, refreshing the
    link cache) after the content fixes; uses the keep-going `all` runner so
    every fix is captured. The check phase excludes `check:links`
    (`fix:link-cache` covers it) and `check:i18n` (redundant after `fix:i18n`
    records drift status). See [Housekeeping](../ci-workflows/#housekeeping).

## Utilities

| Script                         | Description                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `seq`                          | Run given script names in sequence; exit on first failure.                      |
| `all`                          | Run all given scripts, then exit with failure if any failed.                    |
| `locale-auto-merge`            | [Locale auto-merge helper CLI][locale-auto-merge] (`--help`).                   |
| `prepare`                      | Install step: `get:submodule`, then Docsy theme `postinstall`.                  |
| `prebuild:*`                   | Pre-`build*` hooks; each runs `_prebuild`.                                      |
| `update:hugo`                  | Install latest hugo-extended.                                                   |
| `update:packages`              | Run npm-check-updates to bump deps.                                             |
| `generate:config:links`        | Generate git-ignored `lychee.toml` from `lychee.base.toml` + page front matter. |
| `log:build`, `log:check:links` | Run the corresponding script and tee output to `tmp/`.                          |

## Notes

- **Link cache.** The link-check scripts read and update the committed
  `.lycheecache`. For details, see [Link checking](../link-checking/).
- **`test:local-tools:lychee`** is the subset of `test:local-tools` that needs
  the `lychee` binary (behavioral fragment- and config-checking tests). Those
  tests skip when the binary is absent, so `test:local-tools` already covers
  them in the general test job; the trailing `:lychee` keeps this script out of
  `test:compound-tests` (which matches `test:*-*`) so the suite isn't run twice.
  The link-check CI job installs lychee and runs this script to exercise them
  for real.
- **`all`** runs every listed script even when one fails, then exits with a
  non-zero status if any failed.

[build kinds]: ../#build-kinds
[fn]: /docs/contributing/pr-checks/#filename-check
[locale-auto-merge]: ../ci-workflows/#locale-auto-merge
