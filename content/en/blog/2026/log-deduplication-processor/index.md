---
title: Reducing Log Volume with the OpenTelemetry Log Deduplication Processor
linkTitle: Log Deduplication Processor
date: 2026-01-19
author: '[Juraci Paixao Krohling](https://github.com/jpkrohling) (OllyGarden)'
canonical_url: https://blog.olly.garden/reducing-log-volume-with-the-opentelemetry-log-deduplication-processor
cSpell:ignore: jpkrohling Krohling logdedup logdedupprocessor OllyGarden OTTL Paixao telemetrygen
---

Your logs are probably at least 80% repetitive noise. Connection retries, health
checks, heartbeat messages: the same log line repeated thousands of times per
minute. You pay storage costs for each one while the signal drowns in noise. The
OpenTelemetry Collector's log deduplication processor offers an elegant solution
to this problem.

## The repetitive log problem

Modern distributed systems generate enormous volumes of logs, but much of that
volume provides diminishing returns. Consider a typical microservice that logs
connection errors when a downstream dependency is unavailable. If the service
retries every 100 milliseconds for 30 seconds, that's 300 nearly identical log
entries for a single incident. Each entry consumes storage, network bandwidth,
and processing capacity in your logging backend.

Health check endpoints compound the problem. Kubernetes probes, load balancer
checks, and monitoring systems all generate log entries at regular intervals. A
single service might log thousands of health check responses per hour, none of
which provide meaningful insight beyond "the service was running."

The logdedupprocessor in the OpenTelemetry Collector solves this by aggregating
identical logs over a configurable time window. Instead of forwarding every
duplicate entry, it emits a single log with a count of how many times that
message appeared.

## How log deduplication works

The core concept is straightforward. Logs are considered identical when they
share the same resource attributes, scope, body, attributes, and severity. The
processor computes a hash of these fields and tracks occurrences within a
configurable interval.

When the interval expires, the processor emits a single log entry with three
additional attributes: `log_count` (the number of duplicates),
`first_observed_timestamp`, and `last_observed_timestamp`. You keep full
visibility into frequency patterns without storing every identical entry.

This approach differs from sampling in an important way. Sampling discards data
permanently. Deduplication preserves the information that matters (what
happened, how often, and when) while eliminating redundant storage.

## Practical configuration

Here is a configuration that deduplicates connection errors while preserving
audit logs:

```yaml
processors:
  logdedup:
    interval: 1s
    conditions:
      - severity_number >= SEVERITY_NUMBER_ERROR
      - attributes["log.type"] == "connection"
    exclude_fields:
      - attributes.request_id
      - attributes.timestamp
```

The `conditions` field uses OpenTelemetry Transformation Language (OTTL)
expressions to filter which logs get deduplicated. Logs that do not match pass
through unchanged. In this example, only ERROR-level logs with the
`log.type=connection` attribute are candidates for deduplication.

The `exclude_fields` option removes high-cardinality fields from the comparison.
Fields like request IDs and timestamps differ between entries even when the log
message is semantically identical. By excluding them, logs that differ only in
these volatile fields are treated as duplicates.

## A complete pipeline example

To use the log deduplication processor, include it in your collector pipeline:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  logdedup:
    interval: 1s
    conditions:
      - severity_number >= SEVERITY_NUMBER_ERROR
      - attributes["log.type"] == "connection"
    exclude_fields:
      - attributes.request_id
      - attributes.timestamp

exporters:
  otlp:
    endpoint: your-backend:4317

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [logdedup]
      exporters: [otlp]
```

## Testing with telemetrygen

To test this configuration locally, use telemetrygen to generate connection
error logs:

```bash
telemetrygen logs \
  --otlp-insecure \
  --logs 100 \
  --rate 10 \
  --severity-text ERROR \
  --severity-number 17 \
  --body "Connection refused: failed to connect to database at 10.0.0.5:5432" \
  --telemetry-attributes 'log.type="connection"' \
  --telemetry-attributes 'service.name="order-service"' \
  --telemetry-attributes 'db.system="postgresql"'
```

This generates 100 logs at 10 per second, all with ERROR severity and the
`log.type=connection` attribute that triggers deduplication. After a few
seconds, you should see a few log entries with `log_count: N` in your backend
instead of 100 separate entries.

## Tradeoffs and considerations

The log deduplication processor introduces latency equal to your interval
setting. Logs are held until the interval expires before being forwarded. For
most use cases, a 1-second delay is acceptable, but real-time alerting systems
may need adjustment.

For compliance-critical logs where every occurrence must be preserved with its
original timestamp, skip deduplication entirely. Audit logs, security events,
and regulatory records often require complete fidelity.

The tradeoff is straightforward: reduced storage and clearer signal at the cost
of slight delay and losing individual timestamps. For high-volume repetitive
logs, that tradeoff is usually worth it.

## Conclusion

The log deduplication processor provides a practical solution to the noise
problem in modern logging pipelines. By aggregating identical entries while
preserving frequency information, you can dramatically reduce storage costs and
improve signal clarity without sacrificing observability.

Combined with other OpenTelemetry Collector processors like filtering and
sampling, log deduplication gives you fine-grained control over your telemetry
pipeline. The result is a logging system that captures what matters while
discarding the noise.
