---
title: Dependency management
description: >-
  How the site installs, verifies, and updates its npm dependencies
weight: 5
---

npm dependencies are pinned by the committed `package-lock.json`, and installs
run only reviewed lifecycle scripts. For the threat model and rationale behind
these controls, see [Supply-chain security][].

## Install contracts

Automated environments install lock-exact and script-free, then explicitly
re-enable the one reviewed hook: the `hugo-extended` rebuild that fetches the
pinned Hugo binary. Local installs follow the lock while it agrees with
`package.json`, with lifecycle scripts gated by the
[allowlist](#lifecycle-script-allowlist) rather than disabled:

- **CI**: `npm run ci:min`; jobs that build the site follow with
  `npm run ci:prepare`.
- **Devcontainer**: `npm run install:safe`, the same contract, keeping optional
  dependencies.
- **Netlify**: `npm run install:safe`, run by the [Netlify][] build command
  after the [inert auto-install](#inert-netlify-auto-install), between
  clean-working-tree checks:
  - Lock drift or any other Git-visible change fails the build.
  - If the check fails on residue from a retired path (Netlify's build cache
    restores it), clear the deploy context's build cache and retry rather than
    ignoring the path.
- **Local**: `npm run install:safe`, or a standard `npm install`; see [local
  setup][].

The nested [Docsy][] theme setup follows the same contract: the `prepare` step
invokes Docsy's own lock-exact, script-free theme-dependency install.

## Updating dependencies {#updating}

### Routine updates

`npm run update:packages` bumps `package.json` only. The
[release cooldown](#release-cooldown) applies to the offered versions. Then
regenerate the lock and commit both files together:

```sh
npm install --package-lock-only --ignore-scripts
```

### Script-bearing packages

When adding or updating a package that has, or needs, an `allowScripts` entry,
the contributor making the change:

1. Reviews the new version's lifecycle scripts.
2. Records the outcome, committed together with the dependency change and vetted
   in PR review: a needed script as an exact-version approval, an unneeded one
   as a name-level denial (`false`, which needs no update on later bumps).

### Lock-file maintenance

- **You changed dependencies**: regenerate the lock as in
  [routine updates](#routine-updates) and commit it together with
  `package.json`.
- **Merge conflict on the lock file**: take the `main` version and rerun the
  regeneration command.
- **The lock file changed, but you didn't change dependencies** (a `postinstall`
  check warns when an install does this): that signals drift; restore the lock
  and investigate rather than committing the rewrite.

## Supply-chain controls {#controls}

### Release cooldown

Version resolution ignores releases younger than the configured minimum age.
Lock-exact installs (`npm ci`) don't resolve versions, so they are unaffected.

npm gives project config precedence over user config, so a stricter cooldown in
your user `.npmrc` is relaxed to the project value here; to keep yours for an
invocation, set the `npm_config_min_release_age` environment variable, which
outranks both.

[Renovate][] applies its own cooldown to the update PRs it opens, longer for the
updates that merge without human review.

Configuration:

- `min-release-age` in [`.npmrc`][]
- `minimumReleaseAge` in [`.github/renovate.json5`][]

### Lifecycle-script allowlist

Installs run a package's lifecycle scripts only when its exact name and version
are listed in the `allowScripts` allowlist:

- An entry set to `false` records a reviewed denial: the package installs, its
  script is skipped.
- Denials grant nothing, so they cover the package by name, across versions.
- The allowlist only filters: it never re-enables scripts that `ignore-scripts`
  disables, so script-free installs run none, allowlisted or not.
- A reviewed exception takes an explicit `--ignore-scripts=false` at the call
  site.

Configuration:

- `strict-allow-scripts` in [`.npmrc`][]
- `allowScripts` map in [`package.json`][]

### npm version floor

Installs fail when the active npm is older than the engines floor: the oldest
version that supports the controls above. The floor rises as npm fixes
enforcement gaps in those controls, and follows npm versions bundled with Node
LTS releases, so a default toolchain passes the check; site-controlled
environments such as Netlify may pin a newer npm.

Configuration:

- `engine-strict` in [`.npmrc`][]
- `engines` in [`package.json`][]

### Inert Netlify auto-install

Netlify's [automatic install][netlify-deps] at the start of a build is
constrained via `NPM_FLAGS` to a dry run with scripts disabled:

- `--dry-run`: npm resolves and logs what an install would change, but writes
  nothing.
- `--ignore-scripts`: lifecycle scripts stay disabled by explicit instruction,
  not as a side effect of the dry run.

Configuration:

- `NPM_VERSION` and `NPM_FLAGS` in [`netlify.toml`][]

<!-- prettier-ignore-start -->
[`.github/renovate.json5`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/renovate.json5
[`.npmrc`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.npmrc
[Docsy]: https://www.docsy.dev/
[local setup]: /docs/contributing/development/#local-setup
[Netlify]: https://www.netlify.com/
[netlify-deps]: https://docs.netlify.com/build/configure-builds/manage-dependencies/#npm
[`netlify.toml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/netlify.toml
[`package.json`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/package.json
[Renovate]: https://docs.renovatebot.com/
[Supply-chain security]: ../../design/supply-chain-security/
<!-- prettier-ignore-end -->
