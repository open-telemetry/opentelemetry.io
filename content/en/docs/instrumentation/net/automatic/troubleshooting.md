---
title: Troubleshooting .NET automatic instrumentation issues
linkTitle: Troubleshooting
weight: 20
---

## General steps

If you encounter any issue with OpenTelemetry .NET Automatic Instrumentation,
there are steps that can help you understand the problem.

### Enable detailed logging

Detailed debug logs can help you troubleshoot instrumentation issues, and can be
attached to issues in this project to facilitate investigation.

To get the detailed logs from the OpenTelemetry .NET Automatic Instrumentation, set
the [`OTEL_LOG_LEVEL`](./config.md#internal-logs) environment variable to `debug`
before the instrumented process starts.

By default, the library writes the log files under predefined [locations](./config.md#internal-logs).
If needed, change the default location by updating the `OTEL_DOTNET_AUTO_LOG_DIRECTORY`
environment variable.

After obtaining the logs, remove the `OTEL_LOG_LEVEL`
environment variable, or set it to less verbose level
to avoid unnecessary overhead.

### Enable host tracing

[Host tracing](https://github.com/dotnet/runtime/blob/edd23fcb1b350cb1a53fa409200da55e9c33e99e/docs/design/features/host-tracing.md#host-tracing)
can be used to gather the information needed to investigate the problems
related to various issues, like assemblies not being found. Set the following environment
variables:

```terminal
COREHOST_TRACE=1
COREHOST_TRACEFILE=corehost_verbose_tracing.log
```

Then restart the application to collect the logs.

## Common issues

### No telemetry is produced

#### Symptoms

There is no telemetry generated.
There are no logs in OpenTelemetry .NET Automatic Instrumentation internal logs [location](./config.md#internal-logs).

It might occur that the .NET Profiler is unable to attach
and therefore no logs would be emitted.

#### Solution

The most common reason is that the instrumented application
has no permissions to load the OpenTelemetry .NET Automatic Instrumentation
assemblies.

### Could not install package 'OpenTelemetry.AutoInstrumentation.Runtime.Native'

#### Symptoms

When adding the NuGet packages to your project you get an error message similar
to:

```txt
Could not install package 'OpenTelemetry.AutoInstrumentation.Runtime.Native 1.0.0-rc.1'. You are trying to install this package into a project that targets '.NETFramework,Version=v4.7.2', but the package does not contain any assembly references or content files that are compatible with that framework. For more information, contact the package author.
```

#### Solution

The NuGet packages don't support old-style `csproj` projects. Either deploy the
automatic instrumentation to the [machine instead of using NuGet packages](./README.md###powershell-module),
or migrate your project to the SDK style `csproj`.

### Performance issues

#### Symptoms

High CPU usage.

#### Solution

Make sure that you have not enabled the automatic instrumentation globally
by setting the environment variables at system or user scope.

If the usage of system or user scope is intentional, use the [`OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`](./config.md#global-settings)
environment variables to exclude applications from the automatic instrumentation.

### `dotnet` CLI tool is crashing

#### Symptoms

You get error messages similar to the one below when running an app,
for example with `dotnet run`:

```txt
PS C:\Users\Administrator\Desktop\OTelConsole-NET6.0> dotnet run My.Simple.Console
Unhandled exception. System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.TypeInitializationException: The type initializer for 'OpenTelemetry.AutoInstrumentation.Loader.Startup' threw an exception.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.Configuration.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.
```

#### Related issues

- [#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)

#### Solution

With version `v0.6.0-beta.1` and lower, there were issues when instrumenting
the `dotnet` CLI tool.

Therefore, if you are using one of these versions, we advise executing
`dotnet build` before instrumenting the terminal session
or calling it in a separate terminal session.

See the [Get started](./README.md#get-started)
section for more information.

### Assembly version conflicts

#### Symptoms

Error message similar to the one below:

```txt
Unhandled exception. System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.

File name: 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
   at Microsoft.AspNetCore.Builder.WebApplicationBuilder..ctor(WebApplicationOptions options, Action`1 configureDefaults)
   at Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(String[] args)
   at Program.<Main>$(String[] args) in /Blog.Core/Blog.Core.Api/Program.cs:line 26
```

#### Related issues

- [#2269](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2269)
- [#2296](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2296)

#### Solution

OpenTelemetry .NET NuGet packages and its dependencies
are deployed with the OpenTelemetry .NET Automatic Instrumentation.

To handle dependency versions conflicts,
update the instrumented application's project references
to use the same versions as OpenTelemetry .NET Automatic Instrumentation.

A simple way to ensure that no such conflicts happen is to add the
`OpenTelemetry.AutoInstrumentation` package to your application.
For instructions about how to add it to your application, see
[Using the OpenTelemetry.AutoInstrumentation NuGet packages](./using-the-nuget-packages.md#using-the-opentelemetryautoinstrumentation-nuget-packages)
.

Alternatively add only the conflicting packages to your project.
The following dependencies are used by OpenTelemetry .NET Automatic Instrumentation:

- [OpenTelemetry.AutoInstrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation/OpenTelemetry.AutoInstrumentation.csproj)
- [OpenTelemetry.AutoInstrumentation.AdditionalDeps](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Build.props)

Find their versions in the following locations:

- [Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/Directory.Packages.props)
- [src/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/Directory.Packages.props)
- [src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/main/src/OpenTelemetry.AutoInstrumentation.AdditionalDeps/Directory.Packages.props)

By default, assembly references for .NET Framework applications are redirected
during runtime to the versions used by the automatic instrumentation.
This behavior can be controlled through the [`OTEL_DOTNET_AUTO_NETFX_REDIRECT_ENABLED`](./config.md#additional-settings)
setting.

If the application already ships binding redirection for assemblies
used by automatic instrumentation this automatic redirection may fail,
see [#2833](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2833).
Check if any existing binding redirect prevent redirection to the versions
listed at [netfx_assembly_redirection.h](../src/OpenTelemetry.AutoInstrumentation.Native/netfx_assembly_redirection.h).

For the automatic redirection above to work there are two specific scenarios that
require the assemblies used to instrument .NET Framework
applications, the ones under the `netfx` folder of the installation directory,
to be also installed into the Global Assembly Cache (GAC):

1. [__Monkey patch instrumentation__](https://en.wikipedia.org/wiki/Monkey_patch#:~:text=Monkey%20patching%20is%20a%20technique,Python%2C%20Groovy%2C%20etc.)
of assemblies loaded as domain-neutral.
2. Assembly redirection for strong-named applications if the app also ships
different versions of some assemblies also shipped in the `netfx` folder.

If you are having problems in one of the scenarios above run again the
`Install-OpenTelemetryCore` command from the
[PowerShell installation module](../OpenTelemetry.DotNet.Auto.psm1)
to ensure that the required GAC installations are updated.

For more information about the GAC usage by the automatic instrumentation,
see [here](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1906#issuecomment-1376292814).

### Assembly in AdditionalDeps was not found

#### Symptoms

You get an error message similar to the following:

```txt
An assembly specified in the application dependencies manifest (OpenTelemetry.AutoInstrumentation.AdditionalDeps.deps.json) was not found  
```

#### Related issues

- [#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)
- [#2181](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2181)

#### Solution

If you encounter an issue not listed on this page, see [General steps](#general-steps)
to collect additional diagnostic information. This might help facilitate troubleshooting.
