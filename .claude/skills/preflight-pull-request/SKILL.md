---
name: preflight-pull-request
description: >-
  Preflight a pull request for opentelemetry.io before opening or updating it:
  classify the change, run the matching local checks, and verify the author-side
  process rules (branch hygiene, locale span, refcache, linked issue, AI
  policy). Use when preparing your own PR for submission in
  open-telemetry/opentelemetry.io.
argument-hint: '<optional PR number or URL; omit for the working branch>'
allowed-tools: Bash Read Grep Glob
model: sonnet
effort: medium
---

# Preflight Pull Request

Author-side preflight for pull requests in `open-telemetry/opentelemetry.io`.
Runs **before** you open or update a PR: it classifies the change, runs the
local checks that match it, and walks the process rules so the PR lands
review-ready. The contributing guide is the source of truth — when this skill
drifts from [`pull-requests.md`][pull-requests] or the per-check decoder in
[`pr-checks.md`][pr-checks], trust them.

This is the contributor counterpart to the `review-pull-request` skill (reviewer
side). For blog-specific rules defer to `review-blog-post`; for resolving
`refcache.json` conflicts defer to `resolve-refcache-conflicts`; for the linked
issue defer to `draft-issue`.

## Arguments {#arguments}

- If `$ARGUMENTS` is empty, inspect the **current working branch** against
  `upstream/main` (or `origin/main` if `upstream` is absent).
- If `$ARGUMENTS` is a GitHub URL containing `/pull/`, extract the numeric PR
  number after `/pull/` and preflight that PR's branch before an update.
- If `$ARGUMENTS` starts with `#`, strip the `#` and use the digits.
- If `$ARGUMENTS` is a bare number, use it as a PR number.

## When to use

- Before opening a PR from a local fork.
- Before pushing an update to an existing PR.
- When a PR's checks failed and you want to reproduce and fix them locally.

## Workflow

### 1. Select the target

- **Working branch** (no `$ARGUMENTS`): preflight the checked-out branch as-is.
- **PR number or URL**: check the PR out locally first, then preflight it
  (requires the GitHub CLI and a clone that can reach the PR's head). This mode
  is meant for updating **your own** PR; a branch from someone else's fork may
  be checked out detached or non-pushable:

  ```bash
  gh pr checkout <PR_NUMBER>
  ```

### 2. Classify the change

Resolve a base ref robustly, then list and group changed files — classification
drives which checks matter and which rules apply:

```bash
# Prefer upstream/main; fall back to origin/main. Fetch quietly first.
git fetch upstream --quiet 2>/dev/null || git fetch origin --quiet
BASE_REF=$(git rev-parse --verify --quiet upstream/main >/dev/null \
  && echo upstream/main || echo origin/main)

git diff --name-only "$BASE_REF...HEAD"
git status --short
```

Group files into `content/en/blog/**`, `content/en/docs/**`, `content/<lang>/**`
(localized), `data/registry/**`, `.github/**`, `scripts/**`, `static/**`, or
root config. Reuse `$BASE_REF` for the locale-span check in step 4.

### 3. Branch hygiene

From [`pull-requests.md#pr-guidelines`][pr-guidelines] and
[`#open-a-pr`][open-pr]:

- **Not on `main`.** Work from a PR-specific branch on your fork, never your
  fork's `main` (`git branch --show-current` must not be `main`).
- **Maintainer edits allowed.** Plan to leave "Allow edits from maintainers"
  enabled when you open the PR.

Keep the branch **single-focus** — no unrelated changes bundled in. The PR
guidelines don't state this outright, but smaller, focused PRs review and merge
faster ([`localization.md#small-prs`][small-prs]).

### 4. Locale span

From [`localization.md#prs-should-not-span-locales`][locale-span]: doc page
changes must **not span locales** with semantic changes. If the diff (against
`$BASE_REF`) touches **more than one locale** — any combination of
`content/en/**` and `content/<lang>/**`, or two non-English locales — flag it as
**manual-review-needed** rather than auto-failing — the line between a semantic
change (must split) and a purely editorial cross-locale edit (allowed, appends
`# patched` to `default_lang_commit`, see [`#patch-locale-links`][patch-locale])
needs human judgment. When in doubt, read [`localization.md`][localization] and
decide before opening the PR.

### 5. Run the matching checks

Two modes — keep them distinct ([`pull-requests.md#fix-issues`][fix-issues]):

- **Check-only** (reports; writes nothing **except** `check:links`, which
  refreshes `static/refcache.json` as a side effect — see step 6):
  `npm run test`.
- **Fix** (may modify files — review and commit what it changes): `npm run fix`,
  or `npm run test-and-fix` to do both in one pass.

After any fix run, **commit the files it changed** in a new commit. For a
targeted loop, map the change type to its CI check — `check:*` only reports,
`fix:*` writes ([`pr-checks.md#checks`][checks]):

| Change touches         | Check-only (reports)      | Fix (writes files)             |
| ---------------------- | ------------------------- | ------------------------------ |
| Any Markdown prose     | `npm run check:text`      | `npm run check:text -- --fix`  |
| Markdown structure     | `npm run check:markdown`  | `npm run fix:markdown`         |
| New/renamed words      | `npm run check:spelling`  | (manual: edit dicts)           |
| `cSpell:ignore` / dict | (no standalone check)     | `npm run fix:dict`             |
| Any file (format)      | `npm run check:format`    | `npm run fix:format`           |
| New/renamed files      | `npm run check:filenames` | `npm run fix:filenames`        |
| Links or new pages     | `npm run check:links`     | (updates refcache; see step 6) |
| Localized content      | `npm run check:l10n`      | `npm run fix:l10n`             |

Run `npm run` for the full script catalog ([`npm-scripts.md`][npm-scripts]); not
every check has a paired fixer, and some `check:*` names may differ — confirm
against the catalog before relying on one.

### 6. Refcache

`npm run check:links` updates `static/refcache.json` as a side effect — you must
**commit the updated file yourself**; the `Links / REFCACHE updates?` CI job
fails if the on-branch cache is stale. Do not hand-edit it. For a valid URL that
returns a non-200 (blocked bot, LinkedIn 999, …), append `?link-check=no` (or
`&link-check=no`) to the URL —
[`pr-checks.md#handling-valid-external-links`][handling-links].

### 7. AI contribution policy

From [`pull-requests.md#using-ai`][using-ai]:

- **First-time contributors** (first 3 contributions): code primarily
  human-written (AIL1 — AI only for completion/formatting/linting); the **PR
  description must be entirely human-written** (AIL0).
- Either way, **you are responsible** for reviewing and validating all
  AI-generated content. If you don't understand it, don't submit it.

### 8. Linked issue and draft status

- **Linked issue.** Reference it in the description with `Fixes #12345` or
  `Closes #12345` so automation closes it on merge ([`#open-a-pr`][open-pr]).
  PRs generally reference an issue labeled `triage:accepted`
  ([`sig-practices.md#prs`][prs]); auto-update PRs and maintainer/approver
  hotfixes are exempt. If the GitHub CLI is available, verify the label rather
  than guessing:

  ```bash
  gh issue view <ISSUE_NUMBER> --repo open-telemetry/opentelemetry.io \
    --json labels --jq '.labels[].name'
  ```

  Without `gh`, treat this as a **manual reminder**: confirm the linked issue
  exists and is `triage:accepted` before opening.

- **Title.** ≤ 50 characters, summarizes intent.
- **Draft.** If the work isn't ready for full review, open it as a **Draft** so
  maintainers know ([`pull-requests.md`][how-to-contribute] tip). Via web: the
  "Create pull request" button has a dropdown → "Create draft pull request". Via
  CLI: `gh pr create --draft`.

## Final pass and output

Walk this checklist before opening or updating the PR:

**Local checks**

- [ ] `npm run test-and-fix` run; files it changed are committed.
- [ ] Each check matching the change type is green locally.
- [ ] `static/refcache.json` updates (if any) committed; not hand-edited.

**Process**

- [ ] On a PR-specific branch, not the fork's `main`.
- [ ] No unrelated changes bundled.
- [ ] CNCF CLA signed (every commit author email covered) — the `Easy CLA`
      check blocks merge otherwise.
- [ ] Does not span locales with semantic changes (or uses `# patched` for
      editorial cross-locale edits).
- [ ] Linked issue referenced with `Fixes`/`Closes`; issue is `triage:accepted`.
- [ ] Title ≤ 50 chars.
- [ ] First-time contributor: code primarily human-written; PR description
      entirely human-written.
- [ ] Draft status set if not ready for full review.

Then produce a **Preflight Report**:

- **Change Summary** — one line: type(s) of change and files touched.
- **Checks Run** — one line per check (pass/fix-applied/manual-fix-needed).
- **Blockers** — must fix before opening/updating. Cite a file or rule for each.
- **Reminders** — draft status, linked issue, description authorship.

## References {#references}

Source-of-truth files — read on demand:

- [`pull-requests.md`][pull-requests] — submitting content, fork workflow, AI
  policy, fix loop, merge requirements.
- [`pr-checks.md`][pr-checks] — per-check decoder (what each check validates,
  how to fix).
- [`npm-scripts.md`][npm-scripts] — full `npm run` catalog.
- [`localization.md`][localization] — locale-span and patch-link rules.
- [`sig-practices.md`][sig-practices] — `triage:accepted` requirement and its
  auto-update / hotfix exceptions.

[pull-requests]: ../../../content/en/docs/contributing/pull-requests.md
[how-to-contribute]:
  ../../../content/en/docs/contributing/pull-requests.md#how-to-contribute
[pr-guidelines]:
  ../../../content/en/docs/contributing/pull-requests.md#pr-guidelines
[open-pr]: ../../../content/en/docs/contributing/pull-requests.md#open-a-pr
[fix-issues]: ../../../content/en/docs/contributing/pull-requests.md#fix-issues
[using-ai]: ../../../content/en/docs/contributing/pull-requests.md#using-ai
[pr-checks]: ../../../content/en/docs/contributing/pr-checks.md
[checks]: ../../../content/en/docs/contributing/pr-checks.md#checks
[handling-links]:
  ../../../content/en/docs/contributing/pr-checks.md#handling-valid-external-links
[npm-scripts]: ../../../content/en/site/build/npm-scripts.md
[localization]: ../../../content/en/docs/contributing/localization.md
[small-prs]: ../../../content/en/docs/contributing/localization.md#small-prs
[sig-practices]: ../../../content/en/docs/contributing/sig-practices.md
[prs]: ../../../content/en/docs/contributing/sig-practices.md#prs
[locale-span]:
  ../../../content/en/docs/contributing/localization.md#prs-should-not-span-locales
[patch-locale]:
  ../../../content/en/docs/contributing/localization.md#patch-locale-links
