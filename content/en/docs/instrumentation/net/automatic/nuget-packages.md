---
title: Using the OpenTelemetry.AutoInstrumentation NuGet packages
linkTitle: NuGet
weight: 20
cSpell:ignore: autoinstrumentation buildtasks
---

Use the NuGet packages in the following scenarios:

1. Simplify deployment. For example, a container running a single application.
1. Support instrumentation of
   [`self-contained`](https://learn.microsoft.com/en-us/dotnet/core/deploying/#publish-self-contained)
   applications.
1. Facilitate developer experimentation with automatic instrumentation through
   NuGet packages.
1. Solve version conflicts between the dependencies used by the application and
   the automatic instrumentation.

## Limitations

While NuGet packages are a convenient way to deploy automatic instrumentation,
they can't be used in all cases. The most common reasons for not using NuGet
packages include the following:

1. You can't add the package to the application project. For example, the
   application is from a third party that can't add the package.
1. Reduce disk usage, or the size of a virtual machine, when multiple
   applications to be instrumented are installed in a single machine. In this
   case you can use a single deployment for all .NET applications running on the
   machine.
1. A legacy application that can't be migrated to the
   [SDK-style project](https://learn.microsoft.com/en-us/nuget/resources/check-project-format#check-the-project-format).

## Using the NuGet packages

To automatically instrument your application with OpenTelemetry .NET add the
`OpenTelemetry.AutoInstrumentation` package to your project:

```terminal
dotnet add [<PROJECT>] package OpenTelemetry.AutoInstrumentation --prerelease
```

If the application references packages that can be instrumented, but, require
other packages for the instrumentation to work the build will fail and prompt
you to either add the missing instrumentation package or to skip the
instrumentation of the corresponding package:

```terminal
~packages/opentelemetry.autoinstrumentation.buildtasks/1.0.0-rc.1/build/OpenTelemetry.AutoInstrumentation.BuildTasks.targets(29,5): error : OpenTelemetry.AutoInstrumentation: add a reference to the instrumentation package 'MongoDB.Driver.Core.Extensions.DiagnosticSources' version 1.3.0 or add 'MongoDB.Driver.Core' to the property 'SkippedInstrumentations' to suppress this error.
```

To resolve the error either add the recommended instrumentation package or skip
the instrumentation of the listed package by adding it to the
`SkippedInstrumentation` property, example:

```csproj
<PropertyGroup>
   <SkippedInstrumentations>MongoDB.Driver.Core;StackExchange.Redis</SkippedInstrumentations>
</PropertyGroup>
```

The same property can be also specified directly via the CLI, notice that the
separator, `;`, needs to be properly escaped as '%3B':

```powershell
dotnet build -p:SkippedInstrumentations=StackExchange.Redis%3BMongoDB.Driver.Core
```

To distribute the appropriate native runtime components with your .NET
application, specify a
[Runtime Identifier (RID)](https://learn.microsoft.com/en-us/dotnet/core/rid-catalog)
to build the application using `dotnet build` or `dotnet publish`. This might
require choosing between distributing a
[_self-contained_ or a _framework-dependent_](https://learn.microsoft.com/en-us/dotnet/core/deploying/)
application. Both types are compatible with automatic instrumentation.

Use the script in the output folder of the build to launch the application with
automatic instrumentation activated.

- On Windows, use `instrument.cmd <application_executable>`
- On Linux or Unix, use `instrument.sh <application_executable>`

If you launch the application using the `dotnet` CLI, add `dotnet` after the
script.

- On Windows, use `instrument.cmd dotnet <application>`
- On Linux and Unix, use `instrument.sh dotnet <application>`

The script passes to the application all the command-line parameters you
provide.
