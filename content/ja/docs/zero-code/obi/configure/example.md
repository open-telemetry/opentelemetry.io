---
title: OBI 設定 YAML の例
linkTitle: YAML の例
description: OBI 設定 YAML の例
weight: 100
default_lang_commit: f7dab5cfc4d44a8c788b7e02d07ec1e1d84e3845
---

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
