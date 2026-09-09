---
name: resolve-link-cache-conflicts
description:
  Skill for resolving link-cache.jsonc conflicts during a merge or rebase, in
  the current branch or a specified PR.
argument-hint: '[optional-pr-number]'
---

`link-cache.jsonc` is the committed link cache (policy: [Link cache][]). Its
field-per-line entries merge cleanly for distinct URLs, so a conflict means both
sides changed the same URL, or one side's entry landed next to the other's.
Resolve per [The owned cache][cache-format] § Shape, then rerun the check to
normalize the file.

## Prerequisites

If the current branch has a merge or rebase in progress, then skip the rest of
this section and jump to **Preparation**.

The current branch must be clean (`git status --short`). If not clean, offer to
run `git stash` or `git commit` to clean it up, or stop.

If `$ARGUMENTS` is a PR number, then check out the PR branch with:
`gh pr checkout $ARGUMENTS`.

## Preparation

1. Determine the integration reference (`$BASE_BRANCH`) and fetch it:
   - If an `upstream` remote exists: `git fetch upstream`, use `upstream/main`.
   - Otherwise: `git fetch origin`, use `origin/main`.

2. If merge or rebase is in progress (`git status`), skip this step. Otherwise,
   ask the user whether to run `git merge $BASE_BRANCH` or
   `git rebase $BASE_BRANCH`, then run it.

3. If there are no conflicts, the operation completes on its own: we are done.

4. Conflicts other than `link-cache.jsonc`: resolve them with the user.

5. If a `link-cache.jsonc` conflict remains, proceed to **Resolve**.

## Resolve

1. Resolve each conflict hunk per [The owned cache][cache-format] § Shape: keep
   both entries for distinct URLs; choose one complete entry when both sides
   changed the same URL (prefer `$BASE_BRANCH`'s, unless the branch's entry is a
   deliberate seed); keep exactly one `"URL": {` line per URL.

   When the branch's cache changes are all routine check results (no seeds),
   taking `$BASE_BRANCH`'s whole file is a valid shortcut — the next check run
   re-adds anything the branch needs:

   | Operation                                   | Command                                  |
   | ------------------------------------------- | ---------------------------------------- |
   | Rebase of active branch onto `$BASE_BRANCH` | `git checkout --ours link-cache.jsonc`   |
   | Merge of `$BASE_BRANCH` into active branch  | `git checkout --theirs link-cache.jsonc` |

2. Stage the resolved files, then continue:
   - Rebase: `git add link-cache.jsonc && git rebase --continue`
   - Merge: `git add link-cache.jsonc && git commit --no-edit`
   - If other files were resolved in Preparation step 4, `git add` those too
     before continuing.

3. Rebase only: for each subsequent rebase stop that conflicts on
   `link-cache.jsonc`, repeat Resolve steps 1–2. If other paths are also
   conflicted on that stop, run Preparation step 4 first.

4. Run `npm run fix:link-cache` once, after the entire rebase/merge completes:
   it validates the resolved file (a duplicate entry or invalid JSONC fails the
   run) and normalizes it. Note: this runs a Hugo build (lean by default) and
   link check — requires network, installed npm dependencies, and populated
   submodules; can take several minutes.

5. Commit the changes, if any:

   ```sh
   git add link-cache.jsonc
   git diff --cached --quiet link-cache.jsonc || \
      git commit -m "Refresh link cache after resolving conflicts"
   ```

6. Push:
   - Merge: `git push`
   - Rebase: `git push --force-with-lease`

<!-- prettier-ignore-start -->
[cache-format]: https://github.com/chalin/link-cache/blob/main/docs/cache-format.md
[Link cache]: https://opentelemetry.io/site/build/link-checking/#link-cache
<!-- prettier-ignore-end -->
