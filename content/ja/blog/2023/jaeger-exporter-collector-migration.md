---
title: コレクターにおける Jaeger エクスポーターからの移行
linkTitle: Jaeger コレクターエクスポーターの移行
date: 2023-09-14
author: >-
  [Alex Boten](https://github.com/codeboten) (Lightstep)
default_lang_commit: fb1cb7ad5eb8bcf1b211470d5b5e418a3f4d79bb
cSpell:ignore: Boten gomod jaegerexporter jaegerthrifthttpexporter
---

OpenTelemetry コレクターの[最新バイナリ](https://github.com/open-telemetry/opentelemetry-collector-releases/releases/tag/v0.85.0)リリースには、ネイティブ Jaeger 形式のエクスポーターが含まれなくなりました。
この変更は、Jaeger がすぐに使える OTLP サポートを備えていることがきっかけとなりました。
Jaeger エクスポーターまたは Jaeger Thrift エクスポーターを現在利用している場合、最新のコレクターにアップグレードする際にいくつかの選択肢があります。

## OTLP エクスポーターへの切り替え {#switch-to-otlp-exporter}

推奨される選択肢は、OpenTelemetry Protocol エクスポーターに切り替えることです。
このエクスポーターは、コミュニティがサポートするすべての公式ディストリビューションに含まれています。
切り替えるには、コレクターの設定を更新する必要があります。
以下の Jaeger エクスポーターの設定を見つけてください。

```yaml
exporters:
  jaeger:
    endpoint: https://jaeger.example.com:14250

service:
  pipelines:
    exporters: [jaeger]
```

そして、OTLP の設定に置き換えます。

```yaml
exporters:
  otlp/jaeger: # Jaeger は OTLP を直接サポートしています。OTLP/gRPC のデフォルトポートは 4317 です
    endpoint: https://jaeger.example.com:4317

service:
  pipelines:
    exporters: [otlp/jaeger]
```

v1.46.0 までのバージョンの Jaeger では、環境変数 `COLLECTOR_OTLP_ENABLED=true` を設定する必要があります。

## カスタムコレクターのビルド {#build-a-custom-collector}

OTLP エクスポーターへの切り替えが選択肢にない場合、代替手段として Jaeger エクスポーターを含むカスタムコレクターをビルドできます。
[カスタムコレクターのビルド](/docs/collector/extend/ocb/)を参照してください。
マニフェストファイルに Jaeger エクスポーターを追加するために、以下の行を含める必要があります。

```yaml
exporters:
  - gomod: go.opentelemetry.io/collector/exporter/jaegerexporter v0.85.0
  - gomod: go.opentelemetry.io/collector/exporter/jaegerthrifthttpexporter v0.85.0
```

既存のコレクターディストリビューションのマニフェストファイルについては、[opentelemetry-collector-releases](https://github.com/open-telemetry/opentelemetry-collector-releases/blob/b590e8bc74a5aacca1236f02b10bafeb4959dd96/distributions/otelcol?from_branch=main) リポジトリにほかの例もあります。

これらの選択肢のいずれもユースケースに合わない場合は、[CNCF Slack](https://slack.cncf.io) の [#otel-collector](https://cloud-native.slack.com/archives/C01N6P7KR6W) コミュニティに連絡を取るか、[リポジトリ](https://github.com/open-telemetry/opentelemetry-collector-contrib/issues/new/choose)でイシューを作成してください。
