---
title: Testing
description: Checking and testing strategies, processes, and test pages.
---

This section contains checking and testing strategies, processes, and test pages
used by website tests and deployed live checks.

> This section is under construction.

## Test categories

Test scripts in [`package.json`](../build/npm-scripts/) are grouped by naming
conventions that also drive their auto-discovery:

- **`test:base`** runs the core checks (equivalent to `check`). In CI these are
  covered by the dedicated check workflows rather than a single job.
- **Compound `test:<word>-<word>`** scripts are auto-discovered and run together
  by `test:compound-tests` (and therefore `test:all`). Giving a script a
  compound name is how you opt it into that group, even when it is otherwise a
  single check (for example `test:local-tools`).
- **`test:public`** runs the checks under `tests/public/` (any `*.test.mjs`
  there). They read the _built_ `public/` site, so they need a prior
  `npm run build` and skip when `public/` is absent. Add a check by dropping a
  `*.test.mjs` into that folder; follow the convention of skipping when
  `public/` is missing. These are deliberately kept out of `test:compound-tests`
  (which does not build) and instead run in CI in a job that reuses an existing
  build artifact.
- **`test:*:live`** scripts are optional checks against a deployed, live site.

## Test assertions

### Goal

When a test fails, the output should make it obvious what was being checked and
show a clear diff between actual and expected values, without long hand-written
messages.

For example, avoid:

```js
assert.ok(a === b, `expected ${a} to be ${b}`);
```

Instead favor:

```js
assert.strictEqual(status, expectedStatus, 'HTTP status');
```

### Guidance

The points below use Node's built-in `node:test` runner and `assert` API because
that is what several of our test suites use. The same ideas apply in other test
frameworks: prefer assertions that produce tight diffs, keep failure context
short and specific, and extract shared helpers when the same check repeats.

1. Prefer `assert.strictEqual` over `assert.equal` for primitive checks where
   strictness and diff quality matter.
2. Add a short third argument as context, for example `HTTP status`,
   `Content-Type`, `Location`, `Request body`.
3. Use `assert.match` when a regular expression can capture the intent more
   clearly than `includes` or chained `ok` logic.
4. Put shared assertion helpers in a module imported by the test suites that use
   them, colocated with those tests instead of copy-pasted across files. Other
   small, test-only utilities can live in the same module when it stays focused
   (for example `assertVaryIncludesAccept` in
   `netlify/edge-functions/lib/test-helpers.ts`).
