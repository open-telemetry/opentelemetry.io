---
title: Agent Configuration
linkTitle: Configuration
weight: 45
spelling: cSpell:ignore distro mkdir myapp uninstrumented virtualenv
---

The agent is highly configurable, either by:

- Passing it configuration properties from the CLI
- Setting
  [environment variables](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/sdk-environment-variables.md)

## Configuration properties

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

- `traces_exporter` specifies which traces exporter to use. In this case, traces
  are being exported to `console` (stdout) and with `otlp`. The `otlp` option
  tells `opentelemetry-instrument` to send the traces to an endpoint that
  accepts OTLP via gRPC. In order to use HTTP instead of gRPC, add
  `--exporter_otlp_protocol http`. The full list of available options for
  traces_exporter can be found
  [here](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation).
- `metrics_exporter` specifies which metrics exporter to use. In this case,
  metrics are being exported to `console` (stdout). It is currently required for
  your to specify a metrics exporter. If you aren't exporting metrics, specify
  `none` as the value instead.
- `service_name` sets the name of the service associated with your telemetry,
  and is sent to your [Observability backend](/ecosystem/vendors/).
- `exporter_otlp_endpoint` sets the endpoint where telemetry is exported to. If
  omitted, the default [Collector](/docs/collector) endpoint will be used, which
  is `0.0.0.0:4317` for gRPC and `0.0.0.0:4318` for HTTP.
- `exporter_otlp_headers` is required depending on your chosen Observability
  backend. More info exporter OTLP headers be found
  [here](/docs/concepts/sdk-configuration/otlp-exporter-configuration/#otel_exporter_otlp_headers).

## Environment Variables

In some cases, configuring via
[Environment Variables](/docs/concepts/sdk-configuration/) is more preferred.
Any setting configurable with a command-line argument can also be configured
with an Environment Variable.

You can apply the following steps to determine the correct name mapping of the
desired configuration property:

- Convert the configuration property to uppercase.
- Prefix environment variable with `OTEL_`

For example, `exporter_otlp_endpoint` would convert to
`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`.

## Disabling Specific Instrumentations

The Python agent by default will detect a python program's packages and
instrument any packages it can. This makes instrumentation easy, but can result
in too much or unwanted data.

You can omit specific packages from instrumentation by using the
`OTEL_PYTHON_DISABLED_INSTRUMENTATIONS` environment variable. The environment
variable can be set to a comma-separated list of package names to exclude from
instrumentation.

For example, if your Python program uses the `redis` and `kafka-python`
packages, by default the agent will use the
`opentelemetry-instrumentation-redis` and
`opentelemetry-instrumentation-kafka-python` packages to instrument them. To
disable this, you can set
`OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=redis,kafka-python`.
