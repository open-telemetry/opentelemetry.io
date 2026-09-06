---
title: 設定
description: OpenTelemetry PHP Distro の設定オプション。
weight: 1
default_lang_commit: 669d1a40e56ed2dd914d48340b31e16a83610d40
# prettier-ignore
cSpell:ignore: ComponentProvider keypass opentelemetry-php-contrib stderr syslog yaml
---

OpenTelemetry PHP Distro は、標準的な OpenTelemetry SDK の設定と Distro 固有のオプションをサポートしています。

## 設定方法 {#configuration-method}

PHP プロセスで利用可能な環境変数を使用して設定します。

- `OTEL_*`：OpenTelemetry 標準オプション
- `OTEL_PHP_*`：Distro 固有のオプション

例:

```sh
export OTEL_EXPORTER_OTLP_ENDPOINT="https://your-endpoint:443/"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <token>"
export OTEL_PHP_LOG_LEVEL_STDERR="INFO"
```

## OpenTelemetry オプション {#opentelemetry-options}

Distro は標準的な OpenTelemetry PHP SDK オプションをサポートしています。

| オプション                              | デフォルト              | 使用可能な値                     | 説明                                           |
| --------------------------------------- | ----------------------- | -------------------------------- | ---------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT`           | `http://localhost:4318` | URL                              | OTLP エンドポイント URL                        |
| `OTEL_EXPORTER_OTLP_HEADERS`            | （空）                  | `key=value,key2=value2`          | OTLP リクエストヘッダー                        |
| `OTEL_EXPORTER_OTLP_INSECURE`           | `false`                 | `true` または `false`            | TLS 検証を無効化（テスト専用）                 |
| `OTEL_EXPORTER_OTLP_CERTIFICATE`        | （空）                  | ファイルシステムパス（PEM）      | OTLP TLS 用の CA 証明書パス                    |
| `OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE` | （空）                  | ファイルシステムパス（PEM）      | OTLP mTLS 用のクライアント証明書               |
| `OTEL_EXPORTER_OTLP_CLIENT_KEY`         | （空）                  | ファイルシステムパス（PEM）      | OTLP mTLS 用のクライアント鍵                   |
| `OTEL_EXPORTER_OTLP_CLIENT_KEYPASS`     | （空）                  | 文字列                           | 暗号化された OTLP クライアント鍵のパスフレーズ |
| `OTEL_SERVICE_NAME`                     | `unknown_service`       | 文字列                           | `service.name` リソース属性の値                |
| `OTEL_RESOURCE_ATTRIBUTES`              | （空）                  | `key=value,key2=value2`          | リソース属性                                   |
| `OTEL_TRACES_SAMPLER`                   | `parentbased_always_on` | サンプラー名                     | トレースサンプラー                             |
| `OTEL_TRACES_SAMPLER_ARG`               | （空）                  | 文字列/数値                      | サンプラー引数                                 |
| `OTEL_LOG_LEVEL`                        | `info`                  | `error`, `warn`, `info`, `debug` | SDK 内部ログレベル                             |

## Distro 固有のオプション（`OTEL_PHP_*`） {#distro-specific-options-otel*php*}

すべての `OTEL_PHP_*` オプションは環境変数または `php.ini` で設定できます。

`php.ini` の場合は、`opentelemetry_distro.` 接頭辞とオプション名の小文字を使用してください。

例:

```sh
export OTEL_PHP_ENABLED=true
```

```ini
opentelemetry_distro.enabled=true
```

### 全般設定 {#general-configuration}

| オプション                                           | デフォルト | 使用可能な値          | 説明                                                                                                                   |
| ---------------------------------------------------- | ---------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `OTEL_PHP_ENABLED`                                   | `true`     | `true` または `false` | 自動ブートストラップを有効化                                                                                           |
| `OTEL_PHP_OPENTELEMETRY_EXTENSION_EMULATION_ENABLED` | `true`     | `true` または `false` | エミュレートされた `opentelemetry` エクステンションの登録を有効化し、`opentelemetry.so` なしで自動計装を動作可能にする |
| `OTEL_PHP_NATIVE_OTLP_SERIALIZER_ENABLED`            | `true`     | `true` または `false` | ネイティブ OTLP protobuf シリアライザーを有効化                                                                        |

### 非同期データ送信 {#asynchronous-data-sending}

| オプション                                  | デフォルト | 使用可能な値                              | 説明                                       |
| ------------------------------------------- | ---------- | ----------------------------------------- | ------------------------------------------ |
| `OTEL_PHP_ASYNC_TRANSPORT`                  | `true`     | `true` または `false`                     | テレメトリーのバックグラウンド転送を有効化 |
| `OTEL_PHP_ASYNC_TRANSPORT_SHUTDOWN_TIMEOUT` | `30s`      | 期間（`ms`、`s`、`m`）                    | シャットダウン時のフラッシュタイムアウト   |
| `OTEL_PHP_MAX_SEND_QUEUE_SIZE`              | `2MB`      | 整数（オプションで `B`、`MB`、`GB` 付き） | ワーカーごとの最大非同期バッファサイズ     |

### ロギング {#logging}

| オプション                  | デフォルト | 使用可能な値                                                    | 説明                       |
| --------------------------- | ---------- | --------------------------------------------------------------- | -------------------------- |
| `OTEL_PHP_LOG_FILE`         | （空）     | ファイルシステムパス                                            | ログ出力ファイルパス       |
| `OTEL_PHP_LOG_LEVEL_FILE`   | `OFF`      | `OFF`, `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, `TRACE` | ファイルシンクのログレベル |
| `OTEL_PHP_LOG_LEVEL_STDERR` | `OFF`      | `OFF`, `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, `TRACE` | stderr シンクのログレベル  |
| `OTEL_PHP_LOG_LEVEL_SYSLOG` | `OFF`      | `OFF`, `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`, `TRACE` | syslog シンクのログレベル  |
| `OTEL_PHP_LOG_FEATURES`     | （空）     | `FEATURE=LEVEL,...`                                             | 機能ごとのログレベル       |

### トランザクションスパン {#transaction-span}

| オプション                              | デフォルト | 使用可能な値                 | 説明                        |
| --------------------------------------- | ---------- | ---------------------------- | --------------------------- |
| `OTEL_PHP_TRANSACTION_SPAN_ENABLED`     | `true`     | `true` または `false`        | Web SAPI の自動ルートスパン |
| `OTEL_PHP_TRANSACTION_SPAN_ENABLED_CLI` | `true`     | `true` または `false`        | CLI の自動ルートスパン      |
| `OTEL_PHP_TRANSACTION_URL_GROUPS`       | （空）     | カンマ区切りのワイルドカード | URL グルーピングパターン    |

### 属性ベースの計装 {#attribute-based-instrumentation}

| オプション                    | デフォルト | 使用可能な値          | 説明                                                                                                                                                                       |
| ----------------------------- | ---------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_PHP_ATTR_HOOKS_ENABLED` | `false`    | `true` または `false` | `#[WithSpan]` / `#[SpanAttribute]` 属性ベースのスパン生成を有効化。[属性ベースの計装](/docs/zero-code/php/distro/reference/attribute-instrumentation/)を参照してください。 |

### スコープ付き依存関係ブリッジ {#scoped-dependencies-bridge}

| オプション                            | デフォルト | 使用可能な値          | 説明                                                                                                                                                                                                                                                                     |
| ------------------------------------- | ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `OTEL_PHP_SCOPED_DEPS_BRIDGE_ENABLED` | `false`    | `true` または `false` | アプリケーション自体の OpenTelemetry 使用が Distro のランタイム（トレーサープロバイダー、コンテキスト）を共有できるようにし、アプリケーションのスパンが Distro のトレースに参加できるようにします。下記の[注記](#scoped-dependencies-bridge-interop)を参照してください。 |

### 推論スパン {#inferred-spans}

| オプション                                   | デフォルト | 使用可能な値           | 説明                               |
| -------------------------------------------- | ---------- | ---------------------- | ---------------------------------- |
| `OTEL_PHP_INFERRED_SPANS_ENABLED`            | `false`    | `true` または `false`  | 推論スパンを有効化                 |
| `OTEL_PHP_INFERRED_SPANS_REDUCTION_ENABLED`  | `true`     | `true` または `false`  | 連続する重複フレームを削減         |
| `OTEL_PHP_INFERRED_SPANS_STACKTRACE_ENABLED` | `true`     | `true` または `false`  | 推論スパンにスタックトレースを付与 |
| `OTEL_PHP_INFERRED_SPANS_SAMPLING_INTERVAL`  | `50ms`     | 期間（`ms`、`s`、`m`） | スタックトレースのサンプリング間隔 |
| `OTEL_PHP_INFERRED_SPANS_MIN_DURATION`       | `0`        | 期間（`ms`、`s`、`m`） | 推論スパンの最小期間               |

### 中央設定（OpAMP） {#central-configuration-opamp}

| オプション                          | デフォルト | 使用可能な値                        | 説明                                                                                                                  |
| ----------------------------------- | ---------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `OTEL_PHP_OPAMP_ENDPOINT`           | （空）     | `/v1/opamp` で終わる HTTP/HTTPS URL | OpAMP エンドポイント                                                                                                  |
| `OTEL_PHP_OPAMP_HEADERS`            | （空）     | `key=value,key2=value2`             | OpAMP リクエストヘッダー                                                                                              |
| `OTEL_PHP_OPAMP_HEARTBEAT_INTERVAL` | `30s`      | 期間（`ms`、`s`、`m`）              | OpAMP サーバーへのハートビートメッセージの送信間隔。                                                                  |
| `OTEL_PHP_OPAMP_POLLING_INTERVAL`   | `30s`      | 期間（`ms`、`s`、`m`）              | エージェントが更新された設定を取得するために OpAMP サーバーをポーリングする間隔。ハートビート間隔とは独立しています。 |
| `OTEL_PHP_OPAMP_SEND_TIMEOUT`       | `10s`      | 期間（`ms`、`s`、`m`）              | OpAMP 送信タイムアウト                                                                                                |
| `OTEL_PHP_OPAMP_SEND_MAX_RETRIES`   | `3`        | 0以上の整数                         | リトライ回数                                                                                                          |
| `OTEL_PHP_OPAMP_SEND_RETRY_DELAY`   | `10s`      | 期間（`ms`、`s`、`m`）              | リトライ遅延                                                                                                          |
| `OTEL_PHP_OPAMP_INSECURE`           | `false`    | `true` または `false`               | TLS 検証を無効化（テスト専用）                                                                                        |
| `OTEL_PHP_OPAMP_CERTIFICATE`        | （空）     | ファイルシステムパス（PEM）         | OpAMP TLS 用の CA 証明書パス                                                                                          |
| `OTEL_PHP_OPAMP_CLIENT_CERTIFICATE` | （空）     | ファイルシステムパス（PEM）         | OpAMP mTLS 用のクライアント証明書パス                                                                                 |
| `OTEL_PHP_OPAMP_CLIENT_KEY`         | （空）     | ファイルシステムパス（PEM）         | OpAMP mTLS 用のクライアント鍵パス                                                                                     |
| `OTEL_PHP_OPAMP_CLIENT_KEYPASS`     | （空）     | 文字列                              | 暗号化されたクライアント鍵のパスフレーズ                                                                              |

### サポータビリティ {#supportability}

| オプション                     | デフォルト | 使用可能な値          | 説明                                                                                                                                                                       |
| ------------------------------ | ---------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_PHP_SCOPED_DEPS_ENABLED` | `true`     | `true` または `false` | Distro がスコープ付き（名前空間接頭辞付き）またはオリジナルの依存関係を使用するかどうかを制御します。下記の[注記](#scoped-dependencies-bridge-interop)を参照してください。 |

## 注記 {#notes}

- バックグラウンド転送は OTLP HTTP/protobuf モードで動作します。
- `OTEL_PHP_AUTOLOAD_ENABLED` は Distro ランタイムによって有効として強制されます。
- Distro パッケージには複数の依存関係（OpenTelemetry SDK、各種自動計装パッケージ、およびそれらの推移的依存関係）が含まれています。
  アプリケーション自体の依存関係との名前空間の衝突を防ぐため、Distro はデフォルトで**スコープ付き**（名前空間接頭辞付き）の依存関係を使用します。
  スコープなしの依存関係にフォールバックするには、`OTEL_PHP_SCOPED_DEPS_ENABLED=false` を設定してください。

### スコープ付き依存関係ブリッジの相互運用 {#scoped-dependencies-bridge-interop}

デフォルトでは、Distro の OpenTelemetry ランタイムは**スコープ付き**です。
そのクラスは固有の名前空間接頭辞の下に配置され、アプリケーションが Composer 経由でインストールする標準的な `OpenTelemetry\*` クラスとは分離されています。
その結果、アプリケーション自体の OpenTelemetry 使用は別のランタイムに対して実行され、そのスパンはエクスポートされず、Distro のトレースにも接続されません。

`OTEL_PHP_SCOPED_DEPS_BRIDGE_ENABLED=true` を設定すると、2つのランタイムがブリッジされます。
アプリケーションの Composer オートローダーが実行される前に、Distro はスコープなしの `OpenTelemetry\*` API をスコープ付き実装にマッピングするクラスエイリアスを登録します。
これにより、アプリケーション自体の OpenTelemetry 使用は Distro のトレーサープロバイダーとコンテキストを透過的に使用するようになり、そのスパンはエクスポートされ、Distro のトレース内で正しく親子関係が設定されます。

このオプションは、スコープが無効な場合（`OTEL_PHP_SCOPED_DEPS_ENABLED=false`）は効果がありません。
スコープなしの場合、Distro はすでにスコープなしの `OpenTelemetry\*` クラスを使用しているため、ブリッジなしで共有が行われます。

## ファイルベースの設定（宣言型） {#file-based-configuration-declarative}

環境変数のかわりに、`OTEL_CONFIG_FILE` 環境変数を設定することで、YAML 設定ファイルを使用して SDK を設定できます。

```sh
export OTEL_CONFIG_FILE=/path/to/otel-config.yaml
```

`OTEL_CONFIG_FILE` が設定されている場合:

- SDK は個別の `OTEL_*` 環境変数のかわりに、YAML ファイルからすべての設定を読み込みます。
- YAML ファイル内では環境変数の置換（`${MY_VAR:-default}`）がサポートされています。
- 中央設定（OpAMP）は自動的に無効化されます。ファイルベースの設定とリモート設定は相互に排他的です。
- Distro 固有のオプション（`OTEL_PHP_*`）はネイティブエクステンションのオプションであり、SDK から独立しているため、引き続き動作します。

### Distro リソースディテクター {#distro-resource-detector}

Distro は `telemetry.distro.name` と `telemetry.distro.version` のリソース属性を追加する `distro` リソースディテクターを提供しています。
ファイルベースの設定でこれを有効にするには、`resource.detection/development.detectors` セクションに追加してください。

```yaml
file_format: '1.0-rc.2'

resource:
  attributes:
    - name: service.name
      value: my-service
  detection/development:
    detectors:
      - distro: {}

propagator:
  composite:
    - tracecontext:
    - baggage:

tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/traces

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/metrics

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/logs
```

完全な YAML スキーマについては、[OpenTelemetry Configuration Schema](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/schema-docs.md) を参照してください。

### 制限事項 {#limitations}

- ファイルベースの設定がアクティブな場合、中央設定（OpAMP）は利用できません。
- `Registry::registerResourceDetector()` 経由で登録されたリソースディテクター（たとえば `opentelemetry-php-contrib` のクラウドプロバイダーディテクター）は自動的には有効化されません。
  `ComponentProvider` を提供し、YAML の `resource.detection/development.detectors` セクションに明示的に記載する必要があります。
