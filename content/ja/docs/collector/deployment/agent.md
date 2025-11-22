---
title: エージェント
description: コレクターにシグナルを送信し、そこからバックエンドに送信する理由と方法
weight: 2
default_lang_commit: 548e5e29f574fddc3ca683989a458e9a6800242f
drifted_from_default: true
cSpell:ignore: prometheusremotewrite
---

コレクターのエージェントデプロイメントパターンは、OpenTelemetry SDKを使用して[計装された][instrumentation]アプリケーション（[OpenTelemetryプロトコル（OTLP）][otlp]を使用）や、他のコレクター（OTLPエクスポーターを使用）が、テレメトリーシグナルを[コレクター][collector]インスタンスに送信する構成です。
このコレクターインスタンスは、アプリケーションと同じホストまたはアプリケーションの横に配置されたサイドカーやデーモンセットとして動作します。

各クライアント側SDKまたはダウンストリームコレクターは、コレクターの場所を設定します。

![分散型コレクターデプロイメント概念](../../img/otel-agent-sdk.svg)

1. アプリケーションで、SDKがOTLPデータをコレクターに送信するように設定されます。
1. コレクターは、テレメトリーデータを1つ以上のバックエンドに送信するように設定されます。

## 例 {#example}

コレクターのエージェントデプロイメントパターンの具体例は以下のようになります。
たとえば、[Javaアプリケーションを計装してメトリクスをエクスポート][instrument-java-metrics]するためにOpenTelemetry Java SDKを使用します。
アプリケーションのコンテキスト内で、`OTEL_METRICS_EXPORTER`を`otlp`（デフォルト値）に設定し、[OTLPエクスポーター][otlp-exporter]をコレクターのアドレスで設定します。たとえば、Bashまたは`zsh`シェルでは、次のように設定します。

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

`collector.example.com:4318` で動作するコレクターは次のように設定されます。

{{< tabpane text=true >}} {{% tab Traces %}}

```yaml
receivers:
  otlp: # アプリケーションがトレースを送信するOTLPレシーバー
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  otlp/jaeger: # JaegerはOTLPを直接サポートしています
    endpoint: https://jaeger.example.com:4317

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
```

{{% /tab %}} {{% tab Metrics %}}

```yaml
receivers:
  otlp: # アプリケーションがメトリクスを送信するOTLPレシーバー
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  prometheusremotewrite: # PRWエクスポーター、メトリクスをバックエンドに取り込む
    endpoint: https://prw.example.com/v1/api/remote_write

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheusremotewrite]
```

{{% /tab %}} {{% tab Logs %}}

```yaml
receivers:
  otlp: # アプリケーションがログを送信するOTLPレシーバー
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  file: # ファイルエクスポーター、ログをローカルファイルに取り込む
    path: ./app42_example.log
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      processors: [batch]
      exporters: [file]
```

{{% /tab %}} {{< /tabpane >}}

実際に試してみたい場合は、エンドツーエンドの[Java][java-otlp-example]や[Python][py-otlp-example]の例で確認できます。

## トレードオフ {#tradeoffs}

長所：

- 始めやすい
- アプリケーションとコレクターの間に明確な1:1のマッピング

短所：

- スケーラビリティ（人的および負荷面）
- 柔軟性に欠ける

[instrumentation]: /docs/languages/
[otlp]: /docs/specs/otel/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/languages/java/api/#meterprovider
[otlp-exporter]: /docs/specs/otel/protocol/exporter/
[java-otlp-example]: https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]: https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
