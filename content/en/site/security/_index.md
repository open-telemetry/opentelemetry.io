---
title: Security
description: >-
  Security notifications for website maintainers: how to assess one, the
  defaults to follow, and when to ask
weight: 50
cSpell:ignore: zizmor
---

A security notification has reached you, a website maintainer: an alert email, a
bot PR, a report, or a message that a package is compromised. You don't need a
security background to handle it. You need three moves, in order:

1. [Assess what arrived](#assess) and where it runs, with an agent's help if you
   like.
2. [Follow the defaults](#defaults).
3. [When unsure, ask](#escalate) a more experienced maintainer.

The three sections below are those moves; the pages they link to carry the
detail for the step you pick.

## Assess what arrived {#assess}

Find the item that matches what you're holding. The most common kinds come
first, the urgent ones last. For the questions behind "where does it run", start
with [Triage an advisory][]; an agent can do much of the reading for you ([Use
AI agents for security reading][]).

- **A Renovate PR with a routine title**, typically on Monday morning.
  - Means: A version bump that has waited out the release cooldown. Age is a
    filter, not a review.
  - Do: Review and merge when green, per [Review dependency PRs][].
- **An email from Dependabot, a PR by `dependabot[bot]`, or a Renovate PR with
  `[SECURITY]` in its title.**
  - Means: A known bug (CVE or GHSA) in a package in the lock, usually with a
    fix version.
  - Do: Assess its urgency with [Triage an advisory][]. A PR, when one comes, is
    the fix path; leave the alert open and write your reasoning on the PR.
- **A Node.js security release announcement.**
  - Means: The `.nvmrc` pin will need a bump.
  - Do: Renovate brings it after its cooldown; review that PR.
- **A Hugo security release announcement.**
  - Means: The `hugo-extended` pin, which is [bumped by hand][Hugo], will need a
    bump.
  - Do: Raise it with the other maintainers.
- **A private vulnerability report**, in the repository's **Security** tab or by
  email to the maintainers.
  - Means: Someone reports a problem. Often it concerns another OpenTelemetry
    component, not the website.
  - Do: Acknowledge within a few days; reroute what isn't ours; keep the
    report's contents private. If it describes a real website problem, ask now.
- **A code scanning alert.**
  - Means: A [zizmor][] or [Scorecard][] finding about the repository's
    workflows or settings.
  - Do: Triage it like a bug report, unless it flags a workflow that holds
    secrets or write permissions: raise that the same day.
- **A secret scanning alert.** Urgent.
  - Means: A credential may be in the repository.
  - Do: Ask now.
- **A message that a package is malicious or that its maintainer's account was
  compromised**, from the news or Slack. Urgent.
  - Means: Not a bug. The package itself is the attack, which makes this
    different from everything above.
  - Do: Check whether an affected version is installed anywhere (question 2 of
    [Triage an advisory][]). If it is: don't install anything, stop merging, ask
    now. If it isn't anywhere: write down the evidence and stop.

If nothing matches, ask before acting.

## Follow the defaults {#defaults}

- Let the bot PRs bring fixes; most advisories are bugs in build tooling that an
  attacker has little way to reach, and the triage questions confirm that case
  by case.
- A fix younger than 7 days can wait, unless the package reaches visitors or
  untrusted input. If you think it can't wait, ask.
- Never change `.npmrc`, `netlify.toml`, `allowScripts`, the install scripts, or
  the audit test to make a failing check pass. The one routine edit is the
  version-exact `allowScripts` approval the audit names; anything else, ask.
- "Development-only" and "the fix has aged" are reasons for calm, not proof of
  safety.
- Write down what you decided and why, where the next person will look: the PR,
  or an issue.

## When unsure, ask {#escalate}

Unsure is the default, and these always count as unsure:

- A compromise notice naming a package that is installed anywhere.
- A secret scanning alert.
- A private report describing a real website problem, such as injected script in
  a served page or a leaked credential.
- A CI run or Netlify deploy doing something you don't recognize.
- A PR that changes `.npmrc`, `netlify.toml`, the install scripts, or the audit
  test, or that loosens `allowScripts`.

Who: The other website maintainers, through the
`@open-telemetry/docs-maintainers` team on GitHub or the `#otel-comms` channel
on [CNCF Slack][]; for anything that looks like a compromise, also the
OpenTelemetry security contacts in the [security policy][].

Match the channel to the secrecy. The contents of a private report, a leaked
credential, or anything else not yet public go to the maintainers privately,
through the report's own advisory thread or the maintainers' private channel,
never to a public channel, issue, or PR. The public record says only what is
already public.

## Who we protect, and from what

For the maintainer who keeps this section: what the controls are for.

- **Visitors to the published site.** The harm: A served page carrying malicious
  script, or install instructions and version pins altered to point at attacker
  code; a docs site is a trust anchor, and developers run what it says. The way
  in: a compromised build or deploy, or one of the few dependencies that ship
  into the served pages, mainly the theme's. Defended by lock-exact installs,
  the inert Netlify auto-install, and review of what lands on `main`.
- **Maintainers and contributors, on their own machines.** The harm: Credential
  theft (npm, GitHub, SSH, cloud) and spread to every other project they touch,
  which is how the August 2026 npm worm spread. The way in: `npm install`
  running a fresh malicious release's install script, opening a poisoned branch,
  or an agent session following hostile text with the maintainer's tools.
  Defended by the release cooldown, the `allowScripts` allowlist, no bare `npx`,
  and treating fetched text as data.
- **The project and its other repositories.** The harm: Stolen job tokens and
  bot credentials, which reach beyond this repository, and a poisoned artifact
  reaching visitors. The way in: Unattended installs on GitHub Actions runners
  and the Netlify build image, and the fact that PR builds run the PR's own
  files, so a PR that changes `.npmrc`, `netlify.toml`, `allowScripts`, or the
  install scripts can be the attack. Defended by the supply-chain audit, which
  pins that surface, and by workflow permissions, branch protection, and
  required review.
- **Reporters, and the users of whatever they report on.** The harm: A report
  disclosed, or left to wait while it belongs to another component. Defended by
  keeping private reports private and rerouting them fast.

Three kinds of threat: automated supply-chain worms, fast and
credential-harvesting, entering through fresh installs (the cooldown and script
gates are aimed at them); targeted attackers who would use a developer site to
reach developers or tamper with the toolchain (rare, high stakes: the ask-now
list); and prompt-injection campaigns against maintainers' agents. Almost no
advisory you receive is any of these. That asymmetry is why the defaults are to
not rush and to not weaken the controls. The controls and their enforcement:
[Supply-chain controls][]; the threat model behind them: [Supply-chain
security][].

## Pages in this section

- [Triage an advisory][]: The questions that decide urgency, the routes they
  lead to, what the cooldown does and doesn't establish, and worked examples.
- [Review dependency PRs][]: The pre-merge checklist for Renovate and Dependabot
  PRs.
- [Use AI agents for security reading][]: What an agent can and can't establish,
  and prompts to paste.

Related, elsewhere: The controls and update recipes in [Dependency
management][]; the test that verifies them in [Supply-chain audit design][];
workflow triggers and token privileges in [CI workflows][]; how to report a
vulnerability in the website, in the [security policy][].

<!-- prettier-ignore-start -->
[CI workflows]: ../build/ci-workflows/#security-model
[CNCF Slack]: https://slack.cncf.io/
[Dependency management]: ../build/dependencies/
[Hugo]: ../build/dependencies/#hugo
[Review dependency PRs]: ./dependency-prs/
[Scorecard]: https://github.com/ossf/scorecard
[security policy]: https://github.com/open-telemetry/opentelemetry.io/security/policy
[Supply-chain audit design]: ../design/supply-chain-audit/
[Supply-chain controls]: ../build/dependencies/#controls
[Supply-chain security]: ../design/supply-chain-security/
[Triage an advisory]: ./triage/
[Use AI agents for security reading]: ./agent-review/
[zizmor]: https://docs.zizmor.sh/
<!-- prettier-ignore-end -->
