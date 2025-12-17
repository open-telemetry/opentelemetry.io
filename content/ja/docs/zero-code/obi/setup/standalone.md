---
title: OBIをスタンドアロンプロセスとして実行する
linkTitle: スタンドアロン
description: OBIをLinuxのスタンドアロンプロセスとしてセットアップして実行する方法を学びます。
weight: 4
default_lang_commit: c6df1ca98613ce886d3ea5ecb7ea50d02a31f18a
---

OBIは、他の実行中プロセスを検査できる昇格された権限を持つスタンドアロンのLinux OSプロセスとして実行できます。

## ダウンロードとインストール {#download-and-install}

OBIの実行可能ファイルは、[OBIリリースページ](https://github.com/open-telemetry/opentelemetry-ebpf-instrumentation/releases)からダウンロードできます。

## OBIのセットアップ {#set-up-obi}

1. [構成オプション](../../configure/options/)ドキュメントに従って構成ファイルを作成します。

2. OBIを特権プロセスとして実行します。

```bash
sudo ./obi --config=<構成ファイルのパス>
```

## 構成例 {#example-configuration}

構成ファイルの例(`obi-config.yml`)を示します。

```yaml
# 基本設定
discovery:
  services:
    - name: my-service
      open_ports: [8080, 8090]
      exe_path: /usr/local/bin/my-service

# トレース構成
traces:
  # トレース有効化
  enabled: true

  # OpenTelemetryエンドポイント
  otlp_endpoint: http://localhost:4318

  # トレースフォーマット
  format: otlp

# メトリクス構成
metrics:
  # メトリクス有効化
  enabled: true

  # OpenTelemetryエンドポイント
  otlp_endpoint: http://localhost:4318

  # メトリクスフォーマット
  format: otlp

# ログ構成
log_level: info
```

## OBIの実行 {#run-obi}

構成ファイルを使用してOBIを実行します。

```bash
sudo ./obi --config=obi-config.yml
```

## 構成オプション {#configuration-options}

構成オプションの完全なリストについては、[構成ドキュメント](../../configure/options/)を参照してください。

## 権限 {#permissions}

OBIが適切に機能するには、昇格された権限が必要です。
具体的に必要なケーパビリティの詳細については、[セキュリティドキュメント](../../security/)を参照してください。

## 例: Dockerの計装

Dockerコンテナの計装するために、ホスト上でOBIを実行できます。

```bash
sudo ./obi --config=obi-config.yml
```

コンテナを対象とする構成です。

```yaml
discovery:
  services:
    - name: my-container-service
      open_ports: [8080]
      exe_path: /proc/*/root/app/my-app
```

## 例: システム全体の計装 {#example-system-wide-instrumentation}

システム上のすべてのサービスを計装します。

```yaml
discovery:
  services:
    - name: all-services
      open_ports: [80, 443, 8080, 8443]

log_level: info
```

この構成では、指定されたポードでリッスンしているすべてのプロセスが計装されます。
