---
title: Stratified sampling
linkTitle: Stratified sampling
description:
  Learn how to implement stratified sampling for OpenTelemetry traces in .NET
weight: 28
cSpell:ignore: userinitiated
---

This guide demonstrates one possible way to achieve stratified sampling in
OpenTelemetry .NET.

## What is stratified sampling?

Stratified sampling is a way to divide a population into mutually exclusive
sub-populations or "strata". For example, the strata for a population of
"queries" could be "user-initiated queries" and "programmatic queries". Each
stratum is then sampled using a probabilistic sampling method. This ensures that
all sub-populations are represented.

## Implementation approach

The SDK achieves this by using a custom `Sampler` that internally holds two
samplers. Based on the stratum, the appropriate sampler is invoked.

One prerequisite for this is that the tag (for example, `queryType`) used for
the stratified sampling decision must be provided as part of activity creation.

The SDK uses disproportionate stratified sampling, also known as "unequal
probability sampling". For example, the sample size of each sub-population is
not proportionate to their occurrence in the overall population. In this
example, we want to ensure that all user initiated queries are represented, so
we use a 100% sampling rate for it, while the sampling rate chosen for
programmatic queries is much lower.

## Example code

The key component is a custom `StratifiedSampler` class:

```csharp
public class StratifiedSampler : Sampler
{
    private readonly string _stratifyByTagName;
    private readonly Dictionary<string, Sampler> _samplersByStratum;
    private readonly Sampler _defaultSampler;

    public StratifiedSampler(
        string stratifyByTagName,
        Dictionary<string, Sampler> samplersByStratum,
        Sampler defaultSampler)
        : base()
    {
        _stratifyByTagName = stratifyByTagName;
        _samplersByStratum = samplersByStratum;
        _defaultSampler = defaultSampler;
    }

    public override SamplingResult ShouldSample(
        in SamplingParameters samplingParameters)
    {
        ReadOnlySpan<KeyValuePair<string, object>> attributes =
            samplingParameters.Tags;

        for (int i = 0; i < attributes.Length; i++)
        {
            if (attributes[i].Key.Equals(_stratifyByTagName,
                StringComparison.OrdinalIgnoreCase))
            {
                string stratum = attributes[i].Value.ToString().ToLowerInvariant();
                if (_samplersByStratum.TryGetValue(stratum, out Sampler sampler))
                {
                    Console.WriteLine($"StratifiedSampler handling {stratum} query");
                    return sampler.ShouldSample(samplingParameters);
                }

                break;
            }
        }

        return _defaultSampler.ShouldSample(samplingParameters);
    }

    public override string Description => $"StratifiedSampler: {_stratifyByTagName}";
}
```

## Example output

When you run an application using this sampler, you should see output similar to
the following:

```text
StratifiedSampler handling userinitiated query
Activity.TraceId:            1a122d63e5f8d32cb8ebd3e402eb5389
Activity.SpanId:             83bdc6bbebea1df8
Activity.TraceFlags:         Recorded
Activity.ParentSpanId:       1ddd00d845ad645e
Activity.ActivitySourceName: StratifiedSampling.POC
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T05:19:30.8156879Z
Activity.Duration:           00:00:00.0008656
Activity.Tags:
    queryType: userInitiated
    foo: child
Resource associated with Activity:
    service.name: unknown_service:Examples.StratifiedSamplingByQueryType

Activity.TraceId:            1a122d63e5f8d32cb8ebd3e402eb5389
Activity.SpanId:             1ddd00d845ad645e
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: StratifiedSampling.POC
Activity.DisplayName:        Main
Activity.Kind:               Internal
Activity.StartTime:          2023-02-09T05:19:30.8115186Z
Activity.Duration:           00:00:00.0424036
Activity.Tags:
    queryType: userInitiated
    foo: bar
Resource associated with Activity:
    service.name: unknown_service:Examples.StratifiedSamplingByQueryType
```

This shows that the two sub-populations (strata) are being sampled
independently, with different sampling rates applied to each stratum.

## Complete example

For the complete example including a working application, see the
[OpenTelemetry .NET repository](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/examples).
