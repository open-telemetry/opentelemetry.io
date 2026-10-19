---
title: ファイルから OpenTelemetry 準拠の Java ログを収集する
linkTitle: ファイルからの OTel 準拠 Java ログ
date: 2024-12-09
author: >
  [Cyrille Le Clerc](https://github.com/cyrille-leclerc) (Grafana Labs), [Gregor
  Zeitlinger](https://github.com/zeitlinger) (Grafana Labs)
issue: https://github.com/open-telemetry/opentelemetry.io/issues/5606
sig: Java, Specification
default_lang_commit: d03483e1d5cc696a5541f8bcc8ff97170f2f2ca1
# prettier-ignore
cSpell:ignore: Clerc cust Cyrille Dotel Gregor otlphttp otlpjson resourcedetection SLF4J stdout Zeitlinger
---

Java アプリケーションのログを OpenTelemetry 互換のログバックエンドに取り込みたい場合、最も簡単で推奨される方法は OpenTelemetry Protocol（OTLP）エクスポーターを使用することです。
しかし、組織的な要件や信頼性の観点から、ログをファイルや stdout に出力する必要があるシナリオもあります。

ログを集約する一般的なアプローチは、非構造化ログを使用し、正規表現で解析して、コンテキスト属性を追加するというものです。

しかし、正規表現による解析には問題があります。
すべてのログフィールド、例外のなかの改行、予期しないログフォーマットの変更を処理しようとすると、正規表現はすぐに複雑で壊れやすくなります。
この方法では解析エラーが不可避です。

## Java ログのネイティブソリューション {#native-solution-for-java-logs}

OpenTelemetry Java 計装エージェントと SDK は、SLF4J/Logback や Log4j2 などのフレームワークのログを、すべてのリソースおよびログ属性を含む OTel 準拠の JSON ログとして stdout に変換する簡単なソリューションを提供するようになりました。

これは真のターンキーソリューションです。

- コードや依存関係の変更は不要で、本番デプロイメントに典型的なわずかな設定調整のみで済みます。
- ログコレクターでの複雑なフィールドマッピングは不要です。
  ペイロードの取り込みには [OTLP/JSON コネクター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/635d4254a3018eb3ca8f1736e71fcb54f8ed6e5a/connector/otlpjsonconnector?from_branch=main) を使用するだけです。
- ログ、トレース、メトリクス間の自動的な相関。

このブログ記事では、このソリューションを段階的にセットアップする方法を紹介します。

- 最初のパートでは、Java アプリケーションを OTLP/JSON フォーマットでログを出力するよう設定する方法を紹介します。
- 2番目のパートでは、OpenTelemetry Collector がログを取り込めるよう設定する方法を紹介します。
- 最後に、コンテナログを処理するための Kubernetes 固有のセットアップを紹介します。

![OTLP/JSON アーキテクチャ](otlpjson-architecture.png)

## OTLP/JSON ログを出力するための Java アプリケーションの設定 {#configure-java-application-to-output-otlpjson-logs}

> [!NOTE]
>
> ブログ記事の手順は簡単に古くなる可能性があります。
> 問題が発生した場合は、最新バージョンに対して継続的に更新およびテストされている [Kubernetes にデプロイされたサンプルアプリケーション](https://github.com/open-telemetry/opentelemetry-java-examples/blob/022fdfb8bdfb95a4e9d424af41441b7188b7d347/logging-k8s-stdout-otlp-json/README.md?from_branch=main) を確認してください。

コードの変更は不要です。
テンプレート化されたログ、マップド診断コンテキスト、構造化ロギングを含む、お好みのロギングライブラリをそのまま使い続けてください。

```java
Logger logger = org.slf4j.LoggerFactory.getLogger(MyClass.class);
...
MDC.put("customerId", customerId);

logger.info("Order {} successfully placed", orderId);

logger.atInfo().
   .addKeyValue("orderId", orderId)
   .addKeyValue("outcome", "success")
   .log("placeOrder");
```

OTel Java 計装でキャプチャされたログを、OTel JSON フォーマット（別名 [OTLP/JSON](/docs/specs/otlp/#json-protobuf-encoding)）を使用して stdout にエクスポートします。
[Logback](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/afc68b59e011138621bff449432e88de79c54d1f/instrumentation/logback/logback-appender-1.0/javaagent?from_branch=main) および [Log4j](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/afc68b59e011138621bff449432e88de79c54d1f/instrumentation/log4j/log4j-appender-2.17/javaagent?from_branch=main) の設定パラメーターはオプションですが推奨されます。

```bash
# opentelemetry-javaagent v2.10.0 でテスト済み
#
# -Dotel.logback-appender.* パラメーターの詳細はドキュメントページを参照:
# https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/javaagent

java -javaagent:/path/to/opentelemetry-javaagent.jar \
     -Dotel.logs.exporter=experimental-otlp/stdout \
     -Dotel.instrumentation.logback-appender.experimental-log-attributes=true \
     -Dotel.instrumentation.logback-appender.experimental.capture-key-value-pair-attributes=true \
     -Dotel.instrumentation.logback-appender.experimental.capture-mdc-attributes=* \
     -jar /path/to/my-app.jar
```

`-Dotel.logs.exporter=experimental-otlp/stdout` JVM 引数と環境変数 `OTEL_LOGS_EXPORTER="experimental-otlp/stdout"` は交換可能です。

> [!NOTE]
>
> OTLP ログエクスポーターは実験的であり、変更される可能性があります。
> 最新の更新については [仕様の PR](https://github.com/open-telemetry/opentelemetry-specification/pull/4183) を確認してください。

OTLP/JSON ログが stdout に出力されることを確認してください。
ログは OTLP/JSON フォーマットで、1行につき1つの JSON オブジェクトになっています。
ログレコードは `resourceLogs` 配列にネストされています。
例:

<details>
  <summary> <code>{"resourceLogs":[{"resource" ...}]}</code> </summary>

```json
{
  "resourceLogs": [
    {
      "resource": {
        "attributes": [
          {
            "key": "deployment.environment.name",
            "value": {
              "stringValue": "staging"
            }
          },
          {
            "key": "service.instance.id",
            "value": {
              "stringValue": "6ad88e10-238c-4fb7-bf97-38df19053366"
            }
          },
          {
            "key": "service.name",
            "value": {
              "stringValue": "checkout"
            }
          },
          {
            "key": "service.namespace",
            "value": {
              "stringValue": "shop"
            }
          },
          {
            "key": "service.version",
            "value": {
              "stringValue": "1.1"
            }
          }
        ]
      },
      "scopeLogs": [
        {
          "scope": {
            "name": "com.mycompany.checkout.CheckoutServiceServer$CheckoutServiceImpl",
            "attributes": []
          },
          "logRecords": [
            {
              "timeUnixNano": "1730435085776869000",
              "observedTimeUnixNano": "1730435085776944000",
              "severityNumber": 9,
              "severityText": "INFO",
              "body": {
                "stringValue": "Order order-12035 successfully placed"
              },
              "attributes": [
                {
                  "key": "customerId",
                  "value": {
                    "stringValue": "customer-49"
                  }
                },
                {
                  "key": "thread.id",
                  "value": {
                    "intValue": "44"
                  }
                },
                {
                  "key": "thread.name",
                  "value": {
                    "stringValue": "grpc-default-executor-1"
                  }
                }
              ],
              "flags": 1,
              "traceId": "42de1f0dd124e27619a9f3c10bccac1c",
              "spanId": "270984d03e94bb8b"
            }
          ]
        }
      ],
      "schemaUrl": "https://opentelemetry.io/schemas/1.24.0"
    }
  ]
}
```

</details>

## OTLP/JSON ログを取り込むための Collector の設定 {#configure-the-collector-to-ingest-the-otlpjson-logs}

{{< figure class="figure" src="otel-collector-otlpjson-pipeline.png" attr="View OTel Collector pipeline with OTelBin" attrlink=`https://www.otelbin.io/s/69739d790cf279c203fc8efc86ad1a876a2fc01a` >}}

```yaml
# otelcol-contrib v0.112.0 でテスト済み

receivers:
  filelog/otlp-json-logs:
    # start_at: beginning # テスト目的の場合は "start_at: beginning" を使用
    include: [/path/to/my-app.otlpjson.log]
  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:
  resourcedetection:
    detectors: ['env', 'system']
    override: false

connectors:
  otlpjson:

service:
  pipelines:
    logs/raw_otlpjson:
      receivers: [filelog/otlp-json-logs]
      # (i) otlpjson コネクターの前にプロセッサーは不要
      # プロセッサーは以下の共有 "logs" パイプラインで宣言する
      processors: []
      exporters: [otlpjson]
    logs:
      receivers: [otlp, otlpjson]
      processors: [resourcedetection, batch]
      # 本番デプロイメントでは "debug" を削除する
      exporters: [otlphttp, debug]

exporters:
  debug:
    verbosity: detailed
  # `otlphttp` のような OTLP バックエンドへのエクスポーター
  otlphttp:
```

OTel Collector の Debug エクスポーターの出力を確認して、OTel Collector が収集したログを検証してください。

```log
2024-11-01T10:03:31.074+0530	info	Logs	{"kind": "exporter", "data_type": "logs", "name": "debug", "resource logs": 1, "log records": 1}
2024-11-01T10:03:31.074+0530	info	ResourceLog #0
Resource SchemaURL: https://opentelemetry.io/schemas/1.24.0
Resource attributes:
     -> deployment.environment.name: Str(staging)
     -> service.instance.id: Str(6ad88e10-238c-4fb7-bf97-38df19053366)
     -> service.name: Str(checkout)
     -> service.namespace: Str(shop)
     -> service.version: Str(1.1)
ScopeLogs #0
ScopeLogs SchemaURL:
InstrumentationScope com.mycompany.checkout.CheckoutServiceServer$CheckoutServiceImpl
LogRecord #0
ObservedTimestamp: 2024-11-01 04:24:45.776944 +0000 UTC
Timestamp: 2024-11-01 04:24:45.776869 +0000 UTC
SeverityText: INFO
SeverityNumber: Info(9)
Body: Str(Order order-12035 successfully placed)
Attributes:
     -> customerId: Str(cust-12345)
     -> thread.id: Int(44)
     -> thread.name: Str(grpc-default-executor-1)
Trace ID: 42de1f0dd124e27619a9f3c10bccac1c
Span ID: 270984d03e94bb8b
Flags: 1
     {"kind": "exporter", "data_type": "logs", "name": "debug"}
```

OpenTelemetry バックエンドでログを確認してください。

パイプラインがエンドツーエンドで動作した後、本番環境への準備を行います。

- OTel Collector の設定で `logs` パイプラインから `debug` エクスポーターを削除します。
- ロギングフレームワーク（たとえば `logback.xml`）のファイルおよびコンソールエクスポーターを無効にしますが、ログのフィルタリングにはロギング設定を引き続き使用します。
  OTel Java エージェントが JSON ログを stdout に出力します。

```xml
<!-- logback-classic v1.5.11 でテスト済み -->
<configuration>
  <logger name="com.example" level="debug"/>
  <root level="info">
    <!-- OTel Agent が stdout を通じて otlpjson ログを出力するため、アペンダーは不要 -->
    <!--
      重要: OTel バックエンドでログが見つからない場合の
      トラブルシューティングにはコンソールアペンダーを有効にしてください
    -->
  </root>
</configuration>
```

## コンテナログを処理するための Kubernetes での OpenTelemetry Collector の設定 {#configure-an-opentelemetry-collector-in-kubernetes-to-handle-container-logs}

Kubernetes とコンテナ固有の要件をサポートするために、特別なマッピング設定を必要とせずに、パイプラインにビルトインの [`container`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/ae0d64c4c2131c7a4308417fa9549d984347dadc/pkg/stanza/docs/operators/container.md?from_branch=main) パース手順を追加します。

`<<namespace>>`、`<<pod_name>>`、`<<container_name>>` を目的の値に置き換えるか、`*` のようなより広い [glob パターン](https://pkg.go.dev/v.io/v23/glob) を使用してください。

```yaml
receivers:
  filelog/otlp-json-logs:
    # start_at: beginning # テスト目的の場合は "start_at: beginning" を使用
    include: [/var/log/pods/<<namespace>>_<<pod_name>>_*/<<container_name>>/]
    include_file_path: true
    operators:
      - type: container
        add_metadata_from_filepath: true

  otlp:
    protocols:
      grpc:
      http:

processors:
  batch:
  resourcedetection:
    detectors: ['env', 'system']
    override: false

connectors:
  otlpjson:

service:
  pipelines:
    logs/raw_otlpjson:
      receivers: [filelog/otlp-json-logs]
      # (i) otlpjson コネクターの前にプロセッサーは不要
      # プロセッサーは以下の共有 "logs" パイプラインで宣言する
      processors: []
      exporters: [otlpjson]
    logs:
      receivers: [otlp, otlpjson]
      processors: [resourcedetection, batch]
      # 本番デプロイメントでは "debug" を削除する
      exporters: [otlphttp, debug]

exporters:
  debug:
    verbosity: detailed
  # `otlphttp` のような OTLP バックエンドへのエクスポーター
  otlphttp:
```

## まとめ {#conclusion}

このブログ記事では、OpenTelemetry を使用してファイルベースの Java ログを収集する方法を紹介しました。
このソリューションはセットアップが簡単で、SLF4J/Logback や Log4j2 などのフレームワークのログを、すべてのリソースおよびログ属性を含む OTel 準拠の JSON ログとして stdout に変換するターンキーソリューションを提供します。
この JSON フォーマットは確かに冗長ですが、一般的にパフォーマンスへの影響は最小限であり、トレースやメトリクスと相関可能な高度にコンテキスト化されたログを提供することで、堅実なバランスを実現します。

手順が不明瞭な場合や問題が発生した場合は、最新バージョンに対して継続的に更新およびテストされている [Kubernetes にデプロイされたサンプルアプリケーション](https://github.com/open-telemetry/opentelemetry-java-examples/blob/022fdfb8bdfb95a4e9d424af41441b7188b7d347/logging-k8s-stdout-otlp-json/README.md?from_branch=main) を確認してください。

フィードバックや質問がありましたら、[GitHub](https://github.com/open-telemetry/opentelemetry-specification/pull/4183) または [Slack](/community/#develop-and-contribute)（`#otel-collector`）でお気軽にお問い合わせください。
