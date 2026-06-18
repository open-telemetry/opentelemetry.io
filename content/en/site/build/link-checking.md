---
title: Link checking
weight: 12
description: How the site's links are checked, locally and in CI.
---

The site is link-checked with two tools:

- **[htmltest][]** — the original checker tool we adopted. It is installed
  automatically on first run, if necessary. This is also the checker used by
  scripts and workflows related to the [refcache](#refcache).
- **[Lychee][]** — the new **default** checker, run by `check:links`.
  > [!NB] :warning: You must [install Lychee][lychee-install] locally.

## Check links

To check links locally, ensure you have Lychee installed, and run

```sh
npm run check:links
```

Or run checks with htmltest like this:

```sh
npm run _htmltest -- check:links
```

> [!TIP] Pro tip
>
> Want to fallback to htmltest as your default check without the need for a
> command prefix? Then set the following environment variable to have all npm
> scripts -- that rely on this variable directly or indirectly (such as
> `check:links`, `check`, etc) -- use htmltest:
>
> ```sh
> export LINK_CHECKER=htmltest
> ```

## Common commands

| Command                | Checking scope     | Checker                         |
| ---------------------- | ------------------ | ------------------------------- |
| `check:links`          | Whole site         | `LINK_CHECKER` (default Lychee) |
| `check:links:htmltest` | Whole site         | htmltest                        |
| `check:links:lychee`   | Whole site         | Lychee                          |
| `check:links:diff`     | Changed files only | Lychee                          |

The `check:links` and `check:links:*` scripts run over a build of `BUILD_KIND`.
For details, see [Build kinds: full and lean][]

[Build kinds: full and lean]: ../#build-kinds

## Refcache

The site has an external-link cache (refcache) under version control. It is
created and updated by htmltest. Lychee is not currently setup to refresh the
refcache. To refresh the refcache, run either `fix:refcache` or check links with
htmltest.

## Refcache refresh and housekeeping workflows {#workflows}

The following workflows are scheduled daily and run a link checking command:

| Workflow                          | Checker  | Build    |
| --------------------------------- | -------- | -------- |
| Refcache refresh (`fix:refcache`) | htmltest | **full** |
| Housekeeping (`fix-and-test:all`) | htmltest | **full** |

Refcache refresh prunes the refcache and runs `check:links:htmltest`, which
refreshes the refcache for the pruned entries, if they are still used in the
docs.

The [housekeeping workflow][housekeeping] runs `fix-and-test:all`, which calls
`fix:refcache` and deliberately skips `check:links` so links are checked exactly
once (via htmltest, refreshing the refcache).

## In CI

The [`check-links.yml` workflow][ci] builds the site once (lean) and shares that
artifact across the htmltest shards and the Lychee check, so local runs and CI
check the same build.

[ci]: ../ci-workflows/
[housekeeping]: ../ci-workflows/#housekeeping
[htmltest]: https://github.com/wjdp/htmltest
[Lychee]: https://lychee.cli.rs/
[lychee-install]: https://lychee.cli.rs/guides/getting-started/
