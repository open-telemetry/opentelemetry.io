---
title: OBI configuration YAML example
linkTitle: YAML example
description: Example OBI configuration YAML example.
weight: 100
---

## YAML file example

An example OBI YAML configuration file to send OTLP data to an OpenTelemetry
Collector endpoint:

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
