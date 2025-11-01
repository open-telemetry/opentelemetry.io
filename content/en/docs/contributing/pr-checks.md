---
title: Pull request checks
description: Learn how to make your pull request successfully pass all checks
weight: 40
---

When you raise a
[pull request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)
(PR) with the
[opentelemetry.io repository](https://github.com/open-telemetry/opentelemetry.io)
a set of checks are executed. The PR checks verify that:

- You have signed the [CLA](#easy-cla)
- Your PR successfully [deploys through Netlify](#netlify-deployment)
- Your changes are compliant with our [style guide](#checks)

{{% alert title="Note" %}}

If any of the PR checks fails, try to
[fix content issues](../pull-requests/#fix-issues) first by running
`npm run fix:all` locally.

You can also add the comment `/fix:all` to your PR. This will trigger the
OpenTelemetry Bot to run that command on your behalf and update the PR. Make
sure that you pull those changes locally.

Only if your issues persist, read below what the different checks do and how you
can recover from a failed state.

{{% /alert %}}

## `Easy CLA` {.notranslate lang=en}

This check fails if you haven't [signed the CLA](../prerequisites/#cla).

## Netlify deployment

If the [Netlify](https://www.netlify.com/) build fails, select **Details** for
more information.

## GitHub PR checks {#checks}

To make sure that contributions follow our [style guide](../style-guide/) we
have implemented a set of checks that verify style guide rules and fail if they
find any issues.

The following list describes current checks and what you can do to fix related
errors:

### `TEXT linter` {.notranslate lang=en}

This check verifies that
[OpenTelemetry-specific terms and words are used consistently across the site](../style-guide/#opentelemetryio-word-list).

If any issues are found, annotations are added to your files in the
`files changed` view of your PR. Fix those to turn the check green. As an
alternative, you can run `npm run check:text -- --fix` locally to fix most
issues. Run `npm run check:text` again and manually fix the remaining issues.

### `MARKDOWN linter` {.notranslate lang=en}

This check verifies that
[standards and consistency for Markdown files are enforced](../style-guide/#markdown-standards).

If any issues are found, run `npm run fix:markdown` to fix most issues
automatically. For any remaining issues, run `npm run check:markdown` and apply
the suggested changes manually.

### `SPELLING check` {.notranslate lang=en}

This check verifies that
[all words are spelled correctly](../style-guide/#spell-checking).

If this check fails, run `npm run check:spelling` locally to see the misspelled
words. If a word is spelled correctly, you may need to add it to the
`cSpell:ignore` section in the front matter of the file.

### `CSPELL` check {.notranslate lang=en}

This check will verify that all words in your cSpell ignore list are normalized.

If this check fails, run `npm run fix:dict` locally and push the changes in a
new commit.

### `FILE FORMAT` {.notranslate lang=en}

This check verifies that all files conform to
[Prettier format rules](../style-guide/#file-format).

If this check fails, run `npm run fix:format` locally and push the changes in a
new commit.

### `FILENAME check` {.notranslate lang=en}

This check verifies that all
[file names are in kebab-case](../style-guide/#file-names).

If this check fails, run `npm run fix:filenames` locally and push the changes in
a new commit.

### `BUILD` and `CHECK LINKS` {.notranslate lang=en}

These two checks build the website and verify that all links are valid.

To build and check links locally, run `npm run check:links`. This command also
updates the reference cache. Push any changes to the refcache in a new commit.

#### Fix 404s

You need to fix the URLs reported as **invalid** (HTTP status **404**), by the
link checker.

#### Handling valid external links

The link checker will sometimes get an HTTP status other than 200 (success) by
servers that block checkers. Such servers will often return an HTTP status in
the 400 range other than 404, such as 401, 403, or 406, which are the most
common. Some servers, link LinkedIn, report 999.

If you have manually validated an external link that the checker isn't getting a
success status for, you can add the following query parameter to your URL to
have the link checker ignore it: `?no-link-check`. For example,
<https:/some-example.org?no-link-check> will be ignored by the link checker.

{{% alert title="Maintainers tip" %}}

Maintainers can run the following script immediately after having run the link
checker to have Puppeteer attempt to validate links with non-ok statuses:

```sh
./scripts/double-check-refcache-4XX.mjs
```

Use the `-f` flag to also validate URL fragments (anchors) in external links,
which `htmltest` doesn't do. We don't currently run this often, so you will
probably want to limit the number of updated entries using the `-m N` flag. For
usage info, run with `-h`.

{{% /alert %}}

### `WARNINGS in build log?` {.notranslate lang=en}

If this check fails, review the `BUILD and CHECK LINKS` log, under the
`npm run log:check:links` step, for any other potential issues. Ask maintainers
for help, if you are unsure how to recover.
