---
title: Supply-chain security
description: >-
  Threat model and rationale behind the site's npm dependency controls
weight: 20
cSpell:ignore: cooldowns unreviewed
---

For the controls themselves and day-to-day procedures, see
[Dependency management](../../build/dependencies/). Neighboring security topics
have their own homes: workflow trigger and token privileges in
[CI workflows](../../build/ci-workflows/#security-model), and vulnerability
reporting in the [security policy][].

## Threat model

The August 2026 npm worm ([security notice][]) set the current posture:
malicious versions of popular npm packages were published from compromised
maintainer accounts. The packages' install-time [lifecycle scripts][] executed
the payload and propagated it using harvested credentials. Several of this
repository's PR branches were affected before containment; none reached `main`
or production.

The attack paths that matter for this repository:

- **Version resolution**: any install that resolves version ranges can pull a
  freshly published malicious release.
- **Lifecycle scripts**: install-time script execution lets a bad package
  compromise contributor hosts, CI runners, and build images.
- **Unattended installs**: CI jobs and the [Netlify][] build image install
  without a human watching, as do agent sessions.

## Design decisions

The recurring theme is **fail closed**: when a [control][] can't be enforced,
the install fails rather than proceeding without it. Decisions are grouped by
the attack path each counters, ordered roughly by when they act.

### Cut attack surface

**Minimize dependencies**:

- **What**: unused and convenience dependencies are dropped rather than carried.
- **Why**: every dependency, direct or transitive, is surface the controls must
  cover.
- **Enforced by**: maintainer judgment in dependency review.

### Constrain version resolution

- **Install from the lock**:
  - **What**: installs are [lock-exact][install contracts], reproducing the
    committed, reviewed [`package-lock.json`][] without resolving version
    ranges.
  - **Why**: an install that resolves version ranges can pull a freshly
    published malicious release; the lock is reviewed content.
  - **Enforced by**: `npm ci` in every install contract. The one exception, a
    local `npm install` rewriting a disagreeing lock, is caught by
    [verification](#keep-controls-honest).
- **Resolve deliberately**:
  - **What**: version resolution happens only in [deliberate dependency
    updates][], never as an install side effect.
  - **Why**: resolution is the risky step; it takes whatever the registry
    offers.
  - **Enforced by**: convention, backed by the lock; an unexpected resolution
    rewrites it, which verification flags.
- **Resolve only cooled-down releases**:
  - **What**: version resolution ignores releases younger than a [cooldown
    period][cooldown].
  - **Why**: freshly published versions are the attack window; registry-side
    takedowns need a few days to land.
  - **Enforced by**: the [cooldown][] control, for npm and Renovate alike.

### Run only reviewed lifecycle scripts

- **What**: [lifecycle scripts][] are [default-deny][allowlist]; an install runs
  only reviewed, allowlisted scripts, with named exceptions re-enabled inline at
  the point of use, never by weakening the default posture.
- **Why**: install-time scripts executed the worm's payload. Approvals are
  version-exact so a compromised patch release can't inherit its predecessor's
  approval; reviews record denials too, so silence always means unreviewed.
- **Enforced by**: the [allowlist][] in strict mode; unreviewed fails the
  install.

### Constrain unattended installs

**Neutralize the Netlify auto-install**:

- **What**: the configuration [neutralizes][inert auto-install] Netlify's [own
  npm install][netlify-deps]; the build command performs the [real
  install][install contracts].
- **Why**: the auto-install runs outside the scripts this repository controls
  and can't be disabled; the repository should decide which install commands
  run.
- **Enforced by**: the [inert auto-install][] control. Defense in depth: if
  Netlify ever stops honoring the constraining flags, `.npmrc` still gates
  scripts, and verification catches what slips through.

### Keep controls honest

- **Fail closed on old npm**:
  - **What**: installs fail when the active npm is older than the [npm engines
    floor][].
  - **Why**: older npm versions silently ignore the [cooldown][] and
    [script-gating][allowlist] `.npmrc` settings, installing without them and
    reporting success.
  - **Enforced by**: the floor itself; strict engine checking turns the silent
    bypass into an install failure.
- **Verify, don't trust**:
  - **What**: inert and lock-exact are verified claims, not assumptions.
  - **Why**: a control that fails silently is worse than none.
  - **Enforced by**: [clean-working-tree checks][install contracts] around the
    Netlify install, failing the build on any Git-visible change; a
    `postinstall` check warning when a local install rewrites the lock.

## Prior art

- Default-deny lifecycle scripts is the ecosystem direction:
  - [pnpm][] and [Yarn][] block dependency scripts by default.
  - npm's accepted [RFC #54][] brings the same model to npm through
    `allowScripts`, version-exact entries included.
- Release cooldowns are established practice:
  - [pnpm defers][] releases younger than a day by default.
  - The 3-day value follows the long-standing [Renovate
    `minimumReleaseAge`][renovate] convention.
- The control set maps onto established framework guidance:
  - [TUF's attack taxonomy][tuf]: arbitrary software installation,
    mix-and-match, and extraneous-dependencies attacks.
  - The [OpenSSF npm guide][openssf]: lock-exact CI installs.

<!-- prettier-ignore-start -->
[allowlist]: ../../build/dependencies/#lifecycle-script-allowlist
[control]: ../../build/dependencies/#controls
[cooldown]: ../../build/dependencies/#release-cooldown
[deliberate dependency updates]: ../../build/dependencies/#updating
[inert auto-install]: ../../build/dependencies/#inert-netlify-auto-install
[install contracts]: ../../build/dependencies/#install-contracts
[lifecycle scripts]: https://docs.npmjs.com/cli/using-npm/scripts
[Netlify]: https://www.netlify.com/
[netlify-deps]: https://docs.netlify.com/build/configure-builds/manage-dependencies/#npm
[npm engines floor]: ../../build/dependencies/#npm-version-floor
[openssf]: https://github.com/ossf/package-manager-best-practices/blob/main/published/npm.md
[`package-lock.json`]: https://docs.npmjs.com/cli/configuring-npm/package-lock-json
[pnpm]: https://pnpm.io/settings/build
[pnpm defers]: https://pnpm.io/settings/dependency-resolution
[renovate]: https://docs.renovatebot.com/configuration-options/#minimumreleaseage
[RFC #54]: https://github.com/npm/rfcs/blob/main/accepted/0054-make-scripts-install-opt-in.md
[security notice]: https://github.com/open-telemetry/opentelemetry.io/issues/11210
[security policy]: https://github.com/open-telemetry/opentelemetry.io/security/policy
[tuf]: https://theupdateframework.io/docs/security/
[Yarn]: https://yarnpkg.com/advanced/lifecycle-scripts
<!-- prettier-ignore-end -->
