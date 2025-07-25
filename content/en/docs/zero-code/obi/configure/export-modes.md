---
title: Configure Beyla export modes
menuTitle: Export modes
description:
  Configure Beyla to export data directly to an OTLP endpoint or through Alloy.
weight: 1
keywords:
  - Beyla
  - eBPF
aliases:
  - /docs/grafana-cloud/monitor-applications/beyla/configure/export-modes/
---

# Configure Beyla export modes

In Direct mode Beyla pushes metrics and traces directly to a remote endpoint
using the OpenTelemetry protocol (OTLP).

Beyla can also expose a Prometheus HTTP endpoint ready to scrape, for example in
**pull** mode.

To use Direct mode requires configuration with authentication credentials. Set
the OTLP endpoint authentication credentials with these environment variables:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`

To run in Direct mode using the Prometheus scrape endpoint, see the
[configuration documentation](../options/).

### Configure and run Beyla

This tutorial assumes Beyla and OTEL Collector are running natively on the same host, so
there is no need to secure the traffic nor provide authentication in the OTEL Collector
OTLP receiver.

Install [OpenTelemetry eBPF Instrumentation](../../setup/) and download the
example
[configuration file](https://github.com/grafana/beyla/blob/main/docs/sources/configure/resources/instrumenter-config.yml).

First, specify the executable to instrument. For a service executable running on
port `443`, add the `open_port` property to the YAML document:

```yaml
discovery:
  instrument:
    - open_ports: 443
```

Next, specify where the traces and the metrics are sent. If the OTEL collector is running on
the local host, it uses port `4318`:

```yaml
otel_metrics_export:
  endpoint: http://localhost:4318
otel_traces_export:
  endpoint: http://localhost:4318
```

You can specify a combination of `otel_metrics_export` and `otel_traces_export`
properties to export metrics, traces, or both.

Run Beyla with a named configuration file:

```
beyla -config instrument-config.yml
```

or

```
BEYLA_CONFIG_PATH=instrument-config.yml beyla
```
