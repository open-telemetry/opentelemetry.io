---
title: Team access and code ownership
description: >-
  Grant a content-owning team write access to the repository and make it the
  code owner of its docs tree.
weight: 10
---

Follow this procedure when a team becomes the owner of a docs tree under the
[content ownership model][]: a SIG that has [asked to own its docs][sig-ask], or
a locale whose dedicated teams are being set up (for locales, the [localization
setup guide][] Step 6 covers team creation as well; this page is the grant and
ownership part that both cases share).

## 1. Grant write access {#grant}

A [code owner][] team must itself hold write access on the repository. Open a PR
against the private [`open-telemetry/admin`][] repository that adds the team's
ID to the `approvers` list of `repo-opentelemetry-io.tf`: for a SIG, move its
approvers team(s) there from the `triagers` list; for a locale, add
`github_team.docs-LANG_ID-approvers.id`. An org admin merges and applies the PR.

## 2. Update the ownership files {#ownership-files}

In a PR to this repository:

- **Locales**: add the locale to [`data/locale-teams.yaml`][] and run
  `npm run fix:codeowners`; the locale section of [CODEOWNERS][] is generated.
- **SIGs**: add CODEOWNERS entries for the tree, naming the SIG's approvers
  team(s), after the generated locale section (last match wins), and remove the
  tree's entries from [`component-owners.yml`][]: the team is now a required
  reviewer, so a suggested-reviewer entry would be redundant.

## 3. Verify {#verify}

Once the admin PR is applied and the ownership PR merged:

- The team appears in the repository's teams list with the Write role:

  ```sh
  gh api --paginate repos/open-telemetry/opentelemetry.io/teams \
    --jq '.[] | select(.slug == "TEAM_SLUG") | .permission'
  ```

  Expect `push`, the API's name for the Write role. Nothing printed means the
  team isn't in the repository's access list; `pull` or `triage` means a grant
  below write.

- A PR confined to the tree requests the team's review as a code owner, and
  merges on that team's approval without a docs-approvers review. GitHub
  silently ignores CODEOWNERS entries for teams without write access, so a PR
  that still requests `docs-approvers` means step 1 hasn't taken effect.

[`component-owners.yml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml
[`data/locale-teams.yaml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/data/locale-teams.yaml
[`open-telemetry/admin`]: https://github.com/open-telemetry/admin?link-check=no
[CODEOWNERS]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/CODEOWNERS
[code owner]:
  https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[content ownership model]: /docs/contributing/content-ownership/
[localization setup guide]: ../../build/localization/#gh-org
[sig-ask]: /docs/contributing/content-ownership/#sig-ownership
