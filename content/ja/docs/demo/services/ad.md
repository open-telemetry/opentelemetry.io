---
title: 広告サービス
linkTitle: 広告
aliases: [adservice]
default_lang_commit: 055e4933b5a29eb283300a071158d7caa0542b1c
---

このサービスは、コンテキストキーに基づいてユーザーに表示する適切な広告を決定します。
広告はストアで販売されている商品に対するものです。

[広告サービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/ad/)

## 自動計装 {#auto-instrumentation}

このサービスは、gRPC などのライブラリを自動的に計装し、OpenTelemetry SDK を設定するために、OpenTelemetry Java エージェントに依存しています。
エージェントは `-javaagent` コマンドライン引数を使用してプロセスに渡されます。
コマンドライン引数は `Dockerfile` の `JAVA_TOOL_OPTIONS` を通じて追加され、自動生成された Gradle 起動スクリプトで利用されます。

```dockerfile
ENV JAVA_TOOL_OPTIONS=-javaagent:/app/opentelemetry-javaagent.jar
```

## トレース {#traces}

### 自動計装されたスパンへの属性の追加 {#add-attributes-to-auto-instrumented-spans}

自動計装されたコードの実行中に、コンテキストから現在のスパンを取得できます。

```java
Span span = Span.current();
```

スパンへの属性の追加は、スパンオブジェクトの `setAttribute` を使用して行います。
`getAds` 関数では、スパンに複数の属性が追加されます。

```java
span.setAttribute("app.ads.contextKeys", req.getContextKeysList().toString());
span.setAttribute("app.ads.contextKeys.count", req.getContextKeysCount());
```

### スパンイベントの追加 {#add-span-events}

スパンへのイベントの追加は、スパンオブジェクトの `addEvent` を使用して行います。
`getAds` 関数では、例外がキャッチされたときに属性付きのイベントが追加されます。

```java
span.addEvent("Error", Attributes.of(AttributeKey.stringKey("exception.message"), e.getMessage()));
```

### スパンステータスの設定 {#setting-span-status}

操作の結果がエラーの場合、スパンオブジェクトの `setStatus` を使用して、スパンステータスを適切に設定する必要があります。
`getAds` 関数では、例外がキャッチされたときにスパンステータスが設定されます。

```java
span.setStatus(StatusCode.ERROR);
```

### 新しいスパンの作成 {#create-new-spans}

新しいスパンは `Tracer.spanBuilder("spanName").startSpan()` を使用して作成および開始できます。
新しく作成されたスパンは `Span.makeCurrent()` を使用してコンテキストに設定する必要があります。
`getRandomAds` 関数は、新しいスパンを作成し、コンテキストに設定し、操作を実行し、最後にスパンを終了します。

```java
// 新しいスパンを手動で作成して開始する
Tracer tracer = GlobalOpenTelemetry.getTracer("ad");
Span span = tracer.spanBuilder("getRandomAds").startSpan();

// スパンをコンテキストに配置し、子スパンが開始された場合に親が適切に設定されるようにする
try (Scope ignored = span.makeCurrent()) {

  Collection<Ad> allAds = adsMap.values();
  for (int i = 0; i < MAX_ADS_TO_SERVE; i++) {
    ads.add(Iterables.get(allAds, random.nextInt(allAds.size())));
  }
  span.setAttribute("app.ads.count", ads.size());

} finally {
  span.end();
}
```

## メトリクス {#metrics}

### メトリクスの初期化 {#initializing-metrics}

スパンの作成と同様に、メトリクスを作成する最初のステップは `Meter` インスタンスの初期化です。
たとえば `GlobalOpenTelemetry.getMeter("ad")` を使用します。
そこから、`Meter` インスタンスで利用可能なさまざまなビルダーメソッドを使用して、目的のメトリクス計装を作成します。
例：

```java
meter
  .counterBuilder("app.ads.ad_requests")
  .setDescription("Counts ad requests by request and response type")
  .build();
```

### OTel 以外のカスタムメトリクスの橋渡し（Prometheus クライアントライブラリ） {#bridging-non-otel-custom-metrics-prometheus-client-library}

広告サービスは、OpenTelemetry SDK のかわりに [Prometheus Java クライアントライブラリ](https://github.com/prometheus/client_java)を使用して、少数のカスタムメトリクスも公開しています。
これらのメトリクスは別の HTTP エンドポイント（`AD_PROMETHEUS_PORT` の `/metrics`、デフォルトは `9465`）で公開され、OpenTelemetry Collector の [`prometheus` レシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver)によってスクレイプされ、OTel SDK メトリクスと同じパイプラインに転送されます。

```java
private static final Counter adsServedCounter =
    Counter.builder()
        .name("demo_ad_served_total")
        .help("Total number of ads served, labeled by category")
        .labelNames("category")
        .register();

HTTPServer prometheusServer =
    HTTPServer.builder().port(prometheusPort).buildAndStart();
```

> [!NOTE]
>
> これは **OTel 導入時によくあるパターン**を示すために意図的に含まれています。
> 組織は、ライブラリ、サードパーティのエクスポーター、またはレガシーサービスにすでに大量の Prometheus 計装を持っていることが多く、すべてを一から書き直すことなく、それらのメトリクスを OpenTelemetry ネイティブのパイプラインに取り込みたいと考えています。
> Collector の `prometheus` レシーバーは、これを可能にする橋渡しです。

これを接続する Collector の設定は次のとおりです。

```yaml
receivers:
  prometheus/ad:
    config:
      scrape_configs:
        - job_name: ad
          scrape_interval: 10s
          static_configs:
            - targets: ['ad:${env:AD_PROMETHEUS_PORT}']
```

> [!TIP]
>
> **推奨事項**：これは*過渡的な*パターンとして扱ってください。
> 新しいカスタムメトリクスには、OpenTelemetry SDK を直接使用してください。
> 既存の Prometheus クライアントメトリクスについては、周辺のコードに手を加える際に段階的に移行するか、集中的なリファクタリングで対応してください。
>
> OpenTelemetry と Prometheus のテレメトリーを混在させる際のよくある課題：
>
> - **ID の不一致**：`service.name` と `service.instance.id` が2つのパイプライン間で一致しない可能性があります。
> - **二重のメンタルモデル**：Prometheus と OTel は異なる概念（ラベルと属性、異なるセマンティック規約）を使用し、API、取り込みパイプライン、そして場合によっては異なるエンリッチメントルールが別々に存在します。
> - **一貫性のないコード**：古いメトリクスに Prometheus クライアントの呼び出しを使い、新しいメトリクスに OTel API の呼び出しを使うと、コードベースに統一的なスタイルがなくなります。

### 現在生成されているメトリクス {#current-metrics-produced}

以下のメトリクス名はすべて、Prometheus/Grafana では `.` 文字が `_` に変換されて表示されることに注意してください。

#### カスタムメトリクス {#custom-metrics}

現在利用可能なカスタムメトリクスは以下のとおりです。

- `app.ads.ad_requests`（OpenTelemetry SDK）：広告リクエストのカウンターで、リクエストがコンテキストキーでターゲット指定されたかどうか、およびレスポンスがターゲット広告かランダム広告かを示すディメンションを持ちます。
- `demo_ad_served_total`（Prometheus クライアントライブラリ、Collector によりスクレイプ）：配信された広告のカウンターで、`category`（例：`telescopes`、`binoculars`、`random`）でラベル付けされています。
  上記の [OTel 以外のカスタムメトリクスの橋渡し](#bridging-non-otel-custom-metrics-prometheus-client-library)を参照してください。

#### 自動計装メトリクス {#auto-instrumented-metrics}

アプリケーションで利用可能な自動計装メトリクスは以下のとおりです。

- [JVM のランタイムメトリクス](/docs/specs/semconv/runtime/jvm-metrics/)
- [RPC のレイテンシーメトリクス](/docs/specs/semconv/rpc/rpc-metrics/#rpc-server)

## ログ {#logs}

広告サービスは Log4J を使用しており、OTel Java エージェントによって自動的に設定されます。

ログレコードにトレースコンテキストが含まれるため、ログとトレースの相関が可能です。
