---
title: Instrumentation
weight: 36
aliases: [manual]
description: Instrumentation for OpenTelemetry .NET
cSpell:ignore: dicelib rolldice
---

{{% include instrumentation-intro.md %}}

{{% alert title="Note" %}}

On this page you will learn how you can add traces, metrics and logs to your
code manually. You are not limited to using one kind of instrumentation: you can
also use [automatic instrumentation](/docs/zero-code/dotnet/) to get started and
then enrich your code with manual instrumentation as needed.

Also, for libraries your code depends on, you don't have to write
instrumentation code yourself, since they might be already instrumented or there
are [instrumentation libraries](/docs/languages/dotnet/libraries/) for them.

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
[Getting Started](/docs/languages/dotnet/getting-started/) to help you learn
about manual instrumentation.

You don't have to use the example app: if you want to instrument your own app or
library, follow the instructions here to adapt the process to your own code.

### Prerequisites {#example-app-prerequisites}

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6+

### Create and launch an HTTP Server

To begin, set up an environment in a new directory called `dotnet-otel-example`.
Within that directory, execute following command:

```shell
dotnet new web
```

To highlight the difference between instrumenting a library and a standalone
app, split out the dice rolling into a library file, which then will be imported
as a dependency by the app file.

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

In the `Properties` subdirectory, replace the content of `launchSettings.json`
with the following:

```json
{
  "$schema": "http://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://localhost:8080",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
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

For ASP.NET Core-based applications, also install the AspNetCore instrumentation
package

[OpenTelemetry.Instrumentation.AspNetCore](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNetCore)

```sh
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

### Initialize the SDK

{{% alert title="Note" %}} If you’re instrumenting a library, you don't need to
initialize the SDK. {{% /alert %}}

It is important to configure an instance of the OpenTelemetry SDK as early as
possible in your application.

To initialize the OpenTelemetry SDK for an ASP.NET Core app like in the case of
the example app, update the content of the `Program.cs` file with the following
code:

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

// Ideally, you will want this name to come from a config file, constants file, etc.
var serviceName = "dice-server";
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

If initializing the OpenTelemetry SDK for a console app, add the following code
at the beginning of your program, during any important startup operations.

```csharp
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

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

tracerProvider.Dispose();
meterProvider.Dispose();
loggerFactory.Dispose();
```

For debugging and local development purposes, the example exports telemetry to
the console. After you have finished setting up manual instrumentation, you need
to configure an appropriate exporter to
[export the app's telemetry data](/docs/languages/dotnet/exporters/) to one or
more telemetry backends.

The example also sets up the mandatory SDK default attribute `service.name`,
which holds the logical name of the service, and the optional, but highly
encouraged, attribute `service.version`, which holds the version of the service
API or implementation. Alternative methods exist for setting up resource
attributes. For more information, see
[Resources](/docs/languages/dotnet/resources/).

To verify your code, build and run the app:

```sh
dotnet build
dotnet run
```

## Traces

### Initialize Tracing

{{% alert title="Note" %}} If you’re instrumenting a library, you don't need to
initialize a TracerProvider. {{% /alert %}}

To enable [tracing](/docs/concepts/signals/traces/) in your app, you'll need to
have an initialized
[`TracerProvider`](/docs/concepts/signals/traces/#tracer-provider) that will let
you create a [`Tracer`](/docs/concepts/signals/traces/#tracer).

If a `TracerProvider` is not created, the OpenTelemetry APIs for tracing will
use a no-op implementation and fail to generate data.

If you followed the instructions to [initialize the SDK](#initialize-the-sdk)
above, you have a `TracerProvider` setup for you already. You can continue with
[setting up an ActivitySource](#setting-up-an-activitysource).

### Setting up an ActivitySource

Anywhere in your application where you write manual tracing code should
configure an [`ActivitySource`](/docs/concepts/signals/traces/#tracer), which
will be how you trace operations with
[`Activity`](/docs/concepts/signals/traces/#spans) elements.

It’s generally recommended to define `ActivitySource` once per app/service that
is been instrumented, but you can instantiate several `ActivitySource`s if that
suits your scenario.

In the case of the example app, we will create a new file `Instrumentation.cs`
as a custom type to hold reference for the ActivitySource.

```csharp
using System.Diagnostics;

/// <summary>
/// It is recommended to use a custom type to hold references for ActivitySource.
/// This avoids possible type collisions with other components in the DI container.
/// </summary>
public class Instrumentation : IDisposable
{
    internal const string ActivitySourceName = "dice-server";
    internal const string ActivitySourceVersion = "1.0.0";

    public Instrumentation()
    {
        this.ActivitySource = new ActivitySource(ActivitySourceName, ActivitySourceVersion);
    }

    public ActivitySource ActivitySource { get; }

    public void Dispose()
    {
        this.ActivitySource.Dispose();
    }
}
```

Then we will update the `Program.cs` to add the Instrument object as a
dependency injection:

```csharp
//...

// Register the Instrumentation class as a singleton in the DI container.
builder.Services.AddSingleton<Instrumentation>();

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
```

In the application file `DiceController.cs` we will reference that
activitySource instance and the same activitySource instance will also be passed
to the library file `Dice.cs`

```csharp
/*DiceController.cs*/

using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Net;

public class DiceController : ControllerBase
{
    private ILogger<DiceController> logger;

    private ActivitySource activitySource;

    public DiceController(ILogger<DiceController> logger, Instrumentation instrumentation)
    {
        this.logger = logger;
        this.activitySource = instrumentation.ActivitySource;
    }

    [HttpGet("/rolldice")]
    public List<int> RollDice(string player, int? rolls)
    {
        List<int> result = new List<int>();

        if (!rolls.HasValue)
        {
            logger.LogError("Missing rolls parameter");
            throw new HttpRequestException("Missing rolls parameter", null, HttpStatusCode.BadRequest);
        }

        result = new Dice(1, 6, activitySource).rollTheDice(rolls.Value);

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

```csharp
/*Dice.cs*/

using System.Diagnostics;

public class Dice
{
    public ActivitySource activitySource;
    private int min;
    private int max;

    public Dice(int min, int max, ActivitySource activitySource)
    {
        this.min = min;
        this.max = max;
        this.activitySource = activitySource;
    }

    //...
}
```

### Create Activities

Now that you have [activitySources](/docs/concepts/signals/traces/#tracer)
initialized, you can create [activities](/docs/concepts/signals/traces/#spans).

The code below illustrates how to create an activity.

```csharp
public List<int> rollTheDice(int rolls)
{
    List<int> results = new List<int>();

    // It is recommended to create activities, only when doing operations that are worth measuring independently.
    // Too many activities makes it harder to visualize in tools like Jaeger.
    using (var myActivity = activitySource.StartActivity("rollTheDice"))
    {
        for (int i = 0; i < rolls; i++)
        {
            results.Add(rollOnce());
        }

        return results;
    }
}
```

If you followed the instructions using the [example app](#example-app) up to
this point, you can copy the code above in your library file `Dice.cs`. You
should now be able to see activities/spans emitted from your app.

Start your app as follows, and then send it requests by visiting
<http://localhost:8080/rolldice?rolls=12> with your browser or curl.

```sh
dotnet run
```

After a while, you should see the spans printed in the console by the
`ConsoleExporter`, something like this:

```json
Activity.TraceId:            841d70616c883db82b4ae4e11c728636
Activity.SpanId:             9edfe4d69b0d6d8b
Activity.TraceFlags:         Recorded
Activity.ParentSpanId:       39fcd105cf958377
Activity.ActivitySourceName: dice-server
Activity.DisplayName:        rollTheDice
Activity.Kind:               Internal
Activity.StartTime:          2024-04-10T15:24:00.3620354Z
Activity.Duration:           00:00:00.0144329
Resource associated with Activity:
    service.name: dice-server
    service.version: 1.0.0
    service.instance.id: 7a7a134f-3178-4ac6-9625-96df77cff8b4
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
    using (var childActivity = activitySource.StartActivity("rollOnce"))
    {
      int result;

      result = Random.Shared.Next(min, max + 1);

      return result;
    }
}
```

When you view the spans in a trace visualization tool, `rollOnce` childActivity
will be tracked as a nested operation under `rollTheDice` activity.

### Get the current Activity

Sometimes it’s helpful to do something with the current/active Activity/Span at
a particular point in program execution.

```csharp
var activity = Activity.Current;
```

### Activity Tags

Tags (the equivalent of [Attributes](/docs/concepts/signals/traces/#attributes))
let you attach key/value pairs to an
[`Activity`](/docs/concepts/signals/traces/#spans) so it carries more
information about the current operation that it's tracking.

```csharp
private int rollOnce()
{
  using (var childActivity = activitySource.StartActivity("rollOnce"))
    {
      int result;

      result = Random.Shared.Next(min, max + 1);
      childActivity?.SetTag("dicelib.rolled", result);

      return result;
    }
}
```

### Add Events to Activities

[Spans](/docs/concepts/signals/traces/#spans) can be annotated with named events
(called [Span Events](/docs/concepts/signals/traces/#span-events)) that can
carry zero or more [Span Attributes](#activity-tags), each of which itself is a
key:value map paired automatically with a timestamp.

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

### Set Activity status

{{% include "span-status-preamble.md" %}}

It can be a good idea to record exceptions when they happen. It's recommended to
do this in conjunction with
[setting span status](/docs/specs/otel/trace/api/#set-status).

```csharp
private int rollOnce()
{
    using (var childActivity = activitySource.StartActivity("rollOnce"))
    {
        int result;

        try
        {
            result = Random.Shared.Next(min, max + 1);
            childActivity?.SetTag("dicelib.rolled", result);
        }
        catch (Exception ex)
        {
            childActivity?.SetStatus(ActivityStatusCode.Error, "Something bad happened!");
            childActivity?.AddException(ex);
            throw;
        }

        return result;
    }
}
```

## Next steps

After you've set up manual instrumentation, you may want to use
[instrumentation libraries](../libraries/). As the name suggests, they will
instrument relevant libraries you're using and generate spans (activities) for
things like inbound and outbound HTTP requests and more.

You'll also want to configure an appropriate exporter to
[export your telemetry data](../exporters/) to one or more telemetry backends.

You can also check the
[automatic instrumentation for .NET](/docs/zero-code/dotnet/), which is
currently in beta.
