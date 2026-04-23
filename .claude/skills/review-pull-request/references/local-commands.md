# Local Commands {#local-commands}

**When to read:** when the author or reviewer wants to reproduce a CI check or
apply a fix locally before pushing. These commands mirror the CI checks in
[`ci-checks.md`](./ci-checks.md).

All commands are defined in `package.json`.

## Checks (read-only, mirror CI)

```sh
npm run check:all         # everything
npm run check:text
npm run check:markdown
npm run check:spelling
npm run check:format
npm run check:filenames
npm run check:expired
npm run check:links       # builds site + htmltest; also updates refcache
npm run check:i18n
npm run check:registry
```

## Fixes (mutate files)

```sh
npm run fix:all           # runs every fix:* except i18n (via `fix` alias)
npm run fix:format
npm run fix:markdown
npm run fix:text
npm run fix:dict
npm run fix:filenames
npm run fix:refcache      # prune + check:links
```

## One-shot (all fixes then all checks, excluding slow ones)

```sh
npm run test-and-fix
```

Useful when triaging a long backlog of failures.

## Notes

- `package.json:197` sets prettier `proseWrap: always`, so prose wraps at 80
  columns via `fix:format` / `check:format` — **not** via markdownlint
  (`.markdownlint.yaml` has `line-length: false`).
