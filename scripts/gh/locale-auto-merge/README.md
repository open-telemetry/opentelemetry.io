# Locale auto-merge helper

Logic + CLI behind the **Locale auto-merge** workflow
([`.github/workflows/locale-auto-merge.yml`](../../../.github/workflows/locale-auto-merge.yml)).

A locale team member comments `/auto-merge` (or `/auto-merge:enable` /
`/auto-merge:disable`) on a locale-only PR. The workflow runs this helper as the
**DOCS bot** (which has the permissions needed to enable auto-merge) to enable
GitHub-native auto-merge. The bot only flips the "merge when ready" switch —
**branch protection and CODEOWNERS remain the hard gate**, so the PR still won't
merge until every required code owner has approved and all checks pass.

The helper adds two guards of its own:

1. **Eligibility** — every changed file must be locale-owned (`content/<loc>/`,
   `.cspell/<loc>-*.txt`, `prh/<loc>.yml`) or a recognized no-owner file
   (`static/refcache.json`). A PR may touch more than one locale.
2. **Authorization** — the commenter must be a member of
   `@open-telemetry/docs-<loc>-approvers` for **every** locale the PR touches.

## Files

- `index.mjs` — pure logic + the `runAutoMergeCommand` orchestrator (all `gh`
  access is injected, so it is unit-testable).
- `cli.mjs` — wires the real `gh`; run with `--help` for usage.
- `*.test.mjs` — picked up by `npm run test:local-tools`.
- `smoke-test.sh` — read-only dry runs against real PRs.

## Testing it on a PR as a given user

Dry run is the default locally. Use `--user` to evaluate the verdict **as if** a
given user had commented (handy for confirming the locale-team gate):

```sh
# Eligible + user is on the locale team -> would enable
node scripts/gh/locale-auto-merge/cli.mjs --pr 10094 --user some-login

# See every option
node scripts/gh/locale-auto-merge/cli.mjs --help
```

Add `--no-dry-run` to actually enable/disable auto-merge (needs a sufficiently
privileged token; the workflow uses the DOCS bot token).
