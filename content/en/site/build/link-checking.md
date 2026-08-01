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
- **`drifted_from_default`** — [drifted localized pages][drifted], status `true`
  (EN counterpart changed) or `file not found` (EN counterpart deleted). Links
  _from_ such a page aren't checked, since they may be stale, but the page
  remains a valid link target: inbound links from in-sync pages, including
  fragments, are still validated.

Stored drift statuses are only as fresh as the last nightly
[Housekeeping][housekeeping] status sync (as merged, so the window can exceed a
day), so the generator also skips **drift-pending** pages: locale copies of
English pages changed (or deleted) since the **drift-status baseline**, the
main-branch commit recorded in `data/l10n-drift.yaml` by tree-wide status syncs
(`npm run fix:i18n`). A copy that itself changed since the baseline stays
checked: someone is working on it. Config generation fails when the baseline is
missing or can't be resolved; in CI, the `CHECK LINKS` job first deepens its
shallow clone to the baseline commit; locally, fetch the missing history
(`git fetch upstream main`) or override the baseline:
`DRIFT_BASELINE=HEAD npm run check:links` empties the overlay (stored-status
skips still apply).

A local tree-wide status sync (`npm run fix:i18n`) can rewrite
`data/l10n-drift.yaml`; leave that rewrite uncommitted — a locally recorded
commit might not exist upstream.

## Link cache {#refcache}

External-link check results are cached in `.lycheecache`, which is under version
control so that checks only fetch URLs that are new or whose cache entries have
expired. Lychee caches successful results only, so failures are retried on every
run.

If you add or change external links, run `npm run check:links` **before
submitting your PR** — the site build dominates the run time — and commit the
updated `.lycheecache` along with your content changes. Otherwise the
`CACHE updates committed?` check will fail; for recovery steps, see
[`CACHE updates committed?`][pr-checks].

## Cache refresh and housekeeping workflows {#workflows}

The following workflows are scheduled daily and run a link checking command over
a **full** build:

| Workflow                                          | Link-check command               |
| ------------------------------------------------- | -------------------------------- |
| Refcache refresh                                  | `fix:link-cache` (after pruning) |
| [Housekeeping][housekeeping] (`fix-and-test:all`) | `fix:link-cache`                 |

Refcache refresh prunes the oldest cache entries (the count is a workflow input)
and re-runs the link check, which refreshes the cache entries for the pruned
URLs that are still used in the site.

### Double-check of failing links {#double-check}

Some URLs are valid but block plain HTTP clients like Lychee (bot walls,
crates.io's unconditional 404s, npmjs.com signin redirects). Because Lychee
never caches failures, such URLs would otherwise fail the link check on every
run once their cache entries expire.

The **double-check** tooling ([tracking issue][#11042]) re-verifies
Lychee-reported failures through a browser-grade probe (headless Chrome via
Puppeteer, with fragment verification and per-host special cases). URLs that the
probe resolves are recorded in `.lycheecache` with the synthetic status `206`
("OK by analysis"). The Refcache refresh workflow runs it after the link check;
to run it locally over a captured log:

```sh
npm run log:check:links
npm run fix:link-cache:double-check
```

The probe requires Chrome: either set `CHROME_PATH`, or let the tooling install
a Puppeteer-managed copy. An opt-in live smoke check of the probe is available
as `npm run test:double-check:live`.

## In CI

The [`check-links.yml` workflow][ci] builds the site once (lean) and shares that
artifact with the `CHECK LINKS` job, so local runs and CI check the same build.
That job fails if any link check fails, and hands the cache it refreshed to the
`CACHE updates committed?` job, which fails if the run left the committed
`.lycheecache` stale.

[#11042]: https://github.com/open-telemetry/opentelemetry.io/issues/11042
[blog-index]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/blog/_index.md
[ci]: ../ci-workflows/
[drifted]: /docs/contributing/localization/#track-changes
[housekeeping]: ../ci-workflows/#housekeeping
[Lychee]: https://lychee.cli.rs/
[`lychee.base.toml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/lychee.base.toml
[lychee-install]: https://lychee.cli.rs/guides/getting-started/
[pr-checks]: /docs/contributing/pr-checks/#cache-updates-committed
