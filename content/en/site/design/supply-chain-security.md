---
title: Supply-chain security
description: >-
  Threat model and rationale behind the site's npm dependency supply-chain
  controls.
weight: 20
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

- **Version resolution** — any install that resolves version ranges can pull a
  freshly published malicious release.
- **Lifecycle scripts** — install-time script execution turns a bad package into
  compromised contributor hosts, CI runners, and build images.
- **Unattended installs** — CI jobs and the Netlify build image install without
  a human watching, as do agent sessions.

## Design decisions

The recurring theme is **fail closed**: when a control can't be enforced, the
install fails rather than proceeding without it.

### Install from the lock; resolve deliberately

Every install path is lock-exact: it reproduces the committed, reviewed
`package-lock.json` and never resolves version ranges. Resolution — the risky
step — happens only in deliberate dependency-update operations.

### Resolve only cooled-down releases

Freshly published versions are the attack window: registry-side takedowns of
malicious releases take time. Version resolution ignores releases younger than a
cooldown period, trading a few days of update latency for the time takedowns
need to land.

### Run only reviewed lifecycle scripts

Lifecycle scripts are default-deny: an install runs a package's scripts only
when that exact name and version has been reviewed and allowlisted.
Version-exact entries force a fresh review on every bump of a script-bearing
package — a compromised patch release can't inherit its predecessor's approval.

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

<!-- prettier-ignore-start -->
[security notice]: https://github.com/open-telemetry/opentelemetry.io/issues/11210
[security policy]: https://github.com/open-telemetry/opentelemetry.io/security/policy
<!-- prettier-ignore-end -->
