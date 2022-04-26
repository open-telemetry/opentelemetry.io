---
title: .NET
description: >
  <img width="35" src="https://raw.github.com/open-telemetry/opentelemetry.io/main/iconography/32x32/.NET.svg" alt="NET logo"></img>
  A language-specific implementation of OpenTelemetry in .NET.
aliases: [/csharp, /csharp/metrics, /csharp/tracing]
weight: 12
---

Welcome to the OpenTelemetry for .NET documentation! This is intended to be an
overview of OpenTelemetry in this language, and a brief guide to its options and
features.

OpenTelemetry for .NET supports all officially supported versions of [.NET
Core](https://dotnet.microsoft.com/download/dotnet-core) and [.NET
Framework](https://dotnet.microsoft.com/download/dotnet-framework) except for
.NET Framework 3.5 SP1.

# Status and Releases

The release status for .NET OpenTelemetry components is as follows:

- **Traces**: [Stable][]
- **Metrics**: [Stable][]
- **Logs**:
  - [ILogger][]: [Stable][]
  - [OTLP log exporter][]: [Experimental][]

{{% latest_release "dotnet" /%}}

# Learn more

- [OpenTelemetry .NET on
  GitHub](https://github.com/open-telemetry/opentelemetry-dotnet)
- [Getting
  Started](https://github.com/open-telemetry/opentelemetry-dotnet#getting-started)
- [OpenTelemetry .NET
  Contrib](https://github.com/open-telemetry/opentelemetry-dotnet-contrib)
- [OpenTelemetry .NET Automatic Instrumentation on
  GitHub](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation)

[Experimental]: /docs/reference/specification/versioning-and-stability/#experimental
[ILogger]: https://docs.microsoft.com/dotnet/api/microsoft.extensions.logging.ilogger
[OTLP Log Exporter]: https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/src/OpenTelemetry.Exporter.OpenTelemetryProtocol/README.md#otlp-logs
[Stable]: /docs/reference/specification/versioning-and-stability/#stable
