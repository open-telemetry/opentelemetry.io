---
title: Troubleshooting .NET automatic instrumentation issues
linkTitle: Troubleshooting
weight: 50
cSpell:ignore: corehost netfx pjanotti's TRACEFILE
---

## General steps

If you encounter any issue with OpenTelemetry .NET Automatic Instrumentation,
there are steps that can help you understand the problem.

### Enable detailed logging

Detailed debug logs can help you troubleshoot instrumentation issues, and can be
attached to issues in this project to facilitate investigation.

To get the detailed logs from the OpenTelemetry .NET Automatic Instrumentation,
set the [`OTEL_LOG_LEVEL`](../configuration#internal-logs) environment variable
to `debug` before the instrumented process starts.

By default, the library writes the log files under predefined
[locations](../configuration#internal-logs). If needed, change the default
location by updating the `OTEL_DOTNET_AUTO_LOG_DIRECTORY` environment variable.

After obtaining the logs, remove the `OTEL_LOG_LEVEL` environment variable, or
set it to less verbose level to avoid unnecessary overhead.

### Enable host tracing

[Host tracing](https://github.com/dotnet/runtime/blob/edd23fcb1b350cb1a53fa409200da55e9c33e99e/docs/design/features/host-tracing.md#host-tracing)
can be used to gather the information needed to investigate the problems related
to various issues, like assemblies not being found. Set the following
environment variables:

```terminal
COREHOST_TRACE=1
COREHOST_TRACEFILE=corehost_verbose_tracing.log
```

Then restart the application to collect the logs.

## Common issues

### No telemetry is produced

There is no telemetry generated. There are no logs in OpenTelemetry .NET
Automatic Instrumentation internal logs
[location](../configuration#internal-logs).

It might occur that the .NET Profiler is unable to attach and therefore no logs
would be emitted.

The most common reason is that the instrumented application has no permissions
to load the OpenTelemetry .NET Automatic Instrumentation assemblies.

### Could not install package 'OpenTelemetry.AutoInstrumentation.Runtime.Native'

When adding the NuGet packages to your project you get an error message similar
to:

```txt
Could not install package 'OpenTelemetry.AutoInstrumentation.Runtime.Native 1.6.0'. You are trying to install this package into a project that targets '.NETFramework,Version=v4.7.2', but the package does not contain any assembly references or content files that are compatible with that framework. For more information, contact the package author.
```

The NuGet packages don't support old-style `csproj` projects. Either deploy the
automatic instrumentation to the machine instead of using NuGet packages, or
migrate your project to the SDK style `csproj`.

### Performance issues

If high CPU usage occurs, make sure that you have not enabled the automatic
instrumentation globally by setting the environment variables at system or user
scope.

If the usage of system or user scope is intentional, use the
[`OTEL_DOTNET_AUTO_EXCLUDE_PROCESSES`](../configuration#global-settings)
environment variables to exclude applications from the automatic
instrumentation.

### `dotnet` CLI tool is crashing

You get error messages similar to the one below when running an app, for example
with `dotnet run`:

```txt
PS C:\Users\Administrator\Desktop\OTelConsole-NET6.0> dotnet run My.Simple.Console
Unhandled exception. System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.TypeInitializationException: The type initializer for 'OpenTelemetry.AutoInstrumentation.Loader.Startup' threw an exception.
---> System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation.
---> System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.Configuration.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.
```

With version `v0.6.0-beta.1` and lower, there were issues when instrumenting the
`dotnet` CLI tool.

Therefore, if you are using one of these versions, we advise executing
`dotnet build` before instrumenting the terminal session or calling it in a
separate terminal session.

See
[#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)
for more information.

### Assembly version conflicts

Error message similar to the one below:

```txt
Unhandled exception. System.IO.FileNotFoundException: Could not load file or assembly 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'. The system cannot find the file specified.

File name: 'Microsoft.Extensions.DependencyInjection.Abstractions, Version=7.0.0.0, Culture=neutral, PublicKeyToken=adb9793829ddae60'
   at Microsoft.AspNetCore.Builder.WebApplicationBuilder..ctor(WebApplicationOptions options, Action`1 configureDefaults)
   at Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(String[] args)
   at Program.<Main>$(String[] args) in /Blog.Core/Blog.Core.Api/Program.cs:line 26
```

OpenTelemetry .NET NuGet packages and its dependencies are deployed with the
OpenTelemetry .NET Automatic Instrumentation.

To handle dependency versions conflicts, update the instrumented application's
project references to use the same versions as OpenTelemetry .NET Automatic
Instrumentation.

A simple way to ensure that no such conflicts happen is to add the
`OpenTelemetry.AutoInstrumentation` package to your application. For
instructions about how to add it to your application, see
[Using the OpenTelemetry.AutoInstrumentation NuGet packages](../nuget-packages).

For framework-dependent standalone .NET deployments where automatic assembly
redirection cannot resolve a conflict or must be disabled, use the
[AdditionalDeps and shared-store workaround](#additionaldeps-and-shared-store-workaround).

Alternatively add only the conflicting packages to your project. The following
dependencies are used by OpenTelemetry .NET Automatic Instrumentation:

- [OpenTelemetry.AutoInstrumentation](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v1.18.0/src/OpenTelemetry.AutoInstrumentation/OpenTelemetry.AutoInstrumentation.csproj)

Find their versions in the following locations:

- [Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v1.18.0/Directory.Packages.props)
- [src/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v1.18.0/src/Directory.Packages.props)
- [src/OpenTelemetry.AutoInstrumentation.Assemblies/Directory.Packages.props](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v1.18.0/src/OpenTelemetry.AutoInstrumentation.Assemblies/Directory.Packages.props)

Assembly redirection is enabled by default for standalone deployments and
disabled for NuGet package deployments. This behavior can be controlled through
the [`OTEL_DOTNET_AUTO_REDIRECT_ENABLED`](../configuration#additional-settings)
setting. If you experience assembly loading failures with NuGet packages, check
that this setting has not been explicitly enabled.

If the application already ships binding redirection for assemblies used by
automatic instrumentation this automatic redirection may fail, see
[#2833](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2833).
Check if any existing binding redirect prevent redirection to the versions
listed at
[assembly_redirection_net.h](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v1.18.0/src/OpenTelemetry.AutoInstrumentation.Native/assembly_redirection_net.h)
for .NET applications and
[assembly_redirection_netfx.h](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v1.18.0/src/OpenTelemetry.AutoInstrumentation.Native/assembly_redirection_netfx.h)
for .NET Framework applications. For details about the resolution strategies,
including `UnsafeAccessorTypeAttribute` metadata redirection on .NET 10 and
later, see
[Assembly Conflict Resolution](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v1.18.0/docs/assembly-conflict-resolution.md).

For the automatic redirection above to work there are two specific scenarios
that require the assemblies used to instrument .NET Framework applications, the
ones under the `netfx` folder of the installation directory, to be also
installed into the Global Assembly Cache (GAC):

1. [**Monkey patch instrumentation**](https://en.wikipedia.org/wiki/Monkey_patch)
   of assemblies loaded as domain-neutral.
2. Assembly redirection for strong-named applications if the app also ships
   different versions of some assemblies also shipped in the `netfx` folder.

If you are having problems in one of the scenarios above run again the
`Install-OpenTelemetryCore` command from the PowerShell installation module to
ensure that the required GAC installations are updated.

For more information about the GAC usage by the automatic instrumentation, see
[pjanotti's comment](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1906#issuecomment-1376292814).

See
[#2269](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2269)
and
[#2296](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2296)
for more information.

#### AdditionalDeps and shared-store workaround

Standalone distributions include scripts that generate the dependency manifest
and shared-store directories from the dependencies already in the distribution.
Use this workaround for framework-dependent standalone .NET applications when
automatic assembly redirection cannot resolve a conflict or must be disabled.

Before starting the application, choose a dedicated, writable output directory
and run the script for your operating system.

On Linux and macOS:

```sh
"$OTEL_DOTNET_AUTO_HOME/generate-additional-deps.sh" \
  --output /var/lib/otel-dotnet-auto/additional-deps
```

On Windows:

```powershell
& "$env:OTEL_DOTNET_AUTO_HOME\generate-additional-deps.ps1" `
    -OutputPath "C:\ProgramData\OpenTelemetry\additional-deps"
```

Set the following environment variables for the application using the paths
printed by the script:

```text
DOTNET_ADDITIONAL_DEPS=<output>/AdditionalDeps
DOTNET_SHARED_STORE=<output>/store
```

If assembly redirection must also be disabled for the application, set
`OTEL_DOTNET_AUTO_REDIRECT_ENABLED=false`.

This workaround has the following limitations:

- It applies only to framework-dependent standalone .NET applications. .NET
  Framework and self-contained applications cannot use it, and NuGet package
  deployments resolve dependencies through the application's NuGet graph.
- Explicit assembly loading and custom `AssemblyLoadContext` implementations can
  bypass the generated dependency graph.
- The generated files depend on the distribution's architectures, target
  frameworks, and dependency versions. Regenerate them into a clean output
  directory after every instrumentation upgrade. Do not combine files from
  different versions.
- The dependency graph applies to the entire application. Validate the
  application after enabling it, especially if it references different versions
  of the same dependencies.

For details, see the upstream
[AdditionalDeps and shared-store workaround](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/blob/v1.18.0/docs/assembly-conflict-resolution.md#additionaldeps-and-shared-store-workaround).

### Assembly in AdditionalDeps was not found

#### Symptoms

You get an error message similar to the following:

```txt
An assembly specified in the application dependencies manifest (OpenTelemetry.AutoInstrumentation.AdditionalDeps.deps.json) was not found
```

This might be related to the following issues:

- [#1744](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/1744)
- [#2181](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/issues/2181)

## Other issues

If you encounter an issue not listed on this page, see
[General steps](#general-steps) to collect additional diagnostic information.
This might help facilitate troubleshooting.
