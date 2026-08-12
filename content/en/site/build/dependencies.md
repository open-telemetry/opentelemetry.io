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

CI, the devcontainer, and Netlify install lock-exact and script-free, then
explicitly re-enable the one reviewed hook: the `hugo-extended` rebuild that
fetches the pinned Hugo binary. Per environment:

- **CI**: `npm run ci:min`; jobs that build the site follow with
  `npm run ci:prepare`.
- **Devcontainer**: `npm run install:safe`, the same contract, keeping optional
  dependencies.
- **Netlify**: `npm run install:safe`, run by the [Netlify][] build command
  after the [inert auto-install](#inert-netlify-auto-install), between
  clean-working-tree checks:
  - Lock drift or any other Git-visible change fails the build.
  - For failures on paths the install never touched, see
    [Stale Netlify build cache](#netlify-build-cache) below.
- **Local**: `npm run install:safe`, or a standard `npm install`, which follows
  the lock while it agrees with `package.json` and gates lifecycle scripts by
  the [allowlist](#lifecycle-script-allowlist) rather than disabling them; see
  [local setup][].

The nested [Docsy][] theme setup follows the same contract: the `prepare` step
invokes Docsy's own lock-exact, script-free theme-dependency install.

### Stale Netlify build cache {#netlify-build-cache}

Netlify keeps a build cache per [deploy context][]:

- One for production
- One per already-built PR, seeded from the production cache on the PR's first
  build.

Each cache [includes a clone of the repository][], and checking out a commit
that drops a git submodule leaves the submodule's working tree in place, so a
removed submodule can ride a cache back into later builds as untracked residue
and fail the clean-working-tree checks: the deploy log shows the path in a
`??`-prefixed status line.

Clear the affected [build cache][] rather than adding the path to `.gitignore`:

- **Production**:
  - Clear cache and deploy site, under **Deploys** > **Trigger deploy**.
- **Deploy Previews**: each already-built PR holds its own cache copy, untouched
  by a production clear after the fact.
  - Clear it from the PR's latest deploy page with **Retry** > **Clear cache and
    retry with latest branch commit**. There is no bulk clear across PRs.

> [!IMPORTANT]
>
> After removing a git submodule, clear the production build cache as part of
> the removal, before the residue seeds per-PR caches.

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
3. For a new approval, also adds the package to the Renovate automerge exclusion
   in [`.github/renovate.json5`][]: every bump of an approved package needs the
   steps above, so its update PRs must wait for a contributor.

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

- **Enforcement**: `min-release-age` in [`.npmrc`][].
- **Scope**:
  - Only resolving operations are affected; lock-exact installs (`npm ci`) don't
    resolve versions.
  - npm gives project config precedence over user config, so a stricter cooldown
    in your user `.npmrc` is relaxed to the project value here; to keep yours
    for an invocation, set the `npm_config_min_release_age` environment
    variable, which outranks both.
- **[Renovate][]**: applies its own cooldown to the update PRs it opens, set by
  `minimumReleaseAge` in [`.github/renovate.json5`][]; longer for the updates
  that merge without human review.

### Lifecycle-script allowlist

Installs run a package's lifecycle scripts only when its exact name and version
are listed in the `allowScripts` allowlist:

- **Enforcement**: the `allowScripts` map in [`package.json`][], made
  fail-closed by `strict-allow-scripts` in [`.npmrc`][].
- **Denials**:
  - An entry set to `false` records a reviewed denial: the package installs, its
    script is skipped.
  - Denials grant nothing, so they cover the package by name, across versions.
- **Interplay with `--ignore-scripts`**:
  - The allowlist only filters: it never re-enables scripts that
    `ignore-scripts` disables, so script-free installs run none, allowlisted or
    not.
  - A reviewed exception takes an explicit `--ignore-scripts=false` at the call
    site.

### npm version floor

Installs fail when the active npm is older than the engines floor: the oldest
version that supports the controls above.

- **Enforcement**:
  - `engines` in [`package.json`][] sets the floor.
  - `engine-strict` in [`.npmrc`][] makes it fail closed.
- **Floor policy**:
  - The floor rises as npm fixes enforcement gaps in the controls.
  - It follows npm versions bundled with Node LTS releases, so a default
    toolchain passes the check.
- **Netlify**:
  - Netlify's Node-bundled default npm may be older than the floor;
    [`NPM_VERSION`][netlify-deps] in [`netlify.toml`][] pins one that satisfies
    it.
  - Bump the pin at least when the floor rises.

### Inert Netlify auto-install

Netlify's [automatic install][netlify-deps] at the start of a build is
neutralized by [`NPM_FLAGS`][netlify-deps] in [`netlify.toml`][]:

- `--dry-run`: npm resolves and logs what an install would change, but writes
  nothing.
- `--ignore-scripts`: lifecycle scripts stay disabled by explicit instruction,
  not as a side effect of the dry run.

**Scope**: `NPM_FLAGS` is a Netlify build setting, not npm config; it applies
only to the automatic install, never to the build command's npm runs.

**Defense in depth**: the [real install][install contracts] is `npm ci`, which
replaces `node_modules` wholesale, so auto-install or build-cache residue there
does not survive into the build even though `node_modules` is invisible to the
clean-working-tree checks (they see only Git-visible changes).

### No bare npx

Repository wiring (package scripts, CI, helper scripts, contributor docs) never
invokes a bin as `npx BIN`: on a stale or missing `node_modules`, `npx` falls
back to the public registry and executes whatever package holds that name. Its
install prompt is no defense: it's skipped in non-interactive contexts and
invites a reflexive yes elsewhere. Localized copies of contributor docs catch up
through [drift tracking][].

- **Instead**:
  - Package scripts invoke dependency-provided bins directly; npm puts
    `node_modules/.bin` on their `PATH`, and a missing bin fails loudly with
    zero registry traffic.
  - Contexts without that `PATH` entry (docs, standalone scripts) use
    `npm exec --no -- BIN`, which never installs.
- **Enforcement**: review discipline; there is no automated check.

<!-- prettier-ignore-start -->
[install contracts]: #install-contracts
[build cache]: https://docs.netlify.com/build/configure-builds/troubleshooting-tips/
[deploy context]: https://docs.netlify.com/deploy/deploy-overview/#deploy-contexts
[drift tracking]: /docs/contributing/localization/#track-changes
[includes a clone of the repository]: https://answers.netlify.com/t/what-does-clear-cache-and-deploy-site-do-specifically/9419/2
[`.github/renovate.json5`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/renovate.json5
[`.npmrc`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.npmrc
[`netlify.toml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/netlify.toml
[`package.json`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/package.json
[Docsy]: https://www.docsy.dev/
[local setup]: /docs/contributing/development/#local-setup
[netlify-deps]: https://docs.netlify.com/build/configure-builds/manage-dependencies/#npm
[Netlify]: https://www.netlify.com/
[Renovate]: https://docs.renovatebot.com/
[Supply-chain security]: ../../design/supply-chain-security/
<!-- prettier-ignore-end -->
