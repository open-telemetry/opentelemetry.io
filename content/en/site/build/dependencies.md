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
fetches the pinned Hugo binary. The rebuild runs through
`scripts/rebuild-hugo-extended.mjs`, which retries the fetch with bounded
backoff and refuses to run while any `HUGO_*` installer override is set.
Installs keep optional dependencies: npm delivers platform-specific binaries
(for example, the Dart Sass compiler in `sass-embedded`) as optional
dependencies selected by `os`/`cpu`, so omitting them breaks the build. Per
environment:

- **CI**: `npm run ci:min`; jobs that build the site follow with
  `npm run ci:prepare`.
- **Devcontainer**: `npm run install:safe`, the same contract.
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
- One per **head branch name** for Deploy Previews, seeded from the production
  cache on the name's first build. Cache lineages die only by explicit clear:
  branch deletion is invisible to Netlify, so a branch recreated under the same
  name (recycled bot-branch names included) re-attaches to the old cache.

Each cache [includes a clone of the repository][], and checking out a commit
that drops a git submodule leaves the submodule's working tree in place, so a
removed submodule can ride a cache back into later builds as untracked residue
and fail the clean-working-tree checks: the deploy log shows the path in a
`??`-prefixed status line.

Clear the affected [build cache][] rather than adding the path to `.gitignore`:

- **Production**:
  - Clear cache and deploy site, under **Deploys** > **Trigger deploy**.
- **Deploy Previews**: each already-built branch holds its own cache copy,
  untouched by a production clear after the fact.
  - Clear it from the PR's latest deploy page with **Retry** > **Clear cache and
    retry with latest branch commit**. There is no bulk clear across branches.

> [!IMPORTANT]
>
> After removing a git submodule, clear the production build cache as part of
> the removal, before the residue seeds per-branch caches. Also clear the
> lineage of any recycled bot-branch name; a production clear never reaches it.

## Updating dependencies {#updating}

Routine version bumps arrive as [Renovate][] PRs, gated by the
[release cooldown](#release-cooldown), and known-vulnerability fixes arrive
alert-driven ([Security updates](#security-updates)). The remaining cases are
manual; in each, commit the regenerated lock together with any `package.json`
change.

### Manifest changes {#manifest-changes}

Whether you edited `package.json` by hand or bumped every in-range version with
`npm run update:packages` (the [release cooldown](#release-cooldown) applies to
the versions offered), reconcile the lock with the changed manifest:

```sh
npm install --package-lock-only --ignore-scripts
```

Unlike `npm update` (below), this rewrites only what the manifest change
requires, leaving other entries as pinned. A merge conflict on the lock file
takes the same recipe: keep the `main` version and rerun the command.

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

### Transitive refreshes {#transitive-refresh}

No schedule re-resolves the lock wholesale ([resolution is
deliberate][deliberate]). To refresh transitive dependencies, run the following
on demand at the repository root (the lock also covers the
`scripts/generate-community-data` workspace):

```sh
npm update --package-lock-only --ignore-scripts
```

The [release cooldown](#release-cooldown) applies, with a sharp edge: a
dependency whose only satisfying versions are younger than the cooldown (an
exact pin is the common case) fails the whole resolution (`ETARGET`) until one
ages. When the young release is one you reviewed and vouch for, exempt that name
alone; the cooldown stays on for the rest of the tree:

```sh
npm_config_min_release_age_exclude=PACKAGE_NAME \
  npm update --package-lock-only --ignore-scripts
```

Replace _`PACKAGE_NAME`_ with the vouched-for package. Keep the exemption
per-invocation; a standing entry in [`.npmrc`][] would permanently waive the
cooldown for that name. Also review the refreshed lock for major hops:
`npm update` honors the manifests' declared ranges, and a parent that widens a
range can pull a new transitive major.

### Unexpected lock changes {#lock-drift}

If the lock changed but you didn't change dependencies (a `postinstall` check
warns when an install does this), that signals drift: restore the lock and
investigate rather than committing the rewrite.

### Security updates {#security-updates}

Known-vulnerability fixes don't wait for the weekly update PRs; they arrive
alert-driven:

- **GitHub [Dependabot security updates][]**: a repository-side setting (no
  `dependabot.yml`), able to patch direct and transitive dependencies; for npm
  that can mean rewriting parent manifest entries, not only the lock.
- **[Renovate][] vulnerability-alert PRs**: opened immediately, for direct
  dependencies.

The overlap is deliberate; an occasional duplicate PR is accepted. With
scheduled lock re-resolves [disabled by design][deliberate], these alert-driven
paths are the only automated route for transitive fixes, so the repository-side
setting stays on. The two paths meet the [release cooldown](#release-cooldown)
differently:

- Dependabot security updates deliberately override every release-age gate
  (`.npmrc` included): a fix version younger than the cooldown can land, and
  vetting it is the reviewing maintainer's job.
- Renovate's PR is subject to the `.npmrc` gate when it regenerates the lock, so
  a younger-than-cooldown fix arrives as a failed artifact update; adopting it
  early takes the [scoped exemption](#transitive-refresh) run by a maintainer.

## Supply-chain controls {#controls}

### Supply-chain audit {#audit}

The supply-chain audit test, [`scripts/supply-chain-audit.test.mjs`][], verifies
the controls below from committed files alone on every `test:local-tools` run,
so a regressed control fails a test rather than waiting for an incident. For the
verification principles behind the audit itself, see its
[design page](../../design/supply-chain-audit/).

When the audit fails on your PR, the assertion message states the expected
condition; the common cases:

- **You bumped a dependency that has an `allowScripts` entry**: follow
  [script-bearing packages](#script-bearing-packages); the failure message names
  the version the entry must move to.
- **You changed an install-path script, `.npmrc`, or `netlify.toml`**: that
  failure is the point. The audit pins the install surface so that every change
  to it gets a deliberate review. Update the corresponding assertion together
  with your change, and say why in the PR.

Never loosen an assertion just to get to green: each one enforces a control on
this page, so first work out which control your change relaxes.

Out of the audit's scope:

- GitHub workflow files
- [Renovate][] configuration ([`.github/renovate.json5`][]): reviewed like code,
  not audit-pinned
- The [Docsy][] theme's own dependency install (audited upstream)
- The build-half npm scripts past the install boundary

### Release cooldown

Version resolution ignores releases younger than the configured minimum age.

- **Enforcement**: `min-release-age` in [`.npmrc`][]. The
  `scripts/generate-community-data` subproject is an npm workspace rather than a
  separate lock home, so the root `.npmrc` and lock govern its resolution too.
- **Scope**:
  - Only resolving operations are affected; lock-exact installs (`npm ci`) don't
    resolve versions.
  - npm gives project config precedence over user config, so a stricter cooldown
    in your user `.npmrc` is relaxed to the project value here; to keep yours
    for an invocation, set the `npm_config_min_release_age` environment
    variable, which outranks both.
- **[Renovate][]**: applies its own cooldown to the update PRs it opens, set by
  `minimumReleaseAge` in [`.github/renovate.json5`][]; longer for the updates
  that merge without human review. The preset-supplied 3-day npm cooldown
  (`security:minimumReleaseAgeNpm`) is excluded so that it can't override these
  ages, its age exemptions included; caution: an upstream rename of that preset
  would silently re-admit it. Update types Renovate can't date (such as `pin`,
  `replacement`, `rollback`) fall outside its cooldown: their PRs open normally,
  at most showing a permanently pending stability status (not a required check),
  so normal review is the gate.

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
  - The committed `.nvmrc` pins a Node.js release whose bundled npm satisfies
    the floor, so CI, Netlify, and `nvm`-managed local setups pass it by
    construction; [Renovate][] keeps the pin updated. (A floating `.nvmrc` such
    as `lts/*` can't promise this: CI runners resolve it from possibly stale
    caches.)
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
with this rule through [drift tracking][].

- **Instead**:
  - Package scripts invoke dependency-provided bins directly; npm puts
    `node_modules/.bin` on their `PATH`, and a missing bin fails loudly with
    zero registry traffic.
  - Contexts without that `PATH` entry (docs, standalone scripts) use
    `npm exec --no -- BIN`, which never installs.
- **Enforcement**: review discipline; there is no automated check.

<!-- prettier-ignore-start -->
[`.github/renovate.json5`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/renovate.json5
[`.npmrc`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.npmrc
[`netlify.toml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/netlify.toml
[`package.json`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/package.json
[`scripts/supply-chain-audit.test.mjs`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/supply-chain-audit.test.mjs
[build cache]: https://docs.netlify.com/build/configure-builds/troubleshooting-tips/
[deliberate]: ../../design/supply-chain-security/#deliberate
[Dependabot security updates]: https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates
[deploy context]: https://docs.netlify.com/deploy/deploy-overview/#deploy-contexts
[Docsy]: https://www.docsy.dev/
[drift tracking]: /docs/contributing/localization/#track-changes
[includes a clone of the repository]: https://answers.netlify.com/t/what-does-clear-cache-and-deploy-site-do-specifically/9419/2
[install contracts]: #install-contracts
[local setup]: /docs/contributing/development/#local-setup
[netlify-deps]: https://docs.netlify.com/build/configure-builds/manage-dependencies/#npm
[Netlify]: https://www.netlify.com/
[Renovate]: https://docs.renovatebot.com/
[Supply-chain security]: ../../design/supply-chain-security/
<!-- prettier-ignore-end -->
