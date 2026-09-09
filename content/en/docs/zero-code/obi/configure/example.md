---
title: OBI Config v1 YAML example
linkTitle: Config v1 YAML example
description: Example Config v1 YAML file for OBI.
weight: 100
---

> [!NOTE]
>
> This page uses Config v1 field names and examples. For Config v2, see the
> [Config v2 reference](../config-v2/). To convert an existing file, use the
> [migration guide](../migrate-to-config-v2/).

## YAML file example

```yaml
discovery:
  instrument:
    - open_ports: 8443
log_level: DEBUG

ebpf:
  context_propagation: all

otel_traces_export:
  endpoint: http://localhost:4318

prometheus_export:
  port: 8999
  path: /metrics
```

This configuration includes the following options:

- `discovery.instrument.open_ports`: instruments services listening on port 8443
- `log_level`: sets logging verbosity to `DEBUG`
- `ebpf.context_propagation`: enables context propagation using all supported
  carriers
- `otel_traces_export.endpoint`: sends traces to the OpenTelemetry Collector at
  `http://localhost:4318`
- `prometheus_export`: exposes metrics at `http://localhost:8999/metrics`
