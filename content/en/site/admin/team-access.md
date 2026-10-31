---
title: Team access and code ownership
description: >-
  Grant a docs owner's approvers team write access to the repository and make it
  the code owner of its paths
weight: 10
---

Follow this procedure when a team becomes a [docs owner][]: a SIG that has
[asked to own its docs][], or a new locale (the [localization setup guide][]
sends you here from its Step 6). The steps are the same for both; the order
differs:

- **Locales** land their ownership entries first, in the locale's first content
  PR (setup guide Step 5), safe under the `docs-approvers` fallback; the grant
  follows.
- **SIGs** are granted write access first, then get their ownership entries: a
  SIG line has no fallback, so it must not land before the grant is verified.
  SIG grants also wait on the [secrets scoping][] prerequisite.

## Grant write access {#grant}

A [code owner][] team must itself hold write access on the repository. Open a PR
against the private [`open-telemetry/admin`][] repository that adds the team's
ID to the `approvers` list of `repo-opentelemetry-io.tf`:

- **SIGs**: `github_team.TEAM.id` for each approvers team, where `TEAM` is the
  team's Terraform resource name; remove the team's entry from the `triagers`
  list, if it has one.
- **Locales**: `github_team.docs-LANG_ID-approvers.id`, where `LANG_ID` is the
  locale's language code.

An org admin merges and applies the PR.

## Verify the grant {#verify}

Once the admin PR is applied, confirm that the team is listed under the
repository's teams with the **Write** role, where `TEAM_SLUG` is the approvers
team's GitHub slug:

```sh
gh api --paginate repos/open-telemetry/opentelemetry.io/teams \
  --jq '.[] | select(.slug == "TEAM_SLUG") | .permission'
```

Expect `push`, the API's name for the Write role. Nothing printed means the team
isn't in the repository's access list (the grant is missing or not yet applied,
or the team doesn't exist yet); `pull` or `triage` means a grant below write.
For the per-member checks a new locale needs, see the setup guide's [Step 6d][].
GitHub drops a code owner that lacks write access, and a CODEOWNERS line whose
owners are all dropped leaves its paths with **no** code owner, so any write
holder's approval would satisfy their required review. For a SIG, merge the
ownership PR below only after this check prints `push`.

## Update the ownership entries {#ownership-files}

In a PR to this repository:

- **Locales**: add the locale to [`data/locale-teams.yaml`][] and run
  `npm run fix:codeowners`; the locale section of [`CODEOWNERS`][] is generated.
- **SIGs**: add CODEOWNERS entries for the tree, naming the SIG's approvers team
  or teams, between the generated locale section and the CI/infra block, so that
  infra files in the tree stay with `docs-maintainers`. Remove the tree's
  entries from [`component-owners.yml`][]: the team is now a required reviewer.
  This also stops the tree's `missing:sig-approval` label; label semantics for
  SIG-owned trees are tracked in [#12285][].

After the PR merges, a PR confined to the tree requests the team's review as a
code owner and merges on its approval without a `docs-approvers` review (for an
unstaffed locale, `docs-approvers` is requested as well, by design).

<!-- prettier-ignore-start -->
[#12285]: https://github.com/open-telemetry/opentelemetry.io/issues/12285
[`CODEOWNERS`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/CODEOWNERS
[`component-owners.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml
[`data/locale-teams.yaml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/data/locale-teams.yaml
[`open-telemetry/admin`]: https://github.com/open-telemetry/admin?link-check=no
[asked to own its docs]: /docs/contributing/docs-ownership/#sig-ownership
[code owner]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[docs owner]: /docs/contributing/docs-ownership/#model
[localization setup guide]: ../../build/localization/#gh-org
[secrets scoping]: /docs/contributing/docs-ownership/#write
[Step 6d]: ../../build/localization/#gh-org-verify
<!-- prettier-ignore-end -->
