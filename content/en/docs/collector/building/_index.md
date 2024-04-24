---
title: Building custom components
description: Instructions on how to build your own collector components
weight: 90
---

The OpenTelemetry Collector can not only be extended by existing components, but
also by custom components, that you develop and build on your own. Here you will
find instructions on how to build some of those components. For additional
details take a look into the documents contained within the
[opentelemetry-collector-contrib repository](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/README.md).

There are several
[classes](https://github.com/open-telemetry/opentelemetry-collector/blob/main/cmd/mdatagen/main.go#L184)
of OpenTelemetry components, such as

- `receivers` Scrapers and Listeners to ingest data
- `exporters` Ways to export data to vendors or other tooling
- `processors` Ways to process data in a pipeline
- `connectors` Ways to [connect pipelines](./connector/) and form a
  [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph) for your data
  pipeline
- `extensions` Ways to
  [augment the collector runtime](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md),
  such as providing
  [health checks](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/healthcheckextension/README.md)
- `cmd` commands for building and/or maintain the collector
- `pkg`
  [packages](https://github.com/search?q=org%3Aopen-telemetry+%22class%3A+pkg%22&type=code)
  for adding functionality to the collector, such as support for
  [golden tests](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/golden#readme)
  or
  [OTTL functions](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/pkg/ottl#readme)

Most components are registered using
[`mdatagen`](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/mdatagen#readme),
a tool which automatically generates code that specifies the adoption status
(stability) of your component along with documentation and component specific
information. Most significantly, `mdatagen` configuration is used to describe
out-of-the-box metrics for scraping receivers, and which metrics are enabled by
default for collection.

The core
[`opentelemetry-collector`](https://github.com/open-telemetry/opentelemetry-collector/blob/main/README.md)
is the basis for all OpenTelemetry components and Collector development. For
specific, non-universal integrations, contributors look to the
[`-contrib`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/README.md)
repository for all but the most generic integrations, and vendors often base
their distributions off of the `-contrib` repository.

Note that
[adding a component](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/CONTRIBUTING.md#adding-new-components)
to the `-contrib` distribution incurs a high bar of support, and while
contributions of new components are encouraged, adoption is a process that
requires ongoing support and commitment to the OpenTelemetry project.

If you wish to build your own [distribution](../distributions/) of the
collector, you may use the
[`OpenTelemetry Collector builder`](../custom-collector).
