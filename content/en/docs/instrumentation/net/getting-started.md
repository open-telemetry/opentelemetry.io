---
title: Getting Started
description: Get telemetry for your app in less than 5 minutes!
cSpell:ignore: ASPNETCORE rolldice
weight: 10
---

This page will show you how to get started with OpenTelemetry in .NET.

If you are looking for a way to automatically instrument your application, check
out [this guide](/docs/instrumentation/net/automatic/getting-started/).

You will learn how you can instrument a simple .NET application, in such a way
that [traces][], [metrics][] and [logs][] are emitted to the console.

## Prerequisites

Ensure that you have the following installed locally:

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6+

## Example Application

The following example uses a basic
[Minimal API with ASP.NET Core](https://learn.microsoft.com/aspnet/core/tutorials/min-web-api)
application. If you are not using a minimal API with ASP.NET Core, that's OK —
you can use OpenTelemetry .NET with other frameworks as well. For a complete
list of libraries for supported frameworks, see the
[registry](/ecosystem/registry/?component=instrumentation&language=dotnet).

For more elaborate examples, see
[examples](/docs/instrumentation/net/examples/).

### Create and launch an HTTP Server

To begin, set up an environment in a new directory called `dotnet-simple`.
Within that directory, execute following command:

```sh
dotnet new web
```

In the same directory, replace the content of `Program.cs` with the following
code:

```csharp
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string HandleRollDice([FromServices]ILogger<Program> logger, string? player)
{
    var result = RollDice();

    if (string.IsNullOrEmpty(player))
    {
        logger.LogInformation("Anonymous player is rolling the dice: {result}", result);
    }
    else
    {
        logger.LogInformation("{player} is rolling the dice: {result}", player, result);
    }

    return result.ToString(CultureInfo.InvariantCulture);
}

app.MapGet("/rolldice/{player?}", HandleRollDice);

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

Build and run the application with the following command, then open
<http://localhost:8080/rolldice> in your web browser to ensure it is working.

```sh
dotnet build
dotnet run
```

## Instrumentation

Next we'll install the instrumentation
[NuGet packages from OpenTelemetry](https://www.nuget.org/profiles/OpenTelemetry)
that will generate the telemetry, and set them up.

1. Add the packages

   ```sh
   dotnet add package OpenTelemetry.Extensions.Hosting
   dotnet add package OpenTelemetry.Instrumentation.AspNetCore --prerelease
   dotnet add package OpenTelemetry.Exporter.Console
   ```

2. Setup the OpenTelemetry code

   ```csharp
   var builder = WebApplication.CreateBuilder(args);

   const string serviceName = "roll-dice";

   builder.Logging.AddOpenTelemetry(options =>
   {
       options
           .SetResourceBuilder(
               ResourceBuilder.CreateDefault()
                   .AddService(serviceName))
           .AddConsoleExporter();
   });
   builder.Services.AddOpenTelemetry()
         .ConfigureResource(resource => resource.AddService(serviceName))
         .WithTracing(tracing => tracing
             .AddAspNetCoreInstrumentation()
             .AddConsoleExporter())
         .WithMetrics(metrics => metrics
             .AddAspNetCoreInstrumentation()
             .AddConsoleExporter());

   var app = builder.Build();
   ```

3. Run your **application** once again:

   ```sh
   dotnet run
   ```

   Note the output from the `dotnet run`.

4. From _another_ terminal, send a request using `curl`:

   ```sh
   curl localhost:8080/rolldice
   ```

5. After about 30 sec, stop the server process.

At this point, you should see trace and log output from the server and client
that looks something like this (output is line-wrapped for readability):

<details>
<summary>Traces and Logs</summary>

```log
LogRecord.Timestamp:               2023-10-23T12:13:30.2704325Z
LogRecord.TraceId:                 324333ec3bbca04ba7f4be4bf3618cb1
LogRecord.SpanId:                  e7d3814e31e504eb
LogRecord.TraceFlags:              Recorded
LogRecord.CategoryName:            Program
LogRecord.Severity:                Info
LogRecord.SeverityText:            Information
LogRecord.Body:                    Anonymous player is rolling the dice: {result}
LogRecord.Attributes (Key:Value):
    result: 1
    OriginalFormat (a.k.a Body): Anonymous player is rolling the dice: {result}

Resource associated with LogRecord:
service.name: roll-dice
service.instance.id: f20134f3-293f-4cb2-ace3-724b5571ca9a
telemetry.sdk.name: opentelemetry
telemetry.sdk.language: dotnet
telemetry.sdk.version: 1.6.0

Activity.TraceId:            324333ec3bbca04ba7f4be4bf3618cb1
Activity.SpanId:             e7d3814e31e504eb
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: Microsoft.AspNetCore
Activity.DisplayName:        /rolldice
Activity.Kind:               Server
Activity.StartTime:          2023-10-23T12:13:30.2163005Z
Activity.Duration:           00:00:00.0585187
Activity.Tags:
    net.host.name: 127.0.0.1
    net.host.port: 8080
    http.method: GET
    http.scheme: http
    http.target: /rolldice
    http.url: http://127.0.0.1:8080/rolldice
    http.flavor: 1.1
    http.user_agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (HTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.61
    http.status_code: 200
Resource associated with Activity:
    service.name: roll-dice
    service.instance.id: 36bfe322-51b8-4976-90fc-9186376d6ad0
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.6.0
```

</details>

Also when stopping the server, you should see an output of all the metrics
collected (sample excerpt shown):

<details>
<summary>Metrics</summary>

```log
Export http.client.duration, Measures the duration of outbound HTTP requests., Unit: ms, Meter: OpenTelemetry.Instrumentation.Http/1.0.0.0
(2023-08-14T06:12:06.2661140Z, 2023-08-14T06:12:23.7750388Z] http.flavor: 1.1 http.method: POST http.scheme: https http.status_code: 200 net.peer.name: dc.services.visualstudio.com Histogram
Value: Sum: 1330.4766000000002 Count: 5 Min: 50.0333 Max: 465.7936
(-Infinity,0]:0
(0,5]:0
(5,10]:0
(10,25]:0
(25,50]:0
(50,75]:2
(75,100]:0
(100,250]:0
(250,500]:3
(500,750]:0
(750,1000]:0
(1000,2500]:0
(2500,5000]:0
(5000,7500]:0
(7500,10000]:0
(10000,+Infinity]:0
```

</details>

## What next?

For more:

- Run this example with another [exporter][] for telemetry data.
- Try [automatic instrumentation](../automatic/) on one of your own apps.
- Learn about [manual instrumentation][] and try out more
  [examples](/docs/instrumentation/net/examples/).
- Take a look at the [OpenTelemetry Demo](/docs/demo/), which includes .NET
  based [Cart Service](/docs/demo/services/cart/).

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[exporter]:
  https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#exporters
[manual instrumentation]: ../manual
