---
title: Sampling
description: Configure sampling in OpenTelemetry .NET
weight: 50
---

Sampling controls which traces are recorded and exported. By reducing the number
of collected spans, sampling helps control overhead and telemetry volume.

In OpenTelemetry, sampling decisions are typically made when a trace is started
and then propagated to downstream services through context.

## Configure a sampler

In .NET, configure sampling on the `TracerProvider` using `SetSampler`:

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .SetSampler(new TraceIdRatioBasedSampler(0.25))
    .Build();
```

This example samples approximately 25% of traces.

## Built-in samplers

The OpenTelemetry .NET SDK provides several built-in sampler implementations.
These can be configured in code or via environment variables.

### AlwaysOn

Samples every trace.

Useful in development or debugging environments where complete visibility is
required.

### AlwaysOff

Samples no traces.

Useful for disabling tracing without removing instrumentation.

### TraceIdRatioBased

Samples traces based on a fixed probability.

```csharp
.SetSampler(new TraceIdRatioBasedSampler(0.1)) // 10%
```

Commonly used in production to reduce telemetry volume while still capturing a
representative subset of traces.

### ParentBased

Uses the sampling decision of the parent span when one exists.

If there is no parent, it delegates to a root sampler. This helps ensure
consistent sampling decisions across distributed services that participate in
the same trace.

## Default sampler

By default, the .NET SDK uses a parent-based sampler with an always-on root
sampler.

This means:

- new root traces are sampled
- child spans follow the parent’s sampling decision

## Environment variable configuration

Sampling can also be configured using environment variables, which is useful for
containerized and cloud native deployments.

### OTEL_TRACES_SAMPLER

Specifies which sampler to use.

Common values include:

- `always_on`
- `always_off`
- `traceidratio`
- `parentbased_always_on`
- `parentbased_always_off`
- `parentbased_traceidratio`

### OTEL_TRACES_SAMPLER_ARG

Provides an argument for the configured sampler.

For example:

```bash
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=0.25
```

This configures a 25% sampling rate.

## Production guidance

In development, using an always-on sampler is often acceptable.

In production, a common approach is to use parent-based sampling with a
ratio-based root sampler. This balances telemetry volume with trace consistency
across services.

If you need to make sampling decisions based on completed traces (for example,
keeping only slow or error traces), use tail-based sampling in the OpenTelemetry
Collector.

## Further reading

- [Sampling concepts](/docs/concepts/sampling/)
- [Tracing in .NET](/docs/languages/dotnet/traces/)
