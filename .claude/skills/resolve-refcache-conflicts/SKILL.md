---
name: resolve-refcache-conflicts
description:
  Skill for resolving static/refcache.json merge or rebase conflicts in the
  current branch or a specified PR.
argument-hint: '[optional-pr-number]'
---

`static/refcache.json` is an auto-generated file. Resolving conflicts requires
first taking the integration branch's side, finishing the merge/rebase, then
running `npm run fix:refcache` to restore any URLs unique to the active branch.

## Prerequisites

If the current branch has a merge or rebase in progress, then skip the rest of
this section and jump to **Preparation**.

The current branch must be clean (`git status --short`). If not clean, offer to
run `git stash` or `git commit` to clean it up, or stop.

If `$ARGUMENTS` is a PR number, then check out the PR branch with:
`gh pr checkout $ARGUMENTS`.

## Preparation

At this point, we are ready to resolve the conflicts in the active branch:

1. Determine the integration reference (`$BASE_BRANCH`) and fetch it:
   - If an `upstream` remote exists: `git fetch upstream`, use `upstream/main`.
   - Otherwise: `git fetch origin`, use `origin/main`.

2. If merge or rebase is in progress (`git status`), skip this step. Otherwise,
   ask the user whether to run `git merge $BASE_BRANCH` or
   `git rebase $BASE_BRANCH`, then run it.

3. If there are no conflicts: stop, we are done.

4. Conflicts other than `static/refcache.json`: resolve them with the user.

5. If no `static/refcache.json` conflict remains: stop, we are done. Otherwise,
   proceed to **Resolve**.

## Resolve

1. Check out the `$BASE_BRANCH` version of `static/refcache.json`. Assumes the
   active branch is being rebased/merged from `$BASE_BRANCH`, not the other way
   around:

   | Operation                                   | Command                                      |
   | ------------------------------------------- | -------------------------------------------- |
   | Rebase of active branch onto `$BASE_BRANCH` | `git checkout --ours static/refcache.json`   |
   | Merge of `$BASE_BRANCH` into active branch  | `git checkout --theirs static/refcache.json` |

2. Stage `static/refcache.json` and any other resolved files, then continue:
   - Rebase: `git add -u && git rebase --continue`
   - Merge: `git add -u && git commit --no-edit`

3. Rebase only: for each subsequent rebase stop that conflicts on
   `static/refcache.json`, repeat Resolve steps 1–2. If other paths are also
   conflicted on that stop, run Preparation step 4 first.

4. Run: `npm run fix:refcache`. Note: this runs a full Hugo build and link
   check, it requires network, installed npm dependencies, and populated
   submodules, and can take several minutes.

5. Commit the changes, if any:

   ```sh
   git add static/refcache.json
   git diff --cached --quiet static/refcache.json || \
      git commit -m "Refresh refcache after resolving conflicts"
   ```

6. Push:
   - Merge: `git push`
   - Rebase: `git push --force-with-lease`
