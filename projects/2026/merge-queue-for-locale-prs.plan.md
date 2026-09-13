---
title: Helping site and locale maintainers merge single-locale PRs
custodian: [Patrice Chalin](https://github.com/chalin)
status: See "Status details" section below.
---

> **Plan conventions.** This plan is kept intentionally lean and free of design
> and implementation details, except in forward-looking appendices. For status,
> see [Status details](#status-details).

## Context

This work is in support of [Website Localizations: Steps forward to make teams
more independent of docs-maintainers #9219][#9219].

## Purpose and goal

Help site and locale maintainers land _eligible_ single-locale PRs (as defined
below) quickly and safely, while preserving repository safety and review
standards — as a stepping stone toward making mature locale teams more
independent of `docs-maintainers` ([#9219][]).

## Approach

The work is incremental:

- **Phase 1 — Support site maintainers (current).** Maintainers already have
  authority over the entire site, including all locale files. Give them a CLI
  helper and a documented procedure (a skill) to work through a SIG-approved
  single-locale PR backlog efficiently and safely. No permission or ownership
  changes are required.
- **Phase 2 — Toward locale-maintainer independence (exploratory).** Reduce
  locale teams' reliance on `docs-maintainers` for routine locale PRs. This
  hinges on a privilege-model decision and possible CODEOWNERS / workflow
  changes; see [Appendix A](#appendix-a). Held pending maintainer input.

## Scope and eligibility

- Eligible PRs must change exactly one locale and only locale-owned paths:
  - `content/${LANG}/**`
  - `.cspell/${LANG}-*.txt`
  - `prh/${LANG}.yml`
- Do not duplicate ownership, approval, or merge-readiness checks already
  enforced by GitHub, branch protection, or existing actions.

## Status details

As of 2026-06-08:

- **Helper CLI: implemented and tested.** `scripts/gh/pr-auto-merge-locale/`
  (pure logic + orchestrator + thin CLI) is complete with unit, integration, and
  functional tests (`npm run test:local-tools`, green in both `GITHUB_ACTIONS`
  states). Dry-run-by-default locally; `--enable` is the default command;
  `pr-auto-merge` npm script wired.
- **Helper hardened for interim maintainer use.** Beyond the same-locale scope
  gate, the helper verifies the commenter's write/admin permission and enables
  GitHub-native auto-merge; it deliberately does **not** re-derive locale-owner
  approval, leaving required reviews and checks to the merge queue (rather than
  duplicating a guard GitHub already owns). On a real enable it posts a
  head-SHA-anchored **statement of proof** to the PR — the validation breakdown
  it _can_ vouch for (single-locale scope and the changed files, authorization)
  plus the merge-queue context it reports (branch state, status checks). There
  is no separate verbose mode.
- **Backlog-drain skill: added.** The maintainer procedure for working through a
  SIG-approved single-locale backlog is documented at
  `content/en/site/skills/auto-merge-locale-backlog.md` (dry-run preview →
  enable auto-merge → locale-only approval; the merge queue test-merges with
  `main`, regenerates the link-checker config, runs the checks, and merges).
- **Phase 2 not built.** The workflow YAML
  (`.github/workflows/pr-auto-merge-locale.yml`) and the CI-workflow docs update
  are not yet built; see [Appendix B](#appendix-b).
- **Phase 2 paused pending a maintainer decision.** Investigation (see
  [Appendix A](#appendix-a)) found that the bot is only one of two clean shapes,
  and the choice between them depends on a privilege-model decision that needs
  SIG Comms / docs-maintainers input and hands-on testing with locale approvers.
  **Holding further build work until that decision is made.**

## Appendix A — Phase 2: permission-model strategy {#appendix-a}

> Forward-looking: the open decision for Phase 2. Kept in an appendix to keep
> the body lean.

Investigation of the live repo configuration (2026-06-06) reframed the problem
from [#9219][]. Findings:

- **Write role alone does not permit merging to `main` (verified 2026-06-08).**
  A `docs-ja-approvers` member (whose team has **Role: write**, as does
  `docs-ja-maintainers`) could not land a single-locale PR with all required
  reviews in and checks green: GitHub reported _"You're not authorized to push
  to this branch."_ The enforcement is the **`main` repository ruleset**
  (classic branch protection has **empty** push restrictions, so it is not the
  gate). The ruleset's **bypass list contains exactly one actor: the `Maintain`
  role** ("Allow for pull requests only"; `Admin` inherits). So landing a merge
  to `main` effectively requires **Maintain or Admin** — `write` clears neither
  the bypass nor the code-owner requirement below. This is the key reframe:
  **even with `write` (which locale teams already have), they cannot self-merge;
  the Phase 1 helper provides real merge capability, not just convenience.**
- **Team→repo grants.** `docs-maintainers` = admin (can bypass);
  `docs-approvers` and the mature
  `docs-${LANG}-approvers`/`docs-${LANG}-maintainers` teams = `write` (cannot
  bypass); language-SIG approver teams (go, python, …) = triage.
- **Two interlocking blockers, both clearing only at Maintain/Admin:**
  1. **Bypass.** Only the `Maintain` role (and `Admin`) is in the ruleset bypass
     list, so only those roles can push/merge to `main`.
  2. **Code-owner review.** The ruleset's `pull_request` rule sets
     `required_approving_review_count: 1` and
     **`require_code_owner_review: true`**, and `.github/CODEOWNERS` is only
     `* @open-telemetry/docs-approvers` — so _every_ file needs a
     `docs-approvers` approval, which a `docs-ja-approvers` review does not
     satisfy.
- **A CODEOWNERS entry only takes effect if the listed team has `write`.** A
  triage-only team named in CODEOWNERS is ignored and the file falls back to the
  global `* @docs-approvers` owner. This couples the privilege model to whether
  CODEOWNERS delegation can work natively.

Adjusting ownership (CODEOWNERS) changes _who must review_, but the 2026-06-08
finding shows that is not sufficient on its own: locale teams have `write` yet
still cannot push/merge to `main` because the ruleset bypass is limited to
`Maintain`/`Admin`. So native delegation must be paired with a role/bypass
change for locale teams (or it collapses into needing the bot). The strategy
splits into two clean, DRY shapes that keep ownership and auto-merge concerns
separate. Both delegate locale paths in CODEOWNERS; they differ only on the
privilege model, which in turn decides whether the bot is essential.

### Scope drift after auto-merge is enabled (time-of-check/time-of-use) {#scope-drift}

> Why the code-ownership question matters for safety, not just for delegation.

The helper validates single-locale scope **at enable time only** (pre-push); the
merge queue is the gate, but auto-merge persists. So a PR that was locale-only
when auto-merge was enabled could gain an **out-of-scope (non-locale) commit
afterward** and still ride the standing approval into the queue. The live `main`
ruleset (id `10784223`) makes this concrete (2026-06-08):

- **`dismiss_stale_reviews_on_push: false`** — the root enabler. A later push
  does **not** dismiss the existing approval, so newly-added code rides in on
  it.
- `require_code_owner_review: true`, `required_approving_review_count: 1`,
  `require_last_push_approval: false`. CODEOWNERS is only `* @docs-approvers`.

**CODEOWNERS delegation is the durable, GitHub-native fix — but only in the
delegated model.** Once locale subtrees are code-owned by the locale team
(Option A below), the fix closes the hole **iff the approving review is from a
locale approver who is _not_ also a `docs-approvers` member**: a later
non-locale file is matched by the global `* @docs-approvers` rule, which then
becomes a **newly-required** code owner the standing locale approval does not
satisfy, so the merge blocks until a docs-approver reviews. If, instead, the
approver _is_ a `docs-approvers` member (the Phase 1 case — a site maintainer
approving), that same approval already satisfies `*`, so a later non-locale file
pulls in no new required owner and the hole **remains**. The Phase 1 residual is
bounded (the actor is a trusted maintainer pushing to a PR they themselves
enabled), but it is not fully closed by code ownership alone.

Mitigations that _would_ close it for all cases, including Phase 1, are blunter
and out of scope for now (listed as alternatives, not commitments):

- **Repo-wide ruleset knobs:** `require_last_push_approval: true` (a fresh,
  non-pusher approval after any push) or `dismiss_stale_reviews_on_push: true`.
  Both close the gap but add review friction to **every** PR on `main`.
- **A bespoke `synchronize` re-validation** that re-runs the eligibility check
  when a `lang:*` PR with auto-merge enabled is pushed, and disables auto-merge
  on scope drift. Precise, but adds custom workflow machinery (less DRY).

**Bottom line:** "fix the code ownership" is inseparable from the Phase 2
delegation decision — it is governance-consequential (it removes
`docs-approvers` as a _required_ reviewer on locale-only PRs) and so needs
maintainer buy-in. It durably closes the scope-drift hole for delegated locale
approvers and bounds it for Phase 1.

### Option A — Native delegation (no bot)

- Keep locale teams at `write` **and grant them ruleset bypass** (add the team
  to the `main` ruleset bypass list, or give them the `Maintain` role) — `write`
  alone cannot push/merge to `main` today (see findings above).
- Delegate locale subtrees in `.github/CODEOWNERS`, e.g.:

  ```text
  /content/ja/        @open-telemetry/docs-ja-approvers
  /.cspell/ja-*.txt   @open-telemetry/docs-ja-approvers
  /prh/ja.yml         @open-telemetry/docs-ja-approvers
  # …one block per mature locale
  ```

- Mirror in `.github/component-owners.yml` (drop `docs-maintainers` from those
  locale entries) so the existing otelbot stops requesting maintainers and
  labels accordingly.
- **Result:** pure-locale PRs need only a locale code-owner approval; any file
  outside the delegated paths still auto-requires `docs-approvers`. **Zero
  custom merge code.** This also closes the [scope-drift gap](#scope-drift) a
  bot cannot — a later push touching non-locale files re-requires
  `docs-approvers` automatically — provided the locale approval came from a
  non-`docs-approvers` member (see that subsection for the caveat).
- **Caveat (per 2026-06-08):** code-owner delegation alone is _not_ enough —
  locale teams have `write` yet still can't merge to `main`, because the ruleset
  bypass is limited to `Maintain`/`Admin`. Option A therefore also requires
  granting those teams ruleset bypass (Maintain role); without that, it
  collapses into needing the bot.

### Option B — Bot with least privilege (the helper built here)

- Downgrade mature locale teams to `triage`.
- The auto-merge helper (already implemented) enables auto-merge only on
  eligible pure-locale PRs, merging via the app token.
- **Result:** locale teams never hold repo-wide `write`; merge scope is enforced
  by code, not GitHub permissions. Matches the issue's "all-or-nothing
  permission" concern and the "bot is cleanest" framing from SIG Comms. Note: in
  this model a CODEOWNERS delegation to a triage team would be inert, so the bot
  is the _only_ mechanism.
- **The bot must itself be a bypass actor (verified 2026-06-08).** The same two
  blockers that stop a `write`-role human (see "Two interlocking blockers"
  above) stop a bot: enabling auto-merge needs only `write`, but the **queued
  merge landing on `main` requires ruleset bypass**, and the `main` ruleset's
  bypass list currently contains **only the `Maintain` role — no App or bot**.
  `otelbot` is a GitHub App that isn't even a collaborator; `opentelemetrybot`
  has only `read`. So a non-bypass bot would enable auto-merge but its merge
  would fail at the front of the queue, exactly as the `write`-role `docs-ja`
  approver did. To make this route work, **otelbot's App must be added to the
  ruleset bypass list** (bypass actors can be `Integration`-type, but none is
  configured today) — i.e. the privilege does not disappear, it **relocates to
  the bot**. That is arguably preferable (one auditable automation vs. many
  humans with repo-wide write), but it is _not_ "no elevated privilege." The
  exact auto-merge + merge-queue + bypass interaction for a non-bypass App is
  under-documented; the definitive check is an empirical test (grant otelbot
  write + bypass, enable auto-merge on a throwaway locale PR, confirm the queued
  merge lands).

### Shared caveats

- **`lychee.toml` is CI-generated, not committed.** Since [#10260][] the
  link-checker config is gitignored and generated in CI (now from
  `lychee.base.toml` + content front matter, on both `pull_request` and
  `merge_group` runs), so it no longer appears in a PR's changed files; the
  helper treats any stray committed copy as a non-locale-owned path (declines
  auto-merge). This also removed the maintainer's old branch-update/regenerate
  steps — the merge queue test-merges with `main` and regenerates the config.
- **Merge-queue assumption — verified (2026-06-06).** A merge queue _is_ active
  on `main`: a bare `gh pr merge --auto` (no strategy) on an eligible PR returns
  "will be added to the merge queue for main when ready". The helper's
  strategy-less `--auto` call is therefore correct as-is; no `--squash` is
  needed.
- **Backlog-drain skill depends on this permission model.** The maintainer skill
  (`content/en/site/skills/auto-merge-locale-backlog.md`) relies on its
  discovery query's label-and-review filter (the bot's `missing:docs-approval` /
  `ready-to-be-merged` labels, minus `changes_requested`) as the signal that an
  independent review already happened — because locale teams are not required
  reviewers today, so nothing in GitHub forces a locale review before merge. The
  helper itself only confirms single-locale scope and enables auto-merge; it
  does not re-derive approval. If locale paths are delegated in `CODEOWNERS`
  (Option A, or Option B's variant), a locale approval becomes a
  GitHub-**required** review for single-locale PRs; at that point the skill's
  label filter could lean on that required review instead.

### Next decision

Discuss with docs-maintainers / SIG Comms and test with locale approvers: choose
the privilege model — (A) keep `write` + native CODEOWNERS delegation **plus
grant locale teams the `Maintain` role / ruleset bypass** (write alone can't
merge `main`), vs. (B) downgrade to `triage` + bot. That choice unblocks the
remaining build work (workflow YAML and docs) or pivots it to a
CODEOWNERS/`component-owners.yml` change instead.

## Appendix B — Tentative design details {#appendix-b}

> Retained from an earlier, more detailed iteration of this plan. These sections
> describe possible design directions — notably a comment-triggered GitHub
> Actions workflow — and are **not** the current plan of record. Kept for
> reference.

### Workflow outline

1. Ignore non-PR comments and unsupported commands.
2. Fetch PR metadata and changed files via `gh pr view` (never check out PR
   head).
3. Validate same-locale scope.
4. Enable or disable auto-merge.
5. Comment on the PR with the result.

### Design decisions

1. Create a **new workflow** (`pr-auto-merge-locale.yml`) instead of extending
   `pr-actions.yml` to keep trust boundaries and command ownership separate.

2. Use strict PR-comment commands for explicit maintainer intent and a simple
   maintainer experience.

3. Keep this workflow DRY by relying on existing GitHub and repository gates for
   approvals, status checks, and merge readiness.

4. Enforce only the same-locale scope gate before mutating auto-merge state.

5. Use GitHub-native auto-merge behavior with an app token and minimal workflow
   permissions. Pass no merge strategy (`gh pr merge --auto`); the branch's
   required merge queue decides how the PR lands.

6. Default to a **dry run** outside GitHub Actions and to a real run under it
   (`GITHUB_ACTIONS=true`), mirroring the sibling `scripts/gh/specs/pick-branch`
   helper. Explicit `--dry-run` (`-n`) / `--no-dry-run` (`-f`) always override.
   This makes local maintainer testing safe by default while the workflow needs
   no extra flag.

### Authorization

Enabling auto-merge through the app token bypasses GitHub's native write-access
gate (though required reviews and checks still gate the actual merge). Verify
the commenter has write (or admin) permission before acting, and no-op
otherwise.

### Failure handling

- PR is not open: fail with a brief comment naming the state.
- PR changed files outside one locale: fail with a concise explanation.
- Commenter lacks the required permission: no-op with a brief comment.
- `/auto-merge:enable` when auto-merge is already enabled, or
  `/auto-merge:disable` when it is not: no-op with a brief comment.
- Auto-merge mutation denied: fail with likely permission or branch-protection
  cause.

### Permissions

Use the existing docs GitHub App credentials where possible. Keep workflow
permissions minimal and grant only the app permissions needed to mutate
auto-merge state.

### Deliverables

- New workflow: `.github/workflows/pr-auto-merge-locale.yml`
- Helper under `scripts/gh/pr-auto-merge-locale/` following the `scripts/gh/`
  Node convention: `index.mjs` (pure command-parsing and same-locale eligibility
  logic plus the `runAutoMergeCommand` orchestrator), `cli.mjs` (thin entry that
  wires env and `gh` side-effects), and `*.test.mjs` (unit, integration with a
  fake `gh`, and a functional `cli.test.mjs`; run via
  `npm run test:local-tools`). A `smoke-test.sh` exercises the CLI in
  `--dry-run` against real PRs.
- CI workflow documentation update: `content/en/site/build/ci-workflows.md`

### Manual smoke test

Runs are dry by default outside GitHub Actions: the CLI makes only the read-only
`gh` calls and prints the verdict plus the mutating commands it _would_ run,
without changing anything. `--repo` (`-r`) and `--author` (`-a`) default
sensibly and the command defaults to `--enable`, so a dry run needs only a PR
number:

```sh
npm run pr-auto-merge -- --pr <pr>
```

The verdict carries the validation breakdown — what was checked (single-locale
scope and the changed files, authorization) plus the informational context the
merge queue enforces (branch up-to-date state and a status-check summary) — so a
single dry run is enough to triage a backlog.

Pass `--no-dry-run` (`-f`) to mutate for real. See
`scripts/gh/pr-auto-merge-locale/smoke-test.sh` for ready-to-run examples.

### Rollout plan

1. Implement dry-run behavior for `/auto-merge:enable`.
2. Add `/auto-merge:disable` and idempotency handling.
3. Enable across all configured locales.
4. Announce in localization contributor docs and SIG Comms channels.

[#9219]: https://github.com/open-telemetry/opentelemetry.io/issues/9219
[#10260]: https://github.com/open-telemetry/opentelemetry.io/pull/10260
