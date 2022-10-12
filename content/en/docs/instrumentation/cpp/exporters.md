---
title: Exporters
weight: 4
---

In order to visualize and analyze your
[traces](/docs/concepts/signals/traces/#tracing-in-opentelemetry) and metrics,
you will need to export them to a backend.

## Logging exporter

The logging exporter is useful for development and debugging tasks, and is the
simplest to set up.

```cpp
auto ostream_exporter =
    std::unique_ptr<opentelemetry::sdk::trace::SpanExporter>(new opentelemetry::exporter::trace::OStreamSpanExporter);
```

## OTLP endpoint

To send trace data to an OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to configure an OTLP exporter that sends to your endpoint.

```cpp
opentelemetry::exporter::otlp::OtlpHttpExporterOptions opts;
opts.url = "http://localhost:4318/v1/traces";
auto otlp_http_exporter =
    std::unique_ptr<opentelemetry::sdk::trace::SpanExporter>(new opentelemetry::exporter::otlp::OtlpHttpExporter(opts));
```

### Jaeger

To try out the OTLP exporter, you can run
[Jaeger](https://www.jaegertracing.io/) as an OTLP endpoint and for trace
visualization in a docker container:

```shell
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

## Next steps

Enriching your codebase with
[manual instrumentation](/docs/instrumentation/cpp/manual) gives you customized
observability data.
