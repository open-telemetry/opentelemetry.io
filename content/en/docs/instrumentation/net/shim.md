---
title: OpenTelemetry Tracing Shim
linkTitle: OpenTelemetry API Shim
weight: 5
---

NET is different from other languages/runtimes that support OpenTelemetry.
Tracing is implemented by the [System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics)
API, repurposing older constructs like `ActivitySource` and `Activity` to
be OpenTelemetry-compliant under the covers.

OpenTelemetry for .NET also provides an API shim on top of the [System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics)-
based implementation. This shim is helpful if you're working with other
languages and OpenTelemetry in the same codebase, or if you prefer to use
terminology consistent with the OpenTelemetry spec.

## Initializing tracing

There are two main ways to initialize tracing, depending on if you're using
a console app or something that's ASP.NET Core-based.

### Console app

To start tracing in a console app, you need to create a tracer provider.

First, ensure that you have the right packages:

```
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Exporter.Console
```

And then use code like this at the beginning of your program, during any important
startup operations.

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;

// ...

var serviceName = "MyServiceName";
var serviceVersion "1.0.0";

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

Note that this sample uses the Console Exporter. If you are exporting to another endpoint,
you'll have to use a different exporter.

### ASP.NET Core

To start tracing in an ASP.NET Core-based app, use the OpenTelemetry extensions for ASP.NET Core setup.

First, ensure that you have the right packages:

```
dotnet add package OpenTelemetry --prerelease
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
dotnet add package OpenTelemetry.Exporter.Console --prerelease
```

And then configure it in your ASP.NET Core startup routine where you have access to an `IServiceCollection`.

```csharp
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Define some important constants and the activity source.
// These can come from a config file, constants file, etc.
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

// Configure important OpenTelemetry settings, the console exporter, and automatic instrumentation
builder.Services.AddOpenTelemetryTracing(b =>
    {
        b
        .AddConsoleExporter()
        .AddSource(serviceName)
        .SetResourceBuilder(
            ResourceBuilder.CreateDefault()
                .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    }

// Optionally inject the service-level tracer
.AddSingleton(TracerProvider.Default.GetTracer(serviceName)));
```

In the preceding example, a `Tracer` corresponding to the service is injected during setup.
This lets you get access to an instance in your endpoint mapping (or controllers if you're
using an older version of .NET).

It's not required to inject a service-level tracer, nor does it improve performance either.
You will need to decide where you'll want your tracer instance to live, though.

This is also where you can configure instrumentation libraries.

Note that this sample uses the Console Exporter. If you are exporting to another endpoint,
you'll have to use a different exporter.

## Setting up a tracer

Once tracing is initialized, you can configure a `Tracer`, which will be how
you trace operations with `Span`s.

Typically, a `Tracer` is instantiated once per app/service that is being instrumented,
so it's a good idea to instantiate it once in a shared location. It is also typically named
the same as the Service Name.

### Injecting a tracer with ASP.NET Core

ASP.NET Core generally encourages injecting instances of long-lived objects like `Tracer`s
during setup.

```csharp
var builder = WebApplication.CreateBuilder(args);

// ...

builder.Services.AddSingleton(TracerProvider.Default.GetTracer(serviceName)));

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

If you're not using ASP.NET Core or would rather not inject an instance of a `Tracer`,
create one from your instantialized `TracerProvider`:

```csharp
// ...

var tracer = tracerProvider.GetTracer(serviceName);

// Assign it somewhere globally
 
//...
```

You'll likely want to assign this `Tracer` instance to a variable in a central location
so that you have access to it throughout your service.

You can instantiate as many `Tracer`s as you'd like per service, although it's generally
sufficient to just have one defined per service.

## Creating Spans

To create an activity, give it a name and create it from your `Tracer`.

```csharp
using var span = MyTracer.StartActiveSpan("SayHello");

// do work that 'span' will now track
```

## Creating nested Spans

If you have a distinct sub-operation you'd like to track as a part of another one,
you can create activities to represent the relationship.

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

When you view spans in a trace visualization tool, `child-span` will be tracked as a nested
operation under `parent-span"`.

### Nested Spans in the same scope

You may wish to create a parent-child relationsip in the same scope. Although possible, this is generally not
recommended because you need to be careful to end any nested `TelemetrySpan` when you expect it to end.

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

In the preceding example, `childSpan` is ended because the scope of the `using` block is explicitly defined,
rather than scoped to `DoWork` itself like `parentSpan`.

## Get the current Span

Sometimes it's helpful to access whatever the current `Activity` is at a point in time so you can enrich
it with more information.

```csharp
var span = Tracer.CurrentSpan;
// do cool stuff!
```

Note that `using` is not used in the prior example. Doing so will end current `TelemetrySpan`
when it goes out of scope, which is unlikely to be desired behavior.

## Add Attributes to a Span

Attributes let you attach key/value pairs to a `TelemetrySpan`
so it carries more information about the current operation that it's tracking.

```csharp
using var span = tracer.StartActiveSpan("SayHello");

span.SetAttribute("operation.value", 1);
span.SetAttribute("operation.name", "Saying hello!");
span.SetAttribute("operation.other-stuff", new int[] { 1, 2, 3 });
```

## Adding events

An event is a human-readable message on an `TelemetrySpan` that represents "something happening" during its lifetime.
You can think of it like a primitive log.

```csharp
using var span = tracer.StartActiveSpan("SayHello");

// ...

myActivity?.AddEvent(new("Gonna try it!"));

// ...

myActivity?.AddEvent(new("Did it!"));
```

Events can also be created with a timestamp and a collection of Tags.

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

A `TelemetrySpan` can be created with zero or more `Link`s that are causally related.

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
