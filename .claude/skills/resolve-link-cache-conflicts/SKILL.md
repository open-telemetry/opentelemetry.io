---
name: resolve-link-cache-conflicts
description:
  Skill for resolving .lycheecache merge or rebase conflicts in the current
  branch or a specified PR.
argument-hint: '[optional-pr-number]'
---

`.lycheecache` is an auto-generated file that merges with Git's `union` strategy
(see `.gitattributes`), so merges and rebases usually complete without conflict,
but they can leave duplicate or stale cache entries that fail the
`CACHE updates committed?` check. In either case the recovery is the same:
finish the merge/rebase (taking the integration branch's side for any residual
`.lycheecache` conflict), then run `npm run fix:link-cache` to restore any URLs
unique to the active branch and rewrite the cache clean.

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

3. If there are no conflicts: the union merge succeeded. If it changed
   `.lycheecache`, jump to **Resolve** step 4; otherwise stop, we are done.

4. Conflicts other than `.lycheecache`: resolve them with the user.

5. If no `.lycheecache` conflict remains: apply step 3's rule (jump to
   **Resolve** step 4 when the merge changed `.lycheecache`, else stop).
   Otherwise, proceed to **Resolve**.

## Resolve

1. Check out the `$BASE_BRANCH` version of `.lycheecache`. Assumes the active
   branch is being rebased/merged from `$BASE_BRANCH`, not the other way around:

   | Operation                                   | Command                              |
   | ------------------------------------------- | ------------------------------------ |
   | Rebase of active branch onto `$BASE_BRANCH` | `git checkout --ours .lycheecache`   |
   | Merge of `$BASE_BRANCH` into active branch  | `git checkout --theirs .lycheecache` |

2. Stage the resolved files, then continue:
   - Rebase: `git add .lycheecache && git rebase --continue`
   - Merge: `git add .lycheecache && git commit --no-edit`
   - If other files were resolved in Preparation step 4, `git add` those too
     before continuing.

3. Rebase only: for each subsequent rebase stop that conflicts on
   `.lycheecache`, repeat Resolve steps 1–2. If other paths are also conflicted
   on that stop, run Preparation step 4 first.

4. Run `npm run fix:link-cache` once, after the entire rebase/merge completes.
   Note: this runs a Hugo build (lean by default) and link check — requires
   network, installed npm dependencies, and populated submodules; can take
   several minutes.

5. Commit the changes, if any:

   ```sh
   git add .lycheecache
   git diff --cached --quiet .lycheecache || \
      git commit -m "Refresh link cache after resolving conflicts"
   ```

6. Push:
   - Merge: `git push`
   - Rebase: `git push --force-with-lease`
