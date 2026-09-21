---
title: トラブルシューティング
description: Go コンパイル時計装の問題を診断します。
weight: 50
default_lang_commit: 13eed4c86de528f6824a9a2010fa7ad3f63743fc
cSpell:ignore: otelc
---

## デバッグログの有効化 {#enable-debug-logging}

ビルド中にツールが何を行っているかを確認するには、デバッグモードを有効にします。

```sh
otelc --debug go build -o myapp .
```

`debug.log` ファイルを含むデバッグ出力は、ツールの作業ディレクトリ（デフォルトではモジュール内の `.otelc-build` ディレクトリ）に書き込まれます。
どのルールがマッチし、どの計装が注入されたかを確認するために、このファイルを調べてください。

## テレメトリーが生成されない {#no-telemetry-is-produced}

1. バイナリが通常の `go build` ではなく `otelc` を通してビルドされたことを確認してください。
2. アプリケーションが実際に[サポートされているライブラリ](../supported-libraries)を使用していること、
   そして依存しているバージョンが計装ルールで宣言されたサポート範囲内であることを確認してください。
3. エクスポーターの設定を確認してください。
   `OTEL_EXPORTER_OTLP_ENDPOINT` が未設定または誤っている場合、テレメトリーの送信先がありません。
   エクスポートエラーを表示するには `OTEL_LOG_LEVEL=debug` を設定してください。
4. `OTEL_GO_ENABLED_INSTRUMENTATIONS` または `OTEL_GO_DISABLED_INSTRUMENTATIONS` によって計装が無効化されていないことを確認してください。

## ビルドアーティファクトのクリーンアップ {#clean-up-build-artifacts}

ビルドが予期しない動作をする場合、以前のセットアップおよびビルドフェーズで作成されたアーティファクトを削除し、クリーンな状態からリビルドしてください。

```sh
otelc cleanup
```

## ヘルプの入手 {#getting-help}

- バグについては [GitHub issues](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/issues)
- 質問については [GitHub discussions](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/discussions)
- CNCF Slack の
  [#otel-go-compt-instr-sig](https://cloud-native.slack.com/archives/C088D8GSSSF)
  チャンネル
