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

### What landed while this plan was in review {#context-landed}

Ownership splits into two axes that do not overlap by path:

- **Locale axis.** A locale team owns its whole `content/<loc>/` tree (plus
  `.cspell/<loc>-*.txt` and `prh/<loc>.yml`). The question it answers: who
  reviews the translation for this language. [#10374][] and [#10385][] moved
  this axis to a registry: [`data/locale-teams.yaml`][] lists each locale team's
  members, and [`scripts/gh/locale-codeowners/`][] generates the locale section
  of `CODEOWNERS` from it, with a CI check (`npm run check:codeowners`) that
  fails when the two drift. Unstaffed locales (empty `maintainers`) fall back to
  `@open-telemetry/docs-approvers` on the same line; GitHub ignores the empty
  team, so docs-approvers gate those PRs honestly until the locale graduates.
- **Component axis.** A SIG owns a path inside `content/en/` (collector, helm,
  operator, …) or a non-content component (blog, registry, CI/infra,
  dependencies). The question it answers: which SIG owns this slice of the
  English docs. This axis is still hand-synced across three files.

[#10371][] then restored `missing:sig-approval` for localization PRs: the bash
unions the locale teams (read from `CODEOWNERS`) with the SIG teams and gates
both with the same label. [#10295][] added [`locale-auto-merge.yml`][], a thin
bot that enables GitHub-native auto-merge on locale-only PRs.

The component axis still carries the hand-synced cluster this plan set out to
fix:

| File / section                | Axis      | Role today                                                       | Maintained                              |
| ----------------------------- | --------- | ---------------------------------------------------------------- | --------------------------------------- |
| `data/locale-teams.yaml`      | locale    | Locale team membership; source for the CODEOWNERS locale section | Registry, by hand                       |
| `CODEOWNERS` (locale section) | locale    | Required locale reviewers                                        | Generated from the registry, CI-checked |
| `CODEOWNERS` (rest)           | component | Required SIG and root reviewers                                  | By hand                                 |
| `component-label-map.yml`     | component | `actions/labeler` config → `sig:*`, `blog`, `lang:*` …           | By hand                                 |
| `component-owners.yml`        | component | Suggested reviewers; also parsed for SIG approval check          | By hand                                 |

The locale axis already reached the shape this plan wants: one editable home,
CODEOWNERS generated, CI-checked. The component axis has not.

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
- One editable home per ownership fact, ending the hand-synced component-axis
  files. The locale axis already has this; the component axis should match it.
- Unit-tested rules. Today the logic spans ~500 lines of bash that parse YAML,
  and now `CODEOWNERS`, with regexes.
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
- Preserve the locale-approval behavior [#10371][] shipped: a locale team gates
  its own locale tree through `missing:sig-approval`, the same label SIG
  approval uses.
- Finish the component axis the way the locale axis finished: a registry the
  engine reads directly, `CODEOWNERS` generated from it, the result CI-checked.

## Non-goals {#non-goals}

- Merge enforcement stays as is: `CODEOWNERS` plus the branch ruleset remain the
  hard gate, and engine labels are an advisory layer on top. `CODEOWNERS`
  becomes fully generated but stays the artifact GitHub reads.
- `missing:cla` stays with EasyCLA.
- Auto-merge stays locale-only. [`locale-auto-merge.yml`][] is untouched, and
  component-SIGs gain no auto-merge powers. Gating stays with `CODEOWNERS` and
  the branch ruleset, per [#10374][]. The bot is a sibling that reads the same
  locale registry; the engine never toggles auto-merge or disputes with it.
- Who can merge stays unchanged.

## Behavior spec {#behavior-spec}

This is the definitive rule set. The engine owns the labels it introduces: it
adds and removes them, and humans should leave them alone. The engine never
touches labels it does not own, such as the human-managed `blocked`.

### Component and locale labels, review requests {#spec-component}

- The engine matches changed paths against both axes and applies the matching
  labels: component labels from the unified component config (`sig:*`, `blog`,
  `registry`, `CI/infra`, `dependencies`, …) and `lang:*` from the locale axis.
  It then requests reviews from the owning teams. Today `actions/labeler` and
  `dyladan/component-owners` split this work.

### Approval labels (generic mechanism) {#spec-approval}

- The config declares, per path set, the required-approval team(s) and the
  `missing:*` label that tracks each requirement. The engine has no hardcoded
  tiers. The initial policy replicates today's behavior, both axes included:
  - `docs-approvers` approval on every PR → `missing:docs-approval`.
  - Owning SIG approval when a component-owned path under `content/en/` changes
    → `missing:sig-approval`.
  - Owning locale team approval when a `content/<loc>/` tree changes →
    `missing:sig-approval` (the same label, per [#10371][]). The required team
    is `docs-<loc>-approvers`; staffing comes from the registry.
- A team satisfies its requirement when at least one member's latest review is
  APPROVED and no member has an outstanding CHANGES_REQUESTED.
- When the engine cannot fetch team membership, or the team is empty (an
  unstaffed locale), it skips the affected check and changes no labels. The
  CODEOWNERS fallback leaves `docs-approvers` as the gate (fail-safe, as today).

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

`scripts/gh/pr-labels/` follows the established `scripts/gh/<name>/` pattern,
the one [`scripts/gh/locale-codeowners/`][] and `scripts/gh/locale-auto-merge/`
already use: `index.mjs` holds the pure logic, `cli.mjs` wraps it for workflows,
`index.test.mjs` covers it. Inputs: the PR snapshot (files, latest reviews,
labels, dates, team memberships) and the ownership registries. Outputs: labels
to add or remove, teams to request, comments to post. GitHub API I/O stays at
the edges, so each rule above becomes a unit test.

The engine reads the structured registries directly — `data/locale-teams.yaml`
for the locale axis, the unified component config for the component axis. It
never parses `CODEOWNERS`: that file is a generated output, kept in sync with
the registries by CI, not an engine input. This drops the text parsing the bash
relies on after [#10371][].

### Workflow topology (4 engine files) {#arch-topology}

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
- Two workflows sit outside this set and stay as they are:
  `locale-auto-merge.yml` (auto-merge for locale PRs) and the `check-codeowners`
  job in `check-file.yml` (CI sync check for the generated `CODEOWNERS`).
- We considered a reusable workflow for the engine and declined it: unlike the
  `/fix` pipeline, no untrusted code runs here, so a reusable workflow adds
  indirection without a trust-boundary payoff.

### Ownership registries, two axes {#arch-config}

Ownership has two axes that never overlap by path, so they stay two registries:

- **Locale axis — unchanged.** `data/locale-teams.yaml` stays the source of
  truth for who reviews each `content/<loc>/` tree. The plan does not touch it.
- **Component axis — unified.** A new file (name and schema open) replaces
  `component-label-map.yml` and `component-owners.yml`. Each entry declares
  paths, labels to apply, teams to request reviews from, and approval
  requirements (team → `missing:*` label).

"Single source of truth" means one editable home per ownership fact, not one
physical file. Folding locale membership and path→SIG mappings into one file
would conflate two different kinds of data; keeping them apart matches how they
are edited.

### CODEOWNERS generation {#arch-codeowners}

One generator owns the whole `CODEOWNERS`. `scripts/gh/locale-codeowners/` grows
into `scripts/gh/codeowners/`: it reads both registries and emits two marked
blocks — `BEGIN/END locale-owners` (as today) and a new
`BEGIN/END component-owners`. Everything outside the markers stays hand-written.
The `check:codeowners` CI job verifies both blocks, so neither registry can
drift from `CODEOWNERS`. Generation runs at commit time and is CI-checked,
separate from the engine, which runs per PR event — different lifecycles, so
they stay in different modules.

With the component block generated, `CODEOWNERS` is fully derived from the two
registries, and the engine drops `actions/labeler` and
`dyladan/component-owners` — two third-party pinned actions that ran with
privileged tokens on `pull_request_target`.

## Open decisions {#open-decisions}

- Name and schema of the unified component config (e.g.
  `.github/component-ownership.yml`), and how far it reuses the locale
  registry's conventions (marker blocks, `--check`, validation).
- Whether the digest keeps the Slack Workflow Builder webhook contract
  (`pr_list` text variable) or moves to Block Kit.
- Final workflow file names (`blog-publish.yml` vs keeping
  `blog-publish-labels.yml`).

## Resolved decisions {#resolved-decisions}

- Two ownership axes, not one file. The locale axis tracks team membership and
  owns `content/<loc>/` trees; the component axis owns paths inside
  `content/en/` and non-content components. They do not overlap by path, so they
  stay two registries with a shared mechanism.
- Locale work stays. `data/locale-teams.yaml`, `scripts/gh/locale-codeowners/`,
  and `locale-auto-merge.yml` landed in [#10374][]/[#10385][]/[#10295][]. The
  plan extends their pattern instead of rewriting them.
- `CODEOWNERS` fully generated by one generator (`scripts/gh/codeowners/`, two
  marker blocks) from both registries, CI-checked. This kills the hand-synced
  component triple and answers the earlier "add a CI sync check?" question by
  adopting the check the locale axis already uses.
- Engine reads the registries directly; `CODEOWNERS` is a generated output,
  never an engine input. Removes the text parsing the bash relied on.
- Locale-approval preserved on `missing:sig-approval`. [#10371][] made it live
  by unioning locale teams with SIG teams; the engine keeps that exact label. A
  future split to `missing:locale-approval` is a config-only change, not an
  engine change.
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
  config declares; a future rule (announcements, a locale-specific label) is a
  config edit, not an engine change.
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
- Auto-merge stays locale-only. The engine handles labels, not merge; the bot
  handles merge, not labels.

## Phases {#phases}

Each phase is a separate PR, live-validated before the next starts, following
the [reusable patch actions][patch-plan] precedent.

### Phase 1: port the engine, behavior parity {#phase-1}

Rewrite `pr-approval-labels.sh` and `blog-publish-check.sh` as
`scripts/gh/pr-labels/` with unit tests. The engine is generic inside and reads
each axis through a Phase-1 adapter:

- Locale axis: read `data/locale-teams.yaml` directly (path → locale →
  `docs-<loc>-approvers`, staffing from the `maintainers` list).
- Component axis: adapter over `component-owners.yml` and
  `component-label-map.yml`, until Phase 4 introduces the unified config.
- Union locale and SIG teams into `missing:sig-approval`, matching [#10371][].

Workflows become thin callers. No intended behavior change.

- [ ] Unit tests cover approval evaluation (SIG ∪ locale), date gating,
      change-request attribution, label diffing, and the unstaffed-locale
      fail-safe
- [ ] Live: PR event run, fork-PR review run (`workflow_run` path), and daily
      batch run produce the same labels as before, including on locale PRs

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

### Phase 4: unify the component axis, finish CODEOWNERS {#phase-4}

Introduce the unified component config, replacing `component-label-map.yml` and
`component-owners.yml`. Grow `scripts/gh/locale-codeowners/` into
`scripts/gh/codeowners/`: read both registries and generate the whole
`CODEOWNERS` (`locale-owners` block plus a new `component-owners` block),
CI-checked. Switch the engine to read the component registry directly. Retire
`actions/labeler`, `dyladan/component-owners`, `component-label-map.yml`,
`component-owners.yml`, and the Phase-1 component adapter. Update
`content/en/site/build/ci-workflows.md` (terse: design intent, not
implementation).

- [ ] Live: component labels and review requests match pre-migration behavior on
      a sample of real PRs
- [ ] Live: `check:codeowners` fails when the component registry changes without
      regenerating; `fix:codeowners` restores sync
- [ ] Migration documented for maintainers (which file to edit now, per axis)

<!-- prettier-ignore-start -->
[`label-manager.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/label-manager.yml
[`pr-review-trigger.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/pr-review-trigger.yml
[`blog-publish-labels.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/blog-publish-labels.yml
[`component-owners.yml` (workflow)]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/component-owners.yml
[`locale-auto-merge.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/locale-auto-merge.yml
[`pr-approval-labels.sh`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/scripts/pr-approval-labels.sh
[`blog-publish-check.sh`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/scripts/blog-publish-check.sh
[`data/locale-teams.yaml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/data/locale-teams.yaml
[`scripts/gh/locale-codeowners/`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/gh/locale-codeowners/README.md
[#10374]: https://github.com/open-telemetry/opentelemetry.io/issues/10374
[#10385]: https://github.com/open-telemetry/opentelemetry.io/pull/10385
[#10371]: https://github.com/open-telemetry/opentelemetry.io/pull/10371
[#10295]: https://github.com/open-telemetry/opentelemetry.io/pull/10295
[patch-plan]: ./pr-fix-reusable-actions.plan.md
<!-- prettier-ignore-end -->
