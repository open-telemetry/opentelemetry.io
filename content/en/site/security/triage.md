---
title: Triaging an advisory
description: >-
  Decide how urgent a vulnerability advisory is for the website: defer to the
  bot path, raise it today, or escalate now.
weight: 10
---

You have a bug advisory (a CVE or GHSA) for a package the website depends on,
from a Dependabot alert, a `[SECURITY]` PR, or a release announcement. Answer
the five questions below, then take the route they point to. A compromise notice
(a malicious release, a stolen publish token) is a different thing: for that, go
straight to [Escalate now][].

## Five questions

1. **Bug or compromise?** A CVE or GHSA describes a bug an attacker could
   trigger under some condition. A compromise notice means the package itself is
   the attack. Bugs in build tooling can wait for the normal path; compromises
   cannot.
2. **Is the affected version in the lock?** Run `npm explain PACKAGE_NAME`, or
   read the Dependabot alert's affected-version line, to see the installed
   version and who depends on it. Replace _`PACKAGE_NAME`_ with the package
   named in the advisory. Not in the lock, or already at a fixed version: close
   the loop with a comment and stop.
3. **Where does it run?** Three very different places:
   - **In visitors' browsers**: code that ends up in the pages the site serves.
     Almost no npm dependency does; the site is static HTML, CSS, and JavaScript
     built ahead of time. If a package does ship into the built site, treat the
     advisory as affecting users.
   - **At build time**: Node, npm, Hugo, linters, Puppeteer, and nearly every
     other dependency run only while building, linting, or testing, on CI
     runners, Netlify's build image, and maintainers' machines. A bug there
     needs a way for untrusted input to reach it (question 4).
   - **Nowhere**: a development dependency that only a script nobody runs in CI
     references. Fix it eventually; no urgency.
4. **Does untrusted input reach it?** A Markdown linter parsing the repository's
   own files: no. A script that fetches third-party registry metadata or renders
   arbitrary external pages: yes. The site's threat model is build-time, so for
   most advisories the honest answer is "no untrusted input, build-time only,
   low urgency". That is a reason to take the normal path, not a declaration
   that the package is safe.
5. **Is a fixed version available, and has it aged 7 days?** The advisory names
   the fix version; `npm view PACKAGE_NAME time` shows publish dates. If the fix
   is older than 7 days, Renovate or Dependabot will bring it, or already has.
   If it is younger, the cooldown holds it back, deliberately.

## Routes

- **Bug, build-time, no untrusted input** (the common case): defer to the bot
  PR. Leave a one-line comment on the alert saying so. No weekend work, no
  cooldown exception.
- **Bug reaching visitors, or reachable by untrusted input**: raise it with the
  other maintainers the same day. Fix on the normal path if the fix has aged;
  otherwise ask for a [vetted exception](#cooldown).
- **Compromise notice, package in the lock at an affected version**: don't
  install anything, stop merging, [escalate now][]. Lock-exact installs and the
  cooldown make this rare, which is exactly why it deserves the escalation when
  it happens.
- **Compromise notice, package not in the lock at that version**: comment with
  the `npm explain` evidence and stop. Expect a bot PR for a cleaned-up release
  later; review it like any other.

## The cooldown: what it does and doesn't establish {#cooldown}

- The cooldown filters **freshly published poison**: malicious releases are
  usually detected and pulled within days. It says nothing about **bugs**: a CVE
  fix waits 7 days too, and for build-time dependencies that wait is accepted.
- **Dependabot security updates bypass every cooldown by design**, so a
  Dependabot PR can carry a version only hours old. The reviewing maintainer is
  the only gate there; the checklist in [Reviewing dependency PRs][] is the
  minimum. If anything about such a PR is unclear, **wait**: for a build-time
  dependency, waiting 7 days is the default-safe move, not negligence.
- Installing a release younger than 7 days on purpose (a [cooldown exemption][])
  is a security decision. Don't take it alone; ask.
- "Development-only" and "cooldown passed" together establish only this: a known
  bug in build tooling, probably not freshly poisoned. They are reasons for
  calm, not evidence of safety.

## Worked examples

- **`markdown-it` denial-of-service advisories (October 2026).** A build-time
  linter parsing the repository's own Markdown: bug, build-time, trusted input.
  Routed to the normal path; the fix arrived through a `markdownlint-cli2`
  release after its cooldown. No exception requested.
- **Node.js 24.22.1 security release.** Toolchain, build-time; the one
  code-execution fix needed a hostile server answering a Node HTTP client, which
  only one script in the repository has. Rode Renovate's normal schedule.
- **A private vulnerability report** that turned out to be a question about an
  OpenTelemetry component the website doesn't own: answered, rerouted, closed.
  Reports often reach the wrong project; a reply is still owed within days.
- **An advisory with no fixed version** (`braces`, 2026): accepted as a
  documented residual (build-time, trusted input), then withdrawn upstream.
  Documenting the acceptance was the whole job.

<!-- prettier-ignore-start -->
[cooldown exemption]: ../../build/dependencies/#transitive-refresh
[Escalate now]: ../#escalate
[Reviewing dependency PRs]: ../dependency-prs/
<!-- prettier-ignore-end -->
