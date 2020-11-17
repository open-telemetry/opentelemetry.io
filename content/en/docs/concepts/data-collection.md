---
title: "Data Collection"
weight: 50
---

The OpenTelemetry project facilitates the collection of telemetry data via the
OpenTelemetry Collector. The OpenTelemetry Collector offers a vendor-agnostic
implementation on how to receive, process, and export telemetry data. It
removes the need to run, operate, and maintain multiple agents/collectors in
order to support open-source observability data formats (e.g. Jaeger,
Prometheus, etc.) sending to one or more open-source or commercial back-ends.
In addition, the Collector gives end-users control of their data. The Collector
is the default location for instrumentation libraries to send their telemetry
data.

## Deployment

The OpenTelemetry Collector provides a single binary and two deployment methods:

- An agent running with the application or on the same host as the application
  (e.g. binary, sidecar, or daemonset).
- A gateway running as a standalone service (e.g. container or deployment)
  typically per cluster, datacenter or region.

For information on how to use the Collector see the [getting started
documentation](/docs/collector/getting-started).

## Components

The Collector is made up of the following components:

- `receivers`: How to get data into the Collector; these can be push or pull based
- `processors`: What to do with received data
- `exporters`: Where to send received data; these can be push or pull based

These components are enabled through `pipelines`. Multiple instances of
components as well as pipelines can be defined via YAML configuration.

For more information about these components see the [configuration
documentation](/docs/collector/configuration).
