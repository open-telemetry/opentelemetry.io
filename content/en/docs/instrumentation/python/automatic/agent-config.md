---
title: Agent Configuration
linkTitle: Configuration
weight: 45
spelling: cSpell:ignore distro mkdir uninstrumented virtualenv
---

## Configuring the agent

The agent is highly configurable, either by:

- Passing it configuration properties from the CLI
- Setting
  [environment variables](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/sdk-environment-variables.md)

### Configuration properties

Here's an example of agent configuration via configuration properties:

```console
opentelemetry-instrument \
    --traces_exporter console,otlp \
    --metrics_exporter console \
    --service_name your-service-name \
    --exporter_otlp_endpoint 0.0.0.0:4317 \
    python myapp.py
```

Here's an explanation of what each configuration does:

- `traces_exporter` specifies which trace exporter to use. In this case, traces
  are being exported to `console` (stdout) and to `otlp`. The `otlp` option
  tells `opentelemetry-instrument` to send it to an endpoint that accepts OTLP
  via gRPC. The full list of available options for traces_exporter can be found
  [here](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation).
- `otlp` used above for `traces_exporter` is the equivalent of using
  `otlp_proto_grpc`. To send traces via HTTP instead of gRPC, replace
  `otlp_proto_grpc` (or `otlp`) with `otlp_proto_http`.
- `metrics_exporter` specifies which metrics exporter to use. In this case,
  metrics are being exported to `console` (stdout). It is currently required for
  your to specify a metrics exporter. If you aren't exporting metrics, specify
  `none` as the value instead.
- `service_name` sets the name of the service associated to the trace, and is
  sent to your [Observability back-end](/ecosystem/vendors/).
- `exporter_otlp_endpoint` tells `opentelemetry-instrument` to send the traces
  to the given [Observability back-end's](/ecosystem/vendors/) endpiont via
  gRPC, or directly to the [OpenTelemetry Collector](/docs/collector/).
- `exporter_otlp_headers` is required depending on your chosen Observability
  back-end. More info exporter OTLP headers be found
  [here](/docs/concepts/sdk-configuration/otlp-exporter-configuration/#otel_exporter_otlp_headers).
- If `exporter_otlp_endpoint` is omitted, the agent assumes that you are using
  the default Collector gRPC endpoint, `0.0.0.0:4317`. The above command is the
  equivalent of saying:

  ```console
  opentelemetry-instrument \
  --traces_exporter console,otlp_proto_grpc \
  --metrics_exporter console\
  --service_name your-service-name \
  --exporter_otlp_endpoint 0.0.0.0:4317 \
  --exporter_otlp_insecure true \
  python myapp.py
  ```

  For HTTP, replace `otlp_proto_grpc` with `otlp_proto_http`. If left
  unspecified, the endpoint is now assumed to be `0.0.0.0:4318` (default
  Collector HTTP endpoint).

### Environment Variables

In some cases, configuring via
[Environment Variables](/docs/concepts/sdk-configuration/) is more preferred.
Any setting configurable with a configuration property can also be configured
with an Environment Variable.

You can apply the following steps to determine the correct name mapping of the
desired configuration property:

- Convert the configuration property to uppercase.
- Prefix environment variable with `OTEL_`

For example, `exporter_otlp_endpoint` would convert to
`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`.
