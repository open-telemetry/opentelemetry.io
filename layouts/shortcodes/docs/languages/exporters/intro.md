<!-- cSpell:ignore isset cond -->

{{ $lang := .Get 0 -}} {{ $data := index $.Site.Data.instrumentation $lang -}}
{{ $name := cond (isset $.Site.Data.instrumentation $lang) (printf "OpenTelemetry %s" $data.name) "the language specific implementations" -}}

In order to visualize and analyze your telemetry, you will need to export your
data to an [OpenTelemetry Collector](/docs/collector/) or a backend such as
[Jaeger](https://jaegertracing.io/), [Zipkin](https://zipkin.io/),
[Prometheus](https://prometheus.io/) or a [vendor-specific](/ecosystem/vendors/)
one.

As part of {{ $name }} you will find many exporters being available. Among them,
the OpenTelemetry Protocol (OTLP) exporters provide the best experience for you
as an end-user, since it is a general-purpose telemetry data delivery protocol
designed in the scope of the OpenTelemetry project.

To learn more about the OTLP protocol, you can read the
[OTLP Specification](/docs/specs/otlp/).

{{ if (isset $.Site.Data.instrumentation $lang) -}}

Below you will find some introductions on how to set up exporters for OTLP and
other common protocols in your code.

{{ end -}}

{{ with $.Page.GetPage "automatic/configuration" }}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Note</h4>

If you use [automatic instrumentation](/docs/languages/{{ $lang }}/automatic)
you can learn how to setup exporters following the [Configuration
Guide](/docs/languages/{{ $lang }}/automatic/configuration/).

</div>

{{ end }}

{{/*
 below list needs to grow until all languages are updated to a consistent structure.
 */}} {{ if in (slice "python" "js" "java") $lang -}}

## OTLP

### Collector Setup

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Note</h4>

If you have a OTLP collector or backend already set up, you can skip this
section and [setup the OTLP exporter dependencies](#otlp-dependencies) for your
application.

</div>

To try out and verify your OTLP exporters, you can run the collector in a docker
container that writes telemetry directly to the console.

In an empty directory, create a file called `collector-config.yaml` with the
following content:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

Now run the collector in a docker container:

```shell
docker run -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector
```

This collector is now able to accept telemetry via OTLP. Later you may want to
[configure the collector](/docs/collector/configuration) to send your telemetry
to your observability backend.

{{ end -}}
