---
title: Dependency management
description: >-
  How this site installs, verifies, and updates its npm dependencies.
weight: 11
---

npm dependencies are pinned by the committed `package-lock.json`; every install
path reproduces that lock exactly, with lifecycle scripts disabled except for a
reviewed allowlist. For the threat model and rationale behind these controls,
see [Supply-chain security](../../design/supply-chain-security/).

## Supply-chain controls {#controls}

All controls are configured in files at the repository root.

### Release cooldown

Version resolution ignores releases younger than the configured minimum age.
Lock-exact installs (`npm ci`) don't resolve versions, so they are unaffected.

Configuration: `min-release-age` in `.npmrc`.

### Lifecycle-script allowlist

Installs run a package's lifecycle scripts only when its exact name and version
is allowlisted. Installs with `--ignore-scripts` run none, allowlisted or not.

Configuration: `strict-allow-scripts` in `.npmrc`; the `allowScripts` map in
`package.json`.

### npm version floor

Installs fail when the active npm is older than the engines floor — the minimum
version that enforces the controls above.

Configuration: `engine-strict` in `.npmrc`; `engines` in `package.json`.

### Inert Netlify auto-install

Netlify's automatic install is constrained to a dry run with scripts disabled,
under a pinned npm that satisfies the version floor.

Configuration: `NPM_VERSION` and `NPM_FLAGS` in `netlify.toml`.

## Install contracts

Every environment installs lock-exact and script-free, then explicitly
re-enables the one reviewed hook — the `hugo-extended` rebuild that fetches the
pinned Hugo binary:

- **CI**: `npm run ci:min`; jobs that build the site follow with
  `npm run ci:prepare`.
- **Devcontainer**: `npm run install:safe` — the same contract, keeping optional
  dependencies.
- **Netlify**: after the inert auto-install, the build command runs
  `install:safe` between clean-working-tree checks, failing on lock drift or any
  other Git-visible change.
- **Local**: `npm install` (lock-pinned) or `npm run install:safe`; see [local
  setup][].

The nested Docsy theme setup follows the same contract: the `prepare` step
invokes Docsy's own lock-exact, script-free theme-dependency install.

## Updating dependencies {#updating}

### Routine updates

`npm run update:packages` bumps `package.json` and the lock file. The release
cooldown applies: versions still inside the cooldown window are not offered.

### Script-bearing packages

When updating a package that has an `allowScripts` entry:

1. Review the new version's lifecycle scripts.
2. Update the entry's exact version together with the dependency.

### Lock-file maintenance

For contributor lock-file cases — regenerating the lock after a dependency
change, merge conflicts, unexplained rewrites — see [local setup][].

<!-- prettier-ignore-start -->
[local setup]: /docs/contributing/development/#local-setup
<!-- prettier-ignore-end -->
