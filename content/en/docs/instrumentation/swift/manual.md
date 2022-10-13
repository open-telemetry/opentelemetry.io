---
title: Manual Instrumentation
linkTitle: Manual
weight: 5
description: Manual instrumentation for opentelemetry-swift
---

## Setup

The [OpenTelemetrySdk](https://github.com/open-telemetry/opentelemetry-swift/blob/main/Sources/OpenTelemetrySdk/OpenTelemetrySdk.swift#L37) provides limited functionality in its default configuration. For more useful functionality, some configuration is required. 

The default registered `TracerProvider` and `MetricProvider` are not configured with an exported. There are several [exporters](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Sources/Exporters) available depending on your needs. Below we will explore configuring the OTLP exporter, which can be used for sending data to the [opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector).


```swift
import GRPC
import OpenTelemetryApi
import OpenTelemetrySdk
import OpenTelemetryProtocolExporter


// initalize the OtlpTraceExporter
let otlpConfiguration = OtlpConfiguration(timeout: OtlpConfiguration.DefaultTimeoutInterval)

let grpcChannel = ClientConnection.usingPlatformAppropriateTLS(for: MultiThreadedEventLoopGroup(numberOfThreads:1))
                                                  .connect(host: <collector host>, port: <collector port>)
                                                  
let traceExporter = OtlpTraceExporter(channel: grpcChannel
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

After configuring the MeterProvider & TracerProvider all subsequently initialized instrumentation will be exporting using this OTLP exporter.

## Acquiring a Tracer

To do tracing, you will need a tracer. 
A tracer is acquired through the tracer provider and is responsible for creating spans. The OpenTelementrySdk manages the tracer provider as we defined and registered above. 
A tracer requires an instrumentation name, and an optional version to be created:
```swift
let  tracer = OpenTelemetrySDK.instance.tracerProvider.get(instrumentationName: "instrumentation-library-name", instrumentationVersion: "1.0.0") 
```

### Creating Spans

A [span](https://opentelemetry.io/docs/concepts/signals/traces/#spans-in-opentelemetry)
 represents a unit of work or operation. Spans are the building blocks of Traces. To create a span use the span builder associated with the tracer:

```swift
let span =  let builder = tracer.spanBuilder(spanName: "\(name)").startSpan()
...
span.end()
```
It is required to call `end()` to end the span.

### Creating Nested Spans

Often, spans are used to build relationship between operations. 
Below is an example of how we can manually build relationship between spans.

Below we have `parent()` calling `child()` and how to manually link spans of each of these methods.

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

The parent-child relationship will be automatically linked if `activeSpan` is used:

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

Sometimes it's useful to do something with the current/active span. Here's how to access the current span from an arbitrary point in your code.
```swift 
  let currentSpan = OpenTelemetry.instance.contextProvider.activeSpan
```
### Span Attributes

Spans can also be annotated with additional attributes. All spans will be automatically annotated with the `Resource` attributes attached to the tracer provider.
The Opentelementry-swift sdk already provides instrumentation of common attributes in the `SDKResourceExtension` instrumentation.
In this example a span for a network request capturing details about that request using existing [semantic conventions](https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/).
```swift
let span = tracer.spanBuilder("/resource/path").startSpan()
span.setAttribute("http.method", "GET");
span.setAttribute("http.url", url.toString());
```

### Creating Span Events
A Span Event can be thought of as a structured log message (or annotation) on a Span, typically used to denote a meaningful, singular point in time during the Span’s duration.

```swift
            let attributes = [
                "key" : AttributeValue.string("value"),
                "result" : AttributeValue.int(100)
            ]
            span.addEvent(name: "computation complete", attributes: attributes)
```

### Setting Span Status
  
### Recording Errors in Spans

## Acquiring A Meter


