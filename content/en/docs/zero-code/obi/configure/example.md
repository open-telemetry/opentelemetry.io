---
title: OBI configuration YAML example
linkTitle: YAML example
description: Example OBI configuration YAML example.
weight: 100
---

## YAML file example

```yaml
discovery:
  instrument:
    - open_ports: 443
log_level: DEBUG

ebpf:
  wakeup_len: 100

otel_traces_export:
  endpoint: http://localhost:4318

prometheus_export:
  port: 8999
  path: /metrics
```

This configuration includes the following options:

- `discovery.instrument.open_ports`: instruments services listening on port
  443
- `log_level`: sets logging verbosity to `DEBUG`
- `ebpf.wakeup_len`: buffers 100 events before processing
- `otel_traces_export.endpoint`: sends traces to the OpenTelemetry Collector
  at `http://localhost:4318`
- `prometheus_export`: exposes metrics at `http://localhost:8999/metrics`
