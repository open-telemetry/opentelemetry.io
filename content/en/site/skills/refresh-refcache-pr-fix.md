---
title: Refresh-refcache PR fix
description: >-
  How to resolve outstanding non-2XX entries on the otelbot refcache-refresh PR.
---

Follow these steps to resolve non-2XX `static/refcache.json` entries in the
`otelbot/refcache-refresh` PR. This process may involve updating or removing
dead links on the site, then refreshing the refcache again until no non-2XX
entries remain.

## Preparation

These steps assume you have a local clone of the repository with the `upstream`
remote configured to point to the main repository. Run these steps locally from
the repository root.

1. Determine the PR associated with upstream `otelbot/refcache-refresh`.
2. If none exists, stop.
3. If a local `otelbot/refcache-refresh` branch already exists and contains
   commits that are not in `upstream/otelbot/refcache-refresh`, back them up or
   stop before resetting anything.
4. Check out the PR branch with `gh pr checkout <num>`. If that fails because
   the local branch has diverged and you have already backed up any local-only
   commits, realign it with upstream:

   ```sh
   git fetch upstream
   git checkout otelbot/refcache-refresh
   git reset --hard upstream/otelbot/refcache-refresh
   ```

5. If any content modules are out of date, run `npm run get:submodule`.

## Handling 5XX responses

Status 5XX responses are usually transient. If `static/refcache.json` or
`./scripts/double-check-refcache-4XX.mjs` (below) reports status 5XX for a URL,
treat it as likely temporary (origin down, gateway errors, overload). **Do not**
change site content or links solely to work around a 5XX; prefer re-running the
double-check script or `npm run fix:refcache` later. Only investigate a 5XX like
a real defect if it **keeps** failing across multiple runs over time and you
have confirmed the URL is not otherwise healthy.

## Resolve non-2XX entries

1. Run `./scripts/double-check-refcache-4XX.mjs` to retry transient 4XX failures
   and update `static/refcache.json`.
2. Scan `static/refcache.json` for remaining non-2XX statuses.
3. If none remain, commit and push any changed files (only
   `static/refcache.json` should have changed) to
   `upstream/otelbot/refcache-refresh`, then stop.
4. List remaining non-2XX URLs and their statuses:

   ```sh
   jq -r 'to_entries[] | select(.value.StatusCode < 200 or .value.StatusCode >= 300) | "\(.key) \(.value.StatusCode)"' \
     static/refcache.json
   ```

5. **Analyze and recommend**. For each URL from the previous step, produce a
   numbered or bulleted list that includes at least:
   - The URL and HTTP status.
   - Where it originates from: provide links to files or pages.
   - A recommendation. For links into github.com, recommend a replacement link
     based on the last commit that contains the named resource.

   Pause for feedback from a reviewer.

6. **Apply approved fixes.** After approval, edit the suggested sources:
   - For a **404**, update or remove the referring link where you identified it.
   - For **other non-2XX** statuses, apply the reviewed recommendation (manual
     inspection may still be required for ambiguous cases).

7. Run `npm run fix:refcache` to refresh `static/refcache.json` after those
   source-link changes, then repeat the steps in this section (from step 1)
   until no non-2XX statuses remain.
