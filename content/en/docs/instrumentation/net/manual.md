---
title: Manual Instrumentation
linkTitle: Manual
weight: 3
---

Manual instrumentation is the process of adding observability code to your
application.

## A note on terminology

.NET is different from other languages/runtimes that support OpenTelemetry.
The [Tracing API](/docs/concepts/signals/traces/#tracing-in-opentelemetry) is
implemented by the
[System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics)
API, repurposing existing constructs like `ActivitySource` and `Activity` to be
OpenTelemetry-compliant under the covers.

However, there are parts of the OpenTelemetry API and terminology that .NET
developers must still know to be able to instrument their applications, which
are covered here as well as the `System.Diagnostics` API.

If you prefer to use OpenTelemetry APIs instead of `System.Diagnostics` APIs,
you can refer to the [OpenTelemetry API Shim docs for tracing]({{< relref "shim"
>}}).

## Initializing tracing

There are two main ways to initialize
[tracing](/docs/concepts/signals/traces/#tracing-in-opentelemetry), depending on
whether you're using a console app or something that's ASP.NET Core-based.

### Console app

To start tracing in a console app, you need to create a tracer provider.

First, ensure that you have the right packages:

```
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Exporter.Console
```

And then use code like this at the beginning of your program, during any
important startup operations.

```csharp
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// ...

var serviceName = "MyServiceName";
var serviceVersion = "1.0.0";

using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(serviceName)
    .SetResourceBuilder(ResourceBuilder
        .CreateDefault()
        .AddService(serviceName: serviceName, serviceVersion: serviceVersion))
    .AddConsoleExporter()
    .Build();

//...
```

This is also where you can configure instrumentation libraries.

Note that this sample uses the Console Exporter. If you are exporting to another
endpoint, you'll have to use a different exporter.

### ASP.NET Core

To start tracing in an ASP.NET Core-based app, use the OpenTelemetry extensions
for ASP.NET Core setup.

First, ensure that you have the right packages:

```
dotnet add package OpenTelemetry --prerelease
dotnet add package OpenTelemetry.Extensions.Hosting --prerelease
dotnet add package OpenTelemetry.Exporter.Console --prerelease
```

Note that the `--prerelease` flag is required for all instrumentation packages 
because they are all are pre-release.

Next, configure it in your ASP.NET Core startup routine where you have access
to an `IServiceCollection`.

```csharp
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Define some important constants and the activity source.
// These can come from a config file, constants file, etc.
var serviceName = "MyCompany.MyProduct.MyService";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

// Configure important OpenTelemetry settings, the console exporter
builder.Services.AddOpenTelemetryTracing(b =>
{
    b
    .AddConsoleExporter()
    .AddSource(serviceName)
    .SetResourceBuilder(ResourceBuilder
        .CreateDefault()
        .AddService(serviceName: serviceName, serviceVersion: serviceVersion));
});
```

This is also where you can configure instrumentation libraries.

Note that this sample uses the Console Exporter. If you are exporting to another
endpoint, you'll have to use a different exporter.

## Setting up an ActivitySource

Once tracing is initialized, you can configure an
[`ActivitySource`](/docs/concepts/signals/traces/#tracer), which will be how you
trace operations with
[`Activity`s](/docs/concepts/signals/traces/#spans-in-opentelemetry).

Typically, an `ActivitySource` is instantiated once per app/service that is
being instrumented, so it's a good idea to instantiate it once in a shared
location. It is also typically named the same as the Service Name.

```csharp
using System.Diagnostics;

public static class Telemetry
{
    //...

    // Name it after the service name for your app.
    // It can come from a config file, constants file, etc.
    public static readonly ActivitySource MyActivitySource = new(TelemetryConstants.ServiceName);

    //...
}
```

You can instantiate several `ActivitySource`s if that suits your scenario,
although it is generally sufficient to just have one defined per service.

## Creating Activities

To create an
[`Activity`](/docs/concepts/signals/traces/#spans-in-opentelemetry), give it a
name and create it from your
[`ActivitySource`](/docs/concepts/signals/traces/#tracer).

```csharp
using var myActivity = MyActivitySource.StartActivity("SayHello");

// do work that 'myActivity' will now track
```

## Creating nested Activities

If you have a distinct sub-operation you'd like to track as a part of another
one, you can create activities to represent the relationship.

```csharp
public static void ParentOperation()
{
    using var parentActivity = MyActivitySource.StartActivity("ParentActivity");

    // Do some work tracked by parentActivity

    ChildOperation();

    // Finish up work tracked by parentActivity again
}

public static void ChildOperation()
{
    using var childActivity = MyActivitySource.StartActivity("ChildActivity");

    // Track work in ChildOperation with childActivity
}
```

When you view spans in a trace visualization tool, `ChildActivity` will be
tracked as a nested operation under `ParentActivity`.

### Nested Activities in the same scope

You may wish to create a parent-child relationsip in the same scope. Although
possible, this is generally not recommended because you need to be careful to
end any nested `Activity` when you expect it to end.

```csharp
public static void DoWork()
{
    using var parentActivity = MyActivitySource.StartActivity("ParentActivity");

    // Do some work tracked by parentActivity

    using (var childActivity = MyActivitySource.StartActivity("ChildActivity"))
    {
        // Do some "child" work in the same function
    }

    // Finish up work tracked by parentActivity again
}
```

In the preceding example, `childActivity` is ended because the scope of the
`using` block is explicitly defined, rather than scoped to `DoWork` itself like
`parentActivity`.

## Creating independent Activities

The previous examples showed how to create Activities that follow a nested
hierarchy. In some cases, you'll want to create independent Activities that are
siblings of the same root rather than being nested.

```csharp
public static void DoWork()
{
    using var parent = MyActivitySource.StartActivity("parent");

    using (var child1 = DemoSource.StartActivity("child1"))
    {
        // Do some work that 'child1' tracks
    }

    using (var child2 = DemoSource.StartActivity("child2"))
    {
        // Do some work that 'child2' tracks
    }

    // 'child1' and 'child2' both share 'parent' as a parent, but are independent
    // from one another
}
```

## Creating new root Activities

If you wish to create a new root Activity, you'll need to "de-parent" from
the current activity.

```csharp
public static void DoWork()
{
    var previous = Activity.Current;
    Activity.Current = null;

    var newRoot = source.StartActivity("NewRoot");

    // Re-set the previous Current Activity so the trace isn't messed up
    Activity.Current = previous;
}
```

## Get the current Activity

Sometimes it's helpful to access whatever the current `Activity` is at a point
in time so you can enrich it with more information.

```csharp
var activity = Activity.Current;
// may be null if there is none
```

Note that `using` is not used in the prior example. Doing so will end current
`Activity`, which is not likely to be desired.

## Add tags to an Activity

Tags (the equivalent of
[`Attributes`](/docs/concepts/signals/traces/#attributes) in OpenTelemetry) let
you attach key/value pairs to an `Activity` so it carries more information about
the current operation that it's tracking.

```csharp
using var myActivity = MyActivitySource.StartActivity("SayHello");

activity?.SetTag("operation.value", 1);
activity?.SetTag("operation.name", "Saying hello!");
activity?.SetTag("operation.other-stuff", new int[] { 1, 2, 3 });
```

## Adding events

An [event](/docs/concepts/signals/traces/#span-events) is a human-readable
message on an `Activity` that represents "something happening" during its
lifetime.

```csharp
using var myActivity = MyActivitySource.StartActivity("SayHello");

// ...

myActivity?.AddEvent(new("Gonna try it!"));

// ...

myActivity?.AddEvent(new("Did it!"));
```

Events can also be created with a timestamp and a collection of Tags.

```csharp
using var myActivity = MyActivitySource.StartActivity("SayHello");

// ...

myActivity?.AddEvent(new("Gonna try it!", DateTimeOffset.Now));

// ...

var eventTags = new Dictionary<string, object?>
{
    { "foo", 1 },
    { "bar", "Hello, World!" },
    { "baz", new int[] { 1, 2, 3 } }
};

myActivity?.AddEvent(new("Gonna try it!", DateTimeOffset.Now, new(eventTags)));
```

## Adding links

An `Activity` can be created with zero or more
[`ActivityLink`s](/docs/concepts/signals/traces/#span-links) that are causally
related.

```csharp
// Get a context from somewhere, perhaps it's passed in as a parameter
var activityContext = Activity.Current!.Context;

var links = new List<ActivityLink>
{
    new ActivityLink(activityContext)
};

using var anotherActivity =
    MyActivitySource.StartActivity(
        ActivityKind.Internal,
        name: "anotherActivity",
        links: links);

// do some work
```

## Set Activity status

A [status](/docs/concepts/signals/traces/#span-status) can be set on an
activity, typically used to specify that an activity has not completed
successfully - `ActivityStatusCode.Error`. In rare scenarios, you could override
the `Error` status with `Ok`, but don't set `Ok` on successfully-completed
spans.

The status can be set at any time before the span is finished:

```csharp
using var myActivity = MyActivitySource.StartActivity("SayHello");

try
{
	// do something
}
catch (Exception ex)
{
    myActivity.SetStatus(ActivityStatusCode.Error, "Something bad happened!");
}
```

## Next steps

After you've set up manual instrumentation, you may want to use [instrumentation
libraries](../libraries/). As the name suggests, they will
instrument relevant libraries you're using and generate spans (activities) for things like
inbound and outbound HTTP requests and more.

You'll also want to configure an appropriate exporter to [export your telemetry
data](../exporters/) to one or more telemetry backends.

You can also check the [automatic instrumentation for
.NET](../automatic/), which is currently in beta.
