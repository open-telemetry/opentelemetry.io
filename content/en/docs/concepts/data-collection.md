---
title: "Data Collection"
description: >-
  The OpenTelemetry project facilitates the collection of telemetry data via the OpenTelemetry Collector
weight: 50
---

The OpenTelemetry project facilitates the collection of telemetry data via the
OpenTelemetry Collector. The OpenTelemetry Collector offers a vendor-agnostic
implementation on how to receive, process, and export telemetry data. It removes
the need to run, operate, and maintain multiple agents/collectors in order to
support open source observability data formats (e.g. Jaeger, Prometheus, etc.)
sending to one or more open source or commercial back-ends. In addition, the
Collector gives end-users control of their data. The Collector is the default
location instrumentation libraries export their telemetry data.

> The Collector may be offered as a distribution, see [here](../distributions)
> for more information.

## Deployment

The OpenTelemetry Collector provides a single binary and two deployment methods:

- **Agent:** A Collector instance running with the application or on the same
  host as the application (e.g. binary, sidecar, or daemonset).
- **Gateway:** One or more Collector instances running as a standalone service
  (e.g. container or deployment) typically per cluster, data center or region.

For information on how to use the Collector see the
[getting started documentation](/docs/collector/getting-started).

## Components

The Collector is made up of the following components:

- <img width="32" class="img-initial" src="/img/logos/32x32/Receivers.svg"></img>
  `receivers`: How to get data into the Collector; these can be push or pull
  based
- <img width="32" class="img-initial" src="/img/logos/32x32/Processors.svg"></img>
  `processors`: What to do with received data
- <img width="32" class="img-initial" src="/img/logos/32x32/Exporters.svg"></img>
  `exporters`: Where to send received data; these can be push or pull based

These components are enabled through `pipelines`. Multiple instances of
components as well as pipelines can be defined via YAML configuration.

For more information about these components see the
[configuration documentation](/docs/collector/configuration).

## Repositories

The OpenTelemetry project provides two versions of the Collector:

- **[Core](https://github.com/open-telemetry/opentelemetry-collector/releases):**
  Foundational components such as configuration and generally applicable
  receivers, processors, exporters, and extensions.
- **[Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases):**
  All the components of core plus optional or possibly experimental components.
  Offers support for popular open source projects including Jaeger, Prometheus,
  and Fluent Bit. Also contains more specialized or vendor-specific receivers,
  processors, exporters, and extensions.
