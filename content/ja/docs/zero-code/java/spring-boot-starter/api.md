---
title: APIを使った計装の拡張
linkTitle: APIで拡張
description: Spring BootスターターとOpenTelemetry APIを組み合わせて、自動生成されたテレメトリーをカスタムスパンとメトリクスで拡張する
weight: 21
default_lang_commit: 276d7eb3f936deef6487cdd2b1d89822951da6c8
---

## はじめに {#introduction}

すぐに使える計装に加えて、OpenTelemetry APIを使用してSpringスターターをカスタムの手動計装で拡張できます。
これにより、多くのコード変更をせずに、独自のコードに対して[スパン](/docs/concepts/signals/traces/#spans)と[メトリクス](/docs/concepts/signals/metrics)を作成できます。

必要な依存関係はすでにSpring Bootスターターに含まれています。

## OpenTelemetry {#opentelemetry}

Spring Bootスターターは、Spring Beanとして`OpenTelemetry`を利用できる特殊なケースです。
ただSpringコンポーネントに`OpenTelemetry`を注入するだけです。

## スパン {#span}

{{% alert title="注意" %}}

最も一般的なユースケースでは、手動計装のかわりに`@WithSpan`アノテーションを使用してください。
詳細については[アノテーション](../annotations)を参照してください。

{{% /alert %}}

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Tracer;

@Controller
public class MyController {
  private final Tracer tracer;

  public MyController(OpenTelemetry openTelemetry) {
    this.tracer = openTelemetry.getTracer("application");
  }
}
```

[スパン](/docs/languages/java/api/#span)セクションで説明されているように、`Tracer`を使用してスパンを作成します。

完全な例は[サンプルリポジトリ][example repository]にあります。

## メーター {#meter}

```java
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.Meter;

@Controller
public class MyController {
  private final Meter meter;

  public MyController(OpenTelemetry openTelemetry) {
    this.meter = openTelemetry.getMeter("application");
  }
}
```

[メーター](/docs/languages/java/api/#meter)セクションで説明されているように、`Meter`を使用してカウンター、ゲージ、またはヒストグラムを作成します。

完全な例は[サンプルリポジトリ][example repository]にあります。

[example repository]: https://github.com/open-telemetry/opentelemetry-java-examples/tree/main/spring-native
