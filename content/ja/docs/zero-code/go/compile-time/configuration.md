---
title: 設定
description: otelc ツールと、計装されたアプリケーションが生成するテレメトリーを設定します。
weight: 20
default_lang_commit: 1fef2df9c49cb4b2192665ef5b1df5746507cecb
cSpell:ignore: nethttp otelc
---

設定は2つのポイントで行います。
ビルド時には `otelc` ツールがアプリケーションをどのように計装するかを制御し、ランタイムには標準の OpenTelemetry 環境変数が計装されたアプリケーションの生成するテレメトリーを制御します。

## otelc コマンド {#the-otelc-command}

`otelc` は Go ツールチェーンをラップします。
サブコマンドは以下の通りです。

| コマンド        | 目的                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `otelc go …`    | 計装を適用して `go` コマンド（`go build` など）を実行する                                           |
| `otelc setup`   | 計装用の環境をセットアップする                                                                      |
| `otelc pin`     | 現在のモジュールの計装パッケージをピン留めするために `otel.instrumentation.go` を生成または更新する |
| `otelc cleanup` | セットアップおよびビルドフェーズで作成されたすべてのアーティファクトを削除する                      |
| `otelc version` | ツールのバージョンを表示する                                                                        |

フラグはサブコマンドの前に指定します。

| フラグ             | 環境変数         | 目的                                             |
| ------------------ | ---------------- | ------------------------------------------------ |
| `--rules <file>`   |                  | カスタム計装ルールファイルを使用する             |
| `--debug`, `-d`    | `OTELC_DEBUG=1`  | ビルドのデバッグログを有効にする                 |
| `--work-dir`, `-w` | `OTELC_WORK_DIR` | ビルド中に書き込まれる作業ファイルのディレクトリ |

たとえば、カスタムルールファイルとデバッグ出力でビルドするには、以下を実行します。

```sh
otelc --rules my-rules.yaml --debug go build -o myapp .
```

## ランタイム環境変数 {#runtime-environment-variables}

計装されたアプリケーションは、エクスポーター、リソース、サービス ID 用の標準 OpenTelemetry [SDK 環境変数](/docs/languages/sdk-configuration/)を尊重します。
たとえば、以下のような変数があります。

- `OTEL_SERVICE_NAME`: テレメトリーとともに報告されるサービス名
- `OTEL_EXPORTER_OTLP_ENDPOINT`: エクスポート先の OTLP エンドポイント
- `OTEL_RESOURCE_ATTRIBUTES`: 追加のリソース属性

さらに、以下の変数は注入された計装のうちどれをランタイムで有効にするかを制御します。

| 変数                                | 目的                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `OTEL_GO_ENABLED_INSTRUMENTATIONS`  | 有効にする計装のカンマ区切りリスト（例: `nethttp,grpc`）。設定すると、リストされた計装のみが有効になります。 |
| `OTEL_GO_DISABLED_INSTRUMENTATIONS` | 無効にする計装のカンマ区切りリスト。                                                                         |

## カスタム計装ルール {#custom-instrumentation-rules}

どのコードが計装されるかは、宣言的な YAML ルールによって駆動されます。
各ルールはターゲットパッケージを指定し、オプションでセレクターを使ってマッチを絞り込み、何を注入するかを宣言します。
たとえば、以下のルールは `(*sql.DB).Exec` の入口と出口でフック関数を呼び出します。

```yaml
instrument_sql_exec:
  target: database/sql
  where:
    func: Exec
    recv: '*DB'
  do:
    - inject_hooks:
        before: BeforeExec
        after: AfterExec
        path: github.com/example/sqlinstr
```

カスタムルールファイルは `--rules` でビルドに渡します。
ルールは Go パッケージ内にも配置できます。
パッケージは `otel.instrumentation.go`（または `otelc.tool.go`）ファイルで計装を宣言し、コードの隣にある `otelc.yml` または `*.otelc.yml` ファイルでルールを提供します。
ツールがアプリケーションを計装する際にこれらを検出して読み込みます。
ルールは関数フック以外にも、構造体フィールドの注入、呼び出し箇所のラッピング、ファイル追加など複数の注入メカニズムをサポートしています。
完全なスキーマとルールタイプのリファレンスについては、リポジトリの[計装ルールドキュメント](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/main/docs/rules.md)を参照してください。
