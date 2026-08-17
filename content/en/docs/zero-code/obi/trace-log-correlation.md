---
title: Trace-log correlation
linkTitle: Trace-log correlation
weight: 35
description:
  Learn how OBI correlates application logs with distributed traces for faster
  debugging and troubleshooting.
cSpell:ignore: BPFFS NUL PYTHONUNBUFFERED ringbuffer
---

OpenTelemetry eBPF Instrumentation (OBI) correlates application logs with
distributed traces by enriching JSON and plain-text logs with trace context. OBI
does not export logs; it writes enriched logs back to the same stream while
traces are exported via OTLP.

## Overview

Trace-log correlation connects two complementary observability signals:

- **Traces**: Show the flow of requests across services with timing and
  structure
- **Logs**: Provide detailed event information and application state

With OBI trace-log correlation, logs from instrumented processes are
automatically enriched with trace context:

- **Trace ID**: Links a log entry to the distributed trace
- **Span ID**: Links a log entry to a specific trace span

This enables your observability backend to correlate logs with their originating
traces without any code changes to your application.

## How it works

OBI uses eBPF to inject trace context into application logs at the kernel level:

1. **Trace capturing**: OBI captures trace context (trace ID and span ID) for
   all traced operations
2. **Log interception**: OBI intercepts write syscalls to capture application
   logs
3. **Context injection**: OBI injects `trace_id` and `span_id` fields into JSON
   objects or adds configurable `key=value` fields to selected plain-text lines
4. **Trace export**: Logs keep flowing through your existing logging pipeline
5. **Backend linking**: Your observability backend links logs to traces using
   these IDs

### Technical approach

OBI performs correlation at the kernel level without modifying application
binaries:

- Uses kernel eBPF probes to intercept write operations
- Maintains file descriptor caching for performance
- Works with logging frameworks that write JSON or plain text

OBI preserves configured trace and span fields that already exist. JSON keys are
matched literally; in plain text, OBI recognizes `name=value` tokens at the
start of a line or after whitespace. For a service detected as exporting
OpenTelemetry traces directly, OBI injects only `trace_id`: its eBPF-generated
span ID would not identify the SDK span.

## Configuration

Trace-log correlation is enabled when trace export is configured and log
enrichment is enabled for selected services.

### Basic configuration

```yaml
# Enable trace export
otel_traces_export:
  endpoint: http://otel-collector:4318/v1/traces

# Select services to instrument
discovery:
  instrument:
    - open_ports: '8380'

# Enable log enrichment for the same services
ebpf:
  log_enricher:
    services:
      - service:
          - open_ports: '8380'
```

Log enrichment behavior can be further configured under `ebpf.log_enricher`:

- `cache_ttl`: time-to-live for cached file descriptors
- `cache_size`: maximum number of cached file descriptors
- `async_writer_workers`: number of async writer shards
- `async_writer_channel_len`: queue size per shard
- `field_names`: field names used to recognize and inject trace and span IDs
- `plain_text.enabled`: whether to annotate non-JSON logs; defaults to `true`
- `plain_text.placement`: add fields as a `prefix` or `suffix`
- `plain_text.multiline`: annotate the `first_line`, `last_line`, or `each_line`
  in each intercepted write

For example:

```yaml
ebpf:
  log_enricher:
    field_names:
      trace_id: trace_id
      span_id: span_id
    plain_text:
      enabled: true
      placement: suffix
      multiline: first_line
```

Plain-text enrichment is enabled by default for selected services in v0.11.0.
Set `plain_text.enabled: false` before upgrading if non-JSON writes must retain
the earlier pass-through behavior. Field names apply to JSON and plain-text
output and must be nonempty, distinct, and contain no whitespace, `=`, or
control characters.

In Config v2, log trace annotation is available only in standalone OBI and is
disabled by default. Enable and configure it under
`extensions.obi.correlation.log_trace_annotation`:

```yaml
extensions:
  obi:
    correlation:
      log_trace_annotation:
        enabled: true
        field_names:
          trace_id: trace_id
          span_id: span_id
        plain_text:
          enabled: true
          placement: suffix
          multiline: first_line
```

Config v2 capture selection determines which workloads are eligible for log
annotation. The `log_trace_annotation.filter` field is reserved in v0.11.0 and
must remain empty.

### Enabling correlation per service

OBI enriches JSON and plain-text logs for services listed under
`ebpf.log_enricher.services`. Keep service selectors aligned with
`discovery.instrument` so enrichment tracks the same processes.

## Requirements

### 1. Supported log format

For JSON-formatted logs, OBI injects `trace_id` and `span_id` fields into JSON
objects:

**Before OBI**:

```json
{ "level": "info", "message": "Request processed", "duration_ms": 125 }
```

**After OBI enrichment**:

```json
{
  "level": "info",
  "message": "Request processed",
  "duration_ms": 125,
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7"
}
```

For plain-text logs, OBI adds lowercase, fixed-width IDs as space-separated
`key=value` fields. Placement and multiline selection are configurable:

```text
request processed trace_id=4bf92f3577b34da6a3ce929d0e0e4736 span_id=00f067aa0ba902b7
```

Newline-delimited JSON is handled as structured JSON. OBI enriches each object
record independently and doesn't apply plain-text annotation to valid NDJSON.
Multiline selection operates on nonempty physical lines in one intercepted
write; OBI doesn't reconstruct logical events across separate writes.

#### Runtime buffering limitations

The log enricher only sees trace context when the log write happens on the
request-handling thread. Runtimes that buffer stdout asynchronously can break
this assumption.

- Python in Docker commonly needs `PYTHONUNBUFFERED=1`
- .NET `Console.Out` is buffered by default when stdout is a pipe; use a
  `StreamWriter` with `AutoFlush = true`
- ASP.NET Core's default `Microsoft.Extensions.Logging.AddConsole()` pipeline is
  not compatible because it writes from a background thread
- Java virtual-thread logs aren't enriched because a carrier kernel thread can
  execute work from multiple virtual threads; platform-thread enrichment is
  unaffected

### 2. Trace export and log enrichment enabled

Traces must be exported and log enrichment enabled:

```yaml
otel_traces_export:
  endpoint: http://collector:4318/v1/traces # Required

ebpf:
  log_enricher:
    services:
      - service:
          - open_ports: '8380' # Required
```

### 3. Linux kernel

Trace-log correlation requires Linux with specific kernel features:

- **Linux kernel 6.0+** (required for trace-log correlation)
- Supported architectures: x86_64, ARM64
- **BPFFS mount**: The kernel must have BPF filesystem mounted at `/sys/fs/bpf`
- **Non-security-locked-down kernel**: Requires a kernel that is not running in
  security lockdown mode (typical for most production distributions)

### 4. Framework that emits supported logs

Applications can use a logging framework configured to output JSON or plain
text. The following JSON examples produce structured fields:

{{< tabpane text=true persist=lang >}} {{% tab header="Python" lang=python %}}

```python
import json
import logging

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
        }
        return json.dumps(log_entry)

logger = logging.getLogger()
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

{{% /tab %}} {{% tab header="Go (using zap)" lang=go %}}

```go
import "go.uber.org/zap"

logger, _ := zap.NewProduction() // Outputs JSON by default
defer logger.Sync()
logger.Info("Request processed", zap.Duration("duration", 125*time.Millisecond))
```

{{% /tab %}} {{% tab header="Java (using Logback)" lang=java %}}

```xml
<appender name="FILE" class="ch.qos.logback.core.ConsoleAppender">
  <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
</appender>
```

{{% /tab %}} {{% tab header="Node.js (using pino)" lang=javascript %}}

```javascript
const pino = require('pino');
const logger = pino();
logger.info({ duration_ms: 125 }, 'Request processed');
```

{{% /tab %}} {{< /tabpane >}}

### 5. Log shipping pipeline

OBI enriches logs in-place. Use your existing log forwarder or collector to ship
logs to your backend.

When OBI suppresses the original line, container log files contain a line of NUL
bytes in its place. For writes up to 8 KiB, filter these placeholder lines
downstream with `^[\x00\s]*$`. For example, with the OpenTelemetry Collector
`filelog` receiver:

```yaml
receivers:
  filelog:
    include:
      - /var/log/pods/*/*/*.log
    start_at: end
    operators:
      - type: container
      - type: filter
        expr: 'body matches "^[\\x00\\s]*$"'
```

CRI and Docker JSON log envelopes encode NUL as `\u0000`; the `container`
operator decodes the body before the filter runs.

## Performance considerations

- **Minimal overhead**: Correlation uses eBPF kernel probes with efficient file
  descriptor caching
- **Cache limits**: File descriptor cache has size and TTL limits to prevent
  unbounded memory usage
- **Async processing**: Log enrichment uses asynchronous workers to avoid
  overflowing the kernel ringbuffer

## Known limitations

- **Per-write multiline selection**: OBI doesn't reconstruct logical multiline
  events across separate writes
- **File descriptor cache**: Cached for performance, with configurable TTL
  (default: 30 minutes)
- **Span-aligned only**: Logs enriched only while a span is active; logs outside
  span scope are not enriched.
- **8 KiB per-write limit**: OBI enriches and suppresses at most the first 8 KiB
  of a single `write()` or `writev()`. Any remaining bytes pass through
  un-enriched and don't match the placeholder-line filter.
- **Java virtual threads**: Logs written from virtual threads aren't enriched.

## Troubleshooting

### Trace context not appearing in logs

1. **Verify the configured format**: For JSON logs, ensure the application
   outputs valid JSON. For plain text, confirm `plain_text.enabled` is `true`
   and inspect the placement and multiline settings.

   ```bash
   # Check for malformed JSON
   cat app.log | jq empty && echo "Valid JSON" || echo "Invalid JSON"
   ```

2. **Verify trace export and log enrichment**:

   ```yaml
   otel_traces_export:
     endpoint: http://collector:4318/v1/traces

   ebpf:
     log_enricher:
       services:
         - service:
             - open_ports: '8380'
   ```

3. **Verify Linux kernel**: Trace-log correlation requires Linux

   ```bash
   uname -s  # Must return "Linux"
   ```

4. **Check log pipeline**: Verify your log forwarder is shipping logs to your
   backend

## What's next?

- Set up [export destinations](/docs/zero-code/obi/configure/export-data/) for
  traces and metrics
- Explore OBI
  [as a Collector receiver](/docs/zero-code/obi/configure/collector-receiver/)
  for centralized processing
