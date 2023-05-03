---
title: OpenTelemetry Tracing Shim
linkTitle: Tracing Shim
weight: 5
---

.NET is different from other languages/runtimes that support OpenTelemetry.
Tracing is implemented by the
[System.Diagnostics](https://docs.microsoft.com/dotnet/api/system.diagnostics)
API, repurposing older constructs like `ActivitySource` and `Activity` to be
OpenTelemetry-compliant under the covers.

OpenTelemetry for .NET also provides an API shim on top of the
[System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics)-
based implementation. This shim is helpful if you're working with other
languages and OpenTelemetry in the same codebase, or if you prefer to use
terminology consistent with the OpenTelemetry spec.

## Initializing tracing

There are two main ways to initialize [tracing](/docs/concepts/signals/traces/),
depending on whether you're using a console app or something that's ASP.NET
Core-based.

### Console app

To start [tracing](/docs/concepts/signals/traces/) in a console app, you need to
create a tracer provider.

First, ensure that you have the right packages:

```
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Exporter.Console
```

And then use code like this at the beginning of your program, during any
important startup operations.

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

// ...

var serviceName = "MyServiceName";
var serviceVersion = "1.0.0";

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddConsoleExporter()
    .Build();

//...
```

This is also where you can configure instrumentation libraries.

Note that this sample uses the Console Exporter. If you are exporting to another
endpoint, you'll have to use a different exporter.

### ASP.NET Core

To start [tracing](/docs/concepts/signals/traces/) in an ASP.NET Core-based app,
use the OpenTelemetry extensions for ASP.NET Core setup.

First, ensure that you have the right packages:

```
dotnet add package OpenTelemetry --prerelease
dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
dotnet add package OpenTelemetry.Exporter.Console --prerelease
```

And then configure it in your ASP.NET Core startup routine where you have access
to an `IServiceCollection`.

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// These can come from a config file, constants file, etc.
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

// Configure important OpenTelemetry settings, the console exporter, and instrumentation library
builder.Services.AddOpenTelemetry().WithTracing(tcb =>
{
    tcb
    .AddSource(serviceName)
    .SetResourceBuilder(
        ResourceBuilder.CreateDefault()
            .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddAspNetCoreInstrumentation()
    .AddConsoleExporter();
});
```

In the preceding example, a [`Tracer`](/docs/concepts/signals/traces/#tracer)
corresponding to the service is injected during setup. This lets you get access
to an instance in your endpoint mapping (or controllers if you're using an older
version of .NET).

It's not required to inject a service-level tracer, nor does it improve
performance either. You will need to decide where you'll want your tracer
instance to live, though.

This is also where you can configure instrumentation libraries.

Note that this sample uses the Console Exporter. If you are exporting to another
endpoint, you'll have to use a different exporter.

## Setting up a tracer

Once tracing is initialized, you can configure a
[`Tracer`](/docs/concepts/signals/traces/#tracer), which will be how you trace
operations with [`Span`s](/docs/concepts/signals/traces/#spans).

Typically, a `Tracer` is instantiated once per app/service that is being
instrumented, so it's a good idea to instantiate it once in a shared location.
It is also typically named the same as the Service Name.

### Injecting a tracer with ASP.NET Core

ASP.NET Core generally encourages injecting instances of long-lived objects like
`Tracer`s during setup.

```csharp
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// ...

builder.Services.AddSingleton(TracerProvider.Default.GetTracer(serviceName));

// ...

var app = builder.Build();

// ...

app.MapGet("/hello", (Tracer tracer) =>
{
    using var span = tracer.StartActiveSpan("hello-span");

    // do stuff
});
```

### Acquiring a tracer from a TracerProvider

If you're not using ASP.NET Core or would rather not inject an instance of a
`Tracer`, create one from your instantialized
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider):

```csharp
// ...

var tracer = tracerProvider.GetTracer(serviceName);

// Assign it somewhere globally

//...
```

You'll likely want to assign this `Tracer` instance to a variable in a central
location so that you have access to it throughout your service.

You can instantiate as many `Tracer`s as you'd like per service, although it's
generally sufficient to just have one defined per service.

## Creating Spans

To create a [span](/docs/concepts/signals/traces/#spans), give it a name and
create it from your `Tracer`.

```csharp
using var span = MyTracer.StartActiveSpan("SayHello");

// do work that 'span' will now track
```

## Creating nested Spans

If you have a distinct sub-operation you'd like to track as a part of another
one, you can create spans to represent the relationship.

```csharp
public static void ParentOperation(Tracer tracer)
{
    using var parentSpan = tracer.StartActiveSpan("parent-span");

    // Do some work tracked by parentSpan

    ChildOperation(tracer);

    // Finish up work tracked by parentSpan again
}

public static void ChildOperation(Tracer tracer)
{
    using var childSpan = tracer.StartActiveSpan("child-span");

    // Track work in ChildOperation with childSpan
}
```

When you view spans in a trace visualization tool, `child-span` will be tracked
as a nested operation under `parent-span"`.

### Nested Spans in the same scope

You may wish to create a parent-child relationsip in the same scope. Although
possible, this is generally not recommended because you need to be careful to
end any nested `TelemetrySpan` when you expect it to end.

```csharp
public static void DoWork(Tracer tracer)
{
    using var parentSpan = tracer.StartActiveSpan("parent-span");

    // Do some work tracked by parentSpan

    using (var childSpan = tracer.StartActiveSpan("child-span"))
    {
        // Do some "child" work in the same function
    }

    // Finish up work tracked by parentSpan again
}
```

In the preceding example, `childSpan` is ended because the scope of the `using`
block is explicitly defined, rather than scoped to `DoWork` itself like
`parentSpan`.

## Creating independent Spans

The previous examples showed how to create
[Spans](/docs/concepts/signals/traces/#spans) that follow a nested heirarchy. In
some cases, you'll want to create independent Spans that are siblings of the
same root rather than being nested.

```csharp
public static void DoWork(Tracer tracer)
{
    using var parent = tracer.StartSpan("parent");
    // 'parent' will be the shared parent of both 'child1' and 'child2'

    using (var child1 = tracer.StartSpan("child1"))
    {
        // do some work that 'child1' tracks
    }

    using (var child2 = tracer.StartSpan("child2"))
    {
        // do some work that 'child2' tracks
    }
}
```

## Creating new root Spans

You can also create new root [spans](/docs/concepts/signals/traces/#spans) that
are completely detached from the current trace.

```csharp
public static void DoWork(Tracer tracer)
{
    using var newRoot = tracer.StartRootSpan("newRoot");
}
```

## Get the current Span

Sometimes it's helpful to access whatever the current `TelemetrySpan` is at a
point in time so you can enrich it with more information.

```csharp
var span = Tracer.CurrentSpan;
// do cool stuff!
```

Note that `using` is not used in the prior example. Doing so will end current
`TelemetrySpan` when it goes out of scope, which is unlikely to be desired
behavior.

## Add Attributes to a Span

[Attributes](/docs/concepts/signals/traces/#attributes) let you attach key/value
pairs to a `TelemetrySpan` so it carries more information about the current
operation that it's tracking.

```csharp
using var span = tracer.StartActiveSpan("SayHello");

span.SetAttribute("operation.value", 1);
span.SetAttribute("operation.name", "Saying hello!");
span.SetAttribute("operation.other-stuff", new int[] { 1, 2, 3 });
```

## Adding events

An [event](/docs/concepts/signals/traces/#span-events) is a human-readable
message on an `TelemetrySpan` that represents "something happening" during its
lifetime. You can think of it like a primitive log.

```csharp
using var span = tracer.StartActiveSpan("SayHello");

// ...

span.AddEvent("Doing something...");

// ...

span.AddEvent("Dit it!");
```

Events can also be created with a timestamp and a collection of
[attributes](/docs/concepts/signals/traces/#attributes).

```csharp
using var span = tracer.StartActiveSpan("SayHello");

// ...

span.AddEvent("event-message");
span.AddEvent("event-message2", DateTimeOffset.Now);

// ...

var attributeData = new Dictionary<string, object>
{
    {"foo", 1 },
    { "bar", "Hello, World!" },
    { "baz", new int[] { 1, 2, 3 } }
};

span.AddEvent("asdf", DateTimeOffset.Now, new(attributeData));
```

## Adding links

A `TelemetrySpan` can be created with zero or more
[`Link`s](/docs/concepts/signals/traces/#span-links) that are causally related.

```csharp
// Get a context from somewhere, perhaps it's passed in as a parameter
var ctx = span.Context;

var links = new List<Link>
{
    new(ctx)
};

using var span = tracer.StartActiveSpan("another-span", links: links);

// do some work
```

## Set span status

A [status](/docs/concepts/signals/traces/#span-status) can be set on a span,
typically used to specify that a span has not completed successfully -
`Status.Error`. In rare scenarios, you could override the `Error` status with
`Ok`, but don't set `Ok` on successfully-completed spans.

The status can be set at any time before the span is finished:

```csharp
using var span = tracer.StartActiveSpan("SayHello");

try
{
	// do something
}
catch (Exception ex)
{
    span.SetStatus(Status.Error, "Something bad happened!");
}
```

## Record exceptions in spans

It can be a good idea to record exceptions when they happen. It's recommended to
do this in conjunction with setting [span status](#set-span-status).

```csharp
using var span = tracer.StartActiveSpan("SayHello");

try
{
	// do something
}
catch (Exception ex)
{
    span.SetStatus(Status.Error, "Something bad happened!");
    span.RecordException(ex)
}
```

This will capture things like the current stack trace as attributes in the span.

## Next steps

After you've setup manual instrumentation, you may want to use
[instrumentation libraries](/docs/instrumentation/net/libraries).
Instrumentation libraries will instrument relevant libraries you're using and
generate data for things like inbound and outbound HTTP requests and more.

You'll also want to configure an appropriate exporter to
[export your telemetry data](/docs/instrumentation/net/exporters) to one or more
telemetry backends.
