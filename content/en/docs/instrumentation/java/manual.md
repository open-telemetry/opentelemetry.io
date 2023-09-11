---
title: Manual Instrumentation
linkTitle: Manual
aliases:
  - /docs/java/getting_started
  - /docs/java/manual_instrumentation
  - /docs/instrumentation/java/manual_instrumentation
weight: 30
description: Manual instrumentation for OpenTelemetry Java
cSpell:ignore: autoconfigure classpath customizer logback loggable multivalued
---

<!-- markdownlint-disable no-duplicate-heading -->

{{% docs/instrumentation/manual-intro %}}

## Setup

The first step is to get a handle to an instance of the `OpenTelemetry`
interface.

If you are an application developer, you need to configure an instance of the
`OpenTelemetrySdk` as early as possible in your application. This can be done
using the `OpenTelemetrySdk.builder()` method. The returned
`OpenTelemetrySdkBuilder` instance gets the providers related to the signals,
tracing and metrics, in order to build the `OpenTelemetry` instance.

You can build the providers by using the `SdkTracerProvider.builder()` and
`SdkMeterProvider.builder()` methods. It is also strongly recommended to define
a `Resource` instance as a representation of the entity producing the telemetry;
in particular the `service.name` attribute is the most important piece of
telemetry source-identifying info.

### Maven

```xml
<project>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.opentelemetry</groupId>
                <artifactId>opentelemetry-bom</artifactId>
                <version>{{% param javaVersion %}}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-api</artifactId>
        </dependency>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-sdk</artifactId>
        </dependency>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-exporter-otlp</artifactId>
        </dependency>
        <dependency>
            <!-- Not managed by opentelemetry-bom -->
            <groupId>io.opentelemetry.semconv</groupId>
            <artifactId>opentelemetry-semconv</artifactId>
            <version>{{% param semconvJavaVersion %}}-alpha</version>
        </dependency>
    </dependencies>
</project>
```

See [releases][releases] for a full list of artifact coordinates.

See [semantic-conventions-java][semantic-conventions-java] for semantic
conventions releases.

### Gradle

```kotlin
dependencies {
    implementation 'io.opentelemetry:opentelemetry-api:{{% param javaVersion %}}'
    implementation 'io.opentelemetry:opentelemetry-sdk:{{% param javaVersion %}}'
    implementation 'io.opentelemetry:opentelemetry-exporter-otlp:{{% param javaVersion %}}'
    implementation 'io.opentelemetry.semconv:opentelemetry-semconv:{{% param semconvJavaVersion %}}"-alpha'
}
```

See [releases][releases] for a full list of artifact coordinates.

See [semantic-conventions-java][semantic-conventions-java] for semantic
conventions releases.

### Imports

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.exporter.otlp.metrics.OtlpGrpcMetricExporter;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.exporter.otlp.logs.OtlpGrpcLogRecordExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.logs.SdkLoggerProvider;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;
import io.opentelemetry.semconv.ResourceAttributes;
```

### Example

```java
Resource resource = Resource.getDefault()
  .merge(Resource.create(Attributes.of(ResourceAttributes.SERVICE_NAME, "logical-service-name")));

SdkTracerProvider sdkTracerProvider = SdkTracerProvider.builder()
  .addSpanProcessor(BatchSpanProcessor.builder(OtlpGrpcSpanExporter.builder().build()).build())
  .setResource(resource)
  .build();

SdkMeterProvider sdkMeterProvider = SdkMeterProvider.builder()
  .registerMetricReader(PeriodicMetricReader.builder(OtlpGrpcMetricExporter.builder().build()).build())
  .setResource(resource)
  .build();

SdkLoggerProvider sdkLoggerProvider = SdkLoggerProvider.builder()
  .addLogRecordProcessor(BatchLogRecordProcessor.builder(OtlpGrpcLogRecordExporter.builder().build()).build())
  .setResource(resource)
  .build();

OpenTelemetry openTelemetry = OpenTelemetrySdk.builder()
  .setTracerProvider(sdkTracerProvider)
  .setMeterProvider(sdkMeterProvider)
  .setLoggerProvider(sdkLoggerProvider)
  .setPropagators(ContextPropagators.create(W3CTraceContextPropagator.getInstance()))
  .buildAndRegisterGlobal();
```

As an aside, if you are writing library instrumentation, it is strongly
recommended that you provide your users the ability to inject an instance of
`OpenTelemetry` into your instrumentation code. If this is not possible for some
reason, you can fall back to using an instance from the `GlobalOpenTelemetry`
class. Note that you can't force end users to configure the global, so this is
the most brittle option for library instrumentation.

## Traces

### Acquiring a Tracer

To do [Tracing](/docs/concepts/signals/traces/) you'll need to acquire a
[`Tracer`](/docs/concepts/signals/traces/#tracer).

**Note:** Methods of the OpenTelemetry SDK should never be called.

First, a `Tracer` must be acquired, which is responsible for creating spans and
interacting with the [Context](#context-propagation). A tracer is acquired by
using the OpenTelemetry API specifying the name and version of the [library
instrumenting][instrumentation library] the [instrumented library] or
application to be monitored. More information is available in the specification
chapter [Obtaining a Tracer].

```java
import io.opentelemetry.api;

//...

Tracer tracer =
    openTelemetry.getTracer("instrumentation-library-name", "1.0.0");
```

Important: the "name" and optional version of the tracer are purely
informational. All `Tracer`s that are created by a single `OpenTelemetry`
instance will interoperate, regardless of name.

### Create Spans

To create [Spans](/docs/concepts/signals/traces/#spans), you only need to
specify the name of the span. The start and end time of the span is
automatically set by the OpenTelemetry SDK.

```java
Span span = tracer.spanBuilder("my span").startSpan();

// Make the span the current span
try (Scope ss = span.makeCurrent()) {
  // In this scope, the span is the current/active span
} finally {
    span.end();
}
```

It's required to call `end()` to end the span when you want it to end.

### Create nested Spans

Most of the time, we want to correlate
[spans](/docs/concepts/signals/traces/#spans) for nested operations.
OpenTelemetry supports tracing within processes and across remote processes. For
more details how to share context between remote processes, see
[Context Propagation](#context-propagation).

For a method `a` calling a method `b`, the spans could be manually linked in the
following way:

```java
void parentOne() {
  Span parentSpan = tracer.spanBuilder("parent").startSpan();
  try {
    childOne(parentSpan);
  } finally {
    parentSpan.end();
  }
}

void childOne(Span parentSpan) {
  Span childSpan = tracer.spanBuilder("child")
        .setParent(Context.current().with(parentSpan))
        .startSpan();
  try {
    // do stuff
  } finally {
    childSpan.end();
  }
}
```

The OpenTelemetry API offers also an automated way to propagate the parent span
on the current thread:

```java
void parentTwo() {
  Span parentSpan = tracer.spanBuilder("parent").startSpan();
  try(Scope scope = parentSpan.makeCurrent()) {
    childTwo();
  } finally {
    parentSpan.end();
  }
}
void childTwo() {
  Span childSpan = tracer.spanBuilder("child")
    // NOTE: setParent(...) is not required;
    // `Span.current()` is automatically added as the parent
    .startSpan();
  try(Scope scope = childSpan.makeCurrent()) {
    // do stuff
  } finally {
    childSpan.end();
  }
}
```

To link spans from remote processes, it is sufficient to set the
[Remote Context](#context-propagation) as parent.

```java
Span childRemoteParent = tracer.spanBuilder("Child").setParent(remoteContext).startSpan();
```

### Get the current span

Sometimes it's helpful to do something with the current/active
[span](/docs/concepts/signals/traces/#spans) at a particular point in program
execution.

```java
Span span = Span.current()
```

And if you want the current span for a particular `Context` object:

```java
Span span = Span.fromContext(context)
```

### Span Attributes

In OpenTelemetry [spans](/docs/concepts/signals/traces/#spans) can be created
freely and it's up to the implementor to annotate them with attributes specific
to the represented operation.
[Attributes](/docs/concepts/signals/traces/#attributes) provide additional
context on a span about the specific operation it tracks, such as results or
operation properties.

```java
Span span = tracer.spanBuilder("/resource/path").setSpanKind(SpanKind.CLIENT).startSpan();
span.setAttribute("http.method", "GET");
span.setAttribute("http.url", url.toString());
```

### Semantic Attributes

There are semantic conventions for spans representing operations in well-known
protocols like HTTP or database calls. Semantic conventions for these spans are
defined in the specification at
[Trace Semantic Conventions](/docs/specs/otel/trace/semantic_conventions/).

First add the semantic conventions as a dependency to your application:

#### Maven

```xml
<dependency>
    <groupId>io.opentelemetry.semconv</groupId>
    <artifactId>opentelemetry-semconv</artifactId>
    <version>{{% param semconvJavaVersion %}}-alpha</version>
</dependency>
```

#### Gradle

```kotlin
dependencies {
  implementation("io.opentelemetry.semconv:opentelemetry-semconv:{{% param semconvJavaVersion %}}-alpha")
}
```

Finally, you can update your file to include semantic attributes:

```java
Span span = tracer.spanBuilder("/resource/path").setSpanKind(SpanKind.CLIENT).startSpan();
span.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
span.setAttribute(SemanticAttributes.HTTP_URL, url.toString());
```

### Create Spans with events

[Spans](/docs/concepts/signals/traces/#spans) can be annotated with named events
(called [Span Events](/docs/concepts/signals/traces/#span-events)) that can
carry zero or more [Span Attributes](#span-attributes), each of which itself is
a key:value map paired automatically with a timestamp.

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

### Create Spans with links

A [Span](/docs/concepts/signals/traces/#spans) may be linked to zero or more
other Spans that are causally related via a
[Span Link](/docs/concepts/signals/traces/#span-links). Links can be used to
represent batched operations where a Span was initiated by multiple initiating
Spans, each representing a single incoming item being processed in the batch.

```java
Span child = tracer.spanBuilder("childWithLink")
        .addLink(parentSpan1.getSpanContext())
        .addLink(parentSpan2.getSpanContext())
        .addLink(parentSpan3.getSpanContext())
        .addLink(remoteSpanContext)
    .startSpan();
```

For more details how to read context from remote processes, see
[Context Propagation](#context-propagation).

### Set span status

A [status](/docs/concepts/signals/traces/#span-status) can be set on a
[span](/docs/concepts/signals/traces/#spans), typically used to specify that a
span has not completed successfully - `SpanStatus.Error`. In rare scenarios, you
could override the `Error` status with `OK`, but don't set `OK` on
successfully-completed spans.

The status can be set at any time before the span is finished:

```java
Span span = tracer.spanBuilder("my span").startSpan();
// put the span into the current Context
try (Scope scope = span.makeCurrent()) {
	// do something
} catch (Throwable t) {
  span.setStatus(StatusCode.ERROR, "Something bad happened!");
  throw t;
} finally {
  span.end(); // Cannot set a span after this call
}
```

### Record exceptions in spans

It can be a good idea to record exceptions when they happen. It's recommended to
do this in conjunction with setting [span status](#set-span-status).

```java
Span span = tracer.spanBuilder("my span").startSpan();
// put the span into the current Context
try (Scope scope = span.makeCurrent()) {
	// do something
} catch (Throwable throwable) {
  span.setStatus(StatusCode.ERROR, "Something bad happened!");
  span.recordException(throwable);
} finally {
  span.end(); // Cannot set a span after this call
}
```

This will capture things like the current stack trace in the span.

### Context Propagation

OpenTelemetry provides a text-based approach to propagate context to remote
services using the [W3C Trace Context](https://www.w3.org/TR/trace-context/)
HTTP headers.

The following presents an example of an outgoing HTTP request using
`HttpURLConnection`.

```java
// Tell OpenTelemetry to inject the context in the HTTP headers
TextMapSetter<HttpURLConnection> setter =
  new TextMapSetter<HttpURLConnection>() {
    @Override
    public void set(HttpURLConnection carrier, String key, String value) {
        // Insert the context as Header
        carrier.setRequestProperty(key, value);
    }
};

URL url = new URL("http://127.0.0.1:8080/resource");
Span outGoing = tracer.spanBuilder("/resource").setSpanKind(SpanKind.CLIENT).startSpan();
try (Scope scope = outGoing.makeCurrent()) {
  // Use the Semantic Conventions.
  // (Note that to set these, Span does not *need* to be the current instance in Context or Scope.)
  outGoing.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
  outGoing.setAttribute(SemanticAttributes.HTTP_URL, url.toString());
  HttpURLConnection transportLayer = (HttpURLConnection) url.openConnection();
  // Inject the request with the *current*  Context, which contains our current Span.
  openTelemetry.getPropagators().getTextMapPropagator().inject(Context.current(), transportLayer, setter);
  // Make outgoing call
} finally {
  outGoing.end();
}
...
```

Similarly, the text-based approach can be used to read the W3C Trace Context
from incoming requests. The following presents an example of processing an
incoming HTTP request using [HttpExchange][].

```java
TextMapGetter<HttpExchange> getter =
  new TextMapGetter<>() {
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
  Context extractedContext = openTelemetry.getPropagators().getTextMapPropagator()
        .extract(Context.current(), httpExchange, getter);
  try (Scope scope = extractedContext.makeCurrent()) {
    // Automatically use the extracted SpanContext as parent.
    Span serverSpan = tracer.spanBuilder("GET /resource")
        .setSpanKind(SpanKind.SERVER)
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

The following code presents an example to read the W3C Trace Context from
incoming request, add spans, and further propagate the context. The example
utilizes
[HttpHeaders](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpHeaders.html)
to fetch the traceparent header for context propagation.

```java
TextMapGetter<HttpHeaders> getter =
  new TextMapGetter<HttpHeaders>() {
    @Override
    public String get(HttpHeaders headers, String s) {
      assert headers != null;
      return headers.getHeaderString(s);
    }

    @Override
    public Iterable<String> keys(HttpHeaders headers) {
      List<String> keys = new ArrayList<>();
      MultivaluedMap<String, String> requestHeaders = headers.getRequestHeaders();
      requestHeaders.forEach((k, v) ->{
        keys.add(k);
      });
    }
};

TextMapSetter<HttpURLConnection> setter =
  new TextMapSetter<HttpURLConnection>() {
    @Override
    public void set(HttpURLConnection carrier, String key, String value) {
        // Insert the context as Header
        carrier.setRequestProperty(key, value);
    }
};

//...
public void handle(<Library Specific Annotation> HttpHeaders headers){
        Context extractedContext = opentelemetry.getPropagators().getTextMapPropagator()
                .extract(Context.current(), headers, getter);
        try (Scope scope = extractedContext.makeCurrent()) {
            // Automatically use the extracted SpanContext as parent.
            Span serverSpan = tracer.spanBuilder("GET /resource")
                .setSpanKind(SpanKind.SERVER)
                .startSpan();

            try(Scope ignored = serverSpan.makeCurrent()) {
                // Add the attributes defined in the Semantic Conventions
                serverSpan.setAttribute(SemanticAttributes.HTTP_METHOD, "GET");
                serverSpan.setAttribute(SemanticAttributes.HTTP_SCHEME, "http");
                serverSpan.setAttribute(SemanticAttributes.HTTP_HOST, "localhost:8080");
                serverSpan.setAttribute(SemanticAttributes.HTTP_TARGET, "/resource");

                HttpURLConnection transportLayer = (HttpURLConnection) url.openConnection();
                // Inject the request with the *current*  Context, which contains our current Span.
                openTelemetry.getPropagators().getTextMapPropagator().inject(Context.current(), transportLayer, setter);
                // Make outgoing call
            }finally {
                serverSpan.end();
            }
      }
}
```

## Metrics

[Spans](/docs/concepts/signals/traces/#spans) provide detailed information about
your application, but produce data that is proportional to the load on the
system. In contrast, [metrics](/docs/concepts/signals/metrics) combine
individual measurements into aggregations, and produce data which is constant as
a function of system load. The aggregations lack details required to diagnose
low level issues, but complement spans by helping to identify trends and
providing application runtime telemetry.

The metrics API defines a variety of instruments. Instruments record
measurements, which are aggregated by the metrics SDK and eventually exported
out of process. Instruments come in synchronous and asynchronous varieties.
Synchronous instruments record measurements as they happen. Asynchronous
instrument register a callback, which is invoked once per collection, and which
records measurements at that point in time. The following instruments are
available:

- `LongCounter`/`DoubleCounter`: records only positive values, with synchronous
  and asynchronous options. Useful for counting things, such as the number of
  bytes sent over a network. Counter measurements are aggregated to
  always-increasing monotonic sums by default.
- `LongUpDownCounter`/`DoubleUpDownCounter`: records positive and negative
  values, with synchronous and asynchronous options. Useful for counting things
  that go up and down, like the size of a queue. Up down counter measurements
  are aggregated to non-monotonic sums by default.
- `LongGauge`/`DoubleGauge`: measures an instantaneous value with an
  asynchronous callback. Useful for recording values that can't be merged across
  attributes, like CPU utilization percentage. Gauge measurements are aggregated
  as gauges by default.
- `LongHistogram`/`DoubleHistogram`: records measurements that are most useful
  to analyze as a histogram distribution. No asynchronous option is available.
  Useful for recording things like the duration of time spent by an HTTP server
  processing a request. Histogram measurements are aggregated to explicit bucket
  histograms by default.

**Note**: The asynchronous varieties of counter and up down counter assume that
the registered callback is observing the cumulative sum. For example, if you
register an asynchronous counter whose callback records bytes sent over a
network, it must record the cumulative sum of all bytes sent over the network,
rather than trying to compute and record the difference since last call.

All metrics can be annotated with attributes: additional qualifiers that help
describe what subdivision of the measurements the metric represents.

The following is an example of counter usage:

```java
OpenTelemetry openTelemetry = // obtain instance of OpenTelemetry

// Gets or creates a named meter instance
Meter meter = openTelemetry.meterBuilder("instrumentation-library-name")
        .setInstrumentationVersion("1.0.0")
        .build();

// Build counter e.g. LongCounter
LongCounter counter = meter
      .counterBuilder("processed_jobs")
      .setDescription("Processed jobs")
      .setUnit("1")
      .build();

// It is recommended that the API user keep a reference to Attributes they will record against
Attributes attributes = Attributes.of(AttributeKey.stringKey("Key"), "SomeWork");

// Record data
counter.add(123, attributes);
```

The following is an example of usage of an asynchronous instrument:

```java
// Build an asynchronous instrument, e.g. Gauge
meter
  .gaugeBuilder("cpu_usage")
  .setDescription("CPU Usage")
  .setUnit("ms")
  .buildWithCallback(measurement -> {
    measurement.record(getCpuUsage(), Attributes.of(AttributeKey.stringKey("Key"), "SomeWork"));
  });
```

## Logs

Logs are distinct from Metrics and Tracing in that there is no user-facing logs
API. Instead, there is tooling to bridge logs from existing popular log
frameworks (e.g. SLF4j, JUL, Logback, Log4j) into the OpenTelemetry ecosystem.

The two typical workflows discussed below each cater to different application
requirements.

### Direct to collector

In the direct to collector workflow, logs are emitted directly from an
application to a collector using a network protocol (e.g. OTLP). This workflow
is simple to set up as it doesn't require any additional log forwarding
components, and allows an application to easily emit structured logs that
conform to the [log data model][log data model]. However, the overhead required
for applications to queue and export logs to a network location may not be
suitable for all applications.

To use this workflow:

- Install appropriate [Log Appender](#log-appenders).
- Configure the OpenTelemetry [Log SDK](#logs-sdk) to export log records to
  desired target destination (the [collector][opentelemetry collector] or
  other).

#### Log appenders

A log appender bridges logs from a log framework into the OpenTelemetry
[Log SDK](#logs-sdk) using the [Logs Bridge API][logs bridge API]. Log appenders
are available for various popular Java log frameworks:

- [Log4j2 Appender][log4j2 appender]
- [Logback Appender][logback appender]

The links above contain full usage and installation documentation, but
installation is generally as follows:

- Add required dependency via gradle or maven.
- Extend the application's log configuration (i.e. `logback.xml`, `log4j.xml`,
  etc) to include a reference to the OpenTelemetry log appender.
  - Optionally configure the log framework to determine which logs (i.e. filter
    by severity or logger name) are passed to the appender.
  - Optionally configure the appender to indicate how logs are mapped to
    OpenTelemetry Log Records (i.e. capture thread information, context data,
    markers, etc).

Log appenders automatically include the trace context in log records, enabling
log correlation with traces.

The [Log Appender example][log appender example] demonstrates setup for a
variety of scenarios.

### Via file or stdout

In the file or stdout workflow, logs are written to files or standout output.
Another component (e.g. FluentBit) is responsible for reading / tailing the
logs, parsing them to more structured format, and forwarding them a target, such
as the collector. This workflow may be preferable in situations where
application requirements do not permit additional overhead from
[direct to collector](#direct-to-collector). However, it requires that all log
fields required down stream are encoded into the logs, and that the component
reading the logs parse the data into the [log data model][log data model]. The
installation and configuration of log forwarding components is outside the scope
of this document.

Log correlation with traces is available by installing
[log context instrumentation](#log-context-instrumentation).

#### Log context instrumentation

OpenTelemetry provides components which enrich log context with trace context
for various popular Java log frameworks:

- [Log4j context data instrumentation][log4j context instrumentation]
- [Logback MDC instrumentation][logback context instrumentation]

This links above contain full usage and installation documentation, but
installation is generally as follows:

- Add required dependency via gradle or maven.
- Extend the application's log configuration (i.e. `logback.xml` or `log4j.xml`,
  etc) to reference the trace context fields in the log pattern.

## SDK Configuration

The configuration examples reported in this document only apply to the SDK
provided by `opentelemetry-sdk`. Other implementation of the API might provide
different configuration mechanisms.

### Tracing SDK

The application has to install a span processor with an exporter and may
customize the behavior of the OpenTelemetry SDK.

For example, a basic configuration instantiates the SDK tracer provider and sets
to export the traces to a logging stream.

```java
SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
  .addSpanProcessor(BatchSpanProcessor.builder(LoggingSpanExporter.create()).build())
  .build();
```

#### Sampler

It is not always feasible to trace and export every user request in an
application. In order to strike a balance between observability and expenses,
traces can be sampled.

The OpenTelemetry SDK offers four samplers out of the box:

- [AlwaysOnSampler] which samples every trace regardless of upstream sampling
  decisions.
- [AlwaysOffSampler] which doesn't sample any trace, regardless of upstream
  sampling decisions.
- [ParentBased] which uses the parent span to make sampling decisions, if
  present.
- [TraceIdRatioBased] which samples a configurable percentage of traces, and
  additionally samples any trace that was sampled upstream.

Additional samplers can be provided by implementing the
`io.opentelemetry.sdk.trace.Sampler` interface.

```java
SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
  .setSampler(Sampler.alwaysOn())
  //or
  .setSampler(Sampler.alwaysOff())
  //or
  .setSampler(Sampler.traceIdRatioBased(0.5))
  .build();
```

#### Span Processor

Different Span processors are offered by OpenTelemetry. The
`SimpleSpanProcessor` immediately forwards ended spans to the exporter, while
the `BatchSpanProcessor` batches them and sends them in bulk. Multiple Span
processors can be configured to be active at the same time using the
`MultiSpanProcessor`.

```java
SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
  .addSpanProcessor(SimpleSpanProcessor.create(LoggingSpanExporter.create()))
  .addSpanProcessor(BatchSpanProcessor.builder(LoggingSpanExporter.create()).build())
  .build();
```

#### Exporter

Span processors are initialized with an exporter which is responsible for
sending the telemetry data a particular backend. OpenTelemetry offers five
exporters out of the box:

- `InMemorySpanExporter`: keeps the data in memory, useful for testing and
  debugging.
- Jaeger Exporter: prepares and sends the collected telemetry data to a Jaeger
  backend via gRPC. Varieties include `JaegerGrpcSpanExporter` and
  `JaegerThriftSpanExporter`.
- `ZipkinSpanExporter`: prepares and sends the collected telemetry data to a
  Zipkin backend via the Zipkin APIs.
- Logging Exporter: saves the telemetry data into log streams. Varieties include
  `LoggingSpanExporter` and `OtlpJsonLoggingSpanExporter`.
- OpenTelemetry Protocol Exporter: sends the data in OTLP to the [OpenTelemetry
  Collector] or other OTLP receivers. Varieties include `OtlpGrpcSpanExporter`
  and `OtlpHttpSpanExporter`.

Other exporters can be found in the [OpenTelemetry Registry].

```java
ManagedChannel jaegerChannel = ManagedChannelBuilder.forAddress("localhost", 3336)
  .usePlaintext()
  .build();

JaegerGrpcSpanExporter jaegerExporter = JaegerGrpcSpanExporter.builder()
  .setEndpoint("localhost:3336")
  .setTimeout(30, TimeUnit.SECONDS)
  .build();

SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
  .addSpanProcessor(BatchSpanProcessor.builder(jaegerExporter).build())
  .build();
```

### Metrics SDK

The application has to install a metric reader with an exporter, and may further
customize the behavior of the OpenTelemetry SDK.

For example, a basic configuration instantiates the SDK meter provider and sets
to export the metrics to a logging stream.

```java
SdkMeterProvider meterProvider = SdkMeterProvider.builder()
  .registerMetricReader(PeriodicMetricReader.builder(LoggingMetricExporter.create()).build())
  .build();
```

#### Metric Reader

Metric readers read aggregated metrics.

```java
SdkMeterProvider meterProvider = SdkMeterProvider.builder()
  .registerMetricReader(...)
  .build();
```

OpenTelemetry provides a variety of metric readers out of the box:

- `PeriodicMetricReader`: reads metrics on a configurable interval and pushes to
  a `MetricExporter`.
- `InMemoryMetricReader`: reads metrics into memory, useful for debugging and
  testing.
- `PrometheusHttpServer` (alpha): an HTTP server that reads metrics and
  serializes to Prometheus text format.

Custom metric reader implementations are not currently supported.

#### Exporter

The `PeriodicMetricReader` is paired with a metric exporter, which is
responsible for sending the telemetry data to a particular backend.
OpenTelemetry provides the following exporters out of the box:

- `InMemoryMetricExporter`: keeps the data in memory, useful for testing and
  debugging.
- Logging Exporter: saves the telemetry data into log streams. Varieties include
  `LoggingMetricExporter` and `OtlpJsonLoggingMetricExporter`.
- OpenTelemetry Protocol Exporter: sends the data in OTLP to the [OpenTelemetry
  Collector] or other OTLP receivers. Varieties include `OtlpGrpcMetricExporter`
  and `OtlpHttpMetricExporter`.

Other exporters can be found in the [OpenTelemetry Registry].

#### Views

Views provide a mechanism for controlling how measurements are aggregated into
metrics. They consist of an `InstrumentSelector` and a `View`. The instrument
selector consists of a series of options for selecting which instruments the
view applies to. Instruments can be selected by a combination of name, type,
meter name, meter version, and meter schema URL. The view describes how
measurement should be aggregated. The view can change the name, description, the
aggregation, and define the set of attribute keys that should be retained.

```java
SdkMeterProvider meterProvider = SdkMeterProvider.builder()
  .registerView(
    InstrumentSelector.builder()
      .setName("my-counter") // Select instrument(s) called "my-counter"
      .build(),
    View.builder()
      .setName("new-counter-name") // Change the name to "new-counter-name"
      .build())
  .registerMetricReader(...)
  .build()
```

Every instrument has a default view, which retains the original name,
description, and attributes, and has a default aggregation that is based on the
type of instrument. When a registered view matches an instrument, the default
view is replaced by the registered view. Additional registered views that match
the instrument are additive, and result in multiple exported metrics for the
instrument.

### Logs SDK

The logs SDK dictates how logs are processed when using the
[direct to collector](#direct-to-collector) workflow. No log SDK is needed when
using the [log forwarding](#via-file-or-stdout) workflow.

The typical log SDK configuration installs a log record processor and exporter.
For example, the following installs the
[BatchLogRecordProcessor](#logrecord-processor), which periodically exports to a
network location via the [OtlpGrpcLogRecordExporter](#logrecord-exporter):

```java
SdkLoggerProvider loggerProvider = SdkLoggerProvider.builder()
  .addLogRecordProcessor(
    BatchLogRecordProcessor.builder(
      OtlpGrpcLogRecordExporter.builder()
          .setEndpoint("http://localhost:4317")
          .build())
      .build())
  .build();
```

#### LogRecord Processor

LogRecord processors process LogRecords emitted by
[log appenders](#log-appenders).

OpenTelemetry provides the following LogRecord processors out of the box:

- `BatchLogRecordProcessor`: periodically sends batches of LogRecords to a
  [LogRecordExporter](#logrecord-exporter).
- `SimpleLogRecordProcessor`: immediately sends each LogRecord to a
  [LogRecordExporter](#logrecord-exporter).

Custom LogRecord processors are supported by implementing the
`LogRecordProcessor` interface. Common use cases include enriching the
LogRecords with contextual data like baggage, or filtering / obfuscating
sensitive data.

#### LogRecord Exporter

`BatchLogRecordProcessor` and `SimpleLogRecordProcessor` are paired with
`LogRecordExporter`, which is responsible for sending telemetry data to a
particular backend. OpenTelemetry provides the following exporters out of the
box:

- OpenTelemetry Protocol Exporter: sends the data in OTLP to the [OpenTelemetry
  Collector] or other OTLP receivers. Varieties include
  `OtlpGrpcLogRecordExporter` and `OtlpHttpLogRecordExporter`.
- `InMemoryLogRecordExporter`: keeps the data in memory, useful for testing and
  debugging.
- Logging Exporter: saves the telemetry data into log streams. Varieties include
  `SystemOutLogRecordExporter` and `OtlpJsonLoggingLogRecordExporter`. Note:
  `OtlpJsonLoggingLogRecordExporter` logs to JUL, and may cause infinite loops
  (i.e. JUL -> SLF4J -> Logback -> OpenTelemetry Appender -> OpenTelemetry Log
  SDK -> JUL) if not carefully configured.

Custom exporters are supported by implementing the `LogRecordExporter`
interface.

### Auto Configuration

Instead of manually creating the `OpenTelemetry` instance by using the SDK
builders directly from your code, it is also possible to use the SDK
auto-configuration extension through the
`opentelemetry-sdk-extension-autoconfigure` module.

This module is made available by adding the following dependency to your
application.

```xml
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-sdk-extension-autoconfigure</artifactId>
</dependency>
```

It allows you to auto-configure the OpenTelemetry SDK based on a standard set of
supported environment variables and system properties. Each environment variable
has a corresponding system property named the same way but as lower case and
using the `.` (dot) character instead of the `_` (underscore) as separator.

The logical service name can be specified via the `OTEL_SERVICE_NAME`
environment variable (or `otel.service.name` system property).

The traces, metrics or logs exporters can be set via the `OTEL_TRACES_EXPORTER`,
`OTEL_METRICS_EXPORTER` and `OTEL_LOGS_EXPORTER` environment variables. For
example `OTEL_TRACES_EXPORTER=jaeger` configures your application to use the
Jaeger exporter. The corresponding Jaeger exporter library has to be provided in
the classpath of the application as well.

It's also possible to set up the propagators via the `OTEL_PROPAGATORS`
environment variable, like for example using the `tracecontext` value to use
[W3C Trace Context](https://www.w3.org/TR/trace-context/).

For more details, see all the supported configuration options in the module's
[README](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure).

The SDK auto-configuration has to be initialized from your code in order to
allow the module to go through the provided environment variables (or system
properties) and set up the `OpenTelemetry` instance by using the builders
internally.

```java
OpenTelemetrySdk sdk = AutoConfiguredOpenTelemetrySdk.initialize()
    .getOpenTelemetrySdk();
```

When environment variables or system properties are not sufficient, you can use
some extension points provided through the auto-configure
[SPI](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure-spi)
and several methods in the `AutoConfiguredOpenTelemetrySdk` class.

Following an example with a code snippet for adding an additional custom span
processor.

```java
AutoConfiguredOpenTelemetrySdk.builder()
        .addTracerProviderCustomizer(
            (sdkTracerProviderBuilder, configProperties) ->
                sdkTracerProviderBuilder.addSpanProcessor(
                    new SpanProcessor() { /* implementation omitted for brevity */ }))
        .build();
```

## SDK Logging and Error Handling

OpenTelemetry uses
[java.util.logging](https://docs.oracle.com/javase/7/docs/api/java/util/logging/package-summary.html)
to log information about OpenTelemetry, including errors and warnings about
misconfigurations or failures exporting data.

By default, log messages are handled by the root handler in your application. If
you have not installed a custom root handler for your application, logs of level
`INFO` or higher are sent to the console by default.

You may want to change the behavior of the logger for OpenTelemetry. For
example, you can reduce the logging level to output additional information when
debugging, increase the level for a particular class to ignore errors coming
from that class, or install a custom handler or filter to run custom code
whenever OpenTelemetry logs a particular message.

### Examples

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
// Custom filter which does not log errors that come from the export
public class IgnoreExportErrorsFilter implements Filter {

 public boolean isLoggable(LogRecord record) {
    return !record.getMessage().contains("Exception thrown by the export");
 }
}
```

```properties
## Registering the custom filter on the BatchSpanProcessor
io.opentelemetry.sdk.trace.export.BatchSpanProcessor = io.opentelemetry.extension.logging.IgnoreExportErrorsFilter
```

[alwaysoffsampler]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/samplers/AlwaysOffSampler.java
[alwaysonsampler]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/samplers/AlwaysOnSampler.java
[httpexchange]:
  https://docs.oracle.com/javase/8/docs/jre/api/net/httpserver/spec/com/sun/net/httpserver/HttpExchange.html
[instrumentation library]: /docs/specs/otel/glossary/#instrumentation-library
[instrumented library]: /docs/specs/otel/glossary/#instrumented-library
[logs bridge API]: /docs/specs/otel/logs/bridge-api
[log data model]: /docs/specs/otel/logs/data-model
[log4j2 appender]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-appender-2.17/library
[logback appender]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/library
[log appender example]:
  https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/log-appender
[log4j context instrumentation]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-context-data/log4j-context-data-2.17/library-autoconfigure
[logback context instrumentation]:
  https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-mdc-1.0/library
[obtaining a tracer]: /docs/specs/otel/trace/api/#get-a-tracer
[opentelemetry collector]:
  https://github.com/open-telemetry/opentelemetry-collector
[opentelemetry registry]: /ecosystem/registry/?component=exporter&language=java
[parentbased]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/samplers/ParentBasedSampler.java
[releases]: https://github.com/open-telemetry/opentelemetry-java#releases
[semantic-conventions-java]:
  https://github.com/open-telemetry/semantic-conventions-java/releases
[traceidratiobased]:
  https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk/trace/src/main/java/io/opentelemetry/sdk/trace/samplers/TraceIdRatioBasedSampler.java
