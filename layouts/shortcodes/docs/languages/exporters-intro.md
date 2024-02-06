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

Among exporters, [OpenTelemetry Protocol (OTLP)][OTLP] exporters are designed
with the OpenTelemetry data model in mind, emitting OTel data without any loss
of information. Furthermore, many tools that operate on telemetry data support
OTLP (such as [Prometheus], [Jaeger], and most [vendors]), providing you with a
high degree of flexibility when you need it. To learn more about OTLP, see [OTLP
Specification][OTLP].

[Jaeger]: /blog/2022/jaeger-native-otlp/
[OTLP]: /docs/specs/otlp/
[Prometheus]:
  https://prometheus.io/docs/prometheus/latest/feature_flags/#otlp-receiver
[signals]: /docs/concepts/signals/
[vendors]: /ecosystem/vendors/

[reg]: /ecosystem/registry/?component=exporter&language={{ $lang }}
