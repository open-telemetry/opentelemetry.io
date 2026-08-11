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
the install fails rather than proceeding without it. Each decision answers an
attack path, ordered roughly by when it acts; the closing table maps decisions
to their enforcement.

- _Every dependency, direct or transitive, is surface an attacker can reach._
  - **Minimize dependencies**: unused and convenience dependencies are dropped
    rather than carried.
- _An install that resolves version ranges can pull a freshly published
  malicious release._
  - **Install from the lock**: installs are [lock-exact][install contracts],
    reproducing the committed, reviewed [`package-lock.json`][]. The one
    exception: a local `npm install` can rewrite a disagreeing lock; the last
    decision below catches such rewrites.
  - **Resolve deliberately**: version resolution happens only in [deliberate
    dependency updates][], never as an install side effect.
  - **Resolve only cooled-down releases**: even deliberate resolution ignores
    releases younger than a [cooldown period][cooldown]; registry-side takedowns
    of malicious releases need a few days to land.
- _A package's install-time scripts run attacker code on contributor hosts and
  build machines: the worm's payload path._
  - **Run only reviewed lifecycle scripts**: [lifecycle scripts][] are
    [default-deny][allowlist]. Approvals are version-exact, so a compromised
    patch release can't inherit its predecessor's approval; reviews record
    denials too, so silence always means unreviewed; exceptions are named and
    re-enabled inline at the point of use, never by weakening the default
    posture.
- _Netlify's [own npm install][netlify-deps] runs unattended, outside the
  scripts this repository controls, and can't be disabled._
  - **Neutralize the auto-install**: the configuration [neutralizes
    it][inert auto-install]; the build command performs the [real
    install][install contracts].
- _A control that silently stops being enforced is worse than none._
  - **Fail closed on old npm**: installs fail rather than proceed when the
    active npm is too old to enforce the `.npmrc` settings.
  - **Verify, don't trust**: inert and lock-exact are verified claims, not
    assumptions.

Enforcement at a glance:

| Decision                            | Enforced by                                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Minimize dependencies               | Maintainer judgment in dependency review; no mechanical control                                                  |
| Install from the lock               | `npm ci` in every [install contract][install contracts]                                                          |
| Resolve deliberately                | Convention, backed by the lock: an unexpected resolution rewrites it, which verification flags                   |
| Resolve only cooled-down releases   | The [cooldown][] control, for npm and Renovate alike                                                             |
| Run only reviewed lifecycle scripts | The [allowlist][] in strict mode; unreviewed fails the install                                                   |
| Neutralize the auto-install         | The [inert auto-install][] control                                                                               |
| Fail closed on old npm              | The [npm engines floor][] with strict engine checking                                                            |
| Verify, don't trust                 | [Clean-working-tree checks][install contracts] failing the build; a `postinstall` warning on local lock rewrites |

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
