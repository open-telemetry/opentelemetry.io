---
title: Reusable patch actions for PR and maintenance fixes
custodian: '[Patrice Chalin](https://github.com/chalin)'
status: Phase 1 merged and partially live-validated; phases 2–3 pending.
cSpell:ignore: fixx otelbot test-and-fix
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
- A foundation that can support `/fix`, i18n fixes, and scheduled maintenance
  fixes without duplicating workflow logic.
- Clear separation between reusable mechanics and caller-specific policy.

## Goals

- Preserve the current `/fix` behavior and security posture.
- Make the untrusted/trusted split explicit and reusable.
- Keep future maintenance workflows thin and easier to review.
- Support incremental rollout: first refactor existing behavior, then add i18n
  or scheduled maintenance callers.

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

Start by refactoring `/fix` with no intended behavior change. Then add the next
caller, likely i18n fixes. After that, add scheduled maintenance PR creation
once the shared patch path has proven stable.

## Open decisions

- Whether scheduled maintenance should use one stable branch per fix family or a
  shared generated-fixes branch.
- Whether `fix:i18n` should be available by PR comment, schedule, or both.

## Resolved decisions

- The first implementation PR includes only the `/fix` refactor (phase 1); the
  i18n caller comes later.
- The trusted publication path is a reusable workflow rather than a composite
  action, so that no PR-controlled code can run with write credentials.
- Outcome reporting is a third, always-run trusted job: the requestor is
  notified of every directive outcome, improving on the original workflow's
  silent failure modes.
- Push policy lives inside the trusted reusable workflow (the cost of the
  security fix above). Phase 3 (maintenance fixes published as a new PR) should
  be a _sibling_ trusted workflow (patch → branch → `gh pr create`) rather than
  evolving this one into a multi-mode publisher.

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
  - [ ] `/fix` followed by explanatory lines → treated as `/fix`
  - [ ] failing command → ❌/⚠️ comment
  - [ ] same flow from a fork PR
- Follow-up: trim the `GITHUB_TOKEN` grants forwarded to the reusable workflow
  once live runs confirm the minimum required.
- Feature candidates (improve directive↔outcome association when a PR has
  several directives):
  - [x] Immediate acknowledgement: a trusted `ack` job posts a 🔄 in-progress
        comment (linking the directive comment and the run) as soon as a
        directive is received; the report job then edits that same comment with
        the final outcome (1:1 comment per directive, no mutation of user
        content). Outcome messages link back to the directive comment.
        Alternative considered: editing the originating comment's first line —
        rejected as invasive (alters user content).
  - [x] Include the run link in every outcome, in a uniform format: each outcome
        message ends with "See the logs of [run ID](url)."
  - [x] Latest directive wins: per-PR workflow-level concurrency with
        cancel-in-progress, so concurrent runs don't waste resources. Non-`/fix`
        comments get a unique group so they can't cancel a `/fix` run.
  - [x] Directives on closed or merged PRs are gated out (from the trigger
        payload, before any runner does fix work) and reported as ❌ with the
        reason. Draft PRs still work; deleted-branch sub-cases are moot since
        nothing is checked out.
  - [x] Locked PRs need no special handling: locking restricts commenting to
        users with write access, so any directive author is privileged by
        construction, and the bot (a GitHub App with write permission) can still
        post and edit its comments on a locked conversation.
- Phases 2 (i18n caller) and 3 (scheduled maintenance) not started.

<!-- prettier-ignore-start -->
[#10309]: https://github.com/open-telemetry/opentelemetry.io/pull/10309
[#10317]: https://github.com/open-telemetry/opentelemetry.io/pull/10317
[#10318]: https://github.com/open-telemetry/opentelemetry.io/pull/10318
[#10319]: https://github.com/open-telemetry/opentelemetry.io/pull/10319
[#10320]: https://github.com/open-telemetry/opentelemetry.io/issues/10320
<!-- prettier-ignore-end -->
