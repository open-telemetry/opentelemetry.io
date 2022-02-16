---
title: Logs
description: Getting Started with OpenTelemetry .NET Logging
weight: 2
code_block_from__path_base: content-modules/opentelemetry-dotnet/examples/
---

Install the required packages

```console
dotnet add package Microsoft.Extensions.Logging
dotnet add package --prerelease OpenTelemetry.Exporter.Console
```

Update `Program.cs` with the following

{{% code_block_from file="ProgramLogs.cs" from="12" %}}

Run the application

```console
dotnet run
```

You should see output similar to the following

{{% code_block_from file="ProgramLogs.cs" lang="text" from="1" to="10" %}}

## What this program does

The program uses the [`ILogger`][1] API to log a formatted string with a
[severity level][2] of `Information`. OpenTelemetry captures this and sends it
to `ConsoleExporter`.

[1]: <https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger>
[2]: <https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.loglevel>
