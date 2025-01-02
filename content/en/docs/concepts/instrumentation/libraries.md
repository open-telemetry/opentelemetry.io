---
title: Libraries
description: Learn how to add native instrumentation to your library.
aliases: [../instrumenting-library]
weight: 40
---

OpenTelemetry provides [instrumentation libraries][] for many libraries, which
is typically done through library hooks or monkey-patching library code.

Native library instrumentation with OpenTelemetry provides better observability
and developer experience for users, removing the need for libraries to expose
and document hooks. Other advantages provided by native instrumentation include:

- Custom logging hooks can be replaced by common and easy to use OpenTelemetry
  APIs, users will only interact with OpenTelemetry.
- Traces, logs, metrics from library and application code are correlated and
  coherent.
- Common conventions allow users to get similar and consistent telemetry within
  same technology and across libraries and languages.
- Telemetry signals can be fine tuned (filtered, processed, aggregated) for
  various consumption scenarios using a wide variety of well-documented
  OpenTelemetry extensibility points.

![ Native Instrumentation vs instrumentation libraries](../native-vs-libraries.svg)

## Semantic conventions

[Semantic conventions](/docs/specs/semconv/general/trace/) are the main source
of truth about what information is included on spans produced by web frameworks,
RPC clients, databases, messaging clients, infrastructure, and more. Conventions
make instrumentation consistent: users who work with telemetry don't have to
learn library specifics and observability vendors can build experiences for a
wide variety of technologies, for example databases or messaging systems. When
libraries follow conventions, many scenarios can be enabled without the user's
input or configuration.

Semantic conventions are always evolving and new conventions are constantly
added. If some don't exist for your library, consider
[adding them](https://github.com/open-telemetry/semantic-conventions/issues).
Pay special attention to span names: strive to use meaningful names and consider
cardinality when defining them. Also set the
[`schema_url`](/docs/specs/otel/schemas/#schema-url) attribute that you can use
to record what version of the semantic conventions you're using.

If you have any feedback or want to add a new convention, contribute by joining
the [Instrumentation Slack](https://cloud-native.slack.com/archives/C01QZFGMLQ7)
or by opening an issue or pull request in the
[Specification repository](https://github.com/open-telemetry/opentelemetry-specification).

### Defining spans

Think of your library from the perspective of a library user and what the user
might be interested in knowing about the behavior and activity of the library.
As the library maintainer, you know the internals, but the user will most likely
be less interested in the inner workings of the library and more interested in
the functionality of their application. Think about what information can be
helpful in analyzing the usage of your library, then think about an appropriate
way to model that data. Some aspects to consider include:

- Spans and span hierarchies
- Numerical attributes on spans, as an alternative to aggregated metrics
- Span events
- Aggregated Metrics

For example, if your library is making requests to a database, create spans only
for the logical request to the database. The physical requests over the network
should be instrumented within the libraries implementing that functionality. You
should also favor capturing other activities, like object/data serialization as
span events, rather than as additional spans.

Follow the semantic conventions when setting span attributes.

## When not to instrument

Some libraries are thin clients wrapping network calls. Chances are that
OpenTelemetry has an instrumentation library for the underlying RPC client.
Check out the [registry](/ecosystem/registry/)) to find existing libraries. If a
library exists, instrumenting the wrapper library might not be necessary.

As a general guideline, only instrument your library at its own level. Don't
instrument if all the following cases apply:

- Your library is a thin proxy on top of documented or self-explanatory APIs.
- OpenTelemetry has instrumentation for underlying network calls.
- There are no conventions your library should follow to enrich telemetry.

When in doubt, don't instrument. If you choose not to instrument, it might still
be useful to provide a way to configure OpenTelemetry handlers for your internal
RPC client instance. It's essential in languages that don't support fully
automatic instrumentation and still useful in others.

The rest of this document provides guidance on what and how to instrument your
application.

## OpenTelemetry API

The first step when instrumenting an application is to include the OpenTelemetry
API package as a dependency.

OpenTelemetry has [two main modules](/docs/specs/otel/overview/): API and SDK.
OpenTelemetry API is a set of abstractions and non-operational implementations.
Unless your application imports the OpenTelemetry SDK, your instrumentation does
nothing and does not impact application performance.

### Libraries should only use the OpenTelemetry API

If you're concerned about adding new dependencies, here are some considerations
to help you decide how to minimize dependency conflicts:

- OpenTelemetry Trace API reached stability in early 2021. It follows
  [Semantic Versioning 2.0](/docs/specs/otel/versioning-and-stability/).
- Use the earliest stable OpenTelemetry API (1.0.\*) and avoid updating it
  unless you have to use new features.
- While your instrumentation stabilizes, consider shipping it as a separate
  package, so that it never causes issues for users who don't use it. You can
  keep it in your repository, or
  [add it to OpenTelemetry](https://github.com/open-telemetry/opentelemetry-specification/blob/main/oteps/0155-external-modules.md#contrib-components),
  so it ships with other instrumentation libraries.
- Semantic conventions are [stable, but subject to evolution][]: while this does
  not cause any functional issues, you might need to update your instrumentation
  every once in a while. Having it in a preview plugin or in OpenTelemetry
  contrib repository may help keeping conventions up-to-date without breaking
  changes for your users.

  [stable, but subject to evolution]:
    /docs/specs/otel/versioning-and-stability/#semantic-conventions-stability

### Getting a tracer

All application configuration is hidden from your library through the Tracer
API. Libraries might allow applications to pass instances of `TracerProvider` to
facilitate dependency injection and ease of testing, or obtain it from
[global `TracerProvider`](/docs/specs/otel/trace/api/#get-a-tracer).
OpenTelemetry language implementations might have different preferences for
passing instances or accessing the global based on what's idiomatic in each
programming language.

When obtaining the tracer, provide your library (or tracing plugin) name and
version: they show up on the telemetry and help users process and filter
telemetry, understand where it came from, and debug or report instrumentation
issues.

## What to instrument

### Public APIs

Public APIs are good candidates for tracing: spans created for public API calls
allow users to map telemetry to application code, understand the duration and
outcome of library calls. Which calls to trace include:

- Public methods that make network calls internally or local operations that
  take significant time and may fail, for example I/O.
- Handlers that process requests or messages.

#### Instrumentation example

The following example shows how to instrument a Java application:

```java
private static Tracer tracer =  getTracer(TracerProvider.noop());

public static void setTracerProvider(TracerProvider tracerProvider) {
    tracer = getTracer(tracerProvider);
}

private static Tracer getTracer(TracerProvider tracerProvider) {
    return tracerProvider.getTracer("demo-db-client", "0.1.0-beta1");
}

private Response selectWithTracing(Query query) {
    // check out conventions for guidance on span names and attributes
    Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
            .setSpanKind(SpanKind.CLIENT)
            .setAttribute("db.name", dbName)
            ...
            .startSpan();

    // makes span active and allows correlating logs and nest spans
    try (Scope unused = span.makeCurrent()) {
        Response response = query.runWithRetries();
        if (response.isSuccessful()) {
            span.setStatus(StatusCode.OK);
        }

        if (span.isRecording()) {
           // populate response attributes for response codes and other information
        }
    } catch (Exception e) {
        span.recordException(e);
        span.setStatus(StatusCode.ERROR, e.getClass().getSimpleName());
        throw e;
    } finally {
        span.end();
    }
}
```

Follow conventions to populate attributes. If there is no applicable one, see
[general conventions](/docs/specs/semconv/general/attributes/).

### Nested network and other spans

Network calls are usually traced with OpenTelemetry auto-instrumentations
through corresponding client implementation.

![Nested database and HTTP spans in Jaeger UI](../nested-spans.svg)

If OpenTelemetry does not support tracing your network client, here are some
considerations to help you decide the best course of action:

- Would tracing network calls improve observability for users or your ability to
  support them?
- Is your library a wrapper on top of public, documented RPC API? Would users
  need to get support from the underlying service in case of issues?
  - Instrument the library and make sure to trace individual network tries.
- Would tracing those calls with spans be very verbose? or would it noticeably
  impact performance?
  - Use logs with verbosity or span events: logs can be correlated to parent
    (public API calls), while span events should be set on public API span.
  - If they have to be spans (to carry and propagate unique trace context), put
    them behind a configuration option and disable them by default.

If OpenTelemetry already supports tracing your network calls, you probably don't
want to duplicate it. There might be some exceptions:

- To support users without auto-instrumentation, which might not work in certain
  environments or when users have concerns with monkey-patching.
- To enable custom or legacy correlation and context propagation protocols with
  underlying service.
- Enrich RPC spans with essential library or service-specific information not
  covered by auto-instrumentation.

A generic solution to avoid duplication is under construction.

### Events

Traces are a kind of signal that your apps can emit. Events (or logs) and traces
complement, not duplicate, each other. Whenever you have something that should
have a certain level of verbosity, logs are a better choice than traces.

If your app uses logging or some similar module, the logging module might
already have OpenTelemetry integration. To find out, see the
[registry](/ecosystem/registry/). Integrations usually stamp active trace
context on all logs, so users can correlate them.

If your language and ecosystem don't have common logging support, use [span
events][] to share additional app details. Events maybe more convenient if you
want to add attributes as well.

As a rule of thumb, use events or logs for verbose data instead of spans. Always
attach events to the span instance that your instrumentation created. Avoid
using the active span if you can, since you don't control what it refers to.

## Context propagation

### Extracting context

If you work on a library or a service that receives upstream calls, such as a
web framework or a messaging consumer,extract context from the incoming request
or message. OpenTelemetry provides the `Propagator` API, which hides specific
propagation standards and reads the trace `Context` from the wire. In case of a
single response, there is just one context on the wire, which becomes the parent
of the new span the library creates.

After you create a span, pass new trace context to the application code
(callback or handler), by making the span active; if possible, do this
explicitly. The following Java example shows how to add trace context and
activate a span. See the
[Context extraction in Java](/docs/languages/java/api/#contextpropagators), for
more examples.

```java
// extract the context
Context extractedContext = propagator.extract(Context.current(), httpExchange, getter);
Span span = tracer.spanBuilder("receive")
            .setSpanKind(SpanKind.SERVER)
            .setParent(extractedContext)
            .startSpan();

// make span active so any nested telemetry is correlated
try (Scope unused = span.makeCurrent()) {
  userCode();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

In the case of a messaging system, you might receive more than one message at
once. Received messages become links on the span you create. Refer to
[messaging conventions](/docs/specs/semconv/messaging/messaging-spans/) for
details.

### Injecting context

When you make an outbound call, you usually want to propagate context to the
downstream service. In this case, create a new span to trace the outgoing call
and use `Propagator` API to inject context into the message. There might be
other cases where you might want to inject context, for example when creating
messages for async processing. The following Java example shows how to propagate
context. See
[Context injection in Java](/docs/languages/java/instrumentation/#context-propagation)
for more examples.

```java
Span span = tracer.spanBuilder("send")
            .setSpanKind(SpanKind.CLIENT)
            .startSpan();

// make span active so any nested telemetry is correlated
// even network calls might have nested layers of spans, logs or events
try (Scope unused = span.makeCurrent()) {
  // inject the context
  propagator.inject(Context.current(), transportLayer, setter);
  send();
} catch (Exception e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

There might be some exceptions where you don't need to propagate context:

- Downstream service does not support metadata or prohibits unknown fields.
- Downstream service does not define correlation protocols. Consider adding
  support for context propagation in a future version.
- Downstream service supports custom correlation protocol.
  - Best effort with custom propagator: use OpenTelemetry trace context if
    compatible or generate and stamp custom correlation IDs on the span.

### In-process

- Make your spans active or current, as this enables correlating spans with logs
  and any nested auto-instrumentations.
- If the library has a notion of context, support optional explicit trace
  context propagation in addition to active spans.
  - Put spans (trace context) created by library in the context explicitly,
    document how to access it.
  - Allow users to pass trace context in your context.
- Within the library, propagate trace context explicitly. Active spans might
  change during callbacks.
  - Capture active context from users on the public API surface as soon as you
    can, use it as a parent context for your spans.
  - Pass context around and stamp attributes, exceptions, events on explicitly
    propagated instances.
  - This is essential if you start threads explicitly, do background processing
    or other things that can break due to async context flow limitations in your
    language.

## Additional considerations

### Instrumentation registry

Add your instrumentation library to the
[OpenTelemetry registry](/ecosystem/registry/) so users can find it.

### Performance

OpenTelemetry API is no-op and very performant when there is no SDK in the
application. When OpenTelemetry SDK is configured, it
[consumes bound resources](/docs/specs/otel/performance/).

Real-life applications, especially on the high scale, would frequently have
head-based sampling configured. Sampled-out spans are affordable and you can
check if the span is recording to avoid extra allocations and potentially
expensive calculations while populating attributes. The following Java example
shows to provide attributes for sampling and check span recording.

```java
// some attributes are important for sampling, they should be provided at creation time
Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
        .setSpanKind(SpanKind.CLIENT)
        .setAttribute("db.name", dbName)
        ...
        .startSpan();

// other attributes, especially those that are expensive to calculate
// should be added if span is recording
if (span.isRecording()) {
    span.setAttribute("db.statement", sanitize(query.statement()))
}
```

### Error handling

OpenTelemetry API does not fail on invalid arguments, never throws, and swallows
exceptions, which means it's
[forgiving at runtime](/docs/specs/otel/error-handling/#basic-error-handling-principles).
This way instrumentation issues do not affect application logic. Test the
instrumentation to notice issues OpenTelemetry hides at runtime.

### Testing

Since OpenTelemetry has a variety of auto-instrumentations, try how your
instrumentation interacts with other telemetry: incoming requests, outgoing
requests, logs, and so on. Use a typical application, with popular frameworks
and libraries and all tracing enabled when trying out your instrumentation.
Check out how libraries similar to yours show up.

For unit testing, you can usually mock or fake `SpanProcessor` and
`SpanExporter` as in the following Java example:

```java
@Test
public void checkInstrumentation() {
  SpanExporter exporter = new TestExporter();

  Tracer tracer = OpenTelemetrySdk.builder()
           .setTracerProvider(SdkTracerProvider.builder()
              .addSpanProcessor(SimpleSpanProcessor.create(exporter)).build()).build()
           .getTracer("test");
  // run test ...

  validateSpans(exporter.exportedSpans);
}

class TestExporter implements SpanExporter {
  public final List<SpanData> exportedSpans = Collections.synchronizedList(new ArrayList<>());

  @Override
  public CompletableResultCode export(Collection<SpanData> spans) {
    exportedSpans.addAll(spans);
    return CompletableResultCode.ofSuccess();
  }
  ...
}
```

[instrumentation libraries]:
  /docs/specs/otel/overview/#instrumentation-libraries
[span events]: /docs/specs/otel/trace/api/#add-events
