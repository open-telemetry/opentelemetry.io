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
