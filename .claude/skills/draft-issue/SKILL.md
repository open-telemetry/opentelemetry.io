---
name: draft-issue
description: >-
  Draft GitHub issues for opentelemetry.io following the real issue templates
  under `.github/ISSUE_TEMPLATE/`, the contributing guide, and the repo's live
  label taxonomy. Use when creating issue drafts from investigation findings or
  conversation context.
argument-hint: '<description of issue to draft>'
allowed-tools: Read Grep Bash
effort: low
---

# Draft Issue

Drafts ready-to-paste GitHub issues for `open-telemetry/opentelemetry.io`. The
templates under `.github/ISSUE_TEMPLATE/` and the live label set are the sources
of truth — when this skill drifts from them, trust the source.

## Arguments {#arguments}

- If `$ARGUMENTS` is empty, infer context from the conversation. If there is
  insufficient context, ask the user what issue to draft.
- Otherwise, treat the full `$ARGUMENTS` string as the description. There are no
  flags.

## When to use

- After investigating a problem in the OTel site codebase.
- When a conversation reveals a bug, docs gap, or feature need.
- When drafting a blog post proposal for OTel.

## Issue types {#issue-types}

The repo has five issue templates. Auto-detect type from context, or accept an
explicit type from the user.

| Template file         | Title prefix      | Use for                                              |
| --------------------- | ----------------- | ---------------------------------------------------- |
| `DOCS_UPDATE.yml`     | `[Docs]: `        | Documentation errors, missing content, outdated info |
| `ISSUE_REPORT.yml`    | `bug: `           | Site bugs, broken functionality, CI/workflow issues  |
| `FEATURE_REQUEST.yml` | `feat: `          | New site features, tooling improvements              |
| `BLOG_POST.yml`       | `blog: `          | Blog post proposals (auto-applies `blog` label)      |
| `PAGE_FEEDBACK.yml`   | `page feedback: ` | Feedback from the "was this page helpful?" widget    |

When drafting, read the chosen template under `.github/ISSUE_TEMPLATE/` and
mirror its section labels verbatim so GitHub maps the body back to template form
fields. Required fields are marked in the template.

For writing or reviewing the post itself after a `blog:` proposal lands, see the
`review-blog-post` skill.

## Drafting rules

From `content/en/docs/contributing/issues.md`:

- **Be specific.** Describe what is missing, out of date, wrong, or needs
  improvement. "Fix the security docs" is too broad; "Add details to the
  'Restricting network access' topic" is actionable.
- **Right-size the scope.** One issue = one reasonable unit of work; break broad
  problems into smaller, reviewable issues.
- **Search first.** Check existing issues for duplicates before filing.
- **Reference related issues and PRs** with `#1234` for the same repo, or the
  full URL for cross-repo references.
- **Concise, actionable** descriptions; no filler.
- Wrap body prose at 80 characters (convention, not enforced).

## Labels {#labels}

The repo's labels evolve; do not maintain a copy in this skill. Discover the
live set with:

```bash
gh label list --repo open-telemetry/opentelemetry.io --limit 200
```

Path-based auto-labeling (e.g. `blog`, `registry`, `i18n`, `lang:*`, several
`sig:*`) is defined in `.github/component-label-map.yml` and applies on PRs
only. You can still suggest these on issues manually.

Governance for the `triage:*`, `type:*`, `priority:*`, and `sig:*` families
lives in `content/en/docs/contributing/sig-practices.md`. Skip `type:discussion`
— its own label description says "Do not use, convert discussion issues into
real Discussions."

## Output format

Produce a fenced block with title, suggested labels, and body. Labels are
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

- `.github/ISSUE_TEMPLATE/*.yml` — five real templates; mirror their section
  labels verbatim.
- `content/en/docs/contributing/issues.md` — user-facing guidance on filing
  great issues.
- `content/en/docs/contributing/sig-practices.md` — label and triage governance.
- `.github/component-label-map.yml` — path-based PR auto-labeling.
- `gh label list --repo open-telemetry/opentelemetry.io --limit 200` — live
  label set.
