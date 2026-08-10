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

| Control                    | Configuration                                                    | Effect                                                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release cooldown           | `.npmrc`: `min-release-age`                                      | Version resolution ignores releases younger than the configured minimum age. Lock-exact installs (`npm ci`) don't resolve versions, so they are unaffected.    |
| Lifecycle-script allowlist | `.npmrc`: `strict-allow-scripts`; `package.json`: `allowScripts` | Installs run a package's lifecycle scripts only when its exact name and version is allowlisted. Installs with `--ignore-scripts` run none, allowlisted or not. |
| npm version floor          | `.npmrc`: `engine-strict`; `package.json`: `engines`             | Installs fail when the active npm is older than the engines floor — the minimum version that enforces the controls above.                                      |
| Inert Netlify auto-install | `netlify.toml`: `NPM_FLAGS`, `NPM_VERSION`                       | Constrains Netlify's automatic install to a dry run with scripts disabled, under a pinned npm that satisfies the version floor.                                |

All configuration files are in the repository root.

## Install contracts {#install-contracts}

Every environment installs lock-exact and script-free, then explicitly
re-enables the one reviewed hook — the `hugo-extended` rebuild that fetches the
pinned Hugo binary:

| Environment  | Contract                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI           | `npm run ci:min`; jobs that build the site follow with `npm run ci:prepare`.                                                                                  |
| Devcontainer | `npm run install:safe` — the same contract, keeping optional dependencies.                                                                                    |
| Netlify      | After the inert auto-install, the build command runs `install:safe` between clean-working-tree checks, failing on lock drift or any other Git-visible change. |
| Local        | `npm install` (lock-pinned) or `npm run install:safe`; see [local setup][].                                                                                   |

The nested Docsy theme setup follows the same contract: the `prepare` step
invokes Docsy's own lock-exact, script-free theme-dependency install.

## Updating dependencies {#updating}

- **Routine updates**: `npm run update:packages` bumps `package.json` and the
  lock; the release cooldown applies, so versions still inside the cooldown
  window are not offered.
- **Script-bearing packages**: when updating a package that has an
  `allowScripts` entry, review the new version's lifecycle scripts and update
  the entry's exact version along with the dependency.
- **Contributor lock-file cases** — regenerating the lock after a dependency
  change, lock merge conflicts, unexplained lock rewrites — are covered in
  [local setup][].

<!-- prettier-ignore-start -->
[local setup]: /docs/contributing/development/#local-setup
<!-- prettier-ignore-end -->
