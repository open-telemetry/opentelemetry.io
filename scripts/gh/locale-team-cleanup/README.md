# Locale team cleanup helper

One-time(ish) admin helper for [opentelemetry.io#10374][]: locale GitHub teams
should contain only locale members, so that a locale-team approval honestly
means a translation review. Unstaffed locales are gated by
`@open-telemetry/docs-approvers` through the CODEOWNERS fallback instead.

The helper removes interim docs-core members from every `docs-<loc>-*` team,
**keeping** docs-core members who are genuine locale reviewers (see `KEEP` in
`index.mjs`: chalin (fr); maryliag, vitorvasc (pt)).

## Usage

Dry-run is the default: it fetches live rosters and prints the removals it would
perform, without changing anything.

```sh
npm run locale-team-cleanup           # dry run
npm run locale-team-cleanup -- -f     # actually remove (org owner only!)
```

The run is **idempotent**: it plans from live rosters, so re-running after a
(partial) cleanup only removes what is left. To limit a run (e.g. for a
permissions smoke test), combine `-l <locale>`, `-u <user>`, and `--max <n>`:

```sh
# Test: can the runner remove a single membership? (child team first)
npm run locale-team-cleanup -- -f -l bn -u cartermp --max 1
```

Every `gh` call has a timeout (default 10s, `--timeout <s>`) since `gh api` can
occasionally stall indefinitely.

## Cautions

- **Run as an org owner.** Team-membership writes need org-owner privileges (or
  a maintainer role _on that very team_). Since the people being removed are the
  ones holding team-maintainer roles, a non-owner runner can remove themselves
  and then be unable to undo it (learned the hard way, 2026-06-12).
- **Child before parent.** `docs-<loc>-maintainers` is a child of
  `docs-<loc>-approvers` and GitHub rosters include child-team members, so the
  helper removes from the maintainers team first and treats a 404 (not a direct
  member) as a skip, not a failure.

## Files

- `index.mjs` — pure logic (`planRemovals`) + the `runCleanup` orchestrator (all
  `gh` access is injected, so it is unit-testable).
- `cli.mjs` — wires the real `gh`; run with `--help` for usage.
- `index.test.mjs` — run with `npm run test:local-tools`.

[opentelemetry.io#10374]:
  https://github.com/open-telemetry/opentelemetry.io/issues/10374
