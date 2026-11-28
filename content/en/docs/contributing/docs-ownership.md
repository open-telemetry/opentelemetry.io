---
title: Docs ownership, required reviews, and auto-merge
linkTitle: Docs ownership
description:
  How code owners, component owners, and the auto-merge command decide whose
  approval a PR needs and who can merge it
weight: 990
---

Who owns which parts of this site, and what that ownership lets a team do. Read
this page if you:

- **Approve PRs for a SIG or a localization team**: find out when your approval
  is required and when it's only requested, and why ([the model](#model),
  [write access](#write)).
- **Maintain a localization team**: merge PRs confined to your locale without
  waiting on a docs maintainer ([auto-merge](#auto-merge)).
- **Maintain a SIG**: take ownership of your docs
  ([how to ask, and what you agree to](#sig-ownership)).
- **Review as a docs approver**: find out which PRs no longer need your
  approval, even where the `missing:docs-approval` label still appears
  ([the model](#model)).

## The model {#model}

**Whoever is responsible for a body of work is trusted with its docs: a
localization team owns its locale's pages; a SIG can own the docs for its
code.** A **docs owner** is a localization team, or a SIG that has
[taken ownership](#sig-ownership) of its docs (until then, a SIG's docs use
component owners, described below). A docs owner has two GitHub teams, each with
one role on the owner's paths:

- Its **approvers team** is the paths' [code owner][]: a PR confined to those
  paths needs that team's approval, which is enough to merge it once checks
  pass.
- Its **maintainers team** can [auto-merge](#auto-merge) such a PR (localization
  teams today; SIGs once [#12285][] lands).

SIGs and localization teams are more alike than they seem: the community's [SIG
registry][] lists localization teams as part of SIG Communications. For
ownership, the difference is that a localization team has no code repository, so
it has no approvers team until one is created for it.

Code owners are one of two mechanisms that request reviewers for a PR. They
differ in what they enforce:

- **Code owners**: required reviewers, the hard gate.
  - Declared in [`.github/CODEOWNERS`][]; the team named must hold write access.
  - By default, `@open-telemetry/docs-approvers` owns every file. A later entry
    replaces that default for its paths (in CODEOWNERS, the last matching entry
    wins), so a PR confined to a docs owner's paths merges on that owner's
    approval, with no docs-approvers review. The `missing:docs-approval` label
    doesn't reflect this yet: the [label manager][] tracks a docs-approver
    review on every PR.
- **Component owners**: suggested reviewers, the soft gate.
  - Declared in [`.github/component-owners.yml`][]; no write access needed.
  - Automation requests the team's review and the label manager tracks it: an
    approval clears the [`missing:sig-approval` label][]. GitHub doesn't require
    it, and a docs maintainer may merge after a grace period.
  - SIG content uses component owners until the SIG
    [takes ownership](#sig-ownership) of its tree.

### Why code owners need write access {#write}

GitHub counts an approval toward required reviews only from a reviewer with
write access to the repository, whether CODEOWNERS or a ruleset's
required-reviewers rule names them. A code-owner team must hold write access
itself: GitHub drops an owner that lacks it, and if no valid owner remains on
the matching CODEOWNERS line, those paths have no code owner at all, so the
`docs-approvers` default no longer covers them. A team can therefore gate paths
only once it holds write access.

On this repository, write access makes a reviewer's approvals count toward
required reviews. It doesn't open a path to `main`: branch protection restricts
pushes to the docs bot, and PRs land through the merge queue after required
reviews and checks pass. It doesn't open repository settings either: branch
protection and rulesets need the Admin role, and an organization ruleset blocks
changing or deleting tags. Like every write holder today, a team with write
access can also dismiss other reviewers' reviews, and it shares one exposure,
GitHub Actions:

- A workflow pushed to a branch of this repository (not a fork) runs with the
  secrets visible to the repository, and write access allows creating, updating
  and deleting those secrets (not reading them).
- Scoping the secrets to a `main`-only environment is the prerequisite for
  granting write access to SIG teams.

## Docs owners {#teams}

### Localization teams {#locales}

Each locale has dedicated `docs-LANG_ID-approvers` and
`docs-LANG_ID-maintainers` teams, where `LANG_ID` is the locale's language code.
The approvers team owns `content/LANG_ID/` and the locale's spell-checking and
`prh` files; the maintainers team can auto-merge locale-only PRs. For [unstaffed
locales, the `docs-approvers` fallback, and the team registry][locale teams],
see the localization guide; for creating the teams, the [localization setup
guide][].

### SIGs {#sigs}

A SIG that owns a body of content, such as a language's SDK and its
documentation under `content/en/docs/languages/`, uses its **existing** teams:
its approvers team or teams become the code owner of the docs tree, and, once
[#12285][] extends `/auto-merge` to SIG trees, its maintainers team can
auto-merge PRs confined to it. No separate docs teams are created: whoever the
SIG trusts to approve its code is trusted to approve its docs. The approvers
team gains write access on this repository when the SIG
[takes ownership](#sig-ownership); until then, the SIG's content is on
[component owners](#model).

## Auto-merge {#auto-merge}

Today the command works for localization teams; extending it to SIG-owned trees
is tracked in [#12285][].

A member of a docs owner's maintainers team can enable [GitHub auto-merge][] on
a PR by commenting `/auto-merge` (or `/auto-merge:enable`; `/auto-merge:disable`
turns it off) on its own line, as the first or last non-blank line of the
comment:

```text
LGTM
/auto-merge
```

The command works only when every changed file belongs to a docs owner whose
maintainers team the commenter is in (files with no code owner, such as
`link-cache.jsonc`, are also allowed), so it can't reach content outside those
paths; the PR then merges once all required reviews and checks pass. Branch
protection and CODEOWNERS remain the gate: the command only flips GitHub's
"merge when ready" switch. For the placement and eligibility rules in full, see
the [helper README][].

## Take ownership of your SIG's docs {#sig-ownership}

SIG grants start once the [secrets scoping](#write) prerequisite is met (tracked
in [#12285][]). To own its docs tree, a SIG then [opens an issue][] in this
repository naming the tree and the approvers and maintainers teams that will own
it. By asking, the SIG commits to reviewing PRs that touch its tree promptly:
they can't merge without its approval, and the two-week [grace period][] for
co-owned PRs no longer applies. In return:

- Its approvers team gains write access to this repository and becomes the
  tree's required reviewer.
- PRs confined to the tree no longer require a docs-approvers review; the [style
  guide][] still applies, and docs approvers remain available for style and
  structure reviews on request.
- Once [#12285][] extends `/auto-merge` to SIG trees, its maintainers team can
  [auto-merge](#auto-merge) PRs confined to the tree; until then, a docs
  maintainer merges them.
- Team membership stays the SIG's; promotion follows the community [membership
  guidelines][].

Docs maintainers then prepare the grant, which an org admin applies, and make
the ownership change: [Team access and code ownership][].

<!-- prettier-ignore-start -->
[#12285]: https://github.com/open-telemetry/opentelemetry.io/issues/12285
[`.github/CODEOWNERS`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/CODEOWNERS
[`.github/component-owners.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml
[`missing:sig-approval` label]: /site/build/ci-workflows/#pr-approval-labels
[code owner]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[GitHub auto-merge]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
[grace period]: ../sig-practices/#co-owned-prs
[helper README]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/gh/locale-auto-merge
[label manager]: /site/build/ci-workflows/#pr-approval-labels
[locale teams]: ../localization/#locale-teams
[localization setup guide]: /site/build/localization/#gh-org
[membership guidelines]: https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md
[opens an issue]: ../issues/
[SIG registry]: https://github.com/open-telemetry/community/blob/main/README.md#localization-teams-part-of-sig-communications
[style guide]: ../style-guide/
[Team access and code ownership]: /site/admin/team-access/
<!-- prettier-ignore-end -->
