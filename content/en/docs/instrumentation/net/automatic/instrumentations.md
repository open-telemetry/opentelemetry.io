---
title: Available instrumentations
linkTitle: Instrumentations
description: OpenTelemetry .NET Automatic Instrumentation supported libraries.
weight: 10
# prettier-ignore
cSpell:ignore: ASPNET ASPNETCORE Bootstrapper ENTITYFRAMEWORKCORE GRCPNETCLIENT GRPCNETCLIENT HOSTINGSTARTUPASSEMBLIES HTTPCLIENT ILOGGER MASSTRANSIT MYSQLCONNECTOR MYSQLDATA NETRUNTIME NPGSQL Npgsql NSERVICEBUS SQLCLIENT STACKEXCHANGEREDIS WCFCLIENT WCFSERVICE
---

The OpenTelemetry .NET Automatic Instrumentation supports a wide variety of
libraries.

## Instrumentations

All instrumentations are enabled by default for all signal types (traces,
metrics, and logs).

You can disable all instrumentations for a specific signal type by setting the
`OTEL_DOTNET_AUTO_{SIGNAL}_INSTRUMENTATION_ENABLED` environment variable to
`false`.

For a more granular approach, you can disable specific instrumentations for a
given signal type by setting the
`OTEL_DOTNET_AUTO_{SIGNAL}_{0}_INSTRUMENTATION_ENABLED` environment variable to
`false`, where `{SIGNAL}` is the type of signal, for example `TRACES`, and `{0}`
is the case-sensitive name of the instrumentation.

| Environment variable                                   | Description                                                                                                                                                                                                    | Default value                                                                          | Status                                                    |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`             | Enables all instrumentations.                                                                                                                                                                                  | `true`                                                                                 | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_INSTRUMENTATION_ENABLED`      | Enables all trace instrumentations. Overrides `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`.                                                                                                                      | Inherited from the current value of `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`         | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_TRACES_{0}_INSTRUMENTATION_ENABLED`  | Configuration pattern for enabling a specific trace instrumentation, where `{0}` is the uppercase ID of the instrumentation you want to enable. Overrides `OTEL_DOTNET_AUTO_TRACES_INSTRUMENTATION_ENABLED`.   | Inherited from the current value of `OTEL_DOTNET_AUTO_TRACES_INSTRUMENTATION_ENABLED`  | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_INSTRUMENTATION_ENABLED`     | Disables all metric instrumentations. Overrides `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`.                                                                                                                    | Inherited from the current value of `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`         | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_METRICS_{0}_INSTRUMENTATION_ENABLED` | Configuration pattern for enabling a specific metric instrumentation, where `{0}` is the uppercase ID of the instrumentation you want to enable. Overrides `OTEL_DOTNET_AUTO_METRICS_INSTRUMENTATION_ENABLED`. | Inherited from the current value of `OTEL_DOTNET_AUTO_METRICS_INSTRUMENTATION_ENABLED` | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOGS_INSTRUMENTATION_ENABLED`        | Disables all log instrumentations. Overrides `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`.                                                                                                                       | Inherited from the current value of `OTEL_DOTNET_AUTO_INSTRUMENTATION_ENABLED`         | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `OTEL_DOTNET_AUTO_LOGS_{0}_INSTRUMENTATION_ENABLED`    | Configuration pattern for enabling a specific log instrumentation, where `{0}` is the uppercase ID of the instrumentation you want to enable. Overrides `OTEL_DOTNET_AUTO_LOGS_INSTRUMENTATION_ENABLED`.       | Inherited from the current value of `OTEL_DOTNET_AUTO_LOGS_INSTRUMENTATION_ENABLED`    | [Experimental](/docs/specs/otel/versioning-and-stability) |

## Traces instrumentations

**Status**: [Mixed](/docs/specs/otel/versioning-and-stability). Traces are
stable, but particular instrumentation are in Experimental status due to lack of
stable semantic convention.

| ID                    | Instrumented library                                                                                                                                                                            | Supported versions | Instrumentation type | Status                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------- | --------------------------------------------------------- |
| `ASPNET`              | ASP.NET (.NET Framework) MVC / WebApi \[1\] **Not supported on .NET**                                                                                                                           | \*                 | source & bytecode    | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ASPNETCORE`          | ASP.NET Core **Not supported on .NET Framework**                                                                                                                                                | \*                 | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `AZURE`               | [Azure SDK](https://azure.github.io/azure-sdk/releases/latest/index.html)                                                                                                                       | \[2\]              | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ELASTICSEARCH`       | [Elastic.Clients.Elasticsearch](https://www.nuget.org/packages/Elastic.Clients.Elasticsearch)                                                                                                   | ≥8.0.0             | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ENTITYFRAMEWORKCORE` | [Microsoft.EntityFrameworkCore](https://www.nuget.org/packages/) **Not supported on .NET Framework**                                                                                            | ≥6.0.12            | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `GRAPHQL`             | [GraphQL](https://www.nuget.org/packages/GraphQL) **Not supported on .NET Framework**                                                                                                           | ≥7.5.0             | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `GRPCNETCLIENT`       | [Grpc.Net.Client](https://www.nuget.org/packages/Grpc.Net.Client)                                                                                                                               | ≥2.52.0 & < 3.0.0  | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `HTTPCLIENT`          | [System.Net.Http.HttpClient](https://docs.microsoft.com/dotnet/api/system.net.http.httpclient) and [System.Net.HttpWebRequest](https://docs.microsoft.com/dotnet/api/system.net.httpwebrequest) | \*                 | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `QUARTZ`              | [Quartz](https://www.nuget.org/packages/Quartz) **Not supported on .NET Framework 4.7.1 and older**                                                                                             | ≥3.4.0             | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `MASSTRANSIT`         | [MassTransit](https://www.nuget.org/packages/MassTransit) **Not supported on .NET Framework**                                                                                                   | ≥8.0.0             | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `MONGODB`             | [MongoDB.Driver.Core](https://www.nuget.org/packages/MongoDB.Driver.Core)                                                                                                                       | ≥2.13.3 & < 3.0.0  | source & bytecode    | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `MYSQLCONNECTOR`      | [MySqlConnector](https://www.nuget.org/packages/MySqlConnector)                                                                                                                                 | ≥2.0.0             | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `MYSQLDATA`           | [MySql.Data](https://www.nuget.org/packages/MySql.Data) **Not supported on .NET Framework**                                                                                                     | ≥8.1.0             | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NPGSQL`              | [Npgsql](https://www.nuget.org/packages/Npgsql)                                                                                                                                                 | ≥6.0.0             | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NSERVICEBUS`         | [NServiceBus](https://www.nuget.org/packages/NServiceBus)                                                                                                                                       | ≥8.0.0             | source & bytecode    | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `SQLCLIENT`           | [Microsoft.Data.SqlClient](https://www.nuget.org/packages/Microsoft.Data.SqlClient) and [System.Data.SqlClient](https://www.nuget.org/packages/System.Data.SqlClient)                           | \* \[3\]           | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `STACKEXCHANGEREDIS`  | [StackExchange.Redis](https://www.nuget.org/packages/StackExchange.Redis) **Not supported on .NET Framework**                                                                                   | ≥2.0.405 < 3.0.0   | source & bytecode    | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `WCFCLIENT`           | WCF                                                                                                                                                                                             | \*                 | source & bytecode    | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `WCFSERVICE`          | WCF **Not supported on .NET**.                                                                                                                                                                  | \*                 | source & bytecode    | [Experimental](/docs/specs/otel/versioning-and-stability) |

\[1\]: Only integrated pipeline mode is supported.

\[2\]: `Azure.` prefixed packages, released after October 1, 2021.

\[3\]: Microsoft.Data.SqlClient v3.\* is not supported on .NET Framework, due to
[issue](https://github.com/open-telemetry/opentelemetry-dotnet/issues/4243).

## Metrics instrumentations

**Status**: [Mixed](/docs/specs/otel/versioning-and-stability). Metrics are
stable, but particular instrumentation are in Experimental status due to lack of
stable semantic convention.

| ID            | Instrumented library                                                                                                                                                                            | Documentation                                                                                                                                                                                         | Supported versions | Instrumentation type | Status                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------- | --------------------------------------------------------- |
| `ASPNET`      | ASP.NET Framework \[1\] **Not supported on .NET**                                                                                                                                               | [ASP.NET metrics](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.AspNet-1.0.0-rc9.9/src/OpenTelemetry.Instrumentation.AspNet/README.md#list-of-metrics-produced) | \*                 | source & bytecode    | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `ASPNETCORE`  | ASP.NET Core \[2\] **Not supported on .NET Framework**                                                                                                                                          | [ASP.NET Core metrics](https://github.com/open-telemetry/opentelemetry-dotnet/blob/core-1.5.0/src/OpenTelemetry.Instrumentation.AspNetCore/README.md#list-of-metrics-produced)                        | \*                 | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `HTTPCLIENT`  | [System.Net.Http.HttpClient](https://docs.microsoft.com/dotnet/api/system.net.http.httpclient) and [System.Net.HttpWebRequest](https://docs.microsoft.com/dotnet/api/system.net.httpwebrequest) | [HttpClient metrics](https://github.com/open-telemetry/opentelemetry-dotnet/blob/core-1.5.0/src/OpenTelemetry.Instrumentation.Http/README.md#list-of-metrics-produced)                                | \*                 | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NETRUNTIME`  | [OpenTelemetry.Instrumentation.Runtime](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.Runtime)                                                                                   | [Runtime metrics](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.Runtime-1.5.1/src/OpenTelemetry.Instrumentation.Process/README.md#metrics)                      | \*                 | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `PROCESS`     | [OpenTelemetry.Instrumentation.Process](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.Process)                                                                                   | [Process metrics](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/Instrumentation.Process-0.5.0-beta.3/src/OpenTelemetry.Instrumentation.Process/README.md#metrics)               | \*                 | source               | [Experimental](/docs/specs/otel/versioning-and-stability) |
| `NSERVICEBUS` | [NServiceBus](https://www.nuget.org/packages/NServiceBus)                                                                                                                                       | [NServiceBus metrics](https://docs.particular.net/samples/open-telemetry/prometheus-grafana/#reporting-metric-values)                                                                                 | ≥8.0.0             | source & bytecode    | [Experimental](/docs/specs/otel/versioning-and-stability) |

\[1\]: The ASP.NET metrics are generated only if the `AspNet` trace
instrumentation is also enabled.

\[2\]: This instrumentation automatically enables the
`Microsoft.AspNetCore.Hosting.HttpRequestIn` spans.

## Logs instrumentations

**Status**: [Experimental](/docs/specs/otel/versioning-and-stability).

| ID      | Instrumented library                                                                                                            | Supported versions | Instrumentation type | Status                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------- | --------------------------------------------------------- |
| ILOGGER | [Microsoft.Extensions.Logging](https://www.nuget.org/packages/Microsoft.Extensions.Logging) **Not supported on .NET Framework** | ≥6.0.0             | bytecode or source   | [Experimental](/docs/specs/otel/versioning-and-stability) |

For ASP.NET Core applications, the `LoggingBuilder` instrumentation can be
enabled without using the .NET CLR Profiler by setting the
`ASPNETCORE_HOSTINGSTARTUPASSEMBLIES` environment variable to
`OpenTelemetry.AutoInstrumentation.AspNetCoreBootstrapper`.

### Instrumentation options

| Environment variable                    | Description                                                                                                                                                        | Default value | Status                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | --------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_GRAPHQL_SET_DOCUMENT` | Whether GraphQL instrumentation can pass raw queries as `graphql.document` attribute. This may contain sensitive information and therefore is disabled by default. | `false`       | [Experimental](/docs/specs/otel/versioning-and-stability) |
