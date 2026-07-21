# Locale auto-merge helper

Logic + CLI behind the **Locale auto-merge** workflow
([`.github/workflows/locale-auto-merge.yml`](../../../.github/workflows/locale-auto-merge.yml)).

A locale team member comments `/auto-merge` (or `/auto-merge:enable` /
`/auto-merge:disable`) on a locale-only PR. The directive must be on its own
line, with no leading text or whitespace, as the first or last non-blank line of
the comment (so, e.g., `LGTM` followed by `/auto-merge` works). It may appear at
most once. Mis-indented, buried, or duplicated directives get an explanatory
reply; blockquoted directives (`> /auto-merge`) are treated as citations and
ignored silently. The workflow runs this helper as the **DOCS bot** (which has
the permissions needed to enable auto-merge) to enable GitHub-native auto-merge.
The bot only flips the "merge when ready" switch — **branch protection and
CODEOWNERS remain the hard gate**, so the PR still won't merge until every
required code owner has approved and all checks pass.

The helper adds two guards of its own:

1. **Eligibility** — every changed file must be locale-owned (`content/<loc>/`,
   `.cspell/<loc>-*.txt`, `prh/<loc>.yml`) or one of the no-owner paths declared
   in `.github/CODEOWNERS` (e.g. `.lycheecache`). A PR may touch more than one
   locale.
2. **Authorization** — the commenter must be a member of
   `@open-telemetry/docs-<loc>-maintainers` for **every** locale the PR touches.

## Files

- `index.mjs` — pure logic + the `runAutoMergeCommand` orchestrator (all `gh`
  access is injected, so it is unit-testable).
- `cli.mjs` — wires the real `gh`; run with `--help` for usage.
- `*.test.mjs` — run with `npm run test:local-tools`.

## Testing it on a PR as a given user

Dry run is the default locally. Use `--user` to evaluate the verdict **as if** a
given user had commented (handy for confirming the locale-team gate):

```sh
# Eligible + user is on the locale team -> would enable
npm run locale-auto-merge -- --pr 10094 --user some-login

# See every option
npm run locale-auto-merge -- --help
```

(Everything after `--` is passed straight to `cli.mjs`; you can also invoke
`node scripts/gh/locale-auto-merge/cli.mjs …` directly.)

Add `--no-dry-run` to actually enable/disable auto-merge (needs a sufficiently
privileged token; the workflow uses the DOCS bot token).

Add `--verbose` (`-v`) to log each changed file as it is classified
(locale-owned / shared / not-owned) and each locale-team membership check
(pass/fail). The workflow runs with `--verbose` so its log records exactly why
the bot did or didn't act.

## Outcomes

Every run resolves to exactly one outcome (logged as `[<outcome>] …`). All
outcomes post a PR comment except a `no-command` result on a comment that wasn't
an auto-merge attempt at all (a malformed `/auto-merge …` variant still gets a
short "unrecognized command" reply). Expected outcomes — including user errors
like `unauthorized`, `ineligible`, `too-many-files`, and `not-open` — exit `0`,
since they're reported via the PR comment rather than as a failed run. Only an
infrastructure failure (`mutation-failed`, or a failed `gh` read) exits `1`.

| Outcome           | Exit | Meaning                                                                                                                 |
| ----------------- | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| `apply`           | 0    | Auto-merge was enabled or disabled.                                                                                     |
| `noop`            | 0    | Already in the requested state; nothing to do.                                                                          |
| `no-command`      | 0    | The comment was not a recognized `/auto-merge` command (a malformed, mis-placed, or duplicated directive gets a reply). |
| `not-open`        | 0    | The PR is not open, so auto-merge can't be changed.                                                                     |
| `too-many-files`  | 0    | The PR changes more files than `gh` can return, so eligibility can't be verified (fails closed).                        |
| `ineligible`      | 0    | A changed file is outside the locale-owned set.                                                                         |
| `unauthorized`    | 0    | The commenter isn't on the maintainer team for every touched locale.                                                    |
| `mutation-failed` | 1    | The `gh pr merge` call itself failed.                                                                                   |
