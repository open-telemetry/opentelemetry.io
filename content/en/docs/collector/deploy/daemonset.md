---
title: DaemonSet resilience
linkTitle: DaemonSet resilience
description:
  Recommendations for running a resilient OpenTelemetry Collector as a
  Kubernetes DaemonSet
weight: 250
cSpell:ignore: maxUnavailable OOMKill OOMKilled
---

Running the OpenTelemetry Collector as a Kubernetes
[DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)
is one of the most common deployment patterns. A DaemonSet ensures one Collector
pod runs on each node, collecting telemetry from all workloads on that node.

While this pattern is straightforward to set up, it introduces specific failure
modes that can lead to data loss or cascading failures during traffic spikes,
node pressure, or rolling updates. This page describes those failure modes and
provides recommendations for building a resilient DaemonSet deployment.

## How DaemonSet deployments fail

### OOMKill cascades

When a traffic spike causes the Collector pod to exceed its memory limit,
Kubernetes terminates it with an OOMKill. The pod restarts, but any data
buffered in memory is lost. Meanwhile, telemetry from applications on that node
accumulates. When the restarted Collector begins processing the backlog, it
might immediately exceed its memory limit again, creating a crash loop.

The `memory_limiter` processor can help prevent this, but it is not bulletproof:
incoming data must be deserialized and converted into the Collector's internal
data model before the memory limiter can reject it. A sudden spike that arrives
between memory checks can push memory usage past the limit before the processor
has a chance to act.

### Node-scoped blast radius

Because a DaemonSet runs exactly one Collector per node, a single Collector
failure affects **all** workloads on that node. Unlike the sidecar pattern,
where a failure only impacts one application, a DaemonSet failure creates a
node-wide telemetry gap.

### Noisy neighbors

A single application that suddenly emits a large volume of telemetry can consume
the Collector's resources on that node, starving other applications. The
Collector does not currently enforce fairness across clients of a receiver, so
one chatty producer can degrade telemetry collection for all others on the same
node. There is also no built-in per-client rate limiting; the Collector expects
an external load balancer to handle rate limiting when needed.

### Limited back-pressure in async pipelines

When the Collector is overwhelmed, it responds to clients with errors (gRPC
Unavailable or HTTP 503). However, in the typical configuration with batch
processing or an exporting queue enabled, back-pressure signals from the export
destination do not propagate back to the sending applications. This means
applications continue sending telemetry at full rate even when the Collector
cannot keep up with exporting, which accelerates queue fill-up and data loss.

### Rolling update gaps

During a rolling update of the DaemonSet, the old Collector pod terminates
before the new pod is ready. Any telemetry generated during this transition
window is lost unless applications buffer locally or retry.

## Resource management

### Set appropriate resource requests and limits

Configure resource requests and limits to prevent the Collector from being
evicted under node pressure while leaving enough headroom for traffic spikes:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: otel-collector
spec:
  template:
    spec:
      containers:
        - name: collector
          resources:
            requests:
              memory: 256Mi
              cpu: 200m
            limits:
              memory: 512Mi
              cpu: 500m
```

Choose memory limits based on your observed peak memory usage plus a buffer.
Monitor actual consumption before tuning these values.

### Use the memory limiter processor

The
[memory limiter processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)
acts as a safety valve, rejecting incoming data before the Collector reaches its
memory limit and gets OOMKilled. Place it as the **first** processor in every
pipeline:

```yaml
processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 400 # Below the container memory limit (512Mi)
    spike_limit_mib: 80
```

Set `limit_mib` to roughly 80% of your container memory limit, leaving room for
memory that the Go runtime and other components allocate outside the pipeline.

Additionally, set the `GOMEMLIMIT` environment variable to match the available
memory. This helps the Go garbage collector make better decisions about when to
reclaim memory, reducing the chance of OOMKills:

```yaml
env:
  - name: GOMEMLIMIT
    value: '400MiB' # Match or slightly below the memory_limiter limit
```

> [!TIP] Monitor `otelcol_processor_refused_spans` (and the metrics/logs
> equivalents). A sustained increase indicates the Collector is under pressure
> and you should either scale resources or reduce incoming traffic.

### Balance memory between queues and processing

The Collector's memory budget is shared between processing headroom and queue
buffering. Larger queues improve resilience during backend outages but leave
less room for processing spikes. Getting this balance right requires nontrivial
calculations: you need to account for the memory used by the Go runtime, the
deserialized data in flight, the batch processor buffer, and the sending queue.

As a starting point:

- Reserve at least 20% of the memory limit for the Go runtime and overhead
- Allocate memory for the `memory_limiter` limit (the safety boundary)
- Size the sending queue so that its maximum memory footprint fits within the
  remaining budget
- Monitor memory consumption under both normal and degraded conditions and
  adjust

## Resilience configuration

### Enable persistent queues

By default, the sending queue buffers data in memory. If the Collector pod
restarts, all queued data is lost. Enable
[persistent storage](/docs/collector/resiliency/#persistent-storage-write-ahead-log---wal)
so the queue survives pod restarts:

```yaml
extensions:
  file_storage:
    directory: /var/lib/otelcol/storage

exporters:
  otlp:
    endpoint: backend.example.com:4317
    sending_queue:
      storage: file_storage
      queue_size: 5000
    retry_on_failure:
      max_elapsed_time: 10m

service:
  extensions: [file_storage]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]
```

Mount a persistent volume or use the node's local storage for the WAL directory.
When using local storage (such as `emptyDir` or `hostPath`), be aware that data
does not survive node failures.

> [!WARNING] If a bug in the Collector causes data in the persistent queue to
> trigger a crash on replay, the Collector will enter a crash loop. Monitor for
> `CrashLoopBackOff` and have a plan to clear the WAL directory if needed. See
> [opentelemetry-collector#12095](https://github.com/open-telemetry/opentelemetry-collector/issues/12095)
> for more details.

### Size sending queues for your workload

The default queue size (1000 batches) might be too small for nodes with many
workloads or too large for memory-constrained environments. Tune `queue_size`
based on:

- Expected telemetry volume per node
- Acceptable backend downtime (how long you want to buffer)
- Available memory or disk for the queue

See [Resiliency](/docs/collector/resiliency/) for a deeper discussion of queue
sizing and data loss scenarios.

## Update strategies

### Prevent gaps during rolling updates

By default, Kubernetes DaemonSet rolling updates terminate the old pod before
starting the new one, creating a window where no Collector runs on that node.
Minimize this gap:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: otel-collector
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
```

Setting `maxUnavailable: 0` with `maxSurge: 1` ensures the new pod starts before
the old one terminates. This requires Kubernetes 1.22+ and sufficient node
resources to run two Collector pods simultaneously during the update.

> [!NOTE] `maxSurge` for DaemonSets is available since Kubernetes 1.22 as a
> stable feature. If you're on an older version, `maxUnavailable: 1` (the
> default) is unavoidable, and you should rely on persistent queues to minimize
> data loss during updates.

### Configure graceful shutdown

Give the Collector enough time to drain in-flight data before termination.
Increase the pod's `terminationGracePeriodSeconds` beyond the default 30 seconds
if your pipelines process large batches or export to slow backends:

```yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: collector
          # ...
```

The Collector will attempt to flush all pipeline data during the shutdown
window. If the grace period is too short, data still in the pipeline is lost.

## Monitoring and early warning

Monitor these Collector metrics to detect problems before they become
catastrophic:

| Metric                                  | What it tells you                                            |
| --------------------------------------- | ------------------------------------------------------------ |
| `otelcol_processor_refused_spans`       | Memory limiter is rejecting data; Collector under pressure   |
| `otelcol_exporter_queue_size`           | Current queue depth; rising trend indicates backend slowdown |
| `otelcol_exporter_queue_capacity`       | Maximum queue size; compare with queue_size for headroom     |
| `otelcol_exporter_send_failed_spans`    | Permanent export failures; backend may be unhealthy          |
| `otelcol_exporter_enqueue_failed_spans` | Queue is full; data is being dropped                         |
| Container memory usage                  | Approaching the limit means OOMKill risk                     |

Set alerts on:

- `otelcol_processor_refused_spans` > 0 sustained for more than 5 minutes
- `otelcol_exporter_queue_size` > 70% of `otelcol_exporter_queue_capacity`
- Container memory > 80% of limit
- Pod restart count increasing

See [Scaling the Collector](/docs/collector/scaling/) for guidance on when
metrics indicate you should scale up resources or the pipeline architecture.

## When to consider alternatives

A DaemonSet is not always the best choice. Consider these alternatives when:

- **Isolation is critical**: Use the
  [sidecar pattern](/docs/collector/scaling/#scaling-stateless-collectors-and-using-load-balancers)
  when you need per-application isolation, so that one application's telemetry
  spike cannot affect another.
- **Processing is heavy**: Offload processors like `batch`, `tail_sampling`, or
  `transform` to a [Gateway tier](/docs/collector/deploy/gateway/) and keep the
  DaemonSet Collector lightweight (receive + forward only).
- **High pod-to-node ratio**: When you have many small pods per node, a
  DaemonSet works well. When you have few large pods, a sidecar avoids the blast
  radius problem.
- **gRPC load balancing**: DaemonSet Collectors behind a Kubernetes Service
  don't distribute gRPC connections evenly. Use a service mesh or sidecar
  pattern for balanced gRPC distribution.

See [Deployment patterns](/docs/collector/deploy/) for a comparison of all
available options.
