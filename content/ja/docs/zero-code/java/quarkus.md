---
title: Quarkus計装
linkTitle: Quarkus
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
---

[Quarkus](https://quarkus.io/)は、ソフトウェア開発者がJVMとQuarkusネイティブイメージアプリケーションの両方で効率的なクラウドネイティブアプリケーションを構築するのを支援するために設計されたオープンソースフレームワークです。

Quarkusは、幅広いライブラリに最適化されたサポートを提供するためにエクステンションを使用します。
[Quarkus OpenTelemetryエクステンション](https://quarkus.io/guides/opentelemetry)は以下を提供します。

- すぐに使える計装
- OpenTelemetry SDKの自動設定、[OpenTelemetry SDK](/docs/languages/java/configuration/)で定義されたほぼすべてのシステムプロパティをサポート
- [Vert.x](https://vertx.io/)ベースのOTLPエクスポーター
- OpenTelemetry Javaエージェントでサポートされていないネイティブイメージアプリケーションでも同じ計装を使用可能

{{% alert title="注意" color="secondary" %}}

Quarkus OpenTelemetry計装は、Quarkusによって保守およびサポートされています。
詳細については、[Quarkusコミュニティサポート](https://quarkus.io/support/)をご覧ください。

{{% /alert %}}

ネイティブイメージアプリケーションを実行していない場合、Quarkusは[OpenTelemetry Javaエージェント](../agent/)でも計装可能です。

## はじめに {#getting-started}

QuarkusアプリケーションでOpenTelemetryを有効にするには、プロジェクトに`quarkus-opentelemetry`エクステンションの依存関係を追加します。

{{< tabpane text=true >}} {{% tab header="Maven (`pom.xml`)" lang=Maven %}}

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-opentelemetry</artifactId>
</dependency>
```

{{% /tab %}} {{% tab header="Gradle (`build.gradle`)" lang=Gradle %}}

```kotlin
implementation("io.quarkus:quarkus-opentelemetry")
```

{{% /tab %}} {{< /tabpane>}}

デフォルトでは**トレーシング**シグナルのみが有効になっています。
**メトリクス**と**ログ**を有効にするには、`application.properties`ファイルに以下の設定を追加します。

```properties
quarkus.otel.metrics.enabled=true
quarkus.otel.logs.enabled=true
```

OpenTelemetryロギングは、Quarkus 3.16.0以降でサポートされています。

これらおよびその他の設定オプションの詳細については、[OpenTelemetry設定リファレンス](https://quarkus.io/guides/opentelemetry#configuration-reference)をご覧ください。

## さらに学ぶ {#learn-more}

- [OpenTelemetryの使用](https://quarkus.io/guides/opentelemetry)、すべての[設定](https://quarkus.io/guides/opentelemetry#configuration-reference)オプションをカバーする一般的なリファレンス
- シグナル固有のガイド
  - [トレーシング](https://quarkus.io/guides/opentelemetry-tracing)
  - [メトリクス](https://quarkus.io/guides/opentelemetry-metrics)
  - [ログ](https://quarkus.io/guides/opentelemetry-logging)
