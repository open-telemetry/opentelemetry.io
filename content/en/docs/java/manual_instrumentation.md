---
Title: "Manual Instrumentation"
Weight: 3
---

## Traces

### Instantiate `TracerProvider`

In the [OpenTelemetry Tracing
API](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/api.md),
the `TracerProvider` is the entry point and is expected to be the stateful
object that holds any configuration. The `TracerProvider` also provides access
to the [`Tracer`](#instantiate-a-tracer).

```java
TracerSdkManagement tracerProvider =
    OpenTelemetrySdk.getGlobalTracerManagement();
```

### Instantiate `Tracer`

In order to instrument, a `Tracer` must be acquired, which is responsible for
creating spans and interacting with the [`Context`](#context-propagation). A
`Tracer` is acquired by using the [OpenTelemetry Tracing
API](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/trace/api.md)
specifying the name and version of the [library
instrumenting](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/glossary.md#instrumentation-library)
the [instrumented
library](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/glossary.md#instrumented-library)
or application to be monitored.

```java
Tracer tracer =
    OpenTelemetry.getTracer("instrumentation-library-name","semver:1.0.0");
```

### Create Spans

#### Basic

To create a basic span, you only need to specify the name of the span. The
start and end time of the span is automatically set by the OpenTelemetry SDK.

```java
Span span = tracer.spanBuilder("my span").startSpan();
try (Scope scope = TracingContextUtils.currentContextWith(span)) {
	// your use case
	...
} catch (Throwable t) {
    span.setStatus(StatusCanonicalCode.ERROR, "Change it to your error message");
} finally {
    span.end(); // closing the scope does not end the span, this has to be done manually
}
```

#### Nested

Most of the time, we want to correlate spans for nested operations.
OpenTelemetry supports tracing within processes and across remote processes.
For more information about how to share context between remote processes, see [Context
Propagation](#context-propagation).

For a method `a` calling a method `b`, the spans could be manually linked in the
following way:

```java
void a() {
  Span parentSpan = tracer.spanBuilder("a")
        .startSpan();
  b(parentSpan);
  parentSpan.end();
}
void b(Span parentSpan) {
  Span childSpan = tracer.spanBuilder("b")
        .setParent(parentSpan)
        .startSpan();
  // do stuff
  childSpan.end();
}
```

The OpenTelemetry API also offers an automated way to propagate the parentSpan:

```java
void a() {
  Span parentSpan = tracer.spanBuilder("a").startSpan();
  try(Scope scope = TracingContextUtils.currentContextWith(parentSpan)) {
    b();
  } finally {
    parentSpan.end();
  }
}
void b() {
  Span childSpan = tracer.spanBuilder("b")
    // NOTE: setParent(parentSpan) is not required; 
    // `TracingContextUtils.getCurrentSpan()` is automatically added as parent
    .startSpan();
  try(Scope scope = TracingContextUtils.currentContextWith(childSpan)) {
    // do stuff
  } finally {
    childSpan.end();
  }
}
```

To link spans from remote processes, it is sufficient to set the [Remote
Context](#context-propagation) as parent.

```java
Span childRemoteParent = tracer.spanBuilder("Child").setParent(remoteContext).startSpan();
```

### Enrich Spans

#### Attributes

In OpenTelemetry spans can be created freely and it's up to the implementor to
annotate them with attributes specific to the represented operation. Attributes
provide additional context on a span about the specific operation it tracks,
such as results or operation properties.

```java
Span span = tracer.spanBuilder("/resource/path").setSpanKind(Span.Kind.CLIENT).startSpan();
span.setAttribute("http.method", "GET");
span.setAttribute("http.url", url.toString());
```

Some of these operations represent calls that use well-known protocols like
HTTP or database calls. For these, OpenTelemetry requires specific attributes
to be set. The full attribute list is available in the Semantic Conventions in
the cross-language specification.

#### Events

Spans can be annotated with named events that can carry zero or more [Span
Attributes](#span-attributes), each of which is itself a name/value map paired
automatically with a timestamp.

```java
span.addEvent("Init");
...
span.addEvent("End");
```

```java
Attributes eventAttributes = Attributes.of(
    AttributeKey.stringKey("key"), "value",
    AttributeKey.longKey("result"), 0L);

span.addEvent("End Computation", eventAttributes);
```

#### Links

A Span may be linked to zero or more other Spans that are causally related.
Links can be used to represent batched operations where a Span was initiated by
multiple initiating Spans, each representing a single incoming item being
processed in the batch.

```java
Span child = tracer.spanBuilder("childWithLink")
        .addLink(parentSpan1.getContext())
        .addLink(parentSpan2.getContext())
        .addLink(parentSpan3.getContext())
        .addLink(remoteContext)
    .startSpan();
```

For more details how to read context from remote processes, see [Context
Propagation](#context-propagation).

### Context Propagation

OpenTelemetry provides a text-based approach to propagate context to remote
services. By default, the [W3C Trace Context](https://www.w3.org/TR/trace-context/)
format is used.

The following presents an example of an outgoing HTTP request using
`HttpURLConnection`.

```java
// Tell OpenTelemetry to inject the context in the HTTP headers
TextMapPropagator.Setter<HttpURLConnection> setter =
  new TextMapPropagator.Setter<HttpURLConnection>() {
    @Override
    public void put(HttpURLConnection carrier, String key, String value) {
        // Insert the context as Header
        carrier.setRequestProperty(key, value);
    }
};

URL url = new URL("http://127.0.0.1:8080/resource");
Span outGoing = tracer.spanBuilder("/resource").setSpanKind(Span.Kind.CLIENT).startSpan();
try (Scope scope = TracingContextUtils.currentContextWith(outGoing)) {
  // Semantic Convention.
  // (Observe that to set these, Span does not *need* to be the current instance.)
  outGoing.setAttribute("http.method", "GET");
  outGoing.setAttribute("http.url", url.toString());
  HttpURLConnection transportLayer = (HttpURLConnection) url.openConnection();
  // Inject the request with the *current*  Context, which contains our current Span.
  OpenTelemetry.getPropagators().getTextMapPropagator().inject(Context.current(), transportLayer, setter);
  // Make outgoing call
} finally {
  outGoing.end();
}
...
```

Similarly, the text-based approach can be used to read the W3C Trace Context
from incoming requests. The following presents an example of processing an
incoming HTTP request using
[HttpExchange](https://docs.oracle.com/javase/8/docs/jre/api/net/httpserver/spec/com/sun/net/httpserver/HttpExchange.html).

```java
TextMapPropagator.Getter<HttpExchange> getter =
  new TextMapPropagator.Getter<HttpExchange>() {
    @Override
    public String get(HttpExchange carrier, String key) {
      if (carrier.getRequestHeaders().containsKey(key)) {
        return carrier.getRequestHeaders().get(key).get(0);
      }
      return null;
    }
};
...
public void handle(HttpExchange httpExchange) {
  // Extract the SpanContext and other elements from the request.
  Context extractedContext = OpenTelemetry.getPropagators().getTextMapPropagator()
        .extract(Context.current(), httpExchange, getter);
  Span serverSpan = null;
  try (Scope scope = ContextUtils.withScopedContext(extractedContext)) {
    // Automatically use the extracted SpanContext as parent.
    serverSpan = tracer.spanBuilder("/resource").setSpanKind(Span.Kind.SERVER)
        .startSpan();
    // Add the attributes defined in the Semantic Conventions
    serverSpan.setAttribute("http.method", "GET");
    serverSpan.setAttribute("http.scheme", "http");
    serverSpan.setAttribute("http.host", "localhost:8080");
    serverSpan.setAttribute("http.target", "/resource");
    // Serve the request
    ...
  } finally {
    if (serverSpan != null) {
      serverSpan.end();
    }
  }
}
```

Other propagators are available as extensions, most notably
[Zipkin
B3](https://github.com/open-telemetry/opentelemetry-java/tree/master/extensions/trace-propagators/src/main/java/io/opentelemetry/extension/trace/propagation).

### Processors

The following processors are available today:

#### SimpleSpanProcessor

This span processor exports spans immediately after they end.

Example:

```java
SimpleSpanProcessor simpleSpansProcessor = SimpleSpanProcessor.builder(exporter).build();
tracerProvider.addSpanProcessor(simpleSpansProcessor);
```

#### BatchSpanProcessor

This span processor exports spans in batches.

Example:

```java
BatchSpanProcessor batchSpansProcessor =
    BatchSpanProcessor.builder(exporter).build();
tracerProvider.addSpanProcessor(batchSpansProcessor);
```

A varitey of configuration parameters can also be specified:

```java
BatchSpanProcessor batchSpansProcessor =
    BatchSpanProcessor.builder(exporter)
        .setExportOnlySampled(true) // send only sampled spans to the exporter
        .setMaxExportBatchSize(512) // maximum batch size to use
        .setMaxQueueSize(2048) // queue size; mmust be >= the export batch size
        .setExporterTimeoutMillis(
            30_000) // max amount of time an export can run before getting interrupted
        .setScheduleDelayMillis(5000) // set time between two different exports
        .build();
tracerProvider.addSpanProcessor(batchSpansProcessor);
```

#### MultiSpanProcessor

A MultiSpanProcessor accepts a list of Span Processors.

Example:

```java
SpanProcessor multiSpanProcessor =
    MultiSpanProcessor.create(Arrays.asList(simpleSpansProcessor, batchSpansProcessor));
tracerProvider.addSpanProcessor(multiSpanProcessor);
```

### Exporters

*TODO*

### Sampling

*TODO*

## Metrics

OpenTelemetry provides support for metrics, a time series of numbers that might
express things such as CPU utilization, request count for an HTTP server or a
business metric such as transactions.

All metrics can be annotated with labels: additional qualifiers that help
describe what subdivision of the measurements the metric represents.

The following is an example of counter usage:

```java
// Gets or creates a named meter instance
Meter meter = OpenTelemetry.getMeter("instrumentation-library-name","semver:1.0.0");

// Build counter e.g. LongCounter
LongCounter counter = meter
        .longCounterBuilder("processed_jobs")
        .setDescription("Processed jobs")
        .setUnit("1")
        .build();

// It is recommended that the API user keep a reference to a Bound Counter for the entire time or
// call unbind when no-longer needed.
BoundLongCounter someWorkCounter = counter.bind(Labels.of("Key", "SomeWork"));

// Record data
someWorkCounter.add(123);

// Alternatively, the user can use the unbounded counter and explicitly
// specify the labels set at call-time:
counter.add(123, Labels.of("Key", "SomeWork"));
```

`Observer` is an additional instrument supporting an asynchronous API and
collecting metric data on demand, once per collection interval.

The following is an example of observer usage:

```java
// Build observer e.g. LongObserver
LongObserver observer = meter
        .observerLongBuilder("cpu_usage")
        .setDescription("CPU Usage")
        .setUnit("ms")
        .build();

observer.setCallback(
        new LongObserver.Callback<LongObserver.ResultLongObserver>() {
          @Override
          public void update(ResultLongObserver result) {
            // long getCpuUsage()
            result.observe(getCpuUsage(), Labels.of("Key", "SomeWork"));
          }
        });
```
