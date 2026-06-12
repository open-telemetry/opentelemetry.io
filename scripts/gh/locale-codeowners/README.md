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

## Files

- `index.mjs` — pure logic (generation, marker replacement, registry
  validation).
- `cli.mjs` — file-system wiring; run with `--help` for usage.
- `index.test.mjs` — run with `npm run test:local-tools`.

[opentelemetry.io#10374]:
  https://github.com/open-telemetry/opentelemetry.io/issues/10374
