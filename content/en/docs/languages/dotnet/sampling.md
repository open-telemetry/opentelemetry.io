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

