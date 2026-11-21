---
title: Troubleshooting
description: Learn how to troubleshoot OpenTelemetry .NET
weight: 100
cSpell:ignore: appsettings Blazor knownsafe LOCALAPPDATA unredacted
---

All components shipped from the OpenTelemetry .NET repositories
([opentelemetry-dotnet][] and [opentelemetry-dotnet-contrib][]) report their
internal state, such as dropped measurements, rejected configuration, and failed
exports, through
[EventSource](https://learn.microsoft.com/dotnet/api/system.diagnostics.tracing.eventsource).
The `EventSource` names all begin with `OpenTelemetry-`, for example
`OpenTelemetry-Sdk`, `OpenTelemetry-Api`, and
`OpenTelemetry-Exporter-OpenTelemetryProtocol`.

You can capture these events with general-purpose tools such as
[PerfView](https://github.com/microsoft/perfview) or [`dotnet-trace`][], but the
SDK also includes a self-diagnostics feature that subscribes to all of them and
writes readable entries to rolling log files, to the console, or to both.

This page covers self-diagnostics as configured through
`SelfDiagnosticsOptions`, available from version 1.20.0 of the `OpenTelemetry`
package. Automatic binding from `appsettings.json` requires version 1.21.0 or
later. For the complete reference, see the [self-diagnostics
documentation][reference] in the opentelemetry-dotnet repository.

> [!IMPORTANT]
>
> Self-diagnostics diagnoses the SDK itself. It is not a telemetry pipeline:
> entries are never exported or turned into OpenTelemetry log records. Use
> `ILogger` with an exporter for application logs.

Self-diagnostics is off by default. Nothing is written until you enable at least
one output, called a _sink_. It isn't supported in browser-based apps, such as
Blazor WebAssembly.

If you use [.NET automatic instrumentation](/docs/zero-code/dotnet/), see its
[troubleshooting page](/docs/zero-code/dotnet/troubleshooting/) first. The agent
already includes SDK events in its own logs.

## Enable with environment variables

Environment variables need no code changes. Set them before the process starts.

Write rolling log files to a directory of your choice. Setting the directory is
enough to turn on file output, and the directory is created if it doesn't exist:

```sh
export OTEL_DOTNET_SELF_DIAGNOSTICS_LOG_DIRECTORY=./otel-logs
```

```powershell
$env:OTEL_DOTNET_SELF_DIAGNOSTICS_LOG_DIRECTORY = "C:\otel-logs"
```

Write rolling log files to the [default log directory](#default-log-directory)
for your platform:

```sh
export OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS=file
```

Write to the console, including `Debug` entries:

```sh
export OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS=stdout,stderr
export OTEL_LOG_LEVEL=debug
```

Turn off output that the other environment variables enabled:

```sh
export OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS=none
```

> [!TIP]
>
> The default level, `Warning`, is intended to be safe to leave on in
> production. Lower it to `Debug` only while you investigate a problem.

`OTEL_LOG_LEVEL` sets the level only. On its own, it produces no output.

## Enable with appsettings.json

The SDK automatically reads the `OpenTelemetry:SelfDiagnostics` section from
your application's configuration. In an app that loads `appsettings.json`, add
any of the following settings:

```json
{
  "OpenTelemetry": {
    "SelfDiagnostics": {
      "MinimumLevel": "Debug",
      "LogDirectory": "/var/log/otel",
      "FileSizeLimitKilobytes": 4096,
      "MaxRetainedFiles": 5
    }
  }
}
```

If your configuration supports reloading, as `appsettings.json` does under the
default .NET host, changes apply to the running process without a restart. This
lets you switch to `Debug` during an incident and switch back afterward. Changes
to environment variables always require a restart.

When a setting is defined in more than one place, the usual .NET configuration
order applies: in the default host, environment variables override
`appsettings.json`, and command-line arguments override both. Settings made in
code override all of these.

> [!WARNING]
>
> An invalid value, such as `"MinimumLevel": "NotALevel"`, causes an error when
> the configuration loads or reloads. The SDK doesn't guarantee that it keeps
> the last valid settings, so check values before you save changes to a running
> application's configuration.

## Enable with code

Configure `SelfDiagnosticsOptions` through the standard .NET options pattern.
Settings made in code take precedence over environment variables and
configuration files.

```csharp
using Microsoft.Extensions.Logging;
using OpenTelemetry.SelfDiagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<SelfDiagnosticsOptions>(options =>
{
    options.MinimumLevel = LogLevel.Debug;
    options.LogDirectory = SelfDiagnosticsOptions.GetDefaultLogDirectory()
        ?? "/var/log/otel";
});

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddOtlpExporter());
```

When you build providers with `Sdk.CreateTracerProviderBuilder()` or the other
`Sdk.Create*ProviderBuilder()` methods, make the same `Configure` call inside
`ConfigureServices`. Self-diagnostics settings apply to the whole process, so
configure them once.

## Settings

| Option                   | Environment variable                         | Default           | Description                                                                                              |
| ------------------------ | -------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `MinimumLevel`           | `OTEL_LOG_LEVEL`                             | `Warning`         | Lowest level captured. See [Log levels](#log-levels).                                                    |
| `LogDirectory`           | `OTEL_DOTNET_SELF_DIAGNOSTICS_LOG_DIRECTORY` | Not set           | Directory for log files. Setting it turns on file output.                                                |
| `LogToStdout`            | `OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS`         | `false`           | Writes entries to standard output.                                                                       |
| `LogToStderr`            | `OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS`         | `false`           | Writes entries to standard error. With both console options on, `Error` and above go here.               |
| `FileSizeLimitKilobytes` | None                                         | `10240` (10 MiB)  | Size at which a new log file is started. `0` or less means a single file with no size limit.             |
| `MaxRetainedFiles`       | None                                         | `10`              | Number of log files kept before the oldest is deleted. `0` or less keeps every file.                     |
| `EnvironmentVariables`   | `OTEL_DOTNET_SELF_DIAGNOSTICS_ENV_VARS`      | `KnownSafeValues` | How much of the `OTEL_*` environment is written to each log file. See [Sensitive data](#sensitive-data). |

`OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS` takes a comma-separated list of `file`,
`stdout`, `stderr`, and `console` (short for `stdout,stderr`), or `none`. If the
list doesn't include `file`, no files are written, even when a log directory is
set. This lets a single service opt out when a deployment sets a log directory
for every service.

### Default log directory

With `OTEL_DOTNET_SELF_DIAGNOSTICS_SINKS=file` and no log directory set, the SDK
writes to a per-user directory that doesn't need elevated permissions:

| Platform           | Default path                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Windows            | `%LOCALAPPDATA%\OpenTelemetry\dotnet-diagnostics`                                                                 |
| macOS              | `~/Library/Logs/OpenTelemetry/dotnet-diagnostics`                                                                 |
| Linux / other Unix | `$XDG_STATE_HOME/opentelemetry/dotnet-diagnostics`, or `~/.local/state/opentelemetry/dotnet-diagnostics` if unset |

In code, `SelfDiagnosticsOptions.GetDefaultLogDirectory()` returns the same
path. If no per-user directory is available, file output stays off and the SDK
writes a warning to standard error. Set an explicit directory in that case.

### Log levels

`OTEL_LOG_LEVEL` accepts `error`, `warn`, `info`, `debug`, `trace`, and `none`,
as well as .NET
[`LogLevel`](https://learn.microsoft.com/dotnet/api/microsoft.extensions.logging.loglevel)
names. Values are case-insensitive. The OpenTelemetry values map to `LogLevel`
names, for example `warn` to `Warning` and `info` to `Information`.

The default is `Warning`, which differs from the OpenTelemetry specification
default of `Information`. Lower levels produce much more output without usually
adding value until you are investigating a problem. When you are, use `Debug`:
it also logs each loaded assembly with its version, the quickest way to confirm
which build is running.

## Reading the output

### File preamble

Each log file starts with a preamble that describes the process, so a single
file is useful on its own. The following example is shortened:

```text
=== OpenTelemetry .NET SDK self-diagnostics ===
SDK version          : 1.21.0
Runtime              : .NET 10.0.0
OS                   : Ubuntu 24.04.1 LTS
Process name         : MyCompany.MyService
Log directory        : /home/app/.local/state/opentelemetry/dotnet-diagnostics
...
Environment Variables (mode: KnownSafeValues):
OTEL_EXPORTER_OTLP_ENDPOINT_TRACES = [REDACTED]
OTEL_SERVICE_NAME = my-service
OTEL_TRACES_SAMPLER = parentbased_traceidratio
=== end preamble ===
```

The preamble lists every `OTEL_*` environment variable that is set, whether the
SDK recognizes it or not. This makes misspelled names easy to spot. In the
example, `OTEL_EXPORTER_OTLP_ENDPOINT_TRACES` should be
`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`.

If an environment variable has a value that can't be parsed, a
`Configuration Warnings:` block names the variable, the rejected value, and the
accepted values.

Console output contains log entries only, without a preamble.

### Log entries

Each entry has the following format:

```text
[<timestamp>][<threadId>][<spanId>][<level>]  <message> {EventId} <traceparent>
```

For example:

```text
[2026-08-06T09:14:31.4471190Z][000014][00f067][Error]       OpenTelemetry-Exporter-OpenTelemetryProtocol: Exporter failed send data to collector to https://otlp.example.com:4317 endpoint. Data will not be sent. Exception: System.Net.Http.HttpRequestException: No connection could be made because the target machine actively refused it. {EventId: 2, EventName: FailedToReachCollector} <00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01>
```

The message starts with the name of the `EventSource` that wrote it, which tells
you which component to look at. When a span was active, the entry ends with its
[W3C `traceparent`](https://www.w3.org/TR/trace-context/#traceparent-header), so
you can match the entry to a trace.

Log files are named
`otel-dotnet-{pid}-{processName}-{processStartTime}-{index}.log`. When a file
reaches `FileSizeLimitKilobytes`, the SDK closes it and starts the next one.
When the number of files exceeds `MaxRetainedFiles`, the SDK deletes the oldest.
This limit applies to each run of a process separately. Files from other
processes, or from earlier runs of the same application, are never deleted, so
remove them yourself when you no longer need them.

## Sensitive data

The file preamble includes the process's `OTEL_*` environment variables, and
nothing outside that namespace. The `EnvironmentVariables` option, or
`OTEL_DOTNET_SELF_DIAGNOSTICS_ENV_VARS`, controls how much is shown:

| Mode              | Variable value | Shows                                                                                  |
| ----------------- | -------------- | -------------------------------------------------------------------------------------- |
| `None`            | `none`         | Nothing.                                                                               |
| `Names`           | `names`        | Variable names only.                                                                   |
| `KnownSafeValues` | `knownsafe`    | Names, plus values the SDK knows are safe. Other values are `[REDACTED]`. The default. |
| `AllValues`       | `all`          | All values, unredacted.                                                                |

Under `KnownSafeValues`, endpoints are reduced to their scheme, host, and port,
and `OTEL_RESOURCE_ATTRIBUTES` keeps values only for well-known keys such as
`service.name`.

Treat a file written with `AllValues` as a secret: it can contain API keys and
authentication headers. Enable it for a single reproduction run, not
permanently.

On Linux and macOS with .NET 8 or later, the SDK creates the log directory and
files so that only the owning user can read them. Other accounts, such as a log
shipper, must be granted access explicitly.

## Collect logs for a bug report

A self-diagnostics log at the `Debug` level is one of the most useful things to
include in a bug report. Run your reproduction with the following settings:

```sh
export OTEL_LOG_LEVEL=debug
export OTEL_DOTNET_SELF_DIAGNOSTICS_LOG_DIRECTORY=./otel-logs
```

Then [open an issue][new-issue] and include:

- The log files.
- A minimal reproduction, if you have one.
- What you expected to happen and what happened instead.
- The approximate time of the failure, to help find the related entries.

> [!IMPORTANT]
>
> Review the logs before you share them. Environment variable values are
> redacted by default, but log messages can still contain paths, endpoints,
> resource attributes, and exception details from your environment.

## Migrate from OTEL_DIAGNOSTICS.json

Earlier versions of the SDK enabled self-diagnostics through an
`OTEL_DIAGNOSTICS.json` file in the process's working directory. That file still
works but is deprecated and will be removed in a future major version.

Starting with version 1.21.0, the file uses the same mechanism described on this
page. As a result:

- Output goes to rolling `otel-dotnet-*.log` files instead of a single circular
  `{executable}.{pid}.log` file.
- `FormatMessage` is ignored. Messages are always formatted.
- If self-diagnostics output is configured any other way, through environment
  variables, `appsettings.json`, or code, the file is ignored.

To migrate, delete the file and move its settings to the
[`OpenTelemetry:SelfDiagnostics`](#enable-with-appsettingsjson) section or to
[environment variables](#enable-with-environment-variables):

| `OTEL_DIAGNOSTICS.json` | Replacement                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `LogDirectory`          | `LogDirectory`                                                                             |
| `LogLevel`              | `MinimumLevel`. `Informational` becomes `Information` and `Verbose` becomes `Debug`.       |
| `FileSize`              | `FileSizeLimitKilobytes` and `MaxRetainedFiles`. The old size was the total for all files. |

[`dotnet-trace`]:
  https://learn.microsoft.com/dotnet/core/diagnostics/dotnet-trace
[new-issue]:
  https://github.com/open-telemetry/opentelemetry-dotnet/issues/new/choose
[opentelemetry-dotnet]: https://github.com/open-telemetry/opentelemetry-dotnet
[opentelemetry-dotnet-contrib]:
  https://github.com/open-telemetry/opentelemetry-dotnet-contrib
[reference]:
  https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/docs/troubleshooting/README.md
