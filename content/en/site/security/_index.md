---
title: Security
description: >-
  What website maintainers do with a security notification, and what the
  repository's security controls protect
weight: 50
cSpell:ignore: zizmor
---

Handling a security notification takes three steps, in order:

1. [Assess what arrived](#assess) and where it runs.
2. [Follow the defaults](#defaults).
3. [When unsure, ask](#escalate) another maintainer.

The linked pages carry the detail; [Who we protect, and from what](#who) is the
background the steps rest on.

## Assess what arrived {#assess}

Match what arrived to an item below, common kinds first, urgent ones last. An
agent can do much of the reading ([Use AI agents for security reading][]).

- **A Renovate PR with a routine title**, typically on Monday morning.
  - Means: A version bump that has waited out the release cooldown.
  - Do: Review and merge when green ([Review dependency PRs][]).
- **An email from Dependabot, a PR by `dependabot[bot]`, or a Renovate PR with
  `[SECURITY]` in its title.**
  - Means: A known bug (CVE or GHSA) in a package in the lock, usually with a
    fix version.
  - Do: Assess its urgency ([Triage an advisory][]); a PR, when one comes, is
    the fix path. Leave the alert open.
- **A Node.js security release announcement.**
  - Means: The `.nvmrc` pin needs a bump.
  - Do: Renovate brings it after its cooldown; review that PR.
- **A Hugo security release announcement.**
  - Means: The `hugo-extended` pin needs a bump, [by hand][Hugo].
  - Do: Raise it with the other maintainers.
- **A private vulnerability report**, in the repository's **Security** tab or by
  email to the maintainers.
  - Means: Someone reports a problem, often in another OpenTelemetry component.
  - Do: Acknowledge within a few days; reroute what isn't ours; keep the
    contents private. A real website problem: ask now.
- **A code scanning alert.**
  - Means: A [zizmor][] or [Scorecard][] finding about the workflows or
    repository settings.
  - Do: Triage it like a bug report. A workflow holding secrets or write
    permissions: raise it the same day.
- **A secret scanning alert.** Urgent.
  - Means: A credential may be in the repository.
  - Do: Ask now.
- **A message that a package is malicious or its maintainer's account
  compromised**, from the news or Slack. Urgent.
  - Means: Not a bug: the package itself is the attack.
  - Do: Check whether an affected version is installed anywhere ([Triage an
    advisory][], question 2). Installed: don't install anything, stop merging,
    ask now. Not installed: write down the evidence and stop.

If nothing matches, ask before acting.

## Follow the defaults {#defaults}

- Let the bot PRs bring fixes: most advisories are bugs in build tooling that an
  attacker has little way to reach.
- A fix younger than 7 days can wait, unless the package reaches visitors or
  untrusted input. If it can't wait, ask.
- Never change the install controls (`.npmrc`, `netlify.toml`, `allowScripts`,
  the install scripts, the audit test) to make a failing check pass. The one
  routine edit is the version-exact `allowScripts` approval the audit names.
- "Development-only" and "the fix has aged" are reasons for calm, not proof of
  safety.
- Write down what you decided and why, on the PR or an issue.

## When unsure, ask {#escalate}

Unsure is the default. These always count:

- A compromise notice naming an installed package.
- A secret scanning alert.
- A private report describing a real website problem.
- A CI run or Netlify deploy doing something you don't recognize.
- A PR that changes an install control, or loosens `allowScripts`.

Who: The other website maintainers, through the
`@open-telemetry/docs-maintainers` team on GitHub or the `#otel-comms` channel
on [CNCF Slack][]; for anything that looks like a compromise, also the
OpenTelemetry security contacts in the [security policy][].

Match the channel to the secrecy: a private report's contents, a leaked
credential, or anything else not yet public goes to the maintainers privately
(the report's advisory thread, the maintainers' private channel), never to a
public channel, issue, or PR.

## Who we protect, and from what {#who}

Background for whoever keeps this section; the steps above don't depend on it.

- **Visitors to the published site.** The harm: A served page carrying malicious
  script, or install instructions altered to point at attacker code; developers
  run what a docs site says. The way in: A compromised build or deploy, or one
  of the few dependencies that ship into the served pages, mainly the theme's.
  Defended by lock-exact installs, the inert Netlify auto-install, and review of
  what lands on `main`.
- **Maintainers and contributors, on their own machines.** The harm: Credential
  theft and spread to every other project they touch, which is how the August
  2026 npm worm spread. The way in: `npm install` running a fresh malicious
  release's install script, opening a poisoned branch, or an agent session
  following hostile text. Defended by the release cooldown, the `allowScripts`
  allowlist, no bare `npx`, and treating fetched text as data.
- **The project and its other repositories.** The harm: Stolen job tokens and
  bot credentials, which reach beyond this repository, and a poisoned artifact
  reaching visitors. The way in: Unattended installs on CI runners and the
  Netlify build image, which run a PR's own files, so a PR that changes an
  install control can be the attack. Defended by the supply-chain audit, which
  pins that surface, and by workflow permissions, branch protection, and
  required review.
- **Reporters, and the users of what they report on.** The harm: A report
  disclosed, or left waiting while it belongs to another component. Defended by
  keeping private reports private and rerouting them fast.

Three kinds of threat: supply-chain worms, fast and credential-harvesting,
entering through fresh installs (the cooldown and script gates are aimed at
them); targeted attackers using a developer site to reach developers or tamper
with the toolchain (rare, high stakes: the ask-now list); and prompt injection
against maintainers' agents. The controls and their enforcement: [Supply-chain
controls][]; the threat model behind them: [Supply-chain security][].

## Pages in this section

- [Triage an advisory][]: Urgency questions, routes, the cooldown, worked
  examples.
- [Review dependency PRs][]: The pre-merge checklist.
- [Use AI agents for security reading][]: Rules and prompts.

Related, elsewhere: The controls and update recipes in [Dependency
management][]; the test that verifies them in [Supply-chain audit design][];
workflow triggers and token privileges in [CI workflows][]; reporting a
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
