<!-- cSpell:ignore isset cond -->

{{ $lang := .Get 0 -}} {{ $data := index $.Site.Data.instrumentation $lang }}
{{ $name := cond (isset $.Site.Data.instrumentation $lang) (printf "OpenTelemetry %s" $data.name) "the language specific implementations" -}}

In order to visualize and analyze your telemetry, you will need to export your
data to an [OpenTelemetry Collector](/docs/collector/) or a backend such as
[Jaeger](https://jaegertracing.io/), [Zipkin](https://zipkin.io/),
[Prometheus](https://prometheus.io/) or a [vendor-specific](/ecosystem/vendors/)
one.

Among many available exporters, the OpenTelemetry Protocol (OTLP) exporters
provide the best experience for you as an end-user, since:

- OTLP Exporters are built to carry OTel data model without any loss of information. 
Other exporters may have info loss, like some exporters may not have a good place 
to store resources, instrumentation scope etc. but OTLP carry everything.

- OTLP is the only exporter that supports all 3 signals (logs/metrics/traces).

To learn more about the OTLP protocol, you can read the
[OTLP Specification](/docs/specs/otlp/).

{{ if (isset $.Site.Data.instrumentation $lang) -}} Below you will find some
introductions on how to set up exporters for OTLP and other common protocols in
your code. {{ end -}}
