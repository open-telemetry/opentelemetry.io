---
title: Testing
description: Checking and testing strategies, processes, and test pages.
---

This section contains checking and testing strategies, processes, and test pages
used by website tests and deployed live checks.

> This section is under construction.

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
