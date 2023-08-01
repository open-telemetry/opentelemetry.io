---
title: .NET
description: >
  <img width="35" class="img-initial" src="/img/logos/32x32/dotnet.svg"
  alt=".NET"> A language-specific implementation of OpenTelemetry in .NET.
aliases: [/csharp, /csharp/metrics, /csharp/tracing]
weight: 12
---

{{% docs/instrumentation/index-intro dotnet %}}

\* While the OpenTelemetryLoggerProvider (i.e integration with [ILogger][]) is
stable, the [OTLP Log Exporter][] is still non-stable.

{{% /docs/instrumentation/index-intro %}}

## Version Support

OpenTelemetry for .NET supports all officially supported versions of
[.NET](https://dotnet.microsoft.com/download/dotnet-core) and
[.NET Framework](https://dotnet.microsoft.com/download/dotnet-framework) except
for .NET Framework 3.5 SP1.

## Repositories

OpenTelemetry .NET consists of the following repositories:

- [OpenTelemetry .NET](https://github.com/open-telemetry/opentelemetry-dotnet)
- [OpenTelemetry .NET Contrib](https://github.com/open-telemetry/opentelemetry-dotnet-contrib)
- [OpenTelemetry .NET Automatic Instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation)

[ilogger]:
  https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger
[otlp log exporter]:
  https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/src/OpenTelemetry.Exporter.OpenTelemetryProtocol/README.md#otlp-logs
