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
   advancing [#9219]. A reviewer who owns every changed path satisfies a PR with
   a single approval, so a maintainer who belongs to multiple locale teams can
   approve a PR that spans those locales (e.g. a cross-locale broken-link fix).

2. **PR status check (secondary, optional).** A required check that flags a PR
   _escaping_ locale-owned files into shared or `en` content, overridable by a
   triage-settable label. Largely defense-in-depth that complements strategy 1;
   note the boundary is "locale-scoped" (one or more locales), not strictly a
   single locale.

Letting locale maintainers _enable auto-merge_ on an eligible PR is a separate,
still-open concern (ideally self-service, e.g. via a bot) tracked under
[Status details](#status-details).

## Appendix A: Code-ownership notes

- **Locale-owned paths (spec).** A locale `<loc>` owns these path globs; each
  becomes a CODEOWNERS rule assigning `@open-telemetry/docs-<loc>-approvers`:
  - `/content/<loc>/` — localized content
  - `/.cspell/<loc>-*.txt` — locale spell-check word list
  - `/prh/<loc>.yml` — locale proofreading-helper rules

  This matches the locale-owned scope used in earlier iterations. Rules for
  paths a locale doesn't yet have (e.g. a missing word list) are harmless and
  future-proof.

- **Sole-owner form (target).** List the locale team alone, e.g.
  `/content/<loc>/ @open-telemetry/docs-<loc>-approvers` (and one line per path
  above). Last-match-wins drops `docs-approvers` for those files, making the
  locale team autonomous for locale-only PRs — the behavior [#9219] is after.
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

## Status details

- **In progress.** De-risking strategy 1 by giving `ja` and `pt` locale teams
  sole ownership of their locale-owned paths (content, word list, prh rules) in
  `.github/CODEOWNERS`, to validate that `docs-approvers` is dropped as a
  required reviewer and the locale team's review satisfies the gate on a live
  PR.

[#9219]: https://github.com/open-telemetry/opentelemetry.io/issues/9219
