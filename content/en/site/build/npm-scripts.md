---
title: NPM scripts
description: >-
  NPM scripts for building, serving, validating, and maintaining the
  OpenTelemetry website.
weight: 20
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

| Script             | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `build`            | Build the site (dev base URL, drafts/future included). |
| `build:preview`    | Build with minification (e.g. for Netlify preview).    |
| `build:production` | Production Hugo build with minification.               |
| `serve`            | Start Hugo dev server (default).                       |
| `serve:hugo`       | Start Hugo server with in-memory render.               |
| `serve:netlify`    | Start Netlify Dev using Hugo.                          |
| `clean`            | Run `make clean`.                                      |

## Checking

| Script                 | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `check`                | Run the most commonly needed check scripts in sequence.     |
| `check:all`            | Run all check scripts in sequence.                          |
| `check:format`         | Prettier and prose-wrap checks.                             |
| `check:i18n`           | Validate localization front matter (`default_lang_commit`). |
| `check:links`          | Run HTML link checker.                                      |
| `check:links:internal` | Link check without extra HTMLTest args.                     |
| `check:markdown`       | Markdown lint (content and projects).                       |
| `check:markdown:specs` | Markdown lint for spec fragments in `tmp/`.                 |
| `check:registry`       | Validate registry YAML under `data/registry/`.              |
| `check:spelling`       | cspell over content, data, and layout Markdown.             |
| `check:text`           | textlint over content and data.                             |
| `check:filenames`      | Ensure no underscores in asset/content/static filenames.    |
| `check:expired`        | List expired content (by front matter).                     |
| `check:collector-sync` | Run collector-sync checks.                                  |

## Fixing

| Script                    | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| `fix`                     | Run the most commonly needed fix scripts.                      |
| `fix:all`                 | Run all fix scripts.                                           |
| `fix:format`              | Apply Prettier and trim trailing spaces.                       |
| `fix:format:staged`       | Format only staged files.                                      |
| `fix:i18n`                | Add/fix i18n front matter (`fix:i18n:new`, `fix:i18n:status`). |
| `fix:markdown`            | Fix Markdown lint issues and trailing spaces.                  |
| `fix:refcache`            | Prune refcache and re-run link check (updates refcache).       |
| `fix:refcache:refresh`    | Prune refcache by count.                                       |
| `fix:submodule`           | Pin submodule revisions (same as `pin:submodule`).             |
| `fix:filenames`           | Rename files with underscores to kebab-case.                   |
| `fix:dict`                | Sort cspell word lists and normalize front matter.             |
| `fix:expired`             | Delete files reported by `check:expired`.                      |
| `fix:text`                | Run textlint with --fix.                                       |
| `fix:collector-sync:lint` | Run ruff with --fix in collector-sync.                         |
| `format`                  | Alias for Prettier write (content and nowrap paths).           |

## Submodules and content

| Script             | Description                                        |
| ------------------ | -------------------------------------------------- |
| `get:submodule`    | Init/update git submodules (set `GET=no` to skip). |
| `update:submodule` | Update submodules to latest remote and fetch tags. |
| `pin:submodule`    | Pin submodule revisions (optional `PIN_SKIP`).     |
| `cp:spec`          | Copy spec content (content-modules).               |
| `schemas:update`   | Update OpenTelemetry spec submodule and content.   |
| `code-excerpts`    | Rebuild code excerpts and update docs.             |

## Test and CI

| Script                     | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `test`                     | Run the most commonly needed tests.                               |
| `test:base`                | Base tests.                                                       |
| `test:all`                 | Run all tests: base checks plus collector-sync tests and lint.    |
| `test:collector-sync`      | Collector-sync tests.                                             |
| `test-and-fix`             | Run fix scripts (excluding i18n/refcache/submodule), then checks. |
| `diff:check`               | Warn if working tree has uncommitted changes.                     |
| `diff:fail`                | Fail if working tree has changes (e.g. after build).              |
| `netlify-build:preview`    | `build:preview` then `diff:check`.                                |
| `netlify-build:production` | `build:production` then `diff:check`.                             |

## Utilities

| Script                                             | Description                                                                                          |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `seq`                                              | Run given script names in sequence; exit on first failure.                                           |
| `all`                                              | Run given script names in sequence; run all even if some fail, then exit with failure if any failed. |
| `prepare`                                          | Install step: `get:submodule`, then Docsy theme npm install.                                         |
| `prebuild`                                         | Before build: `get:submodule`, `cp:spec`.                                                            |
| `update:hugo`                                      | Install latest hugo-extended.                                                                        |
| `update:packages`                                  | Run npm-check-updates to bump deps.                                                                  |
| `fix:htmltest-config`                              | Generate/update HTMLTest config (used by link-check pipeline).                                       |
| `log:build`, `log:check:links`, `log:test-and-fix` | Run the corresponding script and tee output to `tmp/`.                                               |

## Notes

- **`check:links`** updates the refcache as a side effect. The test-and-fix flow
  uses the internal fix list that excludes refcache so the check step can
  refresh it.
- **`all`** runs every listed script even when one fails, then exits with a
  non-zero status if any failed.
