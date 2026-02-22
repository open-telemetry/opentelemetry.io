---
title: Sunset of the OpenTelemetry Batch Processor
linkTitle: Sunset of the Batch Processor
date: 2026-02-01
author: '[Julia Furst Morgado](https://github.com/juliafmorgado) (Dash0)'
cSpell:ignore: backpressure juliafmorgado
---

The batch processor has been a standard component in Collector pipelines. It 
reduces request overhead, improves exporter efficiency, and smooths bursty 
telemetry traffic. 

However, it has a critical flaw: when a Collector restarts, telemetry sitting 
in the batch processor's in-memory buffer is lost. As deployments scaled and 
restarts became more frequent, this silent data loss became a significant problem.

Batching still matters, but the batch processor doesn't take the best approach.
We have therefore made the decision to
[**sunset the batch processor**](https://github.com/open-telemetry/opentelemetry-collector/issues/13766).

This post explains why and what to use instead.

## The problem: silent data loss

Some of the hardest observability failures are the ones that leave no obvious
trace of failure. There is no “service down” alert and no spike in error rates.

When a Collector restarts during a rolling deployment, or a
Kubernetes node drain moves pods to a new host, applications receive
successful acknowledgments, but data in the batch processor's in-memory buffer is lost.

The problem only surfaces later. During an incident review or a weekly report,
someone notices the gap. Traces that stop abruptly and resume minutes later. Logs that
have a silent window. Metrics that look thinner than expected for a short period of
time.

### How this happens

In the classic pipeline, the batch processor sits between receivers and exporters,
accumulating telemetry in memory until a batch is ready to be flushed. As soon
as data enters the pipeline, the receiver acknowledges it to the sender. From
the application's point of view, delivery succeeded.

**But the data only exists in memory until the exporter sends it.**

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

If the Collector is terminated before export, the data is lost. The sender will
not retry because it already received a successful response.

This behavior reflects an **at-most-once delivery model**. When batching relies on in-memory
buffers, restarts introduce blind spots that are easy to overlook
and difficult to diagnose after the fact.

### The backpressure problem

There's a second issue. Because the batch processor operates independently, 
exporter state is only weakly reflected upstream. When a backend slows down or 
retries increase, the pipeline does not immediately communicate that pressure 
to receivers. The Collector continues accepting telemetry even as its ability 
to safely deliver that data degrades.

Under normal conditions, this is invisible. Under failure, it compounds loss.

## The solution: exporter-level batching

To address these issues, the Collector SIG moved batching closer 
to where durability actually lives. Instead of buffering telemetry in a 
standalone processor, 
[exporter-level batching](https://github.com/open-telemetry/opentelemetry-collector/issues/8122) 
places data into a sending queue that can be backed by persistent storage. 
Only after the data is durably enqueued does the Collector acknowledge it 
to the sender.

This approach emerged from operator feedback, crash testing, and analysis 
of telemetry loss.

### What changes

Telemetry in flight can survive Collector restarts because it is written to disk
rather than held exclusively in memory. Batching decisions also become tightly
coupled to export behavior. When storage fills or a backend slows down, that
pressure can propagate upstream instead of being hidden behind in-memory
buffers.

The delivery semantics shift as well. Pipelines move closer to an
**at-least-once model**. Duplicate data becomes possible, but silent loss
becomes far less common. In practice, observability backends handle
duplicates more gracefully than missing signals.

Crash testing has consistently shown that exporter-level queues retain telemetry 
across restarts, while in-memory batch buffers do not. That outcome follows 
directly from where data is stored at the moment it is acknowledged.

## Tradeoffs

Exporter-level batching is not a free upgrade. Persistent queues consume disk
space and introduce I/O considerations. Configuration shifts away from tuning
batch sizes and timeouts and toward managing queue limits, retry behavior, and
storage capacity.

Performance characteristics change. Some pipelines benefit from
reduced memory pressure by avoiding intermediate buffers. Others may observe
different latency profiles depending on workload and environment.

What improves is the visibility of failure. Instead of losing data quietly,
systems surface backpressure and resource exhaustion explicitly.

## Migration path

The batch processor is not disappearing overnight, but for production pipelines 
that require durability across restarts and coordinated backpressure, we 
recommend migrating to exporter-level batching. For non-production or testing 
environments where data loss is acceptable, the batch processor will continue 
to work.
