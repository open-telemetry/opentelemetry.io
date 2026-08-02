---
name: review-registry-pr
description: >-
  Review PRs changing registry entries (data/registry/*.yml) or the ecosystem
  lists (data/ecosystem/*.yaml). Validate schema gaps, registryType and license
  rules, entry-vs-vendor placement, and common merge blockers. By default,
  sweeps all open registry and ecosystem PRs; reviews a single PR when given a
  number or URL.
argument-hint: '[PR number or URL (optional)]'
allowed-tools: Bash Read Grep Glob
model: sonnet
effort: medium
disable-model-invocation: true
---

# Review Registry PR

## Arguments

- **No argument** (the default): sweep all open registry and ecosystem PRs
  (those labeled `registry`, plus PRs touching `data/ecosystem/`), following the
  Target PRs section of the procedure below.
- **Argument given**: resolve `$ARGUMENTS` to a PR number (a bare number, a
  `#`-prefixed number, or a GitHub URL with `/pull/<N>`). If unrecognizable,
  ask.

## Usage

Read and follow
[review-registry-pr.md](../../../content/en/site/skills/review-registry-pr.md).
