---
name: otel-pr-review
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
defer to the sibling `otel-blog-review` skill. For the full validated label
taxonomy, defer to `otel-issue-draft`.

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
   `scripts/**`, config files. Classification drives which CI checks must be
   green and which sections of this skill apply.
3. **Walk CI checks.** Match each check from `gh pr checks` to the table in
   [CI Checks](#ci-checks) and note what a failure means.
4. **Verify process rules.** Walk [Process Rules](#process-rules) — especially
   linked-issue, locale-span, AI policy for first-time contributors, and the
   approval-label workflow.
5. **Review content.** See [Content Review](#content-review). Defer to
   `otel-blog-review` for blog PRs.
6. **Write output.** Use the shape in
   [Review Output Format](#review-output-format).

## CI Checks {#ci-checks}

Check names in `gh pr checks` follow `<workflow name> / <job name>`. Grouped by
workflow file:

| Workflow                               | Job(s)                                                                                                                                         | What it validates                                                                      | How to fix                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| _(external)_                           | `Easy CLA`                                                                                                                                     | CNCF CLA signed on every commit author email                                           | See [CLA](#cla)                                    |
| _(external)_                           | `netlify/opentelemetry Deploy Preview`                                                                                                         | Hugo build deploys on Netlify preview                                                  | Click **Details** for build log                    |
| `.github/workflows/check-text.yml`     | `Linter / TEXT linter`, `Linter / MARKDOWN linter`                                                                                             | textlint terminology + markdownlint (custom rules in `scripts/_md-rules/`)             | `npm run fix:text`, `npm run fix:markdown`         |
| `.github/workflows/check-spelling.yml` | `Spelling / SPELLING check`, `Spelling / CSPELL page-local word list check`                                                                    | cSpell + normalization of `cSpell:ignore` front-matter lists                           | Add to `cSpell:ignore` or `npm run fix:dict`       |
| `.github/workflows/check-file.yml`     | `Files / EXPIRED FILE check`, `Files / FILENAME check`, `Files / FILE FORMAT`, `Files / BRANCH NAME check`                                     | Expired `expiryDate`, kebab-case filenames, Prettier format, branch name is not `main` | `npm run fix:expired`/`fix:filenames`/`fix:format` |
| `.github/workflows/check-links.yml`    | `Links / BUILD`, `Links / CHECK LINKS (en \| locales-A-to-M \| locales-N-to-Z)`, `Links / REFCACHE updates?`, `Links / WARNINGS in build log?` | Hugo build, sharded htmltest link check, refcache freshness, build warnings            | See [Refcache](#refcache)                          |
| `.github/workflows/check-registry.yml` | `Registry / check:registry`                                                                                                                    | `data/registry/**` schema (only runs when registry files change)                       | `npm run check:registry` locally                   |
| `.github/workflows/check-i18n.yml`     | i18n drift check                                                                                                                               | `default_lang_commit` / `drifted_from_default` front-matter consistency                | `npm run fix:i18n`                                 |

Link checking is **sharded** into `en`, `locales-A-to-M`, `locales-N-to-Z`
(`.github/workflows/check-links.yml:82-90`). A single shard failing does not
necessarily block merge — read the specific failure. Fork PRs can have
restricted token scope; a check failure on a fork may be a permissions artifact
rather than a real issue. Look at the log before concluding.

**Site-local links.** The build emits a warning when a page links to a full
`https://opentelemetry.io/...` URL instead of a path. Use `/docs/concepts/` not
`https://opentelemetry.io/docs/concepts/`
(`content/en/docs/contributing/pr-checks.md:151-169`). The warning is enforced
via `layouts/_markup/render-link.html`; the script
`scripts/content-modules/adjust-pages.pl` auto-rewrites some cases.

**Link-check escape hatch.** If an external link returns a non-200 but is
manually validated (LinkedIn, servers that block checkers), append
`?link-check=no` or `&link-check=no` to the URL (`pr-checks.md:123-129`).
Maintainers can run `./scripts/double-check-refcache-4XX.mjs` to revalidate 4xx
entries via Puppeteer (`pr-checks.md:131-143`).

## Process Rules {#process-rules}

### CLA {#cla}

The repo uses the **CNCF CLA via Easy CLA** — not DCO. Every commit author email
must be covered (`pull-requests.md:64`, `pr-checks.md:30-32`). If `Easy CLA`
fails, ask the author to fix or rebase; worst case, close and re-open the PR to
retrigger the check (`sig-practices.md:169-172`). Do not ask for
`Signed-off-by:` trailers — they are not enforced.

### Linked issue {#linked-issue}

PRs must reference an issue labeled `triage:accepted`, with two exceptions:
auto-update PRs (registry / version bumps), and hotfixes by maintainers or
approvers (`sig-practices.md:131-134`). Use `Fixes #12345` / `Closes #12345`
syntax (`issues.md:76-78`).

### Locale span {#locale-span}

PRs with **semantic** changes must not span multiple locales
(`localization.md:468-476`). Locale approvers review English edits and propagate
them in their own locale-specific PRs.

**Purely editorial** changes _can_ span locales if each edited locale page also
gets `# patched` appended to its `default_lang_commit` front-matter line
(`localization.md:478-536`). Editorial examples: link fixes, resource-URL
updates, targeted content additions to drifted files.

### First-time contributor AI policy {#ai-policy}

First 3 contributions must be primarily human-written (AIL1); the PR description
must be entirely human-written (AIL0) (`pull-requests.md:18-50`; see also
`.github/PULL_REQUEST_TEMPLATE.md`). The PR template includes an AI checklist
the author must fill in. Reviewers should flag obvious AI-generated PR
descriptions from first-time contributors, but maintainers may grant drive-by
exceptions (`pull-requests.md:38-40`).

### Submodules {#submodules}

Non-maintainer PRs should **never** touch git submodules. If one does, tell the
author not to worry — a maintainer fixes it before merge
(`sig-practices.md:164-168`).

### Branch freshness {#branch-freshness}

Authors should **not** continuously rebase. Every sync retriggers CI. The PR
template explicitly says not to worry about being out-of-date
(`.github/PULL_REQUEST_TEMPLATE.md:30-31`, `sig-practices.md:162-164`).
Maintainers trigger a final update via the GitHub UI before merging, then
squash-merge (`sig-practices.md:224-235`):

```bash
export PR=<N>
gh pr checks $PR --watch && gh pr merge $PR --squash
```

### Stale handling {#stale-handling}

Automation adds `stale` after 21 days of inactivity; the label should be removed
within 14 days by pinging participants and removing it
(`sig-practices.md:153-155`). **PRs are never auto-closed**
(`sig-practices.md:156`).

### Co-owned PRs {#co-owned-prs}

PRs touching co-owned areas need **two approvals**: one docs approver, one SIG
(or locale) approver (`sig-practices.md:188-202`, `218-222`). After a docs
approval, a docs approver may add `sig-approval-missing` to signal the SIG. If
the SIG doesn't respond within ~2 weeks, a docs maintainer may merge at their
discretion.

## Labels {#labels}

For the full validated repo label taxonomy, see the `otel-issue-draft` skill.
This section enumerates only labels that matter at **PR review time**.

### Auto-applied (don't add by hand) {#auto-labels}

`.github/workflows/label-manager.yml` invokes `actions/labeler@v6` on
`pull_request_target` using `.github/component-label-map.yml` to add:

- Area: `blog`, `registry`, `i18n`
- `lang:<xx>` for every `content/<lang>/**` locale touched
- `sig:<name>` for SIG-owned paths (and a separate `component-owners.yml`
  workflow assigns the SIG reviewers via `dyladan/component-owners@v0.2.0`)

Don't hand-add these — the labeler will.

### Approval-workflow labels (managed by script) {#approval-labels}

`.github/scripts/pr-approval-labels.sh` manages three labels based on reviews
from `docs-approvers`, `docs-maintainers`, and the relevant SIG team (from
`.github/component-owners.yml`):

- `missing:cla` — CLA check failing
- `missing:docs-approval` — no docs-approver approval yet
- `missing:sig-approval` — SIG-team approval pending
- `ready-to-be-merged` — all required approvals present (and for blog PRs,
  publish date is today or past, per `blog-publish-check.sh`); **blocks if any
  reviewer has an outstanding change request**

Reviewers and drafters should **not** manually add or remove these — the script
is the source of truth. The label-manager workflow runs on `pull_request_target`
(opened/reopened/synchronize) and on `workflow_run` after
`pr-review-trigger.yml` captures a review event
(`.github/workflows/label-manager.yml`,
`.github/workflows/pr-review-trigger.yml`).

### Other PR labels to know {#other-pr-labels}

- `blocked` — waiting on external work (`sig-practices.md:152`)
- `stale` — inactivity marker (see [Stale handling](#stale-handling))
- `sig-approval-missing` — signal label from docs approver to SIG
  (`sig-practices.md:196-198`)
- `auto-update`, `0-meta`, `forever`, `admin` — workflow-internal; do not use on
  human PRs

## Fix Bot Commands {#fix-bot-commands}

`.github/workflows/pr-actions.yml` runs on `issue_comment` and lets anyone
trigger an automated fix run. Bot identity is `otelbot`
(`pr-actions.yml:13-14`).

**Syntax is strict** (`pr-actions.yml:42-50`): the comment body must be `/fix`
or `/fix:<name>` on its own, **with no other text**. A comment like "please run
/fix:format" is rejected.

- `/fix` — run all fixers (`fix:all`, minus i18n per `fix` alias in
  `package.json`)
- `/fix:all` — compat alias, mapped to `/fix` internally
  (`pr-actions.yml:70-74`)
- `/fix:ALL` — maintainer escape hatch that runs the _real_ `fix:all` including
  i18n (`pr-actions.yml:78-80`)
- `/fix:<name>` — run a single named fixer

Available `<name>` values (from `pull-requests.md:168-179` and `package.json`
scripts):

| Command               | What it does                                                       |
| --------------------- | ------------------------------------------------------------------ |
| `fix:dict`            | Normalize `cSpell:ignore` front-matter lists and `.cspell/*.txt`   |
| `fix:expired`         | Delete content past its `expiryDate`                               |
| `fix:filenames`       | Rename `snake_case` files to `kebab-case`                          |
| `fix:format`          | Prettier write + trim trailing whitespace                          |
| `fix:htmltest-config` | Regenerate htmltest config                                         |
| `fix:i18n`            | Update `default_lang_commit` / `drifted_from_default` front matter |
| `fix:markdown`        | `markdownlint --fix` + trim trailing whitespace                    |
| `fix:refcache`        | Prune 404s from refcache, then re-run link check                   |
| `fix:submodule`       | Pin submodules to specific commits                                 |
| `fix:text`            | Textlint `--fix`                                                   |

The bot applies the patch as a single commit with message "Results from /fix
directive" (`pr-actions.yml:175`); the author must `git pull` to stay in sync.

## Local Commands {#local-commands}

Drafters and reviewers can run any of these locally against a checkout (from
`package.json`):

**Checks** (read-only, mirror CI):

```sh
npm run check:all         # everything
npm run check:text
npm run check:markdown
npm run check:spelling
npm run check:format
npm run check:filenames
npm run check:expired
npm run check:links       # builds site + htmltest; also updates refcache
npm run check:i18n
npm run check:registry
```

**Fixes** (mutate files):

```sh
npm run fix:all           # runs every fix:* except i18n (via `fix` alias)
npm run fix:format
npm run fix:markdown
npm run fix:text
npm run fix:dict
npm run fix:filenames
npm run fix:refcache      # prune + check:links
```

**One-shot** (all fixes then all checks, excluding slow ones):
`npm run test-and-fix` — use this when triaging a long backlog of failures.

`package.json:197` sets prettier `proseWrap: always`, so prose is wrapped at 80
columns by `fix:format` / `check:format`, **not** by markdownlint
(`.markdownlint.yaml` has `line-length: false`).

## Refcache {#refcache}

`static/refcache.json` is a 1MB+ cache of external-link status codes.
`npm run check:links` updates it as a side effect — authors must
`git add static/refcache.json` and commit the changes themselves
(`pr-checks.md:99-104`). The `Links / REFCACHE updates?` job fails if the
refcache on the PR branch is stale relative to what the link check produced.

Do NOT hand-edit `refcache.json`. If a URL returns a non-200 for server reasons
(blocked bot, LinkedIn 999, etc.) use the `?link-check=no` / `&link-check=no`
query parameter on the URL (`pr-checks.md:123-129`). Maintainers can validate
4xx entries via `./scripts/double-check-refcache-4XX.mjs`
(`pr-checks.md:131-143`).

## Content Review {#content-review}

For blog PRs (`content/en/blog/**`): defer to the `otel-blog-review` skill — it
covers frontmatter, multi-author format, `gh-url-hash`, publish-date gating, and
cross-posting.

For docs PRs (`content/en/docs/**`), check:

- **Frontmatter.** Valid YAML, appropriate `title`, `linkTitle`, `weight`,
  `description`. Hugo-specific fields intact.
- **Terminology.** "OpenTelemetry" one word; "OTel" only after first full
  mention; signal names lowercase (`traces`, `metrics`, `logs`); component names
  cased (`SDK`, `API`, `Collector`); proper nouns cased. Enforced by `textlint`
  via `.textlintrc.yml` (`style-guide.md:42-60`).
- **Link references.** Prefer collapsed form `[text][]` over shortcut `[text]`;
  enforced by the custom `no-shortcut-ref-link` rule in `scripts/_md-rules/`
  (`style-guide.md:103-125`).
- **Markdown extensions.** GitHub alerts and Obsidian callouts are OK
  (`style-guide.md:76-101`).
- **Alt text on images.**
- **Hugo `ref` / `relref`** for internal cross-links, or plain paths
  (`/docs/...`) — never full `https://opentelemetry.io` URLs.
- **Code blocks** have a language tag.

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

## PR Review Checklist {#pr-review-checklist}

### CI and process

- [ ] `Easy CLA` green (or author has a fix path)
- [ ] Netlify preview builds
- [ ] Each failing `check-*` check assessed against the table in
      [CI Checks](#ci-checks)
- [ ] Linked issue is `triage:accepted` (or this is an auto/hotfix PR)
- [ ] Does not span multiple locales with semantic changes — or uses `# patched`
      for editorial cross-locale edits
- [ ] First-time contributor AI checklist in PR description is filled in and
      looks human-written
- [ ] No unrelated changes bundled

### Labels

- [ ] Auto-applied labels look correct (sig/lang/blog/registry/i18n); none added
      by hand
- [ ] `ready-to-be-merged` / `missing:*` not touched manually
- [ ] `sig-approval-missing` added if docs approval landed without SIG approval
      on a co-owned PR

### Content

- [ ] Frontmatter valid and complete
- [ ] Terminology consistent with style guide
- [ ] Code blocks have language tags
- [ ] Images have alt text
- [ ] Internal links use `/docs/...` paths or Hugo `ref`/`relref`; no full
      `opentelemetry.io` URLs
- [ ] No shortcut-form reference links

### Refcache and links

- [ ] `refcache.json` updates (if any) committed in the PR
- [ ] No hand-edits to `refcache.json`
- [ ] Unreachable-but-valid URLs use `?link-check=no`

### Blog PRs

- [ ] Deferred to `otel-blog-review` skill

## References {#references}

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
  `otel-blog-review`)
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
  `missing:docs-approval` / `missing:sig-approval` / `missing:cla` rules (blocks
  on outstanding change-requested reviews)
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
- Sibling skills: `otel-blog-review` (blog-specific PR rules),
  `otel-issue-draft` (full label taxonomy)
