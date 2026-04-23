# PR-Review Labels {#labels}

**When to read:** when auditing a PR's labels or deciding whether to recommend a
label change. For the full validated repo label taxonomy, defer to the
`draft-issue` skill — this file covers only labels that matter at PR review
time.

## Auto-applied (don't add by hand) {#auto-labels}

`.github/workflows/label-manager.yml` invokes `actions/labeler@v6` on
`pull_request_target` using `.github/component-label-map.yml` to add:

- Area: `blog`, `registry`, `i18n`
- `lang:<xx>` for every `content/<lang>/**` locale touched
- `sig:<name>` for SIG-owned paths (a separate `component-owners.yml` workflow
  assigns the SIG reviewers via `dyladan/component-owners@v0.2.0`)

The labeler adds these automatically — hand-adding them just duplicates work.

## Approval-workflow labels (managed by script) {#approval-labels}

`.github/scripts/pr-approval-labels.sh` manages four labels based on reviews
from `docs-approvers`, `docs-maintainers`, and the relevant SIG team (from
`.github/component-owners.yml`):

- `missing:cla` — CLA check failing
- `missing:docs-approval` — no docs-approver approval yet
- `missing:sig-approval` — SIG-team approval pending
- `ready-to-be-merged` — all required approvals present (and for blog PRs,
  publish date is today or past, per `blog-publish-check.sh`); withheld if any
  reviewer has an outstanding change request

The script is the source of truth — manual adjustments get overwritten on the
next workflow run. The label-manager workflow runs on `pull_request_target`
(opened/reopened/synchronize) and on `workflow_run` after
`pr-review-trigger.yml` captures a review event
(`.github/workflows/label-manager.yml`,
`.github/workflows/pr-review-trigger.yml`).

## Other PR labels to know {#other-pr-labels}

- `blocked` — waiting on external work (`sig-practices.md:152`)
- `stale` — inactivity marker (see
  [Stale handling in `process-rules.md`](./process-rules.md#stale-handling))
- `sig-approval-missing` — signal label from docs approver to SIG
  (`sig-practices.md:196-198`)
- `auto-update`, `0-meta`, `forever`, `admin` — workflow-internal; skip applying
  these to human PRs
