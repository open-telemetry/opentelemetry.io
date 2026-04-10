---
name: otel-triage
description: >-
  Batch triage GitHub issues for any repository (defaults to
  open-telemetry/opentelemetry.io). Analyzes staleness, duplicates, codebase
  changes, and related PRs to produce actionable triage reports with
  ready-to-paste gh commands. Read-only — never modifies GitHub.
argument-hint:
  '[--repo OWNER/REPO] [--count N] [--label LABEL[,LABEL2]] [--fresh]
  [--pending] [--reanalyze N,N] [--type TYPE] [--profile NAME[,NAME2]]'
allowed-tools: Bash Read Write Glob Agent
model: opus
effort: high
---

# OTel Issue Triage

Batch-triage untouched GitHub issues in any GitHub repository. Produces a
structured report with per-issue dossiers, confidence tiers, and ready-to-paste
`gh` commands. Defaults to `open-telemetry/opentelemetry.io` when `--repo` is
omitted.

When targeting `open-telemetry/opentelemetry.io`, every rule in this skill is
grounded in a source-of-truth file. For the full validated label taxonomy and
the PR-only labels that must never be applied to issues, see the sibling skill
`otel-issue-draft`. For process rules that connect triaged issues to PR
reviews (e.g., the `triage:accepted` linked-issue requirement), see
`otel-pr-review`. See [References](#references) at the bottom.

## When to Use {#when-to-use}

- Processing untriaged issues in batch
- Periodic triage maintenance
- Prioritizing the backlog
- Investigating stale or duplicate issues

## Safety {#safety}

This skill is **read-only**. It produces recommendations and `gh` commands but
**never executes commands that modify GitHub state**. The human reviewer decides
which commands to run.

---

## Arguments {#arguments}

```
/otel-triage [--repo OWNER/REPO] [--count N] [--fresh] [--pending] [--reanalyze 1234,5678] [--type docs|bug|feat|blog|feedback] [--profile NAME[,NAME2]]
```

| Flag                     | Default                                                        | Purpose                                                                           |
| ------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `--repo OWNER/REPO`      | from active repo profile, or `open-telemetry/opentelemetry.io` | Target GitHub repository                                                          |
| `--count N`              | `10`                                                           | Number of issues to process                                                       |
| `--fresh`                | off                                                            | Ignore state entirely — re-analyze all fetched issues                             |
| `--pending`              | off                                                            | Only surface issues that were analyzed but never executed (`outcome` absent)      |
| `--reanalyze 1234,5678`  | —                                                              | Force re-analysis of specific issue numbers, ignoring their state entry           |
| `--type`                 | —                                                              | Filter by issue type prefix (requires a repo profile with `type_filters` defined) |
| `--profile NAME[,NAME2]` | —                                                              | Load named profile(s), comma-separated or repeated. Merged in order.              |

**Precedence**: `--fresh` overrides `--pending` and `--reanalyze`. When
`--reanalyze` is set, only the listed issues are fetched and analyzed (skips the
broad fetch + filter pipeline).

---

## Phase 0: Load & Merge Profiles {#phase-0-load-and-merge-profiles}

Run this before anything else.

### 1. Collect profile names

Gather all `--profile` values (flag may be repeated or comma-separated):

```
profiles_requested = split and flatten all --profile values
```

### 2. Auto-detect repo profile

Determine the target repo (from `--repo` flag, or fall back to
`open-telemetry/opentelemetry.io` if omitted):

```
REPO = value of --repo flag, or "open-telemetry/opentelemetry.io"
```

Scan all `*.yml` files in the plugin's `data/` directory. If any profile has
`repo.auto_apply_for` containing `REPO`, prepend it to `profiles_requested`
(unless already listed). This is how the `opentelemetry-website` profile
auto-activates when running against that repo.

### 3. Load and validate each profile

For each name in `profiles_requested`:

```bash
# Resolve path
PROFILE_FILE=${CLAUDE_PLUGIN_ROOT}/data/<NAME>.yml

# Check existence
ls "$PROFILE_FILE" 2>/dev/null || {
  echo "Profile '<NAME>' not found. Available profiles:"
  ls ${CLAUDE_PLUGIN_ROOT}/data/*.yml | xargs -I{} basename {} .yml
  exit 1
}
```

Read and validate against `${CLAUDE_PLUGIN_ROOT}/schemas/triage-profiles.schema.json`.
Abort with a clear error if validation fails.

### 4. Merge profiles

Merge all loaded profiles into a single `PROFILE` object:

- **`repo` section**: last profile wins on key conflicts
- **`evaluation` section**: all are collected into a list (multiple evaluations
  can stack — each produces its own assessment block per dossier)

### 5. Resolve final REPO and pass to subagents

```
If PROFILE.repo.default_repo is set AND --repo was not explicitly provided:
  REPO = PROFILE.repo.default_repo
Else:
  REPO = value of --repo flag, or "open-telemetry/opentelemetry.io"
```

Pass `REPO` and the full merged `PROFILE` to every `otel-issue-triager` subagent
via `<repo_profile>` and `<evaluation_profiles>` XML blocks.

---

## Phase 1: Fetch Issues {#phase-1-fetch-issues}

### Core Query

```bash
gh issue list \
  --repo <REPO> \
  --state open \
  --json number,title,body,labels,createdAt,updatedAt,author,reactionGroups,comments \
  --limit 200 \
  --sort updated \
  --order asc
```

When `--label` is provided with comma-separated values (e.g.,
`--label "good first issue,bug"`), expand into multiple `--label` flags — `gh`
treats them as AND (issue must have all labels):

```bash
gh issue list --repo <REPO> --label "good first issue" --label "bug" ...
```

**Critical**: `gh issue list --label` does NOT support negation. Fetch broadly,
then filter client-side.

### Client-Side Filtering

After fetching, filter with `jq`:

```bash
# Pipe the gh output through jq to remove already-triaged issues
... | jq '[.[] | select(
  (.labels | map(.name) | any(startswith("triage:"))) | not
)]'
```

### User Filter Mapping

| User Flag                | gh Flag                          | Post-Fetch Filter                                                                |
| ------------------------ | -------------------------------- | -------------------------------------------------------------------------------- |
| `--label LABEL[,LABEL2]` | `--label LABEL [--label LABEL2]` | AND filter — issues must have all specified labels. Comma-separate for multiple. |
| `--sig SIG`              | `--label sig:SIG`                | —                                                                                |
| `--since DATE`           | —                                | `.createdAt >= DATE`                                                             |
| `--type TYPE`            | —                                | Title prefix match (see below)                                                   |
| `--exclude LABEL`        | —                                | Exclude issues with that label                                                   |

**Type → title prefix mapping:**

Use `PROFILE.repo.type_filters` when defined. Each entry maps a `--type` value
to a `title_prefix` (and optionally a `label_match` for OR matching). If no repo
profile is active and `--type` is passed, warn the user that `--type` requires a
repo profile with `type_filters` configured.

### State-Based Filtering

Load `.tasks/triage/state.json`. For each fetched issue:

- **Skip**: issue exists in state, `issueUpdatedAt` matches current `updatedAt`,
  AND `outcome` is set → already triaged and executed
- **Pending execution**: issue exists, `issueUpdatedAt` matches, but `outcome`
  is absent → already analyzed but not yet acted on. Surface to reviewer as
  "awaiting action" instead of re-analyzing
- **Re-analyze**: issue exists but `issueUpdatedAt < updatedAt` → new activity
  since last triage (clear stale `outcome` if present)
- **Analyze as new**: issue number not in state

**Flag overrides:**

- `--fresh` → skip all state filtering, re-analyze everything
- `--pending` → only return issues in "pending execution" state (analyzed, no
  `outcome`). Useful for reviewing what still needs action
- `--reanalyze 1234,5678` → fetch only those issues by number via
  `gh issue view`, bypass state check, and re-analyze them. Clears any existing
  `outcome` in state on write

### Sorting

Sort remaining issues by `updatedAt` ascending (stalest first). Take the first N
issues per `--count`.

---

## Phase 2: Categorize Issues {#phase-2-categorize-issues}

Group issues for analysis (especially relevant for `--parallel` mode).

> **Note for `open-telemetry/opentelemetry.io`.** No workflow
> auto-labels issues in this repo. `.github/component-label-map.yml`
> and `.github/component-owners.yml` trigger on `pull_request_target`
> only. Any `sig:*`/`lang:*`/`docs:*` label already on an issue was
> applied manually by a triager, so it's authoritative. Unlabeled
> issues need categorization here.

### By Existing Labels

If an issue has a `sig:*` label, group by that SIG.

### By Content Inference (Unlabeled Issues)

Scan title and body for signals:

**SIG keywords** _(only when `PROFILE.repo.sig_keywords` is defined)_:

Apply each entry from `PROFILE.repo.sig_keywords` — if any keyword from the
entry matches the issue title or body, assign the corresponding label. If
ambiguous (multiple SIGs match), flag as "multi-SIG" and set confidence to LOW.

When no `sig_keywords` are defined in the active profile, skip keyword
inference. Group by existing `sig:*`-style labels if present; otherwise fall
back to content-type inference and `uncategorized`.

**Content type inference:**

| Signal                                                 | Category   |
| ------------------------------------------------------ | ---------- |
| Title starts with `[Docs]:` or path `content/en/docs/` | `docs`     |
| Title starts with `blog:` or path `content/en/blog/`   | `blog`     |
| Path `data/registry/` or mentions registry             | `registry` |
| Path `.github/` or `scripts/`                          | `CI/infra` |
| Title starts with `page feedback:`                     | `feedback` |

**Resulting category buckets:** Use `PROFILE.repo.category_buckets` if defined.
Default fallback: `sig:*` (from existing labels), `docs-general`, `blog`,
`registry`, `ci-infra`, `feedback`, `uncategorized`.

---

## Phase 3: Analyze Issues {#phase-3-analyze-issues}

### Per-Issue Analysis Checklist

For each issue, gather these signals:

#### 1. Metadata Extraction

- Issue #, title, author, created date, last updated
- Comment count, last comment date, last commenter role
- Reaction counts (👍, 👎, total)
- Current labels

#### 2. Issue Type Classification

Infer from title prefix and body structure:

| Prefix           | Type                               |
| ---------------- | ---------------------------------- |
| `[Docs]:`        | Documentation update               |
| `bug:`           | Bug report                         |
| `feat:`          | Feature request                    |
| `blog:`          | Blog proposal                      |
| `page feedback:` | Page feedback                      |
| (none)           | Infer from body template structure |

#### 3. Staleness Analysis

```bash
# Days since last update
# Calculate from updatedAt field
```

Staleness tiers below are heuristic only — there is no auto-close
automation for issues in `open-telemetry/opentelemetry.io` (unlike PRs,
which have a 21-day stale rule per `sig-practices.md:153-155`). Use
these as triage signals, not as policy:

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

#### 4. Codebase Cross-Reference

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

#### 5. Related PRs and Issues

```bash
# PRs referencing this issue
gh pr list --repo <REPO> --state all \
  --search "<issue-number>" --json number,title,state,mergedAt,url --limit 10
```

Check if any merged PRs address the issue.

#### 6. External Reference Analysis

Parse issue body for links to `github.com/open-telemetry/*` repos. For each:

```bash
gh issue view <URL> --json number,title,state,labels 2>/dev/null || \
gh pr view <URL> --json number,title,state,mergedAt 2>/dev/null
```

Non-OTel external links: list them, note "external — manual review needed".

#### 7. Duplicate Detection

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

#### 8. Recommendation

**Confidence tiers:**

| Tier   | Criteria                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------ |
| HIGH   | File deleted/renamed; exact duplicate; >1 year with zero engagement; merged PR resolves it; author confirmed fixed |
| MEDIUM | Clear classification possible; reasonable action path; related PRs exist; active author                            |
| LOW    | Ambiguous description; cross-cutting; external blockers; high engagement needing judgment                          |

**Triage actions** (internal decision tokens — see
[Close-Reason Mapping](#close-reason-mapping) for the valid `gh
issue close --reason` value each token maps to):

| Action                             | When                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| `close:completed`                  | A merged PR resolved the issue; referenced content now exists |
| `close:stale`                      | No activity, referenced content updated, likely resolved |
| `close:duplicate`                  | Near-duplicate of #XXXX                                  |
| `close:wontfix`                    | Out of scope or superseded                               |
| `close:invalid`                    | Spam, unclear, not a real issue                          |
| `label:triage:accepted:needs-pr`   | Valid, actionable, needs contributor                     |
| `label:triage:accepted`            | Valid, may have someone on it                            |
| `label:triage:deciding:needs-info` | Missing details from reporter                            |
| `label:triage:deciding:blocked`    | Blocked on external dependency                           |
| `label:triage:deciding:needs-mentor-or-sponsor` | Needs a mentor/sponsor (`sig-practices.md:98`) |
| `label:triage:deciding`            | Needs maintainer discussion                              |
| `label:good first issue`           | Small, well-scoped onboarding task (label is `good first issue` — spaces, no hyphens) |
| `add-labels`                       | Only needs co-ownership (`sig:*`/`lang:*`/`docs:*`) / type / area labels added |

**Accepted issues must carry the `sig-practices.md:77-107` mandatory
set.** When emitting `label:triage:accepted*` or `add-labels`, also
apply — if not already present — one co-ownership label
(`sig:*`, `lang:*`, or `docs:*`) and verify an issue type is set
(GitHub-native `bug`/`enhancement`, usually inherited from the issue
template's `type:` field, or one of the label-based types
`type:question` / `type:copyedit`). Do not manually set GitHub-native
types; they come from the template.

**Never suggest PR-only labels on issues.** `ready-to-be-merged`,
`missing:cla`, `missing:docs-approval`, `missing:sig-approval`,
`sig-approval-missing`, `auto-update`, `0-meta`, `admin` are managed
by PR workflows and don't belong on issues. See `otel-issue-draft`
skill, `#pr-only-labels-do-not-suggest`.

**Never suggest `type:discussion`.** The label's own description says
"Do not use, convert discussion issues into real Discussions." If the
issue reads as open-ended conversation, recommend `close:wontfix` (→
`--reason "not planned"`) with a suggested comment pointing to
GitHub Discussions.

**Never recommend `--add-assignee` for first-time contributors.**
`content/en/docs/contributing/_index.md:19-31`: issues are not
assigned to contributors who have not already landed a PR (absent a
confirmed mentorship). If an assignment-request comment is present,
note that `.github/workflows/first-timer-response.yml` already
auto-responds; do not emit an assign command.

**`triage:followup` is a manual convention, not automation.**
`sig-practices.md:124-127` describes an automated 14-day re-triage
marker, but the `triage:followup` label does not currently exist in
the live label set and no workflow applies it. Treat it as a manual
marker a triager may apply when walking stale `triage:deciding`
issues. Flag to maintainers if you'd like this automated.

---

## Phase 4: Generate Report {#phase-4-generate-report}

Save to `.tasks/triage/reports/triage-YYYY-MM-DD-Nissues.md` where N is the
number of issues analyzed (e.g., `triage-2026-04-01-10issues.md`). If a file
with that exact name exists, append a timestamp:
`triage-YYYY-MM-DD-Nissues-HHmm.md`.

### Report Template

````markdown
# Triage Report — YYYY-MM-DD

**Issues analyzed**: N **Filters applied**: (list active filters) **Profiles
active**: (list profile names, or "none") **Sorting**: staleness-first (oldest
updated → newest)

## Summary

| Action            | High | Medium | Low | Total |
| ----------------- | ---- | ------ | --- | ----- |
| Close (stale)     | X    | X      | X   | X     |
| Close (duplicate) | X    | X      | X   | X     |
| Close (wontfix)   | X    | X      | X   | X     |
| Accept (needs-pr) | X    | X      | X   | X     |
| Accept            | X    | X      | X   | X     |
| Needs info        | X    | X      | X   | X     |
| Deciding          | X    | X      | X   | X     |
| Add labels only   | X    | X      | X   | X     |

### By Category

| Category      | Issues | Closeable | Actionable | Needs Review |
| ------------- | ------ | --------- | ---------- | ------------ |
| sig:collector | X      | X         | X          | X            |
| docs-general  | X      | X         | X          | X            |
| ...           | ...    | ...       | ...        | ...          |

<!-- Render one block per evaluation profile. Omit section if no evaluation profiles active. -->

## Profile Assessment: {evaluation_profile.name}

> {evaluation_profile.report_note}

| Verdict      | Count |
| ------------ | ----- |
| Recommended  | X     |
| Maybe        | X     |
| Not suitable | X     |

---

## HIGH Confidence — Auto-actionable

### [#1234](https://github.com/<REPO>/issues/1234) — [Docs]: Update SDK configuration page

- **Type**: docs | **Created**: 2024-01-15 | **Last updated**: 2024-02-01
- **Author**: @username (last active: 2025-12-01) | **Reactions**: 2 👍
- **Comments**: 3 (last: 2024-03-01)
- **Staleness**: Critical (400+ days)
- **Current labels**: `docs`

**Content Summary:** One-paragraph summary of what the issue requests.

**Codebase Analysis:**

- Referenced file `content/en/docs/languages/go/configuration.md`:
  - Status: exists
  - Commits since issue opened: 12
  - Assessment: content was rewritten in
    [#4567](https://github.com/<REPO>/pull/4567), appears to address this issue

**Related PRs:**

- [#4567](https://github.com/<REPO>/pull/4567) (merged 2024-06-15): "Rewrite Go
  config docs" — likely resolves this

**Linked Issues:**

- (none)

**Duplicate Candidates:**

- (none)

**Recommendation:**

- **Action**: `close:stale`
- **Confidence**: HIGH
- **Rationale**: Referenced file was rewritten in
  [#4567](https://github.com/<REPO>/pull/4567). No activity in 12+ months.
  Content now covers the requested topic.
- **Suggested labels**: `sig:go`, `docs`

**Suggested Comment:**

> This issue appears to have been addressed by subsequent updates to the
> configuration documentation (see PR #4567). Closing as resolved. If you
> believe this is still an issue, please reopen with updated details.

**Commands:**

```bash
gh issue comment 1234 -R <REPO> --body "This issue appears to have been addressed by subsequent updates to the configuration documentation (see PR #4567). Closing as resolved. If you believe this is still an issue, please reopen with updated details."
gh issue edit 1234 -R <REPO> --add-label "sig:go,docs"
gh issue close 1234 -R <REPO> --reason "not planned"
```
````

---

## MEDIUM Confidence — Suggested Triage

(same dossier format, recommendation less certain)

---

## LOW Confidence — Needs Human Review

(same dossier format, multiple possible actions noted)

````

### Link Format Rules

All issue and PR references in the report MUST be clickable markdown links:

- **Issue headings**: `[#123](https://github.com/<REPO>/issues/123)`
- **PR references**: `[#456](https://github.com/<REPO>/pull/456)`
- **Cross-repo issues**: `[repo#789](https://github.com/open-telemetry/repo/issues/789)`
- **Cross-repo PRs**: `[repo#789](https://github.com/open-telemetry/repo/pull/789)`

Never use bare `#123` references in the report — always wrap in a markdown
link so the report is navigable from any markdown viewer.

---

## Phase 5: Update State {#phase-5-update-state}

Write/update `.tasks/triage/state.json` (schema:
`${CLAUDE_PLUGIN_ROOT}/schemas/triage-state.schema.json`). Create the
directory and an empty `{"version":1,"issues":{}}` file on the first
run if neither exists.

### Fields

| Field | Set by | Required | Purpose |
|-------|--------|----------|---------|
| `number` | Analysis | Yes | GitHub issue number |
| `decision` | Analysis | Yes | Recommended action (e.g., `close:stale`, `label:triage:accepted:needs-pr`) |
| `confidence` | Analysis | Yes | `HIGH`, `MEDIUM`, or `LOW` |
| `analyzedAt` | Analysis | Yes | When the issue was analyzed |
| `issueUpdatedAt` | Analysis | Yes | GitHub `updatedAt` at analysis time — used for change detection |
| `executedAt` | Execution | No | When the decision was acted on (comment/label/close) |
| `outcome` | Execution | No | What was actually done — may differ from `decision` on reviewer override |
| `note` | Execution | No | Rationale when outcome diverges from recommendation |

### Example

```json
{
  "version": 1,
  "lastRun": "2026-04-01T15:00:00-03:00",
  "issues": {
    "1234": {
      "number": 1234,
      "decision": "close:stale",
      "confidence": "HIGH",
      "analyzedAt": "2026-04-01T12:00:00-03:00",
      "issueUpdatedAt": "2024-02-01T00:00:00Z",
      "executedAt": "2026-04-02T10:00:00-03:00",
      "outcome": "close:completed"
    },
    "5678": {
      "number": 5678,
      "decision": "label:triage:accepted:needs-pr",
      "confidence": "HIGH",
      "analyzedAt": "2026-04-01T12:00:00-03:00",
      "issueUpdatedAt": "2025-01-20T08:41:07Z",
      "executedAt": "2026-04-02T10:00:00-03:00",
      "outcome": "label:triage:deciding:needs-info",
      "note": "Upstream README uses nodes/pods not nodes/proxy — needs clarification before accepting"
    }
  }
}
````

### Lifecycle

1. **Analysis phase** sets: `number`, `decision`, `confidence`, `analyzedAt`,
   `issueUpdatedAt`
2. **Execution phase** (human-driven) adds: `executedAt`, `outcome`, and
   optionally `note` when the reviewer overrides the recommendation
3. Issues with `outcome: "skipped"` remain candidates for future triage runs

### State logic on subsequent runs

- **Skip**: `issueUpdatedAt` matches current GitHub `updatedAt` AND `outcome` is
  set (already triaged and executed)
- **Re-analyze**: GitHub `updatedAt` > stored `issueUpdatedAt` (new activity)
- **Pending execution**: `decision` is set but `outcome` is absent — surface
  these to the reviewer as "awaiting action" instead of re-analyzing
- **Analyze as new**: issue number not in state

---

## Parallel Execution Strategy {#parallel-execution-strategy}

**Always use subagents for issue analysis.** The orchestrator (main session)
handles fetching, filtering, categorization, report assembly, and state
management. The token-expensive per-issue analysis (reading full issue bodies,
comment threads, git log, PR searches, codebase cross-referencing) runs through
`otel-issue-triager` subagents on a cheaper model (Sonnet). See
`.claude/agents/otel-issue-triager.md` for the full subagent spec — it
mirrors the actions, confidence tiers, link-format rules, and
[Close-Reason Mapping](#close-reason-mapping) used here.

### Execution flow

1. **Orchestrator** (Opus): fetch issues, filter, categorize into buckets
2. **Subagents** (Sonnet via `otel-issue-triager`): spawn one agent per category
   bucket. Each agent receives:
   - The issue list (numbers + pre-fetched JSON summary)
   - Category context (which codebase area to focus on)
   - The analysis checklist and output format from this skill
   - Instruction to produce linked markdown dossiers
   - `<repo_profile>` XML block — the `repo` section of the merged PROFILE (omit
     if no repo profile is active)
   - `<evaluation_profiles>` XML block — list of all `evaluation` sections from
     the merged PROFILE (omit if none)
3. **Orchestrator**: collect agent results, merge dossiers into the report
   ordered by confidence tier, write state file

Aim for 3–5 agents. If there are many small buckets, merge related ones (e.g.,
multiple language SIGs into a "languages" bucket). If there are ≤3 issues total,
a single agent is fine.

### Why subagents for analysis

The per-issue analysis is the most token-intensive phase (~4K tokens per issue
for fetching + cross-referencing). Running on Sonnet saves ~60% of token cost
while maintaining high analysis quality — the work is mostly structured data
extraction and pattern matching, not nuanced judgment. The orchestrator retains
synthesis and decision-making on Opus.

---

## Label Taxonomy Reference {#label-taxonomy-reference}

Label suggestions come from `PROFILE.repo.label_taxonomy` when a repo profile is
active. Use only labels confirmed to exist in the target repo — do not invent
labels.

For repositories without a repo profile, fetch the actual label list:

```bash
gh label list --repo <REPO> --json name --limit 100 | jq -r '.[].name'
```

The built-in `opentelemetry-website` profile defines the full taxonomy for
`open-telemetry/opentelemetry.io` — see
`${CLAUDE_PLUGIN_ROOT}/data/opentelemetry-website.yml`.

**For `open-telemetry/opentelemetry.io` specifically**, the sibling skill
`otel-issue-draft` has the validated taxonomy grouped by area / SIG /
localization / effort / priority / triage / type / assignment, already
checked against the live label set. Treat it as the source of truth and
refer to it instead of hand-typing label names. Also honor the
PR-only labels warning in that skill
(`#pr-only-labels-do-not-suggest`) — never apply those to an issue.

---

## gh Command Templates {#gh-command-templates}

### Close-Reason Mapping {#close-reason-mapping}

The internal action tokens from [Phase 3](#phase-3-analyze-issues) are
decision labels, not `gh` command flags. `gh issue close --reason`
accepts only three values (`gh issue close --help`); map as follows
when emitting commands:

| Internal action   | `gh issue close --reason` value |
| ----------------- | ------------------------------- |
| `close:completed` | `"completed"`                   |
| `close:stale`     | `"not planned"`                 |
| `close:wontfix`   | `"not planned"`                 |
| `close:invalid`   | `"not planned"`                 |
| `close:duplicate` | `"duplicate"` — prefer `--duplicate-of <N>` (see below) |

Never emit `--reason "stale"` / `"wontfix"` / `"invalid"` — `gh`
rejects them.

### Add triage label

```bash
gh issue edit <number> --repo <REPO> \
  --add-label "triage:accepted:needs-pr"
```

### Add co-ownership / area labels

```bash
gh issue edit <number> --repo <REPO> \
  --add-label "sig:collector,docs"
```

### Post comment

```bash
gh issue comment <number> --repo <REPO> \
  --body "<comment text>"
```

### Close as completed (merged PR resolved it)

```bash
gh issue close <number> --repo <REPO> \
  --reason "completed" \
  --comment "<resolution notice>"
```

### Close as not planned (stale / wontfix / invalid)

```bash
gh issue close <number> --repo <REPO> \
  --reason "not planned" \
  --comment "<stale/wontfix/invalid notice>"
```

### Close as duplicate

Preferred form — sets a GitHub-native duplicate relationship:

```bash
gh issue close <number> --repo <REPO> \
  --duplicate-of <dup-number> \
  --comment "Duplicate of #<dup-number>."
```

Fallback form:

```bash
gh issue close <number> --repo <REPO> \
  --reason "duplicate" \
  --comment "Duplicate of #<dup-number>."
```

---

## Comment Templates {#comment-templates}

Comment templates come from `PROFILE.repo.comment_templates` when a repo profile
is active. The built-in `opentelemetry-website` profile provides templates for
`stale`, `needs_info`, `duplicate`, `accepted`, and `good_first_issue`.

When no repo profile is active, use generic variants:

**Stale:**

```
This issue has had no activity for {N} months. Closing as stale. If still
relevant, please reopen with updated details.
```

**Needs info:**

```
Thank you for filing this issue. Could you provide more details?
- {specific missing info}

We'll revisit once more details are available.
```

**Duplicate:**

```
This appears to be a duplicate of #{duplicate_number}. Please check that
issue for updates. If your case is different, please reopen.
```

**Accepted:**

```
This issue has been triaged and accepted. It's ready for a contributor to
pick up.
```

**Good first issue:**

```
This issue has been triaged as a good first issue for new contributors.
```

## References {#references}

Source-of-truth files — if this skill drifts from them, trust the file:

- `content/en/docs/contributing/sig-practices.md:77-127` — mandatory
  co-ownership + `triage:*` + type labels on every triaged issue;
  optional effort / priority / special tags; `triage:followup`
  convention (note: the label does not currently exist in the live
  label set and no workflow automates it — manual only)
- `content/en/docs/contributing/issues.md:71-80` — scope, search-first,
  issue linking syntax, Code of Conduct
- `content/en/docs/contributing/_index.md:19-31` — first-time
  contributor "we do not assign issues" policy
- `.github/ISSUE_TEMPLATE/DOCS_UPDATE.yml`, `ISSUE_REPORT.yml`,
  `FEATURE_REQUEST.yml`, `BLOG_POST.yml`, `PAGE_FEEDBACK.yml` — the 5
  real templates; title prefixes (`[Docs]: `, `bug: `, `feat: `,
  `blog: `, `page feedback: `) and template-level `type:` fields
- `.github/workflows/first-timer-response.yml` — auto-responds to
  assignment-request comments on `good first issue` /
  `triage:accepted:needs-pr` issues
- `.github/component-label-map.yml`, `.github/component-owners.yml`
  — PR-only auto-labeling (trigger `pull_request_target`); no
  workflow auto-labels issues
- `.github/scripts/pr-approval-labels.sh` — source of the
  `ready-to-be-merged` and `missing:*` labels that never belong on
  issues
- `gh` CLI: `gh issue close --help` — the only valid `--reason`
  values are `completed`, `not planned`, and `duplicate`. The
  `--duplicate-of <N>` flag is preferred for duplicates.
- Sibling skill `otel-issue-draft/SKILL.md` — validated label taxonomy,
  `#pr-only-labels-do-not-suggest`, `type:discussion` deprecation,
  5-template reference
- Sibling skill `otel-pr-review/SKILL.md` — linked-issue requirement
  (`triage:accepted`), approval-label workflow
- Sibling agent `.claude/agents/otel-issue-triager.md` — the subagent
  spawned by this skill; mirrors actions, confidence tiers,
  close-reason mapping, and link-format rules
- Plugin: `${CLAUDE_PLUGIN_ROOT}/data/opentelemetry-website.yml` — default
  repo profile (`sig_keywords`, `type_filters`, `category_buckets`,
  `label_taxonomy`, `comment_templates`)
- Plugin: `${CLAUDE_PLUGIN_ROOT}/schemas/triage-profiles.schema.json`,
  `${CLAUDE_PLUGIN_ROOT}/schemas/triage-state.schema.json`
