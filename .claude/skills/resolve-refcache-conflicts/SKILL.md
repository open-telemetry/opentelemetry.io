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

1. Determine the integration reference (`$BASE_BRANCH`): run `git remote -v`; if
   an `upstream` remote exists, use `upstream/main`, otherwise use `main`.

2. If merge or rebase is in progress (`git status`), skip this step. Otherwise,
   ask the user whether to run `git merge $BASE_BRANCH` or
   `git rebase $BASE_BRANCH`, then run it.

3. If there are no conflicts: stop, we are done.

4. Conflicts other than `static/refcache.json`: resolve them with the user.

5. If no `static/refcache.json` conflict remains: stop, we are done. Otherwise,
   proceed to **Resolve**.

## Resolve

1. Check out the `$BASE_BRANCH` version of `static/refcache.json`. The correct
   command depends on the operation in progress (assumes the active branch is
   being rebased/merged from `$BASE_BRANCH`, not the other way around):
   - Rebase: `git checkout --ours static/refcache.json`
   - Merge: `git checkout --theirs static/refcache.json`

2. Run: `git add static/refcache.json`
3. Stage all resolved files, then `git rebase --continue` or `git commit` for
   merge.
4. Rebase only: for each subsequent rebase stop that conflicts on
   `static/refcache.json`, repeat Resolve steps 1–3. If other paths are also
   conflicted on that stop, run Preparation step 4 first.
5. Run: `npm run fix:refcache` (requires network and installed dependencies; can
   be slow)
6. Commit the changes, if any:

   ```sh
   git add static/refcache.json
   git diff --cached --quiet static/refcache.json || \
      git commit -m "Refresh refcache after resolving conflicts"
   ```

7. Push:
   - Merge: `git push`
   - Rebase: `git push --force-with-lease`
