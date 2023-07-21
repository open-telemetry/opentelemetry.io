---
title: Libraries
description: Learn how to add native instrumentation to your library.
aliases: [/docs/concepts/instrumenting-library]
weight: 40
---

OpenTelemetry provides [instrumentation libraries][] for many libraries, which
is typically done through library hooks or monkey-patching library code.

Native library instrumentation with OpenTelemetry provides better observability
and developer experience for users, removing the need for libraries to expose
and document hooks:

- custom logging hooks can be replaced by common and easy to use OpenTelemetry
  APIs, users will only interact with OpenTelemetry
- traces, logs, metrics from library and application code are correlated and
  coherent
- common conventions allow users to get similar and consistent telemetry within
  same technology and across libraries and languages
- telemetry signals can be fine tuned (filtered, processed, aggregated) for
  various consumption scenarios using a wide variety of well-documented
  OpenTelemetry extensibility points.

## Semantic Conventions

Check out available
[semantic conventions](/docs/specs/otel/trace/semantic_conventions/) that cover
web-frameworks, RPC clients, databases, messaging clients, infra pieces and
more!

If your library is one of those things - follow the conventions, they are the
main source of truth and tell which information should be included on spans.
Conventions make instrumentation consistent: users who work with telemetry don't
have to learn library specifics and observability vendors can build experiences
for a wide variety of technologies (e.g. databases or messaging systems). When
libraries follow conventions, many scenarios may be enabled out of the box
without the user's input or configuration.

If you have any feedback or want to add a new convention - please come and
contribute!
[Instrumentation Slack](https://cloud-native.slack.com/archives/C01QZFGMLQ7) or
[Specification repository](https://github.com/open-telemetry/opentelemetry-specification)
are a good places to start!

## When **not** to instrument

Some libraries are thin clients wrapping network calls. Chances are that
OpenTelemetry has an instrumentation library for the underlying RPC client
(check out the [registry](/ecosystem/registry/)). In this case, instrumenting
the wrapper library may not be necessary.

Don't instrument if:

- your library is a thin proxy on top of documented or self-explanatory APIs
- _and_ OpenTelemetry has instrumentation for underlying network calls
- _and_ there are no conventions your library should follow to enrich telemetry

If you're in doubt - don't instrument - you can always do it later when you see
a need.

If you choose not to instrument, it may still be useful to provide a way to
configure OpenTelemetry handlers for your internal RPC client instance. It's
essential in languages that don't support fully automatic instrumentation and
still useful in others.

The rest of this document gives guidance on what and how to instrument if you
decide to do it.

## OpenTelemetry API

The first step is to take dependency on the OpenTelemetry API package.

OpenTelemetry has [two main modules](/docs/specs/otel/overview/) - API and SDK.
OpenTelemetry API is a set of abstractions and not-operational implementations.
Unless your application imports the OpenTelemetry SDK, your instrumentation does
nothing and does not impact application performance.

**Libraries should only use the OpenTelemetry API.**

You may be rightfully concerned about adding new dependencies, here are some
considerations to help you decide how to minimize dependency hell:

- OpenTelemetry Trace API reached stability in early 2021, it follows
  [Semantic Versioning 2.0](/docs/specs/otel/versioning-and-stability) and we
  take API stability seriously.
- When taking dependency, use the earliest stable OpenTelemetry API (1.0.\*) and
  avoid updating it unless you have to use new features.
- While your instrumentation stabilizes, consider shipping it as a separate
  package, so that will never cause issues for users who don't use it. You can
  keep it in your repository, or
  [add it to OpenTelemetry](https://github.com/open-telemetry/oteps/blob/main/text/0155-external-modules.md#contrib-components),
  so it will ship with other instrumentation packages.
- Semantic Conventions are [stable, but subject to evolution][]: while this does
  not cause any functional issues, you may need to update your instrumentation
  every once in a while. Having it in a preview plugin or in OpenTelemetry
  contrib repository may help keeping conventions up-to-date without breaking
  changes for your users.

  [stable, but subject to evolution]:
    /docs/specs/otel/versioning-and-stability/#semantic-conventions-stability

### Getting a tracer

All application configuration is hidden from your library through the Tracer
API. Libraries should obtain tracer from
[global `TracerProvider`](/docs/specs/otel/trace/api/#get-a-tracer) by default.

```java
private static final Tracer tracer = GlobalOpenTelemetry.getTracer("demo-db-client", "0.1.0-beta1");
```

It's useful for libraries to have an API that allows applications to pass
instances of `TracerProvider` explicitly which enables better dependency
injection and simplifies testing.

When obtaining the tracer, provide your library (or tracing plugin) name and
version - they show up on the telemetry and help users process and filter
telemetry, understand where it came from, and debug/report any instrumentation
issues.

## What to instrument

### Public APIs

Public APIs are a good candidates for tracing: spans created for public API
calls allow users to map telemetry to application code, understand the duration
and outcome of library calls. Which calls to trace:

- public methods that make network calls internally or local operations that
  take significant time and may fail (e.g. IO)
- handlers that process requests or messages

**Instrumentation example:**

```java
private static final Tracer tracer = GlobalOpenTelemetry.getTracer("demo-db-client", "0.1.0-beta1");

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

Follow conventions to populate attributes! If there is no applicable one, check
out
[general conventions](/docs/specs/otel/trace/semantic_conventions/span-general/).

### Nested network and other spans

Network calls are usually traced with OpenTelemetry auto-instrumentations
through corresponding client implementation.

![Nested database and HTTP spans in Jaeger UI](../nested-spans.svg)

If OpenTelemetry does not support tracing your network client, use your best
judgement, here are some considerations to help:

- Would tracing network calls improve observability for users or your ability to
  support them?
- Is your library a wrapper on top of public, documented RPC API? Would users
  need to get support from the underlying service in case of issues?
  - instrument the library and make sure to trace individual network tries
- Would tracing those calls with spans be very verbose? or would it noticeably
  impact performance?
  - use logs with verbosity or span events: logs can be correlated to parent
    (public API calls), while span events should be set on public API span.
  - if they have to be spans (to carry and propagate unique trace context), put
    them behind a configuration option and disable them by default.

If OpenTelemetry already supports tracing your network calls, you probably don't
want to duplicate it. There may be some exceptions:

- to support users without auto-instrumentation (which may not work in certain
  environments or users may have concerns with monkey-patching)
- to enable custom (legacy) correlation and context propagation protocols with
  underlying service
- enrich RPC spans with absolutely essential library/service-specific
  information not covered by auto-instrumentation

WARNING: Generic solution to avoid duplication is under construction 🚧.

### Events

Traces are one kind of signal that your apps can emit. Events (or logs) and
traces complement, not duplicate, each other. Whenever you have something that
should have a verbosity, logs are a better choice than traces.

Chances are that your app uses logging or some similar module already. Your
module might already have OpenTelemetry integration -- to find out, see the
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

If you work on a library or a service that receives upstream calls, e.g. a web
framework or a messaging consumer, you should extract context from the incoming
request/message. OpenTelemetry provides the `Propagator` API, which hides
specific propagation standards and reads the trace `Context` from the wire. In
case of a single response, there is just one context on the wire, which becomes
the parent of the new span the library creates.

After you create a span, you should pass new trace context to the application
code (callback or handler), by making the span active; if possible, you should
do this explicitly.

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

Here're the full
[examples of context extraction in Java](/docs/instrumentation/java/manual/#context-propagation),
check out OpenTelemetry documentation in your language.

In the case of a messaging system, you may receive more than one message at
once. Received messages become
[_links_](/docs/instrumentation/java/manual/#create-spans-with-links) on the
span you create. Refer to
[messaging conventions](/docs/specs/otel/trace/semantic_conventions/messaging/)
for details (WARNING: messaging conventions are
[under constructions](https://github.com/open-telemetry/oteps/pull/173) 🚧).

### Injecting context

When you make an outbound call, you will usually want to propagate context to
the downstream service. In this case, you should create a new span to trace the
outgoing call and use `Propagator` API to inject context into the message. There
may be other cases where you might want to inject context, e.g. when creating
messages for async processing.

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

Here's the full
[example of context injection in Java](/docs/instrumentation/java/manual/#context-propagation).

There might be some exceptions:

- downstream service does not support metadata or prohibits unknown fields
- downstream service does not define correlation protocols. Is it possible that
  some future service version will support compatible context propagation?
  Inject it!
- downstream service supports custom correlation protocol.
  - best effort with custom propagator: use OpenTelemetry trace context if
    compatible.
  - or generate and stamp custom correlation IDs on the span.

### In-process

- **Make your spans active** (aka current): it enables correlating spans with
  logs and any nested auto-instrumentations.
- If the library has a notion of context, support **optional** explicit trace
  context propagation _in addition_ to active spans
  - put spans (trace context) created by library in the context explicitly,
    document how to access it
  - allow users to pass trace context in your context
- Within the library, propagate trace context explicitly - active spans may
  change during callbacks!
  - capture active context from users on the public API surface as soon as you
    can, use it as a parent context for your spans
  - pass context around and stamp attributes, exceptions, events on explicitly
    propagated instances
  - this is essential if you start threads explicitly, do background processing
    or other things that can break due to async context flow limitations in your
    language

## Misc

### Instrumentation registry

Please add your instrumentation library to the
[OpenTelemetry registry](/ecosystem/registry/), so users can find it.

### Performance

OpenTelemetry API is no-op and very performant when there is no SDK in the
application. When OpenTelemetry SDK is configured, it
[consumes bound resources](/docs/specs/otel/performance/).

Real-life applications, especially on the high scale, would frequently have
head-based sampling configured. Sampled-out spans are cheap and you can check if
the span is recording, to avoid extra allocations and potentially expensive
calculations, while populating attributes.

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

OpenTelemetry API is
[forgiving at runtime](/docs/specs/otel/error-handling/#basic-error-handling-principles) -
does not fail on invalid arguments, never throws, and swallows exceptions. This
way instrumentation issues do not affect application logic. Test the
instrumentation to notice issues OpenTelemetry hides at runtime.

### Testing

Since OpenTelemetry has variety of auto-instrumentations, it's useful to try how
your instrumentation interacts with other telemetry: incoming requests, outgoing
requests, logs, etc. Use a typical application, with popular frameworks and
libraries and all tracing enabled when trying out your instrumentation. Check
out how libraries similar to yours show up.

For unit testing, you can usually mock or fake `SpanProcessor` and
`SpanExporter`.

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
