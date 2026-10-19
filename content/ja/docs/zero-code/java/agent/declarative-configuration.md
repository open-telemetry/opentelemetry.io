---
title: Java エージェントの宣言的設定
linkTitle: 宣言的設定
weight: 11
default_lang_commit: b8a25353c25d781a375b51f354011248a8140113
cSpell:ignore: Customizer Dotel
---

宣言的設定は、環境変数やシステムプロパティのかわりに YAML ファイルを使用します。

このアプローチは次のような場合に便利です。

- 設定するオプションが多い場合
- 環境変数やシステムプロパティでは利用できない設定オプションを使いたい場合

環境変数と同様に、設定の構文は言語に依存せず、OpenTelemetry Java エージェントを含む、宣言的設定をサポートするすべての OpenTelemetry Java SDK で動作します。

> [!WARNING]
>
> 宣言的設定のスキーマは安定版です。
> まだ実験的な部分には `/development` というサフィックスが付いています。
> Java エージェントの宣言的設定サポートはまだ実験的です。

## サポートされるバージョン {#supported-versions}

宣言的設定は **OpenTelemetry Java エージェントバージョン 2.26.0 以降** でサポートされています。

## はじめに {#getting-started}

1. 以下の設定ファイルを `otel-config.yaml` として保存します。
2. JVM の起動引数に以下を追加します。<br>
   `-Dotel.config.file=/path/to/otel-config.yaml`

```yaml
file_format: '1.0'

resource:
  attributes_list: ${OTEL_RESOURCE_ATTRIBUTES}
  detection/development:
    detectors:
      - service: # "service.instance.id" と OTEL_SERVICE_NAME からの "service.name" が追加される

propagator:
  composite:
    - tracecontext:
    - baggage:

tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}

meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}

logger_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: ${OTEL_EXPORTER_OTLP_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}
```

宣言的設定のより一般的なスタートガイドについては、[SDK の宣言的設定][SDK Declarative configuration] のドキュメントを参照してください。

このページでは、[OpenTelemetry Java エージェント](https://github.com/open-telemetry/opentelemetry-java-instrumentation) に特有の内容に焦点を当てています。
Spring Boot スターターについては、[Spring Boot スターターの宣言的設定](/docs/zero-code/java/spring-boot-starter/declarative-configuration/) を参照してください。

## 既存の設定の変換 {#convert-your-existing-configuration}

{{< dc-converter source="agent" >}}

## 設定オプションのマッピング {#mapping-of-configuration-options}

既存の環境変数やシステムプロパティの設定を宣言的設定にマッピングする場合は、以下のルールを使用してください。

1. 設定オプションが `otel.javaagent.` で始まる場合（例: `otel.javaagent.logging`）、環境変数またはシステムプロパティでのみ設定できるプロパティである可能性が高いです（詳細は以下の [環境変数とシステムプロパティのみのオプション](#environment-variables-and-system-properties-only-options) セクションを参照してください）。
   それ以外の場合は、`otel.javaagent.` 接頭辞を削除し、以下の `agent` セクションに配置します。
2. 設定オプションが `otel.instrumentation.` で始まる場合（例: `otel.instrumentation.spring-batch.experimental.chunk.new-trace`）、`otel.instrumentation.` 接頭辞を削除し、以下の `instrumentation` セクションに配置します。
3. それ以外の場合、オプションは SDK の設定に属する可能性が高いです。
   [移行設定](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/otel-sdk-migration-config.yaml) で適切なセクションを見つけてください。
   `otel.bsp.schedule.delay` のようなシステムプロパティがある場合は、移行設定で対応する環境変数 `OTEL_BSP_SCHEDULE_DELAY` を探してください。
4. `.` を使ってインデントレベルを作成します。
5. `-` を `_` に変換します。
6. 適切な場合は YAML のブーリアン型と整数型を使用します（例: `"true"` のかわりに `true`、`"5000"` のかわりに `5000`）。
7. 特別なマッピングがあるオプションは以下で説明しています。

```yaml
instrumentation/development:
  general:
    http:
      client:
        request_captured_headers: # 以前は otel.instrumentation.http.client.capture-request-headers
          - Content-Type
          - Accept
        response_captured_headers: # 以前は otel.instrumentation.http.client.capture-response-headers
          - Content-Type
          - Content-Encoding
      server:
        request_captured_headers: # 以前は otel.instrumentation.http.server.capture-request-headers
          - Content-Type
          - Accept
        response_captured_headers: # 以前は otel.instrumentation.http.server.capture-response-headers
          - Content-Type
          - Content-Encoding

  java:
    common:
      service_mapping: # 以前は "otel.instrumentation.common.peer-service-mapping"
        - peer: 1.2.3.4
          service_name: FooService
        - peer: 2.3.4.5
          service_name: BarService

    agent:
      # 以前は otel.instrumentation.common.default-enabled
      # instrumentation_mode: none  # 以前は false
      instrumentation_mode: default # 以前は true
    spring_batch:
      experimental:
        chunk:
          new_trace: true
```

エージェント固有のオプション（`otel.javaagent.` で始まるもの）は `distribution` セクションに配置されます。

```yaml
distribution:
  javaagent:
    instrumentation:
      default_enabled: false # 以前は otel.instrumentation.common.default-enabled
      enabled:
        - tomcat
        - spring_webmvc
      disabled:
        - armeria_grpc
    exclude_classes: # 以前は otel.javaagent.exclude-classes
      - com.example.excluded.Class1
    exclude_class_loaders: # 以前は otel.javaagent.exclude-class-loaders
      - com.example.ExcludedClassLoader
```

## 環境変数とシステムプロパティのみのオプション {#environment-variables-and-system-properties-only-options}

以下の設定オプションは宣言的設定でサポートされていますが、環境変数またはシステムプロパティでのみ利用可能です。

- `otel.javaagent.configuration-file`（ただし、宣言的設定では不要なはずです）
- `otel.javaagent.debug`
- `otel.javaagent.enabled`
- `otel.javaagent.experimental.field-injection.enabled`
- `otel.javaagent.experimental.security-manager-support.enabled`
- `otel.javaagent.extensions`
- `otel.javaagent.logging.application.logs-buffer-max-records`
- `otel.javaagent.logging`

これらのオプションはエージェントの起動時、宣言的設定ファイルが読み込まれる前に必要です。

## 期間のフォーマット {#duration-format}

- 宣言的設定は **ミリ秒単位の期間のみをサポートしています**（例: 5秒の場合は `5000`）。
- `OTEL_BSP_SCHEDULE_DELAY=5s` を使用するとエラーになります（環境変数では有効ですが、宣言的設定では無効です）。

例:

```yaml
tracer_provider:
  processors:
    - batch:
        schedule_delay: ${OTEL_BSP_SCHEDULE_DELAY:-5000}
```

## 動作の違い {#behavior-differences}

- リソース属性 `telemetry.distro.name`（Java エージェントによってデフォルトで追加される）の値は、`opentelemetry-java-instrumentation` ではなく `opentelemetry-javaagent` になります（3.0 リリースで再び統一される予定です）。

## まだサポートされていない機能 {#not-yet-supported-features}

### まだ環境変数やシステムプロパティが必要な機能 {#features-that-still-need-environment-variables-or-system-properties}

環境変数やシステムプロパティでサポートされている一部の機能は、宣言的設定ではまだサポートされていません。

以下の設定は、環境変数またはシステムプロパティで設定する必要があります。

- `otel.javaagent.experimental.thread-propagation-debugger.enabled`

### まったくサポートされていない機能 {#features-not-yet-supported-at-all}

宣言的設定でまだサポートされていない Java エージェントの機能:

- `otel.javaagent.add-thread-details`

宣言的設定でまだサポートされていない Contrib の機能:

- [AWS X-Ray](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/aws-xray)
- [GCP authentication](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/gcp-auth-extension)
- [Inferred Spans](https://github.com/open-telemetry/opentelemetry-java-contrib/blob/main/inferred-spans)

## エクステンション API {#extension-api}

エクステンションは新しい宣言的設定 API を使用します。

- `AutoConfigurationCustomizerProvider` を使用するエクステンションは、新しい `DeclarativeConfigurationCustomizerProvider` API に移行する必要があります。
  以前の [AgentTracerProviderConfigurer](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/javaagent-tooling/src/main/java/io/opentelemetry/javaagent/tooling/AgentTracerProviderConfigurer.java) が新しい [SpanLoggingCustomizerProvider](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/javaagent-tooling/src/main/java/io/opentelemetry/javaagent/tooling/SpanLoggingCustomizerProvider.java) にどのようにマッピングされるかを確認してください。
- スパンエクスポーターなどのコンポーネントは、`ComponentProvider` API を使用する必要があります。
  旧 API と新 API の両方をサポートしている [Baggage Processor](https://github.com/open-telemetry/opentelemetry-java-contrib/tree/main/baggage-processor) を例として確認してください。

[SDK Declarative configuration]: /docs/languages/sdk-configuration/declarative-configuration
