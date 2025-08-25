---
title: Creating links between traces
linkTitle: Links
description: Learn how to create links between traces with OpenTelemetry .NET
weight: 50
cSpell:ignore: activitycontext nestedActivity
---

This guide explains how to create links between traces in OpenTelemetry .NET,
which can be useful for fan-out operations, batched processing, or correlating
related activities across different traces.

## What are trace links?

In OpenTelemetry, links allow you to establish connections between spans (or
activities in .NET) that are related but may not have a direct parent-child
relationship. This is particularly useful in distributed systems where you need
to correlate multiple operations that might be part of different traces.

Common scenarios for using links include:

- **Fan-out operations**: When a single request triggers multiple parallel
  operations
- **Batch processing**: When multiple incoming requests are processed in a
  single batch
- **Asynchronous processing**: When operations are handled asynchronously across
  different traces
- **Cross-service correlation**: When connecting related operations across
  different services

## Creating links to existing activities

The following example demonstrates how to create new root activities that link
to an existing activity:

```csharp
using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Trace;

// Create an activity source
var activitySource = new ActivitySource("MyCompany.MyApplication");

// Configure OpenTelemetry
using var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource("MyCompany.MyApplication")
    .AddConsoleExporter()
    .Build();

// Start a parent activity
using (var orchestratingActivity = activitySource.StartActivity("OrchestratingActivity"))
{
    orchestratingActivity?.SetTag("operation", "main-process");

    // Fan out to multiple operations with linked activities
    await DoFanoutAsync(activitySource, 3);

    // Continue with the original activity
    using (var nestedActivity = activitySource.StartActivity("WrapUp"))
    {
        nestedActivity?.SetTag("status", "completed");
    }
}

// Method that creates new root activities with links
async Task DoFanoutAsync(ActivitySource source, int operationCount)
{
    // Store the current activity to restore it later
    var previous = Activity.Current;

    // Get the context of the current activity for linking
    var activityContext = Activity.Current!.Context;
    var links = new List<ActivityLink>
    {
        new ActivityLink(activityContext),
    };

    var tasks = new List<Task>();

    // Create multiple new root activities that link to the original activity
    for (int i = 0; i < operationCount; i++)
    {
        int operationIndex = i;

        var task = Task.Run(() =>
        {
            // Set the current activity to null to create a new root activity
            Activity.Current = null;

            // Create a new root activity with a link to the original activity
            using var newRootActivity = source.StartActivity(
                ActivityKind.Internal,
                name: $"FannedOutActivity {operationIndex + 1}",
                links: links);

            // Perform work for this operation...
        });

        tasks.Add(task);
    }

    // Wait for all fanned-out operations to complete
    await Task.WhenAll(tasks);

    // Restore the original activity context
    Activity.Current = previous;
}
```

## Understanding the output

When you run this code, you'll see multiple activities in the output:

1. One trace for the `OrchestratingActivity` (the original activity)
2. Multiple independent traces, one for each `FannedOutActivity`
3. Each `FannedOutActivity` has a link to the `OrchestratingActivity`

The output will look similar to:

```text
Activity.TraceId:            5ce4d8ad4926ecdd0084681f46fa38d9
Activity.SpanId:             8f9e9441f0789f6e
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: MyCompany.MyApplication
Activity.DisplayName:        FannedOutActivity 1
Activity.Kind:               Internal
Activity.StartTime:          2023-10-17T01:24:40.4957326Z
Activity.Duration:           00:00:00.0008656
Activity.Links:
    2890476acefb53b93af64a0d91939051 16b83c1517629363
```

Notice that this activity has:

- A new trace ID (`5ce4d8ad4926ecdd0084681f46fa38d9`)
- A link to the original activity's trace and span IDs
  (`2890476acefb53b93af64a0d91939051 16b83c1517629363`)

## When to use links

Consider using links in the following scenarios:

1. **High-cardinality operations**: When a single operation would generate
   thousands of spans, creating separate traces with links can make
   visualization and analysis more manageable.

2. **Parallel processing**: When processing items in parallel and you want to
   track each item's processing independently while maintaining the connection
   to the original request.

3. **Asynchronous workflows**: When operations happen asynchronously and may not
   complete in the same trace lifetime.

## Tradeoffs of using links

While links provide flexibility, there are some considerations:

- **Multiple traces**: Instead of a single cohesive trace, you'll have multiple
  related traces.
- **Visualization complexity**: Some observability tools may have limited
  support for visualizing linked traces.
- **Analysis complexity**: Analyzing data across linked traces requires more
  complex queries.

## Best practices

1. **Use meaningful activity names**: Choose clear names that indicate the
   purpose of each linked activity.
2. **Add contextual tags**: Include tags that help identify why activities are
   linked.
3. **Restore the original context**: Always restore the original
   Activity.Current after creating linked activities.
4. **Use sparingly**: Only create new root activities when necessary to avoid
   fragmenting your tracing data.

## Learn more

- [OpenTelemetry Specification: Links between spans](/docs/specs/otel/overview/#links-between-spans)
- [Activity Creation Options](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Api#activity-creation-options)
