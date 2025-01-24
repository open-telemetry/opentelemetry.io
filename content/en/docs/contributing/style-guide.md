---
title: Documentation style guide
description: Terminology and style when writing OpenTelemetry docs.
linkTitle: Style guide
weight: 20
cSpell:ignore: open-telemetry postgre style-guide textlintrc
---

We don't have an official style guide yet, but the current OpenTelemetry
documentation style is inspired by the following style guides:

- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Kubernetes Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)

The following sections contain guidance that is specific to the OpenTelemetry
project.

{{% alert title="Note" color="primary" %}}

Many requirements of our style guide can be enforced by running automation:
before submitting a
[pull request](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)
(PR), run `npm run fix:all` on your local machine and commit the changes.

If you run into errors or [failed PR checks](../pr-checks), read about our style
guide and learn what you can do to fix certain common issues.

{{% /alert %}}

## OpenTelemetry.io word list

A list of OpenTelemetry-specific terms and words to be used consistently across
the site:

- [OpenTelemetry](/docs/concepts/glossary/#opentelemetry) and
  [OTel](/docs/concepts/glossary/#otel)
- [Collector](/docs/concepts/glossary/#collector)
- [OTEP](/docs/concepts/glossary/#otep)
- [OpAMP](/docs/concepts/glossary/#opamp)

For a complete list of OpenTelemetry terms and their definition, see
[Glossary](/docs/concepts/glossary/).

Make sure that proper nouns, such as other CNCF projects or third-party tools,
are properly written and use the original capitalization. For example, write
"PostgreSQL" instead of "postgre". For a full list, check the
[`.textlintrc.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.textlintrc.yml)
file.

{{% alert title="Tip" %}}

Run `npm run check:text` to verify that all terms and words are written
properly.

Run `npm run check:text -- --fix` to fix terms and words that are not written
properly.

{{% /alert %}}

## Markdown standards

To enforce standards and consistency for Markdown files, all files should follow
certain rules, enforced by
[markdownlint](https://github.com/DavidAnson/markdownlint). For a full list,
check the
[`.markdownlint.json`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.json)
file.

Run `npm run check:markdown` to verify that all files follow the standard.

Run `npm run fix:markdown` to fix Markdown related formatting issues.

## Spell checking

Use [CSpell](https://github.com/streetsidesoftware/cspell) to make sure that all
your text is spelled correctly. For a list of words that are specific to the
OpenTelemetry website, see the
[`.cspell.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml)
file.

Run `npm run check:spelling` to verify that all your words are spelled
correctly. If `cspell` indicates an `Unknown word` error, verify if you wrote
that word correctly. If so, add this word to the `cSpell:ignore` section at the
top of your file. If no such section exists, you can add it to the front matter
of a Markdown file:

```markdown
---
title: PageTitle
cSpell:ignore: <word>
---
```

For any other file, add `cSpell:ignore <word>` in a comment line appropriate for
the file's context. For a [registry](/ecosystem/registry/) entry YAML file file,
it might look like this:

```yaml
# cSpell:ignore <word>
title: registryEntryTitle
```

Website tooling normalizes page-specific dictionaries (that is, the
`cSpell:ignore` word lists), by removing duplicate words, deleting words in the
global word list, and sorting words. To normalize page-specific dictionaries,
run `npm run fix:dict`.

## File format

To enforce a certain standard on how files are structured, all files should be
formatted by [prettier](https://prettier.io). Run `npm run fix:format` before
submitting a PR, or run it afterwards and push an additional commit.

## File names

All file names should be in
[kebab case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case). Run
`npm run fix:filenames` to automatically rename your files.
