---
title: Refresh-link-cache PR fix
aliases: [refresh-refcache-pr-fix]
description: >-
  How to resolve failing link checks on otelbot PRs.
---

Follow these steps to resolve failing link checks on the
[target otelbot PRs](#target-prs). This process may involve updating or removing
dead links on the site, then re-running the link check until no failures remain.

## Target PRs

By default, sweep all open otelbot PRs -- those whose head branch matches
`otelbot/*`. When instructed, narrow the sweep to the named branch or group of
branches (for example, `otelbot/refcache-refresh`, or the spec/semconv
integration branches); ask if the instruction is ambiguous. This skill operates
on PRs: if a named branch has no open PR, report that and stop.

1. List the open otelbot PRs:

   ```sh
   gh pr list --search head:otelbot/ --json number,title,headRefName,isDraft
   ```

2. Determine which of them have failing link checks -- checks of the `Links`
   workflow (`gh pr checks <num>`).
3. Report the sweep assessment **before processing any PR**: one line per PR --
   number, head branch, draft status, and whether it will be processed (with the
   reason when skipped).
4. Process each qualifying PR in turn, following the sections below, naming the
   PR as you start on it. In those steps, _`TARGET_BRANCH`_ is the head branch
   of the PR being processed.

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

Status 5XX responses are usually transient. If the link check reports status 5XX
for a URL, treat it as likely temporary (origin down, gateway errors, overload).
**Do not** change site content or links solely to work around a 5XX; prefer
re-running `npm run fix:link-cache` later. Only investigate a 5XX like a real
defect if it **keeps** failing across multiple runs over time and you have
confirmed the URL is not otherwise healthy.

## Resolve failing links

The link checker (Lychee) only caches successful results in `.lycheecache`, so
failing URLs are re-fetched on every run.

1. Build the site and check links: `npm run fix:link-cache`. This also updates
   `.lycheecache`. See LinkedIn note below.
2. If the check passes, [wrap up the PR](#wrap-up).
3. **Otherwise**, list the failing URLs and their statuses from the check output
   (for the CI run, see the PR's failing `CHECK LINKS` job log).

   > [!NOTE] LinkedIn URLs
   >
   > Responses from `LinkedIn.com` are often unreliable (agents and bots may see
   > 403, 404, or 999 even when profiles exist). **Do not** remove or edit
   > LinkedIn links over such statuses; instead let a maintainer manually
   > validate them.

4. **Analyze and recommend**. For each failing URL, report:
   - The URL and HTTP status.
   - Where it originates from: provide links to files or pages.
   - A recommended fix or follow-up action; see
     [Recommending a fix for failing URLs](#recommending-a-fix-for-failing-urls).
   - Where the fix belongs, for example:
     - In-branch
     - In a separate PR against `main`, when the same dead link also affects
       `main` or several target PRs
     - Upstream in the source repository, for integration branches

   Stop and wait for reviewer approval -- never self-approve recommendations.

5. **Apply approved fixes.** Perform the maintainer-approved fix and follow-up
   actions, and only those. For edits outside `content/en/`, follow
   [Localization][] gating requirements and conventions (e.g. `# patched` tags).

6. Run `npm run fix:link-cache` to re-check links (and refresh `.lycheecache`)
   after those source-link changes, then repeat the steps in this section (from
   step 1) until the check passes.

## Wrap up

Once the link check passes on the PR being processed:

1. Share the link-check summary in your reply (URLs re-checked or fixed, and
   final status counts when shown).
2. If `.lycheecache` changed, commit and push to upstream _`TARGET_BRANCH`_. Use
   the link-check summary as the commit-message body (plain text; if the URL
   list is long, include only the counts): it remains visible in the PR's commit
   history even after a squash merge.
3. Unless the skill invocation asks for no comment (e.g., it includes “no
   comment” or “silent”), add a comment to the PR
   (`gh pr comment <num> --body '…'`) consisting of:
   - The skill invocation, as inline code -- reconstructed in minimal form
     (skill name and target selection only). Never quote the surrounding
     conversation, which may contain private or unrelated context.
   - A terse, one-or-two-line summary of the run.

   For example:

   ```text
   Link-cache update done using: `/refresh-link-cache-pr-fix for the collector-docs branch`

   Re-checked the failing URLs; all now resolve -- the link check passes.
   ```

4. If the PR is **not** a draft and the link check was its only failing check,
   enable auto-merge (`gh pr merge <num> --auto --squash`), and **remind a
   maintainer to approve** the PR so that auto-merge can complete; include a
   link to the PR. Otherwise, report why the PR was left as is: draft status
   (for example, an integration PR that its own workflow finalizes at release
   time), or other failing checks.

Then continue with the next target PR, if any.

## Recommending a fix for failing URLs

Ground every recommendation in evidence, and match the fix to the situation:

- **Linked page moved**: update the link, with
  [evidence](#evidence-for-a-replacement-url) that the replacement matches.
- **Entry subject gone**: when the link originates from a registry or
  ecosystem-list entry -- adopters, distributions, integrations, vendors -- and
  the component, product, or company behind the entry is defunct, absorbed, or
  otherwise no longer actively supports OpenTelemetry,
  [retire the entry](#retiring-an-entry) instead of updating its links.
- **Linked page gone, no equivalent**: Agents must not apply this fix; defer to
  a maintainer. As a last resort, a **maintainer** may remove the link and
  rework the surrounding prose. Cc the GitHub handles of the following as
  appropriate:
  - Authors of the PRs that introduced the content
  - SIG docs approvers through their GitHub team handle

### Evidence for a replacement URL

Show that the fetched page names or otherwise matches the linked resource:

- A 2XX status alone proves nothing: SPA catch-alls and login pages return 200
  for any path.
- For links into github.com, base the replacement on the last commit that
  contains the named resource.
- The [Wayback Machine](https://web.archive.org/) can reveal what a dead URL
  used to serve or where it moved; check it briefly, but don't dig deep unless
  asked -- the archive is slow.

### Retiring an entry

- Remove the entry
- Cc in a PR comment the GitHub handles of the entry's original submitter and/or
  any authors who updated the entry, per
  [Keeping registry and list information current](/ecosystem/registry/updating/).

<!-- prettier-ignore-start -->
[Localization]: /docs/contributing/localization/#link-fixes-and-resource-updates
<!-- prettier-ignore-end -->
