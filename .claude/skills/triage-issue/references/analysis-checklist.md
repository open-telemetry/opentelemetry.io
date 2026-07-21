# Per-Issue Analysis Checklist {#phase-3-analyze-issues}

**When to read:** once at the start of Phase 3 (Analyze Issues). Keep it open
for the whole batch — the checklist is repeated for every issue, and the
confidence / action / "never suggest" rules at the bottom are load-bearing for
every recommendation.

For each issue, gather these signals:

## 1. Metadata Extraction

- Issue #, title, author, created date, last updated
- Comment count, last comment date, last commenter role
- Reaction counts (👍, 👎, total)
- Current labels

## 2. Issue Type Classification

Infer from title prefix and body structure:

| Prefix           | Type                               |
| ---------------- | ---------------------------------- |
| `[Docs]:`        | Documentation update               |
| `bug:`           | Bug report                         |
| `feat:`          | Feature request                    |
| `blog:`          | Blog proposal                      |
| `page feedback:` | Page feedback                      |
| (none)           | Infer from body template structure |

## 3. Staleness Analysis

```bash
# Days since last update
# Calculate from updatedAt field
```

Staleness tiers below are heuristic only — there is no auto-close automation for
issues in `open-telemetry/opentelemetry.io` (unlike PRs, which have a 21-day
stale rule per `sig-practices.md:153-155`). Use these as triage signals, not as
policy:

| Tier     | Days Since Last Update |
| -------- | ---------------------- |
| Critical | > 180 days             |
| High     | 90–180 days            |
| Medium   | 30–90 days             |
| Low      | < 30 days              |

Check:

- Has anyone commented in the last 6 months?
- Is the author still active on the repo?

```bash
gh api "repos/<REPO>/issues?creator=<username>&state=all&per_page=5&sort=updated" \
  --jq '.[0].updated_at'
```

## 4. Codebase Cross-Reference

Extract file paths mentioned in the issue body. For each:

```bash
# Check if file exists
ls <file-path> 2>/dev/null

# Check git history since issue was opened
git log --oneline -10 --since="<issue-created-date>" -- "<file-path>"
```

Report:

- File exists / deleted / renamed
- Number of commits since issue opened
- Whether changes appear to address the concern

Read file content when needed to verify if the issue's request has been
fulfilled.

## 5. Related PRs and Issues

```bash
# PRs referencing this issue
gh pr list --repo <REPO> --state all \
  --search "<issue-number>" --json number,title,state,mergedAt,url --limit 10
```

Check if any merged PRs address the issue.

## 6. External Reference Analysis

Parse issue body for links to `github.com/open-telemetry/*` repos. For each:

```bash
gh issue view <URL> --json number,title,state,labels 2>/dev/null || \
gh pr view <URL> --json number,title,state,mergedAt 2>/dev/null
```

Non-OTel external links: list them, note "external — manual review needed".

## 7. Duplicate Detection

```bash
# Search for similar open issues
gh issue list --repo <REPO> \
  --state open --search "<key terms from title>" \
  --json number,title,labels --limit 10
```

If `--include-closed` is set:

```bash
gh issue list --repo <REPO> \
  --state closed --search "<key terms>" \
  --json number,title,labels --limit 10
```

Similarity signals: title keyword overlap, same referenced files, same described
symptoms.

## 8. Recommendation

**Confidence tiers:**

| Tier   | Criteria                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------ |
| HIGH   | File deleted/renamed; exact duplicate; >1 year with zero engagement; merged PR resolves it; author confirmed fixed |
| MEDIUM | Clear classification possible; reasonable action path; related PRs exist; active author                            |
| LOW    | Ambiguous description; cross-cutting; external blockers; high engagement needing judgment                          |

**Triage actions** (internal decision tokens — see
[Close-Reason Mapping in `references/gh-commands.md`](./gh-commands.md#close-reason-mapping)
for the valid `gh issue close --reason` value each token maps to):

| Action                                          | When                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `close:completed`                               | A merged PR resolved the issue; referenced content now exists                         |
| `close:stale`                                   | No activity, referenced content updated, likely resolved                              |
| `close:duplicate`                               | Near-duplicate of #XXXX                                                               |
| `close:wontfix`                                 | Out of scope or superseded                                                            |
| `close:invalid`                                 | Spam, unclear, not a real issue                                                       |
| `label:triage:accepted:needs-pr`                | Valid, actionable, needs contributor                                                  |
| `label:triage:accepted`                         | Valid, may have someone on it                                                         |
| `label:triage:deciding:needs-info`              | Missing details from reporter                                                         |
| `label:triage:deciding:blocked`                 | Blocked on external dependency                                                        |
| `label:triage:deciding:needs-mentor-or-sponsor` | Needs a mentor/sponsor (`sig-practices.md:98`)                                        |
| `label:triage:deciding`                         | Needs maintainer discussion                                                           |
| `label:good first issue`                        | Small, well-scoped onboarding task (label is `good first issue` — spaces, no hyphens) |
| `add-labels`                                    | Only needs co-ownership (`sig:*`/`lang:*`/`docs:*`) / type / area labels added        |

**Accepted issues must carry the `sig-practices.md:77-107` mandatory set.** When
emitting `label:triage:accepted*` or `add-labels`, also apply — if not already
present — one co-ownership label (`sig:*`, `lang:*`, or `docs:*`) and verify an
issue type is set (GitHub-native `bug`/`enhancement`, usually inherited from the
issue template's `type:` field, or one of the label-based types `type:question`
/ `type:copyedit`). Do not manually set GitHub-native types; they come from the
template.

**Never suggest PR-only labels on issues.** `ready-to-be-merged`, `missing:cla`,
`missing:docs-approval`, `missing:sig-approval`, `sig-approval-missing`,
`auto-update`, `0-meta`, `admin` are managed by PR workflows and don't belong on
issues. See `draft-issue` skill, `#pr-only-labels-do-not-suggest`.

**Never suggest `type:discussion`.** The label's own description says "Do not
use, convert discussion issues into real Discussions." If the issue reads as
open-ended conversation, recommend `close:wontfix` (→ `--reason "not planned"`)
with a suggested comment pointing to GitHub Discussions.

**Never recommend `--add-assignee` for first-time contributors.**
`content/en/docs/contributing/_index.md:19-31`: issues are not assigned to
contributors who have not already landed a PR (absent a confirmed mentorship).
If an assignment-request comment is present, note that
`.github/workflows/first-timer-response.yml` already auto-responds; do not emit
an assign command.

**`triage:followup` is a manual convention, not automation.**
`sig-practices.md:124-127` describes an automated 14-day re-triage marker, but
the `triage:followup` label does not currently exist in the live label set and
no workflow applies it. Treat it as a manual marker a triager may apply when
walking stale `triage:deciding` issues. Flag to maintainers if you'd like this
automated.
