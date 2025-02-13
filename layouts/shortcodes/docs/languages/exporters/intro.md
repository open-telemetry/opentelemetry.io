{{/* cSpell:ignore cond */ -}} Send telemetry to the
[OpenTelemetry Collector](/docs/collector/) to make sure it's exported
correctly. Using the Collector in production environments is a best practice. To
visualize your telemetry, export it to a backend such as
[Jaeger](https://jaegertracing.io/), [Zipkin](https://zipkin.io/),
[Prometheus](https://prometheus.io/), or a
[vendor-specific](/ecosystem/vendors/) backend.

{{ $lang := .Get 0 | default "" -}}

{{ $name := "" -}}

{{ if $lang -}}

{{ $name = (index $.Site.Data.instrumentation $lang).name -}}

## Available exporters

The registry contains a [list of exporters for {{ $name }}][reg].

{{ else -}}

The registry contains the [list of language specific exporters][reg].

{{ end -}}

Among exporters, [OpenTelemetry Protocol (OTLP)][OTLP] exporters are designed
with the OpenTelemetry data model in mind, emitting OTel data without any loss
of information. Furthermore, many tools that operate on telemetry data support
OTLP (such as [Prometheus], [Jaeger], and most [vendors]), providing you with a
high degree of flexibility when you need it. To learn more about OTLP, see [OTLP
Specification][OTLP].

[Jaeger]: /blog/2022/jaeger-native-otlp/
[OTLP]: /docs/specs/otlp/
[Prometheus]:
  https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver
[vendors]: /ecosystem/vendors/

[reg]: /ecosystem/registry/?component=exporter&language={{ $lang }}

{{ if $name -}}

This page covers the main OpenTelemetry {{ $name }} exporters and how to set
them up.

{{ end -}}

{{ $l := cond (eq $lang "dotnet") "net" $lang }}
{{ with $.Page.GetPage (print "/docs/zero-code/" $l "/configuration" ) }}

<div class="alert alert-info" role="alert"><h4 class="alert-heading">Note</h4>

If you use [zero-code instrumentation](/docs/zero-code/{{ $l }}), you can learn
how to set up exporters by following the [Configuration
Guide](/docs/zero-code/{{ $l }}/configuration/).

</div>

{{ end -}}

{{/*
 below list needs to grow until all languages are updated to a consistent structure.
 */ -}}

{{ if in (slice "python" "js" "java" "cpp" "dotnet") $lang -}}

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
