---
title: Create custom traces and metrics
linkTitle: Custom instrumentation
description: Custom traces and metrics using .NET automatic instrumentation.
cSpell:ignore: tracerprovider meterprovider
weight: 30
---

The automatic instrumentation configures a tracerprovider and a meterprovider so
that you can add your own manual instrumentation. By using both automatic and
manual instrumentation, you can better instrument the logic and functionality of
your applications, clients, and frameworks.

## Traces

To create your custom traces manually, follow these steps:

1. Add the `System.Diagnostics.DiagnosticSource` dependency to your project:

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="7.0.0" />
   ```

2. Create an `ActivitySource` instance:

   ```csharp
   private static readonly ActivitySource RegisteredActivity = new ActivitySource("Examples.ManualInstrumentations.Registered");
   ```

3. Create an `Activity`. Optionally, set tags:

   ```csharp
   using (var activity = RegisteredActivity.StartActivity("Main"))
   {
      activity?.SetTag("foo", "bar1");
      // your logic for Main activity
   }
   ```

4. Register your `ActivitySource` in OpenTelemetry.AutoInstrumentation by
   setting the `OTEL_DOTNET_AUTO_TRACES_ADDITIONAL_SOURCES` environmental
   variable. You can set the value to either
   `Examples.ManualInstrumentations.Registered` or to
   `Examples.ManualInstrumentations.*`, which registers the entire prefix.

{{% alert title="Note" color="note" %}} An `Activity` created for
`NonRegistered.ManualInstrumentations` `ActivitySource` is not handled by the
OpenTelemetry Automatic Instrumentation. {{% /alert %}}

## Metrics

To create your custom metrics manually, follow these steps:

1. Add the `System.Diagnostics.DiagnosticSource` dependency to your project:

   ```xml
   <PackageReference Include="System.Diagnostics.DiagnosticSource" Version="7.0.0" />
   ```

2. Create a `Meter` instance:

   ```csharp
   using var meter = new Meter("Examples.Service", "1.0");
   ```

3. Create an `Instrument`:

   ```csharp
   var successCounter = meter.CreateCounter<long>("srv.successes.count", description: "Number of successful responses");
   ```

4. Update the `Instrument` value. Optionally, set tags:

   ```csharp
   successCounter.Add(1, new KeyValuePair<string, object?>("tagName", "tagValue"));
   ```

5. Register your `Meter` with OpenTelemetry.AutoInstrumentation by setting the
   `OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES` environment variable:

   ```bash
   OTEL_DOTNET_AUTO_METRICS_ADDITIONAL_SOURCES=Examples.Service
   ```

   You can set the value to either `Examples.Service` or to `Examples.*`, which
   registers the entire prefix.

## Further reading

- [OpenTelemetry.io documentation for .NET Manual Instrumentation](../../manual#setting-up-an-activitysource)
