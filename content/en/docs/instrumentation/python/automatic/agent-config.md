---
title: Agent Configuration
linkTitle: Configuration
weight: 45
spelling: cSpell:ignore distro mkdir myapp uninstrumented virtualenv
---

The agent is highly configurable, either by:

- Passing configuration properties from the CLI
- Setting
  [environment variables](/docs/specs/otel/configuration/sdk-environment-variables/)

## Configuration properties

Here's an example of agent configuration via configuration properties:

```sh
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
  traces_exporter, see the Python contrib
  [OpenTelemetry Instrumentation](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation).
- `metrics_exporter` specifies which metrics exporter to use. In this case,
  metrics are being exported to `console` (stdout). It is currently required for
  your to specify a metrics exporter. If you aren't exporting metrics, specify
  `none` as the value instead.
- `service_name` sets the name of the service associated with your telemetry,
  and is sent to your [Observability backend](/ecosystem/vendors/).
- `exporter_otlp_endpoint` sets the endpoint where telemetry is exported to. If
  omitted, the default [Collector](/docs/collector/) endpoint will be used,
  which is `0.0.0.0:4317` for gRPC and `0.0.0.0:4318` for HTTP.
- `exporter_otlp_headers` is required depending on your chosen Observability
  backend. More info exporter OTLP headers be found
  [here](/docs/concepts/sdk-configuration/otlp-exporter-configuration/#otel_exporter_otlp_headers).

## Environment Variables

In some cases, configuring via
[environment variables](/docs/concepts/sdk-configuration/) is more preferred.
Any setting configurable with a command-line argument can also be configured
with an Environment Variable.

You can apply the following steps to determine the correct name mapping of the
desired configuration property:

- Convert the configuration property to uppercase.
- Prefix environment variable with `OTEL_`

For example, `exporter_otlp_endpoint` would convert to
`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`.

## Python-specific Configuration

There are some python specific configuration options you can set by prefixing
environment variables with `OTEL_PYTHON_`.

### Excluded URLs

Comma-separated regexes representing which URLs to exclude across all
instrumentations:

- `OTEL_PYTHON_EXCLUDED_URLS`

You can also exclude URLs for specific instrumentations by using a variable
`OTEL_PYTHON_<library>_EXCLUDED_URLS`, where library is the uppercase version of
one of the following: Django, Falcon, FastAPI, Flask, Pyramid, Requests,
Starlette, Tornado, urllib, urllib3.

Examples:

```sh
export OTEL_PYTHON_EXCLUDED_URLS="client/.*/info,healthcheck"
export OTEL_PYTHON_URLLIB3_EXCLUDED_URLS="client/.*/info"
export OTEL_PYTHON_REQUESTS_EXCLUDED_URLS="healthcheck"
```

### Request Attribute Names

Comma-separated list of names that will be extracted from the request object and
set as attributes on spans.

- `OTEL_PYTHON_DJANGO_TRACED_REQUEST_ATTRS`
- `OTEL_PYTHON_FALCON_TRACED_REQUEST_ATTRS`
- `OTEL_PYTHON_TORNADO_TRACED_REQUEST_ATTRS`

Examples:

```sh
export OTEL_PYTHON_DJANGO_TRACED_REQUEST_ATTRS='path_info,content_type'
export OTEL_PYTHON_FALCON_TRACED_REQUEST_ATTRS='query_string,uri_template'
export OTEL_PYTHON_TORNADO_TRACED_REQUEST_ATTRS='uri,query'
```

### Logging

There are some configuration options used to control the logs that are
outputted.

- `OTEL_PYTHON_LOG_CORRELATION`: to enable trace context injection into logs
  (true, false)
- `OTEL_PYTHON_LOG_FORMAT`: to instruct the instrumentation to use a custom
  logging format
- `OTEL_PYTHON_LOG_LEVEL`: to set a custom log level (info, error, debug,
  warning)

Examples:

```sh
export OTEL_PYTHON_LOG_CORRELATION=true
export OTEL_PYTHON_LOG_FORMAT="%(msg)s [span_id=%(span_id)s]"
export OTEL_PYTHON_LOG_LEVEL=debug
```

### Other

There are some more configuration options that can be set that don't fall into a
specific category.

- `OTEL_PYTHON_DJANGO_INSTRUMENT`: set to `false` to disable the default enabled
  state for the Django instrumentation
- `OTEL_PYTHON_ELASTICSEARCH_NAME_PREFIX`: changes the default prefixes for
  Elasticsearch operation names from "Elasticsearch" to whatever is used here
- `OTEL_PYTHON_GRPC_EXCLUDED_SERVICES`: comma-separated list of specific
  services to exclude for the gRPC instrumentation
- `OTEL_PYTHON_ID_GENERATOR`: to specify which IDs generator to use for the
  global Tracer Provider
- `OTEL_PYTHON_INSTRUMENTATION_SANITIZE_REDIS`: to enable query sanitization

Examples:

```sh
export OTEL_PYTHON_DJANGO_INSTRUMENT=false
export OTEL_PYTHON_ELASTICSEARCH_NAME_PREFIX=my-custom-prefix
export OTEL_PYTHON_GRPC_EXCLUDED_SERVICES="GRPCTestServer,GRPCHealthServer"
export OTEL_PYTHON_ID_GENERATOR=xray
export OTEL_PYTHON_INSTRUMENTATION_SANITIZE_REDIS=true
```

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
