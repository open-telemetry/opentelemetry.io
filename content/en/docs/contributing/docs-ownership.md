---
title: Docs ownership, required reviews, and auto-merge
linkTitle: Docs ownership
description:
  Which team's approval is required to merge a docs PR, how a team comes to own
  its docs, and who can enable auto-merge.
weight: 990
---

Who owns which parts of this site, and what that ownership lets a team do. Read
this page if you:

- **Approve PRs for a SIG or a localization team**: find out when your approval
  is required and when it's only requested, and why ([the model](#model),
  [write access](#write)).
- **Maintain such a team**: land your team's PRs without a docs maintainer
  ([auto-merge](#auto-merge)) and, for a SIG, take ownership of your docs
  ([how to ask, and what you agree to](#sig-ownership)).
- **Review as a docs approver**: see which PRs still need you, and which no
  longer do ([the model](#model)).

## The model {#model}

**Whoever owns a body of content owns its docs.** A docs owner, a SIG or a
localization team, has two GitHub teams, each holding one lever over the paths
it owns:

- Its **approvers team** is the paths' [code owner][]: a PR confined to those
  paths needs that team's approval, and merges on it.
- Its **maintainers team** can [auto-merge](#auto-merge) such a PR.

The two kinds of owner differ less than they look: in the community's [SIG
registry][], each localization team is a cross-cutting SIG under SIG
Communications. The only difference is that a localization team has no code
repository, so no pre-existing approvers team.

Code owners are one of two mechanisms that assign reviewers to a PR. They differ
in what they enforce:

- **Code owners**: required reviewers, the hard gate.
  - Declared in [`.github/CODEOWNERS`][]; the team named must hold write access.
  - Without the code owner's approval, the PR can't merge.
  - By default, `@open-telemetry/docs-approvers` owns every file. A more
    specific entry replaces that default for its paths (the last matching entry
    wins), so a PR confined to a docs owner's paths merges on that owner's
    approval, with no docs-approvers review.
- **Component owners**: suggested reviewers, the soft gate.
  - Declared in [`.github/component-owners.yml`][]; no write access needed.
  - Automation requests the team's review and the [label manager][] tracks it:
    an approval clears the [`missing:sig-approval` label][]. GitHub doesn't
    require it, and a docs maintainer may merge after a grace period.
  - SIG content uses component owners until the SIG
    [takes ownership](#sig-ownership) of its tree.

### Why code owners need write access {#write}

GitHub counts an approval toward branch protection only from a reviewer with
write access to the repository, whether CODEOWNERS or a ruleset's
required-reviewers rule names them, and it silently ignores a CODEOWNERS entry
for a team without write access. Which teams gate which paths is therefore a
question of which teams hold write access.

On this repository, write access buys **approvals that count**, and little else:

- No path to `main`: branch protection restricts pushes to the docs bot, and PRs
  land through the merge queue after required reviews and checks pass.
- No settings: repository settings and rulesets need the Maintain or Admin role,
  and an organization ruleset protects tags.
- One residual exposure, GitHub Actions: a workflow pushed to a branch of this
  repository (not a fork) runs with the secrets visible to the repository, as it
  does for every write holder today. Scoping those secrets to a `main`-only
  environment is the prerequisite for extending write access to more teams.

## Content owners {#teams}

### Localization teams {#locales}

Each locale has dedicated `docs-LANG_ID-approvers` and
`docs-LANG_ID-maintainers` teams. The approvers team owns `content/LANG_ID/` and
the locale's spell-checking and `prh` files; the maintainers team can auto-merge
locale-only PRs. For [unstaffed locales and the `docs-approvers`
fallback][locale teams], see the localization guide; for creating the teams, the
[localization setup guide][].

### SIGs {#sigs}

A SIG that owns a body of content, such as a language's SDK and its
documentation under `content/en/docs/languages/`, uses its **existing** teams:
its approvers team or teams become the code owner of the docs tree, and its
maintainers team can auto-merge PRs confined to it. No separate docs teams are
created: whoever the SIG trusts to approve its code is trusted to approve its
docs. The approvers team gains write access on this repository when the SIG
[takes ownership](#sig-ownership); until then, the SIG's content is on
[component owners](#model).

## Auto-merge {#auto-merge}

A member of a docs owner's maintainers team can enable [GitHub auto-merge][] on
a PR by commenting `/auto-merge` (or `/auto-merge:enable`; `/auto-merge:disable`
turns it off) on its own line, as the first or last line of the comment:

```text
LGTM
/auto-merge
```

This lets a docs owner land its own PRs without waiting on a docs maintainer.
The command is honored only when **every** changed file is owned by a team the
commenter maintains, so it can't reach content outside the owner's paths; the PR
then merges once all required reviews and checks pass. Branch protection and
CODEOWNERS remain the gate: the command only flips GitHub's "merge when ready"
switch. For the placement and eligibility rules in full, see the [helper
README][].

Today the command works for localization teams; extending it to SIG-owned trees
is tracked in [#12285][].

## The registry {#registry}

The locale section of CODEOWNERS is generated from the
[`data/locale-teams.yaml`][] registry, which records which teams own which paths
and their expected membership. Team rosters live on GitHub, not in the registry:
the daily [Housekeeping][] run syncs the registry with the live locale teams and
opens a PR for any drift, so roster changes leave an audit trail. Generalizing
the registry from locales to all docs owners is tracked in [#12285][].

## Take ownership of your SIG's docs {#sig-ownership}

To own its docs tree, a SIG [opens an issue][] in this repository naming the
tree and the approvers and maintainers teams that will own it. By asking, the
SIG agrees that:

- Its approvers team gains write access to this repository and becomes the
  tree's required reviewer.
- Its maintainers team can [auto-merge](#auto-merge) PRs confined to the tree.
- PRs confined to the tree no longer require a docs-approvers review; the [style
  guide][] still applies, and docs approvers remain available for style and
  structure reviews on request.
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
[GitHub auto-merge]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
[helper README]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/gh/locale-auto-merge
[Housekeeping]: /site/build/ci-workflows/#housekeeping
[label manager]: /site/build/ci-workflows/#pr-approval-labels
[locale teams]: ../localization/#locale-teams
[localization setup guide]: /site/build/localization/#gh-org
[membership guidelines]: https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md
[opens an issue]: ../issues/
[SIG registry]: https://github.com/open-telemetry/community/blob/main/README.md#localization-teams-part-of-sig-communications
[style guide]: ../style-guide/
[Team access and code ownership]: /site/admin/team-access/
<!-- prettier-ignore-end -->
