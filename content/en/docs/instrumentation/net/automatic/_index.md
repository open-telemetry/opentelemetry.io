---
title: Automatic Instrumentation
description: Send traces and metrics from .NET applications and services.
linkTitle: Automatic
cSpell:ignore: coreutils HKLM iisreset myapp
weight: 20
---

Use the OpenTelemetry .NET Automatic Instrumentation to send traces and metrics
from .NET applications and services to observability back ends without having to
modify their source code.

To learn how to manually instrument your service or app code, see
[Manual instrumentation](../manual).

## Compatibility

OpenTelemetry .NET Automatic Instrumentation should work with all officially
supported operating systems and versions of
[.NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

The minimal supported version of
[.NET Framework](https://dotnet.microsoft.com/download/dotnet-framework) is
`4.6.2`.

CI tests run against the following operating systems:

- [Alpine](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [CentOS 7](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/centos-build.dockerfile)
- [macOS Big Sur 11](https://github.com/actions/runner-images/blob/main/images/macos/macos-11-Readme.md)
- [Microsoft Windows Server 2022](https://github.com/actions/runner-images/blob/main/images/win/Windows2022-Readme.md)
- [Ubuntu 20.04 LTS](https://github.com/actions/runner-images/blob/main/images/linux/Ubuntu2004-Readme.md)

{{% alert title="Note" color="note" %}} ARM architectures are not supported. See
[#2181](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2181)
for more information. {{% /alert %}}

## Setup

To instrument a .NET application automatically, download and run the installer
script for your operating system.

- On Linux and macOS, download and run the `.sh` script:

  ```shell
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

  {{% alert title="Note" color="note" %}} On macOS
  [`coreutils`](https://formulae.brew.sh/formula/coreutils) is required.
  {{% /alert %}}

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

### Instrument a Windows Service running a .NET application

Use the `OpenTelemetry.DotNet.Auto.psm1` PowerShell module to set up automatic
instrumentation for a Windows Service:

```powershell
# Import the module
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Install core files
Install-OpenTelemetryCore

# Set up your Windows Service instrumentation
Register-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName" -OTelServiceName "MyServiceDisplayName"
```

{{% alert title="Note" color="note" %}}
`Register-OpenTelemetryForWindowsService` performs a service restart.
{{% /alert %}}

#### Configuration for Windows Service

{{% alert title="Note" color="note" %}} Remember to restart the Windows Service
after making configuration changes. You can do it by running
`Restart-Service -Name $WindowsServiceName -Force` in PowerShell. {{% /alert %}}

For .NET Framework applications you can configure the most common `OTEL_`
settings (like `OTEL_RESOURCE_ATTRIBUTES`) via `appSettings` in `App.config`.

The alternative is to set environment variables for the Windows Service in the
Windows Registry.

The registry key of a given Windows Service (named `$svcName`) is located under:

```powershell
HKLM\SYSTEM\CurrentControlSet\Services\$svcName
```

The environment variables are defined in a `REG_MULTI_SZ` (multiline registry
value) called `Environment` in the following format:

```env
Var1=Value1
Var2=Value2
```

### Instrument an ASP.NET application deployed on IIS

Use the `OpenTelemetry.DotNet.Auto.psm1` PowerShell module to set up automatic
instrumentation for IIS:

```powershell
# Import the module
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# Install core files
Install-OpenTelemetryCore

# Setup IIS instrumentation
Register-OpenTelemetryForIIS
```

{{% alert title="Note" color="note" %}} `Register-OpenTelemetryForIIS` performs
an IIS restart. {{% /alert %}}

#### Configuration for ASP.NET applications

{{% alert title="Note" color="note" %}} Remember to restart IIS after making
configuration changes. You can do it by executing `iisreset.exe`. {{% /alert %}}

For ASP.NET application you can configure the most common `OTEL_` settings (like
`OTEL_SERVICE_NAME`) via `appSettings` in `Web.config`.

If a service name is not explicitly configured, one will be generated for you.
If the application is hosted on IIS in .NET Framework this will use
`SiteName\VirtualDirectoryPath` ex: `MySite\MyApp`

For ASP.NET Core application you can use the
[`<environmentVariable>`](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/web-config#set-environment-variables)
elements inside the `<aspNetCore>` block of your `Web.config` file to set
configuration via environment variables.

#### Advanced configuration

You can add the
[`<environmentVariables>`](https://docs.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/environmentvariables/)
in `applicationHost.config` to set environment variables for given application
pools.

Consider setting common environment variables, for all applications deployed to
IIS by setting the environment variables for `W3SVC` and `WAS` Windows Services.

{{% alert title="Note" color="note" %}} For IIS versions older than 10.0, you
can consider creating a distinct user, set its environment variables and use it
as the application pool user. {{% /alert %}}

### NuGet package

You can instrument
[`self-contained`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained)
applications using the NuGet packages. See [NuGet packages](./nuget-packages)
for more information.

### Instrument a container

For an example of Docker container instrumentation, see
[the example](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/main/examples/demo)
on GitHub.

You can also use the
[Kubernetes Operator for OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-operator).

## Configuring the agent

To see the full range of configuration options, see
[Configuration and settings](./config).

## Log to trace correlation

{{% alert title="Note" color="note" %}} Automatic log to trace correlation
provided by OpenTelemetry .NET Automatic Instrumentation currently works only
for .NET applications using `Microsoft.Extensions.Logging`. See
[#2310](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2310)
for more details. {{% /alert %}}

OpenTelemetry .NET SDK automatically correlates logs to trace data. When logs
are emitted in the context of an active trace, trace context
[fields](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md#trace-context-fields)
`TraceId`, `SpanId`, `TraceState` are automatically populated.

The following are logs produced by the sample console application:

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

## Supported libraries and frameworks

The OpenTelemetry .NET Automatic Instrumentation supports a wide variety of
libraries. For a complete list, see [Instrumentations](./instrumentations).

## Troubleshooting

To see the telemetry from your application directly on the standard output, set
the following environment variables to `true` before launching your application:

- `OTEL_DOTNET_AUTO_LOGS_CONSOLE_EXPORTER_ENABLED`
- `OTEL_DOTNET_AUTO_METRICS_CONSOLE_EXPORTER_ENABLED`
- `OTEL_DOTNET_AUTO_TRACES_CONSOLE_EXPORTER_ENABLED`

For general troubleshooting steps and solutions to specific issues, see
[Troubleshooting](./troubleshooting).

## Next steps

After you have automatic instrumentation configured for your app or service, you
might want to [send custom traces and metrics](./custom) or add
[manual instrumentation](../manual) to collect custom telemetry data.
