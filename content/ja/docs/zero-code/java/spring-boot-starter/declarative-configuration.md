---
title: 宣言的設定
weight: 25
default_lang_commit: 0bfcaf7e0a3d58dfa7db4f4e22f965e5de758e69
cSpell:ignore: Customizer Dotel genai sqlcommenter
---

宣言的設定は、`application.yaml` 内で [OpenTelemetry の宣言的設定スキーマ](/docs/languages/sdk-configuration/declarative-configuration/)を使用します。

このアプローチは以下のような場合に便利です。

- 設定するオプションが多い場合
- `application.properties` や `application.yaml` では利用できない設定オプションを使いたい場合
- [Java エージェント](/docs/zero-code/java/agent/declarative-configuration/)と同じ設定形式を使いたい場合

> [!WARNING]
>
> 宣言的設定は実験的機能です。

## サポートされるバージョン {#supported-versions}

宣言的設定は **OpenTelemetry Spring Boot スターターのバージョン 2.26.0 以降**でサポートされています。

## 依存関係の管理 {#dependency-management}

[はじめに](../getting-started/#dependency-management)のページに記載されているように、`dependencyManagement` で `opentelemetry-instrumentation-bom` をインポートしてください。

> [!IMPORTANT]
>
> Spring Boot 3.5 以降では、`opentelemetry-instrumentation-bom` のインポートが**必須**です。
> Spring Boot 3.5 以降は独自の OpenTelemetry 依存関係管理を同梱しており、`opentelemetry-api` をスターターの宣言的設定に必要な `io.opentelemetry.common.ComponentLoader` を含まないバージョンに固定します。
> BOM がないと、アプリケーションは `NoClassDefFoundError: io/opentelemetry/common/ComponentLoader` で起動に失敗します。
>
> Maven を使用する場合、OpenTelemetry の BOM は Spring Boot の parent / `spring-boot-dependencies` BOM **よりも前に**インポートして、バージョンが優先されるようにする必要があります。

## はじめに {#getting-started}

`application.yaml` に `otel.file_format: "1.0"`（または現在の、もしくは希望するバージョン）を追加して、宣言的設定を有効にします。

```yaml
otel:
  file_format: '1.0'

  resource:
    detection/development:
      detectors:
        - service:
    attributes:
      - name: service.name
        value: my-spring-app

  propagator:
    composite:
      - tracecontext:
      - baggage:

  tracer_provider:
    processors:
      - batch:
          exporter:
            otlp_http:
              endpoint: ${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:http://localhost:4318/v1/traces}

  meter_provider:
    readers:
      - periodic:
          exporter:
            otlp_http:
              endpoint: ${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:http://localhost:4318/v1/metrics}

  logger_provider:
    processors:
      - batch:
          exporter:
            otlp_http:
              endpoint: ${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:http://localhost:4318/v1/logs}
```

`${VAR:default}` はコロン1つ（Spring の構文）を使用しており、エージェントのスタンドアロン YAML ファイルで使用される `${VAR:-default}` 構文とは異なることに注意してください。

## 既存の設定を変換する {#convert-your-existing-configuration}

{{< dc-converter source="spring" >}}

## 設定オプションのマッピング {#mapping-of-configuration-options}

以下のルールは、`application.properties` / `application.yaml` の設定オプションが宣言的設定の対応する形式にどのようにマッピングされるかを説明します。

### 計装の有効化/無効化 {#instrumentation-enabledisable}

宣言的設定では、計装の有効化/無効化は個別のプロパティのかわりに集中管理されたリストを使用します。
計装名には `-`（kebab-case）ではなく `_`（snake_case）を使用します。

| プロパティ                                            | 宣言的設定                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| `otel.instrumentation.jdbc.enabled=true`              | `otel.distribution.spring_starter.instrumentation.enabled: [jdbc]`              |
| `otel.instrumentation.logback-appender.enabled=false` | `otel.distribution.spring_starter.instrumentation.disabled: [logback_appender]` |
| `otel.instrumentation.common.default-enabled=false`   | `otel.distribution.spring_starter.instrumentation.default_enabled: false`       |

例:

```yaml
otel:
  distribution:
    spring_starter:
      instrumentation:
        default_enabled: false
        enabled:
          - jdbc
          - spring_web
        disabled:
          - logback_appender
```

### 計装の設定 {#instrumentation-configuration}

`otel.instrumentation.*` 配下の設定オプション（有効化/無効化以外）は、`otel.instrumentation/development.java.*` にマッピングされます。

1. `otel.instrumentation.` 接頭辞を取り除く
2. 各セグメントで `-` を `_` に置き換える
3. `otel.instrumentation/development.java.` 配下に配置する
4. キーの `/development` 接尾辞は実験的な機能を示す（逆マッピングについては [`ConfigPropertiesBackedDeclarativeConfigProperties`](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/declarative-config-bridge/src/main/java/io/opentelemetry/instrumentation/config/bridge/ConfigPropertiesBackedDeclarativeConfigProperties.java) の `translateName` メソッドを参照）

例:

| プロパティ                                                          | 宣言的設定                                                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `otel.instrumentation.logback-appender.experimental-log-attributes` | `otel.instrumentation/development.java.logback_appender.experimental_log_attributes/development` |

デフォルトのアルゴリズムに従わない特別なマッピングを持つオプションもあります。

| プロパティ                                                                      | 宣言的設定                                                                                         |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `otel.instrumentation.common.db.query-sanitization.enabled`                     | `otel.instrumentation/development.java.common.db.query_sanitization.enabled`                       |
| `otel.instrumentation.common.db-statement-sanitizer.enabled` (deprecated)       | `otel.instrumentation/development.java.common.db_statement_sanitizer.enabled`                      |
| `otel.instrumentation.common.db.experimental.sqlcommenter.enabled`              | `otel.instrumentation/development.java.common.db.sqlcommenter/development.enabled`                 |
| `otel.instrumentation.http.client.capture-request-headers`                      | `otel.instrumentation/development.general.http.client.request_captured_headers`                    |
| `otel.instrumentation.http.client.capture-response-headers`                     | `otel.instrumentation/development.general.http.client.response_captured_headers`                   |
| `otel.instrumentation.http.server.capture-request-headers`                      | `otel.instrumentation/development.general.http.server.request_captured_headers`                    |
| `otel.instrumentation.http.server.capture-response-headers`                     | `otel.instrumentation/development.general.http.server.response_captured_headers`                   |
| `otel.instrumentation.http.client.emit-experimental-telemetry`                  | `otel.instrumentation/development.java.common.http.client.emit_experimental_telemetry/development` |
| `otel.instrumentation.http.server.emit-experimental-telemetry`                  | `otel.instrumentation/development.java.common.http.server.emit_experimental_telemetry/development` |
| `otel.instrumentation.http.known-methods`                                       | `otel.instrumentation/development.java.common.http.known_methods`                                  |
| `otel.instrumentation.messaging.experimental.receive-telemetry.enabled`         | `otel.instrumentation/development.java.common.messaging.receive_telemetry/development.enabled`     |
| `otel.instrumentation.messaging.experimental.capture-headers`                   | `otel.instrumentation/development.java.common.messaging.capture_headers/development`               |
| `otel.instrumentation.genai.capture-message-content`                            | `otel.instrumentation/development.java.common.gen_ai.capture_message_content`                      |
| `otel.instrumentation.sanitization.url.experimental.sensitive-query-parameters` | `otel.instrumentation/development.general.sanitization.url.sensitive_query_parameters/development` |
| `otel.semconv-stability.opt-in`                                                 | `otel.instrumentation/development.general.semconv_stability.opt_in`                                |
| `otel.semconv.exception.signal.preview`                                         | `otel.instrumentation/development.general.semconv_exception.signal.preview`                        |
| `otel.instrumentation.experimental.span-suppression-strategy`                   | `otel.instrumentation/development.java.common.span_suppression_strategy/development`               |
| `otel.instrumentation.opentelemetry-annotations.exclude-methods`                | `otel.instrumentation/development.java.opentelemetry_extension_annotations.exclude_methods`        |
| `otel.experimental.javascript-snippet`                                          | `otel.instrumentation/development.java.servlet.javascript_snippet/development`                     |
| `otel.jmx.enabled`                                                              | `otel.instrumentation/development.java.jmx.enabled`                                                |
| `otel.jmx.config`                                                               | `otel.instrumentation/development.java.jmx.config`                                                 |
| `otel.jmx.discovery.delay`                                                      | `otel.instrumentation/development.java.jmx.discovery.delay`                                        |
| `otel.jmx.target.system`                                                        | `otel.instrumentation/development.java.jmx.target.system`                                          |

`instrumentation/development` セクションには2つのトップレベルグループがあります。

- `general.*` — 言語横断的な設定（HTTP ヘッダー、セマンティック規約の安定性）
- `java.*` — Java 固有の計装設定

### SDK の無効化 {#disable-the-sdk}

| プロパティ               | 宣言的設定            |
| ------------------------ | --------------------- |
| `otel.sdk.disabled=true` | `otel.disabled: true` |

### SDK の設定 {#sdk-configuration}

SDK レベルの設定（エクスポーター、プロパゲーター、リソース）は、[はじめに](#getting-started)の例で示したように、標準の[宣言的設定スキーマ](/docs/languages/sdk-configuration/declarative-configuration/)に従って `otel:` 直下に配置します。

## エージェントの宣言的設定との違い {#differences-from-agent-declarative-configuration}

| 項目           | エージェント                                             | Spring Boot スターター                                        |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| 設定の場所     | 別ファイル（`-Dotel.config.file=...`）                   | `application.yaml` 内                                         |
| 変数の構文     | `${VAR:-default}`（コロン2つ）                           | `${VAR:default}`（コロン1つ、Spring）                         |
| プロファイル   | 非対応                                                   | Spring プロファイルが通常通り動作                             |
| 有効化/無効化  | `distribution.javaagent.instrumentation.*`               | `distribution.spring_starter.instrumentation.*`               |
| デフォルト有効 | `distribution.javaagent.instrumentation.default_enabled` | `distribution.spring_starter.instrumentation.default_enabled` |

## 環境変数によるオーバーライド {#environment-variable-overrides}

Spring の緩和バインディングにより、宣言的設定の YAML の任意の部分を環境変数でオーバーライドできます。

```shell
# instrumentation/development 配下のスカラー値をオーバーライド
OTEL_INSTRUMENTATION/DEVELOPMENT_JAVA_FOO_STRING_KEY=new_value

# インデックス付きリスト要素のオーバーライド（例: エクスポーターのエンドポイント）
OTEL_TRACER_PROVIDER_PROCESSORS_0_BATCH_EXPORTER_OTLP_HTTP_ENDPOINT=http://custom:4318/v1/traces
```

ルール: 大文字にし、`.` を `_` に置き換え、`/` はそのまま（例: `INSTRUMENTATION/DEVELOPMENT`）にし、リストのインデックスには `_0_`、`_1_` を使用します。

これは標準的な Spring の機能であり、`application.yaml` 内のすべてのキーで動作します。

## 期間のフォーマット {#duration-format}

宣言的設定は**ミリ秒単位の期間のみをサポート**します（例: 5秒の場合は `5000`）。
`5s` のような期間文字列を使用するとエラーになります。

## プログラムによる設定 {#programmatic-configuration}

宣言的設定では、`AutoConfigurationCustomizerProvider`（[プログラムによる設定](../programmatic-configuration/)を参照）は `DeclarativeConfigurationCustomizerProvider` に置き換えられます。
スパンエクスポーターなどのコンポーネントは `ComponentProvider` API を使用します。
詳細と例については、[エージェントの Extension API セクション](/docs/zero-code/java/agent/declarative-configuration/)を参照してください。同じ API が Spring Boot スターターにも適用されます。
