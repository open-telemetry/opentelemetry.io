---
title: Documentation style guide
linkTitle: Style guide
weight: 10
cSpell:ignore: open-telemetry postgre style-guide textlintrc
---

We don't have an official style guide yet, but the current OpenTelemetry
documentation style is inspired by the following style guides:

- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Kubernetes Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)

The following sections contain guidance that is specific to the OpenTelemetry
project.

## OpenTelemetry.io word list

A list of OpenTelemetry-specific terms and words to be used consistently across
the site.

<!-- prettier-ignore-start -->
| Term | Usage |
| --- | --- |
| OpenTelemetry | OpenTelemetry should always be capitalized. Don't use Open-Telemetry. |
| OTel | OTel is the accepted short form of OpenTelemetry. Don't use OTEL. |
| Collector | When referring to the OpenTelemetry Collector, always capitalize Collector. |
| OTEP | OpenTelemetry Enhancement Proposal. Write "OTEPs" as plural form. Don't write "OTep" or "otep". |
| OpAMP | Open Agent Management Protocol. Don't write "OPAMP" or "opamp" in descriptions or instructions. |
<!-- prettier-ignore-end -->

Make sure that proper nouns, such as other CNCF projects or third-party tools,
are properly written and use the original capitalization. For example, write
"PostgreSQL" instead of "postgre". For a full list, check the
[`.textlintrc.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.textlintrc.yml)
file.

See also the [Glossary](/docs/concepts/glossary/) for a list of OpenTelemetry
terms and their definition.

Run `npm run check:text` to verify that all terms and words are written
properly.

## Markdown standards

To enforce standards and consistency for Markdown files, all files should follow
certain rules, enforced by
[markdownlint](https://github.com/DavidAnson/markdownlint). For a full list,
check the
[`.markdownlint.json`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.json)
file.

Run `npm run check:markdown` to verify that all files follow the standard.

Run `npm run fix:format` to fix Markdown related formatting issues.

## Spell checking

Use [CSpell](https://github.com/streetsidesoftware/cspell) to make sure that all
your text is spelled correctly. For a list of words that are specific to the
OpenTelemetry website, check the
[`.cspell.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml)
file.

Run `npm run check:spelling` to verify that all your words are spelled
correctly. If `cspell` indicates an `Unknown word` error, verify if you wrote
that word correctly. If so, add this word to the `cSpell:ignore` section at the
top of your file. If no such section exists, you can add it to the front matter
of a Markdown file or as a comment at the top of any other file:

```markdown
---
title: PageTitle
cSpell:ignore: <word>
---
```

```yaml
# cSpell:ignore <word>
title: registryEntryTitle
```

{{% alert title="Note" color="warning" %}}

If you have multiple words in the cSpell ignore list, run `npm run fix:dict` to
make sure that those words are in alphabetical order.

{{% /alert %}}

## File format

To enforce a certain standard on how files are structured, all files should be
formatted by [prettier](https://prettier.io). Run `npm fix:format` before
submitting a PR, or run it afterwards and push an additional commit.

## File names

All file names should be in
[kebab case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case). Run
`npm fix:filenames` to automatically rename your files.
