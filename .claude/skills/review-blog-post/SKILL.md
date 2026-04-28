---
name: review-blog-post
description: >-
  Review OpenTelemetry blog posts for front matter compliance, content
  conventions, GitHub link stability (`gh-url-hash`), spelling, and OTel
  terminology. Use when reviewing a PR or draft under `content/en/blog/`.
argument-hint: '<blog post path or PR number>'
allowed-tools: Read Grep Glob Bash
model: sonnet
effort: medium
---

# Review Blog Post

Review workflow for OpenTelemetry blog posts. The repo tooling — the
front-matter-check hook, prettier, markdownlint (`gh-url-hash`), cSpell, and the
publish-labels workflow — enforces the mechanical rules; this skill covers the
judgment layer those tools cannot check.

## Arguments {#arguments}

- If `$ARGUMENTS` is empty, ask for a file path or PR number.
- If `$ARGUMENTS` contains `/` or ends in `.md`, treat it as a repo-relative
  file path.
- If `$ARGUMENTS` is a GitHub URL containing `/pull/`, extract the PR number
  after `/pull/`.
- If `$ARGUMENTS` is a bare number or starts with `#`, treat it as a PR number.
- Otherwise, stop and ask for a valid file path or PR number.

## Location

Blog posts live under `content/en/blog/YYYY/`. Use a single `short-name.md` when
there are no images, or a `short-name/index.md` directory when there are.
`short-name` is kebab-case — no dates, no special characters.

Scaffold from the archetype with Hugo:

```sh
npx hugo new content/en/blog/$(date +%Y)/short-name.md             # no images
npx hugo new content/en/blog/$(date +%Y)/short-name/index.md       # with images
```

## Front matter

A `PreToolUse` hook on `Write`/`Edit`
([`scripts/validate/front-matter-check/`][fm-check]) blocks any
`content/en/blog/**/*.md` change whose front matter is missing `title`,
`linkTitle`, `date` (must be `YYYY-MM-DD`), or `author` (must be a Markdown
link), or that introduces an H1 in the body. When reviewing an existing PR where
the hook didn't run, double-check those fields against
[`archetypes/blog.md`][archetype].

Judgment calls beyond the hook:

- **`title`** — sentence case is typical; a few proper-noun-heavy posts use
  Title Case. Keep it descriptive.
- **`author`** — single-author posts use a single-line Markdown link; multi-
  author posts must use the YAML folded form (`>-`) because the list spans
  lines. The trailing `(Organization)` suffix is optional but common.

  ```yaml
  author: '[Juraci Paixao Krohling](https://github.com/jpkrohling) (OllyGarden)'
  ```

  ```yaml
  author: >-
    [Johanna Öjeling](https://github.com/johannaojeling) (Grafana Labs),
    [Juliano Costa](https://github.com/julianocosta89) (Datadog), [Tristan
    Sloughter](https://github.com/tsloughter) (community)
  ```

- **`draft: true`** — work-in-progress; required for future-dated posts.
- **`canonical_url`** — set when the post is a cross-post; points to the
  original. Preferred over the older `crosspost_url`.
- **`body_class: otel-with-contributions-from`** — set when secondary
  contributors are credited in the intro paragraph (see
  [Authoring rules](#authoring-rules)).
- **`issue`** — optional; only ~15% of recent posts set this.
- **`sig`** — sponsoring SIG (e.g. `Developer Experience SIG`). When present,
  the PR should carry a matching `sig:<name>` label.
- **`cSpell:ignore`** — see [Spelling](#spelling).

## Submission prerequisites

From [`content/en/docs/contributing/blog.md`][contrib-blog]:

- Non-commercial, broadly relevant; no vendor product pitches.
- Prefer CNCF projects in examples (Jaeger for traces, Prometheus for metrics).
- A pre-submission issue is required; a SIG sponsor is strongly recommended
  (ideally from a different company than the author).
- "Call for Contributors" posts follow the project-management process in
  `open-telemetry/community`.

## Authoring rules {#authoring-rules}

- Start headings at `##` (no H1; the H1 is auto-generated from `title`) and
  don't skip levels.
- Wrap prose at 80 columns (`npm run format`, prettier with
  `proseWrap: always`). Don't hand-wrap — run the formatter. Skip URLs, code
  blocks, and front matter values.
- Place images beside `index.md`; descriptive kebab-case filenames; always
  include meaningful alt text.
- Always tag fenced code blocks with a language.
- Credit secondary contributors who aren't in the `author` field in the intro:
  _"With contributions from [Name](https://github.com/username), …"_ and set
  `body_class: otel-with-contributions-from`.
- Prefer active voice. Link external tools and OTel concepts on first mention
  only — don't over-link.

## GitHub links (`gh-url-hash`)

A blog-only markdownlint rule
([`scripts/_md-rules/gh-url-hash/index.mjs`][gh-rule], enabled via
`content/en/blog/.markdownlint.yaml`) blocks default-branch links
(`main`/`master`) and short commit hashes in GitHub `blob`/`tree` URLs. Tags,
release refs, and full 40-character SHAs are allowed.

Run `npm run fix:markdown` to auto-fix default-branch links by resolving the
current HEAD commit. Auto-fix needs network access; on rate-limit or unreachable
failures, fix manually with a full SHA or a release tag.

## Spelling {#spelling}

Spell-checking uses cSpell (`.cspell.yml`). Repo-wide additions go in
`.cspell/en-words.txt`; post-local words go in the `cSpell:ignore` front matter
field. Add `# prettier-ignore` immediately above `cSpell:ignore` only when the
line is long enough that the formatter would wrap it:

```yaml
# prettier-ignore
cSpell:ignore: jpkrohling Krohling logdedup OllyGarden OTTL Paixao telemetrygen
```

## OTel terminology

- **OpenTelemetry** is one word; **OTel** is acceptable shorthand only after the
  first full mention.
- Signal names are lowercase: traces, metrics, logs.
- Component names are cased: SDK, API, Collector.
- Proper nouns: Jaeger, Zipkin, Prometheus, Kubernetes.
- Semantic-convention attribute names should match the current names in
  [`docs/specs/semconv/`](https://opentelemetry.io/docs/specs/semconv/).

## Publish timing

- The `date` field drives publication. Use `draft: true` while the date is in
  the future.
- A daily workflow ([`blog-publish-labels.yml`][publish-workflow], 7 AM UTC)
  adds `ready-to-be-merged` only when **all** hold: docs-approver approval,
  SIG/component-owner approval, and `date:` is in the past or today. The
  workflow only labels — a human still merges.

## Cross-posting

Decide which version is canonical (typically the original OpenTelemetry post).
On any external copy, mention the original, link back to it, and set the
platform's canonical-URL tag if available. When the OTel post is the copy, set
`canonical_url` in its front matter.

## Reviewing a PR

Walk the post top-to-bottom against the sections above. The mechanical checks
below are what humans most often miss after the hook + linters pass:

1. Run `npm run format` (wrap), `npm run fix:markdown` (`gh-url-hash`),
   `npm run check:spelling`. All must be clean.
2. Author front matter: single-line vs. folded `>-` form correct?
   `(Organization)` accurate?
3. Multi-author intro credits + `body_class: otel-with-contributions-from` set
   if needed.
4. `gh-url-hash`: no `main`/`master` or short SHAs; tags or full SHAs only.
5. Submission prerequisites: non-commercial, CNCF tools preferred, SIG sponsor
   identified.
6. OTel terminology consistent throughout.
7. `date` and `draft` set so the publish workflow gates the merge as intended.

## References

- [`archetypes/blog.md`][archetype] — canonical front matter template.
- [`content/en/docs/contributing/blog.md`][contrib-blog] — submission process,
  cross-posting, `gh-url-hash` rationale.
- `content/en/blog/.markdownlint.yaml` — enables `gh-url-hash` for blog posts.
- [`scripts/_md-rules/gh-url-hash/index.mjs`][gh-rule] — authoritative rule
  behavior.
- [`scripts/validate/front-matter-check/`][fm-check] — write-time hook source +
  tests.
- [`.github/workflows/blog-publish-labels.yml`][publish-workflow] — publish date
  and approval gating.
- `.cspell.yml`, `.cspell/en-words.txt` — spell-check configuration.
- `package.json` — `prettier.proseWrap: always` drives 80-char wrapping.

[archetype]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/archetypes/blog.md
[contrib-blog]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/docs/contributing/blog.md
[fm-check]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate/front-matter-check
[gh-rule]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/_md-rules/gh-url-hash/index.mjs
[publish-workflow]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/blog-publish-labels.yml
