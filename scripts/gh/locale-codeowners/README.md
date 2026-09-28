# Locale CODEOWNERS generator

Generates the locale section of
[`.github/CODEOWNERS`](../../../.github/CODEOWNERS) from the
[`data/locale-teams.yaml`](../../../data/locale-teams.yaml) registry, in support
of [opentelemetry.io#10374][]: locale teams gate their own locale's PRs, and
unstaffed locales (no maintainers) fall back to
`@open-telemetry/docs-approvers`.

CODEOWNERS remains the artifact GitHub reads; the registry is how the locale
section gets edited. CI verifies they agree (`--check`), so neither can drift
from the other.

## Usage

```sh
npm run fix:codeowners    # regenerate the locale section
npm run check:codeowners  # verify it is up to date (used by CI)
```

## Conventions encoded

- The generated section sits between `BEGIN locale-owners` / `END locale-owners`
  markers in CODEOWNERS; everything else in the file is hand-maintained.
- `/content/<loc>/` stays a plain directory rule (no glob):
  `.github/scripts/pr-approval-labels.sh` parses these rules for the
  `missing:sig-approval` label.
- `/prh/<loc>.yml` lines are emitted only for locales that have such a file.
- A locale is **unstaffed** when its `maintainers` list is empty: its lines also
  list `@open-telemetry/docs-approvers`. GitHub ignores CODEOWNERS references to
  empty teams, so unstaffed-locale PRs are honestly gated by docs-approvers.
  When the locale team is staffed (registry PR adding maintainers), regenerating
  drops the fallback — that's the "graduation" PR.
- Owner lines always reference GitHub **team** slugs, never individual
  usernames. The registry's member lists determine staffing status and serve as
  the audit record of expected team membership; they are not emitted into
  CODEOWNERS.
- Registry locale keys must match the locale directories under `content/`
  (excluding `en`); validation fails on either a missing or an extra locale.

## Live-team sync

`sync-teams.mjs` refreshes the registry's `locales:` map from the live teams;
the scheduled Housekeeping run does this daily, then `fix:codeowners`
regenerates CODEOWNERS, so drift becomes a normal reviewable PR. Merging that PR
ratifies the live state; if the drift is unwanted, an org admin reverts the live
team and the next run drops the diff.

- Reads each team's **direct** membership (GraphQL `membership: IMMEDIATE`); the
  aggregated parent roster would fold child-team members in.
- Normalizes `approvers` as the direct approver-team roster minus the direct
  maintainer-team roster, keeping the registry's roles disjoint.
- Fails without writing on a `gh` error, a missing or unreadable team, or an
  incomplete roster, rather than producing a partial registry.
- Never mutates teams. It needs organization team read access, so it is not part
  of `npm run fix` or any PR check; maintainers can run
  `npm run _fix:locale-teams` locally (needs `gh` authenticated).

## Files

- `index.mjs` — pure logic (generation, marker replacement, registry validation,
  live-roster fetch and normalization).
- `cli.mjs` — file-system wiring; run with `--help` for usage.
- `sync-teams.mjs` — live-team registry sync (no dependencies).
- `index.test.mjs` — run with `npm run test:local-tools`.

[opentelemetry.io#10374]:
  https://github.com/open-telemetry/opentelemetry.io/issues/10374
