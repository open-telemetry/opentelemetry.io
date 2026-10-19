---
title: エクスポーター
weight: 50
default_lang_commit: 1143960b75c6faceb40eb64269e68390e3237671
cSpell:ignore: DWITH
---

{{% docs/languages/exporters/intro %}}

## 依存関係 {#otlp-dependencies}

テレメトリーデータを OTLP エンドポイント（[OpenTelemetry Collector](#collector-setup)、[Jaeger](#jaeger)、[Prometheus](#prometheus) など）に送信する場合、データの転送に使用するプロトコルを以下の2つから選択できます。

- HTTP/protobuf
- gRPC

[ソースからの OpenTelemetry C++ のビルド](https://github.com/open-telemetry/opentelemetry-cpp/blob/main/INSTALL.md)時に、適切な cmake ビルド変数が設定されていることを確認してください。

- `-DWITH_OTLP_GRPC=ON`: OTLP gRPC エクスポーターのビルドを有効にします。
- `-DWITH_OTLP_HTTP=ON`: OTLP HTTP エクスポーターのビルドを有効にします。

## 使い方 {#usage}

次に、コード内でエクスポーターが OTLP エンドポイントを指すように設定します。

{{< tabpane text=true >}} {{% tab "HTTP/Proto" %}}

```cpp
#include "opentelemetry/exporters/otlp/otlp_http_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_http_exporter_options.h"
#include "opentelemetry/sdk/trace/processor.h"
#include "opentelemetry/sdk/trace/batch_span_processor_factory.h"
#include "opentelemetry/sdk/trace/batch_span_processor_options.h"
#include "opentelemetry/sdk/trace/tracer_provider_factory.h"
#include "opentelemetry/trace/provider.h"
#include "opentelemetry/sdk/trace/tracer_provider.h"

#include "opentelemetry/exporters/otlp/otlp_http_metric_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_http_metric_exporter_options.h"
#include "opentelemetry/metrics/provider.h"
#include "opentelemetry/sdk/metrics/aggregation/default_aggregation.h"
#include "opentelemetry/sdk/metrics/export/periodic_exporting_metric_reader.h"
#include "opentelemetry/sdk/metrics/export/periodic_exporting_metric_reader_factory.h"
#include "opentelemetry/sdk/metrics/meter_context_factory.h"
#include "opentelemetry/sdk/metrics/meter_provider.h"
#include "opentelemetry/sdk/metrics/meter_provider_factory.h"

#include "opentelemetry/exporters/otlp/otlp_http_log_record_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_http_log_record_exporter_options.h"
#include "opentelemetry/logs/provider.h"
#include "opentelemetry/sdk/logs/logger_provider_factory.h"
#include "opentelemetry/sdk/logs/processor.h"
#include "opentelemetry/sdk/logs/simple_log_record_processor_factory.h"

namespace trace_api = opentelemetry::trace;
namespace trace_sdk = opentelemetry::sdk::trace;

namespace metric_sdk = opentelemetry::sdk::metrics;
namespace metrics_api = opentelemetry::metrics;

namespace otlp = opentelemetry::exporter::otlp;

namespace logs_api = opentelemetry::logs;
namespace logs_sdk = opentelemetry::sdk::logs;


void InitTracer()
{
  trace_sdk::BatchSpanProcessorOptions bspOpts{};
  otlp::OtlpHttpExporterOptions opts;
  opts.url = "http://localhost:4318/v1/traces";
  auto exporter  = otlp::OtlpHttpExporterFactory::Create(opts);
  auto processor = trace_sdk::BatchSpanProcessorFactory::Create(std::move(exporter), bspOpts);
  std::shared_ptr<trace_api::TracerProvider> provider = trace_sdk::TracerProviderFactory::Create(std::move(processor));
  trace_api::Provider::SetTracerProvider(provider);
}

void InitMetrics()
{
  otlp::OtlpHttpMetricExporterOptions opts;
  opts.url = "http://localhost:4318/v1/metrics";
  auto exporter = otlp::OtlpHttpMetricExporterFactory::Create(opts);
  metric_sdk::PeriodicExportingMetricReaderOptions reader_options;
  reader_options.export_interval_millis = std::chrono::milliseconds(1000);
  reader_options.export_timeout_millis  = std::chrono::milliseconds(500);
  auto reader = metric_sdk::PeriodicExportingMetricReaderFactory::Create(std::move(exporter), reader_options);
  auto context = metric_sdk::MeterContextFactory::Create();
  context->AddMetricReader(std::move(reader));
  auto u_provider = metric_sdk::MeterProviderFactory::Create(std::move(context));
  std::shared_ptr<metrics_api::MeterProvider> provider(std::move(u_provider));
  metrics_api::Provider::SetMeterProvider(provider);
}

void InitLogger()
{
  otlp::OtlpHttpLogRecordExporterOptions opts;
  opts.url = "http://localhost:4318/v1/logs";
  auto exporter  = otlp::OtlpHttpLogRecordExporterFactory::Create(opts);
  auto processor = logs_sdk::SimpleLogRecordProcessorFactory::Create(std::move(exporter));
  std::shared_ptr<logs_api::LoggerProvider> provider =
      logs_sdk::LoggerProviderFactory::Create(std::move(processor));
  logs_api::Provider::SetLoggerProvider(provider);
}
```

{{% /tab %}} {{% tab gRPC %}}

```cpp
#include "opentelemetry/exporters/otlp/otlp_grpc_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_grpc_exporter_options.h"
#include "opentelemetry/sdk/trace/processor.h"
#include "opentelemetry/sdk/trace/batch_span_processor_factory.h"
#include "opentelemetry/sdk/trace/batch_span_processor_options.h"
#include "opentelemetry/sdk/trace/tracer_provider_factory.h"
#include "opentelemetry/trace/provider.h"
#include "opentelemetry/sdk/trace/tracer_provider.h"

#include "opentelemetry/exporters/otlp/otlp_grpc_metric_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_grpc_metric_exporter_options.h"
#include "opentelemetry/metrics/provider.h"
#include "opentelemetry/sdk/metrics/aggregation/default_aggregation.h"
#include "opentelemetry/sdk/metrics/export/periodic_exporting_metric_reader.h"
#include "opentelemetry/sdk/metrics/export/periodic_exporting_metric_reader_factory.h"
#include "opentelemetry/sdk/metrics/meter_context_factory.h"
#include "opentelemetry/sdk/metrics/meter_provider.h"
#include "opentelemetry/sdk/metrics/meter_provider_factory.h"

#include "opentelemetry/exporters/otlp/otlp_grpc_log_record_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_grpc_log_record_exporter_options.h"
#include "opentelemetry/logs/provider.h"
#include "opentelemetry/sdk/logs/logger_provider_factory.h"
#include "opentelemetry/sdk/logs/processor.h"
#include "opentelemetry/sdk/logs/simple_log_record_processor_factory.h"

namespace trace_api = opentelemetry::trace;
namespace trace_sdk = opentelemetry::sdk::trace;

namespace metric_sdk = opentelemetry::sdk::metrics;
namespace metrics_api = opentelemetry::metrics;

namespace otlp = opentelemetry::exporter::otlp;

namespace logs_api = opentelemetry::logs;
namespace logs_sdk = opentelemetry::sdk::logs;

void InitTracer()
{
  trace_sdk::BatchSpanProcessorOptions bspOpts{};
  opentelemetry::exporter::otlp::OtlpGrpcExporterOptions opts;
  opts.endpoint = "localhost:4317";
  opts.use_ssl_credentials = true;
  opts.ssl_credentials_cacert_as_string = "ssl-certificate";
  auto exporter  = otlp::OtlpGrpcExporterFactory::Create(opts);
  auto processor = trace_sdk::BatchSpanProcessorFactory::Create(std::move(exporter), bspOpts);
  std::shared_ptr<opentelemetry::trace_api::TracerProvider> provider =
      trace_sdk::TracerProviderFactory::Create(std::move(processor));
  // グローバルトレースプロバイダーを設定する
  trace_api::Provider::SetTracerProvider(provider);
}

void InitMetrics()
{
  otlp::OtlpGrpcMetricExporterOptions opts;
  opts.endpoint = "localhost:4317";
  opts.use_ssl_credentials = true;
  opts.ssl_credentials_cacert_as_string = "ssl-certificate";
  auto exporter = otlp::OtlpGrpcMetricExporterFactory::Create(opts);
  metric_sdk::PeriodicExportingMetricReaderOptions reader_options;
  reader_options.export_interval_millis = std::chrono::milliseconds(1000);
  reader_options.export_timeout_millis  = std::chrono::milliseconds(500);
  auto reader = metric_sdk::PeriodicExportingMetricReaderFactory::Create(std::move(exporter), reader_options);
  auto context = metric_sdk::MeterContextFactory::Create();
  context->AddMetricReader(std::move(reader));
  auto u_provider = metric_sdk::MeterProviderFactory::Create(std::move(context));
  std::shared_ptr<opentelemetry::metrics::MeterProvider> provider(std::move(u_provider));
  metrics_api::Provider::SetMeterProvider(provider);
}

void InitLogger()
{
  otlp::OtlpGrpcLogRecordExporterOptions opts;
  opts.endpoint = "localhost:4317";
  opts.use_ssl_credentials = true;
  opts.ssl_credentials_cacert_as_string = "ssl-certificate";
  auto exporter  = otlp::OtlpGrpcLogRecordExporterFactory::Create(opts);
  auto processor = logs_sdk::SimpleLogRecordProcessorFactory::Create(std::move(exporter));
  nostd::shared_ptr<logs_api::LoggerProvider> provider(
      logs_sdk::LoggerProviderFactory::Create(std::move(processor)));
  logs_api::Provider::SetLoggerProvider(provider);
}
```

{{% /tab %}} {{< /tabpane >}}

## コンソール {#console}

計装のデバッグや、開発中にローカルで値を確認するために、テレメトリーデータをコンソール（stdout）に書き込むエクスポーターを使用できます。

[ソースからの OpenTelemetry C++ のビルド](https://github.com/open-telemetry/opentelemetry-cpp/blob/main/INSTALL.md)では、`OStreamSpanExporter` がデフォルトでビルドに含まれています。

```cpp
#include "opentelemetry/exporters/ostream/span_exporter_factory.h"
#include "opentelemetry/sdk/trace/exporter.h"
#include "opentelemetry/sdk/trace/processor.h"
#include "opentelemetry/sdk/trace/simple_processor_factory.h"
#include "opentelemetry/sdk/trace/tracer_provider_factory.h"
#include "opentelemetry/trace/provider.h"

#include "opentelemetry/exporters/ostream/metrics_exporter_factory.h"
#include "opentelemetry/sdk/metrics/meter_provider.h"
#include "opentelemetry/sdk/metrics/meter_provider_factory.h"
#include "opentelemetry/metrics/provider.h"

#include "opentelemetry/exporters/ostream/log_record_exporter_factory.h"
#include "opentelemetry/logs/provider.h"
#include "opentelemetry/sdk/logs/logger_provider_factory.h"
#include "opentelemetry/sdk/logs/processor.h"
#include "opentelemetry/sdk/logs/simple_log_record_processor_factory.h"

namespace trace_api      = opentelemetry::trace;
namespace trace_sdk      = opentelemetry::sdk::trace;
namespace trace_exporter = opentelemetry::exporter::trace;

namespace metrics_sdk      = opentelemetry::sdk::metrics;
namespace metrics_api      = opentelemetry::metrics;
namespace metrics_exporter = opentelemetry::exporter::metrics;

namespace logs_api = opentelemetry::logs;
namespace logs_sdk = opentelemetry::sdk::logs;
namespace logs_exporter = opentelemetry::exporter::logs;

void InitTracer()
{
  auto exporter  = trace_exporter::OStreamSpanExporterFactory::Create();
  auto processor = trace_sdk::SimpleSpanProcessorFactory::Create(std::move(exporter));
  std::shared_ptr<opentelemetry::trace::TracerProvider> provider = trace_sdk::TracerProviderFactory::Create(std::move(processor));
  trace_api::Provider::SetTracerProvider(provider);
}

void InitMetrics()
{
    auto exporter = metrics_exporter::OStreamMetricExporterFactory::Create();
    auto u_provider = metrics_sdk::MeterProviderFactory::Create();
    std::shared_ptr<opentelemetry::metrics::MeterProvider> provider(std::move(u_provider));
    auto *p = static_cast<metrics_sdk::MeterProvider *>(u_provider.get());
    p->AddMetricReader(std::move(exporter));
    metrics_api::Provider::SetMeterProvider(provider);
}

void InitLogger()
{
  auto exporter = logs_exporter::OStreamLogRecordExporterFactory::Create();
  auto processor = logs_sdk::SimpleLogRecordProcessorFactory::Create(std::move(exporter));
  nostd::shared_ptr<logs_api::LoggerProvider> provider(
      logs_sdk::LoggerProviderFactory::Create(std::move(processor)));
  logs_api::Provider::SetLoggerProvider(provider);
}
```

{{% include "exporters/jaeger.md" %}}

{{% include "exporters/prometheus-setup.md" %}}

## 依存関係 {#prometheus-dependencies}

トレースデータを [Prometheus](https://prometheus.io/) に送信するには、[ソースからの OpenTelemetry C++ のビルド](https://github.com/open-telemetry/opentelemetry-cpp/blob/main/INSTALL.md)時に適切な cmake ビルド変数が設定されていることを確認してください。

```shell
cmake -DWITH_PROMETHEUS=ON ...
```

OpenTelemetry の設定を更新して、[Prometheus Exporter](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/exporters/prometheus) を使用するようにします。

```cpp
#include "opentelemetry/exporters/prometheus/exporter_factory.h"
#include "opentelemetry/exporters/prometheus/exporter_options.h"
#include "opentelemetry/metrics/provider.h"
#include "opentelemetry/sdk/metrics/meter_provider.h"
#include "opentelemetry/sdk/metrics/meter_provider_factory.h"

namespace metrics_sdk      = opentelemetry::sdk::metrics;
namespace metrics_api      = opentelemetry::metrics;
namespace metrics_exporter = opentelemetry::exporter::metrics;

void InitMetrics()
{
    metrics_exporter::PrometheusExporterOptions opts;
    opts.url = "localhost:9464";
    auto prometheus_exporter = metrics_exporter::PrometheusExporterFactory::Create(opts);
    auto u_provider = metrics_sdk::MeterProviderFactory::Create();
    auto *p = static_cast<metrics_sdk::MeterProvider *>(u_provider.get());
    p->AddMetricReader(std::move(prometheus_exporter));
    std::shared_ptr<metrics_api::MeterProvider> provider(std::move(u_provider));
    metrics_api::Provider::SetMeterProvider(provider);
}
```

上記の設定により、<http://localhost:9464/metrics> でメトリクスにアクセスできます。
Prometheus または Prometheus レシーバーを持つ OpenTelemetry Collector が、このエンドポイントからメトリクスをスクレイプできます。

{{% include "exporters/zipkin-setup.md" %}}

## 依存関係 {#zipkin-dependencies}

トレースデータを [Zipkin](https://zipkin.io/) に送信するには、[ソースからの OpenTelemetry C++ のビルド](https://github.com/open-telemetry/opentelemetry-cpp/blob/main/INSTALL.md)時に適切な cmake ビルド変数が設定されていることを確認してください。

```shell
cmake -DWITH_ZIPKIN=ON ...
```

OpenTelemetry の設定を更新して、[Zipkin Exporter](https://github.com/open-telemetry/opentelemetry-cpp/tree/main/exporters/zipkin) を使用し、Zipkin バックエンドにデータを送信するようにします。

```cpp
#include "opentelemetry/exporters/zipkin/zipkin_exporter_factory.h"
#include "opentelemetry/sdk/resource/resource.h"
#include "opentelemetry/sdk/trace/processor.h"
#include "opentelemetry/sdk/trace/simple_processor_factory.h"
#include "opentelemetry/sdk/trace/tracer_provider_factory.h"
#include "opentelemetry/trace/provider.h"

namespace trace     = opentelemetry::trace;
namespace trace_sdk = opentelemetry::sdk::trace;
namespace zipkin    = opentelemetry::exporter::zipkin;
namespace resource  = opentelemetry::sdk::resource;

void InitTracer()
{
  zipkin::ZipkinExporterOptions opts;
  resource::ResourceAttributes attributes = {{"service.name", "zipkin_demo_service"}};
  auto resource                           = resource::Resource::Create(attributes);
  auto exporter                           = zipkin::ZipkinExporterFactory::Create(opts);
  auto processor = trace_sdk::SimpleSpanProcessorFactory::Create(std::move(exporter));
  std::shared_ptr<opentelemetry::trace::TracerProvider> provider =
      trace_sdk::TracerProviderFactory::Create(std::move(processor), resource);
  // グローバルトレースプロバイダーを設定する
  trace::Provider::SetTracerProvider(provider);
}
```

{{% include "exporters/outro.md" `https://opentelemetry-cpp.readthedocs.io/en/latest/otel_docs/classopentelemetry_1_1sdk_1_1trace_1_1SpanExporter.html` %}}

{{< tabpane text=true >}} {{% tab Batch %}}

```cpp
#include "opentelemetry/exporters/otlp/otlp_http_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_http_exporter_options.h"
#include "opentelemetry/sdk/trace/processor.h"
#include "opentelemetry/sdk/trace/batch_span_processor_factory.h"
#include "opentelemetry/sdk/trace/batch_span_processor_options.h"

opentelemetry::sdk::trace::BatchSpanProcessorOptions options{};

auto exporter  = opentelemetry::exporter::otlp::OtlpHttpExporterFactory::Create(opts);
auto processor = opentelemetry::sdk::trace::BatchSpanProcessorFactory::Create(std::move(exporter), options);
```

{{% /tab %}} {{% tab Simple %}}

```cpp
#include "opentelemetry/exporters/otlp/otlp_http_exporter_factory.h"
#include "opentelemetry/exporters/otlp/otlp_http_exporter_options.h"
#include "opentelemetry/sdk/trace/processor.h"
#include "opentelemetry/sdk/trace/simple_processor_factory.h"

auto exporter  = opentelemetry::exporter::otlp::OtlpHttpExporterFactory::Create(opts);
auto processor = opentelemetry::sdk::trace::SimpleSpanProcessorFactory::Create(std::move(exporter));
```

{{< /tab >}} {{< /tabpane>}}
