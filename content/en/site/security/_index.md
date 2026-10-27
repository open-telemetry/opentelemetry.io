---
title: Security
description: >-
  Security notifications for website maintainers: what each kind means, what to
  do about it, and when to escalate
weight: 50
---

You maintain the website, and a security notification has reached you: an alert
email, a bot PR, a report, or a message that a package is compromised. This page
tells you what it is and what to do next; the pages it links to carry the detail
for the step you pick. You don't need a security background. The safe default is
usually to let the bot path bring the fix, and the rare urgent cases are listed
below, [Escalate now](#escalate).

## What the repository already enforces

Installs are lock-exact, version resolution waits out a 7-day cooldown, and
dependency install scripts run only when approved by exact version; a
supply-chain audit test checks all of this on every CI run. The controls and
their enforcement: [Supply-chain controls][]; the threat model behind them:
[Supply-chain security][]. So your job is not to add security review. It is to
**not weaken these controls** and to **not rush**.

## What arrived?

Find the item that matches what you're holding; its Do line says where to go.
The most common kinds come first, the urgent ones last.

- **A Renovate PR with a routine title**, typically on Monday morning.
  - Means: a version bump that has aged 7 or more days.
  - Do: review and merge when green, per [Reviewing dependency PRs][].
- **An email from Dependabot, a PR by `dependabot[bot]`, or a Renovate PR titled
  `[SECURITY]`.**
  - Means: a known bug (CVE or GHSA) in a package in the lock, with a fix
    version.
  - Do: decide its urgency with [Triaging an advisory][]; the PR is the fix
    path. Leave the alert open with a note; don't dismiss it.
- **A Node.js or Hugo security release announcement.**
  - Means: a toolchain pin will need a bump.
  - Do: Renovate brings it after the cooldown; ride that PR.
- **A private vulnerability report**, in the repository's **Security** tab or by
  email to the maintainers.
  - Means: someone reports a problem. Often it concerns another OpenTelemetry
    component, not the website.
  - Do: acknowledge within a few days; reroute what isn't ours; keep the
    report's text private. If it describes a real website problem, escalate.
- **A code scanning alert.**
  - Means: a flagged pattern in the site's own code.
  - Do: triage it like a bug report.
- **A secret scanning alert.** Urgent.
  - Means: a credential may be in the repository.
  - Do: escalate now.
- **A message that a package is malicious or that its maintainer's account was
  compromised**, from the news or Slack. Urgent.
  - Means: not a bug. The package itself is the attack, which makes this
    different from everything above.
  - Do: check whether the package is in the lock at an affected version with
    `npm explain PACKAGE_NAME` (the first two questions of [Triaging an
    advisory][] walk you through it). If it is: don't install anything, stop
    merging, escalate now. If it isn't: comment with the evidence and stop.

If nothing matches, ask before acting.

## Escalate now {#escalate}

Before anything else, escalate for any of:

- a compromise notice naming a package in the lock;
- a secret scanning alert;
- a private report describing a real website problem, such as injected script in
  a served page or a leaked credential;
- a CI run or Netlify deploy doing something you don't recognize;
- a PR touching `allowScripts`, `.npmrc`, `netlify.toml`, or the install
  scripts.

Who: the other website maintainers first, through the
`@open-telemetry/docs-maintainers` team on GitHub or the `#otel-comms` channel
on [CNCF Slack][]; for anything that looks like a compromise, also the
OpenTelemetry security contacts in the [security policy][]. Write it down twice:
a comment on the alert or PR, so the next person sees the reasoning, and a
thread in the Slack channel.

Whatever happens, never bypass the cooldown, approve a new install script, or
loosen the audit on your own.

## Pages in this section

- [Triaging an advisory][]: the five questions that decide urgency, the routes
  they lead to, what the cooldown does and doesn't establish, and worked
  examples.
- [Reviewing dependency PRs][]: the safe-to-merge checklist for Renovate and
  Dependabot PRs.
- [Using AI agents for security reading][]: what an agent can and can't
  establish, and prompts to paste.

Elsewhere in the site docs: the controls and update recipes in [Dependency
management][], the test that verifies them in [Supply-chain audit design][],
workflow triggers and token privileges in [CI workflows][], and how to report a
vulnerability in the website in the [security policy][].

<!-- prettier-ignore-start -->
[CI workflows]: ../build/ci-workflows/#security-model
[CNCF Slack]: https://slack.cncf.io/
[Dependency management]: ../build/dependencies/
[Reviewing dependency PRs]: ./dependency-prs/
[security policy]: https://github.com/open-telemetry/opentelemetry.io/security/policy
[Supply-chain audit design]: ../design/supply-chain-audit/
[Supply-chain controls]: ../build/dependencies/#controls
[Supply-chain security]: ../design/supply-chain-security/
[Triaging an advisory]: ./triage/
[Using AI agents for security reading]: ./agent-review/
<!-- prettier-ignore-end -->
