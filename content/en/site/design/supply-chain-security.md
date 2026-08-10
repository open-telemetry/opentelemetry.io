---
title: Supply-chain security
description: >-
  Threat model and rationale behind the site's npm dependency supply-chain
  controls.
weight: 20
cSpell:ignore: cooldowns unreviewed
---

This page records why npm dependency handling is locked down the way it is. For
the controls themselves and day-to-day procedures, see
[Dependency management](../../build/dependencies/). Neighboring security topics
have their own homes: workflow trigger and token privileges in
[CI workflows](../../build/ci-workflows/#security-model), and vulnerability
reporting in the [security policy][].

## Threat model

The August 2026 npm worm ([security notice][]) set the current posture:
compromised maintainer accounts published malicious versions of popular
packages, whose install-time lifecycle scripts executed the payload and
propagated it using harvested credentials. Several of this repository's PR
branches were affected before containment; none reached `main` or production.

The attack paths that matter for this repository:

- **Version resolution**: any install that resolves version ranges can pull a
  freshly published malicious release.
- **Lifecycle scripts**: install-time script execution turns a bad package into
  compromised contributor hosts, CI runners, and build images.
- **Unattended installs**: CI jobs and the Netlify build image install without a
  human watching, as do agent sessions.

## Design decisions

The recurring theme is **fail closed**: when a control can't be enforced, the
install fails rather than proceeding without it.

### Minimize the dependency surface

Every dependency, direct or transitive, is surface the remaining controls must
cover. Unused and convenience dependencies are dropped rather than carried:
removing the unused Netlify CLI more than halved the locked dependency graph and
cut the packages bearing install scripts from seven to three.

### Install from the lock; resolve deliberately

Automated install paths are lock-exact: they reproduce the committed, reviewed
`package-lock.json` and never resolve version ranges. A local `npm install`
follows the lock while it agrees with `package.json`, and rewrites it when the
two disagree; the verification below catches such rewrites. Resolution, the
risky step, is reserved for deliberate dependency updates.

### Resolve only cooled-down releases

Freshly published versions are the attack window: registry-side takedowns of
malicious releases take time. Version resolution ignores releases younger than a
cooldown period, trading a few days of update latency for the time takedowns
need to land.

### Run only reviewed lifecycle scripts

Lifecycle scripts are default-deny: an install runs a package's scripts only
when that exact name and version has been reviewed and allowlisted.
Version-exact entries force a fresh review on every bump of a script-bearing
package: a compromised patch release can't inherit its predecessor's approval.

Review records both outcomes: a needed script is approved, and an unnecessary
one (a shipped prebuilt binary suffices) gets an explicit denial, so silence
always means unreviewed, and unreviewed fails the install. Approvals are
version-exact; denials, which grant nothing, cover the package by name.
Exceptions are named and re-enabled inline at the point of use, never by
weakening the default posture.

### Fail closed on old npm

The cooldown and script-gating controls are `.npmrc` settings that older npm
versions silently ignore: an old npm would install without them and report
success. An npm engines floor with strict engine checking turns that silent
bypass into an install failure.

### Keep vendor auto-installs inert

Netlify runs its own npm install before the build command, outside the scripts
this repository controls. Rather than trust it, the configuration neutralizes
it, and the build command performs the real, contract-following install. Defense
in depth: if Netlify ever stops honoring the constraining flags, `.npmrc` still
gates scripts, and the verification below catches what slips through.

### Verify, don't trust

Inert and lock-exact are verified claims, not assumptions: clean-working-tree
checks fail a build on lock drift or any other Git-visible change, and a local
install that rewrites the lock warns immediately.

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
[openssf]: https://github.com/ossf/package-manager-best-practices/blob/main/published/npm.md
[pnpm]: https://pnpm.io/settings/build
[pnpm defers]: https://pnpm.io/settings/dependency-resolution
[renovate]: https://docs.renovatebot.com/configuration-options/#minimumreleaseage
[RFC #54]: https://github.com/npm/rfcs/blob/main/accepted/0054-make-scripts-install-opt-in.md
[security notice]: https://github.com/open-telemetry/opentelemetry.io/issues/11210
[security policy]: https://github.com/open-telemetry/opentelemetry.io/security/policy
[tuf]: https://theupdateframework.io/docs/security/
[Yarn]: https://yarnpkg.com/advanced/lifecycle-scripts
<!-- prettier-ignore-end -->
