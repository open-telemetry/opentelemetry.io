---
title: Best practices
linkTitle: Best practices
description: Learn about best practices for using OpenTelemetry .NET for tracing
weight: 120
---

Follow these best practices to get the most out of OpenTelemetry .NET for
tracing.

## Package version

Use the
[System.Diagnostics.Activity](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity)
APIs from the latest stable version of
[System.Diagnostics.DiagnosticSource](https://www.nuget.org/packages/System.Diagnostics.DiagnosticSource/)
package, regardless of the .NET runtime version being used:

- If you are using the latest stable version of
  [OpenTelemetry .NET SDK](/docs/languages/dotnet/), you do not have to worry
  about the version of `System.Diagnostics.DiagnosticSource` package because it
  is already taken care of for you via package dependency.
- The .NET runtime team is holding a high bar for backward compatibility on
  `System.Diagnostics.DiagnosticSource` even during major version bumps, so
  compatibility is not a concern here.

## Tracing API

### ActivitySource

Avoid creating
[`System.Diagnostics.ActivitySource`](https://learn.microsoft.com/dotnet/api/system.diagnostics.activitysource)
too frequently. `ActivitySource` is fairly expensive and meant to be reused
throughout the application. For most applications, it can be modeled as static
readonly field or singleton via dependency injection.

Use dot-separated [UpperCamelCase](https://en.wikipedia.org/wiki/Camel_case) as
the
[`ActivitySource.Name`](https://learn.microsoft.com/dotnet/api/system.diagnostics.activitysource.name).
In many cases, using the fully qualified class name might be a good option. For
example:

```csharp
static readonly ActivitySource MyActivitySource = new("MyCompany.MyProduct.MyLibrary");
```

### Activity

Check
[`Activity.IsAllDataRequested`](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.isalldatarequested)
before
[setting Tags](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.settag)
for better performance.

```csharp
using (var activity = MyActivitySource.StartActivity("SayHello"))
{
    if (activity != null && activity.IsAllDataRequested == true)
    {
        activity.SetTag("http.url", "http://www.mywebsite.com");
    }
}
```

Use
[Activity.SetTag](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.settag)
to [set attributes](/docs/specs/otel/trace/api/#set-attributes).

Finish or stop the activity properly. This can be done implicitly via a `using`
statement, which is recommended. You can also explicitly call
[Activity.Dispose](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.dispose)
or
[Activity.Stop](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.stop).

{{% alert title="Note" %}} Activities which are not yet finished/stopped will
not be exported. {{% /alert %}}

Avoid calling
[Activity.AddEvent](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.addevent)
in a loop. Activities are not designed to handle hundreds or thousands of
events, a better model is to use
[correlated logs](/docs/languages/dotnet/logs/correlation/) or
[Activity.Links](https://learn.microsoft.com/dotnet/api/system.diagnostics.activity.links).
For example:

{{% alert title="Warning" color="warning" %}} The following code is not modeling
`Activity.Events` correctly, and is very likely to have usability and
performance problems. {{% /alert %}}

```csharp
private static async Task Test()
{
    Activity activity = Activity.Current;

    while (true)
    {
        activity.AddEvent(new ActivityEvent("Processing background task."));
        await Task.Delay(1000);
    }
}
```

## TracerProvider management

Avoid creating `TracerProvider` instances too frequently. `TracerProvider` is
fairly expensive and meant to be reused throughout the application. For most
applications, one `TracerProvider` instance per process would be sufficient.

Manage the lifecycle of `TracerProvider` instances if they are created by you.

As a general rule:

- If you are building an application with
  [dependency injection (DI)](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection)
  (e.g. [ASP.NET Core](https://learn.microsoft.com/aspnet/core) and
  [.NET Worker](https://learn.microsoft.com/dotnet/core/extensions/workers)), in
  most cases you should create the `TracerProvider` instance and let DI manage
  its lifecycle. Refer to the
  [Getting Started with OpenTelemetry .NET Traces in 5 Minutes - ASP.NET Core Application](/docs/languages/dotnet/traces/getting-started-aspnetcore/)
  tutorial to learn more.
- If you are building an application without DI, create a `TracerProvider`
  instance and manage the lifecycle explicitly. Refer to the
  [Getting Started with OpenTelemetry .NET Traces in 5 Minutes - Console Application](/docs/languages/dotnet/traces/getting-started-console/)
  tutorial to learn more.
- If you forget to dispose the `TracerProvider` instance before the application
  ends, activities might get dropped due to the lack of proper flush.
- If you dispose the `TracerProvider` instance too early, any subsequent
  activities will not be collected.

## Correlation

In OpenTelemetry, traces are automatically
[correlated to logs](/docs/languages/dotnet/logs/best-practices/#log-correlation)
and can be
[correlated to metrics](/docs/languages/dotnet/metrics/best-practices/#metrics-correlation)
through [exemplars](/docs/languages/dotnet/metrics/exemplars/).

### Manually creating Activities

As shown in the
[getting started](/docs/languages/dotnet/traces/getting-started-console/) guide,
it is very easy to manually create `Activity`. Due to this, it can be tempting
to create too many activities (for example, for each method call). In addition
to being expensive, excessive activities can also make trace visualization
harder. Instead of manually creating `Activity`, check if you can leverage
instrumentation libraries, such as
[ASP.NET Core](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/tree/main/src/OpenTelemetry.Instrumentation.AspNetCore/README.md),
[HttpClient](https://github.com/open-telemetry/opentelemetry-dotnet-contrib/tree/main/src/OpenTelemetry.Instrumentation.Http/README.md)
which will not only create and populate `Activity` with tags(attributes), but
also take care of propagating/restoring the context across process boundaries.

If the `Activity` produced by the instrumentation library is missing some
information you need, it is generally recommended to enrich the existing
`Activity` with that information, as opposed to creating a new one.

### Modelling static tags as Resource

Tags such as `MachineName`, `Environment`, and so on, which are static
throughout the process lifetime, should be modelled as `Resource`, instead of
adding them to each `Activity`.

## Common issues that lead to missing traces

The following are some common issues that lead to missing traces:

- The `ActivitySource` used to create the `Activity` is not added to the
  `TracerProvider`. Use `AddSource` method to enable the activity from a given
  `ActivitySource`.
- `TracerProvider` is disposed too early. You need to ensure that the
  `TracerProvider` instance is kept active for traces to be collected. In a
  typical application, a single TracerProvider is built at application startup,
  and is disposed of at application shutdown. For an ASP.NET Core application,
  use `AddOpenTelemetry` and `WithTraces` methods from the
  `OpenTelemetry.Extensions.Hosting` package to correctly setup
  `TracerProvider`.
