---
title: エクスポーター
aliases: [exporting_data]
weight: 50
default_lang_commit: adc4264c2926e3d767b6a56affb19fb4ae3f2a22
# prettier-ignore
cSpell:ignore: otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro %}}

## コンソール {#console}

コンソールエクスポーターは開発およびデバッグタスクに役立ち、設定が最も簡単です。

### コンソールトレース {#console-traces}

[`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdouttrace)パッケージには、コンソールトレースエクスポーターの実装が含まれています。

### コンソールメトリクス {#console-metrics}

[`go.opentelemetry.io/otel/exporters/stdout/stdoutmetric`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutmetric)パッケージには、コンソールメトリクスエクスポーターの実装が含まれています。

### コンソールログ（実験的） {#console-logs}

[`go.opentelemetry.io/otel/exporters/stdout/stdoutlog`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/stdout/stdoutlog)パッケージには、コンソールログエクスポーターの実装が含まれています。

## OTLP {#otlp}

OTLPエンドポイント（[コレクター](/docs/collector)やJaeger >= v1.35.0など）にトレースデータを送信するには、エンドポイントに送信するOTLPエクスポーターを設定する必要があります。

### HTTP経由のOTLPトレース {#otlp-traces-over-http}

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)には、バイナリprotobufペイロードを使用したHTTPによるOTLPトレースエクスポーターの実装が含まれています。

### gRPC経由のOTLPトレース {#otlp-traces-over-grpc}

[`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc)には、gRPCを使用したOTLPトレースエクスポーターの実装が含まれています。

### Jaeger {#jaeger}

OTLPエクスポーターを試すために、v1.35.0以降では[Jaeger](https://www.jaegertracing.io/)をOTLPエンドポイントおよびトレース可視化用にDockerコンテナで実行できます。

```shell
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

### HTTP経由のOTLPメトリクス {#otlp-metrics-over-http}

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp)には、バイナリprotobufペイロードを使用したHTTPによるOTLPメトリクスエクスポーターの実装が含まれています。

### gRPC経由のOTLPメトリクス {#otlp-metrics-over-grpc}

[`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc)には、gRPCを使用したOTLPメトリクスエクスポーターの実装が含まれています。

### HTTP経由のOTLPログ（実験的） {#otlp-logs-over-http-experimental}

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp)には、バイナリprotobufペイロードを使用したHTTPによるOTLPログエクスポーターの実装が含まれています。

### gRPC経由のOTLPログ（実験的） {#otlp-logs-over-grpc-experimental}

[`go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc)には、gRPCを使用したOTLPログエクスポーターの実装が含まれています。

## Prometheus（実験的） {#prometheus-experimental}

Prometheusエクスポーターは、PrometheusスクレイプHTTPエンドポイント経由でメトリクスを報告するために使用されます。

[`go.opentelemetry.io/otel/exporters/prometheus`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/prometheus)には、Prometheusメトリクスエクスポーターの実装が含まれています。

Prometheusエクスポーターの使用方法について詳しく学ぶには、[prometheus example](https://github.com/open-telemetry/opentelemetry-go-contrib/tree/main/examples/prometheus)を試してください。
