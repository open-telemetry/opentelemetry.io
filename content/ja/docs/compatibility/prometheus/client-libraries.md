---
title: Prometheus クライアントライブラリ vs. OpenTelemetry
linkTitle: クライアントライブラリ
default_lang_commit: c88a006471f039334aed7990736e089a62b33f94
cSpell:ignore: hvac
---

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>

> [!NOTE]
>
> このページでは Java と Go を扱います。
> 他の言語の例も追加予定です。

このガイドは、[Prometheus クライアントライブラリ](https://prometheus.io/docs/instrumenting/clientlibs/)に慣れている開発者が、OpenTelemetry メトリクス API と SDK における同等のパターンを理解するためのものです。
よく使われるパターンを網羅していますが、すべてを扱っているわけではありません。

## コンセプトの違い {#conceptual-differences}

コードを見る前に、2つのシステム間のいくつかの構造的な違いを理解しておくと役立ちます。
[Prometheus と OpenMetrics の互換性](/docs/specs/otel/compatibility/prometheus_and_openmetrics/)仕様には、2つのシステム間の完全な変換ルールが文書化されています。
このセクションでは、新しい計装コードを書く際にもっとも関連する違いについて説明します。

### レジストリ（MeterProvider） {#registry-meterprovider}

Prometheus では、メトリクスはレジストリに登録されます。デフォルトではグローバルなレジストリです。
コード内のどこでもメトリクスを宣言でき、登録されるとスクレイピング可能になります。
エクスポーター（HTTP サーバーまたは OTLP プッシュ）は、別の独立したステップとしてレジストリに接続されます。

OpenTelemetry では、`MeterProvider` と `Meter` はメトリクス API の一部です。
`MeterProvider` から、ライブラリまたはコンポーネントにスコープされた `Meter` を取得し、その `Meter` からインスツルメントを作成します。
それらの計測がどのように処理されるか、つまりどのエクスポーターが受信し、どのように集約され、どのスケジュールで処理されるかは、`MeterProvider` にバインドされた SDK とその設定によって決まります。
これは計装コード自体とは切り離されています（[API と SDK](#otel-api-and-sdk) を参照）。

Prometheus と同様に、OpenTelemetry もグローバルな `MeterProvider`（計装コードからの明示的な配線が不要）と、明示的な `MeterProvider` インスタンス（それをサポートするライブラリに渡すことができる）の両方をサポートしています。

### ラベル名（属性） {#label-names-attributes}

Prometheus では、ラベルの _名前_ をメトリクス作成時に宣言する必要があります。
ラベルの _値_ は、`labelValues(...)` を介して記録時にバインドされます。

OpenTelemetry には、事前のラベル宣言がありません。
属性のキーと値は、`Attributes` を介して計測時にまとめて提供されます。

### 命名規則 {#naming-conventions}

Prometheus は `snake_case` のメトリクス名を使用します。
カウンター名は `_total` で終わります。
慣例として、Prometheus のメトリクス名には、衝突を避けるためにアプリケーションまたはライブラリ名のプレフィックスが付けられます（たとえば `smart_home_hvac_on_seconds_total`）。
すべてのメトリクスがフラットなグローバル名前空間を共有するためです。

OpenTelemetry は慣例として[ドット区切りの名前](/docs/specs/semconv/general/naming/)を使用します。
所有権と名前空間は計装スコープ（`Meter` 名、たとえば `smart.home`）で表現されるため、メトリクス名自体にプレフィックスは不要です（たとえば `hvac.on`）。
Prometheus にエクスポートする際、エクスポーターは名前を変換します。ドットはアンダースコアに変わり、単位の略語は完全な単語に展開され（たとえば `s` → `seconds`）、カウンターには `_total` サフィックスが付きます。
`hvac.on` という名前で単位 `s` の OpenTelemetry カウンターは、`hvac_on_seconds_total` としてエクスポートされます。
名前変換ルールの完全なセットについては、[互換性仕様](/docs/specs/otel/compatibility/prometheus_and_openmetrics/)を参照してください。
変換戦略は設定可能です。たとえば、UTF-8 文字を保持したり、単位や型のサフィックスを抑制したりできます。
詳細は [Prometheus エクスポーター](/docs/specs/otel/metrics/sdk_exporters/prometheus/)設定リファレンスを参照してください。

### ステートフルインスツルメントとコールバックインスツルメント {#stateful-and-callback-instruments}

両方のシステムは2つの記録モードをサポートしています。

- **Prometheus** は、_ステートフル_ インスツルメント（`Counter`、`Gauge`）と、スクレイプ時にコールバックを呼び出して現在の値を返す関数ベースのインスツルメントを区別します。
  前者は自身の累積値を保持します。
  命名はクライアントライブラリによって異なります（Go では `GaugeFunc`/`CounterFunc`、Java では `GaugeWithCallback`/`CounterWithCallback`）。
- **OpenTelemetry** はこれらを _同期_ （counter、histogram など）と _非同期_ （登録されたコールバックで観測される）と呼びます。
  セマンティクスは同じです。

また、Prometheus の `Gauge` は2つの異なる OTel インスツルメントタイプに対応することにも注意してください。非加算的な値（温度など）の `Gauge` と、増減可能な加算的な値（アクティブ接続数など）の `UpDownCounter` です。
詳細は [Gauge](#gauge) を参照してください。

### OTel: API と SDK {#otel-api-and-sdk}

OpenTelemetry は、計装と設定を2層設計で分離しています。**API** パッケージと **SDK** パッケージです。
API はメトリクスの記録に使用されるインターフェースを定義します。
SDK は実装を提供します。具体的なプロバイダー、エクスポーター、処理パイプラインです。

計装コードは API のみに依存すべきです。
SDK はアプリケーション起動時に一度設定され、コードベースの他の部分に渡される API リファレンスに紐づけられます。
これにより、計装ライブラリコードが特定の SDK バージョンから切り離され、テスト用に no-op 実装に差し替えることが容易になります。

### OTel: 計装スコープ {#otel-instrumentation-scope}

Prometheus のメトリクスはグローバルです。プロセス内のすべてのメトリクスが同じフラットな名前空間を共有し、名前とラベルのみで識別されます。

OpenTelemetry は各インスツルメントグループを `Meter` にスコープします。`Meter` は名前とオプションのバージョン（たとえば `smart.home`）で識別されます。
Prometheus にエクスポートする際、スコープ名とバージョンはすべてのメトリクスポイントに `otel_scope_name` と `otel_scope_version` ラベルとして追加されます。
追加のスコープ属性もラベルとして追加され、`otel_scope_[attr name]` と名付けられます。
これらのラベルは自動的に表示されるため、Prometheus から来たユーザーには馴染みがないかもしれません。
エクスポーターの `without_scope_info` オプションで抑制できます。詳細は [Prometheus エクスポーター](/docs/specs/otel/metrics/sdk_exporters/prometheus/)設定リファレンスを参照してください。
スコープ情報の抑制は、各メトリクス名が単一のスコープによって生成される場合にのみ安全です。
2つのスコープが同じ名前のメトリクスを出力する場合、スコープラベルがそれらを区別する唯一の手段です。
これらのラベルがなければ、重複した時系列がオリジンを区別する方法なく生成され、Prometheus で無効な出力となります。

### OTel: 集約テンポラリティ {#otel-aggregation-temporality}

Prometheus のメトリクスは常に累積的です。
OpenTelemetry は累積とデルタの両方のテンポラリティをサポートしますが、Prometheus エクスポーターはすべてのインスツルメントに累積を強制します。
Prometheus から移行する開発者にとって、これは透過的です。すでに依存している動作が保持されます。

### OTel: リソース属性 {#otel-resource-attributes}

Prometheus は `job` と `instance` ラベルを使用してスクレイプターゲットを識別します。これらは Prometheus サーバーによってスクレイプ時に追加されます。

OpenTelemetry には `Resource` があります。これはプロセスからのすべてのテレメトリーに付与される構造化メタデータで、`service.name` や `service.instance.id` などの属性を持ちます。
Prometheus にエクスポートする際、エクスポーターはリソース属性を `job` と `instance` ラベルにマッピングし、残りの属性は `target_info` メトリクスに公開されます（`target_info` は OpenMetrics 1.0 の規約です。Prometheus から手動で `target_info` を現在出力している場合、OTel での同等の方法はリソース属性を設定することです）。
正確なマッピングルールについては、[互換性仕様](/docs/specs/otel/compatibility/prometheus_and_openmetrics/)を参照してください。
`target_info` メトリクスは `without_target_info` で抑制でき、特定のリソース属性は `with_resource_constant_labels` でメトリクスレベルのラベルに昇格できます。
詳細は [Prometheus エクスポーター](/docs/specs/otel/metrics/sdk_exporters/prometheus/)設定リファレンスを参照してください。

## 初期化 {#initialization}

以下の例では、2つの主要なデプロイパターンを扱います。Prometheus スクレイプエンドポイントの公開と、OTLP エンドポイントへのプッシュです。

### Prometheus スクレイプエンドポイントの公開 {#expose-a-prometheus-scrape-endpoint}

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt "src/main/java/otel/PrometheusScrapeInit.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Counter;
import io.prometheus.metrics.exporter.httpserver.HTTPServer;
import java.io.IOException;

public class PrometheusScrapeInit {
  public static void main(String[] args) throws IOException, InterruptedException {
    // カウンターを作成し、デフォルトの PrometheusRegistry に登録する。
    Counter doorOpens =
        Counter.builder()
            .name("door_opens_total")
            .help("Total number of times a door has been opened")
            .labelNames("door")
            .register();

    // HTTP サーバーを起動する。Prometheus は http://localhost:9464/metrics をスクレイプする。
    HTTPServer server = HTTPServer.builder().port(9464).buildAndStart();
    Runtime.getRuntime().addShutdownHook(new Thread(server::close));

    doorOpens.labelValues("front").inc();

    Thread.currentThread().join(); // 無限にスリープ
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelScrapeInit.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.exporter.prometheus.PrometheusHttpServer;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;

public class OtelScrapeInit {
  // 属性キーと、値が静的な場合は Attributes オブジェクト全体を事前に割り当てる。
  private static final AttributeKey<String> DOOR = AttributeKey.stringKey("door");
  private static final Attributes FRONT_DOOR = Attributes.of(DOOR, "front");

  public static void main(String[] args) throws InterruptedException {
    // SDK を設定する: /metrics を提供する Prometheus リーダーを登録する。
    OpenTelemetrySdk sdk =
        OpenTelemetrySdk.builder()
            .setMeterProvider(
                SdkMeterProvider.builder()
                    .registerMetricReader(PrometheusHttpServer.builder().setPort(9464).build())
                    .build())
            .build();
    Runtime.getRuntime().addShutdownHook(new Thread(sdk::close));

    // 計装コードは SDK 型ではなく OpenTelemetry API 型を使用する。
    OpenTelemetry openTelemetry = sdk;

    // メトリクスは http://localhost:9464/metrics で提供される。
    Meter meter = openTelemetry.getMeter("smart.home");
    LongCounter doorOpens =
        meter
            .counterBuilder("door.opens")
            .setDescription("Total number of times a door has been opened")
            .build();

    doorOpens.add(1, FRONT_DOOR);

    Thread.currentThread().join(); // 無限にスリープ
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_scrape_init.go"?>

```go
package main

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	// カウンターを作成し、カスタムレジストリに登録する。
	reg := prometheus.NewRegistry()
	doorOpens := prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "door_opens_total",
		Help: "Total number of times a door has been opened",
	}, []string{"door"})
	reg.MustRegister(doorOpens)

	// Prometheus は http://localhost:9464/metrics をスクレイプする。
	http.Handle("/metrics", promhttp.HandlerFor(reg, promhttp.HandlerOpts{}))
	go http.ListenAndServe(":9464", nil) //nolint:errcheck

	doorOpens.WithLabelValues("front").Inc()

	select {} // 無限にスリープ
}
```

OpenTelemetry

<?code-excerpt "otel_scrape_init.go"?>

```go
package main

import (
	"context"
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/prometheus"
	"go.opentelemetry.io/otel/metric"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
)

func main() {
	ctx := context.Background()
	// SDK を設定する: /metrics を提供する Prometheus リーダーを登録する。
	exporter, err := prometheus.New()
	if err != nil {
		panic(err)
	}
	provider := sdkmetric.NewMeterProvider(sdkmetric.WithReader(exporter))
	defer provider.Shutdown(ctx) //nolint:errcheck

	// メトリクスは http://localhost:9464/metrics で提供される。
	http.Handle("/metrics", promhttp.Handler())
	go http.ListenAndServe(":9464", nil) //nolint:errcheck

	// 計装コードは SDK ではなく API を直接使用する。
	meter := provider.Meter("smart.home")
	doorOpens, err := meter.Int64Counter("door.opens",
		metric.WithDescription("Total number of times a door has been opened"))
	if err != nil {
		panic(err)
	}

	doorOpens.Add(ctx, 1, metric.WithAttributes(attribute.String("door", "front")))

	select {} // 無限にスリープ
}
```

{{% /tab %}} {{< /tabpane >}}

### OTLP エンドポイントへのメトリクスプッシュ {#push-metrics-to-an-otlp-endpoint}

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusOtlpInit.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Counter;
import io.prometheus.metrics.exporter.opentelemetry.OpenTelemetryExporter;

public class PrometheusOtlpInit {
  public static void main(String[] args) throws Exception {
    // カウンターを作成し、デフォルトの PrometheusRegistry に登録する。
    Counter doorOpens =
        Counter.builder()
            .name("door_opens_total")
            .help("Total number of times a door has been opened")
            .labelNames("door")
            .register();

    // OTLP エクスポーターを起動する。デフォルトの PrometheusRegistry から読み取り、
    // 設定されたエンドポイントに一定間隔でメトリクスをプッシュする。
    OpenTelemetryExporter exporter =
        OpenTelemetryExporter.builder()
            .protocol("http/protobuf")
            .endpoint("http://localhost:4318")
            .intervalSeconds(60)
            .buildAndStart();
    Runtime.getRuntime().addShutdownHook(new Thread(exporter::close));

    doorOpens.labelValues("front").inc();

    Thread.currentThread().join(); // 無限にスリープ
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelOtlpInit.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import java.time.Duration;

public class OtelOtlpInit {
  public static void main(String[] args) throws InterruptedException {
    // SDK を設定する: OTLP/HTTP でメトリクスを一定間隔でエクスポートする。
    OpenTelemetrySdk sdk =
        OpenTelemetrySdk.builder()
            .setMeterProvider(
                SdkMeterProvider.builder()
                    .registerMetricReader(
                        PeriodicMetricReader.builder(
                                OtlpHttpMetricExporter.builder()
                                    .setEndpoint("http://localhost:4318")
                                    .build())
                            .setInterval(Duration.ofSeconds(60))
                            .build())
                    .build())
            .build();
    Runtime.getRuntime().addShutdownHook(new Thread(sdk::close));

    // 計装コードは SDK 型ではなく OpenTelemetry API 型を使用する。
    OpenTelemetry openTelemetry = sdk;

    Meter meter = openTelemetry.getMeter("smart.home");
    LongCounter doorOpens =
        meter
            .counterBuilder("door.opens")
            .setDescription("Total number of times a door has been opened")
            .build();

    doorOpens.add(1);

    Thread.currentThread().join(); // 無限にスリープ
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

Prometheus Go クライアントライブラリには OTLP プッシュエクスポーターは含まれていません。

OpenTelemetry

<?code-excerpt "otel_otlp_init.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/metric"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
)

func main() {
	ctx := context.Background()
	// SDK を設定する: OTLP/HTTP でメトリクスを一定間隔でエクスポートする。
	// エンドポイントのデフォルトは localhost:4318 で、
	// OTEL_EXPORTER_OTLP_ENDPOINT 環境変数で設定可能。
	exporter, err := otlpmetrichttp.New(ctx)
	if err != nil {
		panic(err)
	}
	provider := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter)),
	)
	defer provider.Shutdown(ctx) //nolint:errcheck

	meter := provider.Meter("smart.home")
	doorOpens, err := meter.Int64Counter("door.opens",
		metric.WithDescription("Total number of times a door has been opened"))
	if err != nil {
		panic(err)
	}

	doorOpens.Add(ctx, 1, metric.WithAttributes(attribute.String("door", "front")))

	select {} // 無限にスリープ
}
```

{{% /tab %}} {{< /tabpane >}}

## カウンター {#counter}

カウンターは単調増加する値を記録します。
Prometheus の `Counter` は OpenTelemetry の `Counter` インスツルメントに対応します。

- **単位のエンコーディング**: Prometheus はメトリクス名に単位をエンコードします（`hvac_on_seconds_total`）。
  OpenTelemetry は名前（`hvac.on`）と単位（`s`）を分離し、Prometheus エクスポーターが自動的に単位サフィックスを付加します。

### カウンター {#counter-1}

Prometheus の `Counter` には、OpenTelemetry に同等機能がない2つのシリーズ管理機能があります。

- **シリーズの事前初期化**: Prometheus クライアントは、ラベル値の組み合わせを事前に初期化できるため、記録が発生する前にスクレイプ出力に値 0 で表示されます。
  OpenTelemetry にはこの同等機能がなく、データポイントは最初の `add()` 呼び出しで初めて表示されます。
- **事前バインドシリーズ**: Prometheus クライアントは `labelValues()` の結果をキャッシュして、特定のラベル値の組み合わせに事前バインドできます。
  以降の呼び出しは内部のシリーズ検索をスキップして、データポイントに直接アクセスします。
  OpenTelemetry にはこの同等機能がありませんが、[議論中](https://github.com/open-telemetry/opentelemetry-specification/issues/4126)です。

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusCounter.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Counter;

public class PrometheusCounter {
  public static void counterUsage() {
    Counter hvacOnTime =
        Counter.builder()
            .name("hvac_on_seconds_total")
            .help("Total time the HVAC system has been running, in seconds")
            .labelNames("zone")
            .register();

    // ラベル値セットに事前バインドする: 以降の呼び出しは内部のシリーズ検索をスキップして、
    // データポイントに直接アクセスする。
    var upstairs = hvacOnTime.labelValues("upstairs");
    var downstairs = hvacOnTime.labelValues("downstairs");

    upstairs.inc(127.5);
    downstairs.inc(3600.0);

    // ゾーンを事前初期化して、起動時に /metrics に値 0 で表示されるようにする。
    hvacOnTime.initLabelValues("basement");
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelCounter.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleCounter;
import io.opentelemetry.api.metrics.Meter;

public class OtelCounter {
  // 属性キーと、値が静的な場合は Attributes オブジェクト全体を事前に割り当てる。
  private static final AttributeKey<String> ZONE = AttributeKey.stringKey("zone");
  private static final Attributes UPSTAIRS = Attributes.of(ZONE, "upstairs");
  private static final Attributes DOWNSTAIRS = Attributes.of(ZONE, "downstairs");

  public static void counterUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // HVAC の稼働時間は小数値 — ofDoubles() で DoubleCounter を取得する。
    // 事前のラベル宣言なし: 属性は記録時に提供される。
    DoubleCounter hvacOnTime =
        meter
            .counterBuilder("hvac.on")
            .setDescription("Total time the HVAC system has been running")
            .setUnit("s")
            .ofDoubles()
            .build();

    hvacOnTime.add(127.5, UPSTAIRS);
    hvacOnTime.add(3600.0, DOWNSTAIRS);
  }
}
```

主な違い:

- `inc(value)` → `add(value)`。
  Prometheus と異なり、OpenTelemetry では明示的な値が必要です。引数なしの `inc()` ショートハンドはありません。
- OpenTelemetry は `LongCounter`（整数、デフォルト）と `DoubleCounter`（`.ofDoubles()` を介して、小数値用）を区別します。
  Prometheus は単一の `Counter` 型を使用します。
- ホットパスでの呼び出しごとのアロケーションを避けるため、`AttributeKey` インスタンス（常に）と `Attributes` オブジェクト（値が静的な場合）を事前に割り当てます。

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_counter.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var hvacOnTime = prometheus.NewCounterVec(prometheus.CounterOpts{
	Name: "hvac_on_seconds_total",
	Help: "Total time the HVAC system has been running, in seconds",
}, []string{"zone"})

func prometheusCounterUsage(reg *prometheus.Registry) {
	reg.MustRegister(hvacOnTime)

	// ラベル値セットに事前バインドする: 以降の呼び出しはシリーズ検索を避ける。
	upstairs := hvacOnTime.WithLabelValues("upstairs")
	downstairs := hvacOnTime.WithLabelValues("downstairs")

	upstairs.Add(127.5)
	downstairs.Add(3600.0)

	// シリーズを事前初期化して、/metrics に値 0 で表示されるようにする。
	hvacOnTime.WithLabelValues("basement")
}
```

OpenTelemetry

<?code-excerpt "otel_counter.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// 値が静的な場合、呼び出しごとのアロケーションを避けるために属性オプションを事前に割り当てる。
var (
	zoneUpstairsOpts   = []metric.AddOption{metric.WithAttributes(attribute.String("zone", "upstairs"))}
	zoneDownstairsOpts = []metric.AddOption{metric.WithAttributes(attribute.String("zone", "downstairs"))}
)

func otelCounterUsage(ctx context.Context, meter metric.Meter) {
	// 事前のラベル宣言なし: 属性は記録時に提供される。
	hvacOnTime, err := meter.Float64Counter("hvac.on",
		metric.WithDescription("Total time the HVAC system has been running"),
		metric.WithUnit("s"))
	if err != nil {
		panic(err)
	}

	hvacOnTime.Add(ctx, 127.5, zoneUpstairsOpts...)
	hvacOnTime.Add(ctx, 3600.0, zoneDownstairsOpts...)
}
```

主な違い:

- `Add(value)` → `Add(ctx, value, metric.WithAttributes(...))`。
  すべてのインスツルメント呼び出しで、最初の引数に `context.Context` が必要です。
- Go では、`meter.Float64Counter` と `meter.Int64Counter` は別々のメソッドです。
  Prometheus は単一の `Counter` 型を使用します。
- インスツルメントの作成は `(Instrument, error)` を返し、エラーを処理する必要があります。

{{% /tab %}} {{< /tabpane >}}

### コールバック（非同期）カウンター {#callback-async-counter}

コールバックカウンター（OpenTelemetry では非同期カウンター）は、合計値がデバイスやランタイムなどの外部ソースによって管理されている場合に使用します。
自分でインクリメントするのではなく、収集時に値を観測します。

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusCounterCallback.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.CounterWithCallback;

public class PrometheusCounterCallback {
  public static void counterCallbackUsage() {
    // 各ゾーンには累積ジュール合計を追跡するスマートエネルギーメーターがある。
    // コールバックカウンターを使用して、アプリケーションコードで別途カウンターを
    // 管理することなく、スクレイプ時にそれらの値を報告する。
    CounterWithCallback.builder()
        .name("energy_consumed_joules_total")
        .help("Total energy consumed in joules")
        .labelNames("zone")
        .callback(
            callback -> {
              callback.call(SmartHomeDevices.totalEnergyJoules("upstairs"), "upstairs");
              callback.call(SmartHomeDevices.totalEnergyJoules("downstairs"), "downstairs");
            })
        .register();
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelCounterCallback.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;

public class OtelCounterCallback {
  private static final AttributeKey<String> ZONE = AttributeKey.stringKey("zone");
  private static final Attributes UPSTAIRS = Attributes.of(ZONE, "upstairs");
  private static final Attributes DOWNSTAIRS = Attributes.of(ZONE, "downstairs");

  public static void counterCallbackUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // 各ゾーンには累積ジュール合計を追跡するスマートエネルギーメーターがある。
    // 非同期カウンターを使用して、アプリケーションコードで別途カウンターを管理する
    // ことなく、MetricReader がメトリクスを収集する際にそれらの値を報告する。
    meter
        .counterBuilder("energy.consumed")
        .setDescription("Total energy consumed")
        .setUnit("J")
        .ofDoubles()
        .buildWithCallback(
            measurement -> {
              measurement.record(SmartHomeDevices.totalEnergyJoules("upstairs"), UPSTAIRS);
              measurement.record(SmartHomeDevices.totalEnergyJoules("downstairs"), DOWNSTAIRS);
            });
  }
}
```

主な違い:

- OpenTelemetry は整数と浮動小数点のカウンターを区別します。
  `.ofDoubles()` で浮動小数点バリアントを選択します。
  Prometheus の `CounterWithCallback` は常に浮動小数点値を使用します。

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_counter_callback.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

type energyCollector struct{ desc *prometheus.Desc }

func newEnergyCollector() *energyCollector {
	return &energyCollector{desc: prometheus.NewDesc(
		"energy_consumed_joules_total",
		"Total energy consumed in joules",
		[]string{"zone"}, nil,
	)}
}

func (c *energyCollector) Describe(ch chan<- *prometheus.Desc) { ch <- c.desc }
func (c *energyCollector) Collect(ch chan<- prometheus.Metric) {
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.CounterValue, totalEnergyJoules("upstairs"), "upstairs")
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.CounterValue, totalEnergyJoules("downstairs"), "downstairs")
}

func prometheusCounterCallbackUsage(reg *prometheus.Registry) {
	// 各ゾーンには累積ジュール合計を追跡するスマートエネルギーメーターがある。
	// スクレイプ時にそれらの値を報告するために prometheus.Collector を実装する。
	reg.MustRegister(newEnergyCollector())
}
```

OpenTelemetry

<?code-excerpt "otel_counter_callback.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

var (
	zoneUpstairs   = attribute.String("zone", "upstairs")
	zoneDownstairs = attribute.String("zone", "downstairs")
)

func otelCounterCallbackUsage(meter metric.Meter) {
	// 各ゾーンには累積ジュール合計を追跡するスマートエネルギーメーターがある。
	// メトリクス収集時にそれらの値を報告するために observable カウンターを使用する。
	_, err := meter.Float64ObservableCounter("energy.consumed",
		metric.WithDescription("Total energy consumed"),
		metric.WithUnit("J"),
		metric.WithFloat64Callback(func(_ context.Context, o metric.Float64Observer) error {
			o.Observe(totalEnergyJoules("upstairs"), metric.WithAttributes(zoneUpstairs))
			o.Observe(totalEnergyJoules("downstairs"), metric.WithAttributes(zoneDownstairs))
			return nil
		}))
	if err != nil {
		panic(err)
	}
}
```

主な違い:

- Prometheus の例は `prometheus.Collector` を `Describe` と `Collect` メソッドで実装し、ラベル付きカウンター値を報告します。
- OpenTelemetry は `Float64ObservableCounter` と `Int64ObservableCounter` を区別します。

{{% /tab %}} {{< /tabpane >}}

## ゲージ {#gauge}

ゲージは増減可能な瞬時値を記録します。
Prometheus はすべてのそのような値に単一の `Gauge` 型を使用しますが、OpenTelemetry は適切なインスツルメントを選択する際に **加算的** な値と **非加算的** な値を区別します。

- **非加算的** な値は、インスタンス間で意味のある合計を算出できません。たとえば温度です。3つの部屋のセンサーの読み取り値を足しても有用な数値にはなりません。
  これらは OTel の `Gauge` と `ObservableGauge` に対応します。
- **加算的** な値は、インスタンス間で意味のある合計を算出できます。たとえば、サービスインスタンス間で合計した接続デバイス数は有用な合計値になります。
  これらは OTel の `UpDownCounter` と `ObservableUpDownCounter` に対応します。

この区別は、abs、inc と dec、およびコールバックのバリアントを含むすべてのゲージパターンに適用されます。
詳細な説明は[インスツルメント選択ガイド](/docs/specs/otel/metrics/supplementary-guidelines/#instrument-selection)を参照してください。

### ゲージ — abs {#gauge--abs}

絶対値として記録される値（設定値やデバイスのセットポイントなど）にはこのパターンを使用します。
Prometheus の `Gauge` は OpenTelemetry の `Gauge` インスツルメントに対応します。

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusGauge.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Gauge;

public class PrometheusGauge {
  public static void gaugeUsage() {
    Gauge thermostatSetpoint =
        Gauge.builder()
            .name("thermostat_setpoint_celsius")
            .help("Target temperature set on the thermostat")
            .labelNames("zone")
            .register();

    thermostatSetpoint.labelValues("upstairs").set(22.5);
    thermostatSetpoint.labelValues("downstairs").set(20.0);
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelGauge.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleGauge;
import io.opentelemetry.api.metrics.Meter;

public class OtelGauge {
  // 属性キーと、値が静的な場合は Attributes オブジェクト全体を事前に割り当てる。
  private static final AttributeKey<String> ZONE = AttributeKey.stringKey("zone");
  private static final Attributes UPSTAIRS = Attributes.of(ZONE, "upstairs");
  private static final Attributes DOWNSTAIRS = Attributes.of(ZONE, "downstairs");

  public static void gaugeUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    DoubleGauge thermostatSetpoint =
        meter
            .gaugeBuilder("thermostat.setpoint")
            .setDescription("Target temperature set on the thermostat")
            .setUnit("Cel")
            .build();

    thermostatSetpoint.set(22.5, UPSTAIRS);
    thermostatSetpoint.set(20.0, DOWNSTAIRS);
  }
}
```

主な違い:

- `set(value)` → `set(value, attributes)`。
  メソッド名は同じです。
- OpenTelemetry は `LongGauge`（整数、`.ofLongs()` を介して）と `DoubleGauge`（デフォルト）を区別します。
  Prometheus は単一の `Gauge` 型を使用します。
- ホットパスでの呼び出しごとのアロケーションを避けるため、`AttributeKey` インスタンス（常に）と `Attributes` オブジェクト（値が静的な場合）を事前に割り当てます。

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_gauge.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var thermostatSetpoint = prometheus.NewGaugeVec(prometheus.GaugeOpts{
	Name: "thermostat_setpoint_celsius",
	Help: "Target temperature set on the thermostat",
}, []string{"zone"})

func prometheusGaugeUsage(reg *prometheus.Registry) {
	reg.MustRegister(thermostatSetpoint)

	thermostatSetpoint.WithLabelValues("upstairs").Set(22.5)
	thermostatSetpoint.WithLabelValues("downstairs").Set(20.0)
}
```

OpenTelemetry

<?code-excerpt "otel_gauge.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// 値が静的な場合、呼び出しごとのアロケーションを避けるために属性オプションを事前に割り当てる。
var (
	zoneUpstairsGaugeOpts   = []metric.RecordOption{metric.WithAttributes(attribute.String("zone", "upstairs"))}
	zoneDownstairsGaugeOpts = []metric.RecordOption{metric.WithAttributes(attribute.String("zone", "downstairs"))}
)

func otelGaugeUsage(ctx context.Context, meter metric.Meter) {
	thermostatSetpoint, err := meter.Float64Gauge("thermostat.setpoint",
		metric.WithDescription("Target temperature set on the thermostat"),
		metric.WithUnit("Cel"))
	if err != nil {
		panic(err)
	}

	thermostatSetpoint.Record(ctx, 22.5, zoneUpstairsGaugeOpts...)
	thermostatSetpoint.Record(ctx, 20.0, zoneDownstairsGaugeOpts...)
}
```

主な違い:

- `Set(value)` → `Record(ctx, value, metric.WithAttributes(...))`。
- Go では、`meter.Float64Gauge` と `meter.Int64Gauge` は別々のメソッドです。
  Prometheus は単一の `Gauge` 型を使用します。

{{% /tab %}} {{< /tabpane >}}

### コールバックゲージ — abs {#callback-gauge--abs}

コールバックゲージ（OpenTelemetry では非同期ゲージ）は、センサーの読み取り値のような非加算的な値が外部で管理されている場合に、自分で追跡するのではなく収集時に観測するために使用します。

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusGaugeCallback.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.GaugeWithCallback;

public class PrometheusGaugeCallback {
  public static void gaugeCallbackUsage() {
    // 温度センサーはファームウェア内で自身の読み取り値を管理している。
    // コールバックゲージを使用して、アプリケーションコードで別途ゲージを
    // 管理することなく、スクレイプ時にそれらの値を報告する。
    GaugeWithCallback.builder()
        .name("room_temperature_celsius")
        .help("Current temperature in the room")
        .labelNames("room")
        .callback(
            callback -> {
              callback.call(SmartHomeDevices.livingRoomTemperatureCelsius(), "living_room");
              callback.call(SmartHomeDevices.bedroomTemperatureCelsius(), "bedroom");
            })
        .register();
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelGaugeCallback.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;

public class OtelGaugeCallback {
  private static final AttributeKey<String> ROOM = AttributeKey.stringKey("room");
  private static final Attributes LIVING_ROOM = Attributes.of(ROOM, "living_room");
  private static final Attributes BEDROOM = Attributes.of(ROOM, "bedroom");

  public static void gaugeCallbackUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // 温度センサーはファームウェア内で自身の読み取り値を管理している。
    // 非同期ゲージを使用して、アプリケーションコードで別途ゲージを管理することなく、
    // MetricReader がメトリクスを収集する際にそれらの値を報告する。
    meter
        .gaugeBuilder("room.temperature")
        .setDescription("Current temperature in the room")
        .setUnit("Cel")
        .buildWithCallback(
            measurement -> {
              measurement.record(SmartHomeDevices.livingRoomTemperatureCelsius(), LIVING_ROOM);
              measurement.record(SmartHomeDevices.bedroomTemperatureCelsius(), BEDROOM);
            });
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_gauge_callback.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

type temperatureCollector struct{ desc *prometheus.Desc }

func newTemperatureCollector() *temperatureCollector {
	return &temperatureCollector{desc: prometheus.NewDesc(
		"room_temperature_celsius",
		"Current temperature in the room",
		[]string{"room"}, nil,
	)}
}

func (c *temperatureCollector) Describe(ch chan<- *prometheus.Desc) { ch <- c.desc }
func (c *temperatureCollector) Collect(ch chan<- prometheus.Metric) {
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.GaugeValue, livingRoomTemperatureCelsius(), "living_room")
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.GaugeValue, bedroomTemperatureCelsius(), "bedroom")
}

func prometheusGaugeCallbackUsage(reg *prometheus.Registry) {
	// 温度センサーはファームウェア内で自身の読み取り値を管理している。
	// スクレイプ時にそれらの値を報告するために prometheus.Collector を実装する。
	reg.MustRegister(newTemperatureCollector())
}
```

OpenTelemetry

<?code-excerpt "otel_gauge_callback.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

var (
	roomLivingRoom = attribute.String("room", "living_room")
	roomBedroom    = attribute.String("room", "bedroom")
)

func otelGaugeCallbackUsage(meter metric.Meter) {
	// 温度センサーはファームウェア内で自身の読み取り値を管理している。
	// メトリクス収集時にそれらの値を報告するために observable ゲージを使用する。
	_, err := meter.Float64ObservableGauge("room.temperature",
		metric.WithDescription("Current temperature in the room"),
		metric.WithUnit("Cel"),
		metric.WithFloat64Callback(func(_ context.Context, o metric.Float64Observer) error {
			o.Observe(livingRoomTemperatureCelsius(), metric.WithAttributes(roomLivingRoom))
			o.Observe(bedroomTemperatureCelsius(), metric.WithAttributes(roomBedroom))
			return nil
		}))
	if err != nil {
		panic(err)
	}
}
```

主な違い:

- Prometheus の例は `prometheus.Collector` を `Describe` と `Collect` メソッドで実装し、ラベル付きゲージ値を報告します。

{{% /tab %}} {{< /tabpane >}}

### ゲージ — inc と dec {#gauge--inc-and-dec}

Prometheus の `Gauge` は、接続デバイス数やアクティブセッション数のように徐々に変化する値のインクリメントとデクリメントをサポートします。
OpenTelemetry の `Gauge` は絶対値のみを記録するため、このパターンは OpenTelemetry の `UpDownCounter` インスツルメントに対応します。

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusUpDownCounter.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Gauge;

public class PrometheusUpDownCounter {
  public static void upDownCounterUsage() {
    // Prometheus は増減可能な値に Gauge を使用する。
    Gauge devicesConnected =
        Gauge.builder()
            .name("devices_connected")
            .help("Number of smart home devices currently connected")
            .labelNames("device_type")
            .register();

    // デバイス接続時にインクリメント、切断時にデクリメントする。
    devicesConnected.labelValues("thermostat").inc();
    devicesConnected.labelValues("thermostat").inc();
    devicesConnected.labelValues("lock").inc();
    devicesConnected.labelValues("lock").dec();
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelUpDownCounter.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongUpDownCounter;
import io.opentelemetry.api.metrics.Meter;

public class OtelUpDownCounter {
  // 属性キーと、値が静的な場合は Attributes オブジェクト全体を事前に割り当てる。
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void upDownCounterUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    LongUpDownCounter devicesConnected =
        meter
            .upDownCounterBuilder("devices.connected")
            .setDescription("Number of smart home devices currently connected")
            .build();

    // add() は正の値と負の値の両方を受け付ける。
    devicesConnected.add(1, THERMOSTAT);
    devicesConnected.add(1, THERMOSTAT);
    devicesConnected.add(1, LOCK);
    devicesConnected.add(-1, LOCK);
  }
}
```

主な違い:

- `inc()` / `dec()` → `add(1)` / `add(-1)`。
  `add()` は正の値と負の値の両方を受け付けます。
- Prometheus の型は `Gauge`、OpenTelemetry の型は `LongUpDownCounter`（または `.ofDoubles()` を介した `DoubleUpDownCounter`）です。

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_up_down_counter.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

// Prometheus は増減可能な値に Gauge を使用する。
var devicesConnected = prometheus.NewGaugeVec(prometheus.GaugeOpts{
	Name: "devices_connected",
	Help: "Number of smart home devices currently connected",
}, []string{"device_type"})

func prometheusUpDownCounterUsage(reg *prometheus.Registry) {
	reg.MustRegister(devicesConnected)

	// デバイス接続時にインクリメント、切断時にデクリメントする。
	devicesConnected.WithLabelValues("thermostat").Inc()
	devicesConnected.WithLabelValues("thermostat").Inc()
	devicesConnected.WithLabelValues("lock").Inc()
	devicesConnected.WithLabelValues("lock").Dec()
}
```

OpenTelemetry

<?code-excerpt "otel_up_down_counter.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// 値が静的な場合、呼び出しごとのアロケーションを避けるために属性オプションを事前に割り当てる。
var (
	deviceThermostatAddOpts = []metric.AddOption{metric.WithAttributes(attribute.String("device_type", "thermostat"))}
	deviceLockAddOpts       = []metric.AddOption{metric.WithAttributes(attribute.String("device_type", "lock"))}
)

func otelUpDownCounterUsage(ctx context.Context, meter metric.Meter) {
	devicesConnected, err := meter.Int64UpDownCounter("devices.connected",
		metric.WithDescription("Number of smart home devices currently connected"))
	if err != nil {
		panic(err)
	}

	// Add() は正の値と負の値の両方を受け付ける。
	devicesConnected.Add(ctx, 1, deviceThermostatAddOpts...)
	devicesConnected.Add(ctx, 1, deviceThermostatAddOpts...)
	devicesConnected.Add(ctx, 1, deviceLockAddOpts...)
	devicesConnected.Add(ctx, -1, deviceLockAddOpts...)
}
```

主な違い:

- `Inc()` / `Dec()` → `Add(ctx, 1, ...)` / `Add(ctx, -1, ...)`。
  `Add()` は正の値と負の値の両方を受け付けます。
- Prometheus の型は `Gauge`、OpenTelemetry の型は `Int64UpDownCounter`（または `meter.Float64UpDownCounter` を介した `Float64UpDownCounter`）です。

{{% /tab %}} {{< /tabpane >}}

### コールバックゲージ — inc と dec {#callback-gauge--inc-and-dec}

コールバックゲージ（OpenTelemetry では非同期 UpDownCounter）は、通常 `inc()`/`dec()` で追跡されるような加算的なカウントが、デバイスマネージャーやコネクションプールなどの外部で管理されている場合に、収集時に観測するために使用します。

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusUpDownCounterCallback.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.GaugeWithCallback;

public class PrometheusUpDownCounterCallback {
  public static void upDownCounterCallbackUsage() {
    // デバイスマネージャーが接続デバイスのカウントを管理している。
    // コールバックゲージを使用して、スクレイプ時にその値を報告する。
    GaugeWithCallback.builder()
        .name("devices_connected")
        .help("Number of smart home devices currently connected")
        .labelNames("device_type")
        .callback(
            callback -> {
              callback.call(SmartHomeDevices.connectedDeviceCount("thermostat"), "thermostat");
              callback.call(SmartHomeDevices.connectedDeviceCount("lock"), "lock");
            })
        .register();
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelUpDownCounterCallback.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;

public class OtelUpDownCounterCallback {
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void upDownCounterCallbackUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // デバイスマネージャーが接続デバイスのカウントを管理している。
    // 非同期 UpDownCounter を使用して、MetricReader がメトリクスを収集する際に
    // その値を報告する。
    meter
        .upDownCounterBuilder("devices.connected")
        .setDescription("Number of smart home devices currently connected")
        .buildWithCallback(
            measurement -> {
              measurement.record(SmartHomeDevices.connectedDeviceCount("thermostat"), THERMOSTAT);
              measurement.record(SmartHomeDevices.connectedDeviceCount("lock"), LOCK);
            });
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_up_down_counter_callback.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

type deviceCountCollector struct{ desc *prometheus.Desc }

func newDeviceCountCollector() *deviceCountCollector {
	return &deviceCountCollector{desc: prometheus.NewDesc(
		"devices_connected",
		"Number of smart home devices currently connected",
		[]string{"device_type"}, nil,
	)}
}

func (c *deviceCountCollector) Describe(ch chan<- *prometheus.Desc) { ch <- c.desc }
func (c *deviceCountCollector) Collect(ch chan<- prometheus.Metric) {
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.GaugeValue, float64(connectedDeviceCount("thermostat")), "thermostat")
	ch <- prometheus.MustNewConstMetric(c.desc, prometheus.GaugeValue, float64(connectedDeviceCount("lock")), "lock")
}

func prometheusUpDownCounterCallbackUsage(reg *prometheus.Registry) {
	// デバイスマネージャーが接続デバイスのカウントを管理している。
	// スクレイプ時にそれらの値を報告するために prometheus.Collector を実装する。
	reg.MustRegister(newDeviceCountCollector())
}
```

OpenTelemetry

<?code-excerpt "otel_up_down_counter_callback.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

var (
	deviceThermostat = attribute.String("device_type", "thermostat")
	deviceLock       = attribute.String("device_type", "lock")
)

func otelUpDownCounterCallbackUsage(meter metric.Meter) {
	// デバイスマネージャーが接続デバイスのカウントを管理している。
	// メトリクス収集時にその値を報告するために observable UpDownCounter を使用する。
	_, err := meter.Int64ObservableUpDownCounter("devices.connected",
		metric.WithDescription("Number of smart home devices currently connected"),
		metric.WithInt64Callback(func(_ context.Context, o metric.Int64Observer) error {
			o.Observe(int64(connectedDeviceCount("thermostat")), metric.WithAttributes(deviceThermostat))
			o.Observe(int64(connectedDeviceCount("lock")), metric.WithAttributes(deviceLock))
			return nil
		}))
	if err != nil {
		panic(err)
	}
}
```

主な違い:

- Prometheus の例は `prometheus.Collector` を `Describe` と `Collect` メソッドで実装し、ラベル付きゲージ値を報告します。
- `Int64ObservableUpDownCounter` は `metric.WithInt64Callback` を使用します。

{{% /tab %}} {{< /tabpane >}}

## ヒストグラム {#histogram}

ヒストグラムは一連の計測の分布を記録し、観測のカウント、合計、および設定可能なバケット境界内に収まる数を追跡します。

Prometheus と OpenTelemetry の両方が、クラシック（明示的バケット）ヒストグラムとネイティブ（base2 指数）ヒストグラムをサポートしています。
Prometheus にはさらに `Summary` 型がありますが、OTel には直接的な同等物がありません。以下の [Summary](#summary) を参照してください。

Prometheus の `Histogram` は OpenTelemetry の `Histogram` インスツルメントに対応します。

### クラシック（明示的）ヒストグラム {#classic-explicit-histogram}

両方のシステムがクラシックヒストグラムをサポートしており、固定されたバケット境界が観測を離散的な範囲に分割します。

- **バケット設定**: Prometheus は作成時にインスツルメント自体にバケット境界を宣言します。
  OpenTelemetry では、バケット境界はインスツルメントにヒントとして設定されますが、SDK レベルで設定されたビューによってオーバーライドまたは置換できます。
  この分離により、計装コードが収集設定から独立したままになります。
  境界が指定されず、ビューも設定されていない場合、SDK はミリ秒スケールのレイテンシ用に設計されたデフォルトセット（`[0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000]`）を使用しますが、秒スケールの計測には適していない可能性があります。
  既存のヒストグラムを移行する際は、常に境界を提供するかビューを設定してください。

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusHistogram.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Histogram;

public class PrometheusHistogram {
  public static void histogramUsage() {
    Histogram deviceCommandDuration =
        Histogram.builder()
            .name("device_command_duration_seconds")
            .help("Time to receive acknowledgment from a smart home device")
            .labelNames("device_type")
            .classicUpperBounds(0.1, 0.25, 0.5, 1.0, 2.5, 5.0)
            .register();

    deviceCommandDuration.labelValues("thermostat").observe(0.35);
    deviceCommandDuration.labelValues("lock").observe(0.85);
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelHistogram.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.Meter;
import java.util.List;

public class OtelHistogram {
  // 属性キーと、値が静的な場合は Attributes オブジェクト全体を事前に割り当てる。
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void histogramUsage(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // setExplicitBucketBoundariesAdvice() は SDK へのヒントとしてデフォルトの境界を設定する。
    // SDK レベルで設定されたビューはこのアドバイスよりも優先される。
    DoubleHistogram deviceCommandDuration =
        meter
            .histogramBuilder("device.command.duration")
            .setDescription("Time to receive acknowledgment from a smart home device")
            .setUnit("s")
            .setExplicitBucketBoundariesAdvice(List.of(0.1, 0.25, 0.5, 1.0, 2.5, 5.0))
            .build();

    deviceCommandDuration.record(0.35, THERMOSTAT);
    deviceCommandDuration.record(0.85, LOCK);
  }
}
```

主な違い:

- `observe(value)` → `record(value, attributes)`。
- OpenTelemetry は `LongHistogram`（整数、`.ofLongs()` を介して）と `DoubleHistogram`（デフォルト）を区別します。
  Prometheus は単一の `Histogram` 型を使用します。
- ホットパスでの呼び出しごとのアロケーションを避けるため、`AttributeKey` インスタンス（常に）と `Attributes` オブジェクト（値が静的な場合）を事前に割り当てます。
- SDK のビューは `setExplicitBucketBoundariesAdvice()` で設定された境界をオーバーライドでき、属性フィルタリング、最小/最大値の記録、インスツルメントのリネームなど、ヒストグラム収集の他の側面も設定できます。

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_histogram.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var deviceCommandDuration = prometheus.NewHistogramVec(prometheus.HistogramOpts{
	Name:    "device_command_duration_seconds",
	Help:    "Time to receive acknowledgment from a smart home device",
	Buckets: []float64{0.1, 0.25, 0.5, 1.0, 2.5, 5.0},
}, []string{"device_type"})

func prometheusHistogramUsage(reg *prometheus.Registry) {
	reg.MustRegister(deviceCommandDuration)

	deviceCommandDuration.WithLabelValues("thermostat").Observe(0.35)
	deviceCommandDuration.WithLabelValues("lock").Observe(0.85)
}
```

OpenTelemetry

<?code-excerpt "otel_histogram.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// 値が静的な場合、呼び出しごとのアロケーションを避けるために属性オプションを事前に割り当てる。
var (
	deviceThermostatOpts = []metric.RecordOption{metric.WithAttributes(attribute.String("device_type", "thermostat"))}
	deviceLockOpts       = []metric.RecordOption{metric.WithAttributes(attribute.String("device_type", "lock"))}
)

func otelHistogramUsage(ctx context.Context, meter metric.Meter) {
	// WithExplicitBucketBoundaries は SDK へのヒントとしてデフォルトの境界を設定する。
	// SDK レベルで設定されたビューはこのヒントよりも優先される。
	deviceCommandDuration, err := meter.Float64Histogram("device.command.duration",
		metric.WithDescription("Time to receive acknowledgment from a smart home device"),
		metric.WithUnit("s"),
		metric.WithExplicitBucketBoundaries(0.1, 0.25, 0.5, 1.0, 2.5, 5.0))
	if err != nil {
		panic(err)
	}

	deviceCommandDuration.Record(ctx, 0.35, deviceThermostatOpts...)
	deviceCommandDuration.Record(ctx, 0.85, deviceLockOpts...)
}
```

主な違い:

- `Observe(value)` → `Record(ctx, value, metric.WithAttributes(...))`。
- Go では、`metric.WithExplicitBucketBoundaries(...)` は可変長引数です（スライスではありません）。
  Prometheus は `HistogramOpts` の `Buckets` フィールドを使用します。
- SDK のビューは `WithExplicitBucketBoundaries()` で設定された境界をオーバーライドでき、属性フィルタリング、最小/最大値の記録、インスツルメントのリネームなど、ヒストグラム収集の他の側面も設定できます。

{{% /tab %}} {{< /tabpane >}}

### ネイティブ（base2 指数）ヒストグラム {#native-base2-exponential-histogram}

両方のシステムがネイティブ（base2 指数）ヒストグラムをサポートしており、手動設定なしで観測範囲をカバーするようにバケット境界を自動調整します。

- **フォーマット選択**: Prometheus のインスツルメントは、クラシックフォーマットのみ、ネイティブフォーマットのみ、または両方を同時に出力できます。これにより、計装の変更なしで段階的な移行が可能です。
  OpenTelemetry では、フォーマット選択は計装コードの外部で、エクスポーターまたはビューを介して設定されるため、計装コードはどちらの場合も変更不要です。
- **計装コード**: OpenTelemetry の計装コードは、クラシックヒストグラムとネイティブヒストグラムで同一です。
  同じ `record()` 呼び出しが、SDK の設定に応じてどちらのフォーマットも生成します。

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

Prometheus では、ヒストグラムフォーマットはインスツルメント作成時に制御されます。
以下の例では `.nativeOnly()` を使用してネイティブフォーマットに限定しています。これを省略すると、クラシックとネイティブの両方のフォーマットが同時に出力されます。

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusHistogramNative.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Histogram;

public class PrometheusHistogramNative {
  public static void nativeHistogramUsage() {
    Histogram deviceCommandDuration =
        Histogram.builder()
            .name("device_command_duration_seconds")
            .help("Time to receive acknowledgment from a smart home device")
            .labelNames("device_type")
            .nativeOnly()
            .register();

    deviceCommandDuration.labelValues("thermostat").observe(0.35);
    deviceCommandDuration.labelValues("lock").observe(0.85);
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

Prometheus では、`NativeHistogramBucketFactor` を設定するとクラシックバケット設定と並行してネイティブヒストグラムが有効になり、両方のフォーマットが同時に報告されます。

<?code-excerpt "prometheus_histogram_native.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var nativeDeviceCommandDuration = prometheus.NewHistogramVec(prometheus.HistogramOpts{
	Name:                        "device_command_duration_seconds",
	Help:                        "Time to receive acknowledgment from a smart home device",
	NativeHistogramBucketFactor: 1.1,
}, []string{"device_type"})

func nativeHistogramUsage(reg *prometheus.Registry) {
	reg.MustRegister(nativeDeviceCommandDuration)

	nativeDeviceCommandDuration.WithLabelValues("thermostat").Observe(0.35)
	nativeDeviceCommandDuration.WithLabelValues("lock").Observe(0.85)
}
```

主な違い:

- Go でネイティブヒストグラムを有効にするには、`NativeHistogramBucketFactor` を 1.0 より大きい値に設定する必要があります。必須パラメーターです。
  0（ゼロ値）に設定するとネイティブヒストグラムは完全に無効になります。
  この値は連続するバケット境界間の最大比率を制御します。値が小さいほど解像度が高くなりますが、バケット数が増えます。
  よく使われる値 `1.1` と同等のバケット密度に近似するには、`AggregationBase2ExponentialHistogram` で `MaxScale: 3` を設定します。

{{% /tab %}} {{< /tabpane >}}

OpenTelemetry では、計装コードはクラシックヒストグラムの場合と同一です。
base2 指数フォーマットは、計装レイヤーの外部で別途設定されます。

推奨されるアプローチは、メトリクスエクスポーターで設定することです。
これにより、計装コードに手を加えることなく、そのエクスポーターを通じてエクスポートされるすべてのヒストグラムに適用されます。

{{< tabpane text=true >}} {{% tab Java %}}

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/OtelHistogramExponentialExporter.java"?>

```java
package otel;

import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentType;
import io.opentelemetry.sdk.metrics.export.DefaultAggregationSelector;

public class OtelHistogramExponentialExporter {
  static OtlpHttpMetricExporter createExporter() {
    // すべてのヒストグラムインスツルメントに指数ヒストグラムを使用するようにエクスポーターを設定する。
    // これが推奨アプローチ — 計装コードを変更せずにグローバルに適用される。
    return OtlpHttpMetricExporter.builder()
        .setEndpoint("http://localhost:4318")
        .setDefaultAggregationSelector(
            DefaultAggregationSelector.getDefault()
                .with(InstrumentType.HISTOGRAM, Aggregation.base2ExponentialBucketHistogram()))
        .build();
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>
<?code-excerpt "otel_histogram_exponential_exporter.go" region="createExponentialExporter"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
)

func createExponentialExporter(ctx context.Context) (*otlpmetrichttp.Exporter, error) {
	// すべてのヒストグラムインスツルメントに指数ヒストグラムを使用するようにエクスポーターを設定する。
	// これが推奨アプローチ — 計装コードを変更せずにグローバルに適用される。
	return otlpmetrichttp.New(ctx,
		otlpmetrichttp.WithAggregationSelector(func(ik sdkmetric.InstrumentKind) sdkmetric.Aggregation {
			if ik == sdkmetric.InstrumentKindHistogram {
				return sdkmetric.AggregationBase2ExponentialHistogram{}
			}
			return sdkmetric.DefaultAggregationSelector(ik)
		}),
	)
}
```

{{% /tab %}} {{< /tabpane >}}

よりきめ細かい制御が必要な場合、たとえば特定のインスツルメントに base2 指数ヒストグラムを使用し、他は明示的バケットを維持する場合は、ビューを設定します。

{{< tabpane text=true >}} {{% tab Java %}}

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/OtelHistogramExponentialView.java"?>

```java
package otel;

import io.opentelemetry.sdk.metrics.Aggregation;
import io.opentelemetry.sdk.metrics.InstrumentSelector;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.View;

public class OtelHistogramExponentialView {
  static SdkMeterProvider createMeterProvider() {
    // インスツルメントごとの制御にビューを使用する — 特定のインスツルメントを名前で選択して
    // 指数ヒストグラムを使用し、他は明示的バケットを維持する。
    return SdkMeterProvider.builder()
        .registerView(
            InstrumentSelector.builder().setName("device.command.duration").build(),
            View.builder().setAggregation(Aggregation.base2ExponentialBucketHistogram()).build())
        .build();
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>
<?code-excerpt "otel_histogram_exponential.go" region="createExponentialView"?>

```go
func createExponentialView() sdkmetric.View {
	// インスツルメントごとの制御にビューを使用する — 特定のインスツルメントを名前で選択して
	// 指数ヒストグラムを使用し、他は明示的バケットを維持する。
	return sdkmetric.NewView(
		sdkmetric.Instrument{Name: "device.command.duration"},
		sdkmetric.Stream{Aggregation: sdkmetric.AggregationBase2ExponentialHistogram{}!},
	)
}
```

{{% /tab %}} {{< /tabpane >}}

### Summary {#summary}

Prometheus の `Summary` は、スクレイプ時にクライアント側でクォンタイルを計算し、ラベル付き時系列として公開します（たとえば `{quantile="0.95"}`）。
OpenTelemetry には直接的な同等物がありません。

クォンタイル推定には、**base2 指数ヒストグラム** が推奨される代替手段です。
観測範囲をカバーするようにバケット境界を自動調整し、PromQL の `histogram_quantile()` がクエリ時に限定的な誤差でクォンタイルを計算できます。
`Summary` と異なり、結果はインスタンス間で集約可能です。
[ネイティブ（base2 指数）ヒストグラム](#native-base2-exponential-histogram)を参照してください。

カウントと合計のみが必要でクォンタイルが不要な場合、明示的バケット境界のないヒストグラムがこれらの統計値を最小限のオーバーヘッドでキャプチャします。
以下の例はこのシンプルなアプローチを示しています。

{{< tabpane text=true >}} {{% tab Java %}}

Prometheus

<?code-excerpt path-base="examples/java/prometheus-compatibility"?>
<?code-excerpt "src/main/java/otel/PrometheusSummary.java"?>

```java
package otel;

import io.prometheus.metrics.core.metrics.Summary;

public class PrometheusSummary {
  public static void summaryUsage() {
    Summary deviceCommandDuration =
        Summary.builder()
            .name("device_command_duration_seconds")
            .help("Time to receive acknowledgment from a smart home device")
            .labelNames("device_type")
            .quantile(0.5, 0.05)
            .quantile(0.95, 0.01)
            .quantile(0.99, 0.001)
            .register();

    deviceCommandDuration.labelValues("thermostat").observe(0.35);
    deviceCommandDuration.labelValues("lock").observe(0.85);
  }
}
```

OpenTelemetry

<?code-excerpt "src/main/java/otel/OtelHistogramAsSummary.java"?>

```java
package otel;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.DoubleHistogram;
import io.opentelemetry.api.metrics.Meter;
import java.util.List;

public class OtelHistogramAsSummary {
  private static final AttributeKey<String> DEVICE_TYPE = AttributeKey.stringKey("device_type");
  private static final Attributes THERMOSTAT = Attributes.of(DEVICE_TYPE, "thermostat");
  private static final Attributes LOCK = Attributes.of(DEVICE_TYPE, "lock");

  public static void summaryReplacement(OpenTelemetry openTelemetry) {
    Meter meter = openTelemetry.getMeter("smart.home");
    // 明示的バケット境界なし: カウントと合計をキャプチャする。
    // ほとんどの Summary ユースケースの良い代替となる。
    // クォンタイル推定には、しきい値を挟む境界を追加する。
    DoubleHistogram deviceCommandDuration =
        meter
            .histogramBuilder("device.command.duration")
            .setDescription("Time to receive acknowledgment from a smart home device")
            .setUnit("s")
            .setExplicitBucketBoundariesAdvice(List.of())
            .build();

    deviceCommandDuration.record(0.35, THERMOSTAT);
    deviceCommandDuration.record(0.85, LOCK);
  }
}
```

{{% /tab %}} {{% tab Go %}}

<?code-excerpt path-base="examples/go/prometheus-compatibility"?>

Prometheus

<?code-excerpt "prometheus_summary.go"?>

```go
package main

import "github.com/prometheus/client_golang/prometheus"

var summaryDeviceCommandDuration = prometheus.NewSummaryVec(prometheus.SummaryOpts{
	Name:       "device_command_duration_seconds",
	Help:       "Time to receive acknowledgment from a smart home device",
	Objectives: map[float64]float64{0.5: 0.05, 0.95: 0.01, 0.99: 0.001},
}, []string{"device_type"})

func summaryUsage(reg *prometheus.Registry) {
	reg.MustRegister(summaryDeviceCommandDuration)

	summaryDeviceCommandDuration.WithLabelValues("thermostat").Observe(0.35)
	summaryDeviceCommandDuration.WithLabelValues("lock").Observe(0.85)
}
```

OpenTelemetry

<?code-excerpt "otel_histogram_as_summary.go"?>

```go
package main

import (
	"context"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// 値が静的な場合、呼び出しごとのアロケーションを避けるために属性オプションを事前に割り当てる。
var (
	summaryThermostatOpts = []metric.RecordOption{metric.WithAttributes(attribute.String("device_type", "thermostat"))}
	summaryLockOpts       = []metric.RecordOption{metric.WithAttributes(attribute.String("device_type", "lock"))}
)

func summaryReplacement(ctx context.Context, meter metric.Meter) {
	// 明示的バケット境界なし: カウントと合計のみをキャプチャする。
	// クォンタイル推定には、代わりに base2 指数ヒストグラムを推奨する。
	deviceCommandDuration, err := meter.Float64Histogram("device.command.duration",
		metric.WithDescription("Time to receive acknowledgment from a smart home device"),
		metric.WithUnit("s"),
		metric.WithExplicitBucketBoundaries()) // 境界なし
	if err != nil {
		panic(err)
	}

	deviceCommandDuration.Record(ctx, 0.35, summaryThermostatOpts...)
	deviceCommandDuration.Record(ctx, 0.85, summaryLockOpts...)
}
```

{{% /tab %}} {{< /tabpane >}}
