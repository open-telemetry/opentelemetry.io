---
title: Manual Instrumentation
linkTitle: Manual
weight: 30
description: Manual instrumentation for OpenTelemetry Swift
---

[Manual instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/manual/)
is the process of adding observability code to your application yourself. If you
are developing a standalone process or service, then you would take a dependency
on the API and the SDK.

If you are developing a library, that wants to export telemetry data using
OpenTelemetry, it MUST only depend on the API and should never configure or
depend on the OpenTelemetry SDK.

This way libraries will obtain a real implementation of OpenTelemetry only if
the user application is configured for it and otherwise will function as without
added observability.

For more details, check out the
[Library Guidelines](https://opentelemetry.io/docs/concepts/instrumentation/libraries/).

## Setup

[OpenTelemetry](https://github.com/open-telemetry/opentelemetry-swift/blob/main/Sources/OpenTelemetryApi/OpenTelemetry.swift#L11)
Swift provides limited functionality in its default configuration. For more
useful functionality, some configuration is required.

The default registered `TracerProvider` and `MetricProvider` are not configured
with an exporter. There are several
[exporters](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Exporters)
available depending on your needs. Below we will explore configuring the OTLP
exporter, which can be used for sending data to the
[collector](/docs/collector/).

```swift
import GRPC
import OpenTelemetryApi
import OpenTelemetrySdk
import OpenTelemetryProtocolExporter


// initialize the OtlpTraceExporter
let otlpConfiguration = OtlpConfiguration(timeout: OtlpConfiguration.DefaultTimeoutInterval)

let grpcChannel = ClientConnection.usingPlatformAppropriateTLS(for: MultiThreadedEventLoopGroup(numberOfThreads:1))
                                                  .connect(host: <collector host>, port: <collector port>)

let traceExporter = OtlpTraceExporter(channel: grpcChannel,
                                      config: otlpConfiguration)

// build & register the Tracer Provider using the built otlp trace exporter
OpenTelemetry.registerTracerProvider(tracerProvider: TracerProviderBuilder()
                                                      .add(spanProcessor:SimpleSpanProcessor(spanExporter: traceExporter))
                                                      .with(resource: Resource())
                                                      .build())

```

A similar pattern is used for the OtlpMetricExporter:

```swift

// otlpConfiguration & grpcChannel can be reused
OpenTelemetry.registerMeterProvider(meterProvider: MeterProviderBuilder()
            .with(processor: MetricProcessorSdk())
            .with(exporter: OtlpMetricExporter(channel: channel, config: otlpConfiguration))
            .with(resource: Resource())
            .build())
```

After configuring the MeterProvider & TracerProvider all subsequently
initialized instrumentation will be exporting using this OTLP exporter.

## Acquiring a Tracer

To do tracing, you will need a tracer. A tracer is acquired through the tracer
provider and is responsible for creating spans. The OpenTelemetry manages the
tracer provider as we defined and registered above. A tracer requires an
instrumentation name, and an optional version to be created:

```swift
let  tracer = OpenTelemetry.instance.tracerProvider.get(instrumentationName: "instrumentation-library-name", instrumentationVersion: "1.0.0")
```

### Creating Spans

A [span](/docs/concepts/signals/traces/#spans) represents a unit of work or
operation. Spans are the building blocks of Traces. To create a span use the
span builder associated with the tracer:

```swift
let span =  let builder = tracer.spanBuilder(spanName: "\(name)").startSpan()
...
span.end()
```

It is required to call `end()` to end the span.

### Creating Nested Spans

Spans are used to build relationship between operations. Below is an example of
how we can manually build relationship between spans.

Below we have `parent()` calling `child()` and how to manually link spans of
each of these methods.

```swift
func parent() {
  let parentSpan = someTracer.spanBuilder(spanName: "parent span").startSpan()
  child(span: parentSpan)
  parentSpan.end()
}

func child(parentSpan: Span) {
let childSpan = someTracer.spanBuilder(spanName: "child span")
                             .setParent(parentSpan)
                             .startSpan()
  // do work
  childSpan.end()
}

```

The parent-child relationship will be automatically linked if `activeSpan` is
used:

```swift
func parent() {
  let parentSpan = someTracer.spanBuilder(spanName: "parent span")
                      .setActive(true) // automatically sets context
                      .startSpan()
  child()
  parentSpan.end()
}

func child() {
  let childSpan = someTracer.spanBuilder(spanName: "child span")
                             .startSpan() //automatically captures `active span` as parent
  // do work
  childSpan.end()
}

```

### Getting the Current Span

Sometimes it's useful to do something with the current/active span. Here's how
to access the current span from an arbitrary point in your code.

```swift
  let currentSpan = OpenTelemetry.instance.contextProvider.activeSpan
```

### Span Attributes

Spans can also be annotated with additional attributes. All spans will be
automatically annotated with the `Resource` attributes attached to the tracer
provider. The Opentelemetry-swift sdk already provides instrumentation of common
attributes in the `SDKResourceExtension` instrumentation. In this example a span
for a network request capturing details about that request using existing
[semantic conventions](/docs/specs/otel/trace/semantic_conventions/).

```swift
let span = tracer.spanBuilder("/resource/path").startSpan()
span.setAttribute("http.method", "GET");
span.setAttribute("http.url", url.toString());
```

### Creating Span Events

A Span Event can be thought of as a structured log message (or annotation) on a
Span, typically used to denote a meaningful, singular point in time during the
Span’s duration.

```swift
            let attributes = [
                "key" : AttributeValue.string("value"),
                "result" : AttributeValue.int(100)
            ]
            span.addEvent(name: "computation complete", attributes: attributes)
```

### Setting Span Status

A [status](/docs/concepts/signals/traces/#span-status) can be set on a span,
typically used to specify that a span has not completed successfully -
`SpanStatus.Error`. In rare scenarios, you could override the Error status with
OK, but don’t set OK on successfully-completed spans.

The status can be set at any time before the span is finished:

```swift
func myFunction() {
  let span = someTracer.spanBuilder(spanName: "my span").startSpan()
  defer {
    span.end()
  }
  guard let criticalData = get() else {
      span.status = .error(description: "something bad happened")
      return
  }
  // do something
}
```

### Recording exceptions in Spans

Semantic conventions provide special demarcation for events that record
exceptions:

```swift
let span = someTracer.spanBuilder(spanName: "my span").startSpan()
do {
  try throwingFunction()
} catch {
  span.addEvent(name: SemanticAttributes.exception.rawValue,
    attributes: [SemanticAttributes.exceptionType.rawValue: AttributeValue.string(String(describing: type(of: error))),
                 SemanticAttributes.exceptionEscaped.rawValue: AttributeValue.bool(false),
                 SemanticAttributes.exceptionMessage.rawValue: AttributeValue.string(error.localizedDescription)])
  })
  span.status = .error(description: error.localizedDescription)
}
span.end()
```

## SDK Configuration

### Processors

Different Span processors are offered by OpenTelemetry-swift. The
`SimpleSpanProcessor` immediately forwards ended spans to the exporter, while
the `BatchSpanProcessor` batches them and sends them in bulk. Multiple Span
processors can be configured to be active at the same time using the
`MultiSpanProcessor`. For example, you may create a `SimpleSpanProcessor` that
exports to a logger, and a `BatchSpanProcesssor` that exports to a OpenTelemetry
Collector:

```swift
let otlpConfiguration = OtlpConfiguration(timeout: OtlpConfiguration.DefaultTimeoutInterval)

let grpcChannel = ClientConnection.usingPlatformAppropriateTLS(for: MultiThreadedEventLoopGroup(numberOfThreads:1))
                                                  .connect(host: <collector host>, port: <collector port>)

let traceExporter = OtlpTraceExporter(channel: grpcChannel
                                      config: otlpConfiguration)

// build & register the Tracer Provider using the built otlp trace exporter
OpenTelemetry.registerTracerProvider(tracerProvider: TracerProviderBuilder()
                                                      .add(spanProcessor:BatchSpanProcessor(spanExporter: traceExporter))
                                                      .add(spanProcessor:SimpleSpanProcessor(spanExporter: StdoutExporter))
                                                      .with(resource: Resource())
                                                      .build())

```

The batch span processor allows for a variety of parameters for customization
including.

### Exporters

OpenTelemetry-Swift provides the following exporters:

- `InMemoryExporter`: Keeps the span data in memory. This is useful for testing
  and debugging.
- `DatadogExporter`: Converts OpenTelemetry span data to Datadog traces & span
  Events to Datadog logs.
- `JaegerExporter`: Converts OpenTelemetry span data to Jaeger format and
  exports to a Jaeger endpoint.
- Persistence exporter: An exporter decorator that provides data persistence to
  existing metric and trace exporters.
- `PrometheusExporter`: Converts metric data to Prometheus format and exports to
  a Prometheus endpoint.
- `StdoutExporter`: Exports span data to Stdout. Useful for debugging.
- `ZipkinTraceExporter`: Exports span data to Zipkin format to a Zipkin
  endpoint.
