---
name: update-git-submodule
description: >-
  Update one or more of the repository's git submodules to a target version (a
  specific tag or commit, the latest release, or HEAD), adjusting the pins in
  .gitmodules and re-syncing the submodule gitlinks. Follows the procedure in
  update-git-submodule.md.
argument-hint: '<submodule>... <version|latest|HEAD>'
cSpell:ignore: gitlinks
---

# Update git submodules

## Arguments

See the arguments specified in [update-git-submodule.md][], though briefly:

1. One or more submodules to update.
2. Target version: a specific tag or commit; `latest`; or `HEAD`

## Usage

Read and follow [update-git-submodule.md][]. If either argument is missing, ask
the user before applying.

[update-git-submodule.md]:
  ../../../content/en/site/skills/update-git-submodule.md
