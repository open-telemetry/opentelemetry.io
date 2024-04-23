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


There are several [classes](https://github.com/open-telemetry/opentelemetry-collector/blob/main/cmd/mdatagen/main.go#L184) of opentelemetry components, such as
- `receivers` (scrapers and listeners to ingest data)
- `exporters` (ways to export data to vendors or other tooling)
- `processors` (ways to process data in a pipeline)
- `connectors` (ways to [connect pipelines](./connector/) and form a [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph) for your data pipeline)
- `extensions` (ways to [augment the collector](https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md), such as [health checks](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/extension/healthcheckextension/README.md))
- `cmd` (commands)
- `pkg` (packages)

Most components are registered via [`mdatagen`](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/mdatagen), a tool which will auto generate some code specifying the adoption status (stability) of your component along with documentation and component specific information. Most significantly, `mdatagen` configuration is used to configure the out-of-the-box metrics for scraping receivers, and which are enabled by default for collection.


The core [`opentelemetry-collector`](https://github.com/open-telemetry/opentelemetry-collector/blob/main/README.md) is the basis for all OpenTelemetry components and Collector development. For specific, non-universal integrations, contributors look to the [`-contrib`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/README.md) repository for all but the most generic integrations, and vendors often base their distributions off of the `-contrib` repository.

Note that [adding a component](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/CONTRIBUTING.md#adding-new-components) to the `-contrib` distribution incurs a high bar of support, and while contributions of new components are encouraged, adoption is a process that requires ongoing support and commitment to the opentelemetry project.

If you wish to [build your own distribution](../custom-collector/) of the collector, you may use the [`ocb`](https://github.com/open-telemetry/opentelemetry-collector/tree/main/cmd/builder) tool.
