---
title: Dependency management
description: >-
  How this site installs, verifies, and updates its npm dependencies.
weight: 11
---

npm dependencies are pinned by the committed `package-lock.json`: automated
installs reproduce the lock exactly, and lifecycle scripts are disabled except
for a reviewed allowlist. For the threat model and rationale behind these
controls, see [Supply-chain security](../../design/supply-chain-security/).

## Supply-chain controls {#controls}

All controls are configured in files at the repository root.

### Release cooldown

Version resolution ignores releases younger than the configured minimum age.
Lock-exact installs (`npm ci`) don't resolve versions, so they are unaffected.

Configuration: `min-release-age` in `.npmrc`.

### Lifecycle-script allowlist

Installs run a package's lifecycle scripts only when its exact name and version
is allowlisted. An entry set to `false` records a reviewed denial: the package
installs, its script is skipped. Denials grant nothing, so they cover the
package by name, across versions. The allowlist only filters: it never
re-enables scripts that `ignore-scripts` disables, so script-free installs run
none, allowlisted or not, and a reviewed exception takes an explicit
`--ignore-scripts=false` at the call site.

Configuration: `strict-allow-scripts` in `.npmrc`; the `allowScripts` map in
`package.json`.

### npm version floor

Installs fail when the active npm is older than the engines floor: the oldest
version that supports the controls above. The floor rises as npm fixes
enforcement gaps in those controls, and follows npm versions bundled with Node
LTS releases, so a default toolchain passes the check; environments the site
controls, such as Netlify, may pin a newer npm.

Configuration: `engine-strict` in `.npmrc`; `engines` in `package.json`.

### Inert Netlify auto-install

Netlify's automatic install is constrained to a dry run with scripts disabled,
under a pinned npm that satisfies the version floor.

Configuration: `NPM_VERSION` and `NPM_FLAGS` in `netlify.toml`.

## Install contracts

Automated environments install lock-exact and script-free, then explicitly
re-enable the one reviewed hook: the `hugo-extended` rebuild that fetches the
pinned Hugo binary. Local installs follow the lock while it agrees with
`package.json`, with lifecycle scripts gated by the allowlist rather than
disabled:

- **CI**: `npm run ci:min`; jobs that build the site follow with
  `npm run ci:prepare`.
- **Devcontainer**: `npm run install:safe`, the same contract, keeping optional
  dependencies.
- **Netlify**: `npm run install:safe`, run by the build command after the inert
  auto-install, between clean-working-tree checks; lock drift or any other
  Git-visible change fails the build. If the check fails on residue from a
  retired path — Netlify's build cache restores it — clear the deploy context's
  build cache and retry rather than ignoring the path.
- **Local**: `npm install`, or `npm run install:safe` for the automated
  contract; see [local setup][].

The nested Docsy theme setup follows the same contract: the `prepare` step
invokes Docsy's own lock-exact, script-free theme-dependency install.

## Updating dependencies {#updating}

### Routine updates

`npm run update:packages` bumps `package.json` only. The release cooldown
applies: versions still inside the cooldown window are not offered. Then
regenerate the lock and commit both files together:

```sh
npm install --package-lock-only --ignore-scripts
```

### Script-bearing packages

When updating a package that has an `allowScripts` entry:

1. Review the new version's lifecycle scripts.
2. If the script is needed, update the entry's exact version together with the
   dependency. A denial (`false`) is name-level and needs no update.

### Lock-file maintenance

For contributor lock-file cases (regenerating the lock after a dependency
change, merge conflicts, unexplained rewrites), see [local setup][].

<!-- prettier-ignore-start -->
[local setup]: /docs/contributing/development/#local-setup
<!-- prettier-ignore-end -->
