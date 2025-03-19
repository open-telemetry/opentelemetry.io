---
title: Pull request checks
description: Learn how to make your pull request successfully pass all checks
weight: 40
cSpell:ignore: REFCACHE
---

When you raise a
[pull request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)
(PR) with the
[opentelemetry.io repository](https://github.com/open-telemetry/opentelemetry.io)
a set of checks are executed. The PR checks verify that...

- … you have signed the [CLA](#easy-cla).
- …your commit can be deployed through [Netlify](#netlify-deployment)
  successfully.
- … your changes are compliant with our [style guide](#style-checks).

{{% alert title="Note" color="primary" %}}

If any of the PR checks fails, try to
[fix content issues automatically](../pull-requests/#fix-issues) first by
running `npm run fix:all` on your machine.

Additionally, you can comment `/fix:all` on your Pull Request. This will make
the OpenTelemetry Bot run those commands on your behalf and update the PR. Make
sure that you pull those changes locally.

Only if your issues persist, read below what the different checks do and how you
can recover from a failed state.

{{% /alert %}}

## Easy CLA

This check fails if you haven't [signed the CLA](../prerequisites/#cla).

## Netlify deployment

If the [Netlify](https://www.netlify.com/) build fails, select **Details** for
more information.

## Style checks

To make sure that contributions follow our [style guide](../style-guide/) we
have implemented a set of checks that verify style guide rules and fail if they
find any issues.

The following list describes current checks and what you can do to fix related
errors:

### TEXT linter

This check verifies that
[OpenTelemetry-specific terms and words are used consistently across the site](../style-guide/#opentelemetryio-word-list).

If any issues are found, annotations are added to your files in the
`files changed` view of your PR. Fix those to turn the check green. As an
alternative, you can run `npm run check:text -- --fix` locally to fix most
issues. Run `npm run check:text` again and manually fix the remaining issues.

### MARKDOWN linter

This check verifies that
[standards and consistency for Markdown files are enforced](../style-guide/#markdown-standards).

If any issues are found, run `npm run:format` to fix most issues. For more
complex issues, run `npm run check:markdown` and apply the suggested changes.

### SPELLING check

This check verifies that
[all words are spelled correctly](../style-guide/#spell-checking).

### CSPELL:IGNORE check

This check will verify that all words in your cSpell ignore list are normalized.

If this check fails, run `npm run fix:dict` locally and push the changes in a
new commit.

### FILENAME check

This check verifies that all
[files are formatted by prettier](../style-guide/#file-format).

If this check fails, run `npm fix:format` locally and push the changes in a new
commit.

### FILE FORMAT

This check verifies that all
[file names are in kebab-case](../style-guide/#file-names).

If this check fails, run `npm fix:filenames` locally and push the changes in a
new commit.

### BUILD and CHECK LINKS / REFCACHE updates?

This check verifies that all links that your commits are introducing are
functional.

Run `npm run check:links` to check them locally. This also updates the reference
cache, or `REFCACHE`. Push any changes to the `REFCACHE` in a new commit.

### WARNINGS in build log?

If this check fails, review the build log for any other potential issues. Ask
maintainers for help, if you are unsure how to recover.
