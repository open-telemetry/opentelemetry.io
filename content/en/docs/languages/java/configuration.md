---
title: Configure the SDK
linkTitle: Configure the SDK
weight: 13
aliases: [config]
# prettier-ignore
cSpell:ignore: autoconfigured blrp Customizer Dotel ignore LOWMEMORY ottrace PKCS retryable
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

The [SDK](../sdk/) is the built-in reference implementation of the
[API](../api/), processing and exporting telemetry produced by instrumentation
API calls. Configuring the SDK to process and export appropriately is an
essential step to integrating OpenTelemetry into an application.

All SDK components have
[programmatic configuration APIs](#programmatic-configuration). This is the most
flexible, expressive way to configure the SDK. However, changing configuration
requires adjusting code and recompiling the application, and there is no
language interoperability since the API is written in java.

The [zero-code SDK autoconfigure](#zero-code-sdk-autoconfigure) module
configures SDK components through system properties or environment variables,
with various extension points for instances where the properties are
insufficient.

{{% alert %}} We recommend using the
[zero-code SDK autoconfigure](#zero-code-sdk-autoconfigure) module since it
reduces boilerplate code, allows reconfiguration without rewriting code or
recompiling the application, and has language interoperability. {{% /alert %}}

{{% alert %}} The [Java agent](/docs/zero-code/java/agent/) and
[Spring starter](/docs/zero-code/java/spring-boot-starter/) automatically
configure the SDK using the zero-code SDK autoconfigure module, and install
instrumentation with it. All autoconfigure content is applicable to Java agent
and Spring starter users. {{% /alert %}}

## Programmatic configuration

The programmatic configuration interface is the set of APIs for constructing
[SDK](../sdk/) components. All SDK components have a programmatic configuration
API, and all other configuration mechanisms are built on top of this API. For
example, the
[autoconfigure environment variable and system property](#environment-variables-and-system-properties)
configuration interface interprets well-known environment variables and system
properties into a series of calls to the programmatic configuration API.

While other configuration mechanisms offer more convenience, none offer the
flexibility of writing code expressing the precise configuration required. When
a particular capability isn't supported by a higher order configuration
mechanism, you might have no choice but to use programmatic configuration.

The [SDK components](../sdk/#sdk-components) sections demonstrate simple
programmatic configuration API for key user-facing areas of the SDK. Consult the
code for complete API reference.

## Zero-code SDK autoconfigure

The autoconfigure module (artifact
`io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`)
is a configuration interface built on top of the
[programmatic configuration interface](#programmatic-configuration), which
configures [SDK components](../sdk/#sdk-components) with zero code. There are
two distinct autoconfigure workflows:

- [Environment variables and system properties](#environment-variables-and-system-properties)
  interprets environment variables and system properties to create SDK
  components, including various customization points for overlaying programmatic
  configuration.
- [Declarative configuration](#declarative-configuration) (**currently under
  development**) interprets a configuration model to create SDK components,
  which is typically encoded in a YAML configuration file.

Automatically configure SDK components using with autoconfigure as follows:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/AutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;

public class AutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.initialize().getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

{{% alert %}} The [Java agent](/docs/zero-code/java/agent/) and
[Spring starter](/docs/zero-code/java/spring-boot-starter/) automatically
configure the SDK using the zero-code SDK autoconfigure module, and install
instrumentation with it. All autoconfigure content is applicable to Java agent
and Spring starter users. {{% /alert %}}

{{% alert color="info" %}} The autoconfigure module registers Java shutdown
hooks to shut down the SDK when appropriate. Because OpenTelemetry Java
[uses `java.util.logging` for internal logging](../sdk/#internal-logging), some
logging might be suppressed during shutdown hooks. This is a bug in the JDK
itself, and not something under the control of OpenTelemetry Java. If you
require logging during shutdown hooks, consider using `System.out` rather than a
logging framework which might shut itself down in a shutdown hook, thus
suppressing your log messages. For more details, see this
[JDK bug](https://bugs.openjdk.java.net/browse/JDK-8161253). {{% /alert %}}

### Environment variables and system properties

The autoconfigure module supports properties listed in the
[environment variable configuration specification](/docs/specs/otel/configuration/sdk-environment-variables/),
with occasional experimental and Java-specific additions.

The following properties are listed as system properties, but can also be set
using environment variables. Apply the following steps to convert a system
property to an environment variable:

- Convert the name to uppercase.
- Replace all `.` and `-` characters with `_`.

For example, the `otel.sdk.enabled` system property is equivalent to the
`OTEL_SDK_ENABLED` environment variable.

If a property is defined as both a system property and environment variable, the
system property takes priority.

#### Properties: general

Properties for disabling the [SDK](../sdk/#opentelemetrysdk):

| System property     | Description                                       | Default |
| ------------------- | ------------------------------------------------- | ------- |
| `otel.sdk.disabled` | If `true`, disable the OpenTelemetry SDK. **[1]** | `false` |

**[1]**: If disabled, `AutoConfiguredOpenTelemetrySdk#getOpenTelemetrySdk()`
returns a minimally configured instance (for example,
`OpenTelemetrySdk.builder().build()`).

Properties for attribute limits (see [span limits](../sdk/#spanlimits),
[log limits](../sdk/#loglimits)):

| System property                     | Description                                                                                                                                                   | Default  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `otel.attribute.value.length.limit` | The maximum length of attribute values. Applies to spans and logs. Overridden by `otel.span.attribute.value.length.limit`, `otel.span.attribute.count.limit`. | No limit |
| `otel.attribute.count.limit`        | The maximum number of attributes. Applies to spans, span events, span links, and logs.                                                                        | `128`    |

Properties for [context propagation](../sdk/#textmappropagator):

| System property    | Description                                                                                                                                               | Default                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `otel.propagators` | Comma-separated list of propagators. Known values include `tracecontext`, `baggage`, `b3`, `b3multi`, `jaeger`, `ottrace`, `xray`, `xray-lambda`. **[1]** | `tracecontext,baggage` (W3C) |

**[1]**: Known propagators and artifacts (see
[text map propagator](../sdk/#textmappropagator) for artifact coordinates):

- `tracecontext` configures `W3CTraceContextPropagator`.
- `baggage` configures `W3CBaggagePropagator`.
- `b3`, `b3multi` configures `B3Propagator`.
- `jaeger` configures `JaegerPropagator`.
- `ottrace` configures `OtTracePropagator`.
- `xray` configures `AwsXrayPropagator`.
- `xray-lambda` configures `AwsXrayLambdaPropagator`.

#### Properties: resource

Properties for configuring [resource](../sdk/#resource):

| System property                         | Description                                                                                                                             | Default                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `otel.service.name`                     | Specify logical service name. Takes precedence over `service.name` defined with `otel.resource.attributes`.                             | `unknown_service:java` |
| `otel.resource.attributes`              | Specify resource attributes in the following format: `key1=val1,key2=val2,key3=val3`.                                                   |                        |
| `otel.resource.disabled.keys`           | Specify resource attribute keys to filter.                                                                                              |                        |
| `otel.java.enabled.resource.providers`  | Comma-separated list of `ResourceProvider` fully qualified class names to enable. **[1]** If unset, all resource providers are enabled. |                        |
| `otel.java.disabled.resource.providers` | Comma-separated list of `ResourceProvider` fully qualified class names to disable. **[1]**                                              |                        |

**[1]**: For example, to disable the
[OS resource provider](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources/OsResourceProvider.java),
set
`-Dotel.java.disabled.resource.providers=io.opentelemetry.instrumentation.resources.OsResourceProvider`.

**NOTE**: The `otel.service.name` and `otel.resource.attributes` system
properties / environment variables are interpreted in the
`io.opentelemetry.sdk.autoconfigure.EnvironmentResourceProvider` resource
provider. If opting in to specify resource providers via
`otel.java.enabled.resource-providers`, you'll likely want to include it to
avoid surprises. See [ResourceProvider](#resourceprovider) for resource provider
artifact coordinates.

#### Properties: traces

Properties for [batch span processor(s)](../sdk/#spanprocessor) paired with
exporters specified via `otel.traces.exporter`:

| System property                  | Description                                                     | Default |
| -------------------------------- | --------------------------------------------------------------- | ------- |
| `otel.bsp.schedule.delay`        | The interval, in milliseconds, between two consecutive exports. | `5000`  |
| `otel.bsp.max.queue.size`        | The maximum number of spans that can be queued before batching. | `2048`  |
| `otel.bsp.max.export.batch.size` | The maximum number of spans to export in a single batch.        | `512`   |
| `otel.bsp.export.timeout`        | The maximum allowed time, in milliseconds, to export data.      | `30000` |

Properties for [sampler](../sdk/#sampler):

| System property           | Description                                                                                                                                                                                 | Default                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `otel.traces.sampler`     | The sampler to use. Known values include `always_on`, `always_off`, `traceidratio`, `parentbased_always_on`, `parentbased_always_off`, `parentbased_traceidratio`, `jaeger_remote`. **[1]** | `parentbased_always_on` |
| `otel.traces.sampler.arg` | An argument to the configured tracer if supported, for example a ratio.                                                                                                                     |                         |

**[1]**: Known samplers and artifacts (see [sampler](../sdk/#sampler) for
artifact coordinates):

- `always_on` configures `AlwaysOnSampler`.
- `always_off` configures `AlwaysOffSampler`.
- `traceidratio` configures `TraceIdRatioBased`. `otel.traces.sampler.arg` sets
  the ratio.
- `parentbased_always_on` configures `ParentBased(root=AlwaysOnSampler)`.
- `parentbased_always_off` configures `ParentBased(root=AlwaysOffSampler)`.
- `parentbased_traceidratio` configures `ParentBased(root=TraceIdRatioBased)`.
  `otel.traces.sampler.arg` sets the ratio.
- `jaeger_remote` configures `JaegerRemoteSampler`. `otel.traces.sampler.arg` is
  a comma-separated list of args as described in the
  [specification](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration).

Properties for [span limits](../sdk/#spanlimits):

| System property                          | Description                                                                                             | Default  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- |
| `otel.span.attribute.value.length.limit` | The maximum length of span attribute values. Takes precedence over `otel.attribute.value.length.limit`. | No limit |
| `otel.span.attribute.count.limit`        | The maximum number of attributes per span. Takes precedence over `otel.attribute.count.limit`.          | `128`    |
| `otel.span.event.count.limit`            | The maximum number of events per span.                                                                  | `128`    |
| `otel.span.link.count.limit`             | The maximum number of links per span.                                                                   | `128`    |

#### Properties: metrics

Properties for [periodic metric reader](../sdk/#metricreader):

| System property               | Description                                                              | Default |
| ----------------------------- | ------------------------------------------------------------------------ | ------- |
| `otel.metric.export.interval` | The interval, in milliseconds, between the start of two export attempts. | `60000` |

Properties for exemplars:

| System property                | Description                                                                          | Default       |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------------- |
| `otel.metrics.exemplar.filter` | The filter for exemplar sampling. Can be `ALWAYS_OFF`, `ALWAYS_ON` or `TRACE_BASED`. | `TRACE_BASED` |

Properties for cardinality limits:

| System property                               | Description                                                                                                                                                             | Default |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `otel.experimental.metrics.cardinality.limit` | If set, configure cardinality limit. The value dictates the maximum number of distinct points per metric. This option is experimental and subject to change or removal. | `2000`  |

#### Properties: logs

Properties for [log record processor(s)](../sdk/#logrecordprocessor) pared with
exporters via `otel.logs.exporter`:

| System property                   | Description                                                           | Default |
| --------------------------------- | --------------------------------------------------------------------- | ------- |
| `otel.blrp.schedule.delay`        | The interval, in milliseconds, between two consecutive exports.       | `1000`  |
| `otel.blrp.max.queue.size`        | The maximum number of log records that can be queued before batching. | `2048`  |
| `otel.blrp.max.export.batch.size` | The maximum number of log records to export in a single batch.        | `512`   |
| `otel.blrp.export.timeout`        | The maximum allowed time, in milliseconds, to export data.            | `30000` |

#### Properties: exporters

Properties for setting exporters:

| System property                  | Purpose                                                                                                                                                                | Default         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `otel.traces.exporter`           | Comma-separated list of span exporters. Known values include `otlp`, `zipkin`, `console`, `logging-otlp`, `none`. **[1]**                                              | `otlp`          |
| `otel.metrics.exporter`          | Comma-separated list of metric exporters. Known values include `otlp`, `prometheus`, `none`. **[1]**                                                                   | `otlp`          |
| `otel.logs.exporter`             | Comma-separated list of log record exporters. Known values include `otlp`, `console`, `logging-otlp`, `none`. **[1]**                                                  | `otlp`          |
| `otel.java.exporter.memory_mode` | If `reusable_data`, enable reusable memory mode (on exporters which support it) to reduce allocations. Known values include `reusable_data`, `immutable_data`. **[2]** | `reusable_data` |

**[1]**: Known exporters and artifacts (see
[span exporter](../sdk/#spanexporter),
[metric exporter](../sdk/#metricexporter),
[log exporter](../sdk/#logrecordexporter) for exporter artifact coordinates):

- `otlp` configures `OtlpHttp{Signal}Exporter` / `OtlpGrpc{Signal}Exporter`.
- `zipkin` configures `ZipkinSpanExporter`.
- `console` configures `LoggingSpanExporter`, `LoggingMetricExporter`,
  `SystemOutLogRecordExporter`.
- `logging-otlp` configures `OtlpJsonLogging{Signal}Exporter`.
- `experimental-otlp/stdout` configures `OtlpStdout{Signal}Exporter` (this
  option is experimental and subject to change or removal).

**[2]**: Exporters which adhere to
`otel.java.exporter.memory_mode=reusable_data` are `OtlpGrpc{Signal}Exporter`,
`OtlpHttp{Signal}Exporter`, `OtlpStdout{Signal}Exporter`, and
`PrometheusHttpServer`.

Properties for `otlp` span, metric, and log exporters:

| System property                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                          | Default                                                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `otel.{signal}.exporter=otlp`                              | Select the OpenTelemetry exporter for {signal}.                                                                                                                                                                                                                                                                                                                                                                                      |                                                                                                                            |
| `otel.exporter.otlp.protocol`                              | The transport protocol to use on OTLP trace, metric, and log requests. Options include `grpc` and `http/protobuf`.                                                                                                                                                                                                                                                                                                                   | `grpc` **[1]**                                                                                                             |
| `otel.exporter.otlp.{signal}.protocol`                     | The transport protocol to use on OTLP {signal} requests. Options include `grpc` and `http/protobuf`.                                                                                                                                                                                                                                                                                                                                 | `grpc` **[1]**                                                                                                             |
| `otel.exporter.otlp.endpoint`                              | The endpoint to send all OTLP traces, metrics, and logs to. Often the address of an OpenTelemetry Collector. Must be a URL with a scheme of either `http` or `https` based on the use of TLS.                                                                                                                                                                                                                                        | `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318` when protocol is `http/protobuf`.             |
| `otel.exporter.otlp.{signal}.endpoint`                     | The endpoint to send OTLP {signal} to. Often the address of an OpenTelemetry Collector. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. If protocol is `http/protobuf` the version and signal must be appended to the path (e.g. `v1/traces`, `v1/metrics`, or `v1/logs`)                                                                                                                           | `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/{signal}` when protocol is `http/protobuf`. |
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
| `otel.exporter.otlp.metrics.temporality.preference`        | The preferred output aggregation temporality. Options include `DELTA`, `LOWMEMORY`, and `CUMULATIVE`. If `CUMULATIVE`, all instruments will have cumulative temporality. If `DELTA`, counter (sync and async) and histograms will be delta, up down counters (sync and async) will be cumulative. If `LOWMEMORY`, sync counter and histograms will be delta, async counter and up down counters (sync and async) will be cumulative. | `CUMULATIVE`                                                                                                               |
| `otel.exporter.otlp.metrics.default.histogram.aggregation` | The preferred default histogram aggregation. Options include `BASE2_EXPONENTIAL_BUCKET_HISTOGRAM` and `EXPLICIT_BUCKET_HISTOGRAM`.                                                                                                                                                                                                                                                                                                   | `EXPLICIT_BUCKET_HISTOGRAM`                                                                                                |
| `otel.java.exporter.otlp.retry.disabled`                   | If `false`, retry on when transient errors occur. **[2]**                                                                                                                                                                                                                                                                                                                                                                            | `false`                                                                                                                    |

**NOTE:** The text placeholder `{signal}` refers to the supported
[OpenTelemetry Signal](/docs/concepts/signals/). Valid values include `traces`,
`metrics`, and `logs`. Signal specific configurations take priority over the
generic versions. For example, if you set both `otel.exporter.otlp.endpoint` and
`otel.exporter.otlp.traces.endpoint`, the latter will take precedence.

**[1]**: OpenTelemetry Java agent 2.x and the OpenTelemetry Spring Boot starter
use `http/protobuf` by default.

**[2]**: [OTLP](/docs/specs/otlp/#otlpgrpc-response) requires
[transient](/docs/specs/otel/protocol/exporter/#retry) errors to be handled with
a retry strategy. When retry is enabled, retryable gRPC status codes are retried
using an exponential backoff with jitter algorithm. The specific options of
`RetryPolicy` can only be customized via
[programmatic customization](#programmatic-customization).

Properties for `zipkin` span exporter:

| System property                 | Description                                                | Default                              |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------ |
| `otel.traces.exporter=zipkin`   | Select the Zipkin exporter                                 |                                      |
| `otel.exporter.zipkin.endpoint` | The Zipkin endpoint to connect to. Only HTTP is supported. | `http://localhost:9411/api/v2/spans` |

Properties for `prometheus` metric exporter.

| System property                    | Description                                                  | Default   |
| ---------------------------------- | ------------------------------------------------------------ | --------- |
| `otel.metrics.exporter=prometheus` | Select the Prometheus exporter                               |           |
| `otel.exporter.prometheus.port`    | The local port used to bind the prometheus metric server.    | `9464`    |
| `otel.exporter.prometheus.host`    | The local address used to bind the prometheus metric server. | `0.0.0.0` |

#### Programmatic customization

Programmatic customization provides hooks to supplement the
[supported properties](#environment-variables-and-system-properties) with
[programmatic configuration](#programmatic-configuration).

If using the [Spring starter](/docs/zero-code/java/spring-boot-starter/), see
also
[spring starter programmatic configuration](/docs/zero-code/java/spring-boot-starter/sdk-configuration/#programmatic-configuration).

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizedAutoConfiguredSdk.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.autoconfigure.AutoConfiguredOpenTelemetrySdk;
import java.util.Collections;

public class CustomizedAutoConfiguredSdk {
  public static OpenTelemetrySdk autoconfiguredSdk() {
    return AutoConfiguredOpenTelemetrySdk.builder()
        // Optionally customize TextMapPropagator.
        .addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator)
        // Optionally customize Resource.
        .addResourceCustomizer((resource, configProperties) -> resource)
        // Optionally customize Sampler.
        .addSamplerCustomizer((sampler, configProperties) -> sampler)
        // Optionally customize SpanExporter.
        .addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter)
        // Optionally customize SpanProcessor.
        .addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor)
        // Optionally supply additional properties.
        .addPropertiesSupplier(Collections::emptyMap)
        // Optionally customize ConfigProperties.
        .addPropertiesCustomizer(configProperties -> Collections.emptyMap())
        // Optionally customize SdkTracerProviderBuilder.
        .addTracerProviderCustomizer((builder, configProperties) -> builder)
        // Optionally customize SdkMeterProviderBuilder.
        .addMeterProviderCustomizer((builder, configProperties) -> builder)
        // Optionally customize MetricExporter.
        .addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter)
        // Optionally customize MetricReader.
        .addMetricReaderCustomizer((metricReader, configProperties) -> metricReader)
        // Optionally customize SdkLoggerProviderBuilder.
        .addLoggerProviderCustomizer((builder, configProperties) -> builder)
        // Optionally customize LogRecordExporter.
        .addLogRecordExporterCustomizer((logRecordExporter, configProperties) -> logRecordExporter)
        // Optionally customize LogRecordProcessor.
        .addLogRecordProcessorCustomizer((processor, configProperties) -> processor)
        .build()
        .getOpenTelemetrySdk();
  }
}
```
<!-- prettier-ignore-end -->

#### SPI (Service provider interface)

[SPIs](https://docs.oracle.com/javase/tutorial/sound/SPI-intro.html) (artifact
`io.opentelemetry:opentelemetry-sdk-extension-autoconfigure-spi:{{% param vers.otel %}}`)
extend SDK autoconfiguration beyond the components built-in to the SDK.

The following sections describe the available SPIs. Each SPI section includes:

- A brief description, including link to Javadoc type reference.
- A table of available built-in and `opentelemetry-java-contrib`
  implementations.
- A simple demonstration of a custom implementation.

##### ResourceProvider

[ResourceProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ResourceProvider.html)s
contribute to the autoconfigured [resource](../sdk/#resource).

`ResourceProvider`s built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                                                                       | Artifact                                                                                            | Description                                                                                        |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `io.opentelemetry.sdk.autoconfigure.internal.EnvironmentResourceProvider`   | `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure:{{% param vers.otel %}}`                | Provides resource attributes based on `OTEL_SERVICE_NAME` and `OTEL_RESOURCE_ATTRIBUTES` env vars. |
| `io.opentelemetry.instrumentation.resources.ContainerResourceProvider`      | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides container resource attributes.                                                            |
| `io.opentelemetry.instrumentation.resources.HostResourceProvider`           | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides host resource attributes.                                                                 |
| `io.opentelemetry.instrumentation.resources.HostIdResourceProvider`         | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides host ID resource attribute.                                                               |
| `io.opentelemetry.instrumentation.resources.ManifestResourceProvider`       | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides service resource attributes based on jar manifest.                                        |
| `io.opentelemetry.instrumentation.resources.OsResourceProvider`             | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides OS resource attributes.                                                                   |
| `io.opentelemetry.instrumentation.resources.ProcessResourceProvider`        | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides process resource attributes.                                                              |
| `io.opentelemetry.instrumentation.resources.ProcessRuntimeResourceProvider` | `io.opentelemetry.instrumentation:opentelemetry-resources:{{% param vers.instrumentation %}}-alpha` | Provides process runtime resource attributes.                                                      |
| `io.opentelemetry.contrib.gcp.resource.GCPResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-gcp-resources:{{% param vers.contrib %}}-alpha`             | Provides GCP runtime environment resource attributes.                                              |
| `io.opentelemetry.contrib.aws.resource.BeanstalkResourceProvider`           | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS beanstalk runtime environment resource attributes.                                    |
| `io.opentelemetry.contrib.aws.resource.Ec2ResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS ec2 runtime environment resource attributes.                                          |
| `io.opentelemetry.contrib.aws.resource.EcsResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS ecs runtime environment resource attributes.                                          |
| `io.opentelemetry.contrib.aws.resource.EksResourceProvider`                 | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS eks runtime environment resource attributes.                                          |
| `io.opentelemetry.contrib.aws.resource.LambdaResourceProvider`              | `io.opentelemetry.contrib:opentelemetry-aws-resources:{{% param vers.contrib %}}-alpha`             | Provides AWS lambda runtime environment resource attributes.                                       |

Implement the `ResourceProvider` interface to participate in resource
autoconfiguration. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomResourceProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ResourceProvider;
import io.opentelemetry.sdk.resources.Resource;

public class CustomResourceProvider implements ResourceProvider {

  @Override
  public Resource createResource(ConfigProperties config) {
    // Callback invoked to contribute to the resource.
    return Resource.builder().put("my.custom.resource.attribute", "abc123").build();
  }

  @Override
  public int order() {
    // Optionally influence the order of invocation.
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### AutoConfigurationCustomizerProvider

Implement the
[AutoConfigurationCustomizerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/AutoConfigurationCustomizerProvider.html)
interface to customize a variety of autoconfigured SDK components. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomizerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizer;
import io.opentelemetry.sdk.autoconfigure.spi.AutoConfigurationCustomizerProvider;
import java.util.Collections;

public class CustomizerProvider implements AutoConfigurationCustomizerProvider {

  @Override
  public void customize(AutoConfigurationCustomizer customizer) {
    // Optionally customize TextMapPropagator.
    customizer.addPropagatorCustomizer((textMapPropagator, configProperties) -> textMapPropagator);
    // Optionally customize Resource.
    customizer.addResourceCustomizer((resource, configProperties) -> resource);
    // Optionally customize Sampler.
    customizer.addSamplerCustomizer((sampler, configProperties) -> sampler);
    // Optionally customize SpanExporter.
    customizer.addSpanExporterCustomizer((spanExporter, configProperties) -> spanExporter);
    // Optionally customize SpanProcessor.
    customizer.addSpanProcessorCustomizer((spanProcessor, configProperties) -> spanProcessor);
    // Optionally supply additional properties.
    customizer.addPropertiesSupplier(Collections::emptyMap);
    // Optionally customize ConfigProperties.
    customizer.addPropertiesCustomizer(configProperties -> Collections.emptyMap());
    // Optionally customize SdkTracerProviderBuilder.
    customizer.addTracerProviderCustomizer((builder, configProperties) -> builder);
    // Optionally customize SdkMeterProviderBuilder.
    customizer.addMeterProviderCustomizer((builder, configProperties) -> builder);
    // Optionally customize MetricExporter.
    customizer.addMetricExporterCustomizer((metricExporter, configProperties) -> metricExporter);
    // Optionally customize MetricReader.
    customizer.addMetricReaderCustomizer((metricReader, configProperties) -> metricReader);
    // Optionally customize SdkLoggerProviderBuilder.
    customizer.addLoggerProviderCustomizer((builder, configProperties) -> builder);
    // Optionally customize LogRecordExporter.
    customizer.addLogRecordExporterCustomizer((exporter, configProperties) -> exporter);
    // Optionally customize LogRecordProcessor.
    customizer.addLogRecordProcessorCustomizer((processor, configProperties) -> processor);
  }

  @Override
  public int order() {
    // Optionally influence the order of invocation.
    return 0;
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSpanExporterProvider

Implement the
[ConfigurableSpanExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSpanExporterProvider.html)
interface to allow a custom span exporter to participate in autoconfiguration.
For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSpanExporterProvider;
import io.opentelemetry.sdk.trace.export.SpanExporter;

public class CustomSpanExporterProvider implements ConfigurableSpanExporterProvider {

  @Override
  public SpanExporter createExporter(ConfigProperties config) {
    // Callback invoked when OTEL_TRACES_EXPORTER includes the value from getName().
    return new CustomSpanExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableMetricExporterProvider

Implement the
[ConfigurableMetricExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/metrics/ConfigurableMetricExporterProvider.html)
interface to allow a custom metric exporter to participate in autoconfiguration.
For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.metrics.ConfigurableMetricExporterProvider;
import io.opentelemetry.sdk.metrics.export.MetricExporter;

public class CustomMetricExporterProvider implements ConfigurableMetricExporterProvider {

  @Override
  public MetricExporter createExporter(ConfigProperties config) {
    // Callback invoked when OTEL_METRICS_EXPORTER includes the value from getName().
    return new CustomMetricExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableLogRecordExporterProvider

Implement the
[ConfigurableLogRecordExporterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/logs/ConfigurableLogRecordExporterProvider.html)
interface to allow a custom log record exporter to participate in
autoconfiguration. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordExporterProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.logs.ConfigurableLogRecordExporterProvider;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;

public class CustomLogRecordExporterProvider implements ConfigurableLogRecordExporterProvider {

  @Override
  public LogRecordExporter createExporter(ConfigProperties config) {
    // Callback invoked when OTEL_LOGS_EXPORTER includes the value from getName().
    return new CustomLogRecordExporter();
  }

  @Override
  public String getName() {
    return "custom-exporter";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurableSamplerProvider

Implement the
[ConfigurableSamplerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/traces/ConfigurableSamplerProvider.html)
interface to allow a custom sampler to participate in autoconfiguration. For
example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSamplerProvider.java"?>
```java
package otel;

import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.traces.ConfigurableSamplerProvider;
import io.opentelemetry.sdk.trace.samplers.Sampler;

public class CustomSamplerProvider implements ConfigurableSamplerProvider {

  @Override
  public Sampler createSampler(ConfigProperties config) {
    // Callback invoked when OTEL_TRACES_SAMPLER is set to the value from getName().
    return new CustomSampler();
  }

  @Override
  public String getName() {
    return "custom-sampler";
  }
}
```
<!-- prettier-ignore-end -->

##### ConfigurablePropagatorProvider

Implement the
[ConfigurablePropagatorProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-extension-autoconfigure-spi/latest/io/opentelemetry/sdk/autoconfigure/spi/ConfigurablePropagatorProvider.html)
interface to allow a custom propagator to participate in autoconfiguration. For
example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomTextMapPropagatorProvider.java"?>
```java
package otel;

import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigProperties;
import io.opentelemetry.sdk.autoconfigure.spi.ConfigurablePropagatorProvider;

public class CustomTextMapPropagatorProvider implements ConfigurablePropagatorProvider {
  @Override
  public TextMapPropagator getPropagator(ConfigProperties config) {
    // Callback invoked when OTEL_PROPAGATORS includes the value from getName().
    return new CustomTextMapPropagator();
  }

  @Override
  public String getName() {
    return "custom-propagator";
  }
}
```
<!-- prettier-ignore-end -->

### Declarative configuration

Declarative configuration is currently under development. It allows for YAML
file-based configuration as described in
[opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration)
and
[declarative configuration](/docs/specs/otel/configuration/#declarative-configuration).

To use, include
`io.opentelemetry:opentelemetry-sdk-extension-incubator:{{% param vers.otel %}}-alpha`
and specify the path to the config file as described in the table below.

| System property                 | Purpose                                 | Default |
| ------------------------------- | --------------------------------------- | ------- |
| `otel.experimental.config.file` | The path to the SDK configuration file. | Unset   |

{{% alert title="Note" color="warning" %}} When a config file is specified,
[environment variables and system properties](#environment-variables-and-system-properties)
are ignored, [programmatic customization](#programmatic-customization) and
[SPIs](#spi-service-provider-interface) are skipped. The contents of the file
alone dictate SDK configuration. {{% /alert %}}

For additional details, consult the following resources:

- [Usage documentation](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/incubator#declarative-configuration)
- [Example with Java agent](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent#declarative-configuration)
- [Example without Java agent](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/declarative-configuration)
