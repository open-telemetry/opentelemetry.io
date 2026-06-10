---
title: Reusable patch actions for PR and maintenance fixes
custodian: '[Patrice Chalin](https://github.com/chalin)'
status:
  Phase 1 merged; phase 2 (housekeeping) implemented, live validation pending.
cSpell:ignore: fixx footgun test-and-fix
---

## Context

This work addresses
[open-telemetry/opentelemetry.io#6592](https://github.com/open-telemetry/opentelemetry.io/issues/6592):
automated fix workflows should be reusable, safe across trust boundaries, and
available to both PR-scoped fixes and repository maintenance tasks.

The current `/fix` workflow already follows the right security shape: untrusted
PR code can generate a patch, while trusted automation applies and publishes the
patch. The need is to turn that embedded workflow pattern into shared
infrastructure.

## Needs

- A reusable way to run an approved fix command and capture its file changes as
  a patch.
- A reusable trusted path to publish those patch changes without running
  untrusted code with write credentials.
- A foundation that can support `/fix` and scheduled housekeeping fixes (and
  potentially other callers, such as i18n fixes) without duplicating workflow
  logic.
- Clear separation between reusable mechanics and caller-specific policy.

## Goals

- Preserve the current `/fix` behavior and security posture.
- Make the untrusted/trusted split explicit and reusable.
- Keep future maintenance workflows thin and easier to review.
- Support incremental rollout: first refactor existing behavior, then add the
  scheduled housekeeping caller.

## Non-goals

- Do not broaden who can trigger PR fix commands.
- Do not make full `test-and-fix` run on every PR.
- Do not solve every scheduled maintenance case in the first extraction.
- Do not collapse trust-boundary policy into a single all-powerful workflow.

## Architectural strategies

### Strategy 1: Extract reusable local actions and workflows

Capture the two reusable responsibilities separately: patch creation in an
untrusted context (a local composite action), and patch publication in a trusted
context (a local reusable workflow, which resolves from the default branch and
therefore cannot be tampered with by PR contents). Workflows remain responsible
for triggers, permissions, and policy.

This is the preferred direction because it preserves the current security model
while reducing duplication.

### Strategy 2: Keep workflow policy thin and explicit

Each caller should decide what command is allowed, where the patch is applied,
and whether the result is pushed to a PR branch or opened as a maintenance PR.
The shared actions should provide mechanics, not hidden policy.

### Strategy 3: Roll out in phases

Start by refactoring `/fix` with no intended behavior change. Then add a
scheduled **housekeeping** caller — run the approved fix scripts (e.g.
`test-and-fix` or `test:all`) on a schedule and publish the results as a new PR
— once the shared patch path has proven stable. This is the second caller that
proves the actions are reusable: it has no PR context, so it exercises the patch
mechanics decoupled from the `issue_comment` trigger.

## Open decisions

- Whether an i18n caller (e.g. `fix:i18n` by PR comment, schedule, or both) is
  wanted as a third caller.

## Resolved decisions

- The first implementation PR includes only the `/fix` refactor (phase 1); the
  scheduled housekeeping caller comes later.
- The trusted publication path is a reusable workflow rather than a composite
  action, so that no PR-controlled code can run with write credentials.
- Outcome reporting is an always-run trusted `report` job: the requestor is
  notified of every directive outcome, improving on the original workflow's
  silent failure modes. A trusted `ack` job posts an immediate in-progress
  comment that `report` then updates in place. The ack deliberately says "your
  request" (with a link to the directive comment) rather than naming the
  command, so the trusted ack job never parses the directive.
- Push policy lives inside the trusted reusable workflow (the cost of the
  security fix above). Phase 2 (housekeeping fixes published as a new PR) should
  be a _sibling_ trusted workflow (patch → branch → `gh pr create`) rather than
  evolving this one into a multi-mode publisher.
- Phase 2 is a scheduled housekeeping workflow rather than an i18n caller: it is
  what the founding issue ([#6592][]) asked for, and its lack of PR context best
  demonstrates that the patch actions are trigger-agnostic.
- Housekeeping publication follows the `refcache-refresh.yml` precedent: one PR
  for all fixes, on the stable `otelbot/housekeeping` branch recreated from
  `main` each run (force-push). At most one open housekeeping PR exists at a
  time; new runs update it in place until it is merged, and a no-change run
  skips publication, leaving any open PR as is. Per-script PRs can be adopted
  later if single-PR review proves painful.
  - Recreate-from-main rather than the spec/semconv integration-branch pattern
    (work from the PR branch, merge main, rerun): housekeeping results are fully
    derived from `main` — yesterday's results are superseded, not extended — and
    the patch is generated against `main`, so reapplying it to a stale branch
    risks conflicts for no benefit.
  - Caveat: any commits pushed to the housekeeping PR branch — manual or via
    `/fix`, which pushes to the same branch — are clobbered by the next run's
    force-push. Merge the PR promptly if it is amended; the PR body carries an
    IMPORTANT note to that effect. (If this bites in practice, add a guard that
    skips the force-push when the branch has non-bot commits.)

## Status details

As of 2026-06-10 (continued work tracked in [#10320][]):

- Phase 1 merged ([#10309][], plus app-token scope fix [#10318][]):
  `npm-script-patch` action (untrusted), `reusable-apply-patch.yml` workflow
  (trusted), always-run outcome reporting, unit-tested directive parsing and
  report composition, and a guard test for workflow-to-file references.
- Live validation on [#10317][] and [#10319][]:
  - [x] `/fix:<name>` with changes pending → ✅ comment + pushed commit
  - [x] `/fixx` (invalid directive) → ❌ comment with usage hint
  - [x] `/fix:<name>` with no changes pending → ℹ️ no-op comment
  - [x] two `/fix` directives in rapid succession → two independent runs; the
        second failed loudly (stale duplicate patch). Since then, semantics
        changed to latest-wins: a new directive cancels the PR's in-flight run,
        which still reports a ⚠️ outcome.
  - [x] `/fix` followed by explanatory lines → treated as `/fix` (first-line
        parsing; also has unit coverage in `pr-fix`)
  - [x] directive on a closed PR → ❌ "only apply to open PRs" comment, no fix
        work run
  - [x] failing command → ❌ "could not be run, or its changes could not be
        captured" comment
  - [x] same flow from a fork PR: all of the above were exercised from fork PRs
        targeting the canonical repo (`issue_comment` runs in the base
        repository, where the bot credentials exist)
  - [x] PR opened within a fork → pipeline skips (repository-owner gate);
        previously the trusted jobs failed at the app-token mint for lack of the
        bot app variables and secrets
- Follow-up: trim the `GITHUB_TOKEN` grants forwarded to the reusable workflow
  once live runs confirm the minimum required.
- Follow-up: the trusted `ack` and `report` jobs share ~40 lines of setup
  boilerplate (harden-runner, checkout, setup-node, app token); factor out a
  composite action if a third trusted comment job appears.
- Follow-up (security pass): decide who may trigger `/fix` — currently anyone
  who can comment; tracked as [#10329][] since it is a policy decision.
- Follow-up (security pass): consider `egress-policy: block` + allowlist for the
  trusted jobs' harden-runner steps (their egress set is small and known); keep
  `audit` on the untrusted job, which needs broad egress for npm install.
- Follow-up (security pass): a patch may touch `.github/workflows/**`; the push
  then succeeds only if the bot app holds the Workflows permission. If not, the
  push fails closed and reports ❌ — the desired default. Verify the app
  permission once and record the intended behavior.
- Follow-up (consolidation roadmap): reduce duplication across the patch-family
  workflows.
  - `reusable-apply-patch.yml` and `reusable-patch-pr.yml` share ~30 lines of
    download/apply/commit plumbing. Constraint on sharing: a local composite
    action or `scripts/` file resolves from the checked-out workspace, and
    `reusable-apply-patch.yml` checks out the PR branch — the same footgun
    documented on `generate-patch`. Share only via steps that run before the
    PR-branch checkout, by copying the shared script to a temp path first, or
    keep the trusted steps inline (current choice).
  - Candidate migrations onto the generate→publish patch actions, retiring
    bespoke branch-management code: `refcache-refresh.yml`, and possibly the
    spec/semconv integration-branch workflows.
- Directive↔outcome improvements (all shipped):
  - A trusted `ack` job posts a 🔄 in-progress comment (linking the directive
    comment and the run) as soon as a directive is received; the report job then
    edits that same comment with the final outcome (1:1 comment per directive,
    no mutation of user content). Outcome messages link back to the directive
    comment. Alternative considered: editing the originating comment's first
    line — rejected as invasive (alters user content).
  - Every outcome message ends with the run link in a uniform format: "See
    [run ID](url)."
  - Latest directive wins: per-PR workflow-level concurrency with
    cancel-in-progress, so concurrent runs don't waste resources. Non-`/fix`
    comments get a unique group so they can't cancel a `/fix` run. Edge cases:
    if a run is cancelled after its ack posted but before the outcome update,
    its 🔄 comment is updated to ⚠️ by its own always-run report job; if it is
    cancelled before the ack posts its comment id, the outcome lands in a new
    comment and a stale 🔄 comment may remain.
  - Directives on closed or merged PRs are gated out (from the trigger payload,
    before any runner does fix work) and reported as ❌ with the reason. Draft
    PRs still work; deleted-branch sub-cases are moot since nothing is checked
    out.
  - Locked PRs need no special handling: locking restricts commenting to users
    with write access, so any directive author is privileged by construction,
    and the bot (a GitHub App with write permission) can still post and edit its
    comments on a locked conversation.
- Phase 2 (scheduled housekeeping caller) implemented: `housekeeping.yml` runs
  an approved fix command (default `test-and-fix`) daily or on dispatch, and
  publishes the results as a PR via the new `reusable-patch-pr.yml` sibling
  workflow. Live validation pending post-merge:
  - [ ] dispatch run with changes → `otelbot/housekeeping` branch + PR created
  - [ ] second run with changes while the PR is open → PR force-updated in
        place, no duplicate PR
  - [ ] run with no changes → publish skipped, open PR untouched
  - [ ] failing command with fixes → failure issue filed and fixes published

<!-- prettier-ignore-start -->
[#10309]: https://github.com/open-telemetry/opentelemetry.io/pull/10309
[#10317]: https://github.com/open-telemetry/opentelemetry.io/pull/10317
[#10318]: https://github.com/open-telemetry/opentelemetry.io/pull/10318
[#10319]: https://github.com/open-telemetry/opentelemetry.io/pull/10319
[#10320]: https://github.com/open-telemetry/opentelemetry.io/issues/10320
[#10329]: https://github.com/open-telemetry/opentelemetry.io/issues/10329
[#6592]: https://github.com/open-telemetry/opentelemetry.io/issues/6592
<!-- prettier-ignore-end -->
