---
title: レコメンデーションサービス
linkTitle: レコメンデーション
aliases: [recommendationservice]
default_lang_commit: c4eb6a3a460388ed7ff30ec70cc6a21ef9806d0b
---

このサービスは、ユーザーが閲覧中の既存の商品 ID に基づいて、おすすめ商品のリストを取得する役割を担います。

[レコメンデーションサービスのソースコード](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/recommendation/)

## 計装 {#instrumentation}

このサービスは、通信に Spring gRPC を使用する Spring Boot 4 アプリケーションです。
Java エージェントの代替として、[OpenTelemetry Spring Boot スターター](/docs/zero-code/java/spring-boot-starter/)を使用して OpenTelemetry SDK を設定し、`OpenTelemetry` Bean として利用できるようにしています。
エクスポートエンドポイント、リソース属性、サービス名は、標準の `OTEL_*` 環境変数から取得されます。

Java エージェントは Spring Boot アプリケーションのデフォルトの選択肢であり、[広告サービス](../ad/)で使用されています。
スターターがより適している場合については、スターターのページで説明されています。

```groovy
implementation platform("io.opentelemetry.instrumentation:opentelemetry-instrumentation-bom:${opentelemetryInstrumentationVersion}")
implementation "io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter"
```

## トレース {#traces}

### gRPC スパン {#grpc-spans}

スターターは gRPC を計装しないため、このサービスは [gRPC 計装ライブラリ](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/grpc-1.6/library/README.md)を追加し、そのインターセプターを Spring gRPC のグローバルインターセプターとして登録しています。
これにより、`ListRecommendations` サーバースパンと `ListProducts` クライアントスパンが作成され、トレースコンテキストが商品カタログサービスに伝搬されます。

```java
@Bean
GrpcTelemetry grpcTelemetry(OpenTelemetry openTelemetry) {
  return GrpcTelemetry.create(openTelemetry);
}

@Bean
@GlobalServerInterceptor
ServerInterceptor grpcTelemetryServerInterceptor(GrpcTelemetry grpcTelemetry) {
  return grpcTelemetry.createServerInterceptor();
}

@Bean
@GlobalClientInterceptor
ClientInterceptor grpcTelemetryClientInterceptor(GrpcTelemetry grpcTelemetry) {
  return grpcTelemetry.createClientInterceptor();
}
```

### 現在のスパンへの属性の追加 {#add-attributes-to-the-current-span}

gRPC ハンドラー内では、現在のスパンはインターセプターによって作成されたサーバースパンです。
`listRecommendations` では、このスパンに属性が追加されます。

```java
Span.current().setAttribute("demo.product.recommended.count", productIds.size());
```

### 新しいスパンの作成 {#create-new-spans}

このサービスは `OpenTelemetry` Bean から `Tracer` を取得します。
`getProductList` メソッドは `spanBuilder` で `get_product_list` スパンを作成し、`makeCurrent` でコンテキストに配置し、`finally` ブロックでスパンを終了します。
例外はスパンに記録され、スパンのステータスがエラーに設定されます。
レコメンドされた商品は文字列配列属性 `demo.product.filtered.list` として記録されます。

```java
Tracer tracer = openTelemetry.getTracer("recommendation");

Span span = tracer.spanBuilder("get_product_list").startSpan();
try (Scope ignored = span.makeCurrent()) {
  ...
  span.setAttribute(FILTERED_LIST, recommended);
} catch (RuntimeException e) {
  span.recordException(e);
  span.setStatus(StatusCode.ERROR);
  throw e;
} finally {
  span.end();
}
```

## メトリクス {#metrics}

### メトリクスの初期化 {#initializing-metrics}

このサービスは同じ `OpenTelemetry` Bean から `Meter` を取得し、カウンターを構築します。

```java
LongCounter recommendations =
    openTelemetry
        .getMeter("recommendation")
        .counterBuilder("demo.recommendation.requests")
        .setDescription("Counts the total number of given recommendations")
        .setUnit("{recommendation}")
        .build();
```

リクエストごとに、レコメンドした商品の数が加算されます。

```java
recommendations.add(productIds.size(), CATALOG_RECOMMENDATION);
```

### 現在生成されるメトリクス {#current-metrics-produced}

以下のすべてのメトリクス名は、Prometheus/Grafana では `.` が `_` に変換されて表示されます。

#### カスタムメトリクス {#custom-metrics}

- `demo.recommendation.requests`：レコメンドされた商品のカウンターで、`recommendation.type` 属性が `catalog` に設定されます。

#### 自動計装メトリクス {#auto-instrumented-metrics}

- [JVM のランタイムメトリクス](/docs/specs/semconv/runtime/jvm-metrics/)：スターターによって提供されます。`recommendationCacheFailure` フィーチャーフラグが有効な場合のメモリ増加を示します。
- [RPC のレイテンシメトリクス](/docs/specs/semconv/rpc/rpc-metrics/)：gRPC 計装ライブラリによって提供され、サーバーとクライアント両方の呼び出しに対応します。
- [SDK セルフオブザーバビリティメトリクス](/docs/specs/semconv/otel/sdk-metrics/)：このサービスが `OTEL_EXPERIMENTAL_SDK_TELEMETRY_VERSION=latest` を設定しているため提供されます。[セルフオブザーバビリティダッシュボード](/docs/demo/self-observability-dashboard/)を参照してください。

## ログ {#logs}

このサービスは、Spring Boot のデフォルトである SLF4J と Logback を通じてログを記録します。
スターターが OpenTelemetry Logback アペンダーを自動的にインストールするため、サービス側でのログ設定は不要です。
ログレコードは、アクティブなスパンのトレース ID とスパン ID とともに OTLP 経由でエクスポートされます。

```java
logger.info("Receive ListRecommendations for product ids:{}", productIds);
```
