---
title: "Components"
weight: 20
---

The OpenTelemetry project consists of multiple components. These components are
made available as a single implementation to ease adoption and ensure a
vendor-agnostic solution. More components may be added in the future.

## Proto

Language independent interface types. Defined per data source for
instrumentation libraries and the collector as well as for common aspects and
resources. Proto files are extensively commented. For more information, see the
[proto repository](https://github.com/open-telemetry/opentelemetry-proto).

## Specification

Describes the cross-language requirements and expectations for all
implementations. Beyond definition of terms, the specification defines the
following:

- **API:** Used to generate telemetry data. Defined per data source as well as for
  other aspects including baggage and propagators.
- **SDK:** Implementation of the API with processing and exporting capabilities.
  Defined per data source as well as for other aspects including resources and
  configuration.
- **Data:** Defines semantic conventions to provide vendor-agnostic
  implementations as well as the OpenTelemetry protocol (OTLP).

For more information, see the [specification
repository](https://github.com/open-telemetry/opentelemetry-specification).

## Collector

The OpenTelemetry Collector offers a vendor-agnostic implementation on how to
receive, process, and export telemetry data. It removes the need to run,
operate, and maintain multiple agents/collectors in order to support
open-source observability data formats (e.g. Jaeger, Prometheus, etc.) sending
to one or more open-source or commercial back-ends. The Collector is the
default location instrumentation libraries export telemetry data.

The Collector provides a single binary and two deployment methods:

- An agent running with the application or on the same host as the application
  (e.g. binary, sidecar, or daemonset).
- A gateway running as a standalone service (e.g. container or deployment)
  typically per cluster, datacenter or region.

The Collector comes in two flavors and releases, the first is vanilla build 
where releases are found at 
https://github.com/open-telemetry/opentelemetry-collector/releases 
along with a second build including contributions that support many more 
export targets (tools). The contrib build may be found at
https://github.com/open-telemetry/opentelemetry-collector-contrib/releases

For more information, see the [Data
Collection](https://opentelemetry.io/docs/concepts/data-collection/) section.

## Instrumentation Libraries

The inspiration of the OpenTelemetry project is to make every library and
application observable out of the box by having them call the OpenTelemetry API
directly. Until that happens, there is a need for a separate library which can
inject this information. A library that enables observability for another
library is called an instrumentation library. The OpenTelemetry project
provides an instrumentation library for multiple languages. All instrumentation
libraries support manual (code modified) instrumentation and several support
automatic (byte-code) instrumentation.

For more information, see [Instrumenting](/docs/concepts/instrumenting) section.
