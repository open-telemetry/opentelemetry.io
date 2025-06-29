---
default_lang_commit: d0a90db560d4f15934bdb43d994eabcfd91c515a
---

[OpenTelemetryコレクター](/docs/collector/)にテレメトリーを送信し、正しくエクスポートされることを確認してください。
本番環境でコレクターを使用することはベストプラクティスです。
テレメトリーを可視化するために、[Jaeger](https://jaegertracing.io/)、[Zipkin](https://zipkin.io/)、
[Prometheus](https://prometheus.io/)、または[ベンダー固有](/ecosystem/vendors/)のようなバックエンドにエクスポートしてください。

{{ if $name }}

## 使用可能なエクスポーター {#available-exporters}

レジストリには、[{{ $name }} 用のエクスポーターのリスト][reg]が含まれています。

{{ end }}

{{ if not $name }}

レジストリには、[言語固有のエクスポーターのリスト][reg]が含まれています。

{{ end }}

エクスポーターの中でも、[OpenTelemetry Protocol (OTLP)][OTLP]エクスポーターは、OpenTelemetryのデータモデルを考慮して設計されており、OTelデータを情報の損失なく出力します。
さらに、多くのテレメトリーデータを扱うツールがOTLPに対応しており（たとえば、[Prometheus]、[Jaeger]やほとんどの[ベンダー][vendors]）、必要なときに高い柔軟性を提供します。
OTLPについて詳細に学習したい場合は、[OTLP仕様][OTLP]を参照してください。

[Jaeger]: /blog/2022/jaeger-native-otlp/
[OTLP]: /docs/specs/otlp/
[Prometheus]: https://prometheus.io/docs/prometheus/2.55/feature_flags/#otlp-receiver
[reg]: </ecosystem/registry/?component=exporter&language={{ $lang }}>
[vendors]: /ecosystem/vendors/

{{ if $name }}

このページでは、主要なOpenTelemetry {{ $name }} エクスポーターとその設定方法について説明します。

{{ end }}

{{ if $zeroConfigPageExists }}

{{% alert title=Note %}}

[ゼロコード計装](/docs/zero-code/{{ $l }})を使用している場合は、[設定ガイド](/docs/zero-code/{{ $l }}/configuration/)に従ってエクスポーターの設定方法を学ぶことができます。

{{% /alert %}}

{{ end }}

{{ if $supportsOTLP }}

## OTLP {#otlp}

### コレクターのセットアップ {#collector-setup}

{{% alert title=Note %}}

OTLPコレクターまたはバックエンドがすでにセットアップされている場合は、このセクションをスキップして、アプリケーション用の[OTLPエクスポーター依存関係のセットアップ](#otlp-dependencies)に進むことができます。

{{% /alert %}}

OTLPエクスポーターを試し、検証するために、テレメトリーを直接コンソールに書き込むDockerコンテナでコレクターを実行できます。
空のディレクトリで、以下の内容で`collector-config.yaml`というファイルを作成します。

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
```

次に、Docker コンテナでコレクターを実行します。

```shell
docker run -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector
```

このコレクターは、OTLPを介してテレメトリーを受け取ることができるようになりました。後で、テレメトリーを監視バックエンドに送信するために[コレクターを設定](/docs/collector/configuration)することもできます。

{{ end }}
