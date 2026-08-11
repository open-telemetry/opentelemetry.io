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
the install fails rather than proceeding without it.

### Minimize the dependency surface

Every dependency, direct or transitive, is surface the controls must cover.
Unused and convenience dependencies are dropped rather than carried.

### Install from the lock; resolve deliberately

Automated install paths are [lock-exact][install contracts]: they reproduce the
committed, reviewed [`package-lock.json`][] and never resolve version ranges. A
local `npm install` can rewrite the lock when it disagrees with `package.json`;
the [verification below](#verify-dont-trust) catches such rewrites. Resolution,
the risky step, is reserved for [deliberate dependency updates][].

### Resolve only cooled-down releases

Freshly published versions are the attack window: registry-side takedowns of
malicious releases take time. Version resolution ignores releases younger than a
[cooldown period][cooldown], trading a few days of update latency for the time
takedowns need to land.

### Run only reviewed lifecycle scripts

[Lifecycle scripts][] are [default-deny][allowlist]: an install runs only
reviewed, allowlisted scripts. Approvals are version-exact so that a compromised
patch release can't inherit its predecessor's approval: every bump of a
script-bearing package forces a fresh review.

The [allowlist][] records both review outcomes: a needed script is approved, and
an unnecessary one (a shipped prebuilt binary suffices) gets an explicit denial.
Silence always means unreviewed, and unreviewed fails the install. Denials can
be name-level because they grant nothing. Exceptions are named and re-enabled
inline at the point of use, never by weakening the default posture.

### Fail closed on old npm

The [cooldown][] and [script-gating][allowlist] controls are `.npmrc` settings
that older npm versions silently ignore: an old npm would install without them
and report success. An [npm engines floor][] with strict engine checking turns
that silent bypass into an install failure.

### Keep vendor auto-installs inert

[Netlify][] runs its own npm install before the build command, outside the
scripts this repository controls. Rather than trust it, the configuration
[neutralizes it][inert auto-install], and the build command performs the real,
contract-following install. Defense in depth: if Netlify ever stops honoring the
constraining flags, `.npmrc` still gates scripts, and the
[verification below](#verify-dont-trust) catches what slips through.

### Verify, don't trust

Inert and lock-exact are verified claims, not assumptions:

- The Netlify build command runs its install between [clean-working-tree
  checks][install contracts]; any Git-visible change fails the build.
- A `postinstall` check warns when a local install rewrites the lock.

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
