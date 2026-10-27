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

## Who we protect, and from what

- **Visitors to the published site.** The harm: a served page carrying malicious
  script, or install instructions and version pins altered to point at attacker
  code; a docs site is a trust anchor, and developers run what it says. The way
  in: a compromised build or deploy, or one of the few dependencies that ship
  into the built site. Covered by lock-exact installs, the inert Netlify
  auto-install, and review of what lands on `main`.
- **Maintainers and contributors, on their own machines.** The harm: credential
  theft (npm, GitHub, SSH, cloud) and spread to every other project they touch;
  the 2026 npm worm was exactly this. The way in: `npm install` running a fresh
  malicious release's install script, opening a poisoned branch, or an agent
  session following hostile text with the maintainer's tools. Covered by the
  release cooldown, the `allowScripts` allowlist, no bare `npx`, and treating
  fetched text as data.
- **The project and its other repositories.** The harm: stolen job tokens and
  bot credentials, which reach beyond this repository (the August 2026 incident
  did), and a poisoned artifact reaching visitors. The way in: unattended
  installs on GitHub Actions runners and the Netlify build image, and the fact
  that PR builds run the PR's own files, so a change to `.npmrc`,
  `netlify.toml`, `allowScripts`, or the install scripts is itself the attack.
  Covered by the supply-chain audit, which pins that surface, workflow
  permissions, branch protection, and required review.
- **Reporters, and the users of whatever they report on.** The harm: a report
  disclosed, or left to wait while it belongs to another component. Covered by
  keeping private reports private and rerouting them fast.

Three kinds of threat, which is what lets you calibrate: automated supply-chain
worms, fast and credential-harvesting, entering through fresh installs (the
cooldown and script gates are aimed at them); targeted attackers who would use a
developer site as a watering hole or intercept the toolchain (rare, high stakes:
the escalate card); and prompt-injection campaigns against maintainers' agents.
Almost no advisory you receive is any of these; it is a bug in build tooling
that nobody is exploiting against a static site. That asymmetry is why the safe
default is to **not rush** and to **not weaken the controls**, rather than to
add security review. The controls and their enforcement: [Supply-chain
controls][]; the threat model behind them: [Supply-chain security][].

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
