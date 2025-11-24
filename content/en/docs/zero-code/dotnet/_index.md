---
title: .NET zero-code instrumentation
description: Send traces and metrics from .NET applications and services.
linkTitle: .NET
aliases: [net]
redirects: [{ from: /docs/languages/net/automatic/*, to: ':splat' }]
weight: 30
cSpell:ignore: coreutils HKLM iisreset myapp
---

Use the OpenTelemetry .NET Automatic Instrumentation to send traces and metrics
from .NET applications and services to observability backends without having to
modify their source code.

To learn how to instrument your service or application code, read
[Manual instrumentation](/docs/languages/dotnet/instrumentation).

## Compatibility

OpenTelemetry .NET Automatic Instrumentation should work with all officially
supported operating systems and versions of
[.NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

The minimal supported version of
[.NET Framework](https://dotnet.microsoft.com/download/dotnet-framework) is
`4.6.2`.

Supported processor architectures are:

- x86
- AMD64 (x86-64)
- ARM64 ([Experimental](/docs/specs/otel/versioning-and-stability))

{{% alert title="Note" %}} ARM64 build does not support CentOS based images.
{{% /alert %}}

CI tests run against the following operating systems:

- [Alpine x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [Alpine ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/alpine.dockerfile)
- [Debian x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian.dockerfile)
- [Debian ARM64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/debian-arm64.dockerfile)
- [CentOS Stream 9 x64](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/docker/centos-stream9.dockerfile)
- [macOS Ventura 13 x64](https://github.com/actions/runner-images/blob/main/images/macos/macos-13-Readme.md)
- [Microsoft Windows Server 2022 x64](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md)
- [Microsoft Windows Server 2025 x64](https://github.com/actions/runner-images/blob/main/images/windows/Windows2025-Readme.md)
- [Ubuntu 22.04 LTS x64](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2204-Readme.md)
- [Ubuntu 22.04 LTS ARM64](https://github.com/actions/partner-runner-images/blob/main/images/arm-ubuntu-22-image.md)

## Setup

To instrument a .NET application automatically, download and run the installer
script for your operating system.

### Linux and macOS

Download and run the `.sh` script:

```shell
# Download the bash script
curl -sSfL https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/otel-dotnet-auto-install.sh -O

# Install core files
sh ./otel-dotnet-auto-install.sh

# Enable execution for the instrumentation script
chmod +x $HOME/.otel-dotnet-auto/instrument.sh

# Setup the instrumentation for the current shell session
. $HOME/.otel-dotnet-auto/instrument.sh

# Run your application with instrumentation
OTEL_SERVICE_NAME=myapp OTEL_RESOURCE_ATTRIBUTES=deployment.environment=staging,service.version=1.0.0 ./MyNetApp
```

{{% alert title="Note" color="warning" %}} On macOS
[`coreutils`](https://formulae.brew.sh/formula/coreutils) is required. If you
have [homebrew](https://brew.sh/) installed, you can simply get it by running

```shell
brew install coreutils
```

{{% /alert %}}

### Windows (PowerShell)

On Windows, use the PowerShell module as an Administrator.

{{% alert title="Version note" color="warning" %}}

Windows
[PowerShell Desktop](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions)
(v5.1) is required. Other
[versions](https://learn.microsoft.com/previous-versions/powershell/scripting/overview),
including PowerShell Core (v6.0+) are not supported at this time.

{{% /alert %}}

```powershell
# PowerShell 5.1 is required
#Requires -PSEdition Desktop

# Download the module
$module_url = "https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/latest/download/OpenTelemetry.DotNet.Auto.psm1"
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

## Instrument a Windows Service running a .NET application

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

{{% alert title="Note" color="warning" %}}
`Register-OpenTelemetryForWindowsService` performs a service restart.
{{% /alert %}}

### Configuration for Windows Service

{{% alert title="Note" color="warning" %}} Remember to restart the Windows
Service after making configuration changes. You can do it by running
`Restart-Service -Name $WindowsServiceName -Force` in PowerShell. {{% /alert %}}

For .NET Framework applications you can configure
[the most common `OTEL_` settings](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
(like `OTEL_RESOURCE_ATTRIBUTES`) via `appSettings` in `App.config`.

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

## Instrument an ASP.NET application deployed on IIS

{{% alert title="Note" color="warning" %}} The following instructions apply to
.NET Framework applications. {{% /alert %}}

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

{{% alert title="Note" color="warning" %}} `Register-OpenTelemetryForIIS`
performs an IIS restart. {{% /alert %}}

### Configuration for ASP.NET applications

{{% alert title="Note" color="warning" %}} The following instructions apply to
.NET Framework applications. {{% /alert %}}

For ASP.NET applications you can configure
[the most common `OTEL_` settings](/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
(like `OTEL_SERVICE_NAME`) via `appSettings` in `Web.config`.

If a service name is not explicitly configured, one will be generated for you.
If the application is hosted on IIS in .NET Framework this will use
`SiteName\VirtualDirectoryPath` ex: `MySite\MyApp`

For ASP.NET Core application you can use the
[`<environmentVariable>`](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/web-config#set-environment-variables)
elements inside the `<aspNetCore>` block of your `Web.config` file to set
configuration via environment variables.

{{% alert title="Note" color="warning" %}} Remember to restart IIS after making
configuration changes. You can do it by executing `iisreset.exe`. {{% /alert %}}

### Advanced configuration

You can add the
[`<environmentVariables>`](https://docs.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/environmentvariables/)
in `applicationHost.config` to set environment variables for given application
pools.

Consider setting common environment variables, for all applications deployed to
IIS by setting the environment variables for `W3SVC` and `WAS` Windows Services.

{{% alert title="Note" color="warning" %}} For IIS versions older than 10.0, you
can consider creating a distinct user, set its environment variables and use it
as the application pool user. {{% /alert %}}

## NuGet package

You can instrument
[`self-contained`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained)
applications using the NuGet packages. See [NuGet packages](./nuget-packages)
for more information.

## Instrument a container

For an example of Docker container instrumentation, see
[the example](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/tree/main/examples/demo)
on GitHub.

You can also use the
[OpenTelemetry Operator for Kubernetes](/docs/platforms/kubernetes/operator/).

## Configuring the agent

To see the full range of configuration options, see
[Configuration and settings](./configuration).

## Log to trace correlation

{{% alert title="Note" color="warning" %}} Automatic log to trace correlation
provided by OpenTelemetry .NET Automatic Instrumentation currently works only
for .NET applications using `Microsoft.Extensions.Logging`. See
[#2310](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2310)
for more details. {{% /alert %}}

OpenTelemetry .NET SDK automatically correlates logs to trace data. When logs
are emitted in the context of an active trace, trace context
[fields](/docs/specs/otel/logs/data-model#trace-context-fields) `TraceId`,
`SpanId`, `TraceState` are automatically populated.

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
- [OpenTelemetry Specification](/docs/specs/otel/logs/data-model#trace-context-fields)

## Supported libraries and frameworks

The OpenTelemetry .NET Automatic Instrumentation supports a wide variety of
libraries. For a complete list, see [Instrumentations](./instrumentations).

## Troubleshooting

To see the telemetry from your application directly on the standard output, add
`console` to the following environment variables value before launching your
application:

- `OTEL_TRACES_EXPORTER`
- `OTEL_METRICS_EXPORTER`
- `OTEL_LOGS_EXPORTER`

For general troubleshooting steps and solutions to specific issues, see
[Troubleshooting](./troubleshooting).

## Next steps

After you have automatic instrumentation configured for your app or service, you
might want to [send custom traces and metrics](./custom) or add
[manual instrumentation](/docs/languages/dotnet/instrumentation) to collect
custom telemetry data.

## Uninstall

### Linux and macOS {#uninstall-unix}

On Linux and macOS, the installation steps only affect the current shell session
so no explicit uninstallation is required.

### Windows (PowerShell) {#uninstall-windows}

On Windows, use the PowerShell module as an Administrator.

{{% alert title="Version note" color="warning" %}}

Windows
[PowerShell Desktop](https://learn.microsoft.com/powershell/module/microsoft.powershell.core/about/about_windows_powershell_5.1#powershell-editions)
(v5.1) is required. Other
[versions](https://learn.microsoft.com/previous-versions/powershell/scripting/overview),
including PowerShell Core (v6.0+) are not supported at this time.

{{% /alert %}}

```powershell
# PowerShell 5.1 is required
#Requires -PSEdition Desktop

# Import the previously installed module
Import-Module "OpenTelemetry.DotNet.Auto.psm1"

# If IIS was previously registered, unregister it
Unregister-OpenTelemetryForIIS

# If Windows services were previously registered, unregister them
Unregister-OpenTelemetryForWindowsService -WindowsServiceName "WindowsServiceName"

# Finally, uninstall OpenTelemetry instrumentation
Uninstall-OpenTelemetryCore
```
