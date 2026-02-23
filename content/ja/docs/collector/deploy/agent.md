---
title: エージェントデプロイメントパターン
linkTitle: エージェントパターン
description: コレクターにシグナルを送信し、そこからバックエンドにエクスポートする
aliases: [/docs/collector/deployment/agent]
weight: 200
default_lang_commit: 4cb7e22f1e45d17854b309efc730499880aa7197 # patched
---

エージェントデプロイメントパターンでは、テレメトリーシグナルは次の場所から送信できます。

- [OpenTelemetry Protocol (OTLP)][otlp]を使用してOpenTelemetry SDKで[計装された][instrumentation]アプリケーション
- OTLPエクスポーターを使用するコレクター

シグナルは、サイドカーやDaemonSetなど、アプリケーションと並行してまたは同じホストで実行される[コレクター][collector]インスタンスに送信されます。

各クライアントサイドのSDKまたはダウンストリームのコレクターは、コレクターインスタンスのアドレスで構成されます。

![Decentralized collector deployment concept](../../img/otel-agent-sdk.svg)

1. アプリケーションでは、SDKがOTLPデータをコレクターに送信するように構成されています。
1. コレクターは、1つ以上のバックエンドにテレメトリーデータを送信するように構成されています。

## 例 {#example}

エージェントデプロイメントパターンのこの例では、OpenTelemetry Java SDKを使用してメトリクスをエクスポートするように[Javaアプリケーションを手動で計装][instrument-java-metrics]することから始めます。
デフォルトの`OTEL_METRICS_EXPORTER`の値である`otlp`を含みます。
次に、[OTLPエクスポーター][otlp-exporter]をコレクターのアドレスで構成します。
例は次のとおりです。

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.example.com:4318
```

次に、`collector.example.com:4318`で実行されているコレクターを次のように構成します。

{{< tabpane text=true >}} {{% tab Traces %}}

```yaml
receivers:
  otlp: # アプリケーションがトレースを送信するOTLPレシーバー
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp/jaeger: # JaegerはOTLPを直接サポート
    endpoint: https://jaeger.example.com:4317
    sending_queue:
      batch:

service:
  pipelines:
    traces/dev:
      receivers: [otlp]
      exporters: [otlp/jaeger]
```

{{% /tab %}} {{% tab Metrics %}}

```yaml
receivers:
  otlp: # アプリケーションがトレースを送信するOTLPレシーバー
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  prometheusremotewrite: # PRWエクスポーター、メトリクスをバックエンドに取り込む
    endpoint: https://prw.example.com/v1/api/remote_write
    sending_queue:
      batch:

service:
  pipelines:
    metrics/prod:
      receivers: [otlp]
      exporters: [prometheusremotewrite]
```

{{% /tab %}} {{% tab Logs %}}

```yaml
receivers:
  otlp: # アプリケーションがトレースを送信するOTLPレシーバー
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  file: # ファイルエクスポーター、ログをローカルファイルに取り込む
    path: ./app42_example.log
    rotation:

service:
  pipelines:
    logs/dev:
      receivers: [otlp]
      exporters: [file]
```

{{% /tab %}} {{< /tabpane >}}

このパターンをエンドツーエンドで調査するには、[Java][java-otlp-example]または[Python][py-otlp-example]の例を参照してください。

## トレードオフ {#trade-offs}

エージェントコレクターを使用する主な長所と短所は次のとおりです。

長所:

- 始めるのが簡単
- アプリケーションとコレクターの間に、明確な1対1のマッピング

短所:

- チームとインフラストラクチャリソースのスケーラビリティが制限される
- 複雑または進化するデプロイメントには柔軟に対応できない

[instrumentation]: /docs/languages/
[otlp]: /docs/specs/otel/protocol/
[collector]: /docs/collector/
[instrument-java-metrics]: /docs/languages/java/api/#meterprovider
[otlp-exporter]: /docs/specs/otel/protocol/exporter/
[java-otlp-example]: https://github.com/open-telemetry/opentelemetry-java-docs/tree/main/otlp
[py-otlp-example]: https://opentelemetry-python.readthedocs.io/en/stable/examples/metrics/instruments/README.html
