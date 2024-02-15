---
title: Pull Request Checks
description: Learn how to make your Pull Request successfully pass all checks
weight: 40
cSpell:ignore: REFCACHE
---

When you raise a
[Pull Request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)
with the
[opentelemetry.io repository](https://github.com/open-telemetry/opentelemetry.io)
a set of checks will be run. Those checks will verify, …

- … if you have signed the [CLA](#easy-cla).
- …if your commit can be deployed via [Netlify](#netlify-deployment)
  successfully.
- … if your changes are in line with some [style guidelines](#style-checks).

{{% alert title="Note" color="primary" %}}

If any of your PR checks fails, try to
[fix content issues automatically](/docs/contributing/#fix-content-issues-automatically)
first by running `npm run test-and-fix` locally.

Additionally, you can comment `/fix:all` on your Pull Request. This will make
the OpenTelemetry Bot run those commands on your behalf and update your PR. Make
sure that you pull those changes locally.

{{% /alert %}}

## Easy CLA

This check will fail, if you didn't
[sign the CLA](/docs/contributing/#sign-the-cla).

## Netlify Deployment

If the [Netlify](https://www.netlify.com/) build fails, select **Details** for
more information.

## Style checks

To make sure that contributions follow our
[style guide](/docs/contributing/style-guide) we have implemented a set of
checks that will verify certain rules of that style guide and will fail if they
find any issues.

Below you will find a list of the checks that are run and what you can do to fix
any errors:

- `TEXT linter`: This check will verify that
  [OpenTelemetry-specific terms and words are used consistently across the site](/docs/contributing/style-guide#opentelemetryio-word-list).
  If any issues are found, annotations will be added to your files in the
  `files changed` view of your PR. Fix those to turn the check green. As an
  alternative you can run `npm run check:text` locally and fix all issues
  highlighted in the output.
- `MARKDOWN linter`: This check will verify that
  [standards and consistency for Markdown files are enforced](/docs/contributing/style-guide#markdown-standards).
  If any issues are found, run `npm:run format` to fix (most) issues. For more
  complex issues, run `npm run check:markdown` and apply the suggested changes.
- `SPELLING check`: This check will verify that
  [all words are spelled correctly](/docs/contributing/style-guide#spell-checking).
- `CSPELL:IGNORE check`: This check will verify that all words in your cSpell
  ignore list are normalized. If this check fails, run `npm run fix:dict`
  locally and push the changes in a new commit.
- `FILENAME check`: This check will verify that all
  [files are formatted by prettier](/docs/contributing/style-guide#file-format).
  If this check fails, run `npm fix:format` locally and push the changes in a
  new commit.
- `FILE FORMAT`: This check will verify that all
  [file names are in kebab-case](/docs/contributing/style-guide#file-names). If
  this check fails, run `npm fix:filenames` locally and push the changes in a
  new commit.
- `BUILD and CHECK LINKS` / `REFCACHE updates?`: This check will verify that all
  links that your commits are introducing are functional. Run
  `npm run check:links` to check them locally. This will also update the so
  called `REFCACHE`. Push any changes to the `REFCACHE` in a new commit.
- `WARNINGS in build log?`: If this check fails, review the build log for any
  other potential issues. Ask maintainers for help, if you are unsure how to
  recover.
