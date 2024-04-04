---
title: Internal Telemetry
weight: 25
cSpell:ignore: journalctl kube otecol pprof tracez zpages
---

The Collector offers you multiple ways to measure and monitor its health as well
as investigate issues. In this section, you'll learn how to enable internal
observability, what types of telemetry are available, and how best to use them
to monitor your Collector deployment.

## Enabling observability internal to the Collector

By default, the Collector exposes service telemetry in two ways currently:

- internal metrics are exposed via a Prometheus interface which defaults to port
  `8888`
- logs are emitted to stdout

Traces are not exposed by default. There is an effort underway to
[change this](https://github.com/open-telemetry/opentelemetry-collector/issues/7532).
The work includes supporting configuration of the OpenTelemetry SDK used to
produce the Collector's internal telemetry. This feature is currently behind two
feature gates:

```sh
--feature-gates=telemetry.useOtelWithSDKConfigurationForInternalTelemetry
```

The gate `useOtelWithSDKConfigurationForInternalTelemetry` enables the Collector
to parse configuration that aligns with the
[OpenTelemetry Configuration](../configuration/) schema. The support for this
schema is still experimental, but it does allow telemetry to be exported via
OTLP.

The following configuration can be used in combination with the feature gates
aforementioned to emit internal metrics and traces from the Collector to an OTLP
backend:

```yaml
service:
  telemetry:
    metrics:
      readers:
        - periodic:
            interval: 5000
            exporter:
              otlp:
                protocol: grpc/protobuf
                endpoint: https://backend:4317
    traces:
      processors:
        - batch:
            exporter:
              otlp:
                protocol: grpc/protobuf
                endpoint: https://backend2:4317
```

See the configuration's
[example](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml)
for additional configuration options.

Note that this configuration does not support emitting logs as there is no
support for [logs] in OpenTelemetry Go SDK at this time.

<!--- TODO: From Common Issues of Troubleshooting page. Move to Types? --->

To see logs for the Collector:

On a Linux systemd system, logs can be found using `journalctl`:
`journalctl | grep otelcol`

or to find only errors: `journalctl | grep otelcol | grep Error`
