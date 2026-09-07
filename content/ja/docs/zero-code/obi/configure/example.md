---
title: OBI Config v1 YAML の例
linkTitle: Config v1 YAML の例
description: OBI の Config v1 YAML ファイルの例
weight: 100
default_lang_commit: 12862017e85a7b88fbd194241af00f4dbd4ee75c
---

> [!NOTE]
>
> このページでは Config v1 のフィールド名と例を使用しています。
> Config v2 については [Config v2 リファレンス](/docs/zero-code/obi/configure/config-v2/)を参照してください。
> 既存のファイルを変換するには[移行ガイド](/docs/zero-code/obi/configure/migrate-to-config-v2/)を参照してください。

## YAML ファイルの例 {#yaml-file-example}

```yaml
discovery:
  instrument:
    - open_ports: 8443
log_level: DEBUG

ebpf:
  context_propagation: all

otel_traces_export:
  endpoint: http://localhost:4318

prometheus_export:
  port: 8999
  path: /metrics
```

この設定には以下のオプションが含まれています。

- `discovery.instrument.open_ports`: ポート 8443 をリッスンしているサービスを計装します
- `log_level`: ログの詳細度を `DEBUG` に設定します
- `ebpf.context_propagation`: サポートされているすべてのキャリアを使ってコンテキスト伝搬を有効化します
- `otel_traces_export.endpoint`: `http://localhost:4318` の OpenTelemetry Collector へトレースを送信します
- `prometheus_export`: `http://localhost:8999/metrics` でメトリクスを公開します
