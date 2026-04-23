# Process Rules {#process-rules}

**When to read:** during PR Review Workflow step 4 (Verify process rules). Walk
each section against the PR — especially CLA, linked-issue, locale-span, and AI
policy, which block merge on their own.

## CLA {#cla}

The repo uses the **CNCF CLA via Easy CLA** — not DCO. Every commit author email
should be covered (`pull-requests.md:64`, `pr-checks.md:30-32`). If `Easy CLA`
fails, ask the author to fix or rebase; as a last resort, close and re-open the
PR to retrigger the check (`sig-practices.md:169-172`). Skip asking for
`Signed-off-by:` trailers — they are not enforced here.

## Linked issue {#linked-issue}

PRs should reference an issue labeled `triage:accepted`, with two exceptions:
auto-update PRs (registry / version bumps), and hotfixes by maintainers or
approvers (`sig-practices.md:131-134`). Use `Fixes #12345` / `Closes #12345`
syntax (`issues.md:76-78`).

## Locale span {#locale-span}

PRs with **semantic** changes should not span multiple locales
(`localization.md:468-476`). Locale approvers review English edits and propagate
them in their own locale-specific PRs.

**Purely editorial** changes _can_ span locales if each edited locale page also
gets `# patched` appended to its `default_lang_commit` front-matter line
(`localization.md:478-536`). Editorial examples: link fixes, resource-URL
updates, targeted content additions to drifted files.

## First-time contributor AI policy {#ai-policy}

First 3 contributions should be primarily human-written (AIL1); the PR
description should be entirely human-written (AIL0) (`pull-requests.md:18-50`;
see also `.github/PULL_REQUEST_TEMPLATE.md`). The PR template includes an AI
checklist the author fills in. Reviewers should flag obvious AI-generated PR
descriptions from first-time contributors, though maintainers may grant drive-by
exceptions (`pull-requests.md:38-40`).

## Submodules {#submodules}

Non-maintainer PRs should not touch git submodules — a maintainer fixes them
before merge if one slips through (`sig-practices.md:164-168`). If you see a
submodule change in a non-maintainer PR, tell the author not to worry; it will
be fixed.

## Branch freshness {#branch-freshness}

Authors should avoid continuously rebasing — every sync retriggers CI, which
costs time and compute. The PR template explicitly says not to worry about being
out-of-date (`.github/PULL_REQUEST_TEMPLATE.md:30-31`,
`sig-practices.md:162-164`). Maintainers trigger a final update via the GitHub
UI before merging, then squash-merge (`sig-practices.md:224-235`):

```bash
export PR=<N>
gh pr checks $PR --watch && gh pr merge $PR --squash
```

## Stale handling {#stale-handling}

Automation adds `stale` after 21 days of inactivity; the label is removed within
~14 days by pinging participants and removing it (`sig-practices.md:153-155`).
PRs are not auto-closed (`sig-practices.md:156`).

## Co-owned PRs {#co-owned-prs}

PRs touching co-owned areas need **two approvals**: one docs approver, one SIG
(or locale) approver (`sig-practices.md:188-202`, `218-222`). After a docs
approval, a docs approver may add `sig-approval-missing` to signal the SIG. If
the SIG doesn't respond within ~2 weeks, a docs maintainer may merge at their
discretion.
