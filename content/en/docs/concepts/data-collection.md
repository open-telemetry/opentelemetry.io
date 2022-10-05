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

Learn how to configure receivers in the [configuration documentation](/docs/collector/configuration/#receivers).

### Processors
The job of the processor is to filter unwanted telemetry data and inject additional attributes to the data 
before it is sent to the exporter. While receivers and exporters, the capabilities of processors differ immensely
from one processor to the other. Processors are run on data between being received and being exported.
While processors are optional, [some are
recommended](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors).

The table below shows the currently supported processors, and the signals they
possess:

| Signal                 |       Traces        |      Metrics       |               Logs |
|:-----------------------|:-------------------:|:------------------:|-------------------:|
| Attributes             | :heavy_check_mark:  |                    | :heavy_check_mark: |
| Batch                  | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: |
| Filter                 |                     | :heavy_check_mark: |                    |
| Memory Limiter         | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: |
| Probabilistic Sampling | :heavy_check_mark:  |                    |                    |
| Resource               | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: |
| Span                   | :heavy_check_mark:  |                    |                    |

Processors are optional, although [some are 
recommended](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors). 

Processors can be configured to transport values or consolidate data coming in from 
multiple systems, where different names are used to represent the same data. It is important to learn
about the types of processors in detail to maximize their usage. 

**Attribute processors**

The attribute processor are used to make modifications to telemetry data attributes. The following operations are 
supported by the attribute processor:
- `delete`: deletes an attribute for a specified key
- `extract`: uses regex to extract values from the specified attribute and upsert new attributes resulting from that extraction
- `hash`: calculates the sha-1 hash of the value of an existing attribute, then updates that value with the derived hash
- `insert`: inserts an attribute for a specified key when it does not exist
- `update`: updates an existing attribute with a specified value. 
- `upsert`: combines the `insert` and `update` operations

The attribute processor comes in handy when scraping personally identifiable information or sensitive data.

**Batch processor**

The batch processors enables users to batch data in order to increase the transmission efficiency. It can be configured
to send batches based on the size of the batch, or on a schedule. An example of a batch processor use case is shown below:
```yaml
processors:
  batch:
    timeout: 10s
    send_batch_size: 10000
    send_batch_max_size: 11000
```

**Filter processor**

The filter processor makes it possible to include or exclude telemetry data using the configuration parameters
provided. It can be configured to match with `strict` or `regexp` names. The filter can be further scoped by specifying
`resource_attributes`.

**Memory limiter processor**

The memory limiter processor enables the user to control the amount of memory the collector consumes. This ensures that the 
collector is conscious of resource consumption, and does everything it can to avoid running out of memory. The memory
limiter has to be the first processor to configure in the pipeline.

The configuration below shows how to set the memory limiter to use up to 300 Mib via the `limit_mib` parameter with a
difference of 50 Mib between soft and hard limits configured via the `spike_limit_mib`:
```yaml
processors:
  memory_limiter:
    check_interval: 5s
    limit_mib: 300
    spike_limit_mib: 50
  extensions:
    memory_ballast:
      size_mib: 150
```

**Probabilistic sampling processor**

The probabilistic sampling processor is used to reduce the number of traces exported from the collector. This is 
done by specifying a sampling percentage which determines the threshold percentage that should be preserved. An example
of a probabilistic sampler is shown below:
```yaml
processors:
  probabilistic_sampler:
    sampling_percentage: 50
    hash_seed: 123456
```

The `hash_seed` parameter determines how the collector should hash the trace IDs for determining which traces to process.

**Resource processor**

The resource processor enables users to modify attributes like the attribute processor but instead of updating attributes
on individual spans, metrics, or logs, it updates attributes of the resource associated with the telemetry data.

**Span processor**

The job of the span processor is to manipulate the names or attributes of spans. It can extract the attributes of a span 
and update its name based on those attributes. It supports   include` and `exclude` configuration parameters for filtering
spans. Some span processors are used to change the collector's behavior.

Learn how to configure processors in the
[configuration documentation](/docs/collector/configuration/#processors).

### Exporters
The job of the exporter is to receive data in the internal collector format, convert it into the output format, and 
transport it to one or more specified destinations. Multiple exporters of the same type can be configured to transport
data to different destinations as required. Similarly, multiple exporters can be configured in the same pipeline to 
transport data to multiple destinations.

The table below shows the available exporters and the signals they support:

| Exporters            |       Traces       |      Metrics       |               Logs |
|:---------------------|:------------------:|:------------------:|-------------------:|
| File                 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Jaeger               | :heavy_check_mark: |                    |                    |
| Kafka                | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Logging              | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| OpenCensus           | :heavy_check_mark: | :heavy_check_mark: |                    |
| OpenTelemetry (OTLP) |                    | :heavy_check_mark: | :heavy_check_mark: |
| Prometheus           | :heavy_check_mark: | :heavy_check_mark: |                    |
| Zipkin               | :heavy_check_mark: |                    |                    |


The script below is an example of a Jaeger exporter for traces, and an otlp exporter for traces and metrics:
```yaml
exporters:
  jaeger:
    endpoint: jaeger:14250
  otlp:
    endpoint: otelcol:4317
service:
  pipelines:
    traces:
      exporters: [jaeger, otlp]
    metrics:
      exporters: [otlp]
```

Learn how to configure exporters in the [configuration documentation](/docs/collector/configuration/#exporters).

### Extensions

The job of extensions is to provide additional functionalities to the collector.
Examples of extensions include health monitoring, service discovery, and
data forwarding. Extensions are optional. The following extensions are currently available:
- `ballast`: for configuring memory ballast for the collector, in order to improve the performance and stability of the collector.
- `health_check`: used to make an endpoint available for checking the health of the collector.
- `pprof`: enables the Go performance profiler used to identify performance issues in the collector.
- `zpages`: enables an endpoint that provides debugging information about the components in the collector.

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
