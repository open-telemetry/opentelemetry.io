---
title: Markdownlint2 rule to fix GitHub URL hashes
custodian: [Patrice Chalin](https://github.com/chalin)
cSpell:ignore: cooldown chalin
---

The goal is to write a markdownlint2 (mdl2) rule that does the following:

A. For any given GitHub URL over a blob or tree:

1. Report an issue when the URL uses a default branch ref (`main` or `master`)
   rather than a tag/release ID or commit hash.
2. Report an issue when the URL uses a short commit hash (7–39 hex chars,
   case-insensitive) instead of a full 40-character commit hash.
3. Allow non-default refs (for example version tags and feature branches).

B. Fix mode:

1. Is enabled when markdownlint is invoked with the `--fix` argument (not via
   rule config), otherwise it is only in check mode.

2. In fix mode, replace the default branch ref or short hash with the latest
   commit hash (full 40-char SHA). Append a `?from_branch=<branch>` query
   parameter for default-branch replacements.

3. (For now) Only provide a fix for files that still exist on the branch. If the
   file has been deleted, report the issue but do not provide fixInfo.
4. If commit lookup fails for any reason (for example HTTP `404`, `403`, `429`,
   parse failure, or network error), report the issue with a failure reason and
   do not provide fixInfo.

Resources:

- <https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md>
- Markdownlint online demo: <https://dlaa.me/markdownlint/>
- For examples of mdl2 rules, see:
  - The rules in [scripts/_md-rules/][]
  - [markdownlint-rule-link-pattern][]
  - [markdownlint-rule-no-shortcut-ref-link][]

## Design decisions

### Resolving the commit hash

Use a simple GET request (e.g. `fetch`) against the public GitHub commits page
and parse the first commit SHA from HTML. Equivalent to:

```bash
curl -fsSL "https://github.com/{owner}/{repo}/commits/{ref}/{path}"
```

- Parse first `/commit/<40-hex>` link from the HTML (case-insensitive): use as
  commit hash for fix.
- If no commit SHA can be parsed: report issue without fixInfo.
- If the commits page responds with HTTP `404`: treat as non-fixable for that
  URL, report issue without fixInfo, continue linting.

This gives the latest commit that touched the file on the given ref, yielding a
stable URL target.

Design decision: avoid GitHub API usage in this rule to reduce auth/token
coupling and API-rate-limit failures in docs workflows. Use a reasonable
`User-Agent` header for request identification.

To reduce 429s while keeping the API-free approach, fix mode uses:

- In-memory dedupe cache keyed by `owner/repo/ref/path` (including in-flight
  promise reuse).
- Request pacing (minimum interval between lookups).
- Process-wide pause on first HTTP `429` response ("hard 429").
- Global `Retry-After` cooldown handling when present (fallback cooldown
  otherwise).
- A single clear failure reason for remaining URLs while lookup is paused, while
  still reporting lint issues.

### Default branch policy

For now, treat only `main` and `master` as default branches to flag. This is
hard-coded and may become configurable later.

### Hash length

Accept only full 40-character commit hashes (hex, case-insensitive) as valid for
pinned URLs. Treat short commit hashes (7–39 hex chars, case-insensitive) as
non-compliant and auto-fix them to full 40-character hashes when lookup
succeeds.

Decision update based on production experience:

- We encountered real 404s for short-hash links that had previously resolved.
- Example from this repo:
  `.../blob/ae0d64c/pkg/stanza/docs/operators/container.md?from_branch=main`
  returned 404, while full `ae0d64c4c2131c7a4308417fa9549d984347dadc` resolved.
- Because short refs can become ambiguous as repos grow, the rule should flag
  short hashes and the fixer should emit full 40-character commit SHAs.

### Enabling fix mode via `--fix`

Fix mode is tied to the markdownlint’s `--fix` flag. The core library does not
pass it to rule params, so we use the same workaround as
[unindent-code-blocks][]: detect fix mode with `process.argv.includes('--fix')`.
Not ideal, but there is no API for it otherwise. We intentionally avoid
rule-specific `config.fix` handling so expensive network lookups and fix
transformations only run when the user explicitly requested fixing. Track
upstream support for exposing fix mode in custom rule params:
<https://github.com/DavidAnson/markdownlint/issues/1979>. If that lands, remove
the `process.argv` workaround and use the official params field instead.

[unindent-code-blocks]: /scripts/_md-rules/unindent-code-blocks.js

### URL transformation

Given:

```text
https://github.com/org/repo/blob/main/path/to/file.md
```

Fixed:

```text
https://github.com/org/repo/blob/abc1234def5678901234567890abcdef12345678/path/to/file.md?from_branch=main
```

## Implementation

The current implementation is in [scripts/_md-rules/gh-url-hash/][].

## Documentation

TODO: document the rule under the site's CI/CD section. Warn that in fix mode,
if processing a large number of GH URLs: the rule may take a long time to
complete, and it might hit GitHub rate limits (403s and 429s).

[scripts/_md-rules/]: /scripts/_md-rules/
[scripts/_md-rules/gh-url-hash/]: /scripts/_md-rules/gh-url-hash/
[markdownlint-rule-link-pattern]:
  https://github.com/chalin/markdownlint-rule-link-pattern
[markdownlint-rule-no-shortcut-ref-link]:
  https://github.com/chalin/markdownlint-rule-no-shortcut-ref-link
