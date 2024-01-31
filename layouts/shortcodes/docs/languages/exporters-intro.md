{{ $lang := .Get 0 -}}

{{ $data := index $.Site.Data.instrumentation $lang -}}

{{ $name := $data.name -}}

To visualize and analyze telemetry, export it to the
[OpenTelemetry Collector](/docs/collector/), to a backend such as
[Jaeger](https://jaegertracing.io/), [Zipkin](https://zipkin.io/),
[Prometheus](https://prometheus.io/), or a
[vendor-specific](/ecosystem/vendors/) backend.

This page covers the main OpenTelemetry {{ $name }} exporters and how to set
them up.

## Available exporters

The registry contains the [list of exporters for {{ $name }}][reg].

Among exporters, [OpenTelemetry Protocol (OTLP)][OTLP] exporters provide an
optimal experience since they are lossless and support all [signals]. To learn
more about the OTLP protocol, see [OTLP Specification][OTLP].

[OTLP]: /docs/specs/otlp/
[signals]: /docs/concepts/signals/

[reg]: /ecosystem/registry/?component=exporter&language={{ $lang }}
