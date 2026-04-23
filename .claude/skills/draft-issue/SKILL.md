---
name: draft-issue
description: >-
  Draft GitHub issues for opentelemetry.io following the real issue templates
  under `.github/ISSUE_TEMPLATE/`, the contributing guide, and the repo's live
  label taxonomy. Use when creating issue drafts from investigation findings or
  conversation context.
argument-hint: '<description of issue to draft>'
allowed-tools: Read Grep
effort: low
---

# OTel Issue Draft

Draft ready-to-paste GitHub issues for `open-telemetry/opentelemetry.io`. Every
rule in this skill is grounded in a source-of-truth file — if a claim here
conflicts with one of those files, trust the file and update this skill. See the
[References](#references) section at the end.

## Arguments {#arguments}

- If no `$ARGUMENTS` is provided, infer context from the conversation. If there
  is insufficient context, ask the user what issue to draft.
- Otherwise, treat the full `$ARGUMENTS` string as the description of the issue
  to draft. There are no flags — the entire value is the context.

## When to Use

- After investigating a problem in the OTel site codebase
- When a conversation reveals a bug, docs gap, or feature need
- When the user wants to file an issue based on current findings
- When drafting a blog post proposal for OTel

## Issue Types {#issue-types}

The repo has **five** issue templates under `.github/ISSUE_TEMPLATE/`.
Auto-detect type from context, or accept an explicit type from the user.

| Template file         | Title prefix      | Use for                                              |
| --------------------- | ----------------- | ---------------------------------------------------- |
| `DOCS_UPDATE.yml`     | `[Docs]: `        | Documentation errors, missing content, outdated info |
| `ISSUE_REPORT.yml`    | `bug: `           | Site bugs, broken functionality, CI/workflow issues  |
| `FEATURE_REQUEST.yml` | `feat: `          | New site features, tooling improvements              |
| `BLOG_POST.yml`       | `blog: `          | Blog post proposals (auto-applies `blog` label)      |
| `PAGE_FEEDBACK.yml`   | `page feedback: ` | Feedback from the "was this page helpful?" widget    |

Notes on template metadata:

- `DOCS_UPDATE.yml` sets `type: bug` at the template level (GitHub's new issue
  "type" classification). Drafters don't set this manually.
- `BLOG_POST.yml` auto-applies `labels: ['blog']`. Don't duplicate.

## Template Structures

Each snippet below matches its YAML field-for-field. `(required)` marks fields
that the template enforces.

### Docs Update (`[Docs]: `)

```markdown
### What needs to be changed? (required)

<clear description of the docs issue>

### Name + path of the page (required)

content/en/docs/concepts/what-is-otel.md — "What is OpenTelemetry?"

### Additional context

<links, screenshots, related issues/PRs, etc.>
```

### Website Issue/Bug (`bug: `)

```markdown
### What happened? (required)

<clear description of the bug>

### What did you expect would happen? (required)

<expected behavior>

### Name + path of the page (required)

content/en/docs/... — "Page Title"

### Browser, OS, and platform

E.g., Chrome 120 on macOS 14 (Apple Silicon)

### Additional context

<links, screenshots, related issues/PRs, etc.>
```

### Feature Request (`feat: `)

```markdown
### Desired feature or idea (required)

<description of the feature>

### Additional context

<supporting details, motivation, alternatives considered>
```

### Blog Post Proposal (`blog: `)

`BLOG_POST.yml` auto-applies the `blog` label. For writing or reviewing the
actual post afterward, see the `review-blog-post` skill.

```markdown
### Blog Post Title (required)

<proposed title>

### Blog Post Outline (required)

<short description and outline; main topics you plan to cover>

### Technologies Used

<list; prefer CNCF / open source; Jaeger for traces, Prometheus for metrics>

### Related Special Interest Groups (SIGs)

<SIGs related to this post — helps routing to reviewers>

### Sponsoring SIG

<name of the SIG that will sponsor the post, if known>

### Sponsor Name

<maintainer or approver from the sponsoring SIG; ideally from a different
company>

### Additional Information

<timeline preferences, related issues/PRs, etc.>
```

### Page Feedback (`page feedback: `)

Filed by the "was this page helpful?" widget when a visitor clicks "no". Rarely
hand-drafted, but follow the shape if you do.

```markdown
### URL (required)

https://opentelemetry.io/...

### Description (required)

<how the page was not helpful; what information is missing>
```

## How to File Great Issues

From `content/en/docs/contributing/issues.md`:

- **Be specific.** Describe what is missing, out of date, wrong, or needs
  improvement. "Fix the security docs" is too broad; "Add details to the
  'Restricting network access' topic" is actionable.
- **Explain user impact.** What does this cost someone reading the site?
- **Right-size the scope.** Break broad problems into smaller, reviewable
  issues. One issue = one reasonable unit of work.
- **Search first.** Check existing issues for duplicates or related work before
  filing.
- **Reference related issues and PRs** with `#1234` for the same repo, or the
  full URL for cross-repo references. Example: `Introduced by #987654`.
- **Follow the Code of Conduct.** Respect fellow contributors. "The docs are
  terrible" is not helpful feedback.

## Label Taxonomy

Suggest labels based on the issue content. The labels below are validated
against the live label set on `open-telemetry/opentelemetry.io`. Labels starting
`missing:*` and `ready-to-be-merged` are **PR workflow labels** and never belong
on an issue draft — see [PR-only labels](#pr-only-labels-do-not-suggest) below.

### Area labels

- `CI/infra`, `Github actions`, `github_actions` — workflow / CI issues (both
  the space and underscore spellings exist in the repo as separate labels —
  that's a repo quirk, not a typo)
- `blog` — blog content (auto-applied to blog PRs)
- `docs` — generic docs issues and PRs
- `docs:mobile`, `docs:blog`, `docs:registry`, `docs:javascript`,
  `docs:vendor-list` — topical docs sub-labels
- `registry` — registry entries (auto-applied to registry PRs)
- `i18n` — internationalization (auto-applied for `i18n/**` changes)
- `site:accessibility`, `site:design/style`, `ux` — frontend / site
- `cleanup/refactoring` — cleanup work
- `upstream`, `upstream:docsy`, `upstream:hugo` — upstream dependencies
- `analytics+observability` — analytics and observability of the site
- `IA` — site information architecture
- `metadata-quality` — metadata correctness
- `dependencies` — dependency updates
- `blocked` — issue is blocked by something else

### SIG labels

Auto-applied to PRs that touch the matching `content/en/docs/...` path via
`.github/component-label-map.yml`. For issues, add manually.

`sig:android`, `sig:collector`, `sig:collector:refactor`, `sig:cpp`, `sig:demo`,
`sig:dotnet`, `sig:enduser`, `sig:erlang`, `sig:faas`, `sig:go`, `sig:helm`,
`sig:java`, `sig:javascript`, `sig:kotlin`, `sig:obi`, `sig:operator`,
`sig:php`, `sig:profiling`, `sig:python`, `sig:ruby`, `sig:rust`,
`sig:security`, `sig:semconv`, `sig:spec`, `sig:swift`

### Localization labels

Auto-applied to PRs that touch `content/<lang>/**` via
`component-label-map.yml`.

`lang:bn`, `lang:es`, `lang:fr`, `lang:ja`, `lang:pl`, `lang:pt`, `lang:ro`,
`lang:uk`, `lang:zh`

### Effort estimates

- `e0-minutes` — less than 60 minutes
- `e1-hours` — less than 8 hours
- `e2-days` — less than 5 days
- `e3-weeks` — less than 4 weeks
- `e4-months` — 1 month or more

### Priority

`p0-critical`, `p1-high`, `p2-medium`, `p3-low`

### Triage

- Accepted: `triage:accepted`, `triage:accepted:needs-pr`
- Deciding: `triage:deciding`, `triage:deciding:blocked`,
  `triage:deciding:needs-info`, `triage:deciding:needs-mentor-or-sponsor`
- Rejected: `triage:rejected`, `triage:rejected:duplicate`,
  `triage:rejected:invalid`, `triage:rejected:wontfix`

### Type

- `type:copyedit` — copyediting / small textual fixes
- `type:question` — a question, not a bug or feature

> **Do not use `type:discussion`.** Its own label description says "Do not use,
> convert discussion issues into real Discussions." Skip it in drafts.

### Assignment / availability

Use these to signal that an issue is grabbable by a contributor.

- `good first issue` — good for newcomers
- `help wanted` — extra attention is needed
- `contribfest` — issues tagged for contribfest events (KubeCon, etc.)
- `mentorship:bloomberg` — curated for the Bloomberg OSS Mentorship program

### PR-only labels (do not suggest) {#pr-only-labels-do-not-suggest}

These labels are managed by PR workflows. They should never appear in an issue
draft:

- `ready-to-be-merged`
- `missing:cla`, `missing:sig-approval`, `missing:docs-approval`
- `stale`, `auto-update`, `0-meta`, `forever`, `admin`

### Auto-applied labels (informational)

`component-label-map.yml` auto-applies some labels to PRs based on changed file
paths (not to issues): `blog`, `registry`, `i18n`, `lang:*`, and several
`sig:*`. You can still suggest these on an issue manually; they just won't be
set automatically on an issue the way they are on a PR.

## Formatting Rules

- **Title** uses the exact template prefix (see [Issue Types](#issue-types))
  plus a concise summary.
- **Body** uses markdown with sections matching the chosen template. Keep the
  template's exact field labels — GitHub maps them back to template fields for
  search and filtering.
- **References to other issues/PRs**: `#1234` for the same repo, full URL for
  cross-repo. From `issues.md:76-78`.
- **Code snippets** use fenced blocks with language tags.
- **File paths** are relative to repo root (e.g.,
  `content/en/docs/concepts/what-is-otel.md`).
- **Concise, actionable** descriptions — no filler.
- Wrap body prose at 80 characters for readability (convention, not enforced by
  GitHub).

## Output Format

Produce a fenced block with title, suggested labels, and body. Labels go
comma-separated so they can be passed directly to
`gh issue create --label "<comma,separated>"`.

```
**Title**: `bug: pr-approval-labels workflow adds ready-to-be-merged despite requested changes`

**Labels**: `CI/infra`, `Github actions`, `p2-medium`

---

### What happened?

The `pr-approval-labels` workflow currently adds the `ready-to-be-merged`
label when a PR receives an approving review, but it does not check whether
other reviewers have requested changes.

### What did you expect would happen?

The workflow should skip adding the `ready-to-be-merged` label if any
reviewer has a pending "changes requested" status on the PR.

### Name + path of the page

.github/workflows/pr-approval-labels.yml

### Additional context

Related to #1234.
```

## References {#references}

Source-of-truth files — if this skill drifts from them, trust the file:

- `.github/ISSUE_TEMPLATE/DOCS_UPDATE.yml` — docs issue template
- `.github/ISSUE_TEMPLATE/ISSUE_REPORT.yml` — bug / website issue template
- `.github/ISSUE_TEMPLATE/FEATURE_REQUEST.yml` — feature request template
- `.github/ISSUE_TEMPLATE/BLOG_POST.yml` — blog post proposal template (7
  fields; auto-applies `blog` label)
- `.github/ISSUE_TEMPLATE/PAGE_FEEDBACK.yml` — page feedback template
- `content/en/docs/contributing/issues.md` — user-facing guidance on filing
  great issues
- `.github/component-label-map.yml` — path-based auto-labeling for PRs
- Live label set (refresh as needed):
  `gh label list --repo open-telemetry/opentelemetry.io --limit 200`
