---
title: Manage Telemetry with SDK
weight: 12
aliases: [exporters]
cSpell:ignore: autoconfigured FQCNs Interceptable Logback okhttp
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

The SDK is the built-in reference implementation of the [API](../api/),
processing and exporting telemetry produced by instrumentation API calls. This
page is a conceptual overview of the SDK, including descriptions, links to
relevant Javadocs, artifact coordinates, sample programmatic configurations and
more. See **[Configure the SDK](../configuration/)** for details on SDK
configuration, including
[zero-code SDK autoconfigure](../configuration/#zero-code-sdk-autoconfigure).

The SDK consists of the following top level components:

- [SdkTracerProvider](#sdktracerprovider): The SDK implementation of
  `TracerProvider`, including tools for sampling, processing, and exporting
  spans.
- [SdkMeterProvider](#sdkmeterprovider): The SDK implementation of
  `MeterProvider`, including tools for configuring metric streams and reading /
  exporting metrics.
- [SdkLoggerProvider](#sdkloggerprovider): The SDK implementation of
  `LoggerProvider`, including tools for processing and exporting logs.
- [TextMapPropagator](#textmappropagator): Propagates context across process
  boundaries.

These are combined into [OpenTelemetrySdk](#opentelemetrysdk), a carrier object
which makes it convenient to pass fully-configured
[SDK components](#sdk-components) to instrumentation.

The SDK comes packaged with a variety of built-in components which are
sufficient for many use cases, and supports
[plugin interfaces](#sdk-plugin-extension-interfaces) for extensibility.

## SDK plugin extension interfaces

When built-in components are insufficient, the SDK can be extended by
implementing various plugin extension interfaces:

- [Sampler](#sampler): Configures which spans are recorded and sampled.
- [SpanProcessor](#spanprocessor): Processes spans when they start and end.
- [SpanExporter](#spanexporter): Exports spans out of process.
- [MetricReader](#metricreader): Reads aggregated metrics.
- [MetricExporter](#metricexporter): Exports metrics out of process.
- [LogRecordProcessor](#logrecordprocessor): Processes log records when they are
  emitted.
- [LogRecordExporter](#logrecordexporter): Exports log records out of process.
- [TextMapPropagator](#textmappropagator): Propagates context across process
  boundaries.

## SDK components

The `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}` artifact
contains the OpenTelemetry SDK.

The following sections describe the core user-facing components of the SDK. Each
component section includes:

- A brief description, including a link to the Javadoc type reference.
- If the component is a
  [plugin extension interface](#sdk-plugin-extension-interfaces), a table of
  available built-in and `opentelemetry-java-contrib` implementations.
- A simple demonstration of
  [programmatic-configuration](../configuration/#programmatic-configuration).
- If the component is a
  [plugin extension interface](#sdk-plugin-extension-interfaces), a simple
  demonstration of a custom implementation.

### OpenTelemetrySdk

[OpenTelemetrySdk](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk/latest/io/opentelemetry/sdk/OpenTelemetrySdk.html)
is the SDK implementation of [OpenTelemetry](../api/#opentelemetry). It is a
holder for top-level SDK components which makes it convenient to pass
fully-configured SDK components to instrumentation.

`OpenTelemetrySdk` is configured by the application owner, and consists of:

- [SdkTracerProvider](#sdktracerprovider): The SDK implementation of
  `TracerProvider`.
- [SdkMeterProvider](#sdkmeterprovider): The SDK implementation of
  `MeterProvider`.
- [SdkLoggerProvider](#sdkloggerprovider): The SDK implementation of
  `LoggerProvider`.
- [ContextPropagators](#textmappropagator): Propagates context across process
  boundaries.

The following code snippet demonstrates `OpenTelemetrySdk` programmatic
configuration:

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

[Resource](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-common/latest/io/opentelemetry/sdk/resources/Resource.html)
is a set of attributes defining the telemetry source. An application should
associate the same resource with [SdkTracerProvider](#sdktracerprovider),
[SdkMeterProvider](#sdkmeterprovider), [SdkLoggerProvider](#sdkloggerprovider).

{{% alert color="info" %}}
[ResourceProviders](../configuration/#resourceprovider) contribute contextual
information to the
[autoconfigured](../configuration/#zero-code-sdk-autoconfigure) resource based
on the environment. See documentation for list of available `ResourceProvider`s.
{{% /alert %}}

The following code snippet demonstrates `Resource` programmatic configuration:

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

[SdkTracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SdkTracerProvider.html)
is the SDK implementation of [TracerProvider](../api/#tracerprovider), and is
responsible for handling trace telemetry produced by the API.

`SdkTracerProvider` is configured by the application owner, and consists of:

- [Resource](#resource): The resource spans are associated with.
- [Sampler](#sampler): Configures which spans are recorded and sampled.
- [SpanProcessors](#spanprocessor): Processes spans when they start and end.
- [SpanExporters](#spanexporter): Exports spans out of process (in conjunction
  with associated with `SpanProcessor`s).
- [SpanLimits](#spanlimits): Controls the limits of data associated with spans.

The following code snippet demonstrates `SdkTracerProvider` programmatic
configuration:

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

A
[Sampler](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/samplers/Sampler.html)
is a [plugin extension interface](#sdk-plugin-extension-interfaces) responsible
for determining which spans are recorded and sampled.

{{% alert color="info" %}} By default `SdkTracerProvider` is configured with the
`ParentBased(root=AlwaysOn)` sampler. This results in 100% of spans being
sampled if unless a calling application performs sampling. If this is too noisy
/ expensive, change the sampler. {{% /alert %}}

Samplers built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                     | Artifact                                                                                      | Description                                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ParentBased`             | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Samples spans based on sampling status of the span's parent.                                                                              |
| `AlwaysOn`                | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Samples all spans.                                                                                                                        |
| `AlwaysOff`               | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Drops all spans.                                                                                                                          |
| `TraceIdRatioBased`       | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                  | Samples spans based on a configurable ratio.                                                                                              |
| `JaegerRemoteSampler`     | `io.opentelemetry:opentelemetry-sdk-extension-jaeger-remote-sampler:{{% param vers.otel %}}`  | Samples spans based on configuration from a remote server.                                                                                |
| `LinksBasedSampler`       | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | Samples spans based on sampling status of the span's links.                                                                               |
| `RuleBasedRoutingSampler` | `io.opentelemetry.contrib:opentelemetry-samplers:{{% param vers.contrib %}}-alpha`            | Samples spans based on configurable rules.                                                                                                |
| `ConsistentSamplers`      | `io.opentelemetry.contrib:opentelemetry-consistent-sampling:{{% param vers.contrib %}}-alpha` | Various consistent sampler implementations as defined by [probability sampling](/docs/specs/otel/trace/tracestate-probability-sampling/). |

The following code snippet demonstrates `Sampler` programmatic configuration:

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

Implement the `Sampler` interface to provide your own custom sampling logic. For
example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSampler.java"?>
```java
package otel;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.trace.data.LinkData;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import io.opentelemetry.sdk.trace.samplers.SamplingResult;
import java.util.List;

public class CustomSampler implements Sampler {
  @Override
  public SamplingResult shouldSample(
      Context parentContext,
      String traceId,
      String name,
      SpanKind spanKind,
      Attributes attributes,
      List<LinkData> parentLinks) {
    // Callback invoked when span is started, before any SpanProcessor is called.
    // If the SamplingDecision is:
    // - DROP: the span is dropped. A valid span context is created and SpanProcessor#onStart is
    // still called, but no data is recorded and SpanProcessor#onEnd is not called.
    // - RECORD_ONLY: the span is recorded but not sampled. Data is recorded to the span,
    // SpanProcessor#onStart and SpanProcessor#onEnd are called, but the span's sampled status
    // indicates it should not be exported out of process.
    // - RECORD_AND_SAMPLE: the span is recorded and sampled. Data is recorded to the span,
    // SpanProcessor#onStart and SpanProcessor#onEnd are called, and the span's sampled status
    // indicates it should be exported out of process.
    return SpanKind.SERVER == spanKind ? SamplingResult.recordAndSample() : SamplingResult.drop();
  }

  @Override
  public String getDescription() {
    // Return a description of the sampler.
    return this.getClass().getSimpleName();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanProcessor

A
[SpanProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanProcessor.html)
is a [plugin extension interface](#sdk-plugin-extension-interfaces) with
callbacks invoked when a span is started and ended. They are often paired with
[SpanExporters](#spanexporter) to export spans out of process, but have other
applications such as data enrichment.

Span processors built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                     | Artifact                                                                                    | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `BatchSpanProcessor`      | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | Batches sampled spans and exports them via a configurable `SpanExporter`. |
| `SimpleSpanProcessor`     | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                                | Exports each sampled span via a configurable `SpanExporter`.              |
| `BaggageSpanProcessor`    | `io.opentelemetry.contrib:opentelemetry-baggage-processor:{{% param vers.contrib %}}-alpha` | Enriches spans with baggage.                                              |
| `JfrSpanProcessor`        | `io.opentelemetry.contrib:opentelemetry-jfr-events:{{% param vers.contrib %}}-alpha`        | Creates JFR events from spans.                                            |
| `StackTraceSpanProcessor` | `io.opentelemetry.contrib:opentelemetry-span-stacktrace:{{% param vers.contrib %}}-alpha`   | Enriches select spans with stack trace data.                              |
| `InferredSpansProcessor`  | `io.opentelemetry.contrib:opentelemetry-inferred-spans:{{% param vers.contrib %}}-alpha`    | Generates spans from async profiler instead of instrumentation.           |

The following code snippet demonstrates `SpanProcessor` programmatic
configuration:

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

Implement the `SpanProcessor` interface to provide your own custom span
processing logic. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanProcessor.java"?>
```java
package otel;

import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.ReadWriteSpan;
import io.opentelemetry.sdk.trace.ReadableSpan;
import io.opentelemetry.sdk.trace.SpanProcessor;

public class CustomSpanProcessor implements SpanProcessor {

  @Override
  public void onStart(Context parentContext, ReadWriteSpan span) {
    // Callback invoked when span is started.
    // Enrich the record with a custom attribute.
    span.setAttribute("my.custom.attribute", "hello world");
  }

  @Override
  public boolean isStartRequired() {
    // Indicate if onStart should be called.
    return true;
  }

  @Override
  public void onEnd(ReadableSpan span) {
    // Callback invoked when span is ended.
  }

  @Override
  public boolean isEndRequired() {
    // Indicate if onEnd should be called.
    return false;
  }

  @Override
  public CompletableResultCode shutdown() {
    // Optionally shutdown the processor and cleanup any resources.
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Optionally process any records which have been queued up but not yet processed.
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanExporter

A
[SpanExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/export/SpanExporter.html)
is a [plugin extension interface](#sdk-plugin-extension-interfaces) responsible
for exporting spans out of process. Rather than directly registering with
`SdkTracerProvider`, they are paired with [SpanProcessors](#spanprocessor)
(typically `BatchSpanProcessor`).

Span exporters built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                          | Artifact                                                                                 | Description                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `OtlpHttpSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | Exports spans via OTLP `http/protobuf`.                                       |
| `OtlpGrpcSpanExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`                   | Exports spans via OTLP `grpc`.                                                |
| `LoggingSpanExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`                | Logs spans to JUL in a debugging format.                                      |
| `OtlpJsonLoggingSpanExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | Logs spans to JUL in an OTLP JSON encoding.                                   |
| `OtlpStdoutSpanExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`           | Logs spans to `System.out` in the OTLP [JSON file encoding][] (experimental). |
| `ZipkinSpanExporter`           | `io.opentelemetry:opentelemetry-exporter-zipkin:{{% param vers.otel %}}`                 | Export spans to Zipkin.                                                       |
| `InterceptableSpanExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha`     | Passes spans to a flexible interceptor before exporting.                      |
| `KafkaSpanExporter`            | `io.opentelemetry.contrib:opentelemetry-kafka-exporter:{{% param vers.contrib %}}-alpha` | Exports spans by writing to a Kafka topic.                                    |

**[1]**: See [OTLP exporters](#otlp-exporters) for implementation details.

The following code snippet demonstrates `SpanExporter` programmatic
configuration:

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

Implement the `SpanExporter` interface to provide your own custom span export
logic. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomSpanExporter.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import java.util.Collection;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomSpanExporter implements SpanExporter {

  private static final Logger logger = Logger.getLogger(CustomSpanExporter.class.getName());

  @Override
  public CompletableResultCode export(Collection<SpanData> spans) {
    // Export the records. Typically, records are sent out of process via some network protocol, but
    // we simply log for illustrative purposes.
    logger.log(Level.INFO, "Exporting spans");
    spans.forEach(span -> logger.log(Level.INFO, "Span: " + span));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // Export any records which have been queued up but not yet exported.
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Shutdown the exporter and cleanup any resources.
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### SpanLimits

[SpanLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SpanLimits.html)
defines constraints for the data captured by spans, including max attribute
length, max number of attributes, and more.

The following code snippet demonstrates `SpanLimits` programmatic configuration:

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

[SdkMeterProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/SdkMeterProvider.html)
is the SDK implementation of [MeterProvider](../api/#meterprovider), and is
responsible for handling metric telemetry produced by the API.

`SdkMeterProvider` is configured by the application owner, and consists of:

- [Resource](#resource): The resource metrics are associated with.
- [MetricReader](#metricreader): Reads the aggregated state of metrics.
  - Optionally, with
    [CardinalityLimitSelector](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/CardinalityLimitSelector.html)
    for overriding cardinality limit by instrument kind. If unset, each
    instrument is limited to 2000 unique combinations of attributes per
    collection cycle. Cardinality limits are also configurable for individual
    instruments via [views](#views). See
    [cardinality limits](/docs/specs/otel/metrics/sdk/#cardinality-limits) for
    more details.
- [MetricExporter](#metricexporter): Exports metrics out of process (in
  conjunction with associated `MetricReader`).
- [Views](#views): Configures metric streams, including dropping unused metrics.

The following code snippet demonstrates `SdkMeterProvider` programmatic
configuration:

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
    // Uncomment to optionally register metric reader with cardinality limits
    // builder.registerMetricReader(
    //     MetricReaderConfig.periodicMetricReader(
    //         MetricExporterConfig.otlpHttpMetricExporter("http://localhost:4318/v1/metrics")),
    //     instrumentType -> 100);

    ViewConfig.dropMetricView(builder, "some.custom.metric");
    ViewConfig.histogramBucketBoundariesView(
        builder, "http.server.request.duration", List.of(1.0, 5.0, 10.0));
    ViewConfig.attributeFilterView(
        builder, "http.client.request.duration", Set.of("http.request.method"));
    ViewConfig.cardinalityLimitsView(builder, "http.server.active_requests", 100);
    return builder.build();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricReader

A
[MetricReader](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricReader.html)
is a [plugin extension interface](#sdk-plugin-extension-interfaces) which is
responsible for reading aggregated metrics. They are often paired with
[MetricExporters](#metricexporter) to export metrics out of process, but may
also be used to serve the metrics to external scrapers in pull-based protocols.

Metric readers built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                  | Artifact                                                                           | Description                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `PeriodicMetricReader` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                       | Reads metrics on a periodic basis and exports them via a configurable `MetricExporter`. |
| `PrometheusHttpServer` | `io.opentelemetry:opentelemetry-exporter-prometheus:{{% param vers.otel %}}-alpha` | Serves metrics on an HTTP server in various prometheus formats.                         |

The following code snippet demonstrates `MetricReader` programmatic
configuration:

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

Implement the `MetricReader` interface to provide your own custom metric reader
logic. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricReader.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.common.export.MemoryMode;
import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentType;
import io.opentelemetry.sdk.metrics.data.AggregationTemporality;
import io.opentelemetry.sdk.metrics.export.AggregationTemporalitySelector;
import io.opentelemetry.sdk.metrics.export.CollectionRegistration;
import io.opentelemetry.sdk.metrics.export.MetricReader;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomMetricReader implements MetricReader {

  private static final Logger logger = Logger.getLogger(CustomMetricExporter.class.getName());

  private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
  private final AtomicReference<CollectionRegistration> collectionRef =
      new AtomicReference<>(CollectionRegistration.noop());

  @Override
  public void register(CollectionRegistration collectionRegistration) {
    // Callback invoked when SdkMeterProvider is initialized, providing a handle to collect metrics.
    collectionRef.set(collectionRegistration);
    executorService.scheduleWithFixedDelay(this::collectMetrics, 0, 60, TimeUnit.SECONDS);
  }

  private void collectMetrics() {
    // Collect metrics. Typically, records are sent out of process via some network protocol, but we
    // simply log for illustrative purposes.
    logger.log(Level.INFO, "Collecting metrics");
    collectionRef
        .get()
        .collectAllMetrics()
        .forEach(metric -> logger.log(Level.INFO, "Metric: " + metric));
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Export any records which have been queued up but not yet exported.
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Shutdown the exporter and cleanup any resources.
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // Specify the required aggregation temporality as a function of instrument type
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // Optionally specify the memory mode, indicating whether metric records can be reused or must
    // be immutable
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // Optionally specify the default aggregation as a function of instrument kind
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### MetricExporter

A
[MetricExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/export/MetricExporter.html)
is a [plugin extension interface](#sdk-plugin-extension-interfaces) responsible
for exporting metrics out of process. Rather than directly registering with
`SdkMeterProvider`, they are paired with [PeriodicMetricReader](#metricreader).

Metric exporters built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                            | Artifact                                                                             | Description                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `OtlpHttpMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Exports metrics via OTLP `http/protobuf`.                                       |
| `OtlpGrpcMetricExporter` **[1]** | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Exports metrics via OTLP `grpc`.                                                |
| `LoggingMetricExporter`          | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | Logs metrics to JUL in a debugging format.                                      |
| `OtlpJsonLoggingMetricExporter`  | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Logs metrics to JUL in the OTLP JSON encoding.                                  |
| `OtlpStdoutMetricExporter`       | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Logs metrics to `System.out` in the OTLP [JSON file encoding][] (experimental). |
| `InterceptableMetricExporter`    | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | Passes metrics to a flexible interceptor before exporting.                      |

**[1]**: See [OTLP exporters](#otlp-exporters) for implementation details.

The following code snippet demonstrates `MetricExporter` programmatic
configuration:

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

Implement the `MetricExporter` interface to provide your own custom metric
export logic. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomMetricExporter.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.common.export.MemoryMode;
import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentType;
import io.opentelemetry.sdk.metrics.data.AggregationTemporality;
import io.opentelemetry.sdk.metrics.data.MetricData;
import io.opentelemetry.sdk.metrics.export.AggregationTemporalitySelector;
import io.opentelemetry.sdk.metrics.export.MetricExporter;
import java.util.Collection;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomMetricExporter implements MetricExporter {

  private static final Logger logger = Logger.getLogger(CustomMetricExporter.class.getName());

  @Override
  public CompletableResultCode export(Collection<MetricData> metrics) {
    // Export the records. Typically, records are sent out of process via some network protocol, but
    // we simply log for illustrative purposes.
    logger.log(Level.INFO, "Exporting metrics");
    metrics.forEach(metric -> logger.log(Level.INFO, "Metric: " + metric));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // Export any records which have been queued up but not yet exported.
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Shutdown the exporter and cleanup any resources.
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public AggregationTemporality getAggregationTemporality(InstrumentType instrumentType) {
    // Specify the required aggregation temporality as a function of instrument type
    return AggregationTemporalitySelector.deltaPreferred()
        .getAggregationTemporality(instrumentType);
  }

  @Override
  public MemoryMode getMemoryMode() {
    // Optionally specify the memory mode, indicating whether metric records can be reused or must
    // be immutable
    return MemoryMode.REUSABLE_DATA;
  }

  @Override
  public Aggregation getDefaultAggregation(InstrumentType instrumentType) {
    // Optionally specify the default aggregation as a function of instrument kind
    return Aggregation.defaultAggregation();
  }
}
```
<!-- prettier-ignore-end -->

#### Views

[Views](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-metrics/latest/io/opentelemetry/sdk/metrics/View.html)
allow metric streams to be customized, including changing metric names, metric
descriptions, metric aggregations (i.e. histogram bucket boundaries), the set of
attribute keys to retain, cardinality limit, etc.

{{% alert %}} Views have somewhat unintuitive behavior when multiple match a
particular instrument. If one matching view changes the metric name and another
changes the metric aggregation, you might expect the name and aggregation are
changed, but this is not the case. Instead, two metric streams are produced: one
with the configured metric name and the default aggregation, and another with
the original metric name and the configured aggregation. In other words,
matching views _do not merge_. For best results, configure views with narrow
selection criteria (i.e. select a single specific instrument). {{% /alert %}}

The following code snippet demonstrates `View` programmatic configuration:

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

  public static SdkMeterProviderBuilder cardinalityLimitsView(
      SdkMeterProviderBuilder builder, String metricName, int cardinalityLimit) {
    return builder.registerView(
        InstrumentSelector.builder().setName(metricName).build(),
        View.builder().setCardinalityLimit(cardinalityLimit).build());
  }
}
```
<!-- prettier-ignore-end -->

### SdkLoggerProvider

[SdkLoggerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/SdkLoggerProvider.html)
is the SDK implementation of [LoggerProvider](../api/#loggerprovider), and is
responsible for handling log telemetry produced by the log bridge API.

`SdkLoggerProvider` is configured by the application owner, and consists of:

- [Resource](#resource): The resource logs are associated with.
- [LogRecordProcessor](#logrecordprocessor): Processes logs when they are
  emitted.
- [LogRecordExporter](#logrecordexporter): Exports logs out of process (in
  conjunction with associated `LogRecordProcessor`).
- [LogLimits](#loglimits): Controls the limits of data associated with logs.

The following code snippet demonstrates `SdkLoggerProvider` programmatic
configuration:

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

A
[LogRecordProcessor](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogRecordProcessor.html)
is a [plugin extension interface](#sdk-plugin-extension-interfaces) with a
callback invoked when a log is emitted. They are often paired with
[LogRecordExporters](#logrecordexporter) to export logs out of process, but have
other applications such as data enrichment.

Log record processors built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                      | Artifact                                                                             | Description                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `BatchLogRecordProcessor`  | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | Batches log records and exports them via a configurable `LogRecordExporter`. |
| `SimpleLogRecordProcessor` | `io.opentelemetry:opentelemetry-sdk:{{% param vers.otel %}}`                         | Exports each log record a via a configurable `LogRecordExporter`.            |
| `EventToSpanEventBridge`   | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | Records event log records as span events on the current span.                |

The following code snippet demonstrates `LogRecordProcessor` programmatic
configuration:

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

Implement the `LogRecordProcessor` interface to provide your own custom log
processing logic. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordProcessor.java"?>
```java
package otel;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.context.Context;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.logs.LogRecordProcessor;
import io.opentelemetry.sdk.logs.ReadWriteLogRecord;

public class CustomLogRecordProcessor implements LogRecordProcessor {

  @Override
  public void onEmit(Context context, ReadWriteLogRecord logRecord) {
    // Callback invoked when log record is emitted.
    // Enrich the record with a custom attribute.
    logRecord.setAttribute(AttributeKey.stringKey("my.custom.attribute"), "hello world");
  }

  @Override
  public CompletableResultCode shutdown() {
    // Optionally shutdown the processor and cleanup any resources.
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode forceFlush() {
    // Optionally process any records which have been queued up but not yet processed.
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogRecordExporter

A
[LogRecordExporter](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/export/LogRecordExporter.html)
is a [plugin extension interface](#sdk-plugin-extension-interfaces) responsible
for exporting log records out of process. Rather than directly registering with
`SdkLoggerProvider`, they are paired with
[LogRecordProcessors](#logrecordprocessor) (typically
`BatchLogRecordProcessor`).

Span exporters built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                                      | Artifact                                                                             | Description                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `OtlpHttpLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Exports log records via OTLP `http/protobuf`.                                       |
| `OtlpGrpcLogRecordExporter` **[1]**        | `io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`               | Exports log records via OTLP `grpc`.                                                |
| `SystemOutLogRecordExporter`               | `io.opentelemetry:opentelemetry-exporter-logging:{{% param vers.otel %}}`            | Logs log records to system out in a debugging format.                               |
| `OtlpJsonLoggingLogRecordExporter` **[2]** | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Logs log records to JUL in the OTLP JSON encoding.                                  |
| `OtlpStdoutLogRecordExporter`              | `io.opentelemetry:opentelemetry-exporter-logging-otlp:{{% param vers.otel %}}`       | Logs log records to `System.out` in the OTLP [JSON file encoding][] (experimental). |
| `InterceptableLogRecordExporter`           | `io.opentelemetry.contrib:opentelemetry-processors:{{% param vers.contrib %}}-alpha` | Passes log records to a flexible interceptor before exporting.                      |

**[1]**: See [OTLP exporters](#otlp-exporters) for implementation details.

**[2]**: `OtlpJsonLoggingLogRecordExporter` logs to JUL, and may cause infinite
loops (i.e. JUL -> SLF4J -> Logback -> OpenTelemetry Appender -> OpenTelemetry
Log SDK -> JUL) if not carefully configured.

The following code snippet demonstrates `LogRecordProcessor` programmatic
configuration:

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

Implement the `LogRecordExporter` interface to provide your own custom log
record export logic. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomLogRecordExporter.java"?>
```java
package otel;

import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.logs.data.LogRecordData;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import java.util.Collection;
import java.util.logging.Level;
import java.util.logging.Logger;

public class CustomLogRecordExporter implements LogRecordExporter {

  private static final Logger logger = Logger.getLogger(CustomLogRecordExporter.class.getName());

  @Override
  public CompletableResultCode export(Collection<LogRecordData> logs) {
    // Export the records. Typically, records are sent out of process via some network protocol, but
    // we simply log for illustrative purposes.
    System.out.println("Exporting logs");
    logs.forEach(log -> System.out.println("log record: " + log));
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode flush() {
    // Export any records which have been queued up but not yet exported.
    logger.log(Level.INFO, "flushing");
    return CompletableResultCode.ofSuccess();
  }

  @Override
  public CompletableResultCode shutdown() {
    // Shutdown the exporter and cleanup any resources.
    logger.log(Level.INFO, "shutting down");
    return CompletableResultCode.ofSuccess();
  }
}
```
<!-- prettier-ignore-end -->

#### LogLimits

[LogLimits](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-logs/latest/io/opentelemetry/sdk/logs/LogLimits.html)
defines constraints for the data captured by log records, including max
attribute length, and max number of attributes.

The following code snippet demonstrates `LogRecordProcessor` programmatic
configuration:

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

### TextMapPropagator

[TextMapPropagator](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-context/latest/io/opentelemetry/context/propagation/TextMapPropagator.html)
is a [plugin extension interface](#sdk-plugin-extension-interfaces) responsible
for propagating context across process boundaries in a text format.

TextMapPropagators built-in to the SDK and maintained by the community in
`opentelemetry-java-contrib`:

| Class                       | Artifact                                                                                      | Description                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `W3CTraceContextPropagator` | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | Propagate trace context using W3C trace context propagation protocol.                   |
| `W3CBaggagePropagator`      | `io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}`                                  | Propagate baggage using W3C baggage propagation protocol.                               |
| `MultiTextMapPropagator`    | `io.opentelemetry:opentelemetry-context:{{% param vers.otel %}}`                              | Compose multiple propagators.                                                           |
| `JaegerPropagator`          | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Propagator trace context using the Jaeger propagation protocol.                         |
| `B3Propagator`              | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Propagator trace context using the B3 propagation protocol.                             |
| `OtTracePropagator`         | `io.opentelemetry:opentelemetry-extension-trace-propagators:{{% param vers.otel %}}`          | Propagator trace context using the OpenTracing propagation protocol.                    |
| `PassThroughPropagator`     | `io.opentelemetry:opentelemetry-api-incubator:{{% param vers.otel %}}-alpha`                  | Propagate a configurable set fields without participating in telemetry.                 |
| `AwsXrayPropagator`         | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | Propagate trace context using AWS X-Ray propagation protocol.                           |
| `AwsXrayLambdaPropagator`   | `io.opentelemetry.contrib:opentelemetry-aws-xray-propagator:{{% param vers.contrib %}}-alpha` | Propagate trace context using environment variables and AWS X-Ray propagation protocol. |

The following code snippet demonstrates `TextMapPropagator` programmatic
configuration:

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

Implement the `TextMapPropagator` interface to provide your own custom
propagator logic. For example:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/CustomTextMapPropagator.java"?>
```java
package otel;

import io.opentelemetry.context.Context;
import io.opentelemetry.context.propagation.TextMapGetter;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.context.propagation.TextMapSetter;
import java.util.Collection;
import java.util.Collections;

public class CustomTextMapPropagator implements TextMapPropagator {

  @Override
  public Collection<String> fields() {
    // Return fields used for propagation. See W3CTraceContextPropagator for reference
    // implementation.
    return Collections.emptyList();
  }

  @Override
  public <C> void inject(Context context, C carrier, TextMapSetter<C> setter) {
    // Inject context. See W3CTraceContextPropagator for reference implementation.
  }

  @Override
  public <C> Context extract(Context context, C carrier, TextMapGetter<C> getter) {
    // Extract context. See W3CTraceContextPropagator for reference implementation.
    return context;
  }
}
```
<!-- prettier-ignore-end -->

## Appendix

### Internal logging

SDK components log a variety of information to
[java.util.logging](https://docs.oracle.com/javase/7/docs/api/java/util/logging/package-summary.html),
at different log levels and using logger names based on the fully qualified
class name of the relevant component.

By default, log messages are handled by the root handler in your application. If
you have not installed a custom root handler for your application, logs of level
`INFO` or higher are sent to the console by default.

You may want to change the behavior of the logger for OpenTelemetry. For
example, you can reduce the logging level to output additional information when
debugging, increase the level for a particular class to ignore errors coming
from the class, or install a custom handler or filter to run custom code
whenever OpenTelemetry logs a particular message. No detailed list of logger
names and log information is maintained. However, all OpenTelemetry API, SDK,
contrib and instrumentation components share the same `io.opentelemetry.*`
package prefix. It can be useful to enable finer grain logs for all
`io.opentelemetry.*`, inspect the output, and narrow down to packages or FQCNs
of interest.

For example:

```properties
## Turn off all OpenTelemetry logging
io.opentelemetry.level = OFF
```

```properties
## Turn off logging for just the BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor.level = OFF
```

```properties
## Log "FINE" messages for help in debugging
io.opentelemetry.level = FINE

## Sets the default ConsoleHandler's logger's level
## Note this impacts the logging outside of OpenTelemetry as well
java.util.logging.ConsoleHandler.level = FINE
```

For more fine-grained control and special case handling, custom handlers and
filters can be specified with code.

```java
// Custom filter which does not log errors which come from the export
public class IgnoreExportErrorsFilter implements java.util.logging.Filter {

 public boolean isLoggable(LogRecord record) {
    return !record.getMessage().contains("Exception thrown by the export");
 }
}
```

```properties
## Registering the custom filter on the BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor = io.opentelemetry.extension.logging.IgnoreExportErrorsFilter
```

### OTLP exporters

The [span exporter](#spanexporter), [metric exporter](#metricexporter), and
[log exporter](#logrecordexporter) sections describe OTLP exporters of the form:

- `OtlpHttp{Signal}Exporter`, which exports data via OTLP `http/protobuf`
- `OtlpGrpc{Signal}Exporter`, which exports data via OTLP `grpc`

The exporters for all signals are available via
`io.opentelemetry:opentelemetry-exporter-otlp:{{% param vers.otel %}}`, and have
significant overlap across `grpc` and `http/protobuf` versions of the OTLP
protocol, and between signals. The following sections elaborate on these key
concepts:

- [Senders](#senders): an abstraction for a different HTTP / gRPC client
  libraries.
- [Authentication](#authentication) options for OTLP exporters.

#### Senders

The OTLP exporters depend on various client libraries to execute HTTP and gRPC
requests. There is no single HTTP / gRPC client library which satisfies all use
cases in the Java ecosystem:

- Java 11+ brings the built-in `java.net.http.HttpClient`, but
  `opentelemetry-java` needs to support Java 8+ users, and this can't be used to
  export via `gRPC` because there is no support for trailer headers.
- [OkHttp](https://square.github.io/okhttp/) provides a powerful HTTP client
  with support for trailer headers, but depends on the kotlin standard library.
- [grpc-java](https://github.com/grpc/grpc-java) provides its own
  `ManagedChannel` abstraction with various
  [transport implementations](https://github.com/grpc/grpc-java#transport), but
  is not suitable for `http/protobuf`.

In order to accommodate various use cases, `opentelemetry-exporter-otlp` uses an
internal "sender" abstraction, with a variety of implementations to reflect
application constraints. To choose another implementation, exclude the
`io.opentelemetry:opentelemetry-exporter-sender-okhttp` default dependency, and
add a dependency on the alternative.

| Artifact                                                                                              | Description                                               | OTLP Protocols          | Default |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- | ------- |
| `io.opentelemetry:opentelemetry-exporter-sender-okhttp:{{% param vers.otel %}}`                       | OkHttp based implementation.                              | `grpc`, `http/protobuf` | Yes     |
| `io.opentelemetry:opentelemetry-exporter-sender-jdk:{{% param vers.otel %}}`                          | Java 11+ `java.net.http.HttpClient` based implementation. | `http/protobuf`         | No      |
| `io.opentelemetry:opentelemetry-exporter-sender-grpc-managed-channel:{{% param vers.otel %}}` **[1]** | `grpc-java` `ManagedChannel` based implementation.        | `grpc`                  | No      |

**[1]**: In order to use `opentelemetry-exporter-sender-grpc-managed-channel`,
you must also add a dependency on a
[gRPC transport implementations](https://github.com/grpc/grpc-java#transport).

#### Authentication

The OTLP exporters provide mechanisms for static and dynamic header-based
authentication, and for mTLS.

If using
[zero-code SDK autoconfigure](../configuration/#zero-code-sdk-autoconfigure)
with environment variables and system properties, see
[relevant system properties](../configuration/#properties-exporters):

- `otel.exporter.otlp.headers` for static header-based authentication.
- `otel.exporter.otlp.client.key`, `otel.exporter.otlp.client.certificate` for
  mTLS authentication.

The following code snippet demonstrates programmatic configuration of static and
dynamic header-based authentication:

<!-- prettier-ignore-start -->
<?code-excerpt "src/main/java/otel/OtlpAuthenticationConfig.java"?>
```java
package otel;

import io.opentelemetry.exporter.otlp.http.logs.OtlpHttpLogRecordExporter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.function.Supplier;

public class OtlpAuthenticationConfig {
  public static void staticAuthenticationHeader(String endpoint) {
    // If the OTLP destination accepts a static, long-lived authentication header like an API key,
    // set it as a header.
    // This reads the API key from the OTLP_API_KEY env var to avoid hard coding the secret in
    // source code.
    String apiKeyHeaderName = "api-key";
    String apiKeyHeaderValue = System.getenv("OTLP_API_KEY");

    // Initialize OTLP Span, Metric, and LogRecord exporters using a similar pattern
    OtlpHttpSpanExporter spanExporter =
        OtlpHttpSpanExporter.builder()
            .setEndpoint(endpoint)
            .addHeader(apiKeyHeaderName, apiKeyHeaderValue)
            .build();
    OtlpHttpMetricExporter metricExporter =
        OtlpHttpMetricExporter.builder()
            .setEndpoint(endpoint)
            .addHeader(apiKeyHeaderName, apiKeyHeaderValue)
            .build();
    OtlpHttpLogRecordExporter logRecordExporter =
        OtlpHttpLogRecordExporter.builder()
            .setEndpoint(endpoint)
            .addHeader(apiKeyHeaderName, apiKeyHeaderValue)
            .build();
  }

  public static void dynamicAuthenticationHeader(String endpoint) {
    // If the OTLP destination requires a dynamic authentication header, such as a JWT which needs
    // to be periodically refreshed, use a header supplier.
    // Here we implement a simple supplier which adds a header of the form "Authorization: Bearer
    // <token>", where <token> is fetched from refreshBearerToken every 10 minutes.
    String username = System.getenv("OTLP_USERNAME");
    String password = System.getenv("OTLP_PASSWORD");
    Supplier<Map<String, String>> supplier =
        new AuthHeaderSupplier(() -> refreshToken(username, password), Duration.ofMinutes(10));

    // Initialize OTLP Span, Metric, and LogRecord exporters using a similar pattern
    OtlpHttpSpanExporter spanExporter =
        OtlpHttpSpanExporter.builder().setEndpoint(endpoint).setHeaders(supplier).build();
    OtlpHttpMetricExporter metricExporter =
        OtlpHttpMetricExporter.builder().setEndpoint(endpoint).setHeaders(supplier).build();
    OtlpHttpLogRecordExporter logRecordExporter =
        OtlpHttpLogRecordExporter.builder().setEndpoint(endpoint).setHeaders(supplier).build();
  }

  private static class AuthHeaderSupplier implements Supplier<Map<String, String>> {
    private final Supplier<String> tokenRefresher;
    private final Duration tokenRefreshInterval;
    private Instant refreshedAt = Instant.ofEpochMilli(0);
    private String currentTokenValue;

    private AuthHeaderSupplier(Supplier<String> tokenRefresher, Duration tokenRefreshInterval) {
      this.tokenRefresher = tokenRefresher;
      this.tokenRefreshInterval = tokenRefreshInterval;
    }

    @Override
    public Map<String, String> get() {
      return Collections.singletonMap("Authorization", "Bearer " + getToken());
    }

    private synchronized String getToken() {
      Instant now = Instant.now();
      if (currentTokenValue == null || now.isAfter(refreshedAt.plus(tokenRefreshInterval))) {
        currentTokenValue = tokenRefresher.get();
        refreshedAt = now;
      }
      return currentTokenValue;
    }
  }

  private static String refreshToken(String username, String password) {
    // For a production scenario, this would be replaced with an out-of-band request to exchange
    // username / password for bearer token.
    return "abc123";
  }
}
```
<!-- prettier-ignore-end -->

### Testing

TODO: document tools available for testing the SDK

[JSON file encoding]:
  /docs/specs/otel/protocol/file-exporter/#json-file-serialization
