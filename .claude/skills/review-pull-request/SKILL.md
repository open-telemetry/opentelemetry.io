---
name: review-pull-request
description: >-
  Review pull requests for opentelemetry.io: CI check semantics, CLA and
  approval-label workflow, refcache handling, locale rules, and content quality.
  Use when reviewing a PR or debugging a CI failure in
  open-telemetry/opentelemetry.io.
argument-hint: '<PR number or URL>'
allowed-tools: Bash Read Grep Glob
model: sonnet
effort: medium
---

# OTel PR Review

Review workflow for pull requests in `open-telemetry/opentelemetry.io`. Every
rule in this skill is grounded in a source-of-truth file in the repo — if a
claim here conflicts with one of those files, trust the file and update this
skill. See the [References](#references) section at the end.

For blog-specific rules (`gh-url-hash`, author format, publish-date gating),
defer to the sibling `review-blog-post` skill. For the full validated label
taxonomy, defer to `draft-issue`.

## Bundled references {#bundled-references}

Most reference material for this skill lives in the public site documentation
and the contributing guide. The skill loads them on demand rather than restating
the content. The only file under `references/` is the docs review checklist,
which is skill-specific:

- [`references/content-review.md`](./references/content-review.md) — docs
  content criteria + final review checklist. Read during step 4 (review content)
  and again before writing the review output.

External references the workflow points at — read on demand:

- [`content/en/docs/contributing/pr-checks.md`](../../../content/en/docs/contributing/pr-checks.md):
  every PR check workflow with jobs, validation, and local-fix command. Read
  during step 2 (walk CI checks).
- [`content/en/site/build/npm-scripts.md`](../../../content/en/site/build/npm-scripts.md):
  full `npm run` catalog. Read when pointing the author at a local fix path.
- [`content/en/docs/contributing/pull-requests.md`](../../../content/en/docs/contributing/pull-requests.md),
  [`content/en/docs/contributing/sig-practices.md`](../../../content/en/docs/contributing/sig-practices.md),
  [`content/en/docs/contributing/localization.md`](../../../content/en/docs/contributing/localization.md),
  [`content/en/docs/contributing/pr-checks.md`](../../../content/en/docs/contributing/pr-checks.md),
  [`content/en/docs/contributing/issues.md`](../../../content/en/docs/contributing/issues.md)
  — process rules deep-linked from step 3.
- `.claude/data/opentelemetry-website.yml` — full repository label taxonomy
  (read via the sibling `draft-issue` skill).

## Arguments {#arguments}

- If no `$ARGUMENTS` is provided, ask the user for a PR number or URL before
  proceeding.
- If `$ARGUMENTS` is a full GitHub URL containing `/pull/`, extract the numeric
  PR number from the path segment after `/pull/`.
- If `$ARGUMENTS` starts with `#`, strip the `#` and treat the remaining digits
  as the PR number.
- If `$ARGUMENTS` is a bare number, use it as the PR number.
- If `$ARGUMENTS` doesn't match any of the above patterns, stop and ask for a
  valid PR number or URL.

## When to Use {#when-to-use}

- Reviewing a PR in `open-telemetry/opentelemetry.io`
- Debugging a CI check failure on a PR
- Preparing your own PR for submission
- Understanding OTel contribution conventions before changing docs

## PR Review Workflow {#pr-review-workflow}

1. **Setup.** Pull PR metadata, diff, and checks, then classify the changed
   files:

   ```bash
   gh pr view <N> --json title,body,files,reviews,labels,author,isDraft,headRepositoryOwner
   gh pr diff <N>
   gh pr checks <N>
   ```

   Group files into `content/en/blog/**`, `content/en/docs/**`,
   `content/<lang>/**`, `data/registry/**`, `.github/**`, `scripts/**`, or
   config. Classification drives which CI checks matter and which reference
   files apply.

2. **Walk CI checks.** For each failing check, match the
   `<workflow-name> / <job-name>` against
   [`pr-checks.md`](../../../content/en/docs/contributing/pr-checks.md) — every
   check has a section explaining what it validates and the local fix command.
   Caveats:
   - Link checking is sharded (`en` / `locales-A-to-M` / `locales-N-to-Z`) — a
     single shard failing does not necessarily block merge. Read the specific
     failure.
   - Fork PRs can hit token-scope limits that look like check failures but are
     permissions artifacts. Read the log before concluding.
   - `Netlify Deploy Preview` failures: click **Details** for the build log
     before reasoning about them.

3. **Verify process rules.** Walk each themed group against the PR.

   **Pre-merge approval**
   - CLA: every commit author email is covered (CNCF EasyCLA) —
     [`pr-checks.md#easy-cla`](../../../content/en/docs/contributing/pr-checks.md#easy-cla).
   - Linked issue: PR references an issue labeled `triage:accepted`. Exceptions:
     auto-update PRs, hotfixes by maintainers/approvers —
     [`sig-practices.md#prs`](../../../content/en/docs/contributing/sig-practices.md#prs).
   - Co-owned PRs: docs approver + SIG/locale approver —
     [`sig-practices.md#co-owned-prs`](../../../content/en/docs/contributing/sig-practices.md#co-owned-prs),
     [`#translation-prs`](../../../content/en/docs/contributing/sig-practices.md#translation-prs).

   **Content origin**
   - Submodules: non-maintainer PRs should not touch them; a maintainer fixes
     before merge —
     [`sig-practices.md#general`](../../../content/en/docs/contributing/sig-practices.md#general).
   - Locale span: semantic changes per-locale; editorial cross-locale edits OK
     and append `# patched` to `default_lang_commit` —
     [`localization.md#prs-should-not-span-locales`](../../../content/en/docs/contributing/localization.md#prs-should-not-span-locales),
     [`#patch-locale-links`](../../../content/en/docs/contributing/localization.md#patch-locale-links).

   **Branch state**
   - Branch freshness: authors should not continuously rebase; maintainers
     update before merge —
     [`sig-practices.md#general`](../../../content/en/docs/contributing/sig-practices.md#general).
   - Stale handling: `stale` after 21 days inactivity; never auto-closed —
     [`sig-practices.md#prs`](../../../content/en/docs/contributing/sig-practices.md#prs).

4. **Review content.** Open
   [`references/content-review.md`](./references/content-review.md). Defer to
   `review-blog-post` for blog PRs.

5. **Write output.** Use the shape in
   [Review Output Format](#review-output-format). Before finalizing, walk the
   checklist at the bottom of
   [`references/content-review.md`](./references/content-review.md#pr-review-checklist).

## Refcache {#refcache}

`static/refcache.json` is a 1MB+ cache of external-link status codes.
`npm run check:links` updates it as a side effect — authors commit the updated
file themselves
([`pr-checks.md#build-and-check-links`](../../../content/en/docs/contributing/pr-checks.md#build-and-check-links)).
The `Links / REFCACHE updates?` job fails if the refcache on the PR branch is
stale relative to what the link check produced.

Avoid hand-editing `refcache.json`. If a URL returns a non-200 for server
reasons (blocked bot, LinkedIn 999, etc.) use the `?link-check=no` /
`&link-check=no` query parameter on the URL
([`pr-checks.md#handling-valid-external-links`](../../../content/en/docs/contributing/pr-checks.md#handling-valid-external-links)).
Maintainers can validate 4xx entries via
`./scripts/double-check-refcache-4XX.mjs`.

## Review Output Format {#review-output-format}

Structure the review as:

### CI Status Summary

One line per check result (pass/fail/skip) with a note for each failure. Call
out fork-PR permissions artifacts separately from real failures.

### Required Changes (Blocking)

Issues that must be fixed before merge. Ground each in a cited file or check
name.

### Suggested Improvements (Non-blocking)

Nice-to-haves. Terminology consistency, cross-link opportunities, phrasing.

### Positive Feedback

What the author did well. Keep short but present.

## References {#references}

Bundled skill resource (read on demand, see
[Bundled references](#bundled-references) for when-to-read guidance):

- [`references/content-review.md`](./references/content-review.md) — docs
  content review criteria + final checklist

External docs the skill points at — read on demand:

- [`content/en/docs/contributing/pr-checks.md`](../../../content/en/docs/contributing/pr-checks.md)
  — per-check decoder for failing PR checks (what each validates, how to fix).
  Read during step 3 (walk CI checks).
- [`content/en/site/build/npm-scripts.md`](../../../content/en/site/build/npm-scripts.md)
  — full `npm run` catalog (check / fix / build / test). Read when pointing the
  author at a local fix path.

Source-of-truth files — if this skill drifts from them, trust the file:
