---
title: エクスポーター
aliases: [exporting_data]
weight: 50
default_lang_commit: 813498074d85258c7180d137ace9e272d0149353
# prettier-ignore
cSpell:ignore: autoexport otlplog otlploggrpc otlploghttp otlpmetric otlpmetricgrpc otlpmetrichttp otlptrace otlptracegrpc otlptracehttp sdkmetric sdktrace stdoutlog stdouttrace
---

{{% docs/languages/exporters/intro %}}

## 環境変数によるエクスポーターの自動設定 {#automatic-exporter-configuration-with-environment-variables}

[`go.opentelemetry.io/contrib/exporters/autoexport`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport) パッケージを用いることで、[標準の OpenTelemetry 環境変数](/docs/specs/otel/configuration/sdk-environment-variables/)を使用してエクスポーターを自動的に設定できます。

このパッケージは、**エクスポーターセレクター**環境変数を読み取り、実行時に適切なエクスポーターを選択して初期化するファクトリ関数を提供します。

| 関数                                                                                                     | 環境変数                | 説明                           |
| -------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------ |
| [`NewSpanExporter`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewSpanExporter) | `OTEL_TRACES_EXPORTER`  | トレースエクスポーターを作成   |
| [`NewMetricReader`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewMetricReader) | `OTEL_METRICS_EXPORTER` | メトリクスエクスポーターを作成 |
| [`NewLogExporter`](https://pkg.go.dev/go.opentelemetry.io/contrib/exporters/autoexport#NewLogExporter)   | `OTEL_LOGS_EXPORTER`    | ログエクスポーターを作成       |

セレクター変数でサポートされる値は、`otlp` (デフォルト) と `none` です。
`OTEL_METRICS_EXPORTER` では、`prometheus` もサポートされています。
エクスポーターが選択されると、そのエクスポーターの設定 (エンドポイント、ヘッダー、タイムアウト、プロトコルなど) は、基となる OTLP エクスポーターパッケージにより、標準の [OTLP エクスポーター環境変数](/docs/languages/sdk-configuration/otlp-exporter/)から読み取られます。

使用例:

```go
import (
	"context"

	"go.opentelemetry.io/contrib/exporters/autoexport"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func main() {
	ctx := context.Background()

	// 環境変数によるトレースエクスポーターの作成
	spanExporter, err := autoexport.NewSpanExporter(ctx)
	if err != nil {
		// エラー処理
	}

	// エクスポーターを使用したトレースプロバイダーの作成
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(spanExporter),
	)

	// 環境変数によるメトリクスリーダーの作成
	metricReader, err := autoexport.NewMetricReader(ctx)
	if err != nil {
		// エラー処理
	}

	// リーダーを使用したメータープロバイダーの作成
	meterProvider := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(metricReader),
	)
}
```

> [!NOTE]
>
> 標準の OTLP エクスポーターパッケージ (`otlptracegrpc`、`otlptracehttp` など) は、`OTEL_EXPORTER_OTLP_ENDPOINT`、`OTEL_EXPORTER_OTLP_HEADERS`、`OTEL_EXPORTER_OTLP_TIMEOUT`、`OTEL_EXPORTER_OTLP_COMPRESSION` など、ほとんどの OTLP 環境変数をすでに読み取っています。
>
> `autoexport` パッケージにより、**エクスポーターセレクター変数** (`OTEL_TRACES_EXPORTER`、`OTEL_METRICS_EXPORTER`、`OTEL_LOGS_EXPORTER`) のサポートが追加されます。
> これらの変数で、_どの_ エクスポーター実装を使うかを選択します。
> この分離により、明示的にインポートしない限り、エクスポーターの依存関係 (gRPC など) をバンドルしないため、バイナリサイズを小さくすることができます。
>
> なお、`OTEL_SDK_DISABLED` は現在、Go SDK ではサポートされていません。

Go SDK と contrib パッケージでサポートされる環境変数の完全な概要については、[OpenTelemetry 仕様準拠マトリクス](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md)を参照してください。

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
