---
title: Getting started with traces - Console
linkTitle: Console
description: Learn how to use OpenTelemetry Traces in a .NET Console application
weight: 10
cSpell:ignore: baz DiagnosticSource tracerprovider
---

This guide will show you how to get started with OpenTelemetry .NET Traces in a
console application in just a few minutes.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) installed on your computer

## Creating a console application

Create a new console application and run it:

```shell
dotnet new console --output getting-started
cd getting-started
dotnet run
```

You should see the following output:

```text
Hello World!
```

## Adding OpenTelemetry traces

Install the OpenTelemetry Console Exporter package:

```shell
dotnet add package OpenTelemetry.Exporter.Console
```

Update the `Program.cs` file with the following code:

```csharp
using System;
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace GettingStarted
{
    class Program
    {
        // Define an ActivitySource to create activities from
        private static readonly ActivitySource MyActivitySource = new ActivitySource(
            "MyCompany.MyProduct.MyLibrary");

        static void Main(string[] args)
        {
            // Configure the OpenTelemetry TracerProvider
            using var tracerProvider = Sdk.CreateTracerProviderBuilder()
                .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("getting-started"))
                .AddSource("MyCompany.MyProduct.MyLibrary")
                .AddConsoleExporter()
                .Build();

            // Start an activity (span) with some tags (attributes)
            using (var activity = MyActivitySource.StartActivity("SayHello"))
            {
                // Set some attributes on the activity
                activity?.SetTag("foo", 1);
                activity?.SetTag("bar", "Hello, World!");
                activity?.SetTag("baz", new int[] { 1, 2, 3 });

                // Set the status of the activity
                activity?.SetStatus(ActivityStatusCode.Ok);

                // Do some work...
                Console.WriteLine("Hello World!");
            }

            Console.WriteLine("Trace has been exported. Press any key to exit.");
            Console.ReadKey();
        }
    }
}
```

Run the application again (using `dotnet run`) and you should see the trace
output from the console:

```text
Activity.TraceId:          d4a7d499698d62f0e2317a67abc559b6
Activity.SpanId:           a091d18fbe45bdf6
Activity.TraceFlags:       Recorded
Activity.ActivitySourceName: MyCompany.MyProduct.MyLibrary
Activity.DisplayName: SayHello
Activity.Kind:        Internal
Activity.StartTime:   2022-03-30T19:42:33.5178011Z
Activity.Duration:    00:00:00.0097620
StatusCode : Ok
Activity.Tags:
    foo: 1
    bar: Hello, World!
    baz: [1, 2, 3]
Resource associated with Activity:
    service.name: getting-started
```

You are now collecting traces using OpenTelemetry.

## How it works

### ActivitySource (Tracer)

The program creates an `ActivitySource` which represents an
[OpenTelemetry Tracer](/docs/specs/otel/trace/api/#tracer):

```csharp
private static readonly ActivitySource MyActivitySource = new ActivitySource(
    "MyCompany.MyProduct.MyLibrary");
```

The `ActivitySource` is used to create and start new activities.

### Activity (Span)

The `ActivitySource` instance is used to start an `Activity` which represents an
[OpenTelemetry Span](/docs/specs/otel/trace/api/#span). You can set several tags
(attributes) on it and set its status:

```csharp
using (var activity = MyActivitySource.StartActivity("SayHello"))
{
    activity?.SetTag("foo", 1);
    activity?.SetTag("bar", "Hello, World!");
    activity?.SetTag("baz", new int[] { 1, 2, 3 });
    activity?.SetStatus(ActivityStatusCode.Ok);
}
```

### TracerProvider

A TracerProvider is configured to subscribe to activities from the specified
source and export them:

```csharp
var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("MyCompany.MyProduct.MyLibrary")
    .AddConsoleExporter()
    .Build();
```

The TracerProvider is the central component in the OpenTelemetry SDK. It holds
all the configuration for tracing like samplers, processors, exporters, etc. and
is highly customizable.

## Tracing pipeline

The tracing pipeline in OpenTelemetry .NET follows this flow:

1. ActivitySource creates Activities
2. TracerProvider receives Activities
3. Processor processes Activities
4. Exporter exports Activities to a backend

## OpenTelemetry .NET and .NET Activity API

In OpenTelemetry .NET, the terms `ActivitySource` and `Activity` are used
instead of `Tracer` and `Span` from the OpenTelemetry specification. This is
because tracing in OpenTelemetry .NET is implemented on top of the .NET
runtime's built-in diagnostics system.

You can instrument your application by depending on the
`System.Diagnostics.DiagnosticSource` package, which provides `Activity` and
`ActivitySource` classes representing the OpenTelemetry concepts of
[Span](/docs/specs/otel/trace/api/#span) and
[Tracer](/docs/specs/otel/trace/api/#tracer) respectively.

## Learn more

- [Getting Started with Jaeger](/docs/languages/dotnet/traces/jaeger/)
- [Reporting Exceptions](/docs/languages/dotnet/traces/reporting-exceptions/)
- [Creating Links Between Traces](/docs/languages/dotnet/traces/links-creation/)
