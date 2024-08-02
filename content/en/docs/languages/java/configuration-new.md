---
title: Configuration
linkTitle: Configuration
weight: 10
aliases: [config]
# prettier-ignore
cSpell:ignore: authservice blrp Dotel ignore LOWMEMORY myservice ottrace PKCS retryable tracepropagators
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

The [SDK](TODO) is the built-in reference implementation of the [API](TODO), processing and exporting telemetry produced by instrumentation API calls. Configuring the SDK to process and export appropriately is an essential step to integrating OpenTelemetry into an application.

All SDK components have [programmatic configuration APIs](#programmatic-configuration). This is the most flexible, expressive way to configure the SDK, but has downsides: Changing configuration requires adjusting code and recompiling the application. There is no language interoperability since the API is written in java. 

The [zero-code SDK autoconfigure](#zero-code-sdk-autoconfigure) module offers a compelling alternative, configuring SDK components based off system properties / environment variables, with various extension points for instances where the properties are insufficient. **We recommend the zero-code SDK autoconfigure module.** 

> The [Java Agent]() automatically configures the SDK using the zero-code SDK autoconfigure module, and uses it in the instrumentation it installs. All autoconfigure content is applicable to Java Agent users.

## Zero-code SDK autoconfigure

The autoconfigure module (`opentelemetry-sdk-extension-autoconfigure`) is a configuration interface built on top of the [programmatic configuration interface](#programmatic-configuration), which constructs [SDK](./sdk-new.md) components with zero code. There are two distinct autoconfigure workflows:

* [Environment variables and system properties](#environment-variables-and-system-properties) interprets environment variables and system properties to create SDK components, including various customization points for overlaying programmatic configuration.
* [Declarative configuration](#declarative-configuration) (**currently under development**) interprets a configuration model to create SDK components, which is typically encoded in a YAML configuration file.

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

### Environment variables and system properties

Generally, autoconfigure supports properties listed in the [environment variable configuration specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/configuration/sdk-environment-variables.md#opentelemetry-environment-variable-specification), with occasional experimental and java-specific additions.

**NOTE:** The properties are listed below as system properties, but can also be set via environment variables. Apply the following steps to convert a system property to
an environment variable:

* Convert the name to uppercase.
* Replace all `.` and `-` characters with `_`.

For example, the `otel.sdk.enabled` system property is equivalent to the `OTEL_SDK_ENABLED` environment variable.

If a property is defined as both a system property and environment variable, the system property takes priority.

#### Properties: general

| System property                            | Description                                                                                                                             | Default                      |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `otel.sdk.disabled`                        | If `true`, disable the OpenTelemetry SDK. **[1]**                                                                                       | `false`                      |
| `otel.service.name`                        | Specify logical service name. Takes precedence over `service.name` defined with `otel.resource.attributes`.                             | `unknown_service:java`       |
| `otel.resource.attributes`                 | Specify resource attributes in the following format: `key1=val1,key2=val2,key3=val3`.                                                   |                              |
| `otel.experimental.resource.disabled-keys` | Specify resource attribute keys that are filtered. This option is experimental and subject to change or removal.                        |                              |
| `otel.java.enabled.resource.providers`     | Comma separated list of `ResourceProvider` fully qualified class names to enable. **[2]** If unset, all resource providers are enabled. |                              |
| `otel.java.disabled.resource.providers`    | Comma separated list of `ResourceProvider` fully qualified class names to disable. **[2]**                                              |                              |
| `otel.attribute.value.length.limit`        | The maximum length of attribute values. Applies to spans and logs.                                                                      | No limit                     |
| `otel.attribute.count.limit`               | The maximum number of attributes. Applies to spans, span events, span links, and logs.                                                  | `128`                        |
| `otel.propagators`                         | Comma separated list of propagators. Known values include `tracecontext`, `baggage`, `b3`, `b3multi`,  `jaeger`, `ottrace`. **[3]**     | `tracecontext,baggage` (W3C) |

**[1]**: If disabled, `AutoConfiguredOpenTelemetrySdk#getOpenTelemetrySdk()` will return a minimally configured instance (i.e. `OpenTelemetrySdk.builder().build()`).

**[2]**: For example, to disable the [OS resource provider](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources/OsResourceProvider.java), set `-Dotel.java.disabled.resource.providers=io.opentelemetry.instrumentation.resources.OsResourceProvider`. See [ResourceProvider](#resourceprovider) for list of known resource providers.

**[1]**: Known propagators and artifacts:

* `tracecontext` configures `W3CTraceContextPropagator` and is built-in to `opentelemetry-api`.
* `baggage` configures `W3CBaggagePropagator` and is built-in to `opentelemetry-api`.
* `b3`, `b3multi` configures `B3Propagator` and requires to `opentelemetry-extension-trace-propagators`.
* `jaeger` configures `JaegerPropagator` and requires to `opentelemetry-extension-trace-propagators`.
* `ottrace` configures `OtTracePropagator` and requires to `opentelemetry-extension-trace-propagators`.
* `ottrace` configures `OtTracePropagator` and requires to `opentelemetry-extension-trace-propagators`.
* `xray` configures `AwsXrayPropagator` and requires to `opentelemetry-aws-xray-propagator`.
* `xray-lambda` configures `AwsXrayLambdaPropagator` and requires to `opentelemetry-aws-xray-propagator`.

#### Properties: traces

Properties for batch span processor(s) paired with exporters specified via `otel.traces.exporter`.

| System property                  | Description                                                     | Default |
|----------------------------------|-----------------------------------------------------------------|---------|
| `otel.bsp.schedule.delay`        | The interval, in milliseconds, between two consecutive exports. | `5000`  |
| `otel.bsp.max.queue.size`        | The maximum queue size.                                         | `2048`  |
| `otel.bsp.max.export.batch.size` | The maximum batch size.                                         | `512`   |
| `otel.bsp.export.timeout`        | The maximum allowed time, in milliseconds, to export data.      | `30000` |

Properties for configuring sampler.

| System property           | Description                                                                                                                                                                                 | Default                 |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|
| `otel.traces.sampler`     | The sampler to use. Known values include `always_on`, `always_off`, `traceidratio`, `parentbased_always_on`, `parentbased_always_off`, `parentbased_traceidratio`, `jaeger_remote`. **[1]** | `parentbased_always_on` |
| `otel.traces.sampler.arg` | An argument to the configured tracer if supported, for example a ratio.                                                                                                                     |                         |

**[1]**: Known samplers and artifacts:

* `always_on` configures `AlwaysOnSampler` and is built-in to `opentelemetry-sdk`.
* `always_off` configures `AlwaysOffSampler` and is built-in to `opentelemetry-sdk`.
* `traceidratio` configures `TraceIdRatioBased` and is built-in to `opentelemetry-sdk`. `otel.traces.sampler.arg` sets the ratio.
* `parentbased_always_on` configures `ParentBased(root=AlwaysOnSampler)` and is built-in to `opentelemetry-sdk`.
* `parentbased_always_off` configures `ParentBased(root=AlwaysOffSampler)` and is built-in to `opentelemetry-sdk`.
* `parentbased_traceidratio` configures `ParentBased(root=TraceIdRatioBased)` and is built-in to `opentelemetry-sdk`. `otel.traces.sampler.arg` sets the ratio.
* `jaeger_remote` configures `JaegerRemoteSampler` and requires `opentelemetry-sdk-extension-jaeger-remote-sampler`. `otel.traces.sampler.arg` is a comma-separated list of args as described in the [specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/configuration/sdk-environment-variables.md#general-sdk-configuration).

Properties for span limits.

| System property                          | Description                                                                                             | Default  |
|------------------------------------------|---------------------------------------------------------------------------------------------------------|----------|
| `otel.span.attribute.value.length.limit` | The maximum length of span attribute values. Takes precedence over `otel.attribute.value.length.limit`. | No limit |
| `otel.span.attribute.count.limit`        | The maximum number of attributes per span. Takes precedence over `otel.attribute.count.limit`.          | `128`    |
| `otel.span.event.count.limit`            | The maximum number of events per span.                                                                  | `128`    |
| `otel.span.link.count.limit`             | The maximum number of links per span.                                                                   | `128`    |

#### Properties: metrics

Properties for exemplars.

| System property                               | Description                                                                                                            | Default       |
|-----------------------------------------------|------------------------------------------------------------------------------------------------------------------------|---------------|
| `otel.metrics.exemplar.filter`                | The filter for exemplar sampling. Can be `ALWAYS_OFF`, `ALWAYS_ON` or `TRACE_BASED`.                                   | `TRACE_BASED` |

Properties for periodic metric reader.

| System property               | Description                                                              | Default |
|-------------------------------|--------------------------------------------------------------------------|---------|
| `otel.metric.export.interval` | The interval, in milliseconds, between the start of two export attempts. | `60000` |

Properties for cardinality limits.

| System property                               | Description                                                                                                                                                             | Default |
|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `otel.experimental.metrics.cardinality.limit` | If set, configure cardinality limit. The value dictates the maximum number of distinct points per metric. This option is experimental and subject to change or removal. | `2000`  |

#### Properties: logs

Properties for batch log record processor.

| System property                   | Description                                                     | Default |
|-----------------------------------|-----------------------------------------------------------------|---------|
| `otel.blrp.schedule.delay`        | The interval, in milliseconds, between two consecutive exports. | `1000`  |
| `otel.blrp.max.queue.size`        | The maximum queue size.                                         | `2048`  |
| `otel.blrp.max.export.batch.size` | The maximum batch size.                                         | `512`   |
| `otel.blrp.export.timeout`        | The maximum allowed time, in milliseconds, to export data.      | `30000` |

#### Properties: exporters

> These configuration options require the appropriate exporter artifact `opentelemetry-exporter-{exporter}` to be included when using (see [list of available exporters](https://github.com/open-telemetry/opentelemetry-java#sdk-exporters)).

| System property                               | Purpose                                                                                                                                                                                                                              | Default          |
|-----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| `otel.traces.exporter`                        | Comma separated list of span exporters. Known values include `otlp`, `zipkin`, `console`, `logging-otlp`, `none`. **[1]**                                                                                                            | `otlp`           |
| `otel.metrics.exporter`                       | Comma separated list of metric exporters. Known values include `otlp`, `prometheus`, `none`. **[1]**                                                                                                                                 | `otlp`           |
| `otel.logs.exporter`                          | Comma separated list of log record exporters. Known values include `otlp`, `console`, `logging-otlp`, `none`. **[1]**                                                                                                                | `otlp`           |
| `otel.java.experimental.exporter.memory_mode` | If `reusable_data`, enable reusable memory mode (on exporters which support it) to reduce allocations. Known values include `reusable_data`, `immutable_data`. This option is experimental and subject to change or removal. **[2]** | `immutable_data` |

**[1]**: Known exporters and artifacts:

* `otlp` configures `OtlpHttp{Signal}Exporter` / `OtlpGrpc{Signal}Exporter` and requires `opentelemetry-exporter-otlp`.
* `zipkin` configures `ZipkinSpanExporter` and requires `opentelemetry-exporter-zipkin`.
* `console` configures `LoggingSpanExporter`, `LoggingMetricExporter`, `SystemOutLogRecordExporter` and requires `opentelemetry-exporter-logging`.
* `logging-otlp` configures `OtlpJsonLogging{Signal}Exporter` and requires `opentelemetry-exporter-logging-otlp`.

**[2]**: Exporters which adhere to `otel.java.experimental.exporter.memory_mode=reusable_data` are `OtlpGrpc{Signal}Exporter`, `OtlpHttp{Signal}Exporter`, and `PrometheusHttpServer`.

Properties for `otlp` span, metric, and log exporters.

| System property                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                          | Default                                                                                                                    |
|------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `otel.{signal}.exporter=otlp`                              | Select the OpenTelemetry exporter for {signal}.                                                                                                                                                                                                                                                                                                                                                                                      |                                                                                                                            |
| `otel.exporter.otlp.protocol`                              | The transport protocol to use on OTLP trace, metric, and log requests. Options include `grpc` and `http/protobuf`.                                                                                                                                                                                                                                                                                                                   | `grpc` **[1]**                                                                                                             |
| `otel.exporter.otlp.{signal}.protocol`                     | The transport protocol to use on OTLP {signal} requests. Options include `grpc` and `http/protobuf`.                                                                                                                                                                                                                                                                                                                                 | `grpc` **[1]**                                                                                                             |
| `otel.exporter.otlp.endpoint`                              | The endpoint to send all OTLP traces, metrics, and logs to. Often the address of an OpenTelemetry Collector. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. If protocol is `http/protobuf` the version and signal will be appended to the path (e.g. `v1/traces`, `v1/metrics`, or `v1/logs`).                                                                                                     | `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/{signal}` when protocol is `http/protobuf`. |
| `otel.exporter.otlp.{signal}.endpoint`                     | The endpoint to send OTLP {signal} to. Often the address of an OpenTelemetry Collector. Must be a URL with a scheme of either `http` or `https` based on the use of TLS.                                                                                                                                                                                                                                                             | `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/{signal}` when protocol is `http/protobuf`. |
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
| `otel.experimental.exporter.otlp.retry.enabled`            | If `true`, enable [retry support](#otlp-exporter-retry) **[2]**                                                                                                                                                                                                                                                                                                                                                                      | `false`                                                                                                                    |

**[1]**: OpenTelemetry Java agent 2.x uses `http/protobuf` by default.

**[2]**: [OTLP](/docs/specs/otlp/#otlpgrpc-response) requires that [transient](/docs/specs/otel/protocol/exporter/#retry) errors be handled with a retry strategy. When retry is enabled, retryable gRPC status codes are retried using an exponential backoff with jitter algorithm. The specific options of [RetryPolicy](TODO) can only be customized via [programmatic customization](#programmatic-customization).

Properties for `zipkin` span exporter.

| System property                 | Description                                                | Default                              |
|---------------------------------|------------------------------------------------------------|--------------------------------------|
| `otel.traces.exporter=zipkin`   | Select the Zipkin exporter                                 |                                      |
| `otel.exporter.zipkin.endpoint` | The Zipkin endpoint to connect to. Only HTTP is supported. | `http://localhost:9411/api/v2/spans` |

Properties for `prometheus` metric exporter.

| System property                    | Description                                                  | Default   |
|------------------------------------|--------------------------------------------------------------|-----------|
| `otel.metrics.exporter=prometheus` | Select the Prometheus exporter                               |           |
| `otel.exporter.prometheus.port`    | The local port used to bind the prometheus metric server.    | `9464`    |
| `otel.exporter.prometheus.host`    | The local address used to bind the prometheus metric server. | `0.0.0.0` |

#### Programmatic customization

Programmatic customization provides hooks to supplement the [supported properties](#supported-properties) with [programmatic configuration](#programmatic-configuration).

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

[SPIs](https://docs.oracle.com/javase/tutorial/sound/SPI-intro.html) extends SDK autoconfiguration beyond the built-in components. The following SPIs are available:

* [ResourceProvider](#resourceprovider)s contribute to the autoconfigured resource.
* [AutoConfigurationCustomizerProvider](#TODO)s customize a variety of autoconfigured SDK components.
* [ConfigurableSpanExporterProvider](#TODO)s allow custom span exporters to participate in autoconfiguration.
* [ConfigurableMetricExporterProvider](#TODO)s allow custom metric exporters to participate in autoconfiguration.
* [ConfigurableLogRecordExporterProvider](#TODO)s allow custom log record exporters to participate in autoconfiguration.
* [ConfigurableSamplerProvider](#TODO)s allow custom samplers to participate in autoconfiguration.
* [ConfigurablePropagatorProvider](#TODO)s allow custom context propagators to participate in autoconfiguration.

##### ResourceProvider

Implement the `ResourceProvider`s to contribute to the autoconfigured resource.

The following built-in resource providers are provided:

* [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/resources/library/src/main/java/io/opentelemetry/instrumentation/resources) includes variety of resource providers for common cases.

The following resource providers are maintained by the community via `opentelemetry-java-contrib`:

* [aws-resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-resources/src/main/java/io/opentelemetry/contrib/aws/resource) includes variety of resource providers for AWS environments.
* [gcp-resources](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-resources) includes variety of resource providers for GCP environments.

For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomResourceprovider.java"?>
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

Implement the `AutoConfigurationCustomizerProvider` interface to customize a variety of autoconfigured SDK components. For example:

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

Implement the `ConfigurableSpanExporterProvider` interface to allow a custom span exporter to participate in autoconfiguration. For example:

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

Implement the `ConfigurableMetricExporterProvider` interface to allow a custom metric exporter to participate in autoconfiguration. For example:

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

Implement the `ConfigurableLogRecordExporterProvider` interface to allow a custom log record exporter to participate in autoconfiguration. For example:

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

Implement the `ConfigurableSamplerProvider` interface to allow a custom sampler to participate in autoconfiguration. For example:

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

Implement the `ConfigurablePropagatorProvider` interface to allow a custom propagator to participate in autoconfiguration. For example:

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

Declarative configuration is currently under development. For details, consult the following resources:

* [Usage documentation](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/incubator#file-configuration)
* [Example with Java Agent](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent#file-configuration)
* [Example without Java Agent](https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/file-configuration)

## Programmatic configuration

The programmatic configuration interface is the set of APIs for constructing [SDK](./sdk-new.md) components. All SDK components have a programmatic configuration API, and all other configuration mechanisms are built on top of this API. For example, the [autoconfigure environment variable](#environment-variable) configuration interface interprets well-known environment into a series of calls to the programmatic configuration API. 

While other configuration mechanisms offer more convenience, none offer the flexibility of writing code expressing the precise configuration required. When a particular capability isn't supported by a higher order configuration mechanism, you may have no choice but to use programmatic configuration.

The following sections summarize the programmatic configuration API for the key areas of the SDK. For an exhaustive set of the available configuration APIs, consult the code.

### OpenTelemetrySdk

See [OpenTelemetrySdk](./sdk-new.md#opentelemetrysdk) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OpenTelemetrySdkConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.resources.Resource;

public class OpenTelemetrySdkConfig {
  public static OpenTelemetrySdk create() {
    Resource resource = ResourceConfig.create();
    return OpenTelemetrySdk.builder()
        .setTracerProvider(SdkTracerProviderConfig.create(resource))
        .setMeterProvider(SdkMeterProviderConfig.create(resource))
        .setLoggerProvider(SdkLoggerProviderConfig.create(resource))
        .setPropagators(ContextPropagatorsConfig.create())
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### Resource

See [Resource](./sdk-new.md#resource) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ResourceConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.semconv.ServiceAttributes;

public class ResourceConfig {
  public static Resource create() {
    return Resource.getDefault().toBuilder()
        .put(ServiceAttributes.SERVICE_NAME, "my-service")
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### SdkTracerProvider

See [SdkTracerProvider](./sdk-new.md#sdktracerprovider) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SdkTracerProviderConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;

public class SdkTracerProviderConfig {
  public static SdkTracerProvider create(Resource resource) {
    return SdkTracerProvider.builder()
        .setResource(resource)
        .addSpanProcessor(
            SpanProcessorConfig.batchSpanProcessor(
                SpanExporterConfig.otlpHttpSpanExporter("http://localhost:4318/v1/spans")))
        .setSampler(SamplerConfig.parentBasedSampler(SamplerConfig.traceIdRatioBased(.25)))
        .setSpanLimits(SpanLimitsConfig::spanLimits)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

#### Sampler

See [Sampler](./sdk-new.md#sampler) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SamplerConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.extension.trace.jaeger.sampler.JaegerRemoteSampler;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import java.time.Duration;

public class SamplerConfig {
  public static Sampler parentBasedSampler(Sampler root) {
    return Sampler.parentBasedBuilder(root)
        .setLocalParentNotSampled(Sampler.alwaysOff())
        .setLocalParentSampled(Sampler.alwaysOn())
        .setRemoteParentNotSampled(Sampler.alwaysOff())
        .setRemoteParentSampled(Sampler.alwaysOn())
        .build();
  }

  public static Sampler alwaysOn() {
    return Sampler.alwaysOn();
  }

  public static Sampler alwaysOff() {
    return Sampler.alwaysOff();
  }

  public static Sampler traceIdRatioBased(double ratio) {
    return Sampler.traceIdRatioBased(ratio);
  }

  public static Sampler jaegerRemoteSampler() {
    return JaegerRemoteSampler.builder()
        .setInitialSampler(Sampler.alwaysOn())
        .setEndpoint("http://endpoint")
        .setPollingInterval(Duration.ofSeconds(60))
        .setServiceName("my-service-name")
        .build();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanProcessor

See [SpanProcessor](./sdk-new.md#spanprocessor) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanProcessorConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.trace.SpanProcessor;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import java.time.Duration;

public class SpanProcessorConfig {
  public static SpanProcessor batchSpanProcessor(SpanExporter spanExporter) {
    return BatchSpanProcessor.builder(spanExporter)
        .setMaxQueueSize(2048)
        .setExporterTimeout(Duration.ofSeconds(30))
        .setScheduleDelay(Duration.ofSeconds(5))
        .build();
  }

  public static SpanProcessor simpleSpanProcessor(SpanExporter spanExporter) {
    return SimpleSpanProcessor.builder(spanExporter).build();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanExporter

See [SpanExporter](./sdk-new.md#spanexporter) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanExporterConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.logging.LoggingSpanExporter;
import io.opentelemetry.exporter.logging.otlp.OtlpJsonLoggingSpanExporter;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import java.time.Duration;

public class SpanExporterConfig {
  public static SpanExporter otlpHttpSpanExporter(String endpoint) {
    return OtlpHttpSpanExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static SpanExporter otlpGrpcSpanExporter(String endpoint) {
    return OtlpGrpcSpanExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static SpanExporter logginSpanExporter() {
    return LoggingSpanExporter.create();
  }

  public static SpanExporter otlpJsonLoggingSpanExporter() {
    return OtlpJsonLoggingSpanExporter.create();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanLimits

See [SpanLimits](./sdk-new.md#spanlimits) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SpanLimitsConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.trace.SpanLimits;

public class SpanLimitsConfig {
  public static SpanLimits spanLimits() {
    return SpanLimits.builder()
        .setMaxNumberOfAttributes(128)
        .setMaxAttributeValueLength(1024)
        .setMaxNumberOfLinks(128)
        .setMaxNumberOfAttributesPerLink(128)
        .setMaxNumberOfEvents(128)
        .setMaxNumberOfAttributesPerEvent(128)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### SdkMeterProvider

See [SdkMeterProvider](./sdk-new.md#sdkmeterprovider) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SdkMeterProviderConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.SdkMeterProviderBuilder;
import io.opentelemetry.sdk.resources.Resource;
import java.util.List;
import java.util.Set;

public class SdkMeterProviderConfig {
  public static SdkMeterProvider create(Resource resource) {
    SdkMeterProviderBuilder builder =
        SdkMeterProvider.builder()
            .setResource(resource)
            .registerMetricReader(
                MetricReaderConfig.periodicMetricReader(
                    MetricExporterConfig.otlpHttpMetricExporter(
                        "http://localhost:4318/v1/metrics")));
    ViewConfig.dropMetricView(builder, "some.custom.metric");
    ViewConfig.histogramBucketBoundariesView(
        builder, "http.server.request.duration", List.of(1.0, 5.0, 10.0));
    ViewConfig.attributeFilterView(
        builder, "http.client.request.duration", Set.of("http.request.method"));
    return builder.build();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricReader

See [MetricReader](./sdk-new.md#metricreader) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MetricReaderConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.prometheus.PrometheusHttpServer;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import io.opentelemetry.sdk.metrics.export.MetricReader;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import java.time.Duration;

public class MetricReaderConfig {
  public static MetricReader periodicMetricReader(MetricExporter metricExporter) {
    return PeriodicMetricReader.builder(metricExporter).setInterval(Duration.ofSeconds(60)).build();
  }

  public static MetricReader prometheusMetricReader() {
    return PrometheusHttpServer.builder().setHost("localhost").setPort(9464).build();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricExporter

See [MetricExporter](./sdk-new.md#metricexporter) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/MetricExporterConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.logging.LoggingMetricExporter;
import io.opentelemetry.exporter.logging.otlp.OtlpJsonLoggingMetricExporter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.exporter.otlp.metrics.OtlpGrpcMetricExporter;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import java.time.Duration;

public class MetricExporterConfig {
  public static MetricExporter otlpHttpMetricExporter(String endpoint) {
    return OtlpHttpMetricExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static MetricExporter otlpGrpcMetricExporter(String endpoint) {
    return OtlpGrpcMetricExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static MetricExporter logginMetricExporter() {
    return LoggingMetricExporter.create();
  }

  public static MetricExporter otlpJsonLoggingMetricExporter() {
    return OtlpJsonLoggingMetricExporter.create();
  }
}
```
<!-- prettier-ignore-end -->

#### Views

See [Views](./sdk-new.md#views) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ViewConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentSelector;
import io.opentelemetry.sdk.metrics.SdkMeterProviderBuilder;
import io.opentelemetry.sdk.metrics.View;
import java.util.List;
import java.util.Set;

public class ViewConfig {
  public static SdkMeterProviderBuilder dropMetricView(
      SdkMeterProviderBuilder builder, String metricName) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder().setAggregation(Aggregation.drop()).build());
  }

  public static SdkMeterProviderBuilder histogramBucketBoundariesView(
      SdkMeterProviderBuilder builder, String metricName, List<Double> bucketBoundaries) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder()
            .setAggregation(Aggregation.explicitBucketHistogram(bucketBoundaries))
            .build());
  }

  public static SdkMeterProviderBuilder attributeFilterView(
      SdkMeterProviderBuilder builder, String metricName, Set<String> keysToRetain) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder().setAttributeFilter(keysToRetain).build());
  }
}
```
<!-- prettier-ignore-end -->

### SdkLoggerProvider

See [SdkLoggerProvider](./sdk-new.md#sdkloggerprovider) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/SdkLoggerProviderConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.logs.SdkLoggerProvider;
import io.opentelemetry.sdk.resources.Resource;

public class SdkLoggerProviderConfig {
  public static SdkLoggerProvider create(Resource resource) {
    return SdkLoggerProvider.builder()
        .setResource(resource)
        .addLogRecordProcessor(
            LogRecordProcessorConfig.batchLogRecordProcessor(
                LogRecordExporterConfig.otlpHttpLogRecordExporter("http://localhost:4318/v1/logs")))
        .setLogLimits(LogLimitsConfig::logLimits)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

#### LogRecordProcessor

See [LogRecordProcessor](./sdk-new.md#logrecordprocessor) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogRecordProcessorConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.logs.LogRecordProcessor;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import io.opentelemetry.sdk.logs.export.SimpleLogRecordProcessor;
import java.time.Duration;

public class LogRecordProcessorConfig {
  public static LogRecordProcessor batchLogRecordProcessor(LogRecordExporter logRecordExporter) {
    return BatchLogRecordProcessor.builder(logRecordExporter)
        .setMaxQueueSize(2048)
        .setExporterTimeout(Duration.ofSeconds(30))
        .setScheduleDelay(Duration.ofSeconds(1))
        .build();
  }

  public static LogRecordProcessor simpleLogRecordProcessor(LogRecordExporter logRecordExporter) {
    return SimpleLogRecordProcessor.create(logRecordExporter);
  }
}
```
<!-- prettier-ignore-end -->

#### LogRecordExporter

See [LogRecordExporter](./sdk-new.md#logrecordexporter) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogRecordExporterConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.logging.SystemOutLogRecordExporter;
import io.opentelemetry.exporter.logging.otlp.OtlpJsonLoggingLogRecordExporter;
import io.opentelemetry.exporter.otlp.http.logs.OtlpHttpLogRecordExporter;
import io.opentelemetry.exporter.otlp.logs.OtlpGrpcLogRecordExporter;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import java.time.Duration;

public class LogRecordExporterConfig {
  public static LogRecordExporter otlpHttpLogRecordExporter(String endpoint) {
    return OtlpHttpLogRecordExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static LogRecordExporter otlpGrpcLogRecordExporter(String endpoint) {
    return OtlpGrpcLogRecordExporter.builder()
        .setEndpoint(endpoint)
        .addHeader("api-key", "value")
        .setTimeout(Duration.ofSeconds(10))
        .build();
  }

  public static LogRecordExporter systemOutLogRecordExporter() {
    return SystemOutLogRecordExporter.create();
  }

  public static LogRecordExporter otlpJsonLoggingLogRecordExporter() {
    return OtlpJsonLoggingLogRecordExporter.create();
  }
}
```
<!-- prettier-ignore-end -->

#### LogLimits

See [LogLimits](./sdk-new.md#loglimits) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/LogLimitsConfig.java"?>
```java
package otel;

import io.opentelemetry.sdk.logs.LogLimits;

public class LogLimitsConfig {
  public static LogLimits logLimits() {
    return LogLimits.builder()
        .setMaxNumberOfAttributes(128)
        .setMaxAttributeValueLength(1024)
        .build();
  }
}
```
<!-- prettier-ignore-end -->

### ContextPropagators

See [ContextPropagators](./sdk-new.md#contextpropagators) for a conceptual overview.

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/ContextPropagatorsConfig.java"?>
```java
package otel;

import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;

public class ContextPropagatorsConfig {
  public static ContextPropagators create() {
    return ContextPropagators.create(
        TextMapPropagator.composite(
            W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance()));
  }
}
```
<!-- prettier-ignore-end -->
