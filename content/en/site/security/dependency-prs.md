---
title: Reviewing dependency PRs
description: >-
  Check a Renovate or Dependabot PR before merging it: the lock delta, the audit
  result, and the lines you never edit to get to green.
weight: 20
---

A bot PR has arrived: Renovate's routine Monday bump, a Renovate `[SECURITY]`
PR, or a Dependabot security update. The procedures for updating dependencies
and reading the lock are in [Updating dependencies][]; this is the short
checklist for the merge decision.

## Safe to merge when

- **The lock delta contains only the packages the PR title names**, plus what
  they require. Anything else: ask.
- **CI is green, including the supply-chain audit.** If the audit fails naming
  `allowScripts`, the PR bumps a package with an install script, and the fix is
  a reviewed, [version-exact approval][], never a loosened assertion or
  `.npmrc`. Leave these PRs to someone who can review the install script.
- **For a Dependabot security update, the fix matches the advisory**: the fix
  version's release notes name the vulnerability, and the changed packages are
  the ones the alert names. These PRs [bypass the cooldown][cooldown] by design,
  so you are the only gate. If anything is unclear, wait; for a build-time
  dependency, 7 days of waiting is the default-safe move.

## Never, to get to green

Never edit `.npmrc`, `allowScripts`, `netlify.toml`, or the audit test so that a
check passes. PR builds, on CI and in deploy previews, run the PR's own files
unattended, so those lines are the attack path, not formatting: each is a
control, and the failing check is the point. A PR that touches them is one to
[escalate][].

<!-- prettier-ignore-start -->
[cooldown]: ../triage/#cooldown
[escalate]: ../#escalate
[Updating dependencies]: ../../build/dependencies/#updating
[version-exact approval]: ../../build/dependencies/#script-bearing-packages
<!-- prettier-ignore-end -->
