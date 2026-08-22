---
title: Instrumentation
weight: 11
aliases:
  - manual
  - manual_instrumentation
description: Manual instrumentation for OpenTelemetry Kotlin
cSpell:ignore: callsite callsites
---

{{% include instrumentation-intro.md %}}

## Stability

OpenTelemetry Kotlin's API has not reached stability and is subject to breaking
changes. For more information, see the
[API stability section](../getting-started#api-stability) of the getting started
guide.

OpenTelemetry's Tracing and Logging APIs are available but the Metrics API is
not supported yet.

All timestamps on the API are in nanoseconds.

## Setup

When writing instrumentation you should only depend on the API and noop modules
as described in the
[getting started guide](../getting-started#setup-other-modules). The
`OpenTelemetry` interface should be injected as a parameter/property to
callsites in your application. This is the main entrypoint for writing
instrumentation.

A useful pattern is to use Kotlin's default parameters to provide a no-op
implementation. This is optional, but helps if you aren't responsible for
initializing the SDK or if you conditionally enable OpenTelemetry:

```kotlin
fun example(otel: OpenTelemetry = NoopOpenTelemetry) {
    // obtain tracer from the OpenTelemetry instance
    val tracer = otel.getTracer("com.example.myclient")
}
```

## Using the Logging API

### Obtain a Logger

Firstly, obtain a `Logger` from an `OpenTelemetry` instance. The name supplied
identifies the
[instrumentation scope](/docs/specs/otel/common/instrumentation-scope/):

```kotlin
val logger = otel.loggerProvider.getLogger("com.example.myclient")

// or use syntactic sugar
val logger = otel.getLogger("com.example.myclient")
```

The `version`, `schemaUrl`, and `attributes` can be optionally specified and
will be associated with the captured telemetry:

```kotlin
val tracer = otel.getTracer(
    name = "com.example.myclient",
    version = "1.4.2",
    schemaUrl = "https://opentelemetry.io/schemas/1.30.0",
) {
    setStringAttribute("scope.team", "payments")
}
```

### Emit a simple log record

Using the `Logger` reference a simple log record can be emitted like this:

```kotlin
logger.emit(
    body = "Hello, World!"
)
```

### Customize the log record

`emit` accepts several other parameters when capturing log records. These are
described in detail in the
[Logger API specification](/docs/specs/otel/logs/api/#emit-a-logrecord).

#### Specify the severity

Specify `severityNumber` and `severityText` to alter the severity associated
with a log record:

```kotlin
logger.emit(
    body = "Hello, World!"
    severityNumber: SeverityNumber? = SeverityNumber.INFO,
    severityText: String? = "INFO"
)
```

#### Specify the timestamps

Specify `timestamp` and `observedTimestamp` to alter the timestamps associated
with a log record:

```kotlin
logger.emit(
    body = "Hello, World!"
    timestamp = 100,
    observedTimestamp = 90,
)
```

#### Specify the exception

Specify `exception` if a `Throwable` was associated with the event:

```kotlin
fun example(logger: Logger) {
    try {
        performFoo()
    } catch (exc: IllegalStateException) {
        logger.emit(
            body = "Hello, World!"
            exception = IllegalStateException("my exception")
        )
    }
}
```

#### Specify the event name

Specify `eventName` if the log record is an OpenTelemetry
[event](/docs/specs/otel/logs/data-model/#field-eventname):

```kotlin
logger.emit(
    body = "Hello, World!"
    eventName = "event_name"
)
```

#### Specify the context

Specify `context` if you want to associate the log record with a specific
context. If you don't specify this, the implicit context will be used.

```kotlin
fun example(logger: Logger, ctx: Context) {
    logger.emit(
        body = "Hello, World!"
        context = ctx,
    )
}
```

For more information about what the context is and how to use it, please see the
[context section](#context).

#### Specify the attributes

Specify the `attributes` parameter if you wish to associate specific attributes
with an individual log record:

```kotlin
logger.emit("Hello, World!") {
    setStringAttribute("checkout.id", id)
    setLongAttribute("checkout.duration_ms", duration)
}
```

For more information about what attributes are and how to use them, please see
the [attributes section](#attributes).

## Using the Tracing API

### Obtain a Tracer

Firstly, obtain a `Tracer` from an `OpenTelemetry` instance. The name supplied
identifies the
[instrumentation scope](/docs/specs/otel/common/instrumentation-scope/):

```kotlin
val tracer = otel.tracerProvider.getTracer("com.example.checkout")

// or use syntactic sugar
val tracer = otel.getTracer("com.example.checkout")
```

The `version`, `schemaUrl`, and `attributes` can be optionally specified and
will be associated with the captured telemetry:

```kotlin
val tracer = otel.getTracer(
    name = "com.example.checkout",
    version = "1.4.2",
    schemaUrl = "https://opentelemetry.io/schemas/1.30.0",
) {
    setStringAttribute("scope.team", "payments")
}
```

### Start a simple span

Using the `Tracer` reference a simple span can be started and ended like this:

```kotlin
val span: Span = tracer.startSpan(name = "my_span")
```

### End a span

A span should be completed by calling `end()`. After calling this, subsequent
operations on the `Span` have no effect:

```kotlin
span.end()
```

If you wish to set an explicit end time, pass `timestamp`. By default
OpenTelemetry Kotlin will use its own clock to populate the end timestamp:

```kotlin
span.end(timestamp = MyClock.now())
```

### Specify attributes

Specify the `attributes` parameter if you wish to associate specific attributes
with an individual span:

```kotlin
val span: Span = tracer.startSpan("my_span") {
    setStringAttribute("checkout.id", id)
}
```

It's also possible to set attributes after a span has started:

```kotlin
span.setStringAttribute("checkout.id", id)
```

For more information about what attributes are and how to use them, please see
the [attributes section](#attributes).

### Set a span status

By default spans have an `Unset` status. You can explicitly mark a span as `Ok`
or `Error`, with a description of what went wrong during your operation.

This marks a span as `Ok`:

```kotlin
span.setStatus(StatusData.Ok)
```

And this marks a span as `Error`, with an optional description:

```kotlin
span.setStatus(StatusData.Error("Something went wrong"))
```

### Check if a span is recording

You can check whether a span is recording like this:

```kotlin
if (span.isRecording()) {
    // add some data
}
```

If a span isn't recording calling its functions will result in a no-op.

### Specify the SpanKind

The [SpanKind](/docs/specs/otel/trace/api/#spankind) can be set on a `Span` as
below:

```kotlin
val span: Span = tracer.startSpan(
    name = "my_span",
    spanKind = SpanKind.CLIENT
)
```

By default `SpanKind` is `INTERNAL`.

### Specify the startTimestamp

The start timestamp of a `Span` can be explicitly set:

```kotlin
val span: Span = tracer.startSpan(
    name = "my_span",
    startTimestamp = MyClock.now()
)
```

This can be useful if you need to capture a span for an operation that happened
before OpenTelemetry was initialized.

### Specify the parentContext

Specify `context` if you want to associate a span with a specific context. If
you don't specify this, the implicit context will be used.

```kotlin
fun example(tracer: Tracer, ctx: Context) {
    tracer.startSpan(
        name = "my_span"
        parentContext = ctx,
    )
}
```

For more information about what the context is and how to use it, please see the
[context section](#context).

### Specify span links

Sometimes you may want to
[link two spans together](/docs/specs/otel/trace/api/#add-link). This can be
done at initialization time:

```kotlin
val span: Span = tracer.startSpan("my_span") {
    addLink(otherSpan)
}
```

It's also possible to add links after a span has started. An `attributes`
parameter is also available that associates attributes with the span link:

```kotlin
span.addLink(otherSpan) {
    setStringAttribute("checkout.id", id)
}
```

### Wrap an operation with a span

If you have a synchronous operation that you want to record with a span you can
use `wrapOperation` to start and end a span:

```kotlin
span.wrapOperation {
    performFoo()
    span.setName(updatedName)
    StatusData.Ok
}
```

`wrapOperation` automatically handles starting and ending the span by performing
an arbitrary operation in a lambda so you don't need to worry about leaking
resources. You must return a `StatusData` to signify whether the operation was
successful or not.

Additionally, if any exceptions are thrown within `wrapOperation` this is
automatically recorded and the span status is set to `Error`.

## Attributes

All interfaces that are capable of accepting attributes have the same syntax.
It's possible to use typed setters:

```kotlin
{
    setStringAttribute("string_key", "my_string")
    setBooleanAttribute("bool_key", true)
    setLongAttribute("long_key", 5L)
    setDoubleAttribute("double_key", 3.14)
    setByteArrayAttribute("byte_array_key", ByteArray(0))
    setStringListAttribute("string_list_key", listOf("my_string"))
    setBooleanListAttribute("bool_list_key", listOf(true))
    setLongListAttribute("long_list_key", listOf(5L))
    setDoubleListAttribute("double_list_key", listOf(3.14))
}
```

Or a `Map<String, Any>` can be passed instead:

```kotlin
{
    setAttributes(mapOf(
        "string_key" to "my_string",
        "bool_key" to true,
        "long_key" to 5L,
        "double_key" to 3.14,
        "byte_array_key" to ByteArray(0),
        "string_list_key" to listOf("my_string"),
        "bool_list_key" to listOf(true),
        "long_list_key" to listOf(5L),
        "double_list_key" to listOf(3.14),
    ))
}
```

Finally, it's possible to supply an object of
[type `AnyValue`](/docs/specs/otel/common/#anyvalue). This can be helpful if you
want to represent complex values:

```kotlin
{
    setAnyValueAttribute("my_key", AnyValue.StringValue("my_value"))
}
```

## Context

[`Context`](/docs/specs/otel/context/) is OpenTelemetry's approach for
propagating values across API and process boundaries. More concretely, it allows
you to associate metrics, traces, and logs with each other so you have insight
into what was happening at the time of a specific operation.

For example, one common pattern for a REST API is to start and end a span on
each request. If this span is associated with a `Context` object, that object
must be passed to any log records that are emitted during the request.

`Context` objects can also be used to model a parent-child relationship when
creating spans. For our REST API example this could measure sub-operations such
as request body deserialization or DB queries.

There are two approaches to managing context: explicit and implicit.

### Using explicit context

In explicit context management whenever a log/span is created a reference to the
correct `Context` must be specified.

#### Store a span in a Context object

Firstly, it's necessary to obtain a reference to a `Context` object. This can be
achieved by calling `root()`:

```kotlin
val rootCtx: Context = otel.context.root()
```

Call `storeSpan` to store a `Span` in a `Context`. This creates a new immutable
`Context` object that contains metadata about the span:

```kotlin
val rootCtx: Context = otel.context.root()
val parentCtx: Context = rootCtx.storeSpan(parentSpan)
```

#### Pass explicit context to telemetry

The new context object must then be passed to `startSpan`. The returned `Span`
is a child of the span stored in the `Context` and shares the same traceId:

```kotlin
val rootCtx: Context = otel.context.root()
val parentCtx: Context = rootCtx.storeSpan(parentSpan)

val childSpan = tracer.startSpan(
    name = "child-span",
    parentContext = parentCtx,
)
```

Log records can be associated with a `Context` in a similar way:

```kotlin
val rootCtx: Context = otel.context.root()
val newCtx: Context = rootCtx.storeSpan(parentSpan)

logger.emit(
    body = "Hello, World!",
    context = newCtx,
)
```

#### Extract a span from a Context object

If you wish to extract a span from a `Context` object you should call
`extractSpan()`:

```kotlin
val parentSpan: Span = parentCtx.extractSpan()
```

If a `Context` doesn't contain a `Span` then a no-op object will be returned.
You can check for this via `SpanContext`:

```kotlin
if (parentSpan.spanContext.isValid) {
    // span is a valid object
}
```

#### Setting other values on Context

Arbitrary values can be set on `Context` by creating a key and calling the `set`
and `get` functions:

```kotlin
val key: ContextKey<MyObject> = otel.context.createKey("my-unique-key")
val root: Context = otel.context.root()
val newCtx: Context = root.set(key, MyObject())
val ref: MyObject = newCtx.get(key)
```

Under the hood this is exactly how `Span` and `Baggage` are stored in `Context`.

### Using implicit context

In implicit context management whenever a log/span is created the SDK uses
pre-defined rules that choose the correct `Context`.

#### The dangers of implicit context

Explicitly passing in `Context` objects at every callsite introduces mental
overhead. OpenTelemetry has the concept of an 'implicit' context - i.e. the
context associated with the current execution unit.

Implicit context reduces the mental overhead of threading through parameters but
you must be careful that it matches what you consider the current execution
unit. For example, Kotlin applications may use both thread-locals and coroutines
at the same time. If you use a thread-local approach to store the implicit
context but you're running in a coroutine, the implicit context becomes useless
and misleading.

Implicit context management can only ever provide a sensible default. You are
strongly encouraged to supplement this sensible default with explicit context
management in your own application.

#### Obtaining the implicit context

To obtain the implicit context call `implicit()`:

```kotlin
val implicitCtx: Context = otel.context.implicit()
```

If no implicit `Context` has been set this defaults to the root context.

#### Setting the implicit context

First, create a new `Context` object that stores a `Span`. Then call
`asImplicitContext()`. This automatically attaches a `Context` for the scope of
your operation then detaches on completion:

```kotlin
val ctx: Context = otel.context.implicit().storeSpan(span)
ctx.asImplicitContext {
    performFoo()
}
```

If you wish fine-grained control over the implicit `Context` you can call
`attach()` and `detach()` yourself. However, it's very important to balance
calls to `attach/detach` and handle errors appropriately. If you aren't careful
you may end up with unexpected values in the implicit context:

```kotlin
val ctx: Context = otel.context.implicit().storeSpan(span)
val scope: Scope = ctx.attach()
performFoo()
scope.detach()
```
