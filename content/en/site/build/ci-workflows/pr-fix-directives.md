---
title: PR fix directives
linkTitle: PR fix directives
description: >-
  Workflow that lets contributors run fix scripts by commenting on a PR, using a
  two-stage patch pipeline for safe execution.
weight: 30
---

The [`pr-actions.yml`][pr-actions] workflow lets contributors run selected `fix`
scripts by commenting on a PR:

- **`/fix`** runs `npm run fix`.
- **`/fix:<name>`** runs `npm run fix:<name>` (for example, `/fix:format`).
- **`/fix:all`** is mapped to `/fix` since the command semantics changed
  ([#9291][]).
- **`/fix:ALL`** is mapped to `fix:all` so that maintainers can run `fix:all`.

[#9291]: https://github.com/open-telemetry/opentelemetry.io/pull/9291

It runs as a two-stage pipeline:

1. **`generate-patch`** (untrusted): checks out the PR branch, runs the fix
   command, prunes the link refcache, and uploads a patch artifact
   (`pr-fix.patch`), up to 1024 KB.
2. **`apply-patch`** (trusted): runs with a GitHub App token, applies the patch,
   and pushes a commit to the PR branch.

If a directive produces no changes, a separate `notify-noop` job comments that
nothing needed to be committed.

[pr-actions]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/pr-actions.yml
