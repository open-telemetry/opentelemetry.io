---
title: Link checking
weight: 12
description: How the site's links are checked, locally and in CI.
---

The site is link-checked with **[Lychee][]**, backed by a committed cache of
external-link results (see [Link cache](#refcache)).

> [!NB] Installing Lychee locally is optional: CI link-checks every PR, and the
> bot can update the [link cache](#refcache) for you. To run checks locally,
> [install Lychee][lychee-install]; CI installs its own pinned copy (see the
> `.github/actions/install-lychee` action), so keep your local version
> reasonably close to it.

## Check links

To check links locally, run:

```sh
npm run check:links
```

## Common commands

| Command                | Checking scope                                                        |
| ---------------------- | --------------------------------------------------------------------- |
| `check:links`          | Whole site                                                            |
| `check:links:internal` | Whole site, offline (no external links)                               |
| `check:links:diff`     | Changed files only                                                    |
| `fix:link-cache`       | Alias of `check:links`; use it to refresh the [link cache](#refcache) |

The `check:links` and `check:links:internal` scripts run over a build of
`BUILD_KIND`; `check:links:diff` checks files from the existing `public/` build.
For details, see [Build kinds: full and lean][].

[Build kinds: full and lean]: ../#build-kinds

## Configuration

Lychee runs over the built site (`public/`) using the generated, git-ignored
`lychee.toml`. The `generate:config:links` script derives it from
[`lychee.base.toml`][] plus an `exclude_path` block computed from page front
matter, which has two sources:

- **`link_check_exclude_path`** — a list of site-relative path regexes for pages
  the link checker must skip, such as blog pagination and old blog posts; see
  [`content/en/blog/_index.md`][blog-index]. Start a pattern with `^(../)?` to
  have it cover every locale: the optional `../` matches a two-letter locale
  path segment such as `ja/`.
- **`drifted_from_default: true`** — [drifted localized pages][drifted]. Links
  _from_ a drifted page aren't checked, since they may be stale, but the page
  remains a valid link target: inbound links from in-sync pages, including
  fragments, are still validated.

## Link cache {#refcache}

External-link check results are cached in `.lycheecache`, which is under version
control so that checks only fetch URLs that are new or whose cache entries have
expired. Lychee caches successful results only, so failures are retried on every
run.

If you add or change external links, run `npm run check:links` **before
submitting your PR** — it's quick since all other links are cached — and commit
the updated `.lycheecache` along with your content changes. Otherwise the
`CHECK LINKS and CACHE` job will fail on a stale cache; if that happens, run the
command and push, or comment `/fix:link-cache` on your PR to have the bot do it.
For details, see [`BUILD` and `CHECK LINKS and CACHE`][pr-checks].

## Cache refresh and housekeeping workflows {#workflows}

The following workflows are scheduled daily and run a link checking command over
a **full** build:

| Workflow                          | Link-check command               |
| --------------------------------- | -------------------------------- |
| Refcache refresh                  | `fix:link-cache` (after pruning) |
| Housekeeping (`fix-and-test:all`) | `fix:link-cache`                 |

Refcache refresh prunes the oldest cache entries (the count is a workflow input)
and re-runs the link check, which refreshes the cache entries for the pruned
URLs that are still used in the site.

The [housekeeping workflow][housekeeping] runs `fix-and-test:all`, which calls
`fix:link-cache` and deliberately skips `check:links` so links are checked
exactly once.

## In CI

The [`check-links.yml` workflow][ci] builds the site once (lean) and shares that
artifact with the `CHECK LINKS and CACHE` job, so local runs and CI check the
same build. The job fails if any link check fails, or if the run leaves the
committed `.lycheecache` stale.

[blog-index]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/blog/_index.md
[ci]: ../ci-workflows/
[drifted]: /docs/contributing/localization/#track-changes
[housekeeping]: ../ci-workflows/#housekeeping
[Lychee]: https://lychee.cli.rs/
[`lychee.base.toml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/lychee.base.toml
[lychee-install]: https://lychee.cli.rs/guides/getting-started/
[pr-checks]: /docs/contributing/pr-checks/#build-and-check-links
