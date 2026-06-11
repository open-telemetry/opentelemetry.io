---
title: Resiliency
description: How to configure a resilient OTel Collector pipeline
cSpell:ignore: maxUnavailable OOMKill OOMKilled
---

The OpenTelemetry Collector is designed with components and configurations to
minimize data loss during telemetry processing and exporting. However,
understanding the potential scenarios where data loss can occur and how to
mitigate them is crucial for a resilient observability pipeline.

## Understanding Collector resilience

A resilient Collector maintains telemetry data flow and processing capabilities
even when facing adverse conditions, ensuring the overall observability pipeline
remains functional.

The Collector's resilience primarily revolves around how it handles data when
the configured endpoint (the destination for traces, metrics, or logs) becomes
unavailable or when the Collector instance itself experiences issues like
crashes.

## Sending queue (in-memory buffering)

The most basic form of resilience built into the Collector's exporters is the
sending queue.

- How it works: When an exporter is configured, it usually includes a sending
  queue that buffers data in memory before sending it to the downstream
  endpoint. If the endpoint is available, data passes through quickly.
- Handling endpoint unavailability: If the endpoint becomes unavailable, for
  example due to network issues or a backend restart, the exporter cannot send
  data immediately. Instead of dropping the data, it adds it to the in-memory
  sending queue.
- Retry mechanism: The Collector employs a retry mechanism with exponential
  backoff and jitter. It will repeatedly attempt to send the buffered data after
  waiting intervals. By default, it retries for up to 5 minutes.
- Data loss scenario:
  - Queue Full: The in-memory queue has a configurable size (default is often
    1000 batches/requests). If the endpoint remains unavailable and new data
    keeps arriving, the queue can fill up. Once the queue is full, incoming data
    is dropped to prevent the Collector from running out of memory.
  - Retry Timeout: If the endpoint remains unavailable for longer than the
    configured maximum retry duration (default 5 minutes), the Collector will
    stop retrying for the oldest data in the queue and drop it.
- Sizing the queue: The default queue size (1000 batches) might be too small for
  high-throughput Collectors or too large for memory-constrained environments.
  Tune `queue_size` based on:
  - Expected telemetry volume
  - Acceptable backend downtime (how long you want to buffer)
  - Available memory or disk for the queue
- Configuration: You can configure the queue size and retry behavior within the
  exporter settings:

  ```yaml
  exporters:
    otlp:
      endpoint: otlp.example.com:4317
      sending_queue:
        storage: file_storage
        queue_size: 5_000 # Increase queue size (default 1000)
      retry_on_failure:
        initial_interval: 5s
        max_interval: 30s
        max_elapsed_time: 10m # Increase max retry time (default 300s)
  ```

> [!TIP] Tip: Use sending queues for remote exporters
>
> Enable sending queues for any exporter sending data over a network, and
> monitor queue metrics (`otelcol_exporter_queue_size`,
> `otelcol_exporter_queue_capacity`) to confirm there's headroom for your
> traffic patterns.

## Persistent storage (write-ahead log - WAL) {#persistent-storage-write-ahead-log-wal}

To protect against data loss if the Collector instance itself crashes or
restarts, you can enable persistent storage for the sending queue using the
`file_storage` extension.

- How it works: Instead of just buffering in memory, the sending queue writes
  data to a Write-Ahead Log (WAL) on disk before attempting to export it.
- Handling Collector Crashes: If the Collector crashes while data is in its
  queue, the data is persisted on disk. When the Collector restarts, it reads
  the data from the WAL and resumes attempts to send it to the endpoint.
- Data Loss Scenario: Data loss can still occur if the disk fails or runs out of
  space, or if the endpoint remains unavailable beyond the retry limits even
  after the Collector restarts. Guarantees might not be as strong as dedicated
  message queues.
- Configuration:
  1.  Define the `file_storage` extension.
  2.  Reference the storage ID in the exporter's `sending_queue` configuration.

  ```yaml
  extensions:
    file_storage: # Define the extension instance
      directory: /var/lib/otelcol/storage # Choose a persistent directory

  exporters:
    otlp:
      endpoint: otlp.example.com:4317
      sending_queue:
        storage: file_storage # Reference the storage extension instance

  service:
    extensions: [file_storage] # Enable the extension in the service pipeline
    pipelines:
      traces:
        receivers: [otlp]
        exporters: [otlp]
  ```

> [!TIP] Tip: Use WALs for selected Collectors
>
> Use persistent storage for critical Collectors (like Gateway instances or
> Agents collecting crucial data) where data loss due to Collector crashes is
> unacceptable. Ensure the chosen directory has sufficient disk space and
> appropriate permissions.

If the persistent directory uses ephemeral node storage (such as `emptyDir` or
`hostPath`), the WAL does not survive node failures. Mount a persistent volume
when you need durability across node loss.

> [!WARNING]
>
> If a bug in the Collector causes data in the persistent queue to trigger a
> crash on replay, the Collector will enter a crash loop. Monitor for
> `CrashLoopBackOff` and have a plan to clear the WAL directory if needed. See
> [opentelemetry-collector#12095](https://github.com/open-telemetry/opentelemetry-collector/issues/12095)
> for more details.

## Message queues

For the highest level of resilience, especially between different Collector
tiers (like Agent to Gateway) or between your infrastructure and a vendor
backend, you can introduce a dedicated message queue like Kafka.

- How it works: One Collector instance (Agent) exports data to a Kafka topic
  using the Kafka exporter. Another Collector instance (Gateway) consumes data
  from that Kafka topic using the Kafka receiver.
- Handling Endpoint/Collector Unavailability:
  - If the consuming Collector (Gateway) is down, messages simply accumulate in
    the Kafka topic (up to Kafka's retention limits). The producing Collector
    (Agent) is unaffected as long as Kafka is up.
  - If the producing Collector (Agent) is down, no new data enters the queue,
    but the consumer can continue processing existing messages.
  - If Kafka itself is down, the producing Collector needs its own resilience
    mechanism (like a sending queue, potentially with WAL) to buffer data
    destined for Kafka.
- Data Loss Scenario: Data loss is primarily tied to Kafka itself (cluster
  failure, topic misconfiguration, data expiration) or failure of the producer
  to send to Kafka without adequate local buffering.
- Configuration:
  - _Agent Collector Config (Producer):_

    ```yaml
    exporters:
      kafka:
        brokers: ['kafka-broker1:9092', 'kafka-broker2:9092']
        topic: otlp_traces

    receivers:
      otlp:
        protocols:
          grpc:

    service:
      pipelines:
        traces:
          receivers: [otlp]
          exporters: [kafka]
    ```

  - _Gateway Collector Config (Consumer):_

    ```yaml
    receivers:
      kafka:
        brokers: ['kafka-broker1:9092', 'kafka-broker2:9092']
        topic: otlp_traces
        initial_offset: earliest # Process backlog

    exporters:
      otlp:
        endpoint: otlp.example.com:4317
        # Consider queue/retry for exporting *from* gateway to backend

    service:
      pipelines:
        traces:
          receivers: [kafka]
          exporters: [otlp]
    ```

> [!TIP] Tip: Use message queues for critical hops
>
> Use a message queue for critical data paths requiring high durability,
> especially across network boundaries (e.g., between data centers, availability
> zones, or to a cloud vendor). This approach leverages the robust, built-in
> resilience of systems like Kafka but adds operational complexity and requires
> expertise in managing the message queue system.

## High loads

Traffic spikes and resource pressure can overwhelm the Collector even when
backend endpoints are healthy. The following failure modes are common in
high-load deployments.

### OOMKill cascades

A traffic spike can push the Collector past its memory limit. The runtime then
kills the process — on Kubernetes as an `OOMKilled` pod, on a plain Linux host
by the kernel OOM killer. The supervisor restarts the Collector, but any
in-memory data is lost. If upstream senders keep emitting telemetry, the backlog
can exceed the limit again on restart, creating a crash loop.

The `memory_limiter` processor can help prevent this, but it is not bulletproof:
incoming data must be deserialized and converted into the Collector's internal
data model before the memory limiter can reject it. A sudden spike that arrives
between memory checks can push memory usage past the limit before the processor
has a chance to act.

### Limited back-pressure in async pipelines

In the typical configuration with an exporting queue enabled, back-pressure
signals from the export destination do not propagate back to the sending
applications. Applications continue sending telemetry at full rate even when the
destination cannot keep up with the received data.

If the Collector itself is the bottleneck — for example, the sending queue fills
up or an upstream `memory_limiter` processor rejects data — it responds to
clients with errors (gRPC Unavailable or HTTP 503) that should propagate back to
the sender. The exception is when the pipeline contains asynchronous processors,
such as the `batch` processor, which can swallow those errors.

## Resource management

Proper resource allocation is the first line of defense against overload.
Configure CPU and memory limits, use the memory limiter processor, and plan your
memory budget to leave headroom for traffic spikes.

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

> [!TIP]
>
> The `memory_limiter` processor propagates errors back to the receiver. Monitor
> `otelcol_receiver_refused_spans` (and the metrics/logs equivalents) for a
> sustained increase, which indicates the Collector is under pressure and you
> should either scale resources or reduce incoming traffic. See
> [Internal telemetry](/docs/collector/internal-telemetry/) for more information
> on the Collector's own telemetry.

### Balance memory between queues and processing

The Collector's memory budget is shared between processing headroom and queue
buffering. Larger queues improve resilience during backend outages but leave
less room for processing spikes. Getting this balance right requires nontrivial
calculations: you need to account for the memory used by the Go runtime, the
deserialized data in flight, and the sending queue (including its batch buffer).

As a starting point:

- Reserve at least 20% of the memory limit for the Go runtime and overhead
- Allocate memory for the `memory_limiter` limit (the safety boundary)
- Size the sending queue so that its maximum memory footprint fits within the
  remaining budget
- Monitor memory consumption under both normal and degraded conditions and
  adjust

## Update strategies

Kubernetes pod restarts and rolling updates can create windows where telemetry
is lost. The DaemonSet-based examples below show how to minimize these gaps;
adapt them for deployments as needed.

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

> [!NOTE]
>
> `maxSurge` for DaemonSets is available since Kubernetes 1.22 as a stable
> feature. If you're on an older version, `maxUnavailable: 1` (the default) is
> unavoidable, and you should rely on persistent queues to minimize data loss
> during updates.

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

Monitor these
[Collector metrics](/docs/collector/internal-telemetry/#lists-of-internal-metrics)
to detect problems before they become catastrophic:

| Metric                                  | What it tells you                                            |
| --------------------------------------- | ------------------------------------------------------------ |
| `otelcol_receiver_refused_spans`        | Pipeline refused incoming data; Collector under pressure     |
| `otelcol_exporter_queue_size`           | Current queue depth; rising trend indicates backend slowdown |
| `otelcol_exporter_queue_capacity`       | Maximum queue size; compare with queue_size for headroom     |
| `otelcol_exporter_send_failed_spans`    | Permanent export failures; backend may be unhealthy          |
| `otelcol_exporter_enqueue_failed_spans` | Queue is full; data is being dropped                         |
| Container memory usage                  | Approaching the limit means OOMKill risk                     |

Set alerts on:

- `otelcol_receiver_refused_spans` > 0 sustained for more than 5 minutes
- `otelcol_exporter_queue_size` > 70% of `otelcol_exporter_queue_capacity`
- Container memory > 80% of limit
- Pod restart count increasing

See [Scaling the Collector](/docs/collector/scaling/) for guidance on when
metrics indicate you should scale up resources or the pipeline architecture.

## Circumstances of data loss

Data loss can occur under these circumstances:

1.  Network Unavailability + Timeout: The downstream endpoint is unavailable for
    longer than the configured `max_elapsed_time` in the `retry_on_failure`
    settings.
2.  Network Unavailability + Queue Overflow: The downstream endpoint is
    unavailable, and the sending queue (in-memory or persistent) fills to
    capacity before the endpoint recovers. New data is dropped.
3.  Collector Crash or Termination (No Persistence): The Collector instance
    crashes or is terminated — for example, killed by the runtime when a traffic
    spike exceeds its memory limit. If only an in-memory sending queue is in
    use, buffered data is lost.
4.  Persistent Storage Failure: The disk used by the `file_storage` extension
    fails or runs out of space.
5.  Message Queue Failure: The external message queue (like Kafka) experiences
    an outage or data loss event, and the producing collector doesn't have
    adequate local buffering.
6.  Misconfiguration: Exporters or receivers are incorrectly configured,
    preventing data flow.
7.  Disabled Resilience: Sending queues or retry mechanisms are explicitly
    disabled in the configuration.
8.  Pod Restart or Rolling Update Gaps: During a pod restart, graceful shutdown
    timeout, or rolling update, telemetry arriving before the replacement is
    ready to accept traffic can be dropped unless applications buffer or retry
    locally.

## Recommendations for preventing data loss

Follow these recommendations to minimize data loss and ensure reliable telemetry
data collection:

1.  Always Use Sending Queues: Enable `sending_queue` for exporters sending data
    over the network.
2.  Monitor Collector Metrics: Actively monitor `otelcol_exporter_queue_size`,
    `otelcol_exporter_queue_capacity`, `otelcol_exporter_send_failed_spans` (and
    equivalents for metrics/logs) to detect potential issues early.
3.  Tune Queue Size & Retries: Adjust `queue_size` and `retry_on_failure`
    parameters based on your expected load, memory/disk resources, and
    acceptable endpoint downtime.
4.  Use Persistent Storage (WAL): For agents or gateways where data loss during
    a Collector restart is unacceptable, configure the `file_storage` extension
    for the sending queue.
5.  Consider Message Queues: For maximum durability across network segments or
    to decouple Collector tiers, use a managed message queue like Kafka if the
    operational overhead is acceptable.
6.  Use Appropriate Deployment Patterns:
    - Employ an
      [agent-to-gateway architecture](/docs/collector/deploy/other/agent-to-gateway/).
      Agents handle local collection, gateways handle processing, batching, and
      resilient export.
    - Focus resilience efforts (queues, WAL, Kafka) on network hops: Agent ->
      Gateway and Gateway -> Backend.
    - Resilience between the application (SDK) and a local Agent
      (Sidecar/DaemonSet) is often less critical due to reliable local
      networking; adding queues here can sometimes negatively impact the
      application if the agent is unavailable.
7.  Provision Resources for Traffic Spikes: Set a memory limit at the runtime or
    orchestrator level (for example, Kubernetes resource requests and limits),
    add the `memory_limiter` processor as the first processor in every pipeline,
    and configure `GOMEMLIMIT` to match the available memory so the Go runtime
    can reclaim memory before the process is killed.
8.  Minimize Update Gaps: Configure rolling updates so a replacement instance is
    ready before the previous one terminates (for example, with Kubernetes
    DaemonSet `maxSurge: 1` and `maxUnavailable: 0`), and increase the shutdown
    grace period (such as Kubernetes `terminationGracePeriodSeconds`) so the
    Collector has time to drain in-flight data.

By understanding these mechanisms and applying the appropriate configurations,
you can significantly enhance the resilience of your OpenTelemetry Collector
deployment and minimize data loss.
