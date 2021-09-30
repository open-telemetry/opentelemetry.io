---
title: "Instrumenting libraries"
weight: 40
---

OpenTelemetry provides [automatic instrumentation](/docs/concepts/instrumenting#automatic-instrumentation)

for many libraries, which is typically done through library hooks or monkey-patching library code.

Native library instrumentation with OpenTelemetry provides better observability and developer experience for users, removing the need for libraries to expose and document hooks:

- custom logging hooks can be replaced by common and easy to use OpenTelemetry APIs, users will only interact with OpenTelemetry
- telemetry (traces, logs, metrics in future) from library and application code are correlated and coherent
- common conventions allow users to get similar and consistent telemetry within same technology and across languages
- telemetry signals can be fine tuned (filtered, processed, aggregated) for various consumption scenarios using wide variety of well-documented OpenTelemetry extensibility points. 

## Semantic Conventions

Check out available [semantic conventions](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/README.md) that cover web-frameworks, RPC clients, databases, messaging clients, infra pieces and more!

If your library is one of those things - follow the conventions, they are the main source of truth and tell which information should be included on spans.
Conventions make instrumentations consistent: users who work with telemetry don't have to learn library-specifics and observability vendors can build experiences that work for wide variety of technologies (e.g. databases or messaging systems).
When libraries follow conventions, many scenarios may be enabled out of the box without user's input or configuration.

If you have any feedback or want to add a new conventions - please come and contribute! [Instrumentation Slack](https://cloud-native.slack.com/archives/C01QZFGMLQ7) or [Specification repo](https://github.com/open-telemetry/opentelemetry-specification) are a good places to start!


## OpenTelemetry API

The first step is to take dependency on the OpenTelemetry API package.

OpenTelemetry has [two main modules](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/overview.md) - API and SDK.
OpenTelemetry API is a set of abstractions and not-operational implementations. Unless application brings OpenTelemetry SDK, your instrumentation does nothing and does not impact application performance. **Libraries should only use OpenTelemetry API.**

You may be rightfully concerned about adding new dependencies, here are some considerations to help you decide how to minimize dependency hell issues:

- OpenTelemetry Trace API reached stability in early 2021, it follows [Semantic Versioning 2.0](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) and we take API stability seriously.
- When taking dependency, use the earliest stable OpenTelemetry API (1.0.*) and avoid updating it unless you have to use new features.
- While your instrumentation stabilizes consider shipping it as a separate package: it would never break anyone who don't use it. You can keep it in your repo or contribute to OpenTelemetry so it will ship with other instrumentation packages.
- Semantic Conventions are [not stable yet](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md#not-defined-semantic-conventions-stability), It does not cause any functional issues, but you may need to update your instrumentation once in a while. Having it in a plugin or in OpenTelemetry contrib repo may help keeping conventions up-to-date.

TODO/Open question: ownership and control for library instrumentation contributions

## What to instrument

### When **not** to instrument

Some libraries are a thin clients wrapping network calls. Chances are that OpenTelemetry has auto-instrumentation for the underlying RPC client. In this case, library instrumentation may not be necessary. Don't instrument if:

- you library is a thin proxy on top of documented or self-explanatory APIs
- AND OpenTelemetry has instrumentation for underlying network calls
- AND there are no conventions your library should follow to enrich telemetry


If you're in doubt - don't instrument - you can always do it later when you see a need.

If you choose not to instrument, it may still be useful to provide a way to configure OpenTelemetry handlers for your internal RPC client instance. It's essential in languages that don't support fully automatic instrumentation and still useful in others.

The rest of this document gives guidance on what and how to instrument if you decide to do it.


### Public APIs

Public APIs are a good candidates for tracing: spans created for public API calls allow users to map telemetry to application code, understand the duration and outcome of library calls. Which calls to trace:

- public methods that make network calls internally or local operations that take significant time and may fail (e.g. IO)
- handlers that process requests or messages

**Instrumentation example:**

```java
private final Tracer tracer = GlobalOpenTelemetry.getTracer("demo-db-client", "0.1.0-beta1");

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

Follow conventions to populate attributes! If there is no applicable one, check out [general conventions](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/span-general.md).

### Nested network and other spans

Network calls are usually traced with OpenTelemetry auto-instrumentations through corresponding client implementation.

If OpenTelemetry does not support tracing your network client, use your best judgement, here are some considerations to help:

- would tracing network calls improve users observability or your ability to support users?
- is your library a wrapper on top of public, documented RPC API? Would users need to get support from underlying service in case of issues?
  - then instrument and make sure to trace individual network tries
- would tracing those calls with spans be very verbose? or would it noticeably impact performance?
  - use logs with verbosity or span events. Logs can be correlated to parent (public API calls), span events should be set on public API span.
  - if they have to be spans (to carry and propagate unique trace context), put them behind configuration option and disable by default.

If OpenTelemetry already supports tracing your network calls, you probably don't want to duplicate it. There may be some exceptions:

- to support users without auto-instrumentation (which may not work in specific environments or users may have concerns with monkey-patching)
- to enable custom (legacy) correlation and context propagation protocols with underlying service
- enrich RPC spans with absolutely essential lib/service-specific information

TODO/Open question: We're working on generic solution to avoid duplication.

<img src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/Instrumenting_Library_nested_spans.svg" alt="Nested database and HTTP spans"></img>

## Context propagation

### Extracting context

If you work on an infra piece or a library that receives upstream calls, e.g. web framework or messaging consumer, your should extract context from the incoming request/message. OpenTelemetry provides `Propagator` API that hides specific propagation standard and reads trace `Context` from the wire. In case of single response, there is just one context on the wire and it becomes a parent on the new span the library creates.

After you created a span, you should pass new trace context to the application code (callback or handler) by making span active and, if possible, explicitly.

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

Here're the full [examples of context extraction in Java](https://opentelemetry.io/docs/java/manual_instrumentation/#context-propagation), check out OpenTelemetry documentation in your language.

In case of messaging system, you may receive more than one message at once. Received messages become [*links*](https://opentelemetry.io/docs/java/manual_instrumentation/#create-spans-with-links) on the span you create.
Refer to messaging conventions for more details. TODO (spec is being changed)

### Injecting context

When you make an outbound call, you usually want to propagate context to downstream service. Create a new span to trace outgoing call and use `Propagator` API to inject context into the message. There may be other cases when you want to inject context, e.g. when creating messages for async processing.

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

Here's the full [example of context injection in Java](https://opentelemetry.io/docs/java/manual_instrumentation/#context-propagation).

There might be some exceptions:

- downstream service does not support metadata or prohibits unknown fields
- downstream service does not define correlation protocols. Is it possible that some future service version will support compatible context propagation? Inject it!
- downstream service supports custom correlation protocol.
  - best effort with custom propagator: use OpenTelemetry trace context if compatible.
  - or generate and stamp custom correlation ids on the span.

### In-process

- **Make your spans active** (aka current): it enables correlating spans with logs and any nested auto-instrumentations.
- If the library has a notion of context, support **optional** explicit trace context propagation *in addition* to active spans
  - put spans (trace context) created by library in the context explicitly, document how to access it
  - allow users to pass trace context in your context
- Within the library, propagate trace context explicitly - active spans may change during callbacks!
  - capture active context from users on the public API surface as soon as you can, use it as a parent context for your spans
  - pass context around and stamp attributes, exceptions, events on explicitly propagated instances
  - this is essential if you run custom threads, background processing or other things that can break due to async context flow limitations in your language

## Logs

Traces is one of the signals you may emit. Logs and traces complement (not duplicate) each other. Whenever you have something that should have a verbosity, logs are a better choice than traces.

Chances are you library uses logs or some similar mechanism already. If it's a platform logging API or a popular logging library, OpenTelemetry likely has integration already! Integrations usually stamps active trace context on all logs, so users can correlate them.

If you language and ecosystem don't have common logging libraries, use span events for additional details you want to share with users.

## Metrics

[Metrics API](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/api.md) is not stable yet and we don't yet define metrics conventions.

## Misc

### Performance

OpenTelemetry API is noop and very cheap when there is no SDK provided by users. When OpenTelemetry SDK is configured, it [consumes bound resources](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/performance.md).

Real-life application, especially on the high scale, would frequently have head-based sampling configured. Sampled-out spans are cheap and you can check if spans is recording to avoid extra allocations and potentially expensive calculations while populating attributes.

```java
// some attributes are important for sampling, they should be provided at creating time
Span span = tracer.spanBuilder(String.format("SELECT %s.%s", dbName, collectionName))
        .setSpanKind(SpanKind.CLIENT)
        .setAttribute("db.name", dbName)
        ...
        .startSpan();

// other attributes, especially those that are expensive to calculate
// should be added if span is recoding
if (span.isRecording()) {
    span.setAttribute("db.statement", sanitize(query.statement()))
}
```

### Error handling

OpenTelemetry API is [forgiving at runtime](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/error-handling.md#basic-error-handling-principles) - does not fail on invalid arguments, never throws, and swallows exceptions. This way instrumentation issues do not affect core features of your library. Make sure you test the instrumentation to notice issues OpenTelemetry hides in runtime.

### Testing

Since OpenTelemetry has variety of auto-instrumentations, it's useful to try how your instrumentation interacts with others: incoming requests, outgoing requests. So when checking how your library works, use a typical application, with popular frameworks and libraries. Check out how libraries similar to yours show up.

For unit tests, you can usually mock or fake OpenTelemetry classes, `SpanProcessor` and `SpanExporter` are great candidates to check how your instrumentation works.

```java
@Test
public void checkInstrumentation() {
  SpanExporter exporter = new TestExporter();
  SdkTracerProvider otelProvider = ;

  Tracer tracer = OpenTelemetrySdk.builder()
           .setTracerProvider(SdkTracerProvider.builder()
              .addSpanProcessor(SimpleSpanProcessor.create(exporter)).build())
           .build().getTracer("test");
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
