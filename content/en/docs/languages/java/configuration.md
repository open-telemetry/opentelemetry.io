---
title: Configuration
linkTitle: Configuration
weight: 10
aliases: [config]
# prettier-ignore
cSpell:ignore: authservice blrp Dotel ignore LOWMEMORY myservice ottrace PKCS retryable tracepropagators
---

The OpenTelemetry SDK provides a working implementation of the API, and can be
set up and configured in a number of ways. The Java SDK supports most of the
available [configuration options](/docs/languages/sdk-configuration/). For
conformance details, see the
[compliance matrix](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

The following configuration options apply to the
[Java agent](/docs/zero-code/java/agent/) and all other uses of the SDK.

{{% alert title="System Properties and Environment Variables" color="info" %}}
Any setting configurable with a system property can also be configured with an
environment variable. Apply the following steps to convert a system property to
an environment variable:

- Convert the name to uppercase.
- Replace all `.` and `-` characters with `_`.

For example `otel.sdk.enabled` would convert to `OTEL_SDK_ENABLED`.

{{% /alert %}}

## General

The
[autoconfigure module](/docs/languages/java/instrumentation/#automatic-configuration)
(`opentelemetry-sdk-extension-autoconfigure`) allows you to automatically
configure the OpenTelemetry SDK based on a standard set of supported environment
variables and system properties. Start your SDK configurations from it.

{{% alert color="info" %}} The autoconfigure module registers Java shutdown
hooks to shut down the SDK when appropriate. Because OpenTelemetry Java uses
`java.util.logging` for its logging, some of that logging may be suppressed
during shutdown hooks. This is a bug in the JDK itself, and not something under
the control of OpenTelemetry Java. If you require logging during shutdown hooks,
consider using `System.out` rather than a logging framework that might shut
itself down in a shutdown hook, thus suppressing your log messages. See this
[JDK bug](https://bugs.openjdk.java.net/browse/JDK-8161253) for more details.
{{% /alert %}}

{{% alert title="Signal configuration" color="primary" %}}

The text placeholder `{signal}` refers to the supported
[OpenTelemetry Signal](/docs/concepts/signals/). Valid values include `traces`,
`metrics`, and `logs`.

Signal specific configurations take priority over the generic versions.

For example, if you set both `otel.exporter.otlp.endpoint` and
`otel.exporter.otlp.traces.endpoint`, the latter will take precedence.

{{% /alert %}}

### Disabling OpenTelemetrySdk

The OpenTelemetry SDK can be disabled entirely. If disabled,
`AutoConfiguredOpenTelemetrySdk#getOpenTelemetrySdk()` will return a minimally
configured instance (i.e. `OpenTelemetrySdk.builder().build()`).

| System property     | Description                               | Default |
| ------------------- | ----------------------------------------- | ------- |
| `otel.sdk.disabled` | If `true`, disable the OpenTelemetry SDK. | `false` |

### Resources

A resource is the immutable representation of the entity producing the
telemetry. See [resources](/docs/concepts/resources/) for more details.

| System Property                            | Description                                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `otel.resource.attributes`                 | Specify resource attributes in the following format: `key1=val1,key2=val2,key3=val3`.                       |
| `otel.service.name`                        | Specify logical service name. Takes precedence over `service.name` defined with `otel.resource.attributes`. |
| `otel.experimental.resource.disabled-keys` | Specify resource attribute keys that are filtered.                                                          |

Make sure to use `otel.service.name` to set the
[`service.name`](/docs/specs/semconv/resource/#service) resource attribute,
which represents the logical name of your service. If unspecified, the SDK sets
`service.name=unknown_service:java` by default.

### ResourceProvider SPI

The
[autoconfigure-spi](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure-spi)
SDK extension provides a `ResourceProvider` SPI that allows libraries to
automatically provide resources, which are merged into a single resource by the
autoconfiguration module. You can create your own `ResourceProvider`, or
optionally use an artifact that includes built-in ResourceProviders:

- [io.opentelemetry.instrumentation:opentelemetry-resources](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources)
  includes providers for a
  [predefined set of common resources](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources)
- [io.opentelemetry.contrib:opentelemetry-aws-resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources)
  includes providers for
  [common AWS resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources/src/main/java/io/opentelemetry/contrib/aws/resource)
- [io.opentelemetry.contrib:opentelemetry-gcp-resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources)
  includes providers for
  [common GCP resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources/src/main/java/io/opentelemetry/contrib/gcp/resource)

### Disabling automatic ResourceProviders

Many instrumentation agent distributions automatically include various
`ResourceProvider` implementations. These can be turned on or off as follows:

| Environment variable                    | Description                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `otel.java.enabled.resource.providers`  | Turns on one or more `ResourceProvider` types. If unset, all resource providers are enabled. |
| `otel.java.disabled.resource.providers` | Turns off one or more `ResourceProvider` types.                                              |

The value for these properties must be a comma-separated list of fully qualified
`ResourceProvider` class names. For example, if you don't want to expose the
name of the operating system through the resource, you can pass the following
JVM argument:

`-Dotel.java.disabled.resource.providers=io.opentelemetry.instrumentation.resources.OsResourceProvider`

### Attribute limits

The following properties can be used to control the maximum number and length of
attributes.

| System property                     | Description                                                                            | Default  |
| ----------------------------------- | -------------------------------------------------------------------------------------- | -------- |
| `otel.attribute.value.length.limit` | The maximum length of attribute values. Applies to spans and logs.                     | No limit |
| `otel.attribute.count.limit`        | The maximum number of attributes. Applies to spans, span events, span links, and logs. | `128`    |

### Propagators

Propagators determine which distributed tracing header formats are used, and
which baggage propagation header formats are used.

| System property    | Description                                                                      | Default                      |
| ------------------ | -------------------------------------------------------------------------------- | ---------------------------- |
| `otel.propagators` | The propagators to be used. Use a comma-separated list for multiple propagators. | `tracecontext,baggage` (W3C) |

Supported values are the following:

| Value          | Description                                                                                                      | Artifacts                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `tracecontext` | [W3C Trace Context](https://www.w3.org/TR/trace-context/) (add `baggage` as well to include W3C baggage).        | `opentelemetry-api`                                          |
| `baggage`      | [W3C Baggage](https://www.w3.org/TR/baggage/).                                                                   | `opentelemetry-api`                                          |
| `b3`           | [B3 Single](https://github.com/openzipkin/b3-propagation#single-header).                                         | `opentelemetry-extension-tracepropagators`                   |
| `b3multi`      | [B3 Multi](https://github.com/openzipkin/b3-propagation#multiple-headers).                                       | `opentelemetry-extension-tracepropagators`                   |
| `jaeger`       | [Jaeger](https://www.jaegertracing.io/docs/1.21/client-libraries/#propagation-format) (includes Jaeger baggage). | `opentelemetry-extension-tracepropagators`                   |
| `xray`         | [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-tracingheader).    | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator` |
| `ottrace`      | [OT Trace](https://github.com/opentracing?q=basic&type=&language=).                                              | `opentelemetry-extension-trace-propagators`                  |

### Exporters

> These configuration options apply when using
> `opentelemetry-exporter-{SDK exporter}` artifacts (see
> [list of available exporters](https://github.com/open-telemetry/opentelemetry-java#sdk-exporters)).

Exporters output the telemetry. The following configuration properties are
common to all exporters:

| System property                               | Purpose                                                                                                                                                                                               |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `otel.{signal}.exporter`                      | List of exporters to be used for {signal}, separated by commas. Default is `otlp`. `none` means no auto-configured exporter.                                                                          |
| `otel.java.experimental.exporter.memory_mode` | If `reusable_data`, enable reusable memory mode (on exporters which support it) to reduce allocations. Default is `immutable_data`. This option is experimental and subject to change or removal.[^1] |

[^1]:
    Exporters which adhere to
    `otel.java.experimental.exporter.memory_mode=reusable_data` are
    `OtlpGrpc{Signal}Exporter`, `OtlpHttp{Signal}Exporter`, and
    `PrometheusHttpServer`.

#### OTLP exporter (span, metric, and log exporters)

The [OpenTelemetry Protocol (OTLP)](/docs/specs/otlp) span, metric, and log
exporters.

| System property                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                          | Default                                                                                                                    |
| ---------------------------------------------------------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `otel.{signal}.exporter`                                   | Select the OpenTelemetry exporter for {signal}.                                                                                                                                                                                                                                                                                                                                                                                      | otlp                                                                                                                       |
| `otel.exporter.otlp.endpoint`                              | The OTLP traces, metrics, and logs endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. If protocol is `http/protobuf` the version and signal will be appended to the path (e.g. `v1/traces`, `v1/metrics`, or `v1/logs`).                                                                                                                                                       | `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/{signal}` when protocol is `http/protobuf`. |
| `otel.exporter.otlp.{signal}.endpoint`                     | The OTLP {signal} endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS.                                                                                                                                                                                                                                                                                                           | `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/{signal}` when protocol is `http/protobuf`. |
| `otel.exporter.otlp.certificate`                           | The path to the file containing trusted certificates to use when verifying an OTLP trace, metric, or log server's TLS credentials. The file should contain one or more X.509 certificates in PEM format.                                                                                                                                                                                                                             | The host platform's trusted root certificates are used.                                                                    |
| `otel.exporter.otlp.{signal}.certificate`                  | The path to the file containing trusted certificates to use when verifying an OTLP {signal} server's TLS credentials. The file should contain one or more X.509 certificates in PEM format.                                                                                                                                                                                                                                          | The host platform's trusted root certificates are used                                                                     |
| `otel.exporter.otlp.client.key`                            | The path to the file containing private client key to use when verifying an OTLP trace, metric, or log client's TLS credentials. The file should contain one private key PKCS8 PEM format.                                                                                                                                                                                                                                           | No client key file is used.                                                                                                |
| `otel.exporter.otlp.{signal}.client.key`                   | The path to the file containing private client key to use when verifying an OTLP {signal} client's TLS credentials. The file should contain one private key PKCS8 PEM format.                                                                                                                                                                                                                                                        | No client key file is used.                                                                                                |
| `otel.exporter.otlp.client.certificate`                    | The path to the file containing trusted certificates to use when verifying an OTLP trace, metric, or log client's TLS credentials. The file should contain one or more X.509 certificates in PEM format.                                                                                                                                                                                                                             | No chain file is used.                                                                                                     |
| `otel.exporter.otlp.{signal}.client.certificate`           | The path to the file containing trusted certificates to use when verifying an OTLP {signal} server's TLS credentials. The file should contain one or more X.509 certificates in PEM format.                                                                                                                                                                                                                                          | No chain file is used.                                                                                                     |
| `otel.exporter.otlp.headers`                               | Key-value pairs separated by commas to pass as request headers on OTLP trace, metric, and log requests.                                                                                                                                                                                                                                                                                                                              |                                                                                                                            |
| `otel.exporter.otlp.{signal}.headers`                      | Key-value pairs separated by commas to pass as request headers on OTLP {signal} requests.                                                                                                                                                                                                                                                                                                                                            |                                                                                                                            |
| `otel.exporter.otlp.compression`                           | The compression type to use on OTLP trace, metric, and log requests. Options include `gzip`.                                                                                                                                                                                                                                                                                                                                         | No compression will be used.                                                                                               |
| `otel.exporter.otlp.{signal}.compression`                  | The compression type to use on OTLP {signal} requests. Options include `gzip`.                                                                                                                                                                                                                                                                                                                                                       | No compression will be used.                                                                                               |
| `otel.exporter.otlp.timeout`                               | The maximum waiting time, in milliseconds, allowed to send each OTLP trace, metric, and log batch.                                                                                                                                                                                                                                                                                                                                   | `10000`                                                                                                                    |
| `otel.exporter.otlp.{signal}.timeout`                      | The maximum waiting time, in milliseconds, allowed to send each OTLP {signal} batch.                                                                                                                                                                                                                                                                                                                                                 | `10000`                                                                                                                    |
| `otel.exporter.otlp.protocol`                              | The transport protocol to use on OTLP trace, metric, and log requests. Options include `grpc` and `http/protobuf`.                                                                                                                                                                                                                                                                                                                   | `grpc` [^2]                                                                                                                |
| `otel.exporter.otlp.{signal}.protocol`                     | The transport protocol to use on OTLP {signal} requests. Options include `grpc` and `http/protobuf`.                                                                                                                                                                                                                                                                                                                                 | `grpc` [^2]                                                                                                                |
| `otel.exporter.otlp.metrics.temporality.preference`        | The preferred output aggregation temporality. Options include `DELTA`, `LOWMEMORY`, and `CUMULATIVE`. If `CUMULATIVE`, all instruments will have cumulative temporality. If `DELTA`, counter (sync and async) and histograms will be delta, up down counters (sync and async) will be cumulative. If `LOWMEMORY`, sync counter and histograms will be delta, async counter and up down counters (sync and async) will be cumulative. | `CUMULATIVE`                                                                                                               |
| `otel.exporter.otlp.metrics.default.histogram.aggregation` | The preferred default histogram aggregation. Options include `BASE2_EXPONENTIAL_BUCKET_HISTOGRAM` and `EXPLICIT_BUCKET_HISTOGRAM`.                                                                                                                                                                                                                                                                                                   | `EXPLICIT_BUCKET_HISTOGRAM`                                                                                                |
| `otel.experimental.exporter.otlp.retry.enabled`            | If `true`, enable [experimental retry support](#otlp-exporter-retry).                                                                                                                                                                                                                                                                                                                                                                | `false`                                                                                                                    |

[^2]: OpenTelemetry Java agent 2.x uses `http/protobuf` by default.

##### OTLP exporter retry

[OTLP](/docs/specs/otlp/#otlpgrpc-response) requires that
[transient](/docs/specs/otel/protocol/exporter/#retry) errors be handled with a
retry strategy. When retry is enabled, retryable gRPC status codes are retried
using an exponential backoff with jitter algorithm as described in the
[gRPC Retry Design](https://github.com/grpc/proposal/blob/master/A6-client-retries.md#exponential-backoff).

The policy has the following configuration, which is can only be customized via
programmatic configuration (see
[customizing the OpenTelemetry SDK](#customizing-the-opentelemetry-sdk)):

| Option              | Description                                                     | Default |
| ------------------- | --------------------------------------------------------------- | ------- |
| `maxAttempts`       | The maximum number of attempts, including the original request. | `5`     |
| `initialBackoff`    | The initial backoff duration.                                   | `1s`    |
| `maxBackoff`        | The maximum backoff duration.                                   | `5s`    |
| `backoffMultiplier` | The backoff multiplier.                                         | `1.5`   |

#### Logging exporter

The logging exporter prints the name of the span along with its attributes to
stdout. It's mainly used for testing and debugging.

> This configuration option applies when using the
> `opentelemetry-exporter-logging` artifact. For full artifact ID and version
> information, reference the
> [SDK exporter list](https://github.com/open-telemetry/opentelemetry-java#sdk-exporters).

| Environment variable             | Description                               |
| -------------------------------- | ----------------------------------------- |
| `otel.{signal}.exporter=console` | Select the logging exporter for {signal}. |

The logging exporter is also set when `otel.{signal}.exporter`, is set to
`logging`. `logging` is a deprecated alias for `console`, the preferred value as
[defined in the specification](/docs/specs/otel/configuration/sdk-environment-variables/#exporter-selection).

#### Logging OTLP JSON exporter

The logging-otlp exporter writes the telemetry data to the JUL logger in OTLP
JSON form. It's a more verbose output mainly used for testing and debugging.

> This configuration option applies when using the
> `opentelemetry-exporter-logging-otlp` artifact. For full artifact ID and
> version information, reference the
> [SDK exporter list](https://github.com/open-telemetry/opentelemetry-java#sdk-exporters).

| Environment variable                  | Description                                         |
| ------------------------------------- | --------------------------------------------------- |
| `otel.{signal}.exporter=logging-otlp` | Select the logging OTLP JSON exporter for {signal}. |

{{% alert title="Note" color="info" %}} While the
`OtlpJsonLogging{Signal}Exporters` are stable, specifying their use via
`otel.{signal}.exporter=logging-otlp` is experimental and subject to change or
removal. {{% /alert %}}

## Tracer provider

The following configuration options are specific to `SdkTracerProvider`. See
[general configuration](#general) for general configuration.

### Span exporters

The following exporters are only available for the trace signal. See
[exporters](#exporters) for general exporter configuration.

#### Jaeger exporter

{{% alert color="info" %}} The Jaeger exporters (artifacts
`opentelemetry-exporter-jaeger` and `opentelemetry-exporter-jaeger-thrift`) were
removed in the
[1.35.0](https://github.com/open-telemetry/opentelemetry-java/releases/tag/v1.35.0)
release (last published in `1.34.0`) and are no longer available in later
versions of autoconfigure. {{% /alert %}}

Jaeger now has [native support for OTLP](/blog/2022/jaeger-native-otlp/), and
users should export to Jaeger using [OTLP](/docs/languages/java/exporters/#otlp)
instead.

#### Zipkin exporter

The [Zipkin](https://zipkin.io/zipkin-api/) exporter sends JSON in
[Zipkin format](https://zipkin.io/zipkin-api/#/default/post_spans) to a
specified HTTP URL.

> These configuration options apply when using the
> `opentelemetry-exporter-zipkin` artifact. For full artifact ID and version
> information, reference the
> [SDK exporter list](https://github.com/open-telemetry/opentelemetry-java#sdk-exporters).

| System property                 | Description                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `otel.traces.exporter=zipkin`   | Select the Zipkin exporter                                                                                            |
| `otel.exporter.zipkin.endpoint` | The Zipkin endpoint to connect to. Default is `http://localhost:9411/api/v2/spans`. Currently only HTTP is supported. |

### Batch span processor

| System property                  | Description                                                     | Default |
| -------------------------------- | --------------------------------------------------------------- | ------- |
| `otel.bsp.schedule.delay`        | The interval, in milliseconds, between two consecutive exports. | `5000`  |
| `otel.bsp.max.queue.size`        | The maximum queue size.                                         | `2048`  |
| `otel.bsp.max.export.batch.size` | The maximum batch size.                                         | `512`   |
| `otel.bsp.export.timeout`        | The maximum allowed time, in milliseconds, to export data.      | `30000` |

### Sampler

The sampler configures whether spans will be recorded for any call to
`SpanBuilder.startSpan`.

| System property           | Description                                                             | Default                 |
| ------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| `otel.traces.sampler`     | The sampler to use for tracing.                                         | `parentbased_always_on` |
| `otel.traces.sampler.arg` | An argument to the configured tracer if supported, for example a ratio. |                         |

Supported values for `otel.traces.sampler` are:

| Value                      | Description                                                                    |
| -------------------------- | ------------------------------------------------------------------------------ |
| `always_on`                | AlwaysOnSampler                                                                |
| `always_off`               | AlwaysOffSampler                                                               |
| `traceidratio`             | TraceIdRatioBased. `otel.traces.sampler.arg` sets the ratio.                   |
| `parentbased_always_on`    | ParentBased(root=AlwaysOnSampler)                                              |
| `parentbased_always_off`   | ParentBased(root=AlwaysOffSampler)                                             |
| `parentbased_traceidratio` | ParentBased(root=TraceIdRatioBased). `otel.traces.sampler.arg` sets the ratio. |

### Span limits

See [attribute limits](#attribute-limits) for general attribute limit
configuration.

These properties can be used to control the maximum size of spans by placing
limits on attributes, events, and links.

| System property                          | Description                                                                                             | Default  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- |
| `otel.span.attribute.value.length.limit` | The maximum length of span attribute values. Takes precedence over `otel.attribute.value.length.limit`. | No limit |
| `otel.span.attribute.count.limit`        | The maximum number of attributes per span. Takes precedence over `otel.attribute.count.limit`.          | `128`    |
| `otel.span.event.count.limit`            | The maximum number of events per span.                                                                  | `128`    |
| `otel.span.link.count.limit`             | The maximum number of links per span.                                                                   | `128`    |

## Meter provider

The following configuration options are specific to `SdkMeterProvider`. See
[general configuration](#general) for general configuration.

### Exemplars

| System property                | Description                                                                          | Default       |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------------- |
| `otel.metrics.exemplar.filter` | The filter for exemplar sampling. Can be `ALWAYS_OFF`, `ALWAYS_ON` or `TRACE_BASED`. | `TRACE_BASED` |

### Periodic Metric Reader

| System property               | Description                                                              | Default |
| ----------------------------- | ------------------------------------------------------------------------ | ------- |
| `otel.metric.export.interval` | The interval, in milliseconds, between the start of two export attempts. | `60000` |

### Metric exporters

The following exporters are only available for the metric signal. See
[exporters](#exporters) for general exporter configuration.

#### Prometheus exporter

The
[Prometheus](https://github.com/prometheus/docs/blob/master/content/docs/instrumenting/exposition_formats.md)
exporter.

> The following configuration options apply when using the
> `opentelemetry-exporter-prometheus` artifact.

| System property                    | Description                                                                        | Default   |
| ---------------------------------- | ---------------------------------------------------------------------------------- | --------- |
| `otel.metrics.exporter=prometheus` | Select the Prometheus exporter                                                     |           |
| `otel.exporter.prometheus.port`    | The local port used to bind the prometheus metric server. Default is `9464`.       | `9464`    |
| `otel.exporter.prometheus.host`    | The local address used to bind the prometheus metric server. Default is `0.0.0.0`. | `0.0.0.0` |

Note that this is a pull exporter - it opens up a server on the local process
listening on the specified host and port, which a Prometheus server scrapes
from.

### Cardinality Limits

| System property                               | Description                                                                                                            | Default |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------- |
| `otel.experimental.metrics.cardinality.limit` | If set, configure experimental cardinality limit. The value dictates the maximum number of distinct points per metric. | `2000`  |

## Logger provider

The following configuration options are specific to `SdkLoggerProvider`. See
[general configuration](#general) for general configuration.

### Batch log record processor

| System property                   | Description                                                     | Default |
| --------------------------------- | --------------------------------------------------------------- | ------- |
| `otel.blrp.schedule.delay`        | The interval, in milliseconds, between two consecutive exports. | `1000`  |
| `otel.blrp.max.queue.size`        | The maximum queue size.                                         | `2048`  |
| `otel.blrp.max.export.batch.size` | The maximum batch size.                                         | `512`   |
| `otel.blrp.export.timeout`        | The maximum allowed time, in milliseconds, to export data.      | `30000` |

## Customizing the OpenTelemetry SDK

Autoconfiguration exposes SPI
[hooks](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi)
for customizing behavior programmatically as needed. It's recommended to use the
above configuration properties where possible, only implementing the SPI to add
functionality not found in the SDK by default.

## File Configuration

**Status**: [Experimental](/docs/specs/otel/versioning-and-stability)

{{% alert title="Note" color="warning" %}} When a config file is specified,
other environment variables described in this document along with SPI
[customizations](#customizing-the-opentelemetry-sdk) are ignored. The contents
of the file alone dictate SDK configuration. {{% /alert %}}

File configuration allows for configuration via a YAML as described in
[opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration)
and [file configuration](/docs/specs/otel/configuration/file-configuration/).

To use, include
`io.opentelemetry:opentelemetry-sdk-extension:incubator:<version>` and specify
the path to the config file as described in the table below.

| System property                 | Purpose                                 | Default |
| ------------------------------- | --------------------------------------- | ------- |
| `otel.experimental.config.file` | The path to the SDK configuration file. | Unset   |
