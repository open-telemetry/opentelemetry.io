---
title: Instrumentation
weight: 20
aliases: [manual]
description: Instrumentation for OpenTelemetry .NET
---

{{% docs/languages/manual-intro %}}

{{% alert title="Note" color="info" %}}

On this page you will learn how you can add traces, metrics and logs to your
code manually. You are not limited to using one kind of instrumentation:
you can also use [automatic instrumentation](/docs/languages/net/automatic/)
to get started and then enrich your code with manual instrumentation as needed.

Also, for libraries your code depends on, you don't have to write
instrumentation code yourself, since they might be already instrumented or there are 
[instrumentation libraries](/docs/languages/net/libraries/) for them.

{{% /alert %}}

## A note on terminology

.NET is different from other languages/runtimes that support OpenTelemetry. The
[Tracing API](/docs/concepts/signals/traces/) is implemented by the
[System.Diagnostics](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics)
API, repurposing existing constructs like `ActivitySource` and `Activity` to be
OpenTelemetry-compliant under the covers.

However, there are parts of the OpenTelemetry API and terminology that .NET
developers must still know to be able to instrument their applications, which
are covered here as well as the `System.Diagnostics` API.

If you prefer to use OpenTelemetry APIs instead of `System.Diagnostics` APIs,
you can refer to the [OpenTelemetry API Shim docs for tracing](../shim).

## Example app preparation {#example-app}

This page uses a modified version of the example app from
[Getting Started](/docs/languages/net/getting-started/) to help you learn
about manual instrumentation.

You don't have to use the example app: if you want to instrument your own app or
library, follow the instructions here to adapt the process to your own code.

### Dependencies {#example-app-dependencies}

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6+

### Create and launch an HTTP Server

To highlight the difference between instrumenting a library and a standalone
app, split out the dice rolling into a library file, which then will be
imported as a dependency by the app file.

Create the library file named `Dice.cs` and add the following code to it:

```csharp
/*Dice.cs*/

public class Dice
{
    private int min;
    private int max;

    public Dice(int min, int max)
    {
        this.min = min;
        this.max = max;
    }

    public List<int> rollTheDice(int rolls)
    {
        List<int> results = new List<int>();

        for (int i = 0; i < rolls; i++)
        {
            results.Add(rollOnce());
        }
        
        return results;
    }

    private int rollOnce()
    {
        return Random.Shared.Next(min, max + 1);
    }
}

```

Create the app file `DiceController.cs` and add the following code to it:

```csharp
/*DiceController.cs*/
using Microsoft.AspNetCore.Mvc;
using System.Net;


public class DiceController : ControllerBase
{
    private ILogger<DiceController> logger;

    public DiceController(ILogger<DiceController> logger)
    {
        this.logger = logger;
    }

    [HttpGet("/rolldice")]
    public List<int> RollDice(string player, int? rolls)
    {
        if(!rolls.HasValue)
        {
            logger.LogError("Missing rolls parameter");
            throw new HttpRequestException("Missing rolls parameter", null, HttpStatusCode.BadRequest);
        }
            
        var result = new Dice(1, 6).rollTheDice(rolls.Value);

        if (string.IsNullOrEmpty(player))
        {
            logger.LogInformation("Anonymous player is rolling the dice: {result}", result);
        }
        else
        {
            logger.LogInformation("{player} is rolling the dice: {result}", player, result);
        }

        return result;
    }
}

```

Replace the content of the Program.cs file with the following code:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
```

To ensure that it is working, run the application with the following command and
open <http://localhost:8080/rolldice?rolls=12> in your web browser:

```sh
dotnet run
```

You should get a list of 12 numbers in your browser window, for example:

```text
[5,6,5,3,6,1,2,5,4,4,2,4]
```

## Manual instrumentation setup

### Dependencies

Install the following OpenTelemetry NuGet packages:

[OpenTelemetry.Exporter.Console](https://www.nuget.org/packages/OpenTelemetry.Exporter.Console)

[OpenTelemetry.Extensions.Hosting](https://www.nuget.org/packages/OpenTelemetry.Extensions.Hosting)


```sh
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Extensions.Hosting
```

For ASP.NET Core-based applications, also install the AspNetCore instrumentation package

[OpenTelemetry.Instrumentation.AspNetCore](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNetCore)

```sh
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```


### Initialize the SDK

{{% alert title="Note" color="info" %}} If you’re instrumenting a library, you dont need to initialize the SDK. {{% /alert %}}

It is important to configure an instance of the OpenTelemetry SDK as early as possible in your application.

To initialize the OpenTelemetry SDK for an ASP.NET Core app like in the case of the example app, 
replace the content of the program.cs file with the following code: 

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Ideally, you will want this name to come from a config file, constants file, etc.
var serviceName = "Dice.*";
var serviceVersion = "1.0.0";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(
        serviceName: serviceName,
        serviceVersion: serviceVersion))
    .WithTracing(tracing => tracing
        .AddSource(serviceName)
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter())
    .WithMetrics(metrics => metrics
        .AddMeter(serviceName)
        .AddConsoleExporter());

builder.Logging.AddOpenTelemetry(options => options
    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(
        serviceName: serviceName,
        serviceVersion: serviceVersion))
    .AddConsoleExporter());

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();

```

If initializing the OpenTelemetry SDK for a console app,
add the following code at the beginning of your program, during any important startup operations.

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using OpenTelemetry.Logs;

//...

var serviceName = "MyServiceName";
var serviceVersion = "1.0.0";

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(serviceName)
    .ConfigureResource(resource =>
        resource.AddService(
          serviceName: serviceName,
          serviceVersion: serviceVersion))
    .AddConsoleExporter()
    .Build();

var meterProvider = Sdk.CreateMeterProviderBuilder()
    .AddMeter(serviceName)
    .AddConsoleExporter()
    .Build();

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder.AddOpenTelemetry(logging =>
    {
        logging.AddConsoleExporter();
    });
});

//...

```

For debugging and local development purposes, the example exports
telemetry to the console. After you have finished setting up manual
instrumentation, you need to configure an appropriate exporter to
[export the app's telemetry data](/docs/languages/net/exporters/) to one or more
telemetry backends.

The example also sets up the mandatory SDK default attribute `service.name`,
which holds the logical name of the service, and the optional, but highly
encouraged, attribute `service.version`, which holds the version of the service
API or implementation.
Alternative methods exist for setting up resource attributes. For more
information, see [Resources](/docs/languages/net/resources/).

To verify your code, build and run the app:

```sh
dotnet build
dotnet run
```


## Traces

### Initialize Tracing

{{% alert title="Note" color="info" %}} If you’re instrumenting a library, you dont need to initialize a TraceProvider. {{% /alert %}}

To enable [tracing](/docs/concepts/signals/traces/) in your app, you'll need to
have an initialized
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) that will let
you create a [`Tracer`](/docs/concepts/signals/traces/#tracer).

If a `TracerProvider` is not created, the OpenTelemetry APIs for tracing will
use a no-op implementation and fail to generate data.

If you followed the instructions to [initialize the SDK](#initialize-the-sdk)
above, you have a `TracerProvider` setup for you already. You can continue with
[acquiring a tracer](#acquiring-a-tracer).


### Setting up an ActivitySource

Anywhere in your application where you write manual tracing code should configure an
[`ActivitySource`](/docs/concepts/signals/traces/#tracer), which will be how you
trace operations with [`Activity`](/docs/concepts/signals/traces/#spans)
elements.

For example:

```csharp

public static class Telemetry
{
    //...

    public static readonly ActivitySource MyActivitySource = new("name", "version");

    //...
}
```
The values of name and version should uniquely identify the Instrumentation Scope, such as the package, module or class name. While the name is required, the version is still recommended despite being optional.

It’s generally recommended to define `ActivitySource` once per app/service that is been instrumented, but you can instantiate several `ActivitySource`s if that suits your scenario

In the case of the example app, there are two places where the `ActivitySource` will be instantiated with an appropriate Instrumentation Scope:

First, in the application file `DiceController.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net;

public class DiceController : ControllerBase
{
    private ILogger<DiceController> logger;
    
    public static readonly ActivitySource MyActivitySource = new("Dice.Server", "1.0.0");

    public DiceController(ILogger<DiceController> logger)
    {
        this.logger = logger;
    }

    //...
}


```

And second, in the library file `Dice.cs`:

```csharp

using System.Diagnostics;

public class Dice
{
    public static readonly ActivitySource MyActivitySource = new("Dice.Lib", "1.0.0");
    
    private int min;
    private int max;

    public Dice(int min, int max)
    {
        this.min = min;
        this.max = max;
    }

    //...
}

```

### Create Activities

Now that you have [activitySources](/docs/concepts/signals/traces/#tracer) initialized, you can create [activities](/docs/concepts/signals/traces/#spans).

The code below illustrates how to create an activity.

```csharp
public List<int> rollTheDice(int rolls)
{
    var activity = MyActivitySource.StartActivity("rollTheDice");
    List<int> results = new List<int>();

    for (int i = 0; i < rolls; i++)
    {
        results.Add(rollOnce());
    }

    activity?.Stop();
    return results;
}

```
Note, that it’s required to `Stop()` the activity, otherwise it will not be exported.

If you followed the instructions using the [example app](#example-app) up to
this point, you can copy the code above in your library file `Dice.cs`. You
should now be able to see activities/spans emitted from your app.

Start your app as follows, and then send it requests by visiting http://localhost:8080/rolldice?rolls=12 with your browser or curl.

```sh
dotnet run
```

After a while, you should see the spans printed in the console by the
`ConsoleExporter`, something like this:

```json
service.name: Dice.*
service.version: 1.0.0
service.instance.id: 17a824ba-9734-413d-951e-c44414b6b93b
telemetry.sdk.name: opentelemetry
telemetry.sdk.language: dotnet
telemetry.sdk.version: 1.7.0

Resource associated with Metric:
    service.name: Dice.*
    service.version: 1.0.0
    service.instance.id: 17a824ba-9734-413d-951e-c44414b6b93b
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.7.0
Activity.TraceId:            b322c0ce4bf1941cd6a476a454d78434
Activity.SpanId:             7bbfc1522b5595bb
Activity.TraceFlags:         Recorded
Activity.ParentSpanId:       c761f5e5ca3886bf
Activity.ActivitySourceName: Dice.Lib
Activity.DisplayName:        rollTheDice
Activity.Kind:               Internal
Activity.StartTime:          2024-02-08T08:10:47.5310248Z
Activity.Duration:           00:00:00.0002703
Resource associated with Activity:
    service.name: Dice.*
    service.version: 1.0.0
    service.instance.id: 17a824ba-9734-413d-951e-c44414b6b93b
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.7.0

```

### Create nested Activities
Nested [spans](/docs/concepts/signals/traces/#spans) let you track work that's
nested in nature. For example, the `rollOnce()` function below represents a
nested operation. The following sample creates a nested span that tracks
`rollOnce()`:

```csharp
private int rollOnce()
{
    int result;
    var childActivity = MyActivitySource.StartActivity("rollOnce");
    
    try
    {
        result = Random.Shared.Next(min, max + 1);
    }
    finally
    {
        childActivity?.Stop();
    }

    return result;
}

```

When you view the spans in a trace visualization tool, `rollOnce` childActivity will be
tracked as a nested operation under `rollTheDice` activity.

### Get the current Activity

Sometimes it’s helpful to do something with the current/active span at a particular point in program execution.

```csharp
var activity = Activity.Current;
```

### Activity Tags

Tags (the equivalent of [Attributes](/docs/concepts/signals/traces/#attributes)) let you attach key/value
pairs to an [`Activity`](/docs/concepts/signals/traces/#spans) so it carries more
information about the current operation that it's tracking.

```csharp
private int rollOnce()
{
    int result;
    var childActivity = MyActivitySource.StartActivity("rollOnce");
    
    try
    {
        result = Random.Shared.Next(min, max + 1);
        childActivity?.SetTag("dicelib.rolled", result);
    }
    finally
    {
        childActivity?.Stop();
    }

    return result;
}
```

### Create Activities with events

[Spans](/docs/concepts/signals/traces/#spans) can be annotated with named events
(called [Span Events](/docs/concepts/signals/traces/#span-events)) that can
carry zero or more [Span Attributes](#span-attributes), each of which itself is
a key:value map paired automatically with a timestamp.

```csharp
myActivity?.AddEvent(new("Init"));
...
myActivity?.AddEvent(new("End"));
```

```csharp
var eventTags = new ActivityTagsCollection
{
    { "operation", "calculate-pi" },
    { "result", 3.14159 }
};

activity?.AddEvent(new("End Computation", DateTimeOffset.Now, eventTags));
```

### Create Activities with links

A [Span](/docs/concepts/signals/traces/#spans) may be linked to zero or more
other Spans that are causally related via a
[Span Link](/docs/concepts/signals/traces/#span-links). Links can be used to
represent batched operations where a Span was initiated by multiple initiating
Spans, each representing a single incoming item being processed in the batch.


```csharp

var links = new List<ActivityLink>
{
    new ActivityLink(activityContext1),
    new ActivityLink(activityContext2),
    new ActivityLink(activityContext3)
};

var activity = MyActivitySource.StartActivity(
    ActivityKind.Internal,
    name: "activity-with-links",
    links: links);
```

For more details how to read context from remote processes, see
[Context Propagation](#context-propagation).


### Set Activity status

{{% docs/languages/span-status-preamble %}}

A [status](/docs/concepts/signals/traces/#span-status) can be set on a
[span](/docs/concepts/signals/traces/#spans), typically used to specify that a
span has not completed successfully - `SpanStatus.Error`. 

By default, all spans are `Unset`, which means a span completed without error. The `Ok` status is reserved for when you need to explicitly mark a span as successful rather than stick with the default of Unset (i.e., “without error”).

The status can be set at any time before the span is finished.

It can be a good idea to record exceptions when they happen. It's recommended to
do this in conjunction with
[setting span status](/docs/specs/otel/trace/api/#set-status).

```csharp
private int rollOnce()
{
    int result;
    var childActivity = MyActivitySource.StartActivity("rollOnce");

    try
    {
        result = Random.Shared.Next(min, max + 1);
    }
    catch (Exception ex)
    {
        childActivity?.SetStatus(ActivityStatusCode.Error, "Something bad happened!");
        childActivity?.RecordException(ex);
        throw;
    }
    finally
    {
        childActivity?.Stop();
    }

    return result;
}

```

## Metrics

The documentation for the metrics API & SDK is missing, you can help make it
available by
[editing this page](https://github.com/open-telemetry/opentelemetry.io/edit/main/content/en/docs/languages/net/instrumentation.md).

## Logs

The documentation for the logs API and SDK is missing. You can help make it
available by
[editing this page](https://github.com/open-telemetry/opentelemetry.io/edit/main/content/en/docs/languages/net/instrumentation.md).

## Next steps

After you've set up manual instrumentation, you may want to use
[instrumentation libraries](../libraries/). As the name suggests, they will
instrument relevant libraries you're using and generate spans (activities) for
things like inbound and outbound HTTP requests and more.

You'll also want to configure an appropriate exporter to
[export your telemetry data](../exporters/) to one or more telemetry backends.

You can also check the [automatic instrumentation for .NET](../automatic/),
which is currently in beta.
