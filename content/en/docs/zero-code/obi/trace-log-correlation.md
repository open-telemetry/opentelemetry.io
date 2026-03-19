---
title: Trace-log correlation
linkTitle: Trace-log correlation
weight: 35
description:
  Learn how OBI correlates application logs with distributed traces for faster
  debugging and troubleshooting.
cSpell:ignore: BPFFS ringbuffer
---

OpenTelemetry eBPF Instrumentation (OBI) correlates application logs with
distributed traces by enriching JSON logs with trace context. OBI does not
export logs; it writes enriched logs back to the same stream while traces are
exported via OTLP.

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
3. **Context injection**: For JSON-formatted logs, OBI injects `trace_id` and
   `span_id` fields
4. **Trace export**: Logs keep flowing through your existing logging pipeline
5. **Backend linking**: Your observability backend links logs to traces using
   these IDs

### Technical approach

OBI performs correlation at the kernel level without modifying application
binaries:

- Uses kernel eBPF probes to intercept write operations
- Maintains file descriptor caching for performance
- Works with any logging framework that writes JSON logs

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

### Enabling correlation per service

OBI enriches JSON logs for services listed under `ebpf.log_enricher.services`.
Keep service selectors aligned with `discovery.instrument` so enrichment tracks
the same processes.

## Requirements

### 1. JSON log format

Trace-log correlation **requires JSON-formatted logs**. OBI injects `trace_id`
and `span_id` fields into JSON log objects:

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

Plain text logs are passed through unchanged and are **not enriched** with trace
context.

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

### 4. Framework that emits JSON logs

Applications must use a logging framework configured to output JSON. Examples:

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

## Performance considerations

- **Minimal overhead**: Correlation uses eBPF kernel probes with efficient file
  descriptor caching
- **Cache limits**: File descriptor cache has size and TTL limits to prevent
  unbounded memory usage
- **Async processing**: Log enrichment uses asynchronous workers to avoid
  overflowing the kernel ringbuffer

## Known limitations

- **JSON only**: Plain text logs are not enriched with trace context
- **File descriptor cache**: Cached for performance, with configurable TTL
  (default: 30 minutes)
- **Span-aligned only**: Logs enriched only while a span is active; logs outside
  span scope are not enriched.

## Troubleshooting

### Trace context not appearing in logs

1. **Verify JSON format**: Ensure application outputs valid JSON logs

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
