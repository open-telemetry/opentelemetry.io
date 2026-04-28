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

# Review Pull Request

Review workflow for pull requests in `open-telemetry/opentelemetry.io`. The
contributing guide and the per-check decoder in
[`pr-checks.md`][pr-checks] are the authoritative sources — when this skill
drifts from them, trust them.

For blog-specific rules (`gh-url-hash`, author front matter, publish-date
gating), defer to the sibling `review-blog-post` skill. For label drafting
guidance, defer to `draft-issue`.

## Arguments {#arguments}

- If `$ARGUMENTS` is empty, ask for a PR number or URL.
- If `$ARGUMENTS` is a GitHub URL containing `/pull/`, extract the numeric
  PR number after `/pull/`.
- If `$ARGUMENTS` starts with `#`, strip the `#` and use the digits.
- If `$ARGUMENTS` is a bare number, use it.
- Otherwise, stop and ask for a valid PR number or URL.

## When to use

- Reviewing a PR in `open-telemetry/opentelemetry.io`.
- Debugging a CI check failure on a PR.
- Preparing your own PR for submission.

## Workflow

### 1. Setup

Pull metadata, diff, and checks; classify changed files:

```bash
gh pr view <N> --json title,body,files,reviews,labels,author,isDraft,headRepositoryOwner
gh pr diff <N>
gh pr checks <N>
```

Group files into `content/en/blog/**`, `content/en/docs/**`,
`content/<lang>/**`, `data/registry/**`, `.github/**`, `scripts/**`, or
config — classification drives which CI checks matter and which rules apply.

### 2. Walk CI checks

For each failing check, match `<workflow-name> / <job-name>` against
[`pr-checks.md`][pr-checks] — every check has a section describing what it
validates and the local fix command. Caveats:

- Link checking is sharded (`en` / `locales-A-to-M` / `locales-N-to-Z`); a
  single failing shard does not necessarily block merge — read the failure.
- Fork PRs can hit token-scope limits that look like check failures but are
  permissions artifacts. Read the log before concluding.
- `Netlify Deploy Preview` failures: open **Details** for the build log
  before reasoning about them.

### 3. Verify process rules

**Pre-merge approval**

- CLA: every commit author email is covered (CNCF EasyCLA) —
  [`pr-checks.md#easy-cla`][cla].
- Linked issue: PR references an issue labeled `triage:accepted`.
  Exceptions: auto-update PRs and hotfixes by maintainers/approvers —
  [`sig-practices.md#prs`][prs].
- Co-owned PRs: docs approver + SIG/locale approver —
  [`sig-practices.md#co-owned-prs`][co-owned] and
  [`#translation-prs`][translation].

**Content origin**

- Submodules: non-maintainer PRs should not touch them; a maintainer fixes
  before merge — [`sig-practices.md#general`][general].
- Locale span: semantic changes are per-locale; editorial cross-locale edits
  are OK and append `# patched` to `default_lang_commit` —
  [`localization.md#prs-should-not-span-locales`][locale-span] and
  [`#patch-locale-links`][patch-locale].

**Branch state**

- Branch freshness: authors should not continuously rebase — maintainers
  update before merge — [`sig-practices.md#general`][general].
- Stale handling: `stale` after 21 days inactivity; never auto-closed —
  [`sig-practices.md#prs`][prs].

### 4. Review content

For docs PRs (`content/en/docs/**`):

- **Front matter.** Valid YAML; appropriate `title`, `linkTitle`, `weight`,
  `description`; Hugo-specific fields intact.
- **Terminology.** "OpenTelemetry" one word; "OTel" only after first full
  mention; signal names lowercase (`traces`, `metrics`, `logs`); component
  names cased (`SDK`, `API`, `Collector`); proper nouns cased. Enforced by
  `textlint` via `.textlintrc.yml`.
- **Link references.** Prefer collapsed form `[text][]` over shortcut
  `[text]`; enforced by `scripts/_md-rules/no-shortcut-ref-link/`.
- **Markdown extensions.** GitHub alerts and Obsidian callouts are OK.
- **Internal links.** Use Hugo `ref` / `relref` or paths starting with
  `/docs/...`; never full `https://opentelemetry.io` URLs.
- **Code blocks** carry a language tag; **images** carry meaningful alt
  text.

For blog PRs (`content/en/blog/**`), defer to the `review-blog-post` skill.

### 5. Final pass and output

Walk this checklist before writing the review:

**CI and process**

- [ ] `Easy CLA` green (or author has a fix path).
- [ ] Netlify preview builds.
- [ ] Each failing `check-*` assessed against
      [`pr-checks.md#checks`][checks].
- [ ] Linked issue is `triage:accepted` (or this is an auto/hotfix PR).
- [ ] Does not span locales with semantic changes — or uses `# patched`
      for editorial cross-locale edits.
- [ ] First-time-contributor AI checklist in the PR description is filled
      in and looks human-written.
- [ ] No unrelated changes bundled.

**Labels**

- [ ] Auto-applied labels look correct (sig/lang/blog/registry/i18n); none
      added by hand.
- [ ] `ready-to-be-merged` / `missing:*` not touched manually.
- [ ] `sig-approval-missing` added if docs approval landed without SIG
      approval on a co-owned PR.

**Content**

- [ ] Front matter valid; terminology consistent; code blocks tagged;
      images have alt text; internal links use paths or Hugo refs (not
      `opentelemetry.io` URLs); no shortcut-form reference links.

**Refcache and links**

- [ ] `refcache.json` updates (if any) committed in the PR.
- [ ] No hand-edits to `refcache.json`.
- [ ] Unreachable-but-valid URLs use `?link-check=no` (see
      [Refcache](#refcache)).

Then structure the review as:

- **CI Status Summary** — one line per check (pass/fail/skip); call out
  fork-PR permissions artifacts separately from real failures.
- **Required Changes (Blocking)** — issues that must be fixed before
  merge. Cite a file or check name for each.
- **Suggested Improvements (Non-blocking)** — terminology, cross-link
  opportunities, phrasing.
- **Positive Feedback** — short but present.

## Refcache {#refcache}

`static/refcache.json` is a 1MB+ cache of external-link status codes.
`npm run check:links` updates it as a side effect — authors commit the
updated file themselves
([`pr-checks.md#build-and-check-links`][build-checks]). The
`Links / REFCACHE updates?` job fails if the on-branch cache is stale
relative to what the link check produced.

Do not hand-edit `refcache.json`. If a URL returns a non-200 for server
reasons (blocked bot, LinkedIn 999, …), append `?link-check=no` (or
`&link-check=no`) to the URL —
[`pr-checks.md#handling-valid-external-links`][handling-links]. Maintainers
can validate 4xx entries via `./scripts/double-check-refcache-4XX.mjs`.

For resolving merge/rebase conflicts in `refcache.json`, see the
`resolve-refcache-conflicts` skill.

## References

Source-of-truth files — read on demand:

- [`pr-checks.md`][pr-checks] — per-check decoder (what each check
  validates, how to fix).
- [`npm-scripts.md`][npm-scripts] — full `npm run` catalog.
- [`pull-requests.md`][pull-requests],
  [`sig-practices.md`][sig-practices],
  [`localization.md`][localization],
  [`issues.md`][issues] — process rules deep-linked above.

[pr-checks]: ../../../content/en/docs/contributing/pr-checks.md
[checks]: ../../../content/en/docs/contributing/pr-checks.md#checks
[cla]: ../../../content/en/docs/contributing/pr-checks.md#easy-cla
[build-checks]:
  ../../../content/en/docs/contributing/pr-checks.md#build-and-check-links
[handling-links]:
  ../../../content/en/docs/contributing/pr-checks.md#handling-valid-external-links
[npm-scripts]: ../../../content/en/site/build/npm-scripts.md
[pull-requests]: ../../../content/en/docs/contributing/pull-requests.md
[sig-practices]: ../../../content/en/docs/contributing/sig-practices.md
[localization]: ../../../content/en/docs/contributing/localization.md
[issues]: ../../../content/en/docs/contributing/issues.md
[prs]: ../../../content/en/docs/contributing/sig-practices.md#prs
[co-owned]:
  ../../../content/en/docs/contributing/sig-practices.md#co-owned-prs
[translation]:
  ../../../content/en/docs/contributing/sig-practices.md#translation-prs
[general]: ../../../content/en/docs/contributing/sig-practices.md#general
[locale-span]:
  ../../../content/en/docs/contributing/localization.md#prs-should-not-span-locales
[patch-locale]:
  ../../../content/en/docs/contributing/localization.md#patch-locale-links
