---
title: API による計装の拡張
linkTitle: API による拡張
description: OpenTelemetry API を Java エージェントと組み合わせて使用し、自動生成されたテレメトリーをカスタムスパンやメトリクスで拡張する
weight: 21
default_lang_commit: a3833f515c4dbb7f22deeab950b60af22a7f3384
---

## はじめに {#introduction}

デフォルトの計装に加えて、OpenTelemetry API を使用したカスタム手動計装で Java エージェントを拡張できます。
これにより、コードをほとんど変更することなく、独自のコードに対して[スパン](/docs/concepts/signals/traces/#spans)や[メトリクス](/docs/concepts/signals/metrics)を作成できます。

## 依存関係 {#dependencies}

`opentelemetry-api` ライブラリへの依存関係を追加します。

### Maven

```xml
<dependencies>
  <dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
    <version>{{% param vers.otel %}}</version>
  </dependency>
</dependencies>
```

### Gradle

```groovy
dependencies {
    implementation('io.opentelemetry:opentelemetry-api:{{% param vers.otel %}}')
}
```

## OpenTelemetry

Java エージェントは `GlobalOpenTelemetry` がエージェントによって設定される特殊なケースです。
`GlobalOpenTelemetry.getOrNoop()` を呼び出すだけで `OpenTelemetry` インスタンスにアクセスできます。

## スパン {#span}

> [!NOTE]
>
> 最も一般的なユースケースでは、手動計装の代わりに `@WithSpan` アノテーションを使用してください。
> 詳細は[アノテーション](../annotations)を参照してください。

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

Tracer tracer = GlobalOpenTelemetry.getTracer("application");
```

[スパン](/docs/languages/java/api/#span)セクションの説明に従って、`Tracer` を使用してスパンを作成します。

完全な例は[サンプルリポジトリ][example repository]にあります。

## メーター {#meter}

```java
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

Meter meter = GlobalOpenTelemetry.getMeter("application");
```

[メーター](/docs/languages/java/api/#meter)セクションの説明に従って、`Meter` を使用してカウンター、ゲージ、またはヒストグラムを作成します。

完全な例は[サンプルリポジトリ][example repository]にあります。

[example repository]: https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/javaagent
