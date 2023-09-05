---
title: Configuration and settings
linkTitle: Configuration
weight: 20
# prettier-ignore
cSpell:ignore: NETFX AZUREAPPSERVICE UNHANDLEDEXCEPTION CORECLR CLSID dylib Bitness bitness BITNESS
---

## Configuration methods

You can apply or edit configuration settings in the following ways, with
environment variables taking precedence over `App.config` or `Web.config` file:

1. Environment variables

   Environment variables are the main way to configure the settings.

2. `App.config` or `Web.config` file

   For an application running on .NET Framework, you can use a web configuration
   file (`web.config`) or an application configuration file (`app.config`) to
   configure the `OTEL_*` settings.

   ⚠️ Only settings starting with `OTEL_` can be set using `App.config` or
   `Web.config`. However, the following settings are not supported:

   - `OTEL_DOTNET_AUTO_HOME`
   - `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`
   - `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED`
   - `OTEL_DOTNET_AUTO_[TRACES|METRICS|LOGS]_INSTRUMENTATIONS_ENABLED`
   - `OTEL_DOTNET_AUTO_[TRACES|METRICS|LOGS]_{INSTRUMENTATION_ID}_INSTRUMENTATION_ENABLED`
   - `OTEL_DOTNET_AUTO_LOG_DIRECTORY`
   - `OTEL_LOG_LEVEL`
   - `OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`

   Example with `OTEL_SERVICE_NAME` setting:

   ```xml
   <configuration>
   <appSettings>
       <add key="OTEL_SERVICE_NAME" value="my-service-name" />
   </appSettings>
   </configuration>
   ```

3. Service name automatic detection

   If no service name is explicitly configured one will be generated for you.
   This can be helpful in some circumstances.

   - If the application is hosted on IIS in .NET Framework this will be
     `SiteName\VirtualPath` ex: `MySite\MyApp`
   - If that is not the case it will use the name of the application
     [entry Assembly](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly.getentryassembly?view=net-7.0).

By default we recommend using environment variables for configuration. However,
if given setting supports it, then:

- use `Web.config` for configuring an ASP.NET application (.NET Framework),
- use `App.config` for configuring a Windows Service (.NET Framework).

## Global settings

| Environment variable                 | Description                                                                                                                                                                                                                             | Default value | Status                                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_HOME`              | Installation location.                                                                                                                                                                                                                  |               | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES` | Names of the executable files that the profiler cannot instrument. Supports multiple comma-separated values, for example: `ReservedProcess.exe,powershell.exe`. If unset, the profiler attaches to all processes by default. \[1\]\[2\] |               | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED` | Enables possibility to fail process when automatic instrumentation cannot be executed. It is designed for debugging purposes. It should not be used in production environment. \[1\]                                                    | `false`       | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_LOG_LEVEL`                     | SDK log level. (supported values: `none`,`error`,`warn`,`info`,`debug`)                                                                                                                                                                 | `info`        | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md)       |

\[1\] If `OTEL_DOTNET_AUTO_FAIL_FAST_ENABLED` is set to `true` then processes
excluded from instrumentation by `OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES` will fail
instead of silently continue. \[2\] Notice that applications launched via
`dotnet MyApp.dll` have process name `dotnet` or `dotnet.exe`.

## Resources

A resource is the immutable representation of the entity producing the
telemetry. See
[Resource semantic conventions](https://github.com/open-telemetry/opentelemetry-specification/tree/main/specification/resource/semantic_conventions)
for more details.

### Resource attributes

| Environment variable       | Description                                                                                                                                                                                                                                                                                                       | Default value                                                                                                                                                                                                                       | Status                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_RESOURCE_ATTRIBUTES` | Key-value pairs to be used as resource attributes. See [Resource SDK](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/sdk.md#specifying-resource-information-via-an-environment-variable) for more details.                                                        | See [Resource semantic conventions](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#semantic-attributes-with-sdk-provided-default-value) for details. | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_SERVICE_NAME`        | Sets the value of the [`service.name`](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md#service) resource attribute. If `service.name` is provided in `OTEL_RESOURCE_ATTRIBUTES`, the value of `OTEL_SERVICE_NAME` takes precedence. | See [Service name automatic detection](#configuration-methods) under Configuration method section.                                                                                                                                  | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

### Resource detectors

| Environment variable                             | Description                                                                                                                                                                                           | Default value | Status                                                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_RESOURCE_DETECTOR_ENABLED`     | Enables all resource detectors.                                                                                                                                                                       | `true`        | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_{0}_RESOURCE_DETECTOR_ENABLED` | Configuration pattern for enabling a specific resource detector, where `{0}` is the uppercase ID of the resource detector you want to enable. Overrides `OTEL_DOTNET_AUTO_RESOURCE_DETECTOR_ENABLED`. | `true`        | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

The following resource detectors are included and enabled by default:

| ID                | Description                | Documentation                                                                                                                                                                                                     | Status                                                                                                                            |
| ----------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `CONTAINER`       | Container detector         | [Container resource detector documentation](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/ResourceDetectors.Container-1.0.0-beta.3/src/OpenTelemetry.ResourceDetectors.Container/README.md) | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `AZUREAPPSERVICE` | Azure App Service detector | [Azure resource detector documentation](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/blob/ResourceDetectors.Azure-1.0.0-beta.2/src/OpenTelemetry.ResourceDetectors.Azure/README.md)             | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

## Propagators

Propagators allow applications to share context. See
[the OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/context/api-propagators.md)
for more details.

| Environment variable | Description                                                                                                                                                                                                                                                                                                  | Default value          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `OTEL_PROPAGATORS`   | Comma-separated list of propagators. Supported options: `tracecontext`, `baggage`, `b3multi`, `b3`. See [the OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.14.0/specification/sdk-environment-variables.md#general-sdk-configuration) for more details. | `tracecontext,baggage` |

## Samplers

Samplers let you control potential noise and overhead introduced by
OpenTelemetry instrumentation by selecting which traces you want to collect and
export. See
[the OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.15.0/specification/sdk-environment-variables.md?plain=1#L45-L80)
for more details.

| Environment variable      | Description                                           | Default value           | Status                                                                                                                      |
| ------------------------- | ----------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_TRACES_SAMPLER`     | Sampler to be used for traces \[1\]                   | `parentbased_always_on` | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_TRACES_SAMPLER_ARG` | String value to be used as the sampler argument \[2\] |                         | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

\[1\]: Supported values are:

- `always_on`,
- `always_off`,
- `traceidratio`,
- `parentbased_always_on`,
- `parentbased_always_off`,
- `parentbased_traceidratio`.

\[2\]: For `traceidratio` and `parentbased_traceidratio` samplers: Sampling
probability, a number in the [0..1] range, e.g. "0.25". Default is 1.0.

## Exporters

Exporters output the telemetry.

| Environment variable    | Description                                                                                       | Default value | Status                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_TRACES_EXPORTER`  | Traces exporter to be used. The value can be one of the following: `zipkin`, `otlp`, `none`.      | `otlp`        | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_METRICS_EXPORTER` | Metrics exporter to be used. The value can be one of the following: `otlp`, `prometheus`, `none`. | `otlp`        | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_LOGS_EXPORTER`    | Logs exporter to be used. The value can be one of the following: `otlp`, `none`.                  | `otlp`        | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

### Traces exporter

| Environment variable             | Description                                                                  | Default value | Status                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_BSP_SCHEDULE_DELAY`        | Delay interval (in milliseconds) between two consecutive exports.            | `5000`        | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_BSP_EXPORT_TIMEOUT`        | Maximum allowed time (in milliseconds) to export data                        | `30000`       | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_BSP_MAX_QUEUE_SIZE`        | Maximum queue size.                                                          | `2048`        | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_BSP_MAX_EXPORT_BATCH_SIZE` | Maximum batch size. Must be less than or equal to `OTEL_BSP_MAX_QUEUE_SIZE`. | `512`         | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

### Metrics exporter

| Environment variable          | Description                                                                   | Default value                                           | Status                                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_METRIC_EXPORT_INTERVAL` | The time interval (in milliseconds) between the start of two export attempts. | `60000` for OTLP exporter, `10000` for console exporter | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_METRIC_EXPORT_TIMEOUT`  | Maximum allowed time (in milliseconds) to export data.                        | `30000` for OTLP exporter, none for console exporter    | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

### Logs exporter

| Environment variable                              | Description                                             | Default value | Status                                                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_LOGS_INCLUDE_FORMATTED_MESSAGE` | Whether the formatted log message should be set or not. | `false`       | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

### OTLP

**Status**:
[Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md)

To enable the OTLP exporter, set the
`OTEL_TRACES_EXPORTER`/`OTEL_METRICS_EXPORTER`/`OTEL_LOGS_EXPORTER` environment
variable to `otlp`.

To customize the OTLP exporter using environment variables, see the
[OTLP exporter documentation](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.5.1/src/OpenTelemetry.Exporter.OpenTelemetryProtocol#environment-variables).
Important environment variables include:

| Environment variable                     | Description                                                                                                                                                                                                | Default value                                                                                             | Status                                                                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT`            | Target endpoint for the OTLP exporter. See [the OpenTelemetry specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md) for more details. | `http://localhost:4318` for the `http/protobuf` protocol, `http://localhost:4317` for the `grpc` protocol | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_EXPORTER_OTLP_PROTOCOL`            | OTLP exporter transport protocol. Supported values are `grpc`, `http/protobuf`. [1]                                                                                                                        | `http/protobuf`                                                                                           | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_EXPORTER_OTLP_TIMEOUT`             | The max waiting time (in milliseconds) for the backend to process each batch.                                                                                                                              | `10000`                                                                                                   | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_EXPORTER_OTLP_HEADERS`             | Comma-separated list of additional HTTP headers sent with each export, for example: `Authorization=secret,X-Key=Value`.                                                                                    |                                                                                                           | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT`      | Maximum allowed attribute value size.                                                                                                                                                                      | none                                                                                                      | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_ATTRIBUTE_COUNT_LIMIT`             | Maximum allowed span attribute count.                                                                                                                                                                      | 128                                                                                                       | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT` | Maximum allowed attribute value size. [Not applicable for metrics.](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.15.0/specification/metrics/sdk.md#attribute-limits).             | none                                                                                                      | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT`        | Maximum allowed span attribute count. [Not applicable for metrics.](https://github.com/open-telemetry/opentelemetry-specification/blob/v1.15.0/specification/metrics/sdk.md#attribute-limits).             | 128                                                                                                       | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_SPAN_EVENT_COUNT_LIMIT`            | Maximum allowed span event count.                                                                                                                                                                          | 128                                                                                                       | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_SPAN_LINK_COUNT_LIMIT`             | Maximum allowed span link count.                                                                                                                                                                           | 128                                                                                                       | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT`       | Maximum allowed attribute per span event count.                                                                                                                                                            | 128                                                                                                       | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_LINK_ATTRIBUTE_COUNT_LIMIT`        | Maximum allowed attribute per span link count.                                                                                                                                                             | 128                                                                                                       | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

**[1]**: Considerations on the `OTEL_EXPORTER_OTLP_PROTOCOL`:

- The OpenTelemetry .NET Automatic Instrumentation defaults to `http/protobuf`,
  which differs from the OpenTelemetry .NET SDK default value of `grpc`.
- On .NET 6 and higher, the application must reference
  [`Grpc.Net.Client`](https://www.nuget.org/packages/Grpc.Net.Client/) to use
  the `grpc` OTLP exporter protocol. For example, by adding
  `<PackageReference Include="Grpc.Net.Client" Version="2.43.0" />` to the
  `.csproj` file.
- On .NET Framework, the `grpc` OTLP exporter protocol is not supported.

### Prometheus

**Status**:
[Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md)

{{% alert title="Warning" color="warning" %}} **Do NOT use in production.**

Prometheus exporter is intended for the inner dev loop. Production environments
can use a combination of OTLP exporter with
[OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector-releases)
having
[`otlp` receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/v0.61.0/receiver/otlpreceiver)
and
[`prometheus` exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/v0.61.0/exporter/prometheusexporter).
{{% /alert %}}

To enable the Prometheus exporter, set the `OTEL_METRICS_EXPORTER` environment
variable to `prometheus`.

The exporter exposes the metrics HTTP endpoint on
`http://localhost:9464/metrics` and it caches the responses for 300
milliseconds.

See the
[Prometheus Exporter HttpListener documentation](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.5.0-rc.1/src/OpenTelemetry.Exporter.Prometheus.HttpListener).
to learn more.

### Zipkin

**Status**:
[Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md)

To enable the Zipkin exporter, set the `OTEL_TRACES_EXPORTER` environment
variable to `zipkin`.

To customize the Zipkin exporter using environment variables, see the
[Zipkin exporter documentation](https://github.com/open-telemetry/opentelemetry-dotnet/tree/core-1.5.1/src/OpenTelemetry.Exporter.Zipkin#configuration-using-environment-variables).
Important environment variables include:

| Environment variable            | Description | Default value                        | Status                                                                                                                      |
| ------------------------------- | ----------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_EXPORTER_ZIPKIN_ENDPOINT` | Zipkin URL  | `http://localhost:9411/api/v2/spans` | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

## Additional settings

| Environment variable                                | Description                                                                                                                                                                                                                                                                                                                                                                                        | Default value | Status                                                                                                                            |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_TRACES_ENABLED`                   | Enables traces.                                                                                                                                                                                                                                                                                                                                                                                    | `true`        | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_OPENTRACING_ENABLED`              | Enables OpenTracing tracer.                                                                                                                                                                                                                                                                                                                                                                        | `false`       | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_LOGS_ENABLED`                     | Enables logs.                                                                                                                                                                                                                                                                                                                                                                                      | `true`        | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_METRICS_ENABLED`                  | Enables metrics.                                                                                                                                                                                                                                                                                                                                                                                   | `true`        | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`           | Enables automatic redirection of the assemblies used by the automatic instrumentation on the .NET Framework.                                                                                                                                                                                                                                                                                       | `true`        | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES`        | Comma-separated list of additional `System.Diagnostics.ActivitySource` names to be added to the tracer at the startup. Use it to capture manually instrumented spans.                                                                                                                                                                                                                              |               | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_LEGACY_SOURCES` | Comma-separated list of additional legacy source names to be added to the tracer at the startup. Use it to capture `System.Diagnostics.Activity` objects created without using the `System.Diagnostics.ActivitySource` API.                                                                                                                                                                        |               | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_FLUSH_ON_UNHANDLEDEXCEPTION`      | Controls whether the telemetry data is flushed when an [AppDomain.UnhandledException](https://docs.microsoft.com/en-us/dotnet/api/system.appdomain.unhandledexception) event is raised. Set to `true` when you suspect that you are experiencing a problem with missing telemetry data and also experiencing unhandled exceptions.                                                                 | `false`       | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES`       | Comma-separated list of additional `System.Diagnostics.Metrics.Meter` names to be added to the meter at the startup. Use it to capture manually instrumented spans.                                                                                                                                                                                                                                |               | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_PLUGINS`                          | Colon-separated list of OTel SDK instrumentation plugin types, specified with the [assembly-qualified name](https://docs.microsoft.com/en-us/dotnet/api/system.type.assemblyqualifiedname?view=net-6.0#system-type-assemblyqualifiedname). _Note: This list must be colon-separated because the type names may include commas._ See more info on how to write plugins at [plugins.md](plugins.md). |               | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

## RuleEngine

RuleEngine is a feature that validates OpenTelemetry API, SDK, Instrumentation,
and Exporter assemblies for unsupported scenarios, ensuring that OpenTelemetry
automatic instrumentation is more stable by backing of instead of crashing. It
works on .NET 6 and higher.

Enable RuleEngine only during the first run of the application, or when the
deployment changes or the Automatic Instrumentation library is upgraded. Once
validated, there's no need to revalidate the rules when the application
restarts.

| Environment variable                   | Description         | Default value | Status                                                                                                                            |
| -------------------------------------- | ------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_RULE_ENGINE_ENABLED` | Enables RuleEngine. | `true`        | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

## .NET CLR Profiler

The CLR uses the following environment variables to set up the profiler. See
[.NET Runtime Profiler Loading](https://github.com/dotnet/runtime/blob/main/docs/design/coreclr/profiling/Profiler%20Loading.md)
for more information.

| .NET Framework environment variable | .NET environment variable  | Description                                                                             | Required value                                                                                                                                                                                                                                                  | Status                                                                                                                            |
| ----------------------------------- | -------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `COR_ENABLE_PROFILING`              | `CORECLR_ENABLE_PROFILING` | Enables the profiler.                                                                   | `1`                                                                                                                                                                                                                                                             | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `COR_PROFILER`                      | `CORECLR_PROFILER`         | CLSID of the profiler.                                                                  | `{918728DD-259F-4A6A-AC2B-B85E1B658318}`                                                                                                                                                                                                                        | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `COR_PROFILER_PATH`                 | `CORECLR_PROFILER_PATH`    | Path to the profiler.                                                                   | `$INSTALL_DIR/linux-x64/OpenTelemetry.AutoInstrumentation.Native.so` for Linux glibc, `$INSTALL_DIR/linux-musl-x64/OpenTelemetry.AutoInstrumentation.Native.so` for Linux musl, `$INSTALL_DIR/osx-x64/OpenTelemetry.AutoInstrumentation.Native.dylib` for macOS | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `COR_PROFILER_PATH_32`              | `CORECLR_PROFILER_PATH_32` | Path to the 32-bit profiler. Bitness-specific paths take precedence over generic paths. | `$INSTALL_DIR/win-x86/OpenTelemetry.AutoInstrumentation.Native.dll` for Windows                                                                                                                                                                                 | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `COR_PROFILER_PATH_64`              | `CORECLR_PROFILER_PATH_64` | Path to the 64-bit profiler. Bitness-specific paths take precedence over generic paths. | `$INSTALL_DIR/win-x64/OpenTelemetry.AutoInstrumentation.Native.dll` for Windows                                                                                                                                                                                 | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

Setting OpenTelemetry .NET Automatic Instrumentation as a .NET CLR Profiler is
required for .NET Framework.

On .NET, the .NET CLR Profiler is used only for bytecode instrumentation. If
having just source instrumentation is acceptable, you can unset or remove the
following environment variables:

```env
COR_ENABLE_PROFILING
COR_PROFILER
COR_PROFILER_PATH_32
COR_PROFILER_PATH_64
CORECLR_ENABLE_PROFILING
CORECLR_PROFILER
CORECLR_PROFILER_PATH
CORECLR_PROFILER_PATH_32
CORECLR_PROFILER_PATH_64
```

## .NET Runtime

On .NET it is required to set the
[`DOTNET_STARTUP_HOOKS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/host-startup-hook.md)
environment variable.

The
[`DOTNET_ADDITIONAL_DEPS`](https://github.com/dotnet/runtime/blob/main/docs/design/features/additional-deps.md)
and
[`DOTNET_SHARED_STORE`](https://docs.microsoft.com/en-us/dotnet/core/deploying/runtime-store)
environment variable are used to mitigate assembly version conflicts in .NET.

| Environment variable     | Required value                                                       | Status                                                                                                                            |
| ------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `DOTNET_STARTUP_HOOKS`   | `$INSTALL_DIR/net/OpenTelemetry.AutoInstrumentation.StartupHook.dll` | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `DOTNET_ADDITIONAL_DEPS` | `$INSTALL_DIR/AdditionalDeps`                                        | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `DOTNET_SHARED_STORE`    | `$INSTALL_DIR/store`                                                 | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |

## Internal logs

The default directory paths for internal logs are:

- Windows: `%ProgramData%\OpenTelemetry .NET AutoInstrumentation\logs`
- Linux: `/var/log/opentelemetry/dotnet`
- macOS: `/var/log/opentelemetry/dotnet`

If the default log directories can't be created, the instrumentation uses the
path of the current user's
[temporary folder](https://docs.microsoft.com/en-us/dotnet/api/System.IO.Path.GetTempPath?view=net-6.0)
instead.

| Environment variable                                | Description                                                             | Default value                            | Status                                                                                                                            |
| --------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_DOTNET_AUTO_LOG_DIRECTORY`                    | Directory of the .NET Tracer logs.                                      | _See the previous note on default paths_ | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_LOG_LEVEL`                                    | SDK log level. (supported values: `none`,`error`,`warn`,`info`,`debug`) | `info`                                   | [Stable](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md)       |
| `OTEL_DOTNET_AUTO_TRACES_CONSOLE_EXPORTER_ENABLED`  | Whether the traces console exporter is enabled or not.                  | `false`                                  | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_METRICS_CONSOLE_EXPORTER_ENABLED` | Whether the metrics console exporter is enabled or not.                 | `false`                                  | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_LOGS_CONSOLE_EXPORTER_ENABLED`    | Whether the logs console exporter is enabled or not.                    | `false`                                  | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
| `OTEL_DOTNET_AUTO_LOGS_INCLUDE_FORMATTED_MESSAGE`   | Whether the log state should be formatted.                              | `false`                                  | [Experimental](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/versioning-and-stability.md) |
