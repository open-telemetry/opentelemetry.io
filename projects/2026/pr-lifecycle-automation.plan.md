---
title: Redesign of PR lifecycle automation
custodian: '[Vitor Vasconcellos](https://github.com/vitorvasc)'
status: draft
---

## Context {#context}

Three workflows manage PR labels today:

- [`label-manager.yml`][] (formerly "PR approval labels") runs on PR events
  (`pull_request_target`) and on review events through the
  [`pr-review-trigger.yml`][] → `workflow_run` chain (`pull_request_review` has
  no `_target` variant, so fork PRs need the bridge). It calls
  [`pr-approval-labels.sh`][] to manage `missing:docs-approval`,
  `missing:sig-approval`, and `ready-to-be-merged`, and `actions/labeler` to add
  component labels.
- [`blog-publish-labels.yml`][] runs a daily batch at 7 AM UTC. It calls
  [`blog-publish-check.sh`][], which re-runs `pr-approval-labels.sh` for every
  open `blog` PR so that publish-date arrivals flip `ready-to-be-merged`, then
  notifies Slack about PRs that transitioned during the batch.
- [`component-owners.yml` (workflow)][] uses `dyladan/component-owners` to
  request reviews from owning teams.

Ownership knowledge lives in three config files that maintainers sync by hand
(two of them carry "keep in sync" comments):

| File                      | Role today                                              |
| ------------------------- | ------------------------------------------------------- |
| `CODEOWNERS`              | Required reviewers, enforced by the GitHub ruleset      |
| `component-label-map.yml` | `actions/labeler` config → `sig:*`, `blog`, `lang:*` …  |
| `component-owners.yml`    | Suggested reviewers; also parsed for SIG approval check |

### Known issue {#known-issue}

A blog post reached its publication date, the daily workflow succeeded and
applied `ready-to-be-merged`, and the notification was never sent to Slack.

The notification fires only when the PR transitions to ready during the daily
batch, because only `blog-publish-labels.yml` sets `LABELED_PRS_OUTPUT_FILE`.
When `label-manager.yml` applies the label first (the final approval arrives
after the publish date has passed), the next morning's batch sees the label
already present and writes no notification record. Whether Slack hears about a
PR depends on which workflow applied the label.

## Needs {#needs}

- Decouple the stages: ownership config → component labels → approval evaluation
  → notification. Each stage should be testable and replaceable on its own.
- A single source of truth for ownership, ending the hand-synced triple.
- Unit-tested rules. Today the logic spans ~500 lines of bash that parse YAML
  with regexes.
- Notification semantics that derive from current state, so no transition can
  slip past unannounced.
- Comments on the PR when the engine makes a surprising change.

## Goals {#goals}

- A single rule engine decides all label changes, review requests, and comments
  for a PR.
- Thin workflows that carry triggers, permissions, and policy only, following
  the [reusable patch actions plan][patch-plan].
- A daily Slack digest computed from label state alone.
- New rules that close today's gaps: cleanup on close, transition comments,
  change-request attribution.

## Non-goals {#non-goals}

- Merge enforcement stays as is: `CODEOWNERS` plus the branch ruleset remain the
  hard gate, and engine labels are an advisory layer on top.
- `missing:cla` stays with EasyCLA.
- Locale-approval tracking stays off in the initial policy. The generic
  mechanism supports it later as a config-only change, once locale teams buy in.
- Who can merge, and how auto-merge works, stay unchanged.

## Behavior spec {#behavior-spec}

This is the definitive rule set. The engine owns the labels it introduces: it
adds and removes them, and humans should leave them alone. The engine never
touches labels it does not own, such as the human-managed `blocked`.

### Component labels and review requests {#spec-component}

- The engine matches changed paths against the unified ownership config, applies
  the matching component labels (`sig:*`, `blog`, `lang:*`, `registry`,
  `CI/infra`, `dependencies`, …), and requests reviews from the owning teams.
  Today `actions/labeler` and `dyladan/component-owners` split this work.

### Approval labels (generic mechanism) {#spec-approval}

- The config declares, per path set, the required-approval team(s) and the
  `missing:*` label that tracks each requirement. The engine has no hardcoded
  tiers. The initial policy replicates today's behavior:
  - `docs-approvers` approval on every PR → `missing:docs-approval`.
  - Owning SIG approval when SIG-owned paths change → `missing:sig-approval`.
- A team satisfies its requirement when at least one member's latest review is
  APPROVED and no member has an outstanding CHANGES_REQUESTED.
- When the engine cannot fetch team membership, it skips the affected checks and
  changes no labels (fail-safe, as today).

### Change requests {#spec-change-requests}

- An outstanding CHANGES_REQUESTED from anyone blocks `ready-to-be-merged` and
  applies the engine-owned `blocked:changes-requested` label. The engine removes
  the label when no change requests remain.
- A change request from a member of a required-approval team also re-applies
  that team's `missing:*` label, so labels name the team holding the PR. Today
  any change request adds `missing:docs-approval`, even one from a SIG reviewer
  or a drive-by reviewer.
- The plain `blocked` label stays human-owned and untouched.

### Ready to be merged {#spec-ready}

- The engine applies `ready-to-be-merged` when all required approvals are
  present and no change requests are outstanding.
- Publish-date gate, for PRs carrying a publish-date label (currently `blog`):
  the latest `date:` in the front matter of changed content files must be today
  or earlier (UTC). A future date withholds or removes `ready-to-be-merged`,
  even on a fully approved PR.

### Transition comments on blog PRs {#spec-comments}

The engine comments only when it changes `ready-to-be-merged` on an open PR
carrying a publish-date label. Re-evaluations without changes stay silent.

- Applied → comment: ready for publication, approvals complete and publish date
  reached.
- Removed, publish date now in the future → comment: label removed because the
  publish date moved to a future date; the engine re-applies it when the date
  arrives, provided all required approvals are present.

This covers the "date changed" scenarios by construction: the engine compares
desired state against current labels, so a date edit on an already-ready PR
produces a removal transition. No diff inspection needed.

### Cleanup on close {#spec-cleanup}

- When a PR closes or merges, the engine removes its approval labels:
  `missing:docs-approval`, `missing:sig-approval`, `blocked:changes-requested`,
  `ready-to-be-merged`. Component labels stay, useful for history and queries.

### Daily Slack digest {#spec-digest}

- The digest derives from current label state, never from transition records.
  Two sections:
  1. Ready to publish today: open blog PRs with `ready-to-be-merged`.
  2. Queued: open blog PRs with all approvals, awaiting their publish date,
     listed with the date.
- An empty digest sends no message. A `workflow_dispatch` test input sends a
  fake payload to validate the webhook wiring, replacing today's `force_notify`.

## Architecture {#architecture}

### Rules engine as a pure module {#arch-engine}

`scripts/gh/pr-labels/` follows the established `scripts/gh/<name>/` pattern:
`index.mjs` holds the pure logic, `cli.mjs` wraps it for workflows,
`index.test.mjs` covers it. Inputs: the PR snapshot (files, latest reviews,
labels, dates, team memberships) and the ownership config. Outputs: labels to
add or remove, teams to request, comments to post. GitHub API I/O stays at the
edges, so each rule above becomes a unit test.

### Workflow topology (4 files) {#arch-topology}

| Workflow                  | Trigger                                                                                       | Responsibility                                              |
| ------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `pr-review-trigger.yml`   | `pull_request_review` (unchanged)                                                             | Save PR number artifact; no secrets (fork-PR review bridge) |
| `label-manager.yml`       | `pull_request_target` (opened, reopened, synchronize, closed) + `workflow_run` of the trigger | Run the engine for one PR                                   |
| `blog-publish.yml`        | `schedule` (7 AM UTC) + `workflow_dispatch`                                                   | Re-run the engine for every open publish-date-labeled PR    |
| `blog-publish-digest.yml` | `workflow_run` of `blog-publish` + `workflow_dispatch`                                        | Build and send the Slack digest                             |

- The digest chains on `workflow_run` completion of the batch: no clock-offset
  coupling, and a failed Slack send shows up as its own re-runnable run.
- Shared job boilerplate (harden-runner, checkout, app token, setup-node) moves
  into a local composite action.
- We considered a reusable workflow for the engine and declined it: unlike the
  `/fix` pipeline, no untrusted code runs here, so a reusable workflow adds
  indirection without a trust-boundary payoff.

### Unified ownership config {#arch-config}

A new file (name and format open) replaces `component-label-map.yml` and
`component-owners.yml` as the canonical source. Each entry declares paths,
labels to apply, teams to request reviews from, and approval requirements (team
→ `missing:*` label). The engine consumes it directly and replaces both
`actions/labeler` and `dyladan/component-owners`, removing two third-party
pinned actions that run with privileged tokens on `pull_request_target`.
`CODEOWNERS` stays manual, in GitHub's required format.

## Open decisions {#open-decisions}

- Name and schema of the unified ownership file (e.g. `.github/ownership.yml`).
- When to activate locale-approval tracking (a config-only change; needs
  locale-team buy-in).
- Whether to add a CI sync check between the unified file and `CODEOWNERS`,
  killing the last hand-maintained "keep in sync" comment.
- Whether the digest keeps the Slack Workflow Builder webhook contract
  (`pr_list` text variable) or moves to Block Kit.
- Final workflow file names (`blog-publish.yml` vs keeping
  `blog-publish-labels.yml`).

## Resolved decisions {#resolved-decisions}

- No new `ready-to-be-published` label. An earlier draft mentioned one; the
  single `ready-to-be-merged` label, date-gated for blog PRs, stays.
- Digest over transition-based notification. The notification derives from label
  state, so it cannot miss a transition performed by another workflow. This
  removes the bug class behind the incident. The `LABELED_PRS_OUTPUT_FILE`/JSONL
  plumbing goes away, and the approval logic handles labels only.
- Our own rules engine replaces `actions/labeler` and
  `dyladan/component-owners`. Both do narrow work (glob-match to a label or a
  review request) that becomes pure, tested functions; glob matching comes from
  an established lib such as `picomatch`. Cost accepted: we own the label-sync
  edge cases the actions had solved.
- Generic approval mechanism, current policy. The engine executes whatever the
  config declares; a future rule (locale approval, announcements) is a config
  edit, not an engine change.
- `blocked:changes-requested` instead of `blocked`. Maintainers use the plain
  `blocked` label for unrelated blockers (see #9178–#9182). Design rule: the
  engine owns only namespaced labels it introduced, and it never disputes a
  label with humans.
- Transition comments instead of date-change detection. Comparing desired state
  with current labels yields the same user-visible outcome without diff or
  history machinery.
- Digest chained via `workflow_run`, ruling out an offset cron and a same-job
  step: it always runs after the batch, fails in isolation, and re-runs on its
  own.
- The fork-review `workflow_run` chain stays. `pull_request_review` has no
  `_target` variant; `pr-review-trigger.yml` remains the no-secrets bridge.

## Phases {#phases}

Each phase is a separate PR, live-validated before the next starts, following
the [reusable patch actions][patch-plan] precedent.

### Phase 1: port the engine, behavior parity {#phase-1}

Rewrite `pr-approval-labels.sh` and `blog-publish-check.sh` as
`scripts/gh/pr-labels/` with unit tests. The engine is generic inside but reads
the current config files through adapters. Workflows become thin callers. No
intended behavior change.

- [ ] Unit tests cover approval evaluation, date gating, change-request
      attribution, and label diffing
- [ ] Live: PR event run, fork-PR review run (`workflow_run` path), and daily
      batch run produce the same labels as before

### Phase 2: decouple the digest, fixing the incident {#phase-2}

Add `blog-publish-digest.yml`, chained on the batch via `workflow_run`. The
digest reads label state (two sections). The JSONL plumbing goes; a dispatch
test input replaces `force_notify`.

- [ ] Live: a PR made ready by a PR-event run, not the batch, appears in the
      next digest (the incident scenario)
- [ ] Live: empty state sends no message; a test dispatch reaches Slack

### Phase 3: new rules {#phase-3}

Add cleanup on close and merge, transition comments on blog PRs, and
`blocked:changes-requested` (create the label with a description) with
team-attributed change requests.

- [ ] Live: close/merge removes engine-owned labels
- [ ] Live: a date moved to the future on a ready blog PR removes the label and
      comments
- [ ] Live: a change request from a SIG member adds `missing:sig-approval` and
      `blocked:changes-requested`; resolution clears both

### Phase 4: unified ownership config {#phase-4}

Introduce the unified file. The engine reads it directly. Retire
`actions/labeler`, `dyladan/component-owners`, `component-label-map.yml`,
`component-owners.yml`, and the adapters. Update
`content/en/site/build/ci-workflows.md` (terse: design intent, not
implementation).

- [ ] Live: component labels and review requests match pre-migration behavior on
      a sample of real PRs
- [ ] Migration documented for maintainers (which file to edit now)

<!-- prettier-ignore-start -->
[`label-manager.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/label-manager.yml
[`pr-review-trigger.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/pr-review-trigger.yml
[`blog-publish-labels.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/blog-publish-labels.yml
[`component-owners.yml` (workflow)]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/component-owners.yml
[`pr-approval-labels.sh`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/scripts/pr-approval-labels.sh
[`blog-publish-check.sh`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/scripts/blog-publish-check.sh
[patch-plan]: ./pr-fix-reusable-actions.plan.md
<!-- prettier-ignore-end -->
