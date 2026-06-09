---
title: Helping localization teams merge their own PRs
custodian: [Patrice Chalin](https://github.com/chalin)
status: See "Status details" section below.
cSpell:ignore: dyladan
---

> **Plan conventions.** This plan is kept intentionally lean and free of design
> and implementation details, except in forward-looking appendices. For status,
> see [Status details](#status-details).

## Context

This work is in support of [Website Localizations: Steps forward to make teams
more independent of docs-maintainers #9219][#9219].

How code ownership is set up in this repo:

- The `main` branch ruleset requires code-owner review, so
  [`.github/CODEOWNERS`][] _gates_ merges (it doesn't merely suggest reviewers).
- Today CODEOWNERS has a single global rule, `* @open-telemetry/docs-approvers`,
  making `docs-approvers` the required reviewer for **every** file — including
  locale-only content.
- CODEOWNERS is last-match-wins: for a given file, the last matching pattern
  supplies the _sole_ owner set, and a review from any one listed owner
  satisfies the gate.
- [CODEOWNERS syntax does not support negation][codeowners-syntax] (`!`), so
  "everything _except_ locale files" can't be expressed directly; per-directory
  rules are used instead.

## Purpose and goal

Explore ways to:

- Make it easier for site maintainers to triage and enable the merge of
  single-locale PRs.
- Make it easier for locale maintainers to triage and enable the merge of their
  PRs.

## Approach

Favor GitHub-native mechanisms over bespoke tooling. Two complementary
strategies, in priority order:

1. **Code ownership.** Delegate review authority over each locale's content to
   its locale team in [`.github/CODEOWNERS`][] by listing that team as the
   **sole** owner of the locale's files (last-match-wins), thereby _dropping_
   `docs-approvers` as a required reviewer there. The `main` branch ruleset
   already requires code-owner review, so this lets a locale team approve — and
   thereby unblock — its own PRs without waiting on `docs-approvers`, directly
   advancing [#9219][]. A reviewer who owns every changed path satisfies a PR
   with a single approval, so a maintainer who belongs to multiple locale teams
   can approve a PR that spans those locales (e.g. a cross-locale broken-link
   fix).

2. **PR status check (secondary, optional).** A required check that flags a PR
   _escaping_ locale-owned files into shared or `en` content, overridable by a
   triage-settable label. Largely defense-in-depth that complements strategy 1;
   note the boundary is "locale-scoped" (one or more locales), not strictly a
   single locale.

Letting locale maintainers _enable auto-merge_ on an eligible PR is a separate,
still-open concern (ideally self-service, e.g. via a bot) explored in
[Appendix C](#appendix-c-auto-merge-enablement-via-a-bot) and tracked under
[Status details](#status-details).

## Appendix A: Code-ownership notes

- **Locale-owned paths (spec).** A locale `<loc>` owns these path globs where
  they exist; each becomes a CODEOWNERS rule assigning
  `@open-telemetry/docs-<loc>-approvers`:
  - `/content/<loc>/` — localized content
  - `/.cspell/<loc>-*.txt` — locale spell-check word list
  - `/prh/<loc>.yml` — locale proofreading-helper rules

  This matches the locale-owned scope used in earlier iterations. Rules for
  paths a locale doesn't yet have (e.g. a missing word list) are harmless; PRH
  rules are currently Japanese-only.

- **Sole-owner form (target).** List the locale team alone, e.g.
  `/content/<loc>/ @open-telemetry/docs-<loc>-approvers` (and one line per path
  above). Last-match-wins drops `docs-approvers` for those files, making the
  locale team autonomous for locale-only PRs — the behavior [#9219][] is after.
- **Additive form (gentler interim).** List both teams,
  `/content/<loc>/ @open-telemetry/docs-<loc>-approvers @open-telemetry/docs-approvers`,
  which _adds_ locale-team sufficiency while keeping `docs-approvers` as a
  fallback. Useful if we want to validate reviewer auto-request before removing
  the fallback.
- **No-owner form (shared high-churn files).** A pattern with _no_ owner clears
  the global `*` rule for that path, leaving it with no required code owner
  (it's still subject to the branch's general approval requirement). Used for
  `/static/refcache.json`, the auto-maintained link cache, so it doesn't drag
  `docs-approvers` into locale PRs that happen to update it.
- Scope-drift is mostly closed by strategy 1: when a locale team self-serves,
  any later commit that escapes into other-owned files adds a required reviewer
  whose approval is absent, blocking the merge. The residual case (a
  `docs-approvers` member approves, then scope escapes) is closed cleanly by
  setting `dismiss_stale_reviews_on_push: true`, with strategy 2 as backup.
- **Keep the global `* @open-telemetry/docs-approvers` line.** CODEOWNERS is
  last-match-wins (override, not additive): a file uses only its last-matching
  rule. So the locale rules must appear _after_ `*`, where they override it for
  locale dirs while `*` still owns everything else. This is how we get the
  "everything except locale files" effect that [negation][codeowners-syntax]
  can't express.

## Appendix B: Relationship to `component-owners`

- This repo also runs [`dyladan/component-owners`][component-owners] (the
  `Component owners` workflow) against
  [`.github/component-owners.yml`][component-owners-yml], which already maps
  each `content/<loc>` dir to its `docs-<loc>-approvers` team and
  auto-**requests** their review on matching PRs (via the otelbot app token, so
  it works for forked PRs).
- That action only _requests_ reviews; it does not _gate_ merges and does not
  require owners to have write access. The branch ruleset consults only
  CODEOWNERS, so dropping the `docs-approvers` requirement for locale files
  still requires the CODEOWNERS change in strategy 1.
- The locale→team mapping therefore lives in both files by necessity: they drive
  different mechanisms (request vs. require). The small overlap is intentional,
  not redundant.

[`.github/CODEOWNERS`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/CODEOWNERS
[codeowners-syntax]:
  https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#codeowners-syntax
[component-owners]: https://github.com/dyladan/component-owners
[component-owners-yml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml

## Appendix C: Auto-merge enablement via a bot

Once a locale PR is eligible (owned-by-locale-team and green), _someone_ still
has to **enable GitHub-native [auto-merge][]** so it lands without a maintainer
babysitting the merge button. We'd like this to be self-service for locale
maintainers, ideally via a `/auto-merge:enable`-style comment handled by a bot.

- **What "enable auto-merge" does (and doesn't).** Enabling auto-merge does
  **not** merge or write any files; it flips a switch and [GitHub merges the PR
  later][auto-merge] _only_ once branch protection (required code-owner review +
  checks) is satisfied. So the bot never bypasses the strategy-1 CODEOWNERS gate
  — a mixed or `en`-touching PR stays blocked until the relevant owners approve.

- **Why the shared `otelbot` can't do it.** The main [`otelbot`][otelbot] is an
  intentionally minimal, org-wide **public** GitHub App with only metadata read,
  **pull-requests write**, and members/teams read — **no `contents`
  permission**. Enabling auto-merge under branch protection needs merge
  capability (`contents: write`), matching our earlier finding that a
  Maintainer-equivalent was required. We should _not_ widen the shared app
  (least-privilege).

- **Renovate is the existence proof.** This repo runs Mend's Renovate App
  ([`.github/renovate.json5`][renovate-config]), which can [automerge passing
  PRs][renovate-automerge]. Its default mechanism,
  [`platformAutomerge`][renovate-platform-automerge], is exactly ours: it
  **enables GitHub-native auto-merge** rather than merging itself. Renovate can
  do this because the App carries the write capability auto-merge needs —
  confirming that an App with that capability, not a human "Maintainer" role, is
  what's required.

- **The right vehicle: the DOCS `otelbot`.** The repo already has a
  [SIG-specific `otelbot`][otelbot-sig] — `OTELBOT_DOCS_APP_ID` /
  `OTELBOT_DOCS_PRIVATE_KEY` — used today by `pr-actions.yml` and
  `component-owners.yml` for commits and review requests. An admin confirmed it
  already carries the permissions auto-merge enablement needs, making it the
  right vehicle. No new app needed.

- **Can we scope `contents: write` to locale content only? No.** GitHub App
  [permissions][app-permissions] are resource × level (× repository set) — there
  is **no per-path/per-glob dimension**. `contents: write` means "any file in
  the repo." (This is the same all-or-nothing limitation that underlies
  [#9219][], resurfacing at the App-permission layer.) We get locale-only
  _behavior_ by constraining where it can be expressed, defense-in-depth:
  1. **CODEOWNERS backstop (hard gate).** Auto-merge can only complete with
     required owner approvals, so the bot enabling it on an `en`/mixed PR
     changes nothing until those owners approve. It literally can't slip `en`
     changes in.
  2. **Diff-scope guard in the workflow.** Gate the bot's "enable" step on a
     computed check that the PR's changed-file set lies entirely within the
     locale globs ([Appendix A][appendix-a]); refuse otherwise. This is the
     closest practical equivalent to "contents:write for locale content only."
  3. **Normal (non-bypass) actor.** Keep the bot a regular ruleset actor so it
     never circumvents required reviews/checks.

  Net: the permission stays broad but **inert** — only ever exercised through
  the gated, diff-scoped, CODEOWNERS-backstopped enable step.

- **Implementation.** `.github/workflows/locale-auto-merge.yml` (thin trigger)
  delegates to `scripts/gh/locale-auto-merge/` (testable helper + CLI). A locale
  team member comments `/auto-merge` (or `:enable` / `:disable`). The helper
  checks: (1) every changed file is locale-owned (or `static/refcache.json`);
  (2) the commenter is a member of `docs-<loc>-maintainers` for **every** locale
  touched (so a mixed ja+pt PR needs authority over both). It then runs
  `gh pr merge --auto --squash` as the DOCS bot. The CLI's `--user` flag
  evaluates the verdict _as if_ a given user commented (dry-run by default), for
  testing the authorization gate before going live.

- **Confirmed (spike done).** The DOCS bot is a permitted (non-excluded) actor
  under the `main` ruleset: a live, non-dry-run `/auto-merge` on a real locale
  PR successfully enabled GitHub auto-merge via the bot token, and the PR merged
  once its required reviews and checks were satisfied.

[auto-merge]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
[otelbot]:
  https://github.com/open-telemetry/community/blob/main/assets.md#otelbot
[otelbot-sig]:
  https://github.com/open-telemetry/community/blob/main/assets.md#otelbot-sig-specific
[renovate-config]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/renovate.json5
[renovate-automerge]:
  https://docs.renovatebot.com/faq/#automatically-merge-passing-pull-requests
[renovate-platform-automerge]:
  https://docs.renovatebot.com/configuration-options/#platformautomerge
[app-permissions]:
  https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app
[appendix-a]: #appendix-a-code-ownership-notes

## Status details

- **Done.** Strategy 1 (CODEOWNERS) de-risked: `ja` and `pt` locale teams have
  sole ownership in `.github/CODEOWNERS` (merged). Strategy 2 (auto-merge
  enablement): `.github/workflows/locale-auto-merge.yml` plus the
  `scripts/gh/locale-auto-merge/` helper are implemented, unit/integration
  tested, and validated against a live PR (see the spike result above).

[#9219]: https://github.com/open-telemetry/opentelemetry.io/issues/9219
