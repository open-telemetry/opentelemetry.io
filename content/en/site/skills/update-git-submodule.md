---
title: Update git submodules
description: >-
  How to update one or more of the repository's git submodules to a target
  version.
cSpell:ignore: gitlink gitlinks
---

Each submodule is pinned to a tag or commit via a `*-pin` field in
[.gitmodules][]. Follow the process below to update one or more submodules to
target version(s).

## Arguments

1. One or more submodules to update (path or name). Submodules available for
   update are declared in [.gitmodules][], and include:
   - `themes/docsy`, the Docsy theme
   - `content-modules/*`, OpenTelemetry submodules

2. Target version specifier (for each submodule or all):
   - A specific tag or commit
   - `latest` for the latest tagged release
   - `HEAD` for the default branch head

## Process

1. Run `npm run update:submodule`.

   > Fetches tags and switches each submodule to its remote default-branch head,
   > so pin values can be determined locally in the next step.

2. For each submodule, determine the new pin value from the target version,
   running git commands from within the submodule:
   - **A specific tag or commit**: use it as given, after validating that it
     exists via `git rev-parse --verify <tag-or-commit>`, which prints the
     corresponding SHA when valid.

     > To see the list of valid tags, run `git tag --list`.

   - **Latest release**: `git describe --tags --abbrev=0`
   - **HEAD**: the SHA[^sha] of `HEAD`

   For commit pins, including `HEAD`:
   - If [`git describe --tags`][git-describe] `<commit>` succeeds, use its
     output as the pin since it conveys the nearest release -- for example,
     `v1.23.0-11-gca090204` vs `ca090204`.
   - Otherwise, use the SHA[^sha] of `<commit>`.

3. Edit the submodule's `*-pin` value in [.gitmodules][].
4. Run `npm run pin:submodule` to switch the submodules to their new pins, and
   verify that the reported revisions (also available via `git submodule`) match
   the pins.
5. Commit the changes to `.gitmodules` and the submodule gitlink(s). Use a
   commit message such as "Update `<submodule>` to `<version>`" for
   single-module updates, or something similar otherwise. Committing now
   prevents the next step from resetting the submodules to their previously
   committed gitlinks.
6. Run `npm run prepare` to refresh submodule dependencies. Commit any resulting
   changes, amending the previous commit if desired.

Validation:

- For quick validation, run `npm run build` and ensure it succeeds without
  errors or (unexpected) warnings.
- For comprehensive validation, run `npm run test` and ensure it passes without
  errors.

[^sha]:
    The full SHA is sometimes necessary, but the short SHA is typically
    sufficient.

[.gitmodules]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.gitmodules
[git-describe]: https://git-scm.com/docs/git-describe
