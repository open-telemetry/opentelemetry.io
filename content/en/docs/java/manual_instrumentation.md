---
Title: "Manual Instrumentation"
Weight: 3
---

## Traces

### Instantiate `TracerProvider`

In the [OpenTelemetry Tracing
API](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md),
the `TracerProvider` is the main entry point and is expected to be the stateful
object that holds any configuration. The `TracerProvider` provides access
to the [`Tracer`](#instantiate-tracer).

```java
TracerProvider tracerProvider =
    OpenTelemetry.getGlobalTracerProvider();
```

### Instantiate `Tracer`

In order to instrument, you must acquire a `Tracer`. A `Tracer` is responsible for
creating spans. To acquire a `Tracer` use the [OpenTelemetry Tracing
API](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md)
and specify the name and version of the [library
instrumenting](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/glossary.md#instrumentation-library)
the [instrumented
library](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/glossary.md#instrumented-library)
or application to be monitored.

```java
Tracer tracer =
    tracerProvider.getTracer("instrumentation-library-name","1.0.0");
```

### Create Spans

#### Basic

To create a basic span, you only need to specify the name of the span. The
start and end time of the span is automatically set by the OpenTelemetry SDK.

```java
Span span = tracer.spanBuilder("my span").startSpan();
try (Scope scope = span.makeCurrent()) {
	// your use case
	...
} catch (Throwable t) {
    span.setStatus(StatusCode.ERROR, "Change it to your error message");
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
        .setParent(Context.current().with(parentSpan))
        .startSpan();
  // do stuff
  childSpan.end();
}
```

The OpenTelemetry API also offers an automated way to propagate the parentSpan:

```java
void a() {
  Span parentSpan = tracer.spanBuilder("a").startSpan();
  try(Scope scope = parentSpan.makeCurrent()) {
    b();
  } finally {
    parentSpan.end();
  }
}
void b() {
  Span childSpan = tracer.spanBuilder("b")
    // NOTE: setting the parent Context explicitly is not required; 
    // The span in the Context on the current thread is automatically added as parent
    .startSpan();
  try(Scope scope = childSpan.makeCurrent()) {
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

In OpenTelemetry, you can create spans freely. It's up to the implementor to
annotate spans with attributes specific to the represented operation. Attributes
provide additional context on a span about the specific operation it tracks,
such as results or operation properties.

```java
Span span = tracer.spanBuilder("/resource/path").setSpanKind(Span.Kind.CLIENT).startSpan();
span.setAttribute("http.method", "GET");
span.setAttribute("http.url", url.toString());
```

Some of these operations represent calls that use well-known protocols like
HTTP or database calls. For these operations, OpenTelemetry requires specific attributes
to be set. The full attribute list is available in the Semantic Conventions in
the cross-language specification. And, the standard attribute keys are available in the 
`io.opentelemetry.api.trace.attributes.SemanticAttributes` class as constants.

#### Events

Spans can be annotated with named events that can carry zero or more [Span
Attributes](#attributes), each of which is itself a name/value map paired
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

You can link a span to zero or more other spans that are causally related.
Use links to represent batched operations where a span was initiated by
multiple initiating spans, each representing a single incoming item being
processed in the batch.

```java
Span child = tracer.spanBuilder("childWithLink")
        .addLink(parentSpan1.getSpanContext())
        .addLink(parentSpan2.getSpanContext())
        .addLink(parentSpan3.getSpanContext())
        .addLink(remoteContext)
    .startSpan();
```

For more information about how to read context from remote processes, see [Context
Propagation](#context-propagation).

### Context Propagation

OpenTelemetry provides a text-based approach to propagate context to remote
services. By default, the [W3C Trace Context](https://www.w3.org/TR/trace-context/)
format is used.

The following example shows an outgoing HTTP request using
`HttpURLConnection`:

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
try (Scope scope = outGoing.makeCurrent()) {
  // Semantic Convention.
  // (Observe that to set these, the Span does not *need* to be the current instance in Context or Scope.)
  outGoing.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
  outGoing.setAttribute(SemanticAttributes.HTTP_URL, url.toString());
  HttpURLConnection transportLayer = (HttpURLConnection) url.openConnection();
  // Inject the request with the *current*  Context, which contains our current Span.
  OpenTelemetry.getPropagators().getTextMapPropagator().inject(Context.current(), transportLayer, setter);
  // Make outgoing call
} finally {
  outGoing.end();
}
...
```

Similarly, you can use the text-based approach to read the W3C Trace Context
from incoming requests. The following example demonstrates processing an
incoming HTTP request using
[HttpExchange](https://docs.oracle.com/javase/8/docs/jre/api/net/httpserver/spec/com/sun/net/httpserver/HttpExchange.html):

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

    @Override
    public Iterable<String> keys(HttpExchange carrier) {
      return carrier.getRequestHeaders().keySet();
    } 
};
...
public void handle(HttpExchange httpExchange) {
  // Extract the SpanContext and other elements from the request.
  Context extractedContext = OpenTelemetry.getPropagators().getTextMapPropagator()
        .extract(Context.current(), httpExchange, getter);
  Span serverSpan = null;
  try (Scope scope = extractedContext.makeCurrent()) {
    // Automatically use the extracted SpanContext as parent.
    serverSpan = tracer.spanBuilder("GET /resource").setSpanKind(Span.Kind.SERVER)
        .startSpan();
    try {
      // Add the attributes defined in the Semantic Conventions
      serverSpan.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
      serverSpan.setAttribute(SemanticAttributes.HTTP_SCHEME, "http");
      serverSpan.setAttribute(SemanticAttributes.HTTP_HOST, "localhost:8080");
      serverSpan.setAttribute(SemanticAttributes.HTTP_TARGET, "/resource");
      // Serve the request
      ...
    } finally {
      serverSpan.end();
    }
  } 
}
```

Other propagators are available as extensions, most notably
[Zipkin
B3](https://github.com/open-telemetry/opentelemetry-java/tree/main/extensions/trace-propagators/src/main/java/io/opentelemetry/extension/trace/propagation).

### Configuring the default OpenTelemetry SDK

In order to configure the default OpenTelemetry SDK, you need to get a handle to a 
`TracerManagement` instance from the SDK:

```java
TracerSdkManagement tracerManagement = OpenTelemetrySdk.getGlobalTracerManagement();
```

### Processors

The following processors are available today:

#### SimpleSpanProcessor

This span processor exports spans immediately after they end.

Example:

```java
SimpleSpanProcessor simpleSpansProcessor = SimpleSpanProcessor.builder(exporter).build();
tracerManagement.addSpanProcessor(simpleSpansProcessor);
```

#### BatchSpanProcessor

This span processor exports spans in batches.

Example:

```java
BatchSpanProcessor batchSpansProcessor =
    BatchSpanProcessor.builder(exporter).build();
tracerManagement.addSpanProcessor(batchSpansProcessor);
```

You can also specify a variety of configuration parameters:

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
tracerManagement.addSpanProcessor(batchSpansProcessor);
```

#### MultiSpanProcessor

A MultiSpanProcessor accepts a list of span processors.

Example:

```java
SpanProcessor multiSpanProcessor =
    MultiSpanProcessor.create(Arrays.asList(simpleSpansProcessor, batchSpansProcessor));
tracerManagement.addSpanProcessor(multiSpanProcessor);
```

### Exporters

*TODO*

### Sampling

*TODO*

## Metrics

OpenTelemetry provides support for metrics, a time series of numbers that might
express things such as CPU utilization, request count for an HTTP server, or a
business metric such as transactions.

All metrics can be annotated with labels. Labels are additional qualifiers that help
describe what subdivision of the measurements the metric represents.

The following is an example of counter usage:

```java
// Gets or creates a named meter instance
Meter meter = OpenTelemetry.getGlobalMeter("instrumentation-library-name","semver:1.0.0");

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
