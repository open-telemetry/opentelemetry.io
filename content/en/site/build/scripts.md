---
title: Helper scripts
description: >-
  Shell scripts used by CI workflows and local development for label management,
  link checking, registry updates, and more.
weight: 30
---

All scripts live under
[`.github/scripts/`](https://github.com/open-telemetry/opentelemetry.io/tree/main/.github/scripts).

## check-i18n-helper.sh

Validates that localization pages include the required `default_lang_commit`
front matter field. If pages are missing it, the script outputs a fix command:

```sh
npm run fix:i18n:new
```

## check-links-shard.sh

Runs link checking for a specific shard by temporarily modifying
`.htmltest.yml`.

```sh
.github/scripts/check-links-shard.sh [-qk] <shard-id> <shard-regex>
```

| Flag | Description                                                |
| ---- | ---------------------------------------------------------- |
| `-q` | Quiet mode                                                 |
| `-k` | Keep modified `.htmltest.yml` (default: restore after run) |
| `-h` | Show help                                                  |

The script injects the shard regular expression into the `IgnoreDirs` config,
runs `npm run __check:links`, and restores the original config unless `-k` is
used.

## check-refcache.sh

Compares shard-specific `refcache.json` files against the main
`static/refcache.json` to detect cache inconsistencies after link checking.

```sh
.github/scripts/check-refcache.sh [directory]
```

Default directory: `tmp/check-refcache`. If differences are found, the script
suggests running `npm run fix:refcache` or adding a `/fix:refcache` comment to
the PR.

## pr-approval-labels.sh

Manages PR approval labels based on review state and file ownership. Called by
the [`pr-approval-labels` workflow](../ci-workflows/#pr-approval-labels).

**How it works:**

1. Fetches PR data (files changed, latest reviews, current labels) via `gh`.
2. Resolves `docs-approvers` team members from the GitHub org API.
3. Determines required SIG teams by matching changed files against
   [`.github/component-owners.yml`][owners] (parses YAML manually, no `yq`
   dependency).
4. Checks whether each required group has an approving review.
5. Adds or removes labels using tri-state logic (`true`/`false`/`unknown`) to
   avoid changing labels when team membership can't be fetched.

[owners]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml

**Required env vars:** `REPO`, `PR`, `GITHUB_TOKEN`.

## update-registry-versions.sh

Auto-updates package versions in `data/registry/*.yml` by querying upstream
registries. Supports: npm, Packagist, RubyGems, Go, NuGet, Hex, Maven.

- In CI (`GITHUB_ACTIONS` set): creates a branch and opens a PR.
- Locally: runs in **dry-run** mode by default. Use `-f` to force real
  execution.

Deduplicates PRs by generating a SHA-1 tag from the update summary.
