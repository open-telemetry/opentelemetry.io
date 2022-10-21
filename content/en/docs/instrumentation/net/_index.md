---
title: .NET
description: >
  <img width="35"
  src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/.NET.svg"
  alt=".NET"></img>
  A language-specific implementation of OpenTelemetry in .NET.
aliases: [/csharp, /csharp/metrics, /csharp/tracing]
weight: 12
---

<!--
You can see & update the `lang_instrumentation_index_head` shortcode in
/layouts/shortcodes/lang_instrumentation_index_head.md

The data (name, status) is located at
/data/instrumentation.yaml
-->
{{% lang_instrumentation_index_head "dotnet" %}}

\* While the OpenTelemetryLoggerProvider (i.e integration with [ILogger][]) is
stable, the [OTLP Log Exporter][] is still non-stable.
{{% /lang_instrumentation_index_head %}}

## Version Support

OpenTelemetry for .NET supports all officially supported versions of [.NET
Core](https://dotnet.microsoft.com/download/dotnet-core) and [.NET
Framework](https://dotnet.microsoft.com/download/dotnet-framework) except for
.NET Framework 3.5 SP1.

## Repositories

OpenTelemetry .NET consists of the following repositories:

- [OpenTelemetry .NET](https://github.com/open-telemetry/opentelemetry-dotnet)
- [OpenTelemetry .NET
  Contrib](https://github.com/open-telemetry/opentelemetry-dotnet-contrib)
- [OpenTelemetry .NET Automatic Instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation)

[ILogger]: https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger
[OTLP Log Exporter]: https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/src/OpenTelemetry.Exporter.OpenTelemetryProtocol/README.md#otlp-logs
