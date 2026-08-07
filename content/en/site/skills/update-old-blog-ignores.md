---
title: Update old-blog ignore ranges
description: >-
  How to advance the year range of old blog posts excluded from site checks and
  fixes.
cSpell:ignore: textlintignore
---

Old blog posts are [historical and not updated][old-blogs], so they are excluded
from lint/format checks and fix scripts. Once a year (or as needed), advance the
year range in the configuration of each tool listed below.

[old-blogs]: /docs/contributing/blog/#old-blogs-are-not-updated

## Configuration to update {#configuration}

Each entry encodes the same policy: currently ignoring 2019 and `202[0-4]`. The
link checker omits 2020 since there are no posts in that year (the glob-based
tools harmlessly include it). Adjust the year ignore glob/pattern as needed for
each tool:

| Tool                        | Configuration                                           |
| --------------------------- | ------------------------------------------------------- |
| cspell                      | `.cspell.yml` → `ignorePaths`                           |
| markdownlint                | `.markdownlint-cli2.yaml` → `ignores`                   |
| prettier                    | `.prettierignore`                                       |
| textlint                    | `.textlintignore` (note: requires `**` glob suffixes)   |
| `fix:dict`, trailing spaces | `package.json` → `__find:md:not-old-blog` script        |
| link checker (Lychee)       | `content/en/blog/_index.md` → `link_check_exclude_path` |

## Verify {#verify}

The policy is guarded by `scripts/old-blog-lint-ignores.test.mjs`, which seeds
violations into an old and a recent blog folder and asserts that each tool skips
the former and flags the latter. Run it via:

```sh
npm run test:local-tools
```

If the newly ignored year still has lint debt that the tools now skip, that is
expected — old posts are left as is.
