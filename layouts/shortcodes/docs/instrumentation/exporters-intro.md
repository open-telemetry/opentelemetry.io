<!-- cspell:ignore isset cond -->

{{ $lang := .Get 0 -}} {{ $data := index $.Site.Data.instrumentation $lang }}
{{ $name := cond (isset $.Site.Data.instrumentation $lang) (printf "OpenTelemetry %s" $data.name) "the language specific implementations" -}}

In order to visualize and analyze your telemetry, you will need to export your
data to an [OpenTelemetry Collector](/docs/collector/) or a backend such as
[Jaeger](https://jaegertracing.io/), [Zipkin](https://zipkin.io/),
[Prometheus](https://prometheus.io/) or a [vendor-specific](/ecosystem/vendors/)
one.

As part of {{ $name }} you will find many exporters being available. Among them,
the OpenTelemetry Protocol (OTLP) exporters provide the best experience for you
as an end-user:

- it is suitable to be used between instrumented applications, collectors and
  backends.
- it has high reliability, low CPU usage and imposes minimal pressure on memory
  managers.
- it supports to efficiently modify deserialized data.
- it ensures high throughput, allows back pressure signalling and is
  load-balancer friendly

To learn more about the OTLP protocol, you can read the
[OTLP Specification](/docs/specs/otlp/).

{{ if (isset $.Site.Data.instrumentation $lang) -}} Below you will find some
introductions on how to set up exporters for OTLP and other common protocols in
your code. {{ end -}}
