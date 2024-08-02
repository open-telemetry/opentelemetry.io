---
title: SDK Concepts
linkTitle: SDK Concepts
weight: 10
aliases: [sdk-concepts]
# prettier-ignore
cSpell:ignore:
---

<!-- markdownlint-disable blanks-around-fences -->
<?code-excerpt path-base="examples/java/configuration"?>

The SDK is the built-in reference implementation of the [API](TODO), processing and exporting telemetry produced by instrumentation API calls. It consists of the following top level components:

* [SdkTracerProvider](#sdktracerprovider) the SDK implementation of `TracerProvider`.
* [SdkMeterProvider](#sdkmeterprovider) the SDK implementation of `MeterProvider`.
* [SdkLoggerProvider](#sdkloggerprovider) the SDK implementation of `LoggerProvider`.
* [ContextPropagators](#contextpropagators) the context propagator.

These are combined into [OpenTelemetrySdk](#opentelemetrysdk), a carrier object which makes it convenient to pass fully-configured SDK components to instrumentation.

The SDK comes packaged with a variety of built-in components which are sufficient for many use cases, and supports [plugin interfaces](#plugin-extension-interfaces) for extensibility.

## Plugin extension interfaces

When built-in components are insufficient, the SDK can be extended by implementing various plugin extension interfaces:

* [ContextPropagators](#contextpropagators) for propagating context across process boundaries.
* [Sampler](#sampler) for determining which spans are recorded and sampled.
* [SpanProcessor](#spanprocessor) to receive callbacks when a span is started and ended.
* [SpanExporter](#spanexporter) to export spans out of process.
* [MetricReader](#metricreader) to read aggregated metrics.
* [MetricExporter](#metricexporter) to export metrics out of process.
* [LogRecordProcessor](#logrecordprocessor) to receive callbacks when a log record is emitted.
* [LogRecordExporter](#logrecordexporter) to export logs out of process.

## OpenTelemetrySdk

[OpenTelemetrySdk](TODO) is the SDK implementation of [OpenTelemetry](TODO). It is a holder for top-level SDK components which makes it convenient to pass fully-configured SDK components to instrumentation. See configuration details [here](./configuration-new.md#opentelemetrysdk).

`OpenTelemetrySdk` is configured by the application owner, and consists of:

* [SdkTracerProvider](#sdktracerprovider) the SDK implementation of `TracerProvider`.
* [SdkMeterProvider](#sdkmeterprovider) the SDK implementation of `MeterProvider`.
* [SdkLoggerProvider](#sdkloggerprovider) the SDK implementation of `LoggerProvider`.
* [ContextPropagators](#contextpropagators) the configured context propagator.

## ContextPropagators

[ContextPropagators](TODO) defines how context is propagated across process boundaries. It currently consists of [TextMapPropagators](TODO) defining how context to propagate context when the protocol supports setting / getting text-map data. See configuration details [here](./configuration-new.md#contextpropagators).

The following built-in propagators are provided:

* [W3CTraceContextPropagator](TODO) propagate trace context using W3C trace context propagation protocol.
* [W3CBaggagePropagator](TODO) propagate baggage using W3C baggage propagation protocol.
* [JaegerPropagator](TODO) propagator trace context using the jaeger propagation protocol. 
* [B3Propagator](TODO) propagator trace context using the B3 propagation protocol. 
* [OtTracePropagator](TODO) propagator trace context using the OpenTracing propagation protocol. 
* [PassThroughPropagator](TODO) propagate a configurable set fields without participating in telemetry.
* [MultiTextMapPropagator](TODO) compose multiple propagators.

The following samplers are maintained by the community via `opentelemetry-java-contrib`:

* [AwsXrayPropagator](TODO) propagate trace context using AWS X-Ray propagation protocol.
* [AwsXrayLambdaPropagator](TODO) propagate trace context using environment variables and AWS X-Ray propagation protocol.

Implement the `TextMapPropagator` interface to provide your own custom propagator logic. For example:

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

## Resource

[Resource](TODO) is a set of attributes defining the telemetry source. An application should associate the same resource with [SdkTracerProvider](#sdktracerprovider), [SdkMeterProvider](#sdkmeterprovider), [SdkLoggerProvider](#sdkloggerprovider). See configuration details [here](./configuration-new.md#resource).

## SdkTracerProvider

[SdkTracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-sdk-trace/latest/io/opentelemetry/sdk/trace/SdkTracerProvider.html) is the SDK implementation of [TracerProvider](https://www.javadoc.io/doc/io.opentelemetry/opentelemetry-api/latest/io/opentelemetry/api/trace/TracerProvider.html), and is responsible for handling trace telemetry produced by the API. See configuration details [here](./configuration-new.md#sdktracerprovider).

`SdkTracerProvider` is configured by the application owner, and consists of:

* [Resource](#resource) the resource spans are associated with.
* [Sampler](#sampler) to configure which spans are recorded and sampled.
* [SpanProcessors](#spanprocessor) to process spans when they start and end.
* [SpanExporters](#spanexporter) to export spans out of process, and which are associated with `SpanProcessor`s.
* [SpanLimits](#spanlimits) for controlling the limits of data associated with spans.

### Sampler

A [Sampler](TODO) is a [plugin extension interface](#plugin-extension-interfaces) responsible for determining which spans are recorded and sampled. See configuration details [here](./configuration-new.md#sampler).

The following built-in samplers are provided:

* [ParentBased](TODO) samples based on the sampling status of a span's parent.
* [AlwaysOn](TODO) always samples a span.
* [AlwaysOff](TODO) always drops a span.
* [TraceIdRatioBased](TODO) records spans based on a configurable ratio.
* [JaegerRemoteSampler](TODO) applies a sampling policy based on configuration from a remote server.

The following samplers are maintained by the community via `opentelemetry-java-contrib`:

* [LinksBasedSampler](TODO) samples based on the sampling status of a span's links.
* [RuleBasedRoutingSampler](TODO) samples based on whether a span matches configurable rules.
* [ConsistentSamplers](TODO) various consistent sampler implementations as defined by [probability sampling](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/tracestate-probability-sampling.md).

Implement the `Sampler` interface to provide your own custom sampling logic. For example:

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

### SpanProcessor

A [SpanProcessor](TODO) is a [plugin extension interface](#plugin-extension-interfaces) with callbacks invoked when a span is started and ended. They are often paired with [SpanExporters](#spanexporter) to export spans out of process, but have other applications such as data enrichment. See configuration details [here](./configuration-new.md#spanprocessor).

The following built-in span processors are provided:

* [BatchSpanProcessor](TODO) batches sampled spans and exports via a configurable `SpanExporter`.
* [SimpleSpanProcessor](TODO) exports each sampled span via a configurable `SpanExporter`.

The following samplers are maintained by the community via `opentelemetry-java-contrib`:

* [BaggageSpanProcessor](TODO) enriches spans with baggage.
* [JfrSpanProcessor](TODO) creates JFR events from spans.
* [StackTraceSpanProcessor](TODO) enriches select spans with stack trace data.

Implement the `SpanProcessor` interface to provide your own custom span processing logic. For example:

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
    // Enrich the record a custom attribute.
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

### SpanExporter

A [SpanExporter](TODO) is a [plugin extension interface](#plugin-extension-interfaces) responsible for exporting spans out of process. Rather than directly registering with `SdkTracerProvider`, they are paired with [SpanProcessors](#spanprocessor). See configuration details [here](./configuration-new.md#spanexporter).

The following built-in span exporters are provided:

* [OtlpHttpSpanExporter](TODO) exports spans via OTLP `http/protobuf`.
* [OtlpGrpcSpanExporter](TODO) exports spans via OTLP `http/protobuf`.
* [LoggingSpanExporter](TODO) logs spans to JUL in a debugging format.
* [OtlpJsonLoggingSpanExporter](TODO) logs spans to JUL in the OTLP JSON encoding.
* [ZipkinSpanExporter](TODO) export spans to zipkin.

The following span exporters are maintained by the community via `opentelemetry-java-contrib`:

* [InterceptableSpanExporter](TODO) passes spans to a flexible interceptor before exporting.
* [KafkaSpanExporter](TODO) exports spans by writing to a kafka topic.

Implement the `SpanExporter` interface to provide your own custom span export logic. For example:

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

### SpanLimits

[SpanLimits](TODO) defines constraints for the data captured by spans, including max attribute length, max number of attributes, and more. See configuration details [here](./configuration-new.md#spanlimits).

## SdkMeterProvider

[SdkMeterProvider](TODO) is the SDK implementation of [MeterProvider](), and is responsible for handling metric telemetry produced by the API. See configuration details [here](./configuration-new.md#sdkmeterprovider).

`SdkMeterProvider` is configured by the application owner, and consists of:

* [Resource](#resource) the resource metrics are associated with.
* [MetricReader](#metricreader) to read the aggregated state of metrics.
* [MetricExporter](#metricexporter) to export metrics out of process, and which are associated with `MetricReader`s.
* [Views](#views) to configure metric streams, including dropping unused metrics.

### MetricReader

A [MetricReader](TODO) is a [plugin extension interface](#plugin-extension-interfaces) which is responsible for reading aggregated metrics. They are often paired with [MetricExporters](#metricexporter) to export metrics out of process, but may also be used to serve the metrics to external scrapers in pull-based protocols. See configuration details [here](./configuration-new.md#metricreader).

The following built-in metric readers are provided:

* [PeriodicMetricReader](TODO) reads metrics on a periodic basis and exports via configurable `MetricExporter`.
* [PrometheusHttpServer](TODO) serves metrics on an HTTP server in various prometheus formats.

There are currently no metric readers maintained by the community via `opentelemetry-java-contrib`.

Implement the `MetricReader` interface to provide your own custom metric reader logic. For example:

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

### MetricExporter

A [MetricExporter](TODO) is a [plugin extension interface](#plugin-extension-interfaces) responsible for exporting metrics out of process. Rather than directly registering with `SdkMeterProvider`, they are paired with [PeriodicMetricReader](#metricreader). See configuration details [here](./configuration-new.md#metricexporter).

The following built-in metric exporters are provided:

* [OtlpHttpMetricExporter](TODO) exports metrics via OTLP `http/protobuf`.
* [OtlpGrpcMetricExporter](TODO) exports metrics via OTLP `http/protobuf`.
* [LogginMetricExporter](TODO) logs metrics to JUL in a debugging format.
* [OtlpJsonLoggingMetricExporter](TODO) logs metrics to JUL in the OTLP JSON encoding.

The following metric exporters are maintained by the community via `opentelemetry-java-contrib`:

* [InterceptableMetricExporter](TODO) passes metrics to a flexible interceptor before exporting.

Implement the `MetricExporter` interface to provide your own custom metric export logic. For example:

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

### Views

[Views](TODO) allow metric streams to be customized, including changing metric names, metric descriptions, metric aggregations (i.e. histogram bucket boundaries), the set of attribute keys to retain, etc. See configuration details [here](./configuration-new.md#views).

**NOTE:** Views have somewhat unintuitive behavior when multiple match a particular instrument. If one matching view changes the metric name and another changes the metric aggregation, you might expect the result to be that the name and aggregation is changed, but this is not the case. Instead, two metric streams are produced: one with the configured metric name and the default aggregation, and another with the original metric name and the configured aggregation. In other words, matching views _do not merge_. For best results, configure views with narrow selection criteria (i.e. select a single specific instrument).

## SdkLoggerProvider

[SdkLoggerProvider](TODO) is the SDK implementation of [LoggerProvider](), and is responsible for handling log telemetry produced by the log bridge API. See configuration details [here](./configuration-new.md#sdkloggerprovider).

`SdkLoggerProvider` is configured by the application owner, and consists of:

* [Resource](#resource) the resource logs are associated with.
* [LogRecordProcessor](#logrecordprocessor) to process logs when they are emitted.
* [LogRecordExporter](#logrecordexporter) to export logs out of process, and which are associated with `LogRecordProcessors`s.
* [LogLimits](#loglimits) for controlling the limits of data associated with logs.

### LogRecordProcessor

A [LogRecordProcessor](TODO) is a [plugin extension interface](#plugin-extension-interfaces) with a callback invoked when a log is emitted. They are often paired with [LogRecordExporters](#logrecordexporter) to export logs out of process, but have other applications such as data enrichment. See configuration details [here](./configuration-new.md#logrecordprocessor).

The following built-in log record processors are provided:

* [BatchLogRecordProcessor](TODO) batches logs and exports via a configurable `LogRecordExporter`.
* [SimpleLogRecordProcessor](TODO) exports each log via a configurable `LogRecordExporter`.

There are currently no log record processors maintained by the community via `opentelemetry-java-contrib`.

Implement the `LogRecordProcessor` interface to provide your own custom log processing logic. For example:

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
    // Enrich the record a custom attribute.
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

### LogRecordExporter

A [LogRecordExporter](TODO) is a [plugin extension interface](#plugin-extension-interfaces) responsible for exporting log records out of process. Rather than directly registering with `SdkLoggerProvider`, they are paired with [LogRecordProcessors](#logrecordprocessor). See configuration details [here](./configuration-new.md#logrecordexporter).

The following built-in log record exporters are provided:

* [OtlpHttpLogRecordExporter](TODO) exports log records via OTLP `http/protobuf`.
* [OtlpGrpcLogRecordExporter](TODO) exports log records via OTLP `http/protobuf`.
* [SystemOutLogRecordExporter](TODO) logs log records to system out in a debugging format.
* [OtlpJsonLoggingLogRecordExporter](TODO) logs log records to JUL in the OTLP JSON encoding.

The following log record exporters are maintained by the community via `opentelemetry-java-contrib`:

* [InterceptableLogRecordExporter](TODO) passes log records to a flexible interceptor before exporting.

Implement the `LogRecordExporter` interface to provide your own custom log record export logic. For example:

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

### LogLimits

[LogLimits](TODO) defines constraints for the data captured by log records, including max attribute length, and max number of attributes. See configuration details [here](./configuration-new.md#loglimits).

## Testing

TODO(jack-berg): document tools available for testing the SDK
