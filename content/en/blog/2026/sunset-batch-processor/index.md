---
title: Sunset of the OpenTelemetry Batch Processor
linkTitle: Sunset of the Batch Processor
date: 2026-02-01
author: '[Julia Furst Morgado](https://github.com/juliafmorgado) (Dash0)'

cSpell:ignore: backpressure juliafmorgado
---

For many of us, the batch processor became part of our Collector pipelines
almost by instinct. It reduced request overhead, improved exporter efficiency,
and smoothed bursty telemetry traffic. Once it worked, it tended to stay in
place.

As OpenTelemetry deployments scaled up and observability became production
infrastructure rather than a supporting tool, that default started to feel less
comfortable. Operators began noticing patterns that were difficult to explain:
brief gaps in traces, missing logs after routine restarts, and telemetry that
looked healthy in transit but arrived incomplete.

Over time, these experiences led the community to revisit a long-standing
assumption. Batching still matters, but the
[**classic batch processor is no longer recommended**](https://github.com/open-telemetry/opentelemetry-collector/issues/13766)
in most production environments.

This post explains how we got here and what that shift has taught us about
building resilient telemetry pipelines.

## When nothing appears broken

Some of the hardest observability failures are the ones that leave no obvious
trace of failure. There is no “service down” alert and no spike in error rates.
Instead, there is simply a hole where the truth used to be.

Imagine a routine day. A Collector restarts during a rolling deployment, or a
Kubernetes node drain moves pods to a new host. From the outside, everything
looks healthy. Applications continue serving traffic. Telemetry clients receive
successful responses and move on.

The problem only surfaces later. During an incident review or a weekly report,
someone notices the gap. Traces stop abruptly and resume minutes later. Logs
have a silent window. Metrics look thinner than expected for a short period of
time.

By the time the gap is noticed, the moment that caused it is long gone.

## What actually happens inside the Collector

For many teams, the behavior behind these gaps is unintuitive. Telemetry was
accepted, so why didn’t it arrive?

The answer lies in how batching historically worked inside the Collector. In the
classic pipeline, the batch processor sits between receivers and exporters,
accumulating telemetry in memory until a batch is ready to be flushed. As soon
as data enters the pipeline, the receiver acknowledges it to the sender. From
the application’s point of view, delivery is complete.

**Inside the Collector, that success is provisional until export completes.**

```text
Telemetry Sender
      |
      |  (send telemetry)
      v
+-------------------+
|   Receiver        |
+-------------------+
      |
      |  ✓ ACK returned to sender
      v
+-------------------+
| Batch Processor   |
| (in-memory only)  |
+-------------------+
      |
      |  (batch not flushed yet)
      v
+-------------------+
|   Exporter        |
+-------------------+

⚠ Collector restarts here → in-memory batch is lost
```

Until export completes, the telemetry exists only in process memory. If the
Collector is terminated during that window, the data is lost. The sender will
not retry, because it already received a successful response.

This behavior reflects an **at-most-once delivery model**. It made sense when
Collectors were relatively stable and restarts were infrequent. In modern
environments, however, restarts are routine. When batching relies on in-memory
buffers, those routine restarts introduce blind spots that are easy to overlook
and difficult to diagnose after the fact.

## Batching and backpressure don’t travel together

There is a second, subtler effect of separating batching from exporters.

Because the batch processor operates independently, exporter state is only
weakly reflected upstream. When a backend slows down or retries increase, the
pipeline does not immediately communicate that pressure to receivers. The
Collector continues accepting telemetry even as its ability to safely deliver
that data degrades.

Under normal conditions, this is invisible. Under failure, it compounds loss.

## Where the community started to converge

As these patterns became clearer, many teams began asking the same question:
what would batching look like if durability were the primary concern?

That question led the community to experiment with moving batching and queueing
closer to where durability actually lives. Instead of buffering telemetry in a
standalone processor,
[exporter-level batching](https://github.com/open-telemetry/opentelemetry-collector/issues/8122)
places data into a sending queue that can be backed by persistent storage. Only
after the data is durably enqueued does the Collector acknowledge it to the
sender.

This shift did not come from a single design proposal or a sudden change in
direction. It emerged gradually, shaped by operator feedback, crash testing, and
repeated attempts to reason about missing telemetry after otherwise routine
restarts.

## How exporter-level batching changes the picture

Relocating batching alters several important aspects of the pipeline.

Telemetry in flight can survive Collector restarts because it is written to disk
rather than held exclusively in memory. Batching decisions also become tightly
coupled to export behavior. When storage fills or a backend slows down, that
pressure can propagate upstream instead of being hidden behind in-memory
buffers.

The delivery semantics shift as well. Pipelines move closer to an
**at-least-once model**. Duplicate data becomes possible, but silent loss
becomes far less common. In practice, most observability backends handle
duplicates more gracefully than missing signals.

## Treating failure as normal, not exceptional

Seen through this lens, the move away from the batch processor is not about
declaring it broken.

It is about acknowledging how production systems actually behave. Restarts,
evictions, and crashes are routine, not edge cases. Community crash-testing has
consistently shown that exporter-level queues retain telemetry across restarts,
while in-memory batch buffers do not. That outcome follows directly from where
data is stored at the moment it is acknowledged.

The recommendation evolved because the assumptions evolved.

## New tradeoffs, clearer boundaries

Exporter-level batching is not a free upgrade. Persistent queues consume disk
space and introduce I/O considerations. Configuration shifts away from tuning
batch sizes and timeouts and toward managing queue limits, retry behavior, and
storage capacity.

Performance characteristics can change as well. Some pipelines benefit from
reduced memory pressure by avoiding intermediate buffers. Others may observe
different latency profiles depending on workload and environment.

What improves is the visibility of failure. Instead of losing data quietly,
systems surface backpressure and resource exhaustion explicitly.

## What this means for the batch processor

The batch processor is not disappearing overnight. In simple or non-critical
pipelines, it may still be a reasonable choice.

For production environments that require durability across restarts and
coordinated backpressure, however, the community no longer considers it the
preferred default. This position reflects accumulated operational experience
rather than a single incident or implementation detail.

## Looking ahead

Batching remains a fundamental optimization in OpenTelemetry. What has changed
is our understanding of where that optimization belongs.

As observability becomes infrastructure, the cost of silent data loss rises. By
moving batching closer to durable storage and export, Collector pipelines become
more predictable and easier to reason about when things go wrong.

For teams revisiting long-standing configurations, this is an opportunity to
re-evaluate defaults that once made sense and align pipelines with the
reliability expectations of modern production systems.
