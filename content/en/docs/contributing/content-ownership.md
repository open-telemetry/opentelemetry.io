---
title: Content ownership, required reviews, and auto-merge
linkTitle: Content ownership
description:
  Which team's approval is required to merge a docs PR, how a team comes to own
  its docs, and who can enable auto-merge.
weight: 990
---

This page describes how ownership of this site's content maps to GitHub teams,
which approvals a pull request (PR) needs before it can merge, and who can let a
PR merge on its own. The model is the same for every content-owning team;
localization teams and SIGs instantiate it differently, as described below.

## The model {#model}

**The team that owns a body of content owns its docs path.** For a path it owns,
a team's approvers team is the path's [code owner][], and its maintainers team
can enable [auto-merge](#auto-merge) on PRs confined to that path.

Two mechanisms assign reviewers to a PR, and they differ in what they enforce:

- **Code owners**, the content-owning teams: the hard gate.
  - Defined in: [`.github/CODEOWNERS`][].
  - Reviewers: required; the team must hold write access.
  - An approval satisfies the required code-owner review; without one, the PR
    can't merge.
  - By default, every file is owned by `@open-telemetry/docs-approvers`; a more
    specific CODEOWNERS entry replaces that default for its path (the last
    matching entry wins), so a PR confined to a tree owned by another team
    merges on that team's approval, without a docs-approvers review.
- **Component owners**, suggested reviewers: the soft gate.
  - Defined in: [`.github/component-owners.yml`][].
  - Reviewers: suggested; works without write access.
  - An approval clears the [`missing:sig-approval` label][]; a docs maintainer
    may still merge after a grace period.
  - The component-owners automation requests the team's review and the [label
    manager][] tracks whether one arrived, but GitHub doesn't require it.
    SIG-owned content is on component owners unless the SIG has
    [taken ownership](#sig-ownership) of its tree.

### Why code owners need write access {#write}

GitHub counts a review toward branch protection only when the reviewer has write
access to the repository, whether the requirement comes from CODEOWNERS or from
a ruleset's required-reviewers rule; a CODEOWNERS entry naming a team without
write access is ignored. So which teams gate which paths is really a question of
which teams hold write access; the mechanisms above follow from that.

Write access on this repository buys **approvals that count**, and little else:

- Nobody pushes to `main`: branch protection restricts pushes to the docs bot,
  and PRs land through the merge queue after required reviews and checks pass.
- Repository settings and rulesets need the Maintain or Admin role; tags are
  protected by an organization ruleset.
- The residual exposure is GitHub Actions: a workflow pushed to a branch of this
  repository (not a fork) by someone with write access runs with the secrets
  visible to the repository. This is the same for every team that holds write
  today. Scoping those secrets to a `main`-only environment is a prerequisite
  for extending write to further teams.

## Content-owning teams {#teams}

### Localization teams {#locales}

Each locale has dedicated `docs-LANG_ID-approvers` and
`docs-LANG_ID-maintainers` teams, since no other team exists for a locale. The
approvers team owns `content/LANG_ID/` and the locale's spell-checking and `prh`
files; the maintainers team can auto-merge locale-only PRs. Locale specifics,
including [unstaffed locales and the fallback to
`docs-approvers`][locale teams], are in the localization guide; the
[localization setup guide][] covers creating the teams.

### SIGs {#sigs}

A SIG that owns a body of content, such as a language's SDK and its
documentation under `content/en/docs/languages/`, uses its **existing** teams:
its approvers team(s) become the code owner of the docs tree, and its
maintainers team can auto-merge PRs confined to it. No separate docs teams are
created for a SIG: whoever the SIG trusts to approve its code is trusted to
approve its docs. The approvers team is granted write access on this repository
when the SIG [takes ownership](#sig-ownership).

SIGs that haven't asked for ownership stay on [component owners](#model):
reviews are requested, tracked by label, and not required.

## Auto-merge {#auto-merge}

A member of the owning team's maintainers team can enable GitHub auto-merge on a
PR by commenting `/auto-merge` (`/auto-merge:enable`, or `/auto-merge:disable`
to turn it off). The directive is honored only when **every** changed file is
owned by a team the commenter maintains; the PR then merges once all required
reviews and checks pass. Branch protection and CODEOWNERS remain the gate: the
command only flips GitHub's "merge when ready" switch.

Today the command is implemented for localization teams; for its [placement
rules][locale auto-merge] and [eligibility details][helper README], see the
localization guide and the helper README. Extending it to SIG-owned trees is
tracked in [#12285][].

## The registry {#registry}

The locale section of CODEOWNERS is generated from the
[`data/locale-teams.yaml`][] registry, which records which teams own which paths
and their expected membership. Team rosters live on GitHub, not in the registry:
the daily [Housekeeping][] run syncs the registry with the live locale teams and
opens a PR for any drift, so roster changes leave an audit trail. Generalizing
the registry from locales to all content-owning teams is tracked in [#12285][].

## Take ownership of your SIG's docs {#sig-ownership}

A SIG that wants to own its docs tree [opens an issue][] in this repository,
naming the tree and the approvers and maintainers teams that will own it. What
the SIG agrees to:

- Its approvers team(s) gain write access to this repository and become the
  tree's required reviewers.
- Its maintainers team can [auto-merge](#auto-merge) PRs confined to the tree.
- PRs confined to the tree no longer require a docs-approvers review. Docs
  approvers remain available for style and structure reviews on request, and the
  [style guide][] still applies.
- Team membership stays the SIG's; promotion follows the community [membership
  guidelines][].

Docs maintainers then perform the grant and ownership change, and verify them:
[Team access and code ownership][]. The [secrets scoping](#write) prerequisite
applies before the first SIG grant.

<!-- prettier-ignore-start -->
[`.github/CODEOWNERS`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/CODEOWNERS
[`.github/component-owners.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml
[`data/locale-teams.yaml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/data/locale-teams.yaml
[`missing:sig-approval` label]: /site/build/ci-workflows/#pr-approval-labels
[#12285]: https://github.com/open-telemetry/opentelemetry.io/issues/12285
[code owner]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[helper README]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/gh/locale-auto-merge
[Housekeeping]: /site/build/ci-workflows/#housekeeping
[label manager]: /site/build/ci-workflows/#pr-approval-labels
[locale auto-merge]: ../localization/#auto-merge
[locale teams]: ../localization/#locale-teams
[localization setup guide]: /site/build/localization/#gh-org
[membership guidelines]: https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md
[opens an issue]: ../issues/
[style guide]: ../style-guide/
[Team access and code ownership]: /site/admin/team-access/
<!-- prettier-ignore-end -->
