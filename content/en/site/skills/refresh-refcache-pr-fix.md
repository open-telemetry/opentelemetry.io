---
title: Refresh-refcache PR fix
description: >-
  How to resolve outstanding non-2XX refcache entries on otelbot PRs.
---

Follow these steps to resolve non-2XX `static/refcache.json` entries on the
[target otelbot PRs](#target-prs). This process may involve updating or removing
dead links on the site, then refreshing the refcache again until no non-2XX
entries remain.

## Target PRs

By default, sweep all open otelbot PRs — those whose head branch matches
`otelbot/*`. When instructed, narrow the sweep to the named branch or group of
branches (for example, `otelbot/refcache-refresh`, or the spec/semconv
integration branches); ask if the instruction is ambiguous.

1. List the open otelbot PRs:

   ```sh
   gh pr list --search head:otelbot/ --json number,title,headRefName,isDraft
   ```

2. Determine which of them have failing link checks — checks of the `Links`
   workflow (`gh pr checks <num>`) — and report the full list: PR number, head
   branch, draft status, and whether it will be processed.
3. Process each PR that has link-check failures in turn, following the sections
   below. In those steps, _`TARGET_BRANCH`_ is the head branch of the PR being
   processed.

## Preparation

Run these steps from the root of a local clone with the `upstream` remote
pointing at the main repository.

1. Check out the PR branch: `gh pr checkout <num>`. If that fails because a
   local _`TARGET_BRANCH`_ has diverged, back up any local-only commits (or
   stop), then realign:

   ```sh
   git fetch upstream
   git checkout TARGET_BRANCH
   git reset --hard upstream/TARGET_BRANCH
   ```

2. If any content modules are out of date, run `npm run get:submodule`.

## Handling 5XX responses

Status 5XX responses are usually transient. If `static/refcache.json` or
`./scripts/double-check-refcache-4XX.mjs` (below) reports status 5XX for a URL,
treat it as likely temporary (origin down, gateway errors, overload). **Do not**
change site content or links solely to work around a 5XX; prefer re-running the
double-check script (with `--retry-404` if useful) or `npm run fix:refcache`
later. Only investigate a 5XX like a real defect if it **keeps** failing across
multiple runs over time and you have confirmed the URL is not otherwise healthy.

## Resolve non-2XX entries

1. Run `./scripts/double-check-refcache-4XX.mjs --retry-404` to re-fetch URLs
   still cached as 4XX and fragment URLs marked INVALID FRAGMENT, then update
   `static/refcache.json`. See LinkedIn note below.
2. Scan `static/refcache.json` for remaining non-2XX statuses.
3. If none remain, that is, the double-check script succeeds,
   [wrap up the PR](#wrap-up).
4. **Otherwise** (non-2XX still present after step 2), list remaining URLs and
   their statuses:

   ```sh
   jq -r 'to_entries[] | select(.value.StatusCode < 200 or .value.StatusCode >= 300) | "\(.key) \(.value.StatusCode)"' \
     static/refcache.json
   ```

   > [!NOTE] LinkedIn URLs
   >
   > Responses from `LinkedIn.com` are often unreliable (agents and bots may see
   > 403 or 404 even when profiles exist). **Do not** remove or edit LinkedIn
   > 4XX links, instead let a maintainer manually run
   > `./scripts/double-check-refcache-4XX.mjs --retry-404` locally first.

5. **Analyze and recommend**. For each URL from the previous step, produce a
   numbered or bulleted list that includes at least:
   - The URL and HTTP status.
   - Where it originates from: provide links to files or pages.
   - A recommendation. For links into github.com, recommend a replacement link
     based on the last commit that contains the named resource.
   - Where the fix belongs — in-branch; in a separate PR against `main` (for
     example, when the same dead link also affects `main` or several target
     PRs); or upstream in the source repository, for integration branches.

   Pause for feedback from a reviewer.

6. **Apply approved fixes.** After approval, edit the suggested sources:
   - For a **404**, update or remove the referring link where you identified it.
   - For **other non-2XX** statuses, apply the reviewed recommendation (manual
     inspection may still be required for ambiguous cases).
   - If any touched page is outside `content/en/`, follow
     [Localization](/docs/contributing/localization/#link-fixes-and-resource-updates)
     for that edit (e.g. `# patched` on `default_lang_commit`).

7. Run `npm run fix:refcache` to refresh `static/refcache.json` after those
   source-link changes, then repeat the steps in this section (from step 1)
   until no non-2XX statuses remain.

## Wrap up

Once no non-2XX entries remain on the PR being processed:

1. Share the double-check summary in your reply (retried URLs, entries updated,
   final HTTP status counts, and “Processed N URLs” when shown).
2. If `static/refcache.json` changed, commit and push to upstream
   _`TARGET_BRANCH`_. Use the double-check summary as the commit-message body
   (plain text; if the retried-URL list is long, include only the counts): it
   remains visible in the PR's commit history even after a squash merge.
3. Unless the skill invocation asks for no comment (e.g., it includes “no
   comment” or “silent”), add a comment to the PR
   (`gh pr comment <num> --body '…'`) consisting of:
   - The skill invocation, as inline code — reconstructed in minimal form (skill
     name and target selection only). Never quote the surrounding conversation,
     which may contain private or unrelated context.
   - A terse, one-or-two-line summary of the run.

   For example:

   ```text
   Refcache update done using: `/refresh-refcache-pr-fix for the collector-docs branch`

   Re-checked 12 cached 4XX/fragment URLs; all now 2XX — no non-2XX entries remain.
   ```

4. If the PR is **not** a draft and the link check was its only failing check,
   enable auto-merge (`gh pr merge <num> --auto --squash`), and **remind a
   maintainer to approve** the PR so that auto-merge can complete; include a
   link to the PR. Otherwise, report why the PR was left as is: draft status
   (for example, an integration PR that its own workflow finalizes at release
   time), or other failing checks.

Then continue with the next target PR, if any.
