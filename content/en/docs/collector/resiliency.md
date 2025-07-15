---
title: Resiliency
description: How to configure a resilient OTel Collector pipeline
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
- Handling Endpoint Unavailability: If the endpoint becomes unavailable, for
  example due to network issues or a backend restart, the exporter cannot send
  data immediately. Instead of dropping the data, it adds it to the in-memory
  sending queue.
- Retry Mechanism: The Collector employs a retry mechanism with exponential
  backoff and jitter. It will repeatedly attempt to send the buffered data after
  waiting intervals. By default, it retries for up to 5 minutes.
- Data Loss Scenario:
  - Queue Full: The in-memory queue has a configurable size (default is often
    1000 batches/requests). If the endpoint remains unavailable and new data
    keeps arriving, the queue can fill up. Once the queue is full, incoming data
    is dropped to prevent the Collector from running out of memory.
  - Retry Timeout: If the endpoint remains unavailable for longer than the
    configured maximum retry duration (default 5 minutes), the Collector will
    stop retrying for the oldest data in the queue and drop it.
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

{{% alert title="Tip: Use sending queues for remote exporters" %}} Enable
sending queues for any exporter sending data over a network. Adjust `queue_size`
and `max_elapsed_time` based on expected data volume, available Collector
memory, and acceptable downtime for the endpoint. Monitor queue metrics
(`otelcol_exporter_queue_size`, `otelcol_exporter_queue_capacity`).
{{% /alert %}}

## Persistent storage (write-ahead log - WAL)

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

{{% alert title="Tip: Use WALs for selected Collectors" %}} Use persistent
storage for critical Collectors (like Gateway instances or Agents collecting
crucial data) where data loss due to Collector crashes is unacceptable. Ensure
the chosen directory has sufficient disk space and appropriate permissions.
{{% /alert %}}

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
        # Consider queue/retry for exporting *from* Gateway to Backend

    service:
      pipelines:
        traces:
          receivers: [kafka]
          exporters: [otlp]
    ```

{{% alert title="Tip: Use message queues for critical hops" %}} Use a message
queue for critical data paths requiring high durability, especially across
network boundaries (e.g., between data centers, availability zones, or to a
cloud vendor). This approach leverages the robust, built-in resilience of
systems like Kafka but adds operational complexity and requires expertise in
managing the message queue system. {{% /alert %}}

## Circumstances of data loss

Data loss can occur under these circumstances:

1.  Network Unavailability + Timeout: The downstream endpoint is unavailable for
    longer than the configured `max_elapsed_time` in the `retry_on_failure`
    settings.
2.  Network Unavailability + Queue Overflow: The downstream endpoint is
    unavailable, and the sending queue (in-memory or persistent) fills to
    capacity before the endpoint recovers. New data is dropped.
3.  Collector Crash (No Persistence): The Collector instance crashes or is
    terminated, and it was only using an in-memory sending queue. Data in memory
    is lost.
4.  Persistent Storage Failure: The disk used by the `file_storage` extension
    fails or runs out of space.
5.  Message Queue Failure: The external message queue (like Kafka) experiences
    an outage or data loss event, and the producing collector doesn't have
    adequate local buffering.
6.  Misconfiguration: Exporters or receivers are incorrectly configured,
    preventing data flow.
7.  Disabled Resilience: Sending queues or retry mechanisms are explicitly
    disabled in the configuration.

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
4.  Use Persistent Storage (WAL): For Agents or Gateways where data loss during
    a Collector restart is unacceptable, configure the `file_storage` extension
    for the sending queue.
5.  Consider Message Queues: For maximum durability across network segments or
    to decouple Collector tiers, use a managed message queue like Kafka if the
    operational overhead is acceptable.
6.  Use Appropriate Deployment Patterns:
    - Employ an Agent + Gateway architecture. Agents handle local collection,
      Gateways handle processing, batching, and resilient export.
    - Focus resilience efforts (queues, WAL, Kafka) on network hops: Agent ->
      Gateway and Gateway -> Backend.
    - Resilience between the application (SDK) and a local Agent
      (Sidecar/DaemonSet) is often less critical due to reliable local
      networking; adding queues here can sometimes negatively impact the
      application if the agent is unavailable.

By understanding these mechanisms and applying the appropriate configurations,
you can significantly enhance the resilience of your OpenTelemetry Collector
deployment and minimize data loss.
