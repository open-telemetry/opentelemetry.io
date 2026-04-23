---
name: otel-blog-review
description: >-
  Review OpenTelemetry blog posts for front matter compliance, content
  conventions, GitHub link stability (`gh-url-hash`), spelling, and OTel
  terminology. Use when reviewing a PR or draft under `content/en/blog/`.
argument-hint: '<blog post path or PR number>'
allowed-tools: Read Grep Glob Bash
model: sonnet
effort: medium
---

# OTel Blog Review

Review workflow for OpenTelemetry blog posts. Every rule in this skill is
grounded in a source-of-truth file in the `opentelemetry.io` repo — if a claim
here conflicts with one of those files, trust the file and update this skill.

## When to Use

Invoke when reviewing a PR or local draft that adds or modifies a file under
`content/en/blog/`. Also useful before submitting a new post, to self-check
front matter and conventions.

## Arguments {#arguments}

- If no `$ARGUMENTS` is provided, ask the user for a file path or PR number
  before proceeding.
- If the `$ARGUMENTS` contains `/` or ends in `.md`, treat it as a file path
  relative to the repo root.
- If the `$ARGUMENTS` is a full GitHub URL containing `/pull/`, extract the
  numeric PR number from the path segment after `/pull/`.
- If the `$ARGUMENTS` is a bare number or starts with `#`, strip the `#` and
  treat it as a PR number.
- If the `$ARGUMENTS` doesn't match any of the above patterns, stop and ask for
  a valid file path or PR number.

## Blog Post Location and Scaffolding

Blog posts live under `content/en/blog/YYYY/`, where `YYYY` is the year of
publication.

- **No images** → single file: `content/en/blog/YYYY/short-name.md`
- **With images** → directory with `index.md` plus image files:
  `content/en/blog/YYYY/short-name/index.md`

The `short-name` is a concise, descriptive identifier in kebab-case (lowercase
letters and hyphens). No dates, no special characters.

Scaffold a new post with Hugo:

```sh
# No images
npx hugo new content/en/blog/$(date +%Y)/short-name-for-post.md

# With images (creates a directory)
npx hugo new content/en/blog/$(date +%Y)/short-name-for-post/index.md
```

The file is initialized from `archetypes/blog.md`.

## Front matter Rules

Every blog post MUST have:

```yaml
title: Full title
linkTitle: Short nav label
date: YYYY-MM-DD
author: '[First Last](https://github.com/handle)'
```

### Required fields

- **`title`** — full post title. Sentence-case is typical but not enforced; a
  few recent posts use Title Case for proper-noun-heavy titles. Keep it
  descriptive and concise.
- **`linkTitle`** — shorter label for navigation lists. Marked **Mandatory** in
  the archetype.
- **`date`** — exactly `YYYY-MM-DD`. Drives publish scheduling (see
  [Publish Timing](#publish-timing)). Keep it updated until the PR merges.
- **`author`** — two forms are idiomatic:

  **Single-author, single-line:**

  ```yaml
  author: '[Juraci Paixao Krohling](https://github.com/jpkrohling) (OllyGarden)'
  ```

  **Multi-author (folded block scalar):**

  ```yaml
  author: >-
    [Johanna Öjeling](https://github.com/johannaojeling) (Grafana Labs),
    [Juliano Costa](https://github.com/julianocosta89) (Datadog), [Tristan
    Sloughter](https://github.com/tsloughter) (community)
  ```

  Multi-author posts must use the folded `>-` form because the list spans
  multiple lines. The `(Organization)` suffix is optional but common.

### Optional fields

- **`draft: true`** — work-in-progress. Required for future-dated posts.
- **`canonical_url`** — for cross-posts. Points to the original source. This is
  the preferred spelling.
- **`crosspost_url`** — an older variant that still appears in the wild (e.g., a
  couple of 2024 posts). Prefer `canonical_url` for new posts.
- **`body_class: otel-with-contributions-from`** — set when secondary authors
  are credited in the intro paragraph (see
  [Multiple Authors](#multiple-authors)).
- **`issue`** — GitHub issue ID of the pre-submission approval issue, if one
  exists. Optional; only ~15% of recent posts set this.
- **`sig`** — name of the sponsoring SIG (e.g., `Developer Experience SIG`,
  `Semantic Conventions`). Optional per the contributing guide — "having a
  sponsor is optional, but having one increases the chance of having your blog
  post reviewed and approved more quickly." When present, the PR should carry a
  matching `sig:<name>` label so the publish workflow can find it.
- **`cSpell:ignore`** — space-separated list of words that should not be
  spell-checked in this post. See [Spelling](#spelling).

## Submission Prerequisites

From `content/en/docs/contributing/blog.md`:

- **No vendor product pitches.** Content must be non-commercial and apply
  broadly to the OpenTelemetry community.
- **Prefer CNCF projects** in examples and demos: Jaeger for trace
  visualization, Prometheus for metric visualization, etc.
- **Pre-submission issue required.** Open an issue naming the title, outline,
  technologies used, and a sponsoring SIG. A sponsor (maintainer or approver
  from the SIG, ideally from a different company than the author) is strongly
  recommended.
- **Follow the Social Media Guide** policy linked from the contributing doc.
- **"Call for Contributors" posts** follow the project-management and donation
  processes in the `open-telemetry/community` repo.

## Content Rules

### Headings

- **No H1.** The H1 is auto-generated from the `title` front matter field.
- Start content headings at `##` (H2).
- Maintain hierarchy: H2 → H3 → H4. Don't skip levels.

### Line Wrapping

Wrap prose at 80 columns. This is a **convention enforced by `npm run format`**
(prettier with `proseWrap: always`), not by markdownlint — the repo's
`.markdownlint.yaml` sets `line-length: false`. Don't manually re-wrap lines;
run the formatter:

```sh
npm run format
```

Exceptions that should not be wrapped: URLs, code blocks, front matter values.

### Images

- Place images in the same directory as `index.md`.
- Use descriptive kebab-case filenames.
- Always include meaningful alt text.
- Reference with relative paths: `![Alt text](image-name.png)`.

### Multiple Authors

- Primary authors go in the `author` front matter field (folded form for lists).
- If you want to credit **secondary contributors** who aren't in the `author`
  field, add them in the intro paragraph with:

  > "With contributions from [Name](https://github.com/username), ..."

- Set `body_class: otel-with-contributions-from` when doing this.

### Code Blocks

- Always include a language tag (` `sh `, ` `yaml `, ` `go ```, etc.).
- Ensure examples are accurate and current.

### Writing Style

General guidance, not linter-enforced:

- Prefer active voice.
- Link external tools and libraries on first mention.
- Link OTel concepts to the docs on first mention.
- Don't over-link — only the first mention per page.

## GitHub Links (`gh-url-hash`)

Blog posts are subject to a **blog-only** markdownlint rule, `gh-url-hash`,
defined in `scripts/_md-rules/gh-url-hash/index.mjs` and enabled via
`content/en/blog/.markdownlint.yaml`. The rule enforces stable GitHub
`blob`/`tree` URLs. It blocks:

- References to default branches (`main`, `master`, etc.) in blob/tree URLs.
- Short commit hashes (anything less than a full 40-character SHA).

It allows:

- Tags and release refs (e.g., `v1.42.0`).
- Full 40-character commit SHAs.

### Fixing violations

```sh
npm run fix:markdown
```

Auto-fix mode resolves default-branch links by looking up the current HEAD
commit via the GitHub commits page. It requires network access and can fail on
rate limits or unreachable resources — in that case, fix links manually by
copying a full SHA or using a release tag.

## Spelling

Spell-checking uses cSpell (config at `.cspell.yml`).

- **Repo-wide words** (project names, common technical terms, frequent author
  names) live in `.cspell/en-words.txt`. Add to this file for words you'll use
  repeatedly across the site.
- **Post-local words** go in the `cSpell:ignore` front matter field:

  ```yaml
  cSpell:ignore: devex Sloughter Öjeling
  ```

- **`# prettier-ignore`** only when the line is long enough that
  `npm run format` would wrap it. Short `cSpell:ignore` lines don't need it.
  Example where it's needed:

  ```yaml
  # prettier-ignore
  cSpell:ignore: jpkrohling Krohling logdedup logdedupprocessor OllyGarden OTTL Paixao telemetrygen
  ```

## OTel Terminology

- **"OpenTelemetry"** is spelled as one word (never "Open Telemetry").
- **"OTel"** is acceptable as shorthand, but only after the first full
  "OpenTelemetry" mention in the post.
- **Signal names are lowercase**: traces, metrics, logs.
- **Component names are properly cased**: SDK, API, Collector.
- **Semantic convention attributes** use current names (check
  `opentelemetry.io/docs/specs/semconv/`).
- **Proper nouns**: Jaeger, Zipkin, Prometheus, Kubernetes.

## Publish Timing {#publish-timing}

- The `date` field determines when the post goes live.
- For future-dated posts, keep `draft: true` until ready.
- A daily GitHub Actions workflow (`.github/workflows/blog-publish-labels.yml`,
  runs at 7 AM UTC) adds the `ready-to-be-merged` label to a blog PR only when
  **all** of the following hold:
  - Docs-approver approval is present.
  - SIG / component-owner approval is present.
  - The post's `date:` is in the past or today.
- The workflow **does not auto-merge** — it only labels. A human still merges
  the PR.
- Date alone is not enough; approvals alone are not enough.

## Cross-Posting

From the contributing guide: decide which version is canonical (typically the
original OpenTelemetry post). On any external copy:

- Clearly mention that the original appeared on the OpenTelemetry blog.
- Link back to the original at the top or bottom.
- Set a canonical URL tag on the external version pointing to the OTel post, if
  the platform supports it.

When the OpenTelemetry post is the cross-post (not the original), set
`canonical_url` in its front matter pointing to the original source.

## Review Checklist

Walk this list top-to-bottom against the post.

### Location and filename

- [ ] Path is `content/en/blog/YYYY/` with correct year.
- [ ] Single-file layout (`short-name.md`) only if no images; otherwise
      directory layout with `index.md`.
- [ ] `short-name` is kebab-case, no dates, no special characters.

### Front matter

- [ ] `title` present and descriptive.
- [ ] `linkTitle` present and concise.
- [ ] `date` in `YYYY-MM-DD` format.
- [ ] `author` present; single-line form for single-author, folded `>-` form for
      multi-author.
- [ ] `author` entries use `[Name](https://github.com/handle)` markdown links;
      `(Organization)` suffix where applicable.
- [ ] `draft: true` if the post is not yet ready or is future-dated.
- [ ] `canonical_url` present if this is a cross-post (preferred over
      `crosspost_url`).
- [ ] `body_class: otel-with-contributions-from` set if the intro credits
      secondary contributors.
- [ ] `issue` set only if a pre-submission approval issue exists.
- [ ] `sig` set if a SIG sponsors the post, and the PR carries a matching
      `sig:<name>` label.
- [ ] `cSpell:ignore` includes any non-standard words specific to this post.

### Submission readiness

- [ ] Content is non-commercial and broadly relevant.
- [ ] No vendor product pitches.
- [ ] CNCF tools preferred in examples (Jaeger, Prometheus, …).
- [ ] Pre-submission issue referenced where applicable; SIG sponsor identified.

### Content

- [ ] No H1 (`#`) headings — H1 comes from `title`.
- [ ] Heading hierarchy valid (H2 → H3 → H4, no skipping).
- [ ] Prose wrapped at 80 columns (run `npm run format`).
- [ ] Images live beside `index.md`.
- [ ] All images have meaningful alt text.
- [ ] Code blocks have language tags.
- [ ] Secondary contributors credited in the intro paragraph if `body_class` is
      set.

### Links

- [ ] Internal links use Hugo `ref`/`relref` or relative paths.
- [ ] External links use HTTPS.
- [ ] No over-linking (first mention per page).
- [ ] **`gh-url-hash`**: no GitHub `blob`/`tree` links on `main`/`master`; no
      short commit hashes. Run `npm run fix:markdown` and resolve any remaining
      warnings manually.

### OTel terminology

- [ ] "OpenTelemetry" spelled as one word.
- [ ] "OTel" used only after first full mention.
- [ ] Signal names lowercase: traces, metrics, logs.
- [ ] Component names cased: SDK, API, Collector.
- [ ] Proper nouns cased: Jaeger, Zipkin, Prometheus, Kubernetes.

### Spelling

- [ ] `npm run check:spelling` passes (or equivalent).
- [ ] Post-local words go in `cSpell:ignore`; repo-wide words go in
      `.cspell/en-words.txt`.
- [ ] `# prettier-ignore` above `cSpell:ignore` only when the line is long
      enough to be wrapped by the formatter.

## References

Source-of-truth files — if this skill drifts from them, trust the file:

- `archetypes/blog.md` — canonical front matter template.
- `content/en/docs/contributing/blog.md` — submission process, cross-posting,
  `gh-url-hash` rationale.
- `content/en/blog/.markdownlint.yaml` — enables `gh-url-hash` for blog posts.
- `.markdownlint.yaml` — repo-wide markdownlint config (note:
  `line-length: false`).
- `scripts/_md-rules/gh-url-hash/index.mjs` — authoritative rule behavior.
- `.github/workflows/blog-publish-labels.yml` — publish-date label workflow.
- `.cspell.yml`, `.cspell/en-words.txt` — spell-check configuration.
- `package.json` — `prettier.proseWrap: always` drives 80-char wrapping.
