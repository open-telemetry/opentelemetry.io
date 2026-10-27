---
title: OBI のエクスポートモードを構成する
linkTitle: エクスポートモード
description: OTLP エンドポイントへ直接データをエクスポートするように OBI を構成する
weight: 1
default_lang_commit: bae0689d264b08de4272ae5cd76a3ed6121273d0
---

> [!NOTE]
>
> このページでは Config v1 のフィールド名と例を使用しています。
> Config v2 については、[Config v2 リファレンス](/docs/zero-code/obi/configure/config-v2/)を参照してください。
> 既存のファイルを変換するには、[移行ガイド](/docs/zero-code/obi/configure/migrate-to-config-v2/)を使用してください。

Direct モードでは、OBI は OpenTelemetry protocol（OTLP）を使用して、メトリクスとトレースをリモートエンドポイントへ直接プッシュします。

OBI は、たとえば **プル** モードでスクレイプできるように、Prometheus HTTP エンドポイントを公開することもできます。

Direct モードでは、`OTEL_EXPORTER_OTLP_ENDPOINT` で OTLP エンドポイントを設定します。
エンドポイントで認証が必要な場合は、`OTEL_EXPORTER_OTLP_HEADERS` に認証情報を設定してください。

Prometheus のスクレイプエンドポイントについては、[データエクスポートのドキュメント](/docs/zero-code/obi/configure/export-data/)を参照してください。

## OBI の構成と実行 {#configure-and-run-obi}

このチュートリアルでは、OBI と OTel Collector が同じホスト上でネイティブに実行されていることを前提としています。
そのため、トラフィックを保護したり、OTel Collector の OTLP レシーバーで認証を提供したりする必要はありません。

[OpenTelemetry eBPF Instrumentation](../../setup/) をインストールし、サンプルの[構成ファイル](/docs/zero-code/obi/configure/resources/instrumenter-config.yml)をダウンロードしてください。

まず、計装する実行ファイルを指定します。
ポート `443` で実行されているサービスの実行ファイルの場合は、YAML ドキュメントに `open_port` プロパティを追加します。

```yaml
discovery:
  instrument:
    - open_ports: 443
```

次に、トレースとメトリクスの送信先を指定します。
OTel collector がローカルホストで実行されている場合は、ポート `4318` を使用します。

```yaml
otel_metrics_export:
  endpoint: http://localhost:4318
otel_traces_export:
  endpoint: http://localhost:4318
```

メトリクス、トレース、またはその両方をエクスポートするには、`otel_metrics_export` と `otel_traces_export` プロパティの組み合わせを指定できます。

名前付きの構成ファイルを指定して OBI を実行します。

```shell
obi -config instrument-config.yml
```

あるいは次のように実行します。

```shell
OTEL_EBPF_CONFIG_PATH=instrument-config.yml obi
```
