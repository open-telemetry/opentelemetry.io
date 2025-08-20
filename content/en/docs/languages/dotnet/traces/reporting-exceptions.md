---
title: Reporting exceptions
linkTitle: Exceptions
description: Learn how to report exceptions in OpenTelemetry .NET traces
weight: 40
cSpell:ignore: AppDomain
---

This guide describes how to report exceptions to OpenTelemetry tracing when
manually creating activities (spans). If you're using one of the
[instrumentation libraries](/docs/languages/dotnet/instrumentation/), it may
provide these functionalities automatically.

## Understanding exception handling in traces

In OpenTelemetry, it's important to report exceptions in your traces to provide
context about errors that occur in your application. There are several ways to
handle this, from basic status reporting to full exception details.

## User-handled exceptions

User-handled exceptions are exceptions that are caught and handled by the
application:

```csharp
try
{
    Func();
}
catch (SomeException ex)
{
    DoSomething();
}
catch (Exception ex)
{
    DoSomethingElse();
    throw;
}
```

OpenTelemetry .NET provides several options for reporting these exceptions in
your traces.

### Option 1: Set activity status manually

The most basic option is to set the Activity status to Error to indicate that an
exception has occurred:

```csharp
using (var activity = MyActivitySource.StartActivity("Foo"))
{
    try
    {
        Func();
    }
    catch (SomeException ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error);
        DoSomething();
    }
    catch (Exception ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error);
        throw;
    }
}
```

### Option 2: Use SetErrorStatusOnException feature

If you have deeply nested activities or activities created in third-party
libraries, manually setting the status can be difficult. Instead, you can
configure the SDK to automatically detect exceptions and set activity status:

```csharp
Sdk.CreateTracerProviderBuilder()
    .SetErrorStatusOnException()
    // other configuration...
    .Build();
```

With this configuration, any exception that occurs while an activity is active
will automatically set that activity's status to Error.

{{% alert title="Note" %}} This feature is platform-dependent as it relies on
`System.Runtime.InteropServices.Marshal.GetExceptionPointers`. {{% /alert %}}

### Option 3: Include error description

You can include the exception message as the status description for more
context:

```csharp
using (var activity = MyActivitySource.StartActivity("Foo"))
{
    try
    {
        Func();
    }
    catch (SomeException ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
    }
}
```

### Option 4: Record the full exception

For the richest debugging experience, use `Activity.RecordException()` to store
the exception in the activity as an event:

```csharp
using (var activity = MyActivitySource.StartActivity("Foo"))
{
    try
    {
        Func();
    }
    catch (SomeException ex)
    {
        activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
        activity?.RecordException(ex);
    }
}
```

This will capture the exception type, message, and stack trace in the activity,
making it available in your tracing backend.

## Unhandled exceptions

Unhandled exceptions are exceptions that are not caught and handled by the
application. They typically cause the process to crash or terminate the thread.

You can capture unhandled exceptions and record them in your active activities
by using the `AppDomain.UnhandledException` event handler:

```csharp
using System;
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;

public class Program
{
    private static readonly ActivitySource MyActivitySource = new ActivitySource("MyCompany.MyProduct.MyLibrary");

    public static void Main()
    {
        AppDomain.CurrentDomain.UnhandledException += UnhandledExceptionHandler;

        using var tracerProvider = Sdk.CreateTracerProviderBuilder()
            .AddSource("MyCompany.MyProduct.MyLibrary")
            .SetSampler(new AlwaysOnSampler())
            .SetErrorStatusOnException()
            .AddConsoleExporter()
            .Build();

        using (MyActivitySource.StartActivity("Foo"))
        {
            using (MyActivitySource.StartActivity("Bar"))
            {
                throw new Exception("Oops!");
            }
        }
    }

    private static void UnhandledExceptionHandler(object source, UnhandledExceptionEventArgs args)
    {
        var ex = (Exception)args.ExceptionObject;

        var activity = Activity.Current;

        while (activity != null)
        {
            activity.RecordException(ex);
            activity.Dispose();
            activity = activity.Parent;
        }
    }
}
```

{{% alert title="Caution" %}} Use `AppDomain.UnhandledException` with care.
Throwing an exception in this handler puts the process into an unrecoverable
state. {{% /alert %}}

## Best practices

When reporting exceptions in OpenTelemetry traces:

1. **Always set status to Error**: At a minimum, set the activity status to
   Error when an exception occurs.

2. **Include exception details**: Use `RecordException()` to capture full
   exception information when possible.

3. **Handle unhandled exceptions**: Consider setting up a global handler for
   unhandled exceptions to ensure they're captured in your traces.

4. **Consider automation**: Use the `SetErrorStatusOnException()` SDK option to
   automate status setting for exceptions.

5. **Watch cardinality**: Be cautious about including highly variable exception
   messages directly in status descriptions, as they can increase the
   cardinality of your spans.

## Learn more

- [Activity API Reference](https://learn.microsoft.com/dotnet/core/diagnostics/distributed-tracing-concepts)
