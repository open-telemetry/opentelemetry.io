---
title: Review dependency PRs
description: >-
  Check a Renovate or Dependabot PR before merging it: the lock delta, the audit
  result, and the lines you never edit to get to green.
weight: 20
---

A bot PR has arrived: Renovate's routine Monday bump, a Renovate `[SECURITY]`
PR, or a Dependabot security update. The procedures for updating dependencies
and reading the lock are in [Updating dependencies][]; this is the short
checklist for the merge decision. Its conditions are necessary, not sufficient:
when something doesn't add up, [ask][].

## Merge only when

- **The lock delta contains only the packages the PR lists**, plus what they
  require. Renovate's grouped PRs ("all minor versions") list them in the PR
  body, not the title. Anything else: ask.
- **CI is green, including the supply-chain audit.** If the audit fails naming
  `allowScripts`, the PR bumps a package with an install script, and the fix is
  a reviewed, [version-exact approval][], never a loosened assertion or
  `.npmrc`. Leave these PRs to someone who can review the install script.
- **For a Dependabot security update, the fix matches the advisory**: the fix
  version's release notes name the vulnerability, and the changed packages are
  the ones the alert names. These PRs [bypass the cooldown][cooldown] by design,
  so check the fix version's age yourself: younger than 7 days, the
  [default][defaults] is to let it age.

## Never, to get to green

Never change `.npmrc`, `netlify.toml`, `allowScripts`, the install scripts, or
the audit test just to make a failing check pass: each is a control, and the
failing check is the point. The one routine edit is the version-exact
`allowScripts` approval the audit names, made after reviewing that version's
install script. PR builds, on CI and in deploy previews, run the PR's own copy
of these files unattended, so a PR that changes them in any other way is one to
[ask][] about.

<!-- prettier-ignore-start -->
[ask]: ../#escalate
[cooldown]: ../triage/#cooldown
[defaults]: ../#defaults
[Updating dependencies]: ../../build/dependencies/#updating
[version-exact approval]: ../../build/dependencies/#script-bearing-packages
<!-- prettier-ignore-end -->
