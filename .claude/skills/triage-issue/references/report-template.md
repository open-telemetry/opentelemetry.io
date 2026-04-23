# Report Template {#phase-4-generate-report}

**When to read:** at the start of Phase 4 (Generate Report). Use this file as
the canonical shape for the report written to
`.tasks/triage/reports/triage-YYYY-MM-DD-Nissues.md`. The dossier example at the
bottom is the exact structure to emit per issue.

Save to `.tasks/triage/reports/triage-YYYY-MM-DD-Nissues.md` where N is the
number of issues analyzed (e.g., `triage-2026-04-01-10issues.md`). If a file
with that exact name exists, append a timestamp:
`triage-YYYY-MM-DD-Nissues-HHmm.md`.

## Report skeleton

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

---

## MEDIUM Confidence — Suggested Triage

(same dossier format, recommendation less certain)

---

## LOW Confidence — Needs Human Review

(same dossier format, multiple possible actions noted)
````

## Link format rules

All issue and PR references in the report MUST be clickable markdown links:

- **Issue headings**: `[#123](https://github.com/<REPO>/issues/123)`
- **PR references**: `[#456](https://github.com/<REPO>/pull/456)`
- **Cross-repo issues**:
  `[repo#789](https://github.com/open-telemetry/repo/issues/789)`
- **Cross-repo PRs**:
  `[repo#789](https://github.com/open-telemetry/repo/pull/789)`

Never use bare `#123` references in the report — always wrap in a markdown link
so the report is navigable from any markdown viewer.
