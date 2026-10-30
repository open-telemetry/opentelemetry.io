---
title: Triage an advisory
description: >-
  Work out how urgent a vulnerability advisory is for the website: let the bot
  path bring the fix, raise it today, or ask now.
weight: 10
---

You have an advisory for a package the website depends on, from a Dependabot
alert, a `[SECURITY]` PR, or a release announcement. Answer the questions below
in order, then take the route they point to. When a question doesn't resolve,
that is the moment to [ask][].

## Five questions

1. **Bug or compromise?** Go by what the notice describes, not by its ID: a GHSA
   can name either. A bug is something an attacker could trigger under some
   condition; a compromise (a malicious release, a stolen publish token) means
   the package itself is the attack. Questions 3 and 4 decide how long a bug can
   wait; a compromise of an installed package cannot.
2. **Is an affected version installed anywhere?** On an up-to-date `main`, run
   `npm ls --all --package-lock-only PACKAGE_NAME`, which reads the lock rather
   than whatever happens to be installed; replace _`PACKAGE_NAME`_ with the
   package named in the advisory. A package can appear more than once at
   different versions, so check every copy listed. The theme's dependencies,
   which include most of what ships to visitors, have their own lock,
   `themes/docsy/theme/package-lock.json`: search it too. For a compromise
   notice, also look at open dependency PRs. Nothing affected anywhere: write
   down the evidence and stop.
3. **Where does it run?** Three very different places:
   - **In visitors' browsers**: JavaScript and CSS that end up in the served
     pages. A few dependencies do ship there, mainly the theme's (Bootstrap,
     Font Awesome) and the search index; an advisory on one of those affects
     users.
   - **At build time**: Node, npm, Hugo, linters, Puppeteer, and most other
     dependencies run only while building, linting, or testing, on CI runners,
     the Netlify build image, and maintainers' machines. A bug there needs a way
     for untrusted input to reach it (question 4).
   - **Nowhere**: a dependency that nothing runs, in CI or locally. Fix it
     eventually; no urgency.
4. **Does untrusted input reach it?** A linter reading the repository's own
   files on `main`: no. The same linter in a PR check reads the contributor's
   files, so a bug an input can trigger (a hang, a crash) costs that PR's own CI
   run and little more, while code execution would matter. A script that fetches
   third-party data or renders external pages: yes. For most advisories the
   honest answer is "build time only, nothing untrusted reaches it", which is a
   reason to take the normal path, not a finding that the package is safe.
5. **Is a fixed version available, and has it aged 7 days?** The advisory names
   the fix version; `npm view PACKAGE_NAME time` shows publish dates. A bot PR
   usually brings an aged fix (Renovate for direct dependencies, Dependabot for
   transitive ones); when none arrives, for example because a parent's version
   range blocks the fix, the route is manual: [Security updates][]. A fix
   younger than 7 days: Renovate holds it back, deliberately, but a Dependabot
   security PR can bring it at once. The [default][defaults] is to let it age.

## Routes

- **Bug, build time only, nothing untrusted reaches it** (the common case): let
  the bot PR bring the fix. Write one line of reasoning on the PR when it comes.
  No weekend work, no cooldown exception.
- **Bug reaching visitors, or reachable by untrusted input**: raise it with the
  other maintainers today. If the fix has aged, take the normal path; if it
  hasn't, that is a decision not to take alone: [ask][].
- **Compromise, an affected version installed anywhere**: don't install
  anything, stop merging, [ask now][ask]. Lock-exact installs and the cooldown
  make this rare, which is exactly why it deserves the attention when it
  happens.
- **Compromise, nothing affected installed**: write down the evidence and stop.
  Review any later bot PR for a cleaned-up release like any other.

## The cooldown: what it does and doesn't establish {#cooldown}

- The cooldown filters **freshly published poison**: malicious releases are
  usually detected and pulled within days. It says nothing about **bugs**: a fix
  for a known bug waits 7 days too, and for build-time dependencies that wait is
  accepted.
- **Dependabot security updates bypass every cooldown by design**, so a
  Dependabot PR can carry a version only hours old; nothing but the reviewing
  maintainer checks its age. The [default][defaults] applies: let it age unless
  the package reaches visitors or untrusted input, and ask if you think it can't
  wait.
- Installing a release younger than 7 days on purpose (a [cooldown exemption][])
  is a security decision. Don't take it alone.
- "Development-only" and "the fix has aged" together establish only this: a
  known bug in build tooling, probably not freshly poisoned. Reasons for calm,
  not proof of safety.

## Worked examples

- **`markdown-it` denial-of-service advisories, October 2026.** Two copies in
  the lock: the direct dependency, fixed by a Renovate `[SECURITY]` PR
  ([#12296][]), and the linter's own copy inside `markdownlint-cli2`, which
  waits for that tool's next release. Build time, the repository's own Markdown:
  the normal path, no exception.
- **Node.js 24.22.1 security release.** Toolchain, build time. The one
  code-execution fix needs a hostile server answering a Node HTTP client, and
  the build's clients talk to a few known hosts (package registries, GitHub). It
  rides Renovate's normal schedule for the `.nvmrc` pin.
- **A private vulnerability report** that turned out to be a question about an
  OpenTelemetry component the website doesn't own: answered, rerouted, closed.
  Reports often reach the wrong project; a reply is still owed within days.
- **An advisory with no fixed version** (`braces`, 2026): build time, trusted
  input, accepted as a residual and written down as such; the advisory was later
  withdrawn upstream. Writing down the acceptance was the whole job.

<!-- prettier-ignore-start -->
[#12296]: https://github.com/open-telemetry/opentelemetry.io/pull/12296
[ask]: ../#escalate
[cooldown exemption]: ../../build/dependencies/#transitive-refresh
[defaults]: ../#defaults
[Security updates]: ../../build/dependencies/#security-updates
<!-- prettier-ignore-end -->
