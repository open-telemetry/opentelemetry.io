---
name: triage-issue
description: >-
  Batch triage GitHub issues for any repository (defaults to
  open-telemetry/opentelemetry.io). Analyzes staleness, duplicates, codebase
  changes, and related PRs to produce actionable triage reports with
  ready-to-paste gh commands. Read-only — never modifies GitHub.
argument-hint:
  '[--repo OWNER/REPO] [--count N] [--label LABEL[,LABEL2]] [--sig SIG] [--since
  DATE] [--exclude N,N] [--include-closed] [--fresh] [--pending] [--reanalyze
  N,N] [--type TYPE] [--profile NAME[,NAME2]]'
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
`draft-issue`. For process rules that connect triaged issues to PR reviews
(e.g., the `triage:accepted` linked-issue requirement), see
`review-pull-request`. See [References](#references) at the bottom.

## Bundled references {#bundled-references}

This skill uses progressive disclosure — the orchestrator below stays small, and
cold-path detail lives under `references/`. Load each file **only when you enter
the phase or action that uses it**:

- [`references/analysis-checklist.md`](./references/analysis-checklist.md) — the
  8-step per-issue signal-gathering checklist + confidence tiers, action tokens,
  and "never suggest" rules. Read at the start of Phase 3; keep open for the
  whole batch.
- [`references/report-template.md`](./references/report-template.md) — report
  file naming, section skeleton, dossier example, and link-format rules. Read at
  the start of Phase 4.
- [`references/state-schema.md`](./references/state-schema.md) — `state.json`
  fields, example, lifecycle, and subsequent-run routing logic. Read at the
  start of Phase 5 (and during Phase 1 when applying state-based filtering).
- [`references/label-taxonomy.md`](./references/label-taxonomy.md) — read before
  emitting any `--add-label` command to confirm labels exist and exclude PR-only
  labels.
- [`references/gh-commands.md`](./references/gh-commands.md) — canonical `gh`
  command templates and the close-reason mapping. Read whenever a dossier is
  about to emit a `gh issue close` / `edit` / `comment` command.
- [`references/comment-templates.md`](./references/comment-templates.md) —
  fallback comment text when no repo profile defines its own templates.

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

```text
profiles_requested = split and flatten all --profile values
```

### 2. Auto-detect repo profile

Determine the target repo (from `--repo` flag, or fall back to
`open-telemetry/opentelemetry.io` if omitted):

```text
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

Read and validate against
`${CLAUDE_PLUGIN_ROOT}/schemas/triage-profiles.schema.json`. Abort with a clear
error if validation fails.

### 4. Merge profiles

Merge all loaded profiles into a single `PROFILE` object:

- **`repo` section**: last profile wins on key conflicts
- **`evaluation` section**: all are collected into a list (multiple evaluations
  can stack — each produces its own assessment block per dossier)

### 5. Resolve final REPO and pass to subagents

```text
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

Load `.tasks/triage/state.json` (schema and routing rules in
[`references/state-schema.md`](./references/state-schema.md)). For each fetched
issue:

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

> **Note for `open-telemetry/opentelemetry.io`.** No workflow auto-labels issues
> in this repo. `.github/component-label-map.yml` and
> `.github/component-owners.yml` trigger on `pull_request_target` only. Any
> `sig:*`/`lang:*`/`docs:*` label already on an issue was applied manually by a
> triager, so it's authoritative. Unlabeled issues need categorization here.

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

For each issue, gather 8 signals (metadata, type, staleness, codebase
cross-reference, related PRs, external references, duplicates, recommendation)
and emit a confidence-tiered recommendation.

Read [`references/analysis-checklist.md`](./references/analysis-checklist.md)
once at the start of this phase — it contains every checklist step, the
`HIGH`/`MEDIUM`/`LOW` confidence criteria, the full action-token table, and the
"never suggest" rules. Keep it open for the whole batch; each issue re-uses the
same checklist.

In practice, the analysis work runs through `otel-issue-triager` subagents (see
[Parallel Execution Strategy](#parallel-execution-strategy)). The subagent spec
mirrors the same checklist — when editing one, mirror the change to the other.

---

## Phase 4: Generate Report {#phase-4-generate-report}

Save a report to `.tasks/triage/reports/triage-YYYY-MM-DD-Nissues.md`. Read
[`references/report-template.md`](./references/report-template.md) at the start
of this phase — it defines the file-naming rule (including the timestamp
fallback for same-day re-runs), the report skeleton (summary tables, category
breakdown, per-confidence dossier sections), and the link-format rules for all
`#123` references.

---

## Phase 5: Update State {#phase-5-update-state}

Write/update `.tasks/triage/state.json` after analysis so subsequent runs can
skip already-triaged issues. Read
[`references/state-schema.md`](./references/state-schema.md) for the full field
list, lifecycle, and example.

**Invariant:** every issue analyzed in this run gets a state entry with at least
`number`, `decision`, `confidence`, `analyzedAt`, and `issueUpdatedAt`.
Execution-phase fields (`executedAt`, `outcome`, `note`) are written by the
human reviewer, not by this skill.

---

## Parallel Execution Strategy {#parallel-execution-strategy}

**Always use subagents for issue analysis.** The orchestrator (main session)
handles fetching, filtering, categorization, report assembly, and state
management. The token-expensive per-issue analysis (reading full issue bodies,
comment threads, git log, PR searches, codebase cross-referencing) runs through
`otel-issue-triager` subagents on a cheaper model (Sonnet). See
`.claude/agents/otel-issue-triager.md` for the full subagent spec — it mirrors
the actions, confidence tiers, link-format rules, and close-reason mapping (see
[`references/gh-commands.md`](./references/gh-commands.md#close-reason-mapping))
used here.

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

## References {#references}

Bundled skill resources (read on demand, see
[Bundled references](#bundled-references) for when-to-read guidance):

- [`references/analysis-checklist.md`](./references/analysis-checklist.md) —
  Phase 3 per-issue checklist, confidence tiers, action tokens, "never suggest"
  rules
- [`references/report-template.md`](./references/report-template.md) — Phase 4
  report skeleton + dossier example + link-format rules
- [`references/state-schema.md`](./references/state-schema.md) — Phase 5
  `state.json` fields, lifecycle, subsequent-run routing
- [`references/label-taxonomy.md`](./references/label-taxonomy.md) — label
  provenance (`PROFILE.repo.label_taxonomy`, `draft-issue` skill taxonomy)
- [`references/gh-commands.md`](./references/gh-commands.md) — `gh` command
  templates and the close-reason mapping
- [`references/comment-templates.md`](./references/comment-templates.md) —
  fallback comment text when no repo profile templates are available

Source-of-truth files — if this skill drifts from them, trust the file:

- `content/en/docs/contributing/sig-practices.md:77-127` — mandatory
  co-ownership + `triage:*` + type labels on every triaged issue; optional
  effort / priority / special tags; `triage:followup` convention (note: the
  label does not currently exist in the live label set and no workflow automates
  it — manual only)
- `content/en/docs/contributing/issues.md:71-80` — scope, search-first, issue
  linking syntax, Code of Conduct
- `content/en/docs/contributing/_index.md:19-31` — first-time contributor "we do
  not assign issues" policy
- `.github/ISSUE_TEMPLATE/DOCS_UPDATE.yml`, `ISSUE_REPORT.yml`,
  `FEATURE_REQUEST.yml`, `BLOG_POST.yml`, `PAGE_FEEDBACK.yml` — the 5 real
  templates; title prefixes (`[Docs]: `, `bug: `, `feat: `, `blog: `,
  `page feedback: `) and template-level `type:` fields
- `.github/workflows/first-timer-response.yml` — auto-responds to
  assignment-request comments on `good first issue` / `triage:accepted:needs-pr`
  issues
- `.github/component-label-map.yml`, `.github/component-owners.yml` — PR-only
  auto-labeling (trigger `pull_request_target`); no workflow auto-labels issues
- `.github/scripts/pr-approval-labels.sh` — source of the `ready-to-be-merged`
  and `missing:*` labels that never belong on issues
- `gh` CLI: `gh issue close --help` — the only valid `--reason` values are
  `completed`, `not planned`, and `duplicate`. The `--duplicate-of <N>` flag is
  preferred for duplicates.
- Sibling skill `draft-issue/SKILL.md` — validated label taxonomy,
  `#pr-only-labels-do-not-suggest`, `type:discussion` deprecation, 5-template
  reference
- Sibling skill `review-pull-request/SKILL.md` — linked-issue requirement
  (`triage:accepted`), approval-label workflow
- Sibling agent `.claude/agents/otel-issue-triager.md` — the subagent spawned by
  this skill; mirrors actions, confidence tiers, close-reason mapping, and
  link-format rules
- Plugin: `${CLAUDE_PLUGIN_ROOT}/data/opentelemetry-website.yml` — default repo
  profile (`sig_keywords`, `type_filters`, `category_buckets`, `label_taxonomy`,
  `comment_templates`)
- Plugin: `${CLAUDE_PLUGIN_ROOT}/schemas/triage-profiles.schema.json`,
  `${CLAUDE_PLUGIN_ROOT}/schemas/triage-state.schema.json`
