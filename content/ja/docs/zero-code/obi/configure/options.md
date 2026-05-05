---
title: OBI グローバル設定プロパティ
linkTitle: グローバルプロパティ
description: OBI コアに適用されるグローバル設定プロパティを設定する
weight: 2
default_lang_commit: dc2fb5771163265cb804a39b1dacc536b95bdb96
---

OBI は、環境変数またはコマンドライン引数 `-config` か環境変数 `OTEL_EBPF_CONFIG_PATH` を使用して渡す YAML 設定ファイルを通じて設定できます。
環境変数は設定ファイルのプロパティよりも優先されます。
たとえば、次のコマンドラインでは、`OTEL_EBPF_LOG_LEVEL` オプションが config.yaml 内の `log_level` 設定を上書きします。

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->
**設定引数**

```sh
OTEL_EBPF_LOG_LEVEL=debug obi -config /path/to/config.yaml
```

<!-- markdownlint-disable-next-line no-emphasis-as-heading -->
**設定環境変数**

```sh
OTEL_EBPF_LOG_LEVEL=debug OTEL_EBPF_CONFIG_PATH=/path/to/config.yaml obi
```

設定ファイルのテンプレートについては、[YAML 設定ファイルの例](../example/)を参照してください。

OBI は、HTTP および gRPC アプリケーションからトレースを生成、変換、エクスポートするコンポーネントのパイプラインで構成されています。
YAML 設定では、各コンポーネントに独自のトップレベルセクションがあります。

オプションとして、OBI はネットワークレベルのメトリクスも提供します。
詳細については、[ネットワークメトリクスのドキュメント](../../network/)を参照してください。

以下のセクションでは、OBI 設定全体に適用されるグローバル設定プロパティについて説明します。

例

```yaml
trace_printer: json
shutdown_timeout: 30s
channel_buffer_len: 33
```

| YAML<br>環境変数                                   | 説明                                                                                                                                                              | 型                          | デフォルト |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------- |
| _(YAML なし)_<br>`OTEL_EBPF_AUTO_TARGET_EXE`       | 実行可能ファイルのフルパスへの [グロブ](<https://en.wikipedia.org/wiki/Glob_(programming)>) マッチングによって計装するプロセスを選択します。                     | string                      | 未設定     |
| _(YAML なし)_<br>`OTEL_EBPF_AUTO_TARGET_LANGUAGE`  | 検出されたプログラミング言語（グロブマッチャー）によって計装するプロセスを選択します。たとえば `go`、`java`、`nodejs` などです。                                    | string                      | 未設定     |
| `open_port`<br>`OTEL_EBPF_OPEN_PORT`               | オープンポートによって計装するプロセスを選択します。ポートとポート範囲のカンマ区切りリストを受け付けます。                                                       | string                      | 未設定     |
| `target_pids`<br>`OTEL_EBPF_TARGET_PID`            | PID によって計装するプロセスを選択します。YAML リスト、単一値、またはカンマ区切り環境変数リストを受け付けます。                                                  | integer または integer のリスト | 未設定     |
| `shutdown_timeout`<br>`OTEL_EBPF_SHUTDOWN_TIMEOUT` | グレースフルシャットダウンのタイムアウトを設定します。                                                                                                            | string                      | "10s"      |
| `log_level`<br>`OTEL_EBPF_LOG_LEVEL`               | プロセスロガーの詳細レベルを設定します。有効な値は `DEBUG`、`INFO`、`WARN`、`ERROR`                                                                         | string                      | `INFO`     |
| `log_format`<br>`OTEL_EBPF_LOG_FORMAT`             | ロガーの出力形式を設定します。有効な値は `text`、`json`　です。                                                                                                      | string                      | `text`     |
| `trace_printer`<br>`OTEL_EBPF_TRACE_PRINTER`       | 計装されたトレースを指定された形式で標準出力に出力します。[トレースプリンター形式](#trace-printer-formats)を参照してください。                                    | string                      | `disabled` |
| `enforce_sys_caps`<br>`OTEL_EBPF_ENFORCE_SYS_CAPS` | 起動時にシステムケーパビリティが不足している場合の OBI の処理方法を制御します。                                                                                  | boolean                     | `false`    |

## 実行可能ファイル名のマッチング {#executable-name-matching}

このプロパティは、ファイルシステム上で実行可能ファイルが存在するディレクトリを含む完全な実行可能コマンドラインに対して [グロブ](<https://en.wikipedia.org/wiki/Glob_(programming)>) マッチングを行います。
OBI は 1 つのプロセス、または同様の特性を持つ複数のプロセスを選択します。
より詳細なプロセスの選択とグルーピングについては、[サービスディスカバリーのドキュメント](../service-discovery/)を参照してください。

実行可能ファイル名で計装する場合は、対象システム上の 1 つの実行可能ファイルに一致する明確な名前を選択してください。
たとえば、`OTEL_EBPF_AUTO_TARGET_EXE=*/server` を設定してグロブに一致する 2 つのプロセスがある場合、OBI は両方を選択します。
かわりに、完全なアプリケーションパスを使用して完全一致を行ってください。
たとえば `OTEL_EBPF_AUTO_TARGET_EXE=/opt/app/server` または `OTEL_EBPF_AUTO_TARGET_EXE=/server` といった具合です。

`OTEL_EBPF_AUTO_TARGET_EXE` と `OTEL_EBPF_OPEN_PORT` の両方のプロパティを設定した場合、OBI は両方の選択条件に一致する実行可能ファイルのみを選択します。

## 言語のマッチング {#language-matching}

`OTEL_EBPF_AUTO_TARGET_LANGUAGE` を使用して、検出された言語ランタイムに基づいてプロセスをターゲットにします。

以下が例です。

```shell
OTEL_EBPF_AUTO_TARGET_LANGUAGE=go
```

グロブ表現も使用できます。

```shell
OTEL_EBPF_AUTO_TARGET_LANGUAGE='java*'
```

このオプションを `OTEL_EBPF_AUTO_TARGET_EXE` や `OTEL_EBPF_OPEN_PORT` と組み合わせる場合、プロセスは設定されたすべてのセレクターを満たす必要があります。

## ターゲット PID のマッチング {#target-pid-matching}

`target_pids`（YAML）または `OTEL_EBPF_TARGET_PID`（環境変数）を使用して、特定のプロセス ID のみを計装します。

YAML の例は次のとおり。

```yaml
target_pids: [1234, 5678]
```

```yaml
target_pids: 1234
```

環境変数の例は以下です。

```shell
OTEL_EBPF_TARGET_PID=1234,5678
```

これは、正確なプロセス ID が分かっている場合のターゲットを絞ったトラブルシューティングやコントロールされたリリースに役立ちます。

## オープンポートのマッチング {#open-port-matching}

このプロパティは、ポートまたはポート範囲のカンマ区切りリストを受け付けます。
実行可能ファイルがいずれかのポートに一致する場合、OBI がそれを選択します。
たとえば次のとおり。

```shell
OTEL_EBPF_OPEN_PORT=80,443,8000-8999
```

この例では、OBI はポート `80`、`443`、または `8000` から `8999` の間のポートを開く実行可能ファイルを選択します。
1 つのプロセスまたは同様の特性を持つ複数のプロセスを選択できます。
より詳細なプロセスの選択とグルーピングについては、[サービスディスカバリーのドキュメント](../service-discovery/)の手順に従ってください。

実行可能ファイルが複数のポートを開く場合、そのポートの 1 つを指定するだけで、OBI はすべてのアプリケーションポートの HTTP/S および gRPC リクエストをすべて計装します。
現在、特定のポートのリクエストのみに計装を限定する方法はありません。

指定されたポート範囲が広い場合（例: `1-65535`）、OBI はその範囲内のポートのうち 1 つでも所有しているプロセスすべてに対して実行しようとします。

`OTEL_EBPF_AUTO_TARGET_EXE` と `OTEL_EBPF_OPEN_PORT` の両方のプロパティを設定した場合、OBI は両方の選択条件に一致する実行可能ファイルのみを選択します。

## トレースプリンター形式 {#trace-printer-formats}

このオプションは、計装されたトレースを以下のいずれかの形式を使用して標準出力に出力します。

- **`disabled`**: プリンターを無効化
- **`text`**: 簡潔な 1 行テキストを出力
- **`json`**: コンパクトな JSON オブジェクトを出力
- **`json_indent`**: インデントされた JSON オブジェクトを出力

## システムケーパビリティ {#system-capabilities}

`enforce_sys_caps` を `true` に設定し、必要なシステムケーパビリティが不足している場合、OBI は起動を中止して不足しているケーパビリティをログに記録します。
このオプションを `false` に設定した場合、OBI は不足しているケーパビリティをログに記録するのみです。
