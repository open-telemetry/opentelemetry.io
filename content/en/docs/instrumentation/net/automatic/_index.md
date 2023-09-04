---
title: Automatic Instrumentation
linkTitle: Automatic
weight: 20
---

This project adds [OpenTelemetry instrumentation](https://opentelemetry.io/docs/concepts/instrumenting/#automatic-instrumentation)
to .NET applications without having to modify their source code.

To see the telemetry from your application directly on the standard output, set
the following environment variables to `true` before launching your application:

- `OTEL_DOTNET_AUTO_LOGS_CONSOLE_EXPORTER_ENABLED`
- `OTEL_DOTNET_AUTO_METRICS_CONSOLE_EXPORTER_ENABLED`
- `OTEL_DOTNET_AUTO_TRACES_CONSOLE_EXPORTER_ENABLED`

For a demo using `docker compose`, clone this repository and
follow the [examples/demo/README.md](../examples/demo/README.md).

To learn how to manually instrument your
service or app code, see [Manual instrumentation](../manual).

## Compatibility

OpenTelemetry .NET Automatic Instrumentation should work with all officially
supported operating systems and versions of
[.NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

The minimal supported version of
[.NET Framework](https://dotnet.microsoft.com/download/dotnet-framework)
is `4.6.2`.

CI tests run against the following operating systems:

- [Alpine](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [CentOS 7](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/centos-build.dockerfile)
- [macOS Big Sur 11](https://github.com/actions/runner-images/blob/main/images/macos/macos-11-Readme.md)
- [Microsoft Windows Server 2022](https://github.com/actions/runner-images/blob/main/images/win/Windows2022-Readme.md)
- [Ubuntu 20.04 LTS](https://github.com/actions/runner-images/blob/main/images/linux/Ubuntu2004-Readme.md)

> **Note** ARM architectures are not supported. See [#2181](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2181)
> for more information.

## Setup

To instrument a .NET application automatically, download and run the installer script for your operating system.

- On Linux and macOS, download and run the `.sh` script:

  ```sh
    # Download the bash script
    curl -sSfL https://raw.githubusercontent.com/open-telemetry/opentelemetry-dotnet-instrumentation/v1.0.0-rc.2/otel-dotnet-auto-install.sh -O

    # Install core files
    sh ./otel-dotnet-auto-install.sh

    # Enable execution for the instrumentation script
    chmod +x $HOME/.otel-dotnet-auto/instrument.sh

    # Setup the instrumentation for the current shell session
    . $HOME/.otel-dotnet-auto/instrument.sh

    # Run your application with instrumentation
    OTEL_SERVICE_NAME=myapp OTEL_RESOURCE_ATTRIBUTES=deployment.environment=staging,service.version=1.0.0 ./MyNetApp
  ```

  > **Note** On macOS [`coreutils`](https://formulae.brew.sh/formula/coreutils) is required.

- On Windows, use the PowerShell module as an Administrator:

  ```powershell
    # PowerShell 5.1 or higher is required
    # Download the module
    $module_url = "https://raw.githubusercontent.com/open-telemetry/opentelemetry-dotnet-instrumentation/v1.0.0-rc.2/OpenTelemetry.DotNet.Auto.psm1"
    $download_path = Join-Path $env:temp "OpenTelemetry.DotNet.Auto.psm1"
    Invoke-WebRequest -Uri $module_url -OutFile $download_path -UseBasicParsing

    # Import the module to use its functions
    Import-Module $download_path

    # Install core files (online vs offline method)
    Install-OpenTelemetryCore
    Install-OpenTelemetryCore -LocalPath "C:\Path\To\OpenTelemetry.zip" 

    # Set up the instrumentation for the current PowerShell session
    Register-OpenTelemetryForCurrentSession -OTelServiceName "MyServiceDisplayName"

    # Run your application with instrumentation
    .\MyNetApp.exe

    # You can get usage information by calling the following commands

    # List all available commands
    Get-Command -Module OpenTelemetry.DotNet.Auto

    # Get command's usage information
    Get-Help Install-OpenTelemetryCore -Detailed
  ```

### NuGet package

You can instrument [`self-contained`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained)
applications using the NuGet packages. See [NuGet packages](nuget-packages.md) 
for more information.

## Configuring the agent

To see the full range of configuration options, see [Configuration and settings](config.md).

## Log to trace correlation

> **Note**
> Automatic log to trace correlation provided by OpenTelemetry .NET Automatic Instrumentation
> currently works only for .NET applications using `Microsoft.Extensions.Logging`.
> See [#2310](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2310)
> and [config](./config.md#logs-instrumentations) for more details.

OpenTelemetry .NET SDK automatically correlates logs to trace data.
When logs are emitted in the context of an active trace, trace context
[fields](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md#trace-context-fields)
`TraceId`, `SpanId`, `TraceState` are automatically populated.

The following are logs produced by the sample console
[application](../examples/demo/Service/Program.cs):

```json
"logRecords": [
    {
        "timeUnixNano": "1679392614538226700",
        "severityNumber": 9,
        "severityText": "Information",
        "body": {
            "stringValue": "Success! Today is: {Date:MMMM dd, yyyy}"
        },
        "flags": 1,
        "traceId": "21df288eada1ce4ace6c40f39a6d7ce1",
        "spanId": "a80119e5a05fed5a"
    }
]
```

For more information, see:

- [OpenTelemetry .NET SDK](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/docs/logs/correlation)
- [OpenTelemetry Specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md#trace-context-fields)


## Supported libraries, frameworks, application services, and JVMs

The OpenTelemetry .NET Automatic Instrumentation supports a wide variety of 
libraries. For a complete list, see [Instrumentations](instrumentations.md).

## Troubleshooting

For general troubleshooting steps and solutions to specific issues, see
[Troubleshooting](troubleshooting.md).

## Next steps

After you have automatic instrumentation configured for your app or service, you
might want to [annotate](annotations.md) selected methods or add
[manual instrumentation](../manual) to collect custom telemetry data.