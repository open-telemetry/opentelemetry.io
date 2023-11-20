---
title: Getting Started
description: Get telemetry for your app in less than 5 minutes!
cSpell:ignore: ASPNETCORE rolldice
weight: 5
---

This page will show you how to get started with OpenTelemetry .NET Automatic
Instrumentation.

If you are looking for a way to manually instrument your application, check out
[this guide](/docs/instrumentation/net/getting-started).

You will learn how you can instrument a simple .NET application automatically,
in such a way that [traces][], [metrics][] and [logs][] are emitted to the
console.

## Prerequisites

Ensure that you have the following installed locally:

- [.NET SDK](https://dotnet.microsoft.com/download/dotnet) 6+

## Example Application

The following example uses a basic
[Minimal API with ASP.NET Core](https://learn.microsoft.com/aspnet/core/tutorials/min-web-api)
application. If you are not using ASP.NET Core, that's OK — you can still use
OpenTelemetry .NET Automatic Instrumentation.

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

var logger = app.Logger;

int RollDice()
{
    return Random.Shared.Next(1, 7);
}

string HandleRollDice(string? player)
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

Next, you'll use a [OpenTelemetry .NET Automatic Instrumentation](../) to
instrument the application at launch time. While you can [configure .NET
Automatic Instrumentation][] in a number of ways, the steps below use Unix-shell
or PowerShell scripts.

> **Note**: PowerShell commands require elevated (administrator) privileges.

1. Download installation scripts from [Releases][] of the
   `opentelemetry-dotnet-instrumentation` repository:

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   curl -L -O https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   $module_url = "https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/OpenTelemetry.DotNet.Auto.psm1"
   $download_path = Join-Path $env:temp "OpenTelemetry.DotNet.Auto.psm1"
   Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing
   ```

   {{% /tab %}} {{< /tabpane >}}

2. Execute following script to download automatic instrumentation for your
   development environment:

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   ./otel-dotnet-auto-install.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   Import-Module $download_path
   Install-OpenTelemetryCore
   ```

   {{% /tab %}} {{< /tabpane >}}

3. Set and export variables that specify a [console exporter][], then execute
   script configuring other necessary environment variables using a notation
   suitable for your shell/terminal environment &mdash; we illustrate a notation
   for bash-like shells and PowerShell:

   {{< tabpane text=true >}} {{% tab Unix-shell %}}

   ```sh
   export OTEL_TRACES_EXPORTER=none \
     OTEL_METRICS_EXPORTER=none \
     OTEL_LOGS_EXPORTER=none \
     OTEL_DOTNET_AUTO_TRACES_CONSOLE_EXPORTER_ENABLED=true \
     OTEL_DOTNET_AUTO_METRICS_CONSOLE_EXPORTER_ENABLED=true \
     OTEL_DOTNET_AUTO_LOGS_CONSOLE_EXPORTER_ENABLED=true
     OTEL_SERVICE_NAME=RollDiceService
   . $HOME/.otel-dotnet-auto/instrument.sh
   ```

   {{% /tab %}} {{% tab PowerShell - Windows %}}

   ```powershell
   $env:OTEL_TRACES_EXPORTER="none"
   $env:OTEL_METRICS_EXPORTER="none"
   $env:OTEL_LOGS_EXPORTER="none"
   $env:OTEL_DOTNET_AUTO_TRACES_CONSOLE_EXPORTER_ENABLED="true"
   $env:OTEL_DOTNET_AUTO_METRICS_CONSOLE_EXPORTER_ENABLED="true"
   $env:OTEL_DOTNET_AUTO_LOGS_CONSOLE_EXPORTER_ENABLED="true"
   Register-OpenTelemetryForCurrentSession -OTelServiceName "RollDiceService"
   ```

   {{% /tab %}} {{< /tabpane >}}

4. Run your **application** once again:

   ```sh
   dotnet run
   ```

   Note the output from the `dotnet run`.

5. From _another_ terminal, send a request using `curl`:

   ```sh
   curl localhost:8080/rolldice
   ```

6. After about 30 sec, stop the server process.

At this point, you should see trace and log output from the server and client
that looks something like this (output is line-wrapped for readability):

<details>
<summary>Traces and Logs</summary>

```log
LogRecord.Timestamp:               2023-08-14T06:44:53.9279186Z
LogRecord.TraceId:                 3961d22b5f90bf7662ad4933318743fe
LogRecord.SpanId:                  93d5fcea422ff0ac
LogRecord.TraceFlags:              Recorded
LogRecord.CategoryName:            simple-dotnet
LogRecord.LogLevel:                Information
LogRecord.StateValues (Key:Value):
    result: 1
    OriginalFormat (a.k.a Body): Anonymous player is rolling the dice: {result}

Resource associated with LogRecord:
service.name: simple-dotnet
telemetry.auto.version: 0.7.0
telemetry.sdk.name: opentelemetry
telemetry.sdk.language: dotnet
telemetry.sdk.version: 1.4.0.802

info: simple-dotnet[0]
      Anonymous player is rolling the dice: 1
Activity.TraceId:            3961d22b5f90bf7662ad4933318743fe
Activity.SpanId:             93d5fcea422ff0ac
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: OpenTelemetry.Instrumentation.AspNetCore
Activity.DisplayName:        /rolldice
Activity.Kind:               Server
Activity.StartTime:          2023-08-14T06:44:53.9278162Z
Activity.Duration:           00:00:00.0049754
Activity.Tags:
    net.host.name: localhost
    net.host.port: 8080
    http.method: GET
    http.scheme: http
    http.target: /rolldice
    http.url: http://localhost:8080/rolldice
    http.flavor: 1.1
    http.user_agent: curl/8.0.1
    http.status_code: 200
Resource associated with Activity:
    service.name: simple-dotnet
    telemetry.auto.version: 0.7.0
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.4.0.802
```

</details>

Also when stopping the server, you should see an output of all the metrics
collected (sample excerpt shown):

<details>
<summary>Metrics</summary>

```log
Export process.runtime.dotnet.gc.collections.count, Number of garbage collections that have occurred since process start., Meter: OpenTelemetry.Instrumentation.Runtime/1.1.0.2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen2 LongSum
Value: 2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen1 LongSum
Value: 2
(2023-08-14T06:12:05.8500776Z, 2023-08-14T06:12:23.7750288Z] generation: gen0 LongSum
Value: 6

...

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

- To configure exporters, samplers, resources and more, see
  [Configuration and settings](../config)
- See the list of [available instrumentations](../instrumentations)
- If you want to combine automatic and manual instrumentation, learn how you
  [can create custom traces and metrics](../custom)
- If you face any issues, check the [Troubleshooting Guide](../troubleshooting)

[traces]: /docs/concepts/signals/traces/
[metrics]: /docs/concepts/signals/metrics/
[logs]: /docs/concepts/signals/logs/
[configure .NET Automatic Instrumentation]: ../config
[console exporter]:
  https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docs/config.md#internal-logs
[releases]:
  https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases
