---
name: refresh-refcache-pr-fix
description: >-
  Fetch, review, and attempt to fix non-2XX `static/refcache.json` URLs on
  otelbot PRs. By default, sweeps all open `otelbot/*` PRs and processes those
  with failing link checks; targets a specific branch or group of branches when
  so instructed. Use when a bot branch is red, refcache still lists 4XX/fragment
  errors after retries, or you want a guided pass over the refcache fix loop.
disable-model-invocation: true
---

Read and follow
[refresh-refcache-pr-fix.md](../../../content/en/site/skills/refresh-refcache-pr-fix.md).
