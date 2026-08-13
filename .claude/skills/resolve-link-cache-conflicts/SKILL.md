---
name: resolve-link-cache-conflicts
description:
  Skill for recovering .lycheecache after a merge or rebase, whether from
  residual conflicts or union-merge residue, in the current branch or a
  specified PR.
argument-hint: '[optional-pr-number]'
---

`.lycheecache` is auto-generated and union-merged (policy: [Link cache][]), so
merges and rebases usually complete without conflict but can leave residue that
fails the `CACHE updates committed?` check. Either way, recover with the
procedure below.

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
   `git rebase $BASE_BRANCH`, then run it. For a branch created before
   `.gitattributes` gained the `.lycheecache` union rule, prefer rebase: merge
   attributes resolve against the current checkout's tree, which during a rebase
   is the updated base.

3. If there are no conflicts, the operation completes on its own. Union merges
   can still leave residue: when `.lycheecache` now has duplicate URLs or
   out-of-order lines (`cut -d, -f1 .lycheecache | sort | uniq -d` prints
   duplicates, or `sort -c .lycheecache` fails), jump to **Resolve** step 4.
   Otherwise stop, we are done.

4. Conflicts other than `.lycheecache`: resolve them with the user.

5. If a `.lycheecache` conflict remains, proceed to **Resolve**. Otherwise,
   conclude the operation per **Resolve** steps 2-3, then apply **Preparation**
   step 3's residue test.

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

<!-- prettier-ignore-start -->
[Link cache]: https://opentelemetry.io/site/build/link-checking/#link-cache
<!-- prettier-ignore-end -->
