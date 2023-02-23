---
title: Exporters
weight: 4
---

In order to visualize and analyze your
[traces](/docs/concepts/signals/traces/#tracing-in-opentelemetry) and metrics,
you will need to export them to a backend.

## Trace exporters

### OStream exporter

The OStream exporter is useful for development and debugging tasks, and is the
simplest to set up.

```cpp
#include "opentelemetry/exporters/ostream/span_exporter_factory.h"

namespace trace_exporter = opentelemetry::exporter::trace;

auto exporter = trace_exporter::OStreamSpanExporterFactory::Create();
```

### OTLP endpoint

To send trace data to an OTLP endpoint (like the [collector](/docs/collector) or
Jaeger) you'll want to configure an OTLP exporter that sends to your endpoint.

#### OTLP HTTP Exporter

```cpp
#include "opentelemetry/exporters/otlp/otlp_http_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_http_exporter_options.h"

namespace otlp = opentelemetry::exporter::otlp;

otlp::OtlpHttpExporterOptions opts;
opts.url = "http://localhost:4318/v1/traces";

auto exporter = otlp::OtlpHttpExporterFactory::Create(opts);
```

#### OTLP GRPC Exporter

```cpp
#include "opentelemetry/exporters/otlp/otlp_grpc_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_grpc_exporter_options.h"

namespace otlp = opentelemetry::exporter::otlp;

otlp::OtlpGrpcExporterOptions opts;
opts.endpoint = "localhost:4317";
opts.use_ssl_credentials = true;
opts.ssl_credentials_cacert_as_string = "ssl-certificate";

auto exporter = otlp::OtlpGrpcExporterFactory::Create(opts);
```

You can find an example of how to use the OTLP exporter
[here](https://github.com/open-telemetry/opentelemetry-cpp/blob/main/examples/otlp/README.md).

#### Jaeger

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

### Zipkin

To send trace data to a zipkin endpoint you'll want to configure a zipkin
exporter that sends to your endpoint.

```cpp
#include "opentelemetry/exporters/zipkin/zipkin_exporter_factory.h"
#include "opentelemetry/exporters/zipkin/zipkin_exporter_options.h"

namespace zipkin = opentelemetry::exporter::zipkin;

zipkin::ZipkinExporterOptions opts;
opts.endpoint = "http://localhost:9411/api/v2/spans" ; // or export OTEL_EXPORTER_ZIPKIN_ENDPOINT="..."
opts.service_name = "default_service" ;

auto exporter = zipkin::ZipkinExporterFactory::Create(opts);
```

## Trace processors

### Simple span processor

A simple processor will send spans one by one to an exporter.

```cpp
#include "opentelemetry/sdk/trace/simple_processor_factory.h"

namespace trace_sdk = opentelemetry::sdk::trace;

auto processor = trace_sdk::SimpleSpanProcessorFactory::Create(std::move(exporter));
```

### Batch span processor

A batch span processor will group several spans together, before sending them to
an exporter.

```cpp
#include "opentelemetry/sdk/trace/batch_span_processor_factory.h"
#include "opentelemetry/sdk/trace/batch_span_processor_options.h"

namespace trace_sdk = opentelemetry::sdk::trace;

trace_sdk::BatchSpanProcessorOptions opts;
opts.max_queue_size = 2048;
opts.max_export_batch_size = 512;

auto processor = trace_sdk::BatchSpanProcessorFactory::Create(std::move(exporter), opts);
```

## Tracer provider

```cpp
#include "opentelemetry/sdk/trace/tracer_provider_factory.h"

namespace trace_api = opentelemetry::trace;
namespace trace_sdk = opentelemetry::sdk::trace;

auto provider = trace_sdk::TracerProviderFactory::Create(std::move(processor));

trace_api::Provider::SetTracerProvider(provider);
```

## Metrics exporters

### OTLP HTTP Exporter

```cpp
opentelemetry::exporter::otlp::OtlpHttpExporterOptions otlpOptions;
otlpOptions.url = "http://localhost:4318/v1/metrics"; // or "http://localhost:4318/
otlpOptions.aggregation_temporality = opentelemetry::sdk::metrics::AggregationTemporality::kCumulative; // or kDelta
auto exporter = opentelemetry::exporter::otlp::OtlpHttpMetricExporterFactory::Create(otlpOptions);
// Initialize and set the periodic metrics reader
opentelemetry::sdk::metrics::PeriodicExportingMetricReaderOptions options;
options.export_interval_millis = std::chrono::milliseconds(1000);
options.export_timeout_millis  = std::chrono::milliseconds(500);
std::unique_ptr<opentelemetry::sdk::metrics::MetricReader> reader{
    new opentelemetry::sdk::metrics::PeriodicExportingMetricReader(std::move(exporter), options)};
```

### OTLP gRPC Exporter

```cpp
opentelemetry::exporter::otlp::OtlpGrpcMetricExporterOptions otlpOptions;
otlpOptions.endpoint = "localhost:4317/v1/metrics";  // or "localhost:4317
otlpOptions.aggregation_temporality = opentelemetry::sdk::metrics::AggregationTemporality::kDelta; // or kCumulative
auto exporter = opentelemetry::exporter::otlp::OtlpGrpcMetricExporterFactory::Create(otlpOptions);
// Initialize and set the periodic metrics reader
opentelemetry::sdk::metrics::PeriodicExportingMetricReaderOptions options;
options.export_interval_millis = std::chrono::milliseconds(1000);
options.export_timeout_millis  = std::chrono::milliseconds(500);
std::unique_ptr<opentelemetry::sdk::metrics::MetricReader> reader{
    new opentelemetry::sdk::metrics::PeriodicExportingMetricReader(std::move(exporter), options)};
```

### Prometheus

To send metrics to a prometheus endpoint you'll want to configure a prometheus
exporter

```cpp
opentelemetry::sdk::metrics::PeriodicExportingMetricReaderOptions options;
options.export_interval_millis = std::chrono::milliseconds(1000); //optional, to override default values
options.export_timeout_millis  = std::chrono::milliseconds(500); // optional, to override default values
opentelemetry::exporter::metrics::PrometheusExporterOptions prometheusOptions;
prometheusOptions.url = "localhost:8080";
std::unique_ptr<opentelemetry::sdk::metrics::MetricExporter> exporter{new opentelemetry::exporter::metrics::PrometheusExporter(prometheusOptions)};
std::unique_ptr<opentelemetry::sdk::metrics::MetricReader> reader{
    new opentelemetry::sdk::metrics::PeriodicExportingMetricReader(std::move(exporter), options)};
```

To learn more on how to use the Prometheus exporter, try out the
[prometheus example](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/examples/prometheus)

## Next steps

Enriching your codebase with
[manual instrumentation](/docs/instrumentation/cpp/manual) gives you customized
observability data.
