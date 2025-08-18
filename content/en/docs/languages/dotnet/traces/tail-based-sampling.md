---
title: Tail-based sampling
linkTitle: Tail-based sampling
description:
  Learn how to implement tail-based sampling for capturing all failed spans in
  OpenTelemetry .NET
weight: 29
---

This guide describes one possible way to achieve a form of tail-based sampling
to include all failed activities (spans) in addition to head-based sampling in
OpenTelemetry .NET.

## What is tail-based sampling?

Tail-based sampling makes sampling decisions after the trace has been completed,
allowing for more informed decisions based on the full context of the trace.
This is in contrast to head-based sampling, which makes decisions at the
beginning of the trace.

This implementation uses a combination of a custom sampler and an
`ActivityProcessor` (span processor) to achieve a hybrid approach:

- Head-based sampling (probabilistic/unbiased sampling)
- Tail-based sampling (a non-probabilistic/biased sampling)

## Implementation approach

The SDK uses a hybrid approach where we do head-based sampling to get a
probabilistic subset of all activities which includes both successful activities
and failure activities. In addition, it captures all failure activities.

To accomplish this:

1. If the parent-based sampler's decision is to drop an activity, the SDK
   returns a "Record-Only" sampling result. This ensures that the activity
   processor receives that activity.
2. In the activity processor, at the end of an activity, the SDK checks if it is
   a failure activity. If so, the SDK changes the decision from "Record-Only" to
   set the sampled flag so that the exporter receives the activity.

In this example, each activity is filtered individually without consideration to
any other activities.

## When to use tail-based sampling

This is a good option if you want to get all failed activities in addition to
head-based sampling. With this approach, you get basic activity-level tail-based
sampling at the SDK level without having to install any additional components.

## Tradeoffs

Tail-sampling this way involves several tradeoffs:

1. **Additional performance cost**: Unlike head-based sampling where the
   sampling decision is made at activity creation time, in tail sampling the
   decision is made only at the end, so there is additional memory/processing
   cost.

2. **Partial traces**: Since this sampling is at an activity level, the
   generated trace will be partial. For example, if another part of the call
   tree is successful, those activities may not be exported leading to an
   incomplete trace.

3. **Multiple exporters**: If multiple exporters are used, this decision will
   impact all of them.

## Example code

The implementation consists of two main components:

### 1. A custom parent-based sampler that allows "Record-Only" decisions:

```csharp
public class ParentBasedElseAlwaysRecordSampler : Sampler
{
    private readonly Sampler _rootSampler;

    public ParentBasedElseAlwaysRecordSampler(Sampler rootSampler)
        : base()
    {
        _rootSampler = rootSampler ?? throw new ArgumentNullException(nameof(rootSampler));
    }

    public override SamplingResult ShouldSample(in SamplingParameters samplingParameters)
    {
        // If there's a parent, use its sampling decision
        if (samplingParameters.ParentContext.TraceId != default)
        {
            if (samplingParameters.ParentContext.TraceFlags.HasFlag(ActivityTraceFlags.Recorded))
            {
                return new SamplingResult(SamplingDecision.RecordAndSample);
            }
            else
            {
                // Instead of dropping, we record this activity so that we can process it in our
                // processor
                return new SamplingResult(SamplingDecision.RecordOnly);
            }
        }

        // This is a root activity. Use the root sampler to make the decision.
        return _rootSampler.ShouldSample(samplingParameters);
    }

    public override string Description => $"ParentBasedElseAlwaysRecordSampler({_rootSampler.Description})";
}
```

### 2. A tail sampling processor that selectively samples failed activities:

```csharp
public class TailSamplingProcessor : BaseProcessor<Activity>
{
    private readonly string _statusTagName;

    public TailSamplingProcessor(string statusTagName = "otel.status_code")
    {
        _statusTagName = statusTagName;
    }

    public override void OnEnd(Activity activity)
    {
        // If the activity is already sampled, we don't need to do anything
        if (activity.ActivityTraceFlags.HasFlag(ActivityTraceFlags.Recorded))
        {
            return;
        }

        // Check if this is an error activity
        bool isError = false;

        if (activity.Status == ActivityStatusCode.Error)
        {
            isError = true;
        }
        else if (activity.TagObjects != null)
        {
            foreach (var tag in activity.TagObjects)
            {
                if (tag.Key == _statusTagName)
                {
                    if (tag.Value?.ToString() == "ERROR")
                    {
                        isError = true;
                        break;
                    }
                }
            }
        }

        if (isError)
        {
            Console.WriteLine($"Including error activity with id {activity.Id} and status {activity.Status}");
            activity.ActivityTraceFlags |= ActivityTraceFlags.Recorded;
        }
        else
        {
            Console.WriteLine($"Dropping activity with id {activity.Id} and status {activity.Status}");
        }
    }
}
```

## Example output

When you run an application using this sampler and processor, you should see
output similar to the following:

```text
Including error activity with id
00-404ddff248b8f9a9b21e347d68d2640e-035858bc3c168885-01 and status Error
Activity.TraceId:            404ddff248b8f9a9b21e347d68d2640e
Activity.SpanId:             035858bc3c168885
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: SDK.TailSampling.POC
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T19:05:32.5563112Z
Activity.Duration:           00:00:00.0028144
Activity.Tags:
    foo: bar
StatusCode: Error
Resource associated with Activity:
    service.name: unknown_service:Examples.TailBasedSamplingAtSpanLevel

Dropping activity with id 00-ea861bda268c58d328ab7cbe49851499-daba29055de80a53-00
and status Ok

Including head-sampled activity with id
00-f3c88010615e285c8f3cb3e2bcd70c7f-f9316215f12437c3-01 and status Ok
Activity.TraceId:            f3c88010615e285c8f3cb3e2bcd70c7f
Activity.SpanId:             f9316215f12437c3
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: SDK.TailSampling.POC
Activity.DisplayName:        SayHello
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T19:05:32.8519346Z
Activity.Duration:           00:00:00.0000034
Activity.Tags:
    foo: bar
StatusCode: Ok
Resource associated with Activity:
    service.name: unknown_service:Examples.TailBasedSamplingAtSpanLevel
```

This shows that:

1. Error activities are always included (through tail-based sampling)
2. Some OK activities are dropped (if not selected by head-based sampling)
3. Some OK activities are included (through head-based sampling)

## Complete example

For the complete example including a working application, see the
[OpenTelemetry .NET repository](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/examples).
