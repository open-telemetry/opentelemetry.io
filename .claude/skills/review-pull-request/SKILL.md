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

Cold-path detail lives under `references/`. Load each file **only when you enter
the step or action that uses it**:

- [`references/ci-checks.md`](./references/ci-checks.md) — workflow → check name
  → validation → fix table, shard rules, link-check escape hatch. Read during
  step 3 (walk CI checks).
- [`references/process-rules.md`](./references/process-rules.md) — CLA,
  linked-issue, locale-span, AI policy, submodules, branch freshness, stale,
  co-owned. Read during step 4 (verify process rules).
- [`references/labels.md`](./references/labels.md) — auto-applied labels,
  script-managed approval labels, and other PR-review labels. Read when the
  label set looks wrong or needs auditing.
- [`references/fix-bot-commands.md`](./references/fix-bot-commands.md) — the
  `/fix` and `/fix:<name>` comment syntax the `otelbot` workflow accepts. Read
  when recommending an automated fix.
- [`references/local-commands.md`](./references/local-commands.md) —
  `npm run check:*` / `fix:*` scripts for reproducing CI locally. Read when
  pointing the author at a local fix path.
- [`references/content-review.md`](./references/content-review.md) — docs
  content criteria + final review checklist. Read during step 5 (review content)
  and again before writing the review output.

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

1. **Fetch.** Pull PR metadata, diff, and check status:

   ```bash
   gh pr view <N> --json title,body,files,reviews,labels,author,isDraft,headRepositoryOwner
   gh pr diff <N>
   gh pr checks <N>
   ```

2. **Classify.** Group changed files: `content/en/blog/**`,
   `content/en/docs/**`, `content/<lang>/**`, `data/registry/**`, `.github/**`,
   `scripts/**`, config files. Classification drives which CI checks matter and
   which reference files apply.
3. **Walk CI checks.** Open
   [`references/ci-checks.md`](./references/ci-checks.md) and match each check
   from `gh pr checks` to the table. Note what each failure means and the
   suggested fix path.
4. **Verify process rules.** Open
   [`references/process-rules.md`](./references/process-rules.md) and walk the
   rules against the PR — especially CLA, linked-issue, locale-span, AI policy,
   and the approval-label workflow.
5. **Review content.** Open
   [`references/content-review.md`](./references/content-review.md). Defer to
   `review-blog-post` for blog PRs.
6. **Write output.** Use the shape in
   [Review Output Format](#review-output-format). Before finalizing, walk the
   checklist at the bottom of
   [`references/content-review.md`](./references/content-review.md#pr-review-checklist).

## Refcache {#refcache}

`static/refcache.json` is a 1MB+ cache of external-link status codes.
`npm run check:links` updates it as a side effect — authors commit the updated
file themselves (`pr-checks.md:99-104`). The `Links / REFCACHE updates?` job
fails if the refcache on the PR branch is stale relative to what the link check
produced.

Avoid hand-editing `refcache.json`. If a URL returns a non-200 for server
reasons (blocked bot, LinkedIn 999, etc.) use the `?link-check=no` /
`&link-check=no` query parameter on the URL (`pr-checks.md:123-129`).
Maintainers can validate 4xx entries via
`./scripts/double-check-refcache-4XX.mjs` (`pr-checks.md:131-143`).

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

Bundled skill resources (read on demand, see
[Bundled references](#bundled-references) for when-to-read guidance):

- [`references/ci-checks.md`](./references/ci-checks.md) — CI check table +
  shard rules + link-check escape hatch
- [`references/process-rules.md`](./references/process-rules.md) — CLA,
  linked-issue, locale-span, AI policy, submodules, freshness, stale, co-owned
- [`references/labels.md`](./references/labels.md) — auto / approval-script /
  other PR labels
- [`references/fix-bot-commands.md`](./references/fix-bot-commands.md) — `/fix`
  bot comment syntax
- [`references/local-commands.md`](./references/local-commands.md) —
  `npm run check:*` / `fix:*` scripts
- [`references/content-review.md`](./references/content-review.md) — docs
  content review criteria + final checklist

Source-of-truth files — if this skill drifts from them, trust the file:

- `content/en/docs/contributing/pull-requests.md` — AI policy (18-50), CLA (64),
  fix-command list (168-179), `npm run fix:all` local fix
- `content/en/docs/contributing/pr-checks.md` — CLA (30-32), Netlify (34-37),
  linters + file checks (48-97), build + links + refcache + maintainer Puppeteer
  script (99-143), site-local links (151-169)
- `content/en/docs/contributing/style-guide.md` — OpenTelemetry word list
  (42-60), link references (103-125), spelling (137-156), file format +
  kebab-case (166-179)
- `content/en/docs/contributing/localization.md` — locale-span rule (468-476),
  editorial cross-locale exceptions with `# patched` (478-536)
- `content/en/docs/contributing/sig-practices.md` — linked-issue requirement
  (131-134), auto-labeling + `missing:*` + stale policy (135-156), CLA failure
  recovery (169-172), co-owned PRs (188-202), translation PRs (218-222), merging
  workflow (224-235)
- `content/en/docs/contributing/issues.md` — issue linking from PRs (76-78)
- `content/en/docs/contributing/blog.md` — blog submission rules (defer to
  `review-blog-post`)
- `.github/workflows/check-text.yml`, `check-spelling.yml`, `check-file.yml`,
  `check-links.yml`, `check-registry.yml`, `check-i18n.yml` — authoritative job
  names and `npm run` commands
- `.github/workflows/pr-actions.yml` — `/fix` bot (otelbot identity 13-14,
  syntax 42-50, compat map 70-80, commit message 175)
- `.github/workflows/label-manager.yml` — auto-label entry + approval label
  automation
- `.github/workflows/pr-review-trigger.yml` — `pr-number` artifact handoff to
  label-manager on review events
- `.github/workflows/component-owners.yml` — SIG reviewer assignment via
  `dyladan/component-owners@v0.2.0`
- `.github/workflows/blog-publish-labels.yml` — daily blog publish-date label
  sweep
- `.github/scripts/pr-approval-labels.sh` — `ready-to-be-merged` +
  `missing:docs-approval` / `missing:sig-approval` / `missing:cla` rules
  (withheld on outstanding change-requested reviews)
- `.github/scripts/blog-publish-check.sh` — blog publish-date gating
- `.github/scripts/double-check-refcache-4XX.mjs` — maintainer Puppeteer
  refcache revalidation (path per `pr-checks.md:131-143`)
- `.github/component-label-map.yml` — path → label auto-labeling config
- `.github/component-owners.yml` — path → SIG reviewer assignment
- `.github/CODEOWNERS` — global `@open-telemetry/docs-approvers`
- `.github/PULL_REQUEST_TEMPLATE.md` — AI checklist and "don't rebase" guidance
- `.markdownlint.yaml` — `line-length: false` (so 80-col wrap is prettier, not
  markdownlint)
- `scripts/_md-rules/` — custom markdownlint rules (`no-shortcut-ref-link`,
  `no-typosquatting-urls`, `no-http-urls`, `no-lang-prefix-in-paths`,
  `no-otel-io-external-urls`, `alert-type-not-translated`,
  `trim-code-blank-lines`, `unindent-code-blocks`, `gh-url-hash`)
- `.textlintrc.yml` — terminology + prh rules
- `.cspell.yml`, `.cspell/en-words.txt` — spelling dictionary layout
- `package.json` — `check:*`/`fix:*` scripts (30-135), prettier
  `proseWrap: always` (197)
- Sibling skills: `review-blog-post` (blog-specific PR rules), `draft-issue`
  (full label taxonomy)
