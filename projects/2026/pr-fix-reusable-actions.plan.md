---
title: Reusable patch actions for PR and maintenance fixes
custodian: [Patrice Chalin](https://github.com/chalin)
status: Phase 1 implemented; phases 2–3 pending.
cSpell:ignore: otelbot test-and-fix
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

As of 2026-06-09:

- Branch: `chalin-m24-pr-actions-refactor-2026-0609`.
- Phase 1 implemented: `npm-script-patch` action (untrusted),
  `reusable-apply-patch.yml` workflow (trusted), always-run outcome reporting,
  unit-tested directive parsing and report composition, and a guard test for
  workflow-to-file references.
- Phases 2 (i18n caller) and 3 (scheduled maintenance) not started.
