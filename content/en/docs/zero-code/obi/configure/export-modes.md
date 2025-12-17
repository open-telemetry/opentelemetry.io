---
title: Configure OBI export modes
linkTitle: Export modes
description: Configure OBI to export data directly to an OTLP endpoint
weight: 1
---

In Direct mode OBI pushes metrics and traces directly to a remote endpoint using
the OpenTelemetry protocol (OTLP).

OBI can also expose a Prometheus HTTP endpoint ready to scrape, for example in
**pull** mode.

To use Direct mode requires configuration with authentication credentials. Set
the OTLP endpoint authentication credentials with these environment variables:

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`

To run in Direct mode using the Prometheus scrape endpoint, see the
[configuration documentation](../options/).

## Configure and run OBI

This tutorial assumes OBI and OTel Collector are running natively on the same
host, so there is no need to secure the traffic nor provide authentication in
the OTel Collector OTLP receiver.

Install [OpenTelemetry eBPF Instrumentation](../../setup/) and download the
example
[configuration file](/docs/zero-code/obi/configure/resources/instrumenter-config.yml).

First, specify the executable to instrument. For a service executable running on
port `443`, add the `open_port` property to the YAML document:

```yaml
discovery:
  instrument:
    - open_ports: 443
```

Next, specify where the traces and the metrics are sent. If the OTel collector
is running on the local host, it uses port `4318`:

```yaml
otel_metrics_export:
  endpoint: http://localhost:4318
otel_traces_export:
  endpoint: http://localhost:4318
```

You can specify a combination of `otel_metrics_export` and `otel_traces_export`
properties to export metrics, traces, or both.

Run OBI with a named configuration file:

```shell
ebpf-instrument -config instrument-config.yml
```

or

```shell
OTEL_EBF_CONFIG_PATH=instrument-config.yml ebpf-instrument
```
