---
title: "Data Collection"
description: >-
  The OpenTelemetry project facilitates the collection of telemetry data via the OpenTelemetry Collector
weight: 50
---


## The OpenTelemetry Collector
The OpenTelemetry project facilitates the collection of telemetry data via the
OpenTelemetry Collector. The collector is a vendor-agnostic tool that receives telemetry data in
various formats, processes it, and exports it to one or more specified destinations. It removes
the need to run, operate, and maintain multiple agents/collectors in order to
support open-source observability data formats (e.g. Jaeger, Prometheus, etc.)
sending to one or more open-source or commercial back-ends. In addition, the
Collector gives end-users control over their data. The Collector is the default
destination where instrumentation libraries export their telemetry data.

> The Collector may be offered as a distribution, see [here](../distributions)
> for more information.

## Deployments

The OpenTelemetry Collector provides a single binary and two deployment methods:
- **Agent:** A Collector instance running with the application or on the same
  host as the application (e.g. binary, sidecar, or daemonset).
- **Gateway:** One or more Collector instances running as a standalone service
  (e.g. container or deployment) typically per cluster, data center, or region.

For information on how to use the Collector see the
[getting started documentation](/docs/collector/getting-started).

## Components of the OpenTelemetry Collector
The collector makes it possible for users to configure *pipelines* for signals by
combining any necessary number of *receivers*, *processors*, and *exporters*.
Multiple instances of these components as well as pipelines can be defined via YAML configuration.

Let's look at these components in more details:

- <img width="32" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Receivers.svg"></img>
  `receivers`: How to get data into the Collector; these can be push or pull
  based
- <img width="32" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Processors.svg"></img>
  `processors`: What to do with received data
- <img width="32" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/Exporters.svg"></img>
  `exporters`: Where to send received data; these can be push or pull based

These components are enabled through `pipelines` as mentioned earlier. Read further to learn
more about the components.

### Receivers
The receiver is the first component in a pipeline. It receives data in several supported
[data formats](https://opentelemetry.io/docs/concepts/signals), and converts this data into 
an internal data format recognized by the collector. Receivers can be push or pull based.

You can set multiple protocols for a single receiver and make them listen to different ports by default. 
The table below shows supported receiver formats for each signal type:

| Signal Source        | Traces             | Metrics            | Logs               |
| :---                 |    :----:          |  :---:             |               ---: |
| Host Metrics         |                    | :heavy_check_mark: |                    |
| Jaeger               | :heavy_check_mark: |                    |                    |
| Kafka                | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| OpenCensus           | :heavy_check_mark: | :heavy_check_mark: |                    |
| OpenTelemetry (OTLP) | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Prometheus           | :heavy_check_mark: | :heavy_check_mark: |                    |
| Zipkin               | :heavy_check_mark: |                    |                    |

For information about configuring receivers, see the [configuration documentation](/docs/collector/configuration/#receivers).

### Processors
The job of the processor is to filter unwanted telemetry data and inject additional attributes to the data 
before it is sent to the exporter. While receivers and exporters, the capabilities of processors differ immensely
from one processor to the other.  The table below shows the currently supported processors, and the signals they
possess:

| Signal                 |       Traces        |      Metrics       |               Logs |
|:-----------------------|:-------------------:|:------------------:|-------------------:|
| Attributes             | :heavy_check_mark:  |                    | :heavy_check_mark: |
| Batch                  | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: |
| Filter                 |                     | :heavy_check_mark: |                    |
| Memory Linter          | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: |
| Probabilistic Sampling | :heavy_check_mark:  |                    |                    |
| Resource               | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: |
| Span                   | :heavy_check_mark:  |                    |                    |

Processors are optional, although [some are 
recommended](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). 

Some kinds of configurations can be used to transport values or consolidate data coming in from 
multiple systems, where different names are used to represent the same data.

For more information about these components see the
[configuration documentation](/docs/collector/configuration/#processors).

## Repositories

The OpenTelemetry project provides two versions of the Collector:

- **[Core](https://github.com/open-telemetry/opentelemetry-collector/releases):**
  Foundational components such as configuration and generally applicable
  receivers, processors, exporters, and extensions.
- **[Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases):**
  All the components of core plus optional or possibly experimental components.
  Offers support for popular open-source projects including Jaeger, Prometheus,
  and Fluent Bit. Also contains more specialized or vendor-specific receivers,
  processors, exporters, and extensions.
